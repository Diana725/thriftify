<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;

class WishlistController extends Controller
{
    // Get all wishlist items for the authenticated user
    public function index()
{
    $wishlist = Wishlist::with('product.categories')
        ->where('user_id', Auth::id())
        ->get();

    // Convert the stored image path into a full URL
    $wishlist->each(function ($item) {
        $item->product->image_url = $item->product->image_url
            ? asset("storage/{$item->product->image_url}")
            : null;
    });

    return response()->json($wishlist);
}


    // Add a product to wishlist
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $wishlistItem = Wishlist::where('user_id', Auth::id())
                                ->where('product_id', $request->product_id)
                                ->first();

        if ($wishlistItem) {
            return response()->json(['message' => 'Product already in wishlist'], 409);
        }

        Wishlist::create([
            'user_id' => Auth::id(),
            'product_id' => $request->product_id,
        ]);

        return response()->json(['message' => 'Product added to wishlist']);
    }

    // Remove a product from wishlist
    public function destroy($id)
    {
        $wishlistItem = Wishlist::where('user_id', Auth::id())->where('id', $id)->first();

        if (!$wishlistItem) {
            return response()->json(['message' => 'Item not found'], 404);
        }

        $wishlistItem->delete();

        return response()->json(['message' => 'Product removed from wishlist']);
    }
}
