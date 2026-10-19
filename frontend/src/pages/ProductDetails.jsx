import { ChevronRight, Minus, PackageSearch, Plus, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import FavoriteButton from '../components/FavoriteButton';
import ProductGrid from '../components/ProductGrid';
import ProductImage from '../components/ProductImage';
import { StockBadge } from '../components/ProductCard';
import { useShop } from '../context/ShopContext';
import { formatMAD } from '../lib/format';
import { useFetch } from '../lib/hooks';
import { productService } from '../services';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useShop();
  const { data: product, loading, error } = useFetch(() => productService.get(id), [id]);
  const related = useFetch(() => productService.related(id), [id]);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setQuantity(1);
  }, [id]);

  if (loading) {
    return (
      <div className="container-page grid gap-10 py-10 lg:grid-cols-2">
        <div className="skeleton aspect-square rounded-2xl" />
        <div className="space-y-4">
          <div className="skeleton h-4 w-1/4 rounded" />
          <div className="skeleton h-10 w-3/4 rounded" />
          <div className="skeleton h-8 w-1/3 rounded" />
          <div className="skeleton h-32 w-full rounded" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-page py-16">
        <EmptyState icon={PackageSearch} title="Produit introuvable" description="Ce produit n'existe plus ou n'est plus disponible." actionLabel="Voir le catalogue" actionTo="/products" />
      </div>
    );
  }

  const soldOut = product.stock <= 0;

  const handleAdd = async () => {
    setAdding(true);
    await addToCart(product.id, quantity);
    setAdding(false);
  };

  return (
    <div className="container-page py-8">
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-ink-soft" aria-label="Fil d'Ariane">
        <Link to="/" className="hover:text-ink">Accueil</Link><ChevronRight className="h-4 w-4" />
        <Link to="/products" className="hover:text-ink">Produits</Link>
        {product.category && (<><ChevronRight className="h-4 w-4" /><Link to={`/categories/${product.category.id}`} className="hover:text-ink">{product.category.name}</Link></>)}
        <ChevronRight className="h-4 w-4" /><span className="font-medium text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="card overflow-hidden bg-slate-100">
          <ProductImage src={product.image_url} alt={product.name} className={soldOut ? 'opacity-70 grayscale' : ''} />
        </div>

        <div className="flex flex-col">
          {product.category && (
            <Link to={`/categories/${product.category.id}`} className="text-xs font-semibold uppercase tracking-wider text-accent-700 hover:underline">
              {product.category.name}
            </Link>
          )}
          <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{product.name}</h1>
          <p className="mt-4 text-3xl font-bold">{formatMAD(product.price)}</p>
          <div className="mt-2"><StockBadge stock={product.stock} /> {!soldOut && <span className="text-xs text-ink-soft">· {product.stock} unité(s) disponible(s)</span>}</div>

          <p className="mt-6 whitespace-pre-line leading-relaxed text-ink-soft">{product.description}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-xl border border-slate-300">
              <button className="p-3 hover:bg-slate-100 disabled:opacity-40" disabled={quantity <= 1 || soldOut} onClick={() => setQuantity((q) => q - 1)} aria-label="Diminuer la quantité"><Minus className="h-4 w-4" /></button>
              <span className="w-12 text-center font-semibold" aria-live="polite">{soldOut ? 0 : quantity}</span>
              <button className="p-3 hover:bg-slate-100 disabled:opacity-40" disabled={quantity >= product.stock || soldOut} onClick={() => setQuantity((q) => q + 1)} aria-label="Augmenter la quantité"><Plus className="h-4 w-4" /></button>
            </div>
            <button onClick={handleAdd} disabled={soldOut || adding} className="btn-primary flex-1 px-8 py-3.5 text-base sm:flex-none">
              <ShoppingBag className="h-5 w-5" /> {soldOut ? 'Rupture de stock' : adding ? 'Ajout…' : 'Ajouter au panier'}
            </button>
            <FavoriteButton productId={product.id} withLabel />
          </div>

          <ul className="mt-8 space-y-3 border-t border-slate-100 pt-6 text-sm text-ink-soft">
            <li className="flex items-center gap-3"><Truck className="h-5 w-5 text-accent-600" /> Livraison dans tout le Maroc après validation de votre demande</li>
            <li className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-accent-600" /> Aucun paiement en ligne : vous envoyez une demande avec votre adresse</li>
          </ul>
        </div>
      </div>

      {(related.data?.length > 0 || related.loading) && (
        <section className="mt-20">
          <h2 className="section-title mb-8">Produits similaires</h2>
          <ProductGrid products={related.data || []} loading={related.loading} skeletonCount={4} columns="md:grid-cols-4" />
        </section>
      )}
    </div>
  );
}
