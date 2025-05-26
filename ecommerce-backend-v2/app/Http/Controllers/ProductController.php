<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    // Fetch all products
    public function index()
{
    $products = Product::with('categories')->get();

    foreach ($products as $product) {
        $product->image_url = $product->image_url ? asset("storage/{$product->image_url}") : null;
    }

    return response()->json($products);
}

    

    // Store a new product
    public function store(Request $request)
{
    // Validate incoming data
    $request->validate([
        'name'           => 'required|string|max:255',
        'description'    => 'nullable|string',
        'price'          => 'required|numeric',
        'stock_quantity' => 'required|integer|min:0',
        'image'          => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        'categories'     => 'required|array',
        'categories.*'   => 'exists:categories,id',
    ]);

    // Handle image upload
    $imagePath = null;
    if ($request->hasFile('image')) {
        $imagePath = $request->file('image')
                             ->store('images', 'public');
    }

    // Create the product
    $product = Product::create([
        'name'           => $request->name,
        'description'    => $request->description,
        'price'          => $request->price,
        'stock_quantity' => $request->stock_quantity,
        'image_url'      => $imagePath,
    ]);

    // Attach categories
    $product->categories()->attach($request->categories);

    // Return the newly created product with its categories
    return response()->json(
        $product->load('categories'),
        201
    );
}

    

    // Show a single product
   public function show($id)
{
    $product = Product::with('categories')
                     ->with('reviews')       // eager-load if you need count
                     ->find($id);

    if (!$product) {
      return response()->json(['message'=>'Product not found'],404);
    }

    $product->image_url = $product->image_url
        ? asset("storage/{$product->image_url}")
        : null;

    // now $product->average_rating is available
    return response()->json($product);
}

    

    // Update a product
    public function update(Request $request, $id)
{
    $product = Product::find($id);
    if (!$product) {
        return response()->json(['message' => 'Product not found'], 404);
    }

    $request->validate([
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'price' => 'required|numeric',
        'stock_quantity' => 'required|integer|min:0',
        'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        'categories' => 'required|array',
        'categories.*' => 'exists:categories,id'
    ]);

    if ($request->hasFile('image')) {
        // Delete old image
        if ($product->image_url) {
            Storage::disk('public')->delete($product->image_url);
        }

        // Upload new image
        $imagePath = $request->file('image')->store('images', 'public');
        $product->image_url = $imagePath;
    }

    $product->update($request->only(['name', 'description', 'price', 'stock_quantity']));

    // Sync categories
    $product->categories()->sync($request->categories);

    return response()->json($product->load('categories'));
}

public function relatedProducts($id)
{
    // Find the current product (or 404)
    $product = Product::with('categories')->findOrFail($id);

    // Fetch up to 4 other products sharing any of the same categories
    $related = Product::with('categories')
        ->whereHas('categories', function ($query) use ($product) {
            $query->whereIn('categories.id', $product->categories->pluck('id'));
        })
        ->where('id', '!=', $product->id)
        ->limit(4)
        ->get();

    // Convert each image_url path into a full URL
    $related->transform(function ($item) {
        $item->image_url = $item->image_url
            ? asset("storage/{$item->image_url}")
            : null;
        return $item;
    });

    return response()->json($related);
}




    // Delete a product
    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        // Delete associated image
        if ($product->image_url) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $product->image_url));
        }

        $product->delete();
        return response()->json(['message' => 'Product deleted successfully']);
    }

    //Mark Product as Trending
   public function trending()
{
    // ensures you always get a Collection (array) back
    $items = Product::where('is_trending', true)
                    ->take(10)
                    ->get();

    return response()->json($items);
}
public function search(Request $request)
{
    $q = $request->query('q', '');

    $products = Product::where('name', 'like', "%{$q}%")
        ->orderBy('name')
        ->limit(10)
        ->get();

    // Turn each image_url into a full URL
    $products->transform(function($p) {
        $p->image_url = $p->image_url
            ? asset("storage/{$p->image_url}")
            : null;
        return $p;
    });

    return response()->json($products);
}

}