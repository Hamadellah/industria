# Maison Atlas — Boutique en ligne (Laravel + React + MySQL)

Application e-commerce complète : API REST **Laravel 12** (Sanctum), SPA **React + Vite**, base **MySQL**, **Tailwind CSS**, icônes **Lucide**. Interface 100 % française, prix en **MAD**. **Aucun système de paiement** : le client envoie une *demande* avec son adresse, l'administrateur la valide ou la rejette.

```
ecommerce-project/
├── backend/    API Laravel (migrations, modèles, contrôleurs, seeders, tests)
├── frontend/   SPA React/Vite/Tailwind
├── docs/API.md Documentation de l'API
└── README.md
```

## 1. Prérequis
- PHP ≥ 8.2 avec extensions `pdo_mysql`, `mbstring`, `fileinfo`, `gd`, `xml`, `curl`, `zip` (+ `pdo_sqlite` pour les tests)
- Composer ≥ 2
- Node.js ≥ 20 et npm
- MySQL ≥ 8 (ou MariaDB ≥ 10.6)

## 2. Base de données MySQL
```sql
CREATE DATABASE ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 3–5. Backend
```bash
cd backend
composer install
cp .env.example .env          # puis adapter DB_USERNAME / DB_PASSWORD si besoin
php artisan key:generate
php artisan migrate --seed    # tables + données de démonstration
php artisan storage:link      # images produits uploadées
php artisan serve             # http://localhost:8000
```
Variables importantes de `backend/.env` : `DB_*` (MySQL), `FRONTEND_URL` (origines CORS) et `SANCTUM_STATEFUL_DOMAINS` (domaines SPA autorisés). Par défaut, elles correspondent à `localhost:5173` (frontend) et `localhost:8000` (API).

## 6–7. Frontend
```bash
cd frontend
npm install
cp .env.example .env          # VITE_API_URL=http://localhost:8000 (sans /api)
npm run dev                   # http://localhost:5173
```
Build de production : `npm run build` (sortie dans `frontend/dist`).

## 8–9. Démarrage et accès
Lancer les deux serveurs (deux terminaux), puis ouvrir **http://localhost:5173**.

## 10. Comptes de démonstration (développement local uniquement)
| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | `admin@maisonatlas.ma` | `Admin@12345` |
| Client | `yasmine@example.ma` | `Client@12345` |
| Clients | `karim@`, `salma@`, `omar@`, `imane@example.ma` | `Client@12345` |

> ⚠️ Ces identifiants sont publics : ne jamais exécuter le seeder en production.

## Tests
Les tests utilisent SQLite en mémoire (aucune configuration requise) :
```bash
cd backend
php artisan test
```
Couverture : authentification, CRUD produits et catégories, favoris, panier, création de demande, validation/rejet de demande, autorisations admin, contrôle du stock.

## Fonctionnement
- **Authentification** : Sanctum en mode SPA (cookie de session + CSRF). Aucun jeton ni mot de passe n'est stocké dans le `localStorage`. Connexion/inscription limitées à 6 tentatives par minute.
- **Rôles** : toutes les routes `/api/admin/*` sont protégées côté serveur par le middleware `admin`.
- **Panier** : stocké en base (table `paniers`, unicité utilisateur+produit, colonne `quantity`).
- **Demandes** : valider le panier crée une demande par produit (groupées par référence `CMD-XXXXXXXX`) et vide le panier. Le stock est vérifié à la création, puis re-vérifié et décrémenté de façon atomique dans une transaction à la validation par l'admin (pas de survente, pas de stock négatif).
- **Statuts** : `en_attente`, `validee`, `rejetee` (extension du schéma initial pour permettre le rejet).
- **Images** : JPG/PNG/WebP, 2 Mo max, stockées dans `storage/app/public/products` (chemin relatif enregistré en base, ex. `products/abc.png`). L'API renvoie `image_url` construite depuis l'hôte de la requête (`http://<hôte>/storage/products/abc.png`) ; si le lien `public/storage` est absent, Laravel sert lui-même le fichier. Pour de gros fichiers, vérifiez `upload_max_filesize` et `post_max_size` dans `php.ini` (≥ 2M / 8M).
- **Suppression sûre** : produits en suppression logique (les demandes passées restent consultables).

## Écarts par rapport à l'ERD
- `paniers` et `demandes` ont une colonne `quantity` (nécessaire aux quantités du panier) ; `demandes` ajoute `unit_price` (prix figé à la demande), `reference` et le statut `rejetee`.
- `products.deleted_at` (suppression logique).

## Documentation de l'API
Voir [`docs/API.md`](docs/API.md).
