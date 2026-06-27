<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\PondController;
use App\Http\Controllers\Api\V1\FeedLogController;
use App\Http\Controllers\Api\V1\SensorReadingController;

Route::prefix('v1')->group(function () {
    
    
    // PUBLIC ROUTES (Tidak butuh token)
   
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

   
    // PROTECTED ROUTES (Wajib token Sanctum)
 
    Route::middleware('auth:sanctum')->group(function () {
        
        // Endpoint Auth
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);

        // CRUD Kolam (Pond)
        Route::apiResource('ponds', PondController::class);

        // CRUD Catatan Pakan (FeedLog) - Sesuai Kesepakatan: Index & Store
        Route::apiResource('feed-logs', FeedLogController::class)->only(['index', 'store']);

        // CRUD Data Sensor (SensorReading) - Immutable: Tanpa Update
        Route::apiResource('sensor-readings', SensorReadingController::class)->only(['index', 'store', 'show', 'destroy']);
        
    });
});