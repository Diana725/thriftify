<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Category;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'stock_quantity',
        'image_url',
    ];

    public function category()
{
    return $this->belongsTo(Category::class);
}
public function categories()
{
    return $this->belongsToMany(Category::class, 'product_categories');
}
public function reviews()
{
    return $this->hasMany(Review::class);
}
protected $appends = ['average_rating'];

public function getAverageRatingAttribute()
{
    // returns a float, e.g. 4.2
    return round($this->reviews()->avg('rating') ?: 0, 1);
}
}
