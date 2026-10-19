import { Heart } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function FavoriteButton({ productId, className = '', withLabel = false }) {
  const { favoriteIds, toggleFavorite } = useShop();
  const active = favoriteIds.has(productId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(productId);
      }}
      aria-pressed={active}
      aria-label={active ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      className={`inline-flex items-center justify-center gap-2 rounded-full transition hover:scale-105 ${
        withLabel ? 'border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:border-ink' : 'h-9 w-9 bg-white/95 shadow-card'
      } ${className}`}
    >
      <Heart className={`h-[18px] w-[18px] ${active ? 'fill-red-500 text-red-500' : 'text-ink-soft'}`} />
      {withLabel && <span>{active ? 'Dans vos favoris' : 'Ajouter aux favoris'}</span>}
    </button>
  );
}
