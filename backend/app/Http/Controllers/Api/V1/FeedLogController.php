<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFeedLogRequest;
use App\Http\Resources\FeedLogResource;
use App\Services\FeedLogService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class FeedLogController extends Controller
{
    use ApiResponseTrait;
    protected FeedLogService $feedLogService;

    public function __construct(FeedLogService $feedLogService)
    {
        $this->feedLogService = $feedLogService;
    }

    public function index(): JsonResponse
    {
        $logs = $this->feedLogService->getAllFeedLogs();
        return $this->successResponse(FeedLogResource::collection($logs), 'Data pakan berhasil diambil');
    }

    public function store(StoreFeedLogRequest $request): JsonResponse
    {
        $log = $this->feedLogService->createFeedLog($request->validated());
        return $this->successResponse(new FeedLogResource($log), 'Catatan pakan berhasil ditambahkan', 201);
    }
}