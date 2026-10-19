<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Demande;
use App\Models\Favori;
use App\Models\Panier;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Données de démonstration — pour le développement local uniquement.
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // --- Comptes -----------------------------------------------------
        $admin = User::factory()->admin()->create([
            'name' => 'Administrateur Atlas',
            'email' => 'admin@maisonatlas.ma',
            'phone' => '0522000000',
            'password' => 'Admin@12345',
        ]);

        $clients = collect([
            ['Yasmine El Idrissi', 'yasmine@example.ma', '0661123456'],
            ['Karim Benali', 'karim@example.ma', '0662234567'],
            ['Salma Tazi', 'salma@example.ma', '0663345678'],
            ['Omar Alaoui', 'omar@example.ma', '0664456789'],
            ['Imane Chraibi', 'imane@example.ma', '0665567890'],
        ])->map(fn ($c) => User::factory()->create([
            'name' => $c[0],
            'email' => $c[1],
            'phone' => $c[2],
            'password' => 'Client@12345',
        ]));

        // --- Catégories + produits ---------------------------------------
        $catalogue = [
            'Mode Homme' => [
                ['Chemise en lin Casablanca', 349, 24, 'Chemise en lin léger, coupe droite, idéale pour les journées chaudes. Lavable en machine à 30 °C.'],
                ['Jean slim stretch indigo', 449, 30, 'Jean slim en coton stretch pour un confort durable. Fermeture à boutons, cinq poches.'],
                ['Veste en cuir de Fès', 1890, 6, 'Veste en cuir d\'agneau tannée à Fès, doublure en coton, finitions cousues main.'],
                ['Polo piqué essentiel', 229, 40, 'Polo en coton piqué, col côtelé, trois boutons nacrés. Disponible toute l\'année.'],
            ],
            'Mode Femme' => [
                ['Robe longue fleurie Marrakech', 599, 18, 'Robe longue fluide en viscose imprimée, taille élastiquée et fentes latérales.'],
                ['Kaftan brodé à la main', 1290, 8, 'Kaftan en crêpe avec broderies dorées réalisées par des artisanes de Tétouan.'],
                ['Blazer structuré beige', 749, 14, 'Blazer croisé en mélange de laine, épaulettes légères, doublure satinée.'],
                ['Sac cabas en cuir souple', 899, 12, 'Grand cabas en cuir grainé avec pochette amovible et fermeture aimantée.'],
            ],
            'Électronique' => [
                ['Casque Bluetooth ANC Pro', 1190, 20, 'Réduction de bruit active, 35 h d\'autonomie, micro à annulation d\'écho, charge rapide USB-C.'],
                ['Montre connectée Sahara', 1590, 15, 'Écran AMOLED 1,4", GPS intégré, suivi du sommeil et de la fréquence cardiaque, étanche 5 ATM.'],
                ['Enceinte portable Souk 360', 690, 25, 'Son immersif à 360°, étanche IP67, 12 h d\'autonomie et appairage stéréo.'],
                ['Powerbank 20 000 mAh', 349, 45, 'Batterie externe avec deux ports USB-C et un port USB-A, charge rapide 45 W.'],
            ],
            'Maison & Déco' => [
                ['Tapis berbère Beni Ouarain', 2490, 5, 'Tapis en laine naturelle tissé à la main dans le Moyen Atlas, motifs losanges, 160 × 230 cm.'],
                ['Set de 6 verres à thé dorés', 189, 60, 'Six verres à thé marocains aux motifs dorés, passent au lave-vaisselle.'],
                ['Lampe en laiton ajouré', 520, 10, 'Lanterne en laiton ciselé diffusant une lumière chaude et des jeux d\'ombres.'],
                ['Plaid en coton tissé', 299, 28, 'Plaid doux en coton tissé, finitions à franges, parfait pour le salon.'],
            ],
            'Beauté & Soins' => [
                ['Huile d\'argan pure 100 ml', 169, 80, 'Huile d\'argan 100 % pure, pressée à froid par une coopérative de la région d\'Essaouira.'],
                ['Savon noir beldi + gant kessa', 79, 100, 'Savon noir traditionnel à l\'huile d\'olive, livré avec son gant kessa pour le hammam.'],
                ['Rhassoul naturel de l\'Atlas', 59, 90, 'Argile rhassoul pour le visage et les cheveux, sans additifs.'],
                ['Eau de rose de Kelaat M\'Gouna', 89, 70, 'Eau florale de roses de Damas distillée artisanalement, tonique apaisant.'],
            ],
            'Sport & Loisirs' => [
                ['Tapis de yoga antidérapant', 249, 35, 'Tapis de yoga 6 mm en TPE écologique, surface antidérapante des deux côtés.'],
                ['Chaussures de running Atlas', 790, 22, 'Chaussures légères avec amorti réactif et semelle à forte adhérence.'],
                ['Sac à dos de randonnée 35 L', 590, 16, 'Sac ergonomique avec dos ventilé, housse de pluie intégrée et poches latérales.'],
                ['Ballon de football officiel T5', 199, 50, 'Ballon thermocollé taille 5, excellente tenue de vol et durabilité.'],
            ],
            'Artisanat marocain' => [
                ['Tajine en terre cuite de Safi', 229, 40, 'Tajine en terre cuite émaillée, fabriqué à Safi, utilisable sur flamme douce et au four.'],
                ['Babouches en cuir naturel', 249, 33, 'Babouches cousues main en cuir naturel, semelle souple et finitions traditionnelles.'],
                ['Poterie de Fès - set de 3 bols', 319, 20, 'Trois bols en céramique peinte à la main aux motifs bleu de Fès.'],
                ['Théière en métal argenté', 459, 12, 'Théière marocaine en métal argenté ciselé, 1 L, poignée isolante.'],
            ],
        ];

        $products = collect();
        foreach ($catalogue as $categoryName => $items) {
            $category = Category::create(['name' => $categoryName]);

            foreach ($items as [$name, $price, $stock, $description]) {
                $products->push(Product::create([
                    'name' => $name,
                    'price' => $price,
                    'description' => $description,
                    'stock' => $stock,
                    'user_id' => $admin->id,
                    'category_id' => $category->id,
                    // Image de substitution fiable (même image à chaque exécution grâce au "seed").
                    'image' => 'https://picsum.photos/seed/'.Str::slug($name).'/800/800',
                ]));
            }
        }

        // --- Favoris et paniers ------------------------------------------
        foreach ($clients as $client) {
            $products->random(4)->each(fn ($p) => Favori::firstOrCreate(['user_id' => $client->id, 'product_id' => $p->id]));
        }
        Panier::create(['user_id' => $clients[0]->id, 'product_id' => $products[0]->id, 'quantity' => 2]);
        Panier::create(['user_id' => $clients[0]->id, 'product_id' => $products[8]->id, 'quantity' => 1]);

        // --- Demandes d'exemple (statuts variés) -------------------------
        $statuses = [
            Demande::STATUS_PENDING, Demande::STATUS_PENDING, Demande::STATUS_PENDING,
            Demande::STATUS_VALIDATED, Demande::STATUS_VALIDATED, Demande::STATUS_VALIDATED,
            Demande::STATUS_REJECTED, Demande::STATUS_REJECTED,
        ];

        foreach ($statuses as $i => $status) {
            $client = $clients[$i % $clients->count()];
            $reference = 'CMD-'.strtoupper(Str::random(8));
            $address = ['12 rue Hassan II, Casablanca', '8 avenue Mohammed V, Rabat', '25 boulevard Zerktouni, Casablanca', '3 rue de la Liberté, Beni Mellal'][$i % 4];

            foreach ($products->random(rand(1, 2)) as $product) {
                $quantity = rand(1, 2);

                Demande::create([
                    'user_id' => $client->id,
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'unit_price' => $product->price,
                    'reference' => $reference,
                    'status' => $status,
                    'address' => $address,
                ])->forceFill(['created_at' => now()->subDays(rand(0, 120))])->save();

                // Cohérence du stock pour les demandes déjà validées.
                if ($status === Demande::STATUS_VALIDATED) {
                    $product->decrement('stock', min($quantity, $product->stock));
                }
            }
        }
    }
}
