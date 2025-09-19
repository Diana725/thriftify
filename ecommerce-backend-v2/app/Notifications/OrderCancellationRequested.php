<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class OrderCancellationRequested extends Notification
{
    protected $order;
    protected $user;

    public function __construct($order, $user)
    {
        $this->order = $order;
        $this->user = $user;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject("Cancellation Request for Order #{$this->order->id}")
            ->greeting("Hello Admin,")
            ->line("The user {$this->user->name} (email: {$this->user->email}) has requested to cancel Order #{$this->order->id}.")
            ->line("Order status: {$this->order->order_status}")
            ->line("Order date: {$this->order->created_at->format('Y-m-d H:i')}")
            ->action('View Order in Admin Panel', url("/admin/orders/{$this->order->id}"))
            ->line('Please review and update the order status accordingly.')
            ->salutation('Regards, Thriftify System');
    }
}

