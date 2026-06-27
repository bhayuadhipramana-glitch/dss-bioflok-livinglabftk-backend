<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SensorReading extends Model
{
    protected $fillable = [
        'pond_id', 'temperature', 'ph', 'do', 'nh3', 
        'temp_interpretation', 'ph_interpretation', 
        'DO_condition', 'NH3_condition', 
        'water_condition', 'correlation_notes'
    ];

    public function pond()
    {
        return $this->belongsTo(Pond::class);
    }
}