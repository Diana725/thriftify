<?php

namespace App\Http\Controllers;

use Laravel\Socialite\Facades\Socialite;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;

class GoogleAuthController extends Controller
{
    // Step 1: Redirect user to Google
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    // Step 2: Handle callback from Google
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            // Find or create the user
            $user = User::updateOrCreate([
                'email' => $googleUser->getEmail(),
            ], [
                'name' => $googleUser->getName(),
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                // You can set a default password or random hash
                'password' => Hash::make(Str::random(24)),
            ]);

            // Create a Sanctum token for the frontend
            $token = $user->createToken('auth_token')->plainTextToken;

            // Return user and token as JSON
            return response()->json([
                'user' => $user,
                'token' => $token,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Authentication failed',
                'message' => $e->getMessage()
            ], 401);
        }
    }
public function loginWithGoogleToken(Request $request)
{
    $request->validate([
        'token' => 'required|string',
    ]);

    // Verify token with Google
    $response = Http::get('https://oauth2.googleapis.com/tokeninfo', [
        'id_token' => $request->token,
    ]);

    if (!$response->ok()) {
        return response()->json(['error' => 'Invalid Google token'], 401);
    }

    $googleData = $response->json();

    // Proceed as before
    $user = User::updateOrCreate([
        'email' => $googleData['email'],
    ], [
        'name' => $googleData['name'],
        'google_id' => $googleData['sub'],
        'avatar' => $googleData['picture'],
        'password' => Hash::make(Str::random(24)),
    ]);

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'user' => $user,
        'token' => $token,
    ]);
}
}

