<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Order;

class OrderPaid extends Mailable
{
    use Queueable, SerializesModels;

    public $order;

    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    public function build()
    {
        return $this->subject('Your Thriftify Order Has Been Received!')
                    ->markdown('emails.orders.paid')
                    ->with([
                        'order' => $this->order,
                        'user'  => $this->order->user,
                    ]);
    }
}

