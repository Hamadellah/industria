<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demandes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->restrictOnDelete();
            // Écarts volontaires par rapport à l'ERD : quantité, prix unitaire figé
            // et référence de regroupement (une soumission du panier = une référence).
            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('unit_price', 10, 2);
            $table->string('reference', 20)->index();
            $table->enum('status', ['en_attente', 'validee', 'rejetee'])->default('en_attente');
            $table->string('address');
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demandes');
    }
};
