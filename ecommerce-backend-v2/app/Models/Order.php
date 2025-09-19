<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    const STATUS_PENDING    = 'pending';
    const STATUS_PROCESSING = 'processing';
    const STATUS_SHIPPED    = 'shipped';
    const STATUS_DELIVERED  = 'delivered';
    const STATUS_CANCELLED  = 'cancelled';

    protected $fillable = [
        'user_id',
        'total_amount',
        'order_status',
        'shipping_address',
        'shipping_phone',
	'discount_amount',
	'applied_discounts',
	'delivery_fee',
        'reserved_until',
    ];

protected $casts = [
    'applied_discounts' => 'array',
    'reserved_until'    => 'datetime',
];


    // Order belongs to a user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Order has many order items
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

     public function payment()
    {
        return $this->hasOne(Payment::class); 
    }
}
