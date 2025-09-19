<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Discount;

class DiscountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */

public function run()
{
    Discount::create([
        'code' => null,
        'type' => 'free_shipping',
        'value' => 50,
        'scope' => 'min_order_value',
        'min_order_value' => 1000,
        'active' => true,
    ]);

    Discount::create([
        'code' => 'WELCOME10',
        'type' => 'percentage',
        'value' => 10,
        'scope' => 'first_order',
        'active' => true,
    ]);

    Discount::create([
        'code' => null,
        'type' => 'fixed',
        'value' => 50,
        'scope' => 'min_cart_items',
        'min_cart_items' => 3,
        'active' => true,
    ]);
}

}
