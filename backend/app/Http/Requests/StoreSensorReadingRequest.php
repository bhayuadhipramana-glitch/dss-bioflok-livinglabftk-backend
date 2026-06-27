<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSensorReadingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pond_id' => 'required|exists:ponds,id',
            'temperature' => 'required|numeric',
            'ph' => 'required|numeric',
            'do' => 'nullable|numeric',
            'nh3' => 'nullable|numeric'
        ];
    }
}