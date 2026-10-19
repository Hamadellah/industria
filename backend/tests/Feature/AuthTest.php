<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    private function spa(): static
    {
        // Les requêtes issues du frontend utilisent l'authentification "stateful" de Sanctum.
        return $this->withHeaders(['Origin' => 'http://localhost:5173', 'Referer' => 'http://localhost:5173/']);
    }

    public function test_user_can_register_as_client_and_never_gets_admin_role(): void
    {
        $response = $this->spa()->postJson('/api/register', [
            'name' => 'Salma Tazi',
            'email' => 'salma@example.ma',
            'password' => 'Secret123',
            'password_confirmation' => 'Secret123',
            'role' => 'admin', // tentative d'élévation de privilèges
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.email', 'salma@example.ma')
            ->assertJsonPath('data.role', 'client')
            ->assertJsonMissingPath('data.password');

        $this->assertDatabaseHas('users', ['email' => 'salma@example.ma', 'role' => 'client']);
    }

    public function test_registration_validates_input(): void
    {
        User::factory()->create(['email' => 'dup@example.ma']);

        $this->postJson('/api/register', [
            'name' => '',
            'email' => 'dup@example.ma',
            'password' => 'short',
        ])->assertUnprocessable()->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create(['password' => 'Secret123']);

        $this->spa()->postJson('/api/login', ['email' => $user->email, 'password' => 'Secret123'])
            ->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonMissingPath('data.password');

        $this->assertAuthenticatedAs($user, 'web');
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $user = User::factory()->create(['password' => 'Secret123']);

        $this->spa()->postJson('/api/login', ['email' => $user->email, 'password' => 'wrong'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');

        $this->assertGuest('web');
    }

    public function test_login_is_rate_limited(): void
    {
        $user = User::factory()->create();

        for ($i = 0; $i < 6; $i++) {
            $this->spa()->postJson('/api/login', ['email' => $user->email, 'password' => 'wrong']);
        }

        $this->spa()->postJson('/api/login', ['email' => $user->email, 'password' => 'wrong'])
            ->assertStatus(429);
    }

    public function test_current_user_requires_authentication(): void
    {
        $this->getJson('/api/user')->assertUnauthorized();

        Sanctum::actingAs(User::factory()->create(['name' => 'Karim']));
        $this->getJson('/api/user')->assertOk()->assertJsonPath('data.name', 'Karim');
    }

    public function test_user_can_logout(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/logout')->assertNoContent();
    }

    public function test_user_can_update_profile_and_password(): void
    {
        $user = User::factory()->create(['password' => 'Secret123']);
        Sanctum::actingAs($user);

        $this->putJson('/api/profile', [
            'name' => 'Nouveau Nom',
            'email' => $user->email,
            'phone' => '0612345678',
            'current_password' => 'Secret123',
            'password' => 'NewSecret456',
            'password_confirmation' => 'NewSecret456',
        ])->assertOk()->assertJsonPath('data.name', 'Nouveau Nom');

        $this->assertTrue(password_verify('NewSecret456', $user->fresh()->password));
    }

    public function test_profile_update_rejects_wrong_current_password_and_duplicate_email(): void
    {
        $other = User::factory()->create();
        $user = User::factory()->create(['password' => 'Secret123']);
        Sanctum::actingAs($user);

        $this->putJson('/api/profile', [
            'name' => 'X',
            'email' => $other->email,
            'current_password' => 'nope',
            'password' => 'NewSecret456',
            'password_confirmation' => 'NewSecret456',
        ])->assertUnprocessable()->assertJsonValidationErrors(['email', 'current_password']);
    }
}
