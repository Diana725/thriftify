<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;

class ExpirePendingOrders extends Command
{
    protected $signature = 'orders:expire-pending';
    protected $description = 'Cancel pending orders older than 10 min';

    public function handle()
    {
        Order::where('order_status', Order::STATUS_PENDING)
             ->where('reserved_until', '<', now())
             ->update(['order_status' => Order::STATUS_CANCELLED]);
    }
}
