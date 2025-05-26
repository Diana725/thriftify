<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use App\Events\OrderStatusUpdated;

class OrderController extends Controller
{
    // ✅ Place an Order
    public function store(Request $request)
    {
        $request->validate([
            'items'             => 'required|array',
            'items.*.product_id'=> 'required|exists:products,id',
            'items.*.quantity'  => 'required|integer|min:1',
            'shipping_address'  => 'nullable|string|max:500',
            'shipping_phone'    => 'nullable|string|max:20',
          ]);
          

        $user = Auth::user();
        $totalAmount = 0;

        // Begin transaction
        DB::beginTransaction();

        try {
            // Create order
            $order = Order::create([
                'user_id'          => $user->id,
                'total_amount'     => 0,
                'order_status'     => 'pending',
                'shipping_address' => $request->input('shipping_address'), // will be null
                'shipping_phone'   => $request->input('shipping_phone'),   // will be null
            ]);
            

            foreach ($request->items as $item) {
                $product = Product::find($item['product_id']);

                if ($product->stock_quantity < $item['quantity']) {
                    throw ValidationException::withMessages([
                        'quantity' => ["Not enough stock for {$product->name}"],
                    ]);
                }

                // Deduct stock
                $product->decrement('stock_quantity', $item['quantity']);

                // Add order item
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $product->price,
                ]);

                $totalAmount += $product->price * $item['quantity'];
            }

            // Update total amount
            $order->update(['total_amount' => $totalAmount]);

            DB::commit();

            return response()->json(['message' => 'Order placed successfully', 'order' => $order], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // ✅ Get orders for authenticated user
    public function userOrders()
    {
        $orders = Auth::user()
            ->orders()
            ->with('orderItems.product')
            ->get();
    
        // Assetify each product image URL
        $orders->each(function($order) {
            $order->orderItems->each(function($item) {
                $item->product->image_url = $item->product->image_url
                    ? asset("storage/{$item->product->image_url}")
                    : null;
            });
        });
    
        return response()->json($orders);
    }
    
    public function show($id)
    {
        $order = Order::with('orderItems.product')
            ->where('user_id', Auth::id())
            ->findOrFail($id);
    
        // Assetify in the same way
        $order->orderItems->each(function($item) {
            $item->product->image_url = $item->product->image_url
                ? asset("storage/{$item->product->image_url}")
                : null;
        });
    
        return response()->json($order);
    }
    public function showForAdmin($id)
    {
        $order = Order::with(['orderItems.product', 'user'])
            ->findOrFail($id);

        // Assetify each product image
        $order->orderItems->each(function ($item) {
            $item->product->image_url = $item->product->image_url
                ? asset("storage/{$item->product->image_url}")
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
    ]);

    $order->update($request->only('shipping_address', 'shipping_phone'));

    return response()->json($order);
}


    // ✅ Admin: Get all orders
    public function index()
    {
        $orders = Order::with('orderItems.product', 'user')->get();
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
}
