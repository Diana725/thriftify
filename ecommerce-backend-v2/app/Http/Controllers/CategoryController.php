<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // Get all categories
    public function index()
    {
        return response()->json(Category::all());
    }

    // Get a single category
    public function show($id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }
        return response()->json($category);
    }
   public function productsByCategory($id)
{
    $category = Category::findOrFail($id);
    $products = Product::with('categories')
        ->whereHas('categories', function ($q) use ($id) {
            $q->where('categories.id', $id);
        })
        ->get();

    $products->transform(function ($product) {
        $product->image_url = url('storage/' . ltrim($product->image_url, '/'));
        return $product;
    });

    return response()->json($products);
}

    
    // Create a new category (Admin only)
    public function store(Request $request)
    {
        $request->validate(['name' => 'required|unique:categories']);

        $category = Category::create($request->only('name'));

        return response()->json($category, 201);
    }

    // Update a category (Admin only)
    public function update(Request $request, $id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $request->validate(['name' => 'required|unique:categories,name,' . $id]);

        $category->update($request->only('name'));

        return response()->json($category);
    }

    // Delete a category (Admin only)
    public function destroy($id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $category->delete();
        return response()->json(['message' => 'Category deleted']);
    }
}
