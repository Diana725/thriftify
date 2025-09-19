<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Lang;

class CustomResetPassword extends Notification
{
    public $token;

    public function __construct($token)
    {
        $this->token = $token;
    }

 public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        // Build a front-end URL if you want SPA flow:
        $resetUrl = url(
            "/password/reset/{$this->token}" 
            . '?email=' . urlencode($notifiable->email)
        );

        return (new MailMessage)
            ->subject('Reset Your Thriftify Password')
            ->greeting("Hello {$notifiable->name},")
            ->line("We received a request to reset your password. Click below to choose a new one:")
            ->action('Reset Password', $resetUrl)
            ->line("If you didn't request this, just ignore this email.")
            ->salutation('Regards, Thriftify Support');
    }
}
