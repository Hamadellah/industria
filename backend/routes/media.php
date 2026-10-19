<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

/*
| Filet de sécurité pour les images uploadées : si le lien symbolique public/storage n'existe pas
| (storage:link oublié, copie du projet depuis Windows, volume Docker…), les fichiers du disque
| "public" sont servis directement par Laravel. Quand le lien existe, le serveur web sert le fichier
| lui-même et cette route n'est jamais atteinte.
|
| IMPORTANT : ce fichier est chargé HORS du groupe "web" (voir bootstrap/app.php) : aucune session,
| aucun cookie ni jeton CSRF ne doivent être créés par une simple requête d'image, sinon ils
| écrasent la session Sanctum (erreur "CSRF token mismatch" à la connexion).
*/
Route::get('/storage/{path}', function (string $path) {
    abort_if(str_contains($path, '..') || str_contains($path, "\0"), 404);

    $disk = Storage::disk('public');
    abort_unless($disk->exists($path), 404);

    return $disk->response($path, null, ['Cache-Control' => 'public, max-age=86400']);
})->where('path', '.*');
