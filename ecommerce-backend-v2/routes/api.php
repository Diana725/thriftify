<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\GoogleAuthController;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Support\Facades\Password;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


//PUBLIC ROUTES
// Products
Route::get('/products/search', [ProductController::class, 'search']);
Route::get('/products/trending', [ProductController::class, 'trending']);//mark as trending
Route::get('/products', [ProductController::class, 'index']); 
Route::get('/products/{id}', [ProductController::class, 'show']); 
Route::post('/products', [ProductController::class, 'store']);

// Categories
Route::get('/categories', [CategoryController::class, 'index']); 
Route::get('/categories/{id}', [CategoryController::class, 'show']); 
Route::get('/categories/{id}/products', [CategoryController::class, 'productsByCategory']);

//Payment Callback
Route::post('/payments/callback', [PaymentController::class, 'paymentCallback']);

//google login
Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'handleGoogleCallback']);
Route::post('/auth/google/token-login', [GoogleAuthController::class, 'loginWithGoogleToken']);

// Reviews
Route::get('/products/{product_id}/reviews', [ReviewController::class, 'index']);

//related products
Route::get('/products/{id}/related', [ProductController::class, 'relatedProducts']);

//user mngt
Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [UserController::class, 'logout']);
Route::post('/subscribe', [NewsletterController::class, 'subscribe']);
Route::post('/forgot-password', function (Request $request) {
    $request->validate(['email' => 'required|email']);
    
    $status = Password::sendResetLink($request->only('email'));

    return $status === Password::RESET_LINK_SENT
        ? response()->json(['message' => 'Password reset link sent!'])
        : response()->json(['message' => 'Unable to send reset link'], 400);
})->middleware('throttle:6,1');

Route::get('/email/verify/{id}/{hash}', function (Request $request, $id, $hash) {
    $user = User::findOrFail($id);

    if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
        abort(403, 'Invalid verification link');
    }

    if (!$user->hasVerifiedEmail()) {
        $user->markEmailAsVerified();
        event(new Verified($user));
    }

    return redirect('https://www.thriftify.website/login');
})->middleware(['signed'])->name('verification.verify');

Route::post('/email/verification-notification', function (Request $request) {
    $data = $request->validate([
        'email' => ['required','email'],
    ]);
    $user = User::where('email', $data['email'])->first();
    if ($user && ! $user->hasVerifiedEmail()) {
        $user->sendEmailVerificationNotification();
    }
    return response()->json([
        'message' => 'If that email is in our system and not yet verified, we’ve sent a new link.'
    ]);
})
->middleware('throttle:6,1');
Route::post('/reset-password', function (Request $request) {
    $request->validate([
        'token'                 => 'required|string',
        'email'                 => 'required|email',
        'password'              => 'required|string|min:8|confirmed',
    ]);

    $status = Password::reset(
        $request->only('email', 'password', 'password_confirmation', 'token'),
        function ($user, $password) {
            $user->forceFill([
                'password'       => bcrypt($password),
                'remember_token' => Str::random(60),
            ])->save();
        }
    );

    return $status === Password::PASSWORD_RESET
        ? response()->json(['message' => 'Password reset successfully'])
        : response()->json(['message' => 'Failed to reset password'], 400);
})

->middleware('throttle:6,1');


//USER ROUTES
Route::middleware('auth:sanctum')->group(function () {

    //User Management
     Route::get   ('/user',   [UserController::class, 'show']);
    Route::put   ('/user',   [UserController::class, 'update']);
    Route::delete('/user',   [UserController::class, 'destroy']);
   
    
    // Carts
    Route::get('/cart', [CartController::class, 'index']); // View cart
    Route::post('/cart/add', [CartController::class, 'addToCart']); // Add item
    Route::put('/cart/update/{id}', [CartController::class, 'updateCartItem']); // Update item
    Route::delete('/cart/remove/{id}', [CartController::class, 'removeCartItem']); // Remove item
    Route::delete('/cart/clear', [CartController::class, 'clearCart']); // Clear cart
    Route::patch('cart/{itemId}', [CartController::class, 'updateCartItem']);//quantity control

    // Wishlist
    Route::get('/wishlist', [WishlistController::class, 'index']); // View wishlist
    Route::post('/wishlist', [WishlistController::class, 'store']); // Add to wishlist
    Route::delete('/wishlist/{id}', [WishlistController::class, 'destroy']); // Remove from wishlist

    // Orders (User Side)
    Route::post('/orders', [OrderController::class, 'store']); // Place an order
    Route::get('/orders', [OrderController::class, 'userOrders']); // Get user's orders
    Route::get('/orders/{id}', [OrderController::class, 'show']); //Return a single order
Route::patch('/orders/{id}', [OrderController::class, 'update']); //update shipping details
Route::post('/orders/{order}/request-cancel', [OrderController::class, 'requestCancel']);
Route::post('orders/{order}/resume', [OrderController::class, 'resume']);

    // Payments
    Route::post('/payments/initiate', [PaymentController::class, 'createPayment']); // Start payment


     // Reviews
     Route::get('/reviews', [ReviewController::class, 'show']);
    Route::post('/reviews', [ReviewController::class, 'store']); // Add a review
    Route::put('/reviews/{id}', [ReviewController::class, 'update']); // Update review
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']); // Delete review
});

// Admin Routes (admin middleware)
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    // Product Management
    Route::post('/products', [ProductController::class, 'store']); // Create product
    Route::put('/products/{id}', [ProductController::class, 'update']); // Update product
    Route::delete('/products/{id}', [ProductController::class, 'destroy']); // Delete product



    // Category Management
    Route::post('/categories', [CategoryController::class, 'store']); // Create category
    Route::put('/categories/{id}', [CategoryController::class, 'update']); // Update category
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']); // Delete category

    // Orders (Admin Side)
    Route::get('/admin/orders', [OrderController::class, 'index']); // Get all orders
    Route::put('/admin/orders/{id}', [OrderController::class, 'updateStatus']); // Update order status
    Route::get('/admin/orders/{id}', [OrderController::class, 'showForAdmin']);// fetch single order for admin

});
