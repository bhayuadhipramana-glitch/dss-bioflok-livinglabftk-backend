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
        Schema::create('sensor_readings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pond_id')->constrained()->cascadeOnDelete();
            
            // Kolom data mentah dari alat sensor
            $table->decimal('temperature', 5, 2);
            $table->decimal('ph', 4, 2);
            $table->decimal('do', 5, 2)->nullable();
            $table->decimal('nh3', 5, 2)->nullable();
            
            // Kolom interpretasi hasil algoritma DSS
            $table->string('temp_interpretation')->nullable();
            $table->string('ph_interpretation')->nullable();
            $table->string('DO_condition')->nullable();
            $table->string('NH3_condition')->nullable();
            $table->string('water_condition')->nullable();
            $table->text('correlation_notes')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sensor_readings');
    }
};