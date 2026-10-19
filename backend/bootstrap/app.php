<?php

use App\Http\Middleware\EnsureUserIsAdmin;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\PostTooLargeException;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            // Images uploadées : route sans middleware (pas de session ni de cookies).
            \Illuminate\Support\Facades\Route::group([], base_path('routes/media.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Authentification SPA par cookie (Sanctum) : session + CSRF pour les domaines "stateful".
        $middleware->statefulApi();

        $middleware->alias([
            'admin' => EnsureUserIsAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Toutes les erreurs de l'API sont rendues en JSON.
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson()
        );

        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Authentification requise.'], 401);
            }
        });

        // Corps de requête supérieur à post_max_size (PHP) : message clair au lieu d'une erreur générique.
        $exceptions->render(function (PostTooLargeException $e, Request $request) {
            return response()->json([
                'message' => "Le fichier est trop volumineux pour le serveur. Choisissez une image de moins de 2 Mo.",
                'errors' => ['image' => ["Le fichier est trop volumineux pour le serveur. Choisissez une image de moins de 2 Mo."]],
            ], 413);
        });

        $exceptions->render(function (ModelNotFoundException|NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Ressource introuvable.'], 404);
            }
        });
    })->create();
