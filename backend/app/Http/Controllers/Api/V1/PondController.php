<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePondRequest;
use App\Http\Requests\UpdatePondRequest;
use App\Http\Resources\PondResource;
use App\Models\Pond;
use App\Services\PondService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class PondController extends Controller
{
    use ApiResponseTrait;
    protected PondService $pondService;

    public function __construct(PondService $pondService)
    {
        $this->pondService = $pondService;
    }

    public function index(): JsonResponse
    {
        $ponds = $this->pondService->getAllPonds();
        return $this->successResponse(PondResource::collection($ponds), 'Data kolam berhasil diambil');
    }

    public function store(StorePondRequest $request): JsonResponse
    {
        $pond = $this->pondService->createPond($request->validated());
        return $this->successResponse(new PondResource($pond), 'Kolam berhasil ditambahkan', 201);
    }

    public function show(Pond $pond): JsonResponse
    {
        return $this->successResponse(new PondResource($pond), 'Detail kolam berhasil diambil');
    }

    public function update(UpdatePondRequest $request, Pond $pond): JsonResponse
    {
        $updatedPond = $this->pondService->updatePond($pond, $request->validated());
        return $this->successResponse(new PondResource($updatedPond), 'Data kolam berhasil diperbarui');
    }

    public function destroy(Pond $pond): JsonResponse
    {
        $this->pondService->deletePond($pond);
        return $this->successResponse(null, 'Kolam berhasil dihapus');
    }
}