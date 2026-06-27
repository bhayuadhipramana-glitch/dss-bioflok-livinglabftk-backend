<?php

namespace App\Services;

use App\Models\FeedLog;
use Illuminate\Database\Eloquent\Collection;

class FeedLogService
{
    public function getAllFeedLogs(): Collection
    {
        // Mengambil data pakan beserta relasi data kolamnya
        return FeedLog::with('pond')->latest()->get();
    }

    public function createFeedLog(array $data): FeedLog
    {
        return FeedLog::create($data);
    }
}