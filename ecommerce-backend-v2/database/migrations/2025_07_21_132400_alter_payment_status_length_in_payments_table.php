<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::table('payments', function (Blueprint $table) {
        $table->string('payment_status', 50)->change();  // or 100 for extra safety
    });
}

public function down()
{
    Schema::table('payments', function (Blueprint $table) {
        $table->string('payment_status', 10)->change();  // or your original length
    });
}

};
