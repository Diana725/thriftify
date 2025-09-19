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
    $products = Product::with('categories', 'images')->get();

    $products->transform(function ($product) {
        $firstImage = $product->images->first();
        $product->image_url = $firstImage ? asset('storage/' . $firstImage->image_url) : null;
        return $product;
    });

    return response()->json($products);
}

    // Store a new product
    public function store(Request $request)
{
    $request->validate([
        'name'           => 'required|string|max:255',
        'description'    => 'nullable|string',
        'price'          => 'required|numeric',
        'stock_quantity' => 'required|integer|min:0',
        'images'         => 'nullable|array',
        'images.*'       => 'image|mimes:jpeg,png,jpg,gif|max:2048',
        'categories'     => 'required|array',
        'categories.*'   => 'exists:categories,id',
    ]);

    $product = Product::create(
        $request->only('name','description','price','stock_quantity')
    );

    $product->categories()->attach($request->categories);

    if ($request->hasFile('images')) {
        foreach ($request->file('images') as $imageFile) {
            $imagePath = $imageFile->store('images', 'public');

            $product->images()->create([
                'image_url' => $imagePath,
            ]);
        }
    }

    return response()->json(
        $product->load('categories', 'images'),
        201
    );
}


    // Show a single product
   public function show($id)
{
    $product = Product::with('categories', 'images', 'reviews')
                     ->find($id);

    if (!$product) {
        return response()->json(['message' => 'Product not found'], 404);
    }

    // Make all image URLs accessible
    foreach ($product->images as $image) {
        $image->image_url = asset('storage/' . $image->image_url);
    }

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
        'name'           => 'required|string|max:255',
        'description'    => 'nullable|string',
        'price'          => 'required|numeric',
        'stock_quantity' => 'required|integer|min:0',
        'images'         => 'nullable|array',
        'images.*'       => 'image|mimes:jpeg,png,jpg,gif|max:2048',
        'categories'     => 'required|array',
        'categories.*'   => 'exists:categories,id',
    ]);

    // Update product
    $product->update(
        $request->only('name','description','price','stock_quantity')
    );

    $product->categories()->sync($request->categories);

    // Handle new images
    if ($request->hasFile('images')) {
        // Delete old images
        foreach ($product->images as $img) {
            Storage::disk('public')->delete($img->image_url);
            $img->delete();
        }

        // Store new images
        foreach ($request->file('images') as $imageFile) {
            $imagePath = $imageFile->store('images', 'public');
            $product->images()->create([
                'image_url' => $imagePath,
            ]);
        }
    }

    return response()->json($product->load('categories','images'));
}



   

public function relatedProducts($id)
{
    $product = Product::with('categories')->findOrFail($id);

    $related = Product::with('categories', 'images')
        ->whereHas('categories', function ($query) use ($product) {
            $query->whereIn('categories.id', $product->categories->pluck('id'));
        })
        ->where('id', '!=', $product->id)
        ->limit(4)
        ->get();

    $related->transform(function ($item) {
        $firstImage = $item->images->first();
        $item->image_url = $firstImage ? asset('storage/' . $firstImage->image_url) : null;
        return $item;
    });

    return response()->json($related);
}



    // Delete a product
    public function destroy($id)
{
    $product = Product::findOrFail($id);

    // Delete all associated images
    foreach ($product->images as $img) {
        Storage::disk('public')->delete($img->image_url);
        $img->delete();
    }

    $product->delete();

    return response()->json(['message' => 'Product deleted successfully']);
}


    //Mark Product as Trending
   public function trending()
{
    $items = Product::with('images')
        ->where('is_trending', true)
        ->take(10)
        ->get();

    $items->transform(function ($item) {
        $firstImage = $item->images->first();
        $item->image_url = $firstImage ? asset('storage/' . $firstImage->image_url) : null;
        return $item;
    });

    return response()->json($items);
}

public function search(Request $request)
{
    $q = $request->query('q', '');

    $products = Product::with('images')
        ->where('name', 'like', "%{$q}%")
        ->orderBy('name')
        ->limit(10)
        ->get();

    $products->transform(function ($p) {
        $firstImage = $p->images->first();
        $p->image_url = $firstImage ? asset('storage/' . $firstImage->image_url) : null;
        return $p;
    });

    return response()->json($products);
}

}
