<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
   // View cart items 
public function index()
{
    $cart = Cart::where('user_id', Auth::id())
                ->with('cartItems.product.images')
                ->first();

    if (!$cart) {
        return response()->json(['message' => 'Cart not found'], 404);
    }

    // Set product image_url for each cart item
    $cart->cartItems->each(function ($item) {
        $firstImage = $item->product->images->first();
        $item->product->image_url = $firstImage
            ? asset('storage/' . $firstImage->image_url)
            : null;
    });

    return response()->json($cart);
}



    // Add item to cart
    public function addToCart(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = Cart::firstOrCreate(['user_id' => Auth::id()]);
        
        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($cartItem) {
            $cartItem->increment('quantity', $request->quantity);
        } else {
            $cart->cartItems()->create([
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
            ]);
        }

        return response()->json(['message' => 'Item added to cart']);
    }

    // Update cart item quantity
    // public function updateCartItem(Request $request, $id)
    // {
    //     $request->validate(['quantity' => 'required|integer|min:1']);

    //     $cartItem = CartItem::whereHas('cart', function ($query) {
    //         $query->where('user_id', Auth::id());
    //     })->findOrFail($id);

    //     $cartItem->update(['quantity' => $request->quantity]);

    //     return response()->json(['message' => 'Cart item updated']);
    // }

    // Remove item from cart
    public function removeCartItem($id)
    {
        $cartItem = CartItem::whereHas('cart', function ($query) {
            $query->where('user_id', Auth::id());
        })->findOrFail($id);

        $cartItem->delete();

        return response()->json(['message' => 'Cart item removed']);
    }

    // Clear the entire cart
    public function clearCart()
    {
        $cart = Cart::where('user_id', Auth::id())->first();

        if ($cart) {
            $cart->cartItems()->delete();
        }

        return response()->json(['message' => 'Cart cleared']);
    }

    //update cart quantity
    public function updateCartItem(Request $request, $itemId)
    {
        // 1) validate incoming quantity
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        // 2) fetch only the user’s own CartItem
        $cartItem = CartItem::whereHas('cart', function ($q) {
            $q->where('user_id', Auth::id());
        })->findOrFail($itemId);

        // 3) update and return success
        $cartItem->update(['quantity' => $validated['quantity']]);

        return response()->json([
            'message' => 'Cart item updated',
            'item'    => $cartItem->load('product'),
        ]);
    }
}
