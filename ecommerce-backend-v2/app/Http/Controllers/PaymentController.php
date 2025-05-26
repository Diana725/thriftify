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
    
        $order = Order::findOrFail($request->order_id);
        abort_if($order->user_id !== Auth::id(), 403);
    
        $apiRef = 'ORDER-' . $order->id . '-' . time();
        Payment::create([
            'order_id'       => $order->id,
            'amount'         => $order->total_amount,
            'payment_status' => 'pending',
            'api_ref'        => $apiRef,
        ]);
    
        $baseUrl   = rtrim(env('INTASEND_BASE_URL'), '/');    // https://sandbox.intasend.com/api/v1
        $secretKey = env('INTASEND_SECRET_KEY');
        $publicKey = env('INTASEND_PUBLIC_KEY');
    
        $payload = [
            'public_key'   => $publicKey,
            'currency'     => 'KES',
            'amount'       => $order->total_amount,
            'first_name'   => Auth::user()->name,
            'last_name'    => '',
            'email'        => Auth::user()->email,
            'tx_ref'       => $apiRef,
            'callback_url' => env('INTASEND_CALLBACK_URL'),
            'redirect_url' => env('INTASEND_REDIRECT_URL'),
        ];
    
        // 1) Send the request
        $response = Http::withHeaders([
            'X-IntaSend-Secret-Key'     => $secretKey,
            'X-IntaSend-Public-API-Key' => $publicKey,
            'Content-Type'              => 'application/json',
        ])->post("{$baseUrl}/checkout/", $payload);
    
        // 2) Dump the raw JSON for debugging
        $responseData = $response->json();
        
    
        // 3) Now handle failure or success
        if ($response->failed()) {
            Log::error('IntaSend checkout failed', [
              'url'      => "{$baseUrl}/checkout/",
              'status'   => $response->status(),
              'response' => $response->body(),
            ]);
            return response()->json(['error' => 'Failed to initiate payment'], 500);
        }

        $checkoutUrl = $responseData['url'];
    
        return response()->json([
            'message'      => 'Payment initiated',
            'checkout_url' => $checkoutUrl,
        ]);
    }
    
    
    

    /**
     * Step 2: Handle the IntaSend webhook/callback.
     * IntaSend will POST here when payment completes (or fails).
     */
    public function paymentCallback(Request $request)
    {
        $data = $request->all();
        Log::info('Payment callback', $data);

        if (!isset($data['state'], $data['tx_ref'])) {
            return response()->json(['error' => 'Invalid callback data'], 400);
        }

        // Find the payment record by tx_ref (api_ref)
        $payment = Payment::where('api_ref', $data['tx_ref'])->first();
        if (! $payment) {
            Log::error('Payment record not found for ref', ['tx_ref' => $data['tx_ref']]);
            return response()->json(['error' => 'Unknown transaction'], 404);
        }

        // Update statuses
        $payment->payment_status = strtolower($data['state']);
        $payment->invoice_id     = $data['invoice_id'] ?? null;
        $payment->save();

        if ($data['state'] === 'COMPLETE') {
            // mark order as processing
            $order = $payment->order;
            $order->order_status = 'processing';
            $order->save();

            // send confirmation email
            try {
                Mail::to($order->user->email)
                    ->send(new OrderPaid($order));
            } catch (\Exception $e) {
                Log::error('Failed to send order-paid email', ['error' => $e->getMessage()]);
            }
        }

        return response()->json(['message' => 'Callback processed']);
    }
}
