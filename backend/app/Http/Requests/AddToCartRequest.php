<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddToCartRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'integer', 'exists:products,id,deleted_at,NULL'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
