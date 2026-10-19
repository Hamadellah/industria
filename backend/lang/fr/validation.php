<?php

return [
    'accepted' => 'Le champ :attribute doit être accepté.',
    'array' => 'Le champ :attribute doit être un tableau.',
    'boolean' => 'Le champ :attribute doit être vrai ou faux.',
    'confirmed' => 'La confirmation du champ :attribute ne correspond pas.',
    'current_password' => 'Le mot de passe actuel est incorrect.',
    'email' => 'Le champ :attribute doit être une adresse e-mail valide.',
    'exists' => 'La valeur sélectionnée pour :attribute est invalide.',
    'file' => 'Le champ :attribute doit être un fichier.',
    'file' => 'Le champ :attribute doit être un fichier valide.',
    'image' => 'Le champ :attribute doit être une image.',
    'in' => 'La valeur sélectionnée pour :attribute est invalide.',
    'integer' => 'Le champ :attribute doit être un nombre entier.',
    'mimes' => 'Le champ :attribute doit être un fichier de type : :values.',
    'numeric' => 'Le champ :attribute doit être un nombre.',
    'regex' => 'Le format du champ :attribute est invalide.',
    'required' => 'Le champ :attribute est obligatoire.',
    'required_with' => 'Le champ :attribute est obligatoire lorsque :values est renseigné.',
    'string' => 'Le champ :attribute doit être une chaîne de caractères.',
    'unique' => 'Cette valeur est déjà utilisée pour :attribute.',
    'uploaded' => 'Le téléversement de :attribute a échoué.',

    'between' => [
        'numeric' => 'La valeur de :attribute doit être comprise entre :min et :max.',
        'string' => 'Le champ :attribute doit contenir entre :min et :max caractères.',
    ],
    'max' => [
        'numeric' => 'La valeur de :attribute ne peut pas dépasser :max.',
        'file' => 'Le fichier :attribute ne doit pas dépasser :max kilo-octets.',
        'string' => 'Le champ :attribute ne peut pas dépasser :max caractères.',
    ],
    'min' => [
        'numeric' => 'La valeur de :attribute doit être au moins :min.',
        'file' => 'Le fichier :attribute doit faire au moins :min kilo-octets.',
        'string' => 'Le champ :attribute doit contenir au moins :min caractères.',
    ],

    'password' => [
        'letters' => 'Le champ :attribute doit contenir au moins une lettre.',
        'mixed' => 'Le champ :attribute doit contenir une majuscule et une minuscule.',
        'numbers' => 'Le champ :attribute doit contenir au moins un chiffre.',
        'symbols' => 'Le champ :attribute doit contenir au moins un symbole.',
        'uncompromised' => 'Ce :attribute est apparu dans une fuite de données. Choisissez-en un autre.',
    ],

    'custom' => [],

    'attributes' => [
        'name' => 'nom',
        'email' => 'adresse e-mail',
        'phone' => 'téléphone',
        'password' => 'mot de passe',
        'current_password' => 'mot de passe actuel',
        'price' => 'prix',
        'description' => 'description',
        'category_id' => 'catégorie',
        'product_id' => 'produit',
        'stock' => 'stock',
        'quantity' => 'quantité',
        'image' => 'image',
        'address' => 'adresse',
        'role' => 'rôle',
    ],
];
