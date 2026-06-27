<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pond extends Model
{
    protected $fillable = ['name', 'location', 'capacity_m3', 'status'];

    public function sensorReadings()
    {
        return $this->hasMany(SensorReading::class);
    }

    public function feedLogs()
    {
        return $this->hasMany(FeedLog::class);
    }
}