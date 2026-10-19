<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DemandeController;
use App\Http\Controllers\FavoriController;
use App\Http\Controllers\PanierController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

/*
| Toutes les routes sont préfixées par /api (voir bootstrap/app.php).
| L'authentification SPA utilise le cookie de session Sanctum :
| appeler d'abord GET /sanctum/csrf-cookie, puis POST /api/login.
*/

// --- Authentification (limitée à 6 tentatives / minute) -------------------
Route::middleware('throttle:auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// --- Catalogue public -----------------------------------------------------
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/products/{product}/related', [ProductController::class, 'related']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

// --- Espace connecté (client ou administrateur) ---------------------------
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    Route::get('/favoris', [FavoriController::class, 'index']);
    Route::get('/favoris/ids', [FavoriController::class, 'ids']);
    Route::post('/favoris/{product}', [FavoriController::class, 'store']);
    Route::delete('/favoris/{product}', [FavoriController::class, 'destroy']);

    Route::get('/cart', [PanierController::class, 'index']);
    Route::post('/cart', [PanierController::class, 'store']);
    Route::delete('/cart', [PanierController::class, 'clear']);
    Route::patch('/cart/{panier}', [PanierController::class, 'update']);
    Route::delete('/cart/{panier}', [PanierController::class, 'destroy']);

    Route::get('/demandes', [DemandeController::class, 'index']);
    Route::post('/demandes', [DemandeController::class, 'store']);
});

// --- Administration (rôle "admin" vérifié côté serveur) -------------------
Route::middleware(['auth:sanctum', 'admin', 'throttle:api'])->prefix('admin')->group(function () {
    Route::get('/stats', [Admin\DashboardController::class, 'stats']);

    // Les formulaires avec image sont envoyés en POST + _method=PUT (multipart).
    Route::apiResource('products', Admin\ProductController::class);
    Route::patch('/products/{product}/stock', [Admin\ProductController::class, 'updateStock']);

    Route::apiResource('categories', Admin\CategoryController::class)->except('show');

    Route::get('/users', [Admin\UserController::class, 'index']);
    Route::patch('/users/{user}/role', [Admin\UserController::class, 'updateRole']);

    Route::get('/demandes', [Admin\DemandeController::class, 'index']);
    Route::post('/demandes/{demande}/validate', [Admin\DemandeController::class, 'validateDemande']);
    Route::post('/demandes/{demande}/reject', [Admin\DemandeController::class, 'reject']);
});
