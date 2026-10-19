<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Favori;
use App\Models\Panier;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductCrudTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Théière argentée',
            'price' => 459.90,
            'description' => 'Une théière marocaine ciselée.',
            'category_id' => Category::factory()->create()->id,
            'stock' => 12,
        ], $overrides);
    }

    public function test_catalogue_is_public_and_supports_search_filter_and_sort(): void
    {
        $tea = Category::factory()->create(['name' => 'Thé']);
        $other = Category::factory()->create(['name' => 'Autre']);
        Product::factory()->create(['name' => 'Théière', 'price' => 300, 'category_id' => $tea->id]);
        Product::factory()->create(['name' => 'Verre à thé', 'price' => 50, 'category_id' => $tea->id]);
        Product::factory()->create(['name' => 'Tapis', 'price' => 900, 'category_id' => $other->id]);

        $this->getJson('/api/products?q=th')->assertOk()->assertJsonCount(2, 'data');
        $this->getJson("/api/products?category_id={$other->id}")->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/products?min_price=100&max_price=500')->assertOk()->assertJsonCount(1, 'data');

        $sorted = $this->getJson('/api/products?sort=price_asc')->assertOk()->json('data.*.price');
        $this->assertEquals([50, 300, 900], $sorted);
    }

    public function test_product_details_include_stock_and_category(): void
    {
        $product = Product::factory()->create(['stock' => 7]);

        $this->getJson("/api/products/{$product->id}")
            ->assertOk()
            ->assertJsonPath('data.stock', 7)
            ->assertJsonPath('data.category.id', $product->category_id);
    }

    public function test_admin_can_create_update_and_delete_a_product(): void
    {
        Storage::fake('public');
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $created = $this->postJson('/api/admin/products', $this->payload([
            'image' => $this->fakePng('the.png'),
        ]))->assertCreated()->assertJsonPath('data.name', 'Théière argentée');

        $id = $created->json('data.id');
        $this->assertDatabaseHas('products', ['id' => $id, 'user_id' => $admin->id]);
        Storage::disk('public')->assertExists(Product::find($id)->image);

        $this->putJson("/api/admin/products/{$id}", $this->payload(['name' => 'Théière modifiée', 'stock' => 3]))
            ->assertOk()->assertJsonPath('data.name', 'Théière modifiée');

        $this->deleteJson("/api/admin/products/{$id}")->assertNoContent();
        $this->assertSoftDeleted('products', ['id' => $id]);
        $this->getJson("/api/products/{$id}")->assertNotFound();
    }

    public function test_uploaded_image_url_is_built_from_request_host_and_is_served(): void
    {
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->admin()->create());

        $created = $this->postJson('/api/admin/products', $this->payload(['image' => $this->fakePng('photo.png')]))->assertCreated();

        $path = Product::find($created->json('data.id'))->image;
        $this->assertStringStartsWith('products/', $path);

        $url = $created->json('data.image_url');
        $this->assertSame('http://localhost/storage/'.$path, $url);

        // Même sans lien symbolique public/storage, le fichier reste accessible via la route de secours.
        $this->get(parse_url($url, PHP_URL_PATH))->assertOk();
        $this->get('/storage/products/inexistant.png')->assertNotFound();
        $this->get('/storage/products/..%2F..%2F.env')->assertNotFound();
    }

    public function test_product_validation_rules(): void
    {
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/api/admin/products', $this->payload(['price' => -5, 'stock' => -1]))
            ->assertUnprocessable()->assertJsonValidationErrors(['price', 'stock']);

        $this->postJson('/api/admin/products', $this->payload(['category_id' => 9999]))
            ->assertUnprocessable()->assertJsonValidationErrors('category_id');

        $this->postJson('/api/admin/products', $this->payload(['image' => UploadedFile::fake()->create('virus.pdf', 10, 'application/pdf')]))
            ->assertUnprocessable()->assertJsonValidationErrors('image');

        $this->postJson('/api/admin/products', $this->payload(['image' => $this->fakePng('big.png')->size(5000)]))
            ->assertUnprocessable()->assertJsonValidationErrors('image');
    }

    public function test_admin_can_update_stock_only(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $product = Product::factory()->create(['stock' => 1]);

        $this->patchJson("/api/admin/products/{$product->id}/stock", ['stock' => 25])->assertOk()->assertJsonPath('data.stock', 25);
        $this->patchJson("/api/admin/products/{$product->id}/stock", ['stock' => -3])->assertUnprocessable();
    }

    public function test_deleting_a_product_removes_it_from_favorites_and_carts(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $product = Product::factory()->create();
        Favori::factory()->create(['product_id' => $product->id]);
        Panier::factory()->create(['product_id' => $product->id]);

        $this->deleteJson("/api/admin/products/{$product->id}")->assertNoContent();

        $this->assertDatabaseCount('favoris', 0);
        $this->assertDatabaseCount('paniers', 0);
    }

    /** Image PNG 1x1 générée sans l'extension GD (UploadedFile::fake()->image() en a besoin). */
    private function fakePng(string $name): \Illuminate\Http\Testing\File
    {
        $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');

        return UploadedFile::fake()->createWithContent($name, $png);
    }
}
