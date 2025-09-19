<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Review;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    // Get all reviews for a specific product
    public function index($product_id)
    {
        $reviews = Review::with('user:id,name')->where('product_id', $product_id)->get();
        return response()->json($reviews);
    }
public function show(Request $request)
{
    $request->validate([
      'product_id' => 'required|integer|exists:products,id',
    ]);
    $productId = $request->query('product_id');

    $reviews = Review::with('user:id,name')
                     ->where('product_id', $productId)
                     ->get();

    return response()->json($reviews);
}

    // Add a new review
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'review_text' => 'nullable|string|max:1000',
        ]);

        // Check if the user has already reviewed this product
        $existingReview = Review::where('user_id', Auth::id())
                                ->where('product_id', $request->product_id)
                                ->first();

        if ($existingReview) {
            return response()->json(['message' => 'You have already reviewed this product'], 409);
        }

        Review::create([
            'user_id' => Auth::id(),
            'product_id' => $request->product_id,
            'rating' => $request->rating,
            'review_text' => $request->review_text,
        ]);

        return response()->json([
    'message' => 'Review updated successfully'
]);

    }

    // Update an existing review
    public function update(Request $request, $id)
    {
        $review = Review::where('id', $id)->where('user_id', Auth::id())->first();

        if (!$review) {
            return response()->json(['message' => 'Review not found'], 404);
        }

        $request->validate([
            'rating' => 'integer|min:1|max:5',
            'review_text' => 'nullable|string|max:1000',
        ]);

        $review->update($request->only(['rating', 'review_text']));

        return response()->json([
    'review'  => $review,
    'message' => 'Review updated successfully'
]);

    }

    // Delete a review
    public function destroy($id)
    {
        $review = Review::where('id', $id)->where('user_id', Auth::id())->first();

        if (!$review) {
            return response()->json(['message' => 'Review not found'], 404);
        }

        $review->delete();

        return response()->json(['message' => 'Review deleted successfully']);
    }
}
