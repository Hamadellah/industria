import { ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatMAD } from '../lib/format';
import { useShop } from '../context/ShopContext';
import FavoriteButton from './FavoriteButton';
import ProductImage from './ProductImage';

export function StockBadge({ stock }) {
  if (stock <= 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-red-600">
        <span className="h-2 w-2 rounded-full bg-red-600"></span>
        <span>Rupture de stock</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
      <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
      <span>En stock · Prêt à expédier</span>
    </div>
  );
}

export default function ProductCard({ product }) {
  const { addToCart } = useShop();
  const soldOut = product.stock <= 0;

  return (
    <article className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Top Image Section: Badge + Wishlist Heart */}
      <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-slate-50">
        {/* Badge (e.g. "Meilleure vente", "Usage forage", "-12%") */}
        {soldOut ? (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-md bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
            Épuisé
          </span>
        ) : (product.badge || product.discount) ? (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-md bg-sky-100 px-2.5 py-1 text-[11px] font-bold text-sky-800 shadow-sm">
            {product.badge || `-${product.discount}%`}
          </span>
        ) : null}

        {/* Favorite Button */}
        <FavoriteButton productId={product.id} className="absolute right-2.5 top-2.5 z-10" />

        {/* Image */}
        <Link to={`/products/${product.id}`} aria-label={product.name} className="h-full w-full block">
          <ProductImage 
            src={product.image_url} 
            alt={product.name} 
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${soldOut ? 'opacity-60 grayscale' : ''}`} 
          />
        </Link>
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          {/* Category */}
          {product.category && (
            <Link to={`/categories/${product.category.id}`} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:underline">
              {product.category.name}
            </Link>
          )}

          {/* Name */}
          <Link to={`/products/${product.id}`} className="mt-1 line-clamp-2 block text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors">
            {product.name}
          </Link>

          {/* Subtitle / Specs */}
          {product.subtitle && (
            <p className="mt-1 text-xs font-medium text-slate-500">
              {product.subtitle}
            </p>
          )}

          {/* Rating */}
          <div className="mt-2 flex items-center gap-1">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-700">
              {product.rating || '4.8'}
            </span>
            <span className="text-xs text-slate-400">
              ({product.reviews_count || '24'})
            </span>
          </div>
        </div>

        {/* Price, Stock & Add to Cart */}
        <div className="mt-4 border-t border-slate-100 pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-slate-900">
              {formatMAD(product.price)}
            </span>
            {product.old_price && (
              <span className="text-xs font-medium text-slate-400 line-through">
                {formatMAD(product.old_price)}
              </span>
            )}
          </div>

          <div className="mb-3 mt-1">
            <StockBadge stock={product.stock} />
          </div>

          <button
            type="button"
            onClick={() => addToCart(product.id)}
            disabled={soldOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0279B6] py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#026294] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <ShoppingCart className="h-4 w-4" />
            {soldOut ? 'Indisponible' : 'Ajouter au panier'}
          </button>
        </div>
      </div>
    </article>
  );
}