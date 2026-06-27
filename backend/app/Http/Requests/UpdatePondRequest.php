<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePondRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'location' => 'nullable|string|max:255',
            'capacity_m3' => 'sometimes|numeric|min:1',
            'status' => 'sometimes|in:active,maintenance,inactive'
        ];
    }
}