<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class CategoryController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $categories = Category::withCount('products')
            ->when($request->query('q'), fn ($q, $term) => $q->where('name', 'like', '%'.addcslashes($term, '%_\\').'%'))
            ->orderBy('name')
            ->paginate($request->integer('per_page', 10));

        return CategoryResource::collection($categories);
    }

    public function store(CategoryRequest $request): JsonResponse
    {
        $category = Category::create($request->validated());

        return (new CategoryResource($category->loadCount('products')))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(CategoryRequest $request, Category $category): CategoryResource
    {
        $category->update($request->validated());

        return new CategoryResource($category->loadCount('products'));
    }

    public function destroy(Category $category): JsonResponse|Response
    {
        if ($category->products()->withTrashed()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer une catégorie qui contient des produits. Déplacez ou supprimez d\'abord ses produits.',
            ], Response::HTTP_CONFLICT);
        }

        $category->delete();

        return response()->noContent();
    }
}
