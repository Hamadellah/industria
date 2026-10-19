import { Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatMAD } from '../lib/format';
import ProductImage from './ProductImage';

export default function CartItem({ item, onQuantity, onRemove }) {
  const { product } = item;
  const max = product.stock;

  return (
    <li className="flex gap-4 py-5">
      <Link to={`/products/${product.id}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-28 sm:w-28">
        <ProductImage src={product.image_url} alt={product.name} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/products/${product.id}`} className="line-clamp-2 font-semibold text-ink hover:text-accent-700">
              {product.name}
            </Link>
            <p className="text-xs text-ink-soft">{product.category?.name}</p>
            <p className="mt-1 text-sm text-ink-soft">{formatMAD(product.price)} l'unité</p>
          </div>
          <button onClick={() => onRemove(item.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label={`Retirer ${product.name}`}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center rounded-xl border border-slate-300">
            <button className="p-2 hover:bg-slate-100 disabled:opacity-40" disabled={item.quantity <= 1} onClick={() => onQuantity(item.id, item.quantity - 1)} aria-label="Diminuer la quantité">
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-9 text-center text-sm font-semibold" aria-live="polite">{item.quantity}</span>
            <button className="p-2 hover:bg-slate-100 disabled:opacity-40" disabled={item.quantity >= max} onClick={() => onQuantity(item.id, item.quantity + 1)} aria-label="Augmenter la quantité">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <p className="text-base font-bold text-ink">{formatMAD(item.subtotal)}</p>
        </div>
        {item.quantity >= max && <p className="mt-1 text-xs font-medium text-amber-600">Quantité maximale disponible atteinte.</p>}
      </div>
    </li>
  );
}
