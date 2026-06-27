<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePondRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Wajib true agar tidak 403 Forbidden
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'capacity_m3' => 'required|numeric|min:1',
            'status' => 'required|in:active,maintenance,inactive'
        ];
    }
}