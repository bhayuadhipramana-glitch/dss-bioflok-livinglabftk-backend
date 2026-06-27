<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSensorReadingRequest;
use App\Http\Resources\SensorReadingResource;
use App\Services\SensorReadingService;
use App\Traits\ApiResponseTrait;
use App\Models\SensorReading;
use Illuminate\Http\JsonResponse;

class SensorReadingController extends Controller
{
    use ApiResponseTrait;
    
    protected SensorReadingService $sensorReadingService;

    public function __construct(SensorReadingService $sensorReadingService)
    {
        $this->sensorReadingService = $sensorReadingService;
    }

    public function index(): JsonResponse
    {
        $readings = $this->sensorReadingService->getAllReadings();
        return $this->successResponse(SensorReadingResource::collection($readings), 'Data log sensor berhasil diambil');
    }

    public function store(StoreSensorReadingRequest $request): JsonResponse
    {
        $reading = $this->sensorReadingService->createReading($request->validated());
        return $this->successResponse(new SensorReadingResource($reading), 'Data sensor berhasil dicatat dan dianalisis oleh DSS', 201);
    }

    public function show(SensorReading $sensor_reading): JsonResponse
    {
        return $this->successResponse(new SensorReadingResource($sensor_reading->load('pond')), 'Detail sensor berhasil diambil');
    }

    public function destroy(SensorReading $sensor_reading): JsonResponse
    {
        $this->sensorReadingService->deleteReading($sensor_reading);
        return $this->successResponse(null, 'Data sensor berhasil dihapus');
    }
}