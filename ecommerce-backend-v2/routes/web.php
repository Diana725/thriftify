<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/password/reset/{token}', function (Request $request, $token) {
    $url = sprintf(
        'http://localhost:3000/reset-password?token=%s&email=%s',
        $token,
        urlencode($request->query('email'))
    );

    return redirect()->away($url);
})
->name('password.reset');
