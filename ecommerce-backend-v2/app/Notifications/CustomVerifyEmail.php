<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as BaseVerify;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Lang;

class CustomVerifyEmail extends BaseVerify
{
    public function toMail($notifiable)
    {
        // this builds the signed URL for you
        $verificationUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Welcome to Thriftify! Please Verify Your Email')
            ->greeting("Hi {$notifiable->name},")
            ->line("Thanks for registering on Thriftify. Before we get started, please verify your email address by clicking the button below.")
            ->action('Verify My Email', $verificationUrl)
            ->line("If you didn't create an account, you can safely ignore this email.")
            ->salutation('Regards, The Thriftify Team');
    }
}
