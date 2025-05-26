<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class OrderStatusUpdated implements ShouldBroadcastNow
{
    use InteractsWithSockets, SerializesModels;

    public $order;

    public function __construct(Order $order)
    {
        $this->order = $order;
    }

   public function broadcastOn()
{
    return new PrivateChannel('orders.' . $this->order->user_id);
}

    public function broadcastWith()
    {
        return [
            'id' => $this->order->id,
            'status' => $this->order->order_status,
            'updated_at' => $this->order->updated_at->toDateTimeString(),
        ];
    }

    public function broadcastAs()
    {
        return 'order.status.updated';
    }
}
