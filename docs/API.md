# API REST — Maison Atlas

Base : `http://localhost:8000/api` · Format : JSON · Interface en français.

## Authentification (Sanctum SPA)
1. `GET /sanctum/csrf-cookie` (hors préfixe `/api`) pour obtenir le cookie `XSRF-TOKEN`.
2. `POST /api/login` avec l'en-tête `X-XSRF-TOKEN` et les cookies (`withCredentials`).
3. Les requêtes suivantes sont authentifiées par le cookie de session.

Codes : `200/201` succès · `401` non authentifié · `403` interdit (rôle) · `404` introuvable · `409` conflit (demande déjà traitée) · `422` validation · `429` trop de tentatives.

## Public
| Méthode | Route | Description |
|---|---|---|
| POST | `/register` | `name, email, phone?, password, password_confirmation` |
| POST | `/login` | `email, password` (limité à 6/min) |
| GET | `/products` | Paramètres : `q, category_id, min_price, max_price, in_stock, sort (newest\|price_asc\|price_desc\|popular), per_page (≤48), page` |
| GET | `/products/{id}` | Détail produit |
| GET | `/products/{id}/related` | Produits liés |
| GET | `/categories` · `/categories/{id}` | Catégories |

## Utilisateur connecté
| Méthode | Route | Description |
|---|---|---|
| POST | `/logout` | Déconnexion |
| GET | `/user` | Utilisateur courant |
| PUT | `/profile` | `name, email, phone?, password?` (+ confirmation) |
| GET | `/favoris` · `/favoris/ids` | Favoris (pagination / liste d'ids) |
| POST · DELETE | `/favoris/{product}` | Ajouter / retirer (pas de doublon) |
| GET | `/cart` | Panier + total |
| POST | `/cart` | `product_id, quantity?` |
| PATCH | `/cart/{panier}` | `quantity` (1–100, ≤ stock) |
| DELETE | `/cart/{panier}` · `/cart` | Retirer une ligne / vider |
| GET | `/demandes` | Historique (`status`, `per_page`) |
| POST | `/demandes` | `address` (10–255 car.) — transforme le panier en demandes |

## Administration (rôle `admin`)
| Méthode | Route | Description |
|---|---|---|
| GET | `/admin/stats` | Statistiques et activité récente |
| GET/POST | `/admin/products` | Liste / création (multipart, `image` optionnelle) |
| GET/PUT/DELETE | `/admin/products/{id}` | Mise à jour : `POST` + `_method=PUT` en multipart |
| PATCH | `/admin/products/{id}/stock` | `stock` |
| GET/POST/PUT/DELETE | `/admin/categories[/{id}]` | CRUD catégories |
| GET | `/admin/users` | Liste des utilisateurs |
| PATCH | `/admin/users/{id}/role` | `role` = `admin`\|`client` |
| GET | `/admin/demandes` | Filtres `status`, `q`, `per_page` |
| POST | `/admin/demandes/{id}/validate` | Vérifie et décrémente le stock (transaction) ; 422 si stock insuffisant |
| POST | `/admin/demandes/{id}/reject` | Rejette une demande en attente |

Les réponses de liste utilisent la pagination Laravel (`data`, `links`, `meta`). Les mots de passe ne sont jamais exposés.
