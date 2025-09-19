<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderPaid;        // assume you have an email mailable
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class PaymentController extends Controller
{
    /**
     * Step 1: Initiate a payment for an order.
     */
 	public function createPayment(Request $request)
{
    $request->validate(['order_id' => 'required|exists:orders,id']);

     $order = Order::where('user_id', Auth::id())
                  ->where('id', $request->order_id)
                  ->where('order_status', Order::STATUS_PENDING)
                  ->firstOrFail();

    $order->update(['reserved_until' => now()->addMinutes(10)]);

    $apiRef = 'ORDER-' . $order->id . '-' . time();

    $baseUrl     = rtrim(config('services.intasend.base_url', 'https://sandbox.intasend.com/api/v1'), '/');
    $secretKey   = config('services.intasend.secret_key');
    $publicKey   = config('services.intasend.public_key');
    $callbackUrl = config('services.intasend.callback_url');
    $redirectUrl = config('services.intasend.redirect_url');

    $payload = [
        'public_key'   => $publicKey,
        'currency'     => 'KES',
        'amount'       => $order->total_amount,
        'first_name'   => Auth::user()->name,
        'last_name'    => '',
        'email'        => Auth::user()->email,
        'api_ref'       => $apiRef,
        'callback_url' => $callbackUrl,
        'redirect_url' => $redirectUrl,
    ];

    $response = Http::withHeaders([
        'X-IntaSend-Secret-Key'     => $secretKey,
        'X-IntaSend-Public-API-Key' => $publicKey,
        'Content-Type'              => 'application/json',
    ])->post("$baseUrl/checkout/", $payload);

    $status = $response->status();
    $responseData = $response->json();

    Log::info('📦 IntaSend Checkout Response', [
        'status'  => $status,
        'body'    => $response->body(),
        'payload' => $payload,
    ]);

    if (!in_array($status, [200, 201])) {
        Log::error('❌ IntaSend checkout failed', [
            'url'      => "$baseUrl/checkout/",
            'status'   => $status,
            'response' => $response->body(),
        ]);

        return response()->json(['error' => 'Failed to initiate payment'], 500);
    }

    // Save the payment record
    Payment::create([
        'order_id'       => $order->id,
        'amount'         => $order->total_amount,
        'payment_status' => 'pending',
        'api_ref'        => $apiRef,
        'invoice_id'     => $responseData['invoice_id'] ?? null,
    ]);

    return response()->json([
        'message'      => 'Payment initiated',
        'checkout_url' => $responseData['url'] ?? '',
    ], 201);
}





    /**
     * Step 2: Handle the IntaSend webhook/callback.
     * IntaSend will POST here when payment completes (or fails).
     */
     public function paymentCallback(Request $request)
{
    $data = $request->all();
    Log::info('🎯 Webhook hit', ['data' => $data]);

    $apiRef = $data['api_ref'] ?? null;
    $invoiceId = $data['invoice_id'] ?? null;
    $state     = strtoupper($data['state'] ?? '');

    if (empty($apiRef)) {
    return response()->json(['error' => 'Missing api_ref'], 400);
}


    // Try tx_ref first, fall back to invoice_id
    $payment = null;

    if (!empty($apiRef)) {
        $payment = Payment::where('api_ref', $apiRef)->first();
    }

    if (!$payment && !empty($invoiceId)) {
        $payment = Payment::where('invoice_id', $invoiceId)->first();
    }

    if (!$payment) {
        Log::warning('⚠️ Payment record not found', [
            'tx_ref'     => $txRef,
            'invoice_id' => $invoiceId,
        ]);
        return response()->json(['error' => 'Payment record not found'], 404);
    }

    // Update payment status
    $payment->payment_status = strtolower($state);
    if (!empty($invoiceId)) {
        $payment->invoice_id = $invoiceId;
    }
    $payment->save();

    // Update order + stock if payment is complete
    if ($state === 'COMPLETE') {
        $order = $payment->order;

	 $order->update([
        'order_status'   => Order::STATUS_PROCESSING,
        'reserved_until' => null,
    ]);

        if ($order) {
            foreach ($order->orderItems as $item) {
                $product = $item->product;
                if ($product && $product->stock_quantity >= $item->quantity) {
                    $product->decrement('stock_quantity', $item->quantity);
                }
            }

            $order->save();

            try {
                Mail::to($order->user->email)->send(new \App\Mail\OrderPaid($order));
            } catch (\Exception $e) {
                Log::warning('📧 OrderPaid email failed', ['error' => $e->getMessage()]);
            }
        }
    }

    return response()->json(['message' => 'Callback processed']);
}

}
