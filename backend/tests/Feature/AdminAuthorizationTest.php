<?php

namespace Tests\Feature;

use App\Models\Demande;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_get_401_on_admin_routes(): void
    {
        $this->getJson('/api/admin/stats')->assertUnauthorized();
        $this->getJson('/api/admin/users')->assertUnauthorized();
    }

    public function test_clients_get_403_on_every_admin_route(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $product = Product::factory()->create();
        $demande = Demande::factory()->create();
        $target = User::factory()->create();

        $this->getJson('/api/admin/stats')->assertForbidden();
        $this->getJson('/api/admin/products')->assertForbidden();
        $this->postJson('/api/admin/products', [])->assertForbidden();
        $this->putJson("/api/admin/products/{$product->id}", [])->assertForbidden();
        $this->deleteJson("/api/admin/products/{$product->id}")->assertForbidden();
        $this->patchJson("/api/admin/products/{$product->id}/stock", ['stock' => 99])->assertForbidden();
        $this->postJson('/api/admin/categories', ['name' => 'X'])->assertForbidden();
        $this->getJson('/api/admin/users')->assertForbidden();
        $this->patchJson("/api/admin/users/{$target->id}/role", ['role' => 'admin'])->assertForbidden();
        $this->getJson('/api/admin/demandes')->assertForbidden();
        $this->postJson("/api/admin/demandes/{$demande->id}/validate")->assertForbidden();
        $this->postJson("/api/admin/demandes/{$demande->id}/reject")->assertForbidden();

        $this->assertSame('client', $target->fresh()->role);
        $this->assertSame('en_attente', $demande->fresh()->status);
    }

    public function test_admin_can_view_statistics(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        Demande::factory()->count(2)->create();

        $this->getJson('/api/admin/stats')
            ->assertOk()
            ->assertJsonPath('totals.demandes', 2)
            ->assertJsonPath('totals.en_attente', 2)
            ->assertJsonCount(6, 'demandes_per_month')
            ->assertJsonStructure(['totals', 'demandes_per_month', 'products_per_category', 'recent_demandes', 'recent_users']);
    }

    public function test_admin_user_list_never_exposes_sensitive_fields(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        User::factory()->count(3)->create();

        $response = $this->getJson('/api/admin/users')->assertOk();

        $response->assertJsonMissingPath('data.0.password')->assertJsonMissingPath('data.0.remember_token');
    }

    public function test_admin_can_change_another_users_role_but_not_their_own(): void
    {
        $admin = User::factory()->admin()->create();
        $client = User::factory()->create();
        Sanctum::actingAs($admin);

        $this->patchJson("/api/admin/users/{$client->id}/role", ['role' => 'admin'])
            ->assertOk()->assertJsonPath('data.role', 'admin');

        $this->patchJson("/api/admin/users/{$admin->id}/role", ['role' => 'client'])->assertUnprocessable();
        $this->assertSame('admin', $admin->fresh()->role);

        $this->patchJson("/api/admin/users/{$client->id}/role", ['role' => 'superuser'])->assertUnprocessable();
    }
}
