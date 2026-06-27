<?php

namespace App\Services;

use App\Models\Pond;
use Illuminate\Database\Eloquent\Collection;

class PondService
{
    public function getAllPonds(): Collection
    {
        return Pond::latest()->get();
    }

    public function createPond(array $data): Pond
    {
        return Pond::create($data);
    }

    public function getPondById(int $id): Pond
    {
        return Pond::findOrFail($id);
    }

    public function updatePond(Pond $pond, array $data): Pond
    {
        $pond->update($data);
        return $pond;
    }

    public function deletePond(Pond $pond): void
    {
        $pond->delete();
    }
}