<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json([
    'name' => config('app.name'),
    'message' => 'API de la boutique en ligne. Voir /api et la documentation dans docs/API.md.',
]));
