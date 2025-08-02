<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiscountUserLog extends Model
{
    protected $fillable = [
        'user_id',
        'discount_id',
    ];
}

