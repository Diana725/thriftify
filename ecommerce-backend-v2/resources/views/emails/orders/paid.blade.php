@component('mail::message')
# Hello {{ $user->name }},

Thank you for your order!

**Order ID:** #{{ $order->id }}  
**Total:** KES {{ number_format($order->total_amount, 2) }}  
**Order Status:** {{ ucfirst($order->order_status) }}

@component('mail::button', ['url' => url('/orders/' . $order->id)])
View Your Order
@endcomponent

We'll begin processing your items shortly.

Thanks for shopping with Thriftify!  
@endcomponent

