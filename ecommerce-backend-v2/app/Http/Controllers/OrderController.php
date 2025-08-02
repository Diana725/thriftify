<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Discount;
use App\Models\DiscountUserLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use App\Events\OrderStatusUpdated;
use App\Notifications\OrderCancellationRequested;
use Illuminate\Support\Facades\Notification;

class OrderController extends Controller
{
    // ✅ Place an Order
    public function store(Request $request)
{
    $request->validate([
        'items'              => 'required|array',
        'items.*.product_id' => 'required|exists:products,id',
        'items.*.quantity'   => 'required|integer|min:1',
        'shipping_address'   => 'nullable|string|max:500',
        'shipping_phone'     => 'nullable|string|max:20',
    ]);

    $user = Auth::user();
    $subtotal = 0;
    $totalItems = 0;
    $appliedDiscounts = [];
    $discountAmount = 0;
    $deliveryFee = 0;
    $shippingAddress = $request->input('shipping_address');

    $isFirstOrder = $user->orders()->count() === 0;

    DB::beginTransaction();

    try {
        // ✅ Step 1: Create the order

$totalAmount = max(0, $subtotal - $discountAmount + $deliveryFee);

        $order = Order::create([
    'user_id'          => $user->id,
    'total_amount'     => $totalAmount,
    'order_status'     => Order::STATUS_PENDING,
    'shipping_address' => $shippingAddress,
    'shipping_phone'   => $request->shipping_phone,
    'discount_amount'  => $discountAmount,
    'applied_discounts'=> $appliedDiscounts,
    'delivery_fee'     => $deliveryFee,
    'reserved_until'   => now()->addMinutes(10),   // 5-min reservation
]);

        // ✅ Step 2: Attach items and calculate subtotal
        foreach ($request->items as $item) {
            $product = Product::find($item['product_id']);

            // ✅ Just check, don't update quantity yet
            if ($product->stock_quantity < $item['quantity']) {
                throw ValidationException::withMessages([
                    'quantity' => ["Not enough stock for {$product->name}"],
                ]);
            }

            // Do NOT decrement here — delay to paymentCallback()

            OrderItem::create([
                'order_id'   => $order->id,
                'product_id' => $product->id,
                'quantity'   => $item['quantity'],
                'price'      => $product->price,
            ]);

            $subtotal += $product->price * $item['quantity'];
            $totalItems += $item['quantity'];
        }

        // ✅ Step 3: Apply Discounts
        $discounts = Discount::where('active', true)->get();

        // 3.1 Bulk
        $bulkDiscount = $discounts->firstWhere('scope', 'min_cart_items');
        if ($bulkDiscount && $totalItems >= $bulkDiscount->min_cart_items) {
            $discountAmount += $bulkDiscount->value;
            $appliedDiscounts[] = "Bulk Discount - Ksh {$bulkDiscount->value} off";
        }

        // 3.2 First Order
        $firstOrderDiscount = $discounts->firstWhere('scope', 'first_order');
        $hasUsedWelcome10 = DiscountUserLog::where('user_id', $user->id)
            ->where('discount_id', optional($firstOrderDiscount)->id)
            ->exists();

        if ($firstOrderDiscount && $isFirstOrder && !$hasUsedWelcome10) {
            $percent = $firstOrderDiscount->value;
            $amount = ($percent / 100) * $subtotal;
            $discountAmount += $amount;
            $appliedDiscounts[] = "WELCOME10 - {$percent}% Off First Order";

            DiscountUserLog::firstOrCreate([
                'user_id'     => $user->id,
                'discount_id' => $firstOrderDiscount->id,
            ]);
        }

        // ✅ Step 4: Delivery Fee
        if ($shippingAddress === 'CBD Delivery') {
            $freeDelivery = $discounts->firstWhere('scope', 'min_order_value');
            if ($freeDelivery && $subtotal >= $freeDelivery->min_order_value) {
                $deliveryFee = 0;
                $appliedDiscounts[] = "Free CBD Delivery - Orders above Ksh 1000";
            } else {
                $deliveryFee = 50;
            }
        }

        // ✅ Step 5: Final total
        $totalAmount = max(0, $subtotal - $discountAmount + $deliveryFee);

        // ✅ Step 6: Update order
        $order->update([
            'total_amount'      => $totalAmount,
            'discount_amount'   => $discountAmount,
            'applied_discounts' => $appliedDiscounts,
            'delivery_fee'      => $deliveryFee,
        ]);

        DB::commit();

        return response()->json([
            'message' => 'Order placed successfully',
            'order'   => $order
        ], 201);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json(['error' => $e->getMessage()], 500);
    }
}



   // ✅ Get orders for authenticated user
    public function userOrders()
{
    $orders = Auth::user()->orders()->with('orderItems.product.images')->get();

    $orders->each(function ($order) {
        $order->orderItems->each(function ($item) {
            $firstImage = $item->product->images->first();
            $item->product->image_url = $firstImage
                ? asset('storage/' . $firstImage->image_url)
                : null;
        });
    });

    return response()->json($orders);
}

    
   public function show($id)
{
    $order = Order::with('orderItems.product.images')
        ->where('user_id', Auth::id())
        ->findOrFail($id);

    // Attach full images list and also set image_url as first image
    $order->orderItems->each(function ($item) {
        // Map all images to full asset path
        $item->product->images->transform(function ($img) {
            $img->image_url = asset('storage/' . $img->image_url);
            return $img;
        });

        // And also set image_url to first image for convenience
        $firstImage = $item->product->images->first();
        $item->product->image_url = $firstImage ? $firstImage->image_url : null;
    });

    return response()->json($order);
}

public function resume(Request $request, Order $order)
{
    abort_unless($order->user_id === Auth::id(), 403);
    abort_unless($order->order_status === Order::STATUS_PENDING, 422);

    // extend reservation
    $order->update(['reserved_until' => now()->addMinutes(10)]);

    // reuse createPayment flow
    return $this->createPayment(
        $request->merge(['order_id' => $order->id])
    );
}

    public function showForAdmin($id)
{
    $order = Order::with(['orderItems.product.images', 'user'])->findOrFail($id);

    $order->orderItems->each(function ($item) {
        $firstImage = $item->product->images->first();
        $item->product->image_url = $firstImage
            ? asset('storage/' . $firstImage->image_url)
            : null;
    });

    return response()->json($order);
}

    
public function update(Request $request, $id)
{
    $order = Auth::user()->orders()->findOrFail($id);
    $request->validate([
      'shipping_address' => 'nullable|string|max:500',
      'shipping_phone'   => 'nullable|string|max:20',
	'discount_code'    => 'nullable|string',
    ]);

    $order->update($request->only('shipping_address', 'shipping_phone'));

    return response()->json($order);
}


    // ✅ Admin: Get all orders
    public function index()
{
    $orders = Order::with('orderItems.product.images', 'user')->get();

    $orders->each(function ($order) {
        $order->orderItems->each(function ($item) {
            $firstImage = $item->product->images->first();
            $item->product->image_url = $firstImage
                ? asset('storage/' . $firstImage->image_url)
                : null;
        });
    });

    return response()->json($orders);
}


    // ✅ Admin: Update order status
   public function updateStatus(Request $request, $id)
{
    $request->validate([
        'order_status' => 'required|in:pending,processing,shipped,delivered,cancelled',
    ]);

    $order = Order::findOrFail($id);
    $order->update(['order_status' => $request->order_status]);

    // Broadcast to other clients
    broadcast(new OrderStatusUpdated($order))->toOthers();

    return response()->json([
        'message' => 'Order status updated successfully',
        'order' => $order,
    ]);
}
public function requestCancel($id)
{
    $user = Auth::user();
    $order = $user->orders()->findOrFail($id);

    if (!in_array($order->order_status, ['pending', 'processing'])) {
        return response()->json([
            'message' => 'You can only request cancellation for pending or processing orders.'
        ], 422);
    }

    // Send email to admin
    Notification::route('mail', 'thriftify999@gmail.com')
        ->notify(new OrderCancellationRequested($order, $user));

    return response()->json([
        'message' => 'Cancellation request received. We will update you shortly.'
    ]);
}

}
