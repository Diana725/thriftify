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
            // allow NULLs (and remove any NOT NULL default requirement)
            $table->string('payment_method')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('payments', function (Blueprint $table) {
            // revert back to NOT NULL if you want
            $table->string('payment_method')->nullable(false)->change();
        });
    }

};
