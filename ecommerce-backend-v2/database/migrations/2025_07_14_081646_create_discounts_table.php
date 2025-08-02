<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('discounts', function (Blueprint $table) {
    $table->id();
    $table->string('code')->nullable(); // e.g., WELCOME10 (nullable for auto discounts)
    $table->enum('type', ['percentage', 'fixed', 'free_shipping']);
    $table->decimal('value', 8, 2)->default(0); // e.g., 10.00 for 10%, 50.00 for Ksh 50 off
    $table->enum('scope', ['first_order', 'min_order_value', 'min_cart_items'])->nullable();
    $table->unsignedInteger('min_cart_items')->nullable(); // used for 3+ items
    $table->decimal('min_order_value', 8, 2)->nullable(); // used for 1000 Ksh check
    $table->boolean('active')->default(true);
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('discounts');
    }
};
