<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFeedLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pond_id' => 'required|exists:ponds,id',
            'feed_type' => 'required|string|max:100',
            'amount_gram' => 'required|numeric|min:1',
            'notes' => 'nullable|string'
        ];
    }
}