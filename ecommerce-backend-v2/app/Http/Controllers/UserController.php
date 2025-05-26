<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use App\Models\User;

class UserController extends Controller
{
    // Register a new user
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'User registered successfully'], 201);
    }

    // Login user and return token
    // Login user and return token
public function login(Request $request)
{
    $credentials = $request->validate([
        'email' => 'required|email',
        'password' => 'required'
    ]);

    if (!Auth::attempt($credentials)) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    $user = Auth::user(); // 🛑 Sometimes this returns null
    $user = User::where('email', $request->email)->first(); // ✅ Ensure user is retrieved

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json(['token' => $token, 'user' => $user]);
}


    // Logout user
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    // Password Reset Request
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        Password::sendResetLink($request->only('email'));
        return response()->json(['message' => 'Password reset link sent']);
    }

    // Reset Password
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->save();
            }
        );

        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => 'Password reset successful'])
            : response()->json(['message' => 'Invalid token'], 400);
    }

    // Verify Email
    public function verifyEmail(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified']);
        }

        $request->user()->markEmailAsVerified();
        return response()->json(['message' => 'Email verified successfully']);
    }
    
     /** 
     * GET /api/user 
     * Return the authenticated user’s details 
     */
    public function show(Request $request)
    {
        return response()->json($request->user());
    }

     /**
     * PUT /api/user
     * Update name/email (and optionally password)
     */
    public function update(Request $request)
{
    $user = $request->user();

    $data = $request->validate([
        'name'  => 'sometimes|required|string|max:255',
        'email' => [
            'sometimes','required','email','max:255',
            Rule::unique('users')->ignore($user->id),
        ],

        // only run these if password non-empty
        'current_password' => ['nullable','required_with:password','current_password'],
        'password'         => ['nullable','string','min:8','confirmed', PasswordRule::defaults()],
    ]);

    // if they actually put in a new password, hash it
    if (!empty($data['password'])) {
        $data['password'] = Hash::make($data['password']);
    } else {
        // if blank or missing, don’t touch password
        unset($data['password'], $data['current_password']);
    }

    $user->update($data);

    return response()->json([
        'message' => 'Profile updated successfully',
        'user'    => $user,
    ]);
}
    /**
     * DELETE /api/user
     * Delete the authenticated user’s account (and their tokens)
     */
    public function destroy(Request $request)
    {
        $user = $request->user();

        // Revoke all tokens so they’re logged out everywhere
        $user->tokens()->delete();

        // Delete the user
        $user->delete();

        return response()->json(['message' => 'Account deleted'], 200);
    }
}
