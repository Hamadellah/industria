<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CategoryCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_categories_are_listed_publicly_with_product_counts(): void
    {
        $category = Category::factory()->create(['name' => 'Maison']);
        Product::factory()->count(2)->create(['category_id' => $category->id]);

        $this->getJson('/api/categories')->assertOk()->assertJsonPath('data.0.products_count', 2);
        $this->getJson("/api/categories/{$category->id}")->assertOk()->assertJsonPath('data.name', 'Maison');
    }

    public function test_admin_can_create_update_and_delete_a_category(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $id = $this->postJson('/api/admin/categories', ['name' => 'Jardin'])
            ->assertCreated()->json('data.id');

        $this->putJson("/api/admin/categories/{$id}", ['name' => 'Jardin & Terrasse'])
            ->assertOk()->assertJsonPath('data.name', 'Jardin & Terrasse');

        $this->deleteJson("/api/admin/categories/{$id}")->assertNoContent();
        $this->assertDatabaseMissing('categories', ['id' => $id]);
    }

    public function test_category_names_must_be_unique(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        Category::factory()->create(['name' => 'Sport']);

        $this->postJson('/api/admin/categories', ['name' => 'Sport'])
            ->assertUnprocessable()->assertJsonValidationErrors('name');
    }

    public function test_category_with_products_cannot_be_deleted(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $category = Category::factory()->create();
        Product::factory()->create(['category_id' => $category->id]);

        $this->deleteJson("/api/admin/categories/{$category->id}")->assertStatus(409);
        $this->assertDatabaseHas('categories', ['id' => $category->id]);
    }
}
