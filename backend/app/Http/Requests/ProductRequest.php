<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/** Utilisée pour la création et la modification d'un produit (l'image est optionnelle). */
class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->isAdmin();
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'description' => ['required', 'string', 'max:5000'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'stock' => ['required', 'integer', 'min:0', 'max:1000000'],
            'image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_image' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'image.file' => "Le téléversement de l'image a échoué (fichier trop volumineux pour la configuration PHP ou transfert interrompu).",
            'image.uploaded' => "Le téléversement de l'image a échoué (fichier trop volumineux pour la configuration PHP ou transfert interrompu).",
            'image.image' => 'Le fichier choisi doit être une image valide.',
            'image.mimes' => 'Formats acceptés : JPG, PNG ou WebP.',
            'image.max' => "L'image ne doit pas dépasser 2 Mo.",
        ];
    }
}
