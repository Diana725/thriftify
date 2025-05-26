<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Http\Middleware\HandleCors;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web:      __DIR__.'/../routes/web.php',
        api:      __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php', // ✅ Make sure this is here!
        health:   '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Register aliases
        $middleware->alias([
            'admin' => AdminMiddleware::class,
            'cors' => HandleCors::class,
        ]);

        // ✅ Apply HandleCors to web + api groups
        $middleware->prependToGroup('web', HandleCors::class);
        $middleware->prependToGroup('api', HandleCors::class);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->create();
