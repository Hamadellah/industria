import { PackageSearch, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import ProductGrid from '../components/ProductGrid';
import { useCategories, useFetch } from '../lib/hooks';
import { productService } from '../services';

const SORTS = [
  ['newest', 'Plus récents'],
  ['popular', 'Popularité'],
  ['price_asc', 'Prix croissant'],
  ['price_desc', 'Prix décroissant'],
];

/** Vue catalogue partagée : recherche, filtres, tri et pagination pilotés par l'URL. */
export default function Catalogue({ fixedCategoryId = null, title, description }) {
  const categories = useCategories();
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const q = params.get('q') || '';
  const categoryId = fixedCategoryId ?? params.get('category_id') ?? '';
  const sort = params.get('sort') || 'newest';
  const page = Number(params.get('page') || 1);
  const minPrice = params.get('min_price') || '';
  const maxPrice = params.get('max_price') || '';
  const inStock = params.get('in_stock') === '1';

  const [priceDraft, setPriceDraft] = useState({ min: minPrice, max: maxPrice });
  useEffect(() => {
    setPriceDraft({ min: minPrice, max: maxPrice });
  }, [minPrice, maxPrice]);

  const { data, loading, error, reload } = useFetch(
    () =>
      productService.list({
        q: q || undefined,
        category_id: categoryId || undefined,
        sort,
        page,
        min_price: minPrice || undefined,
        max_price: maxPrice || undefined,
        in_stock: inStock ? 1 : undefined,
        per_page: 12,
      }),
    [q, categoryId, sort, page, minPrice, maxPrice, inStock],
  );

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries({ page: undefined, ...changes }).forEach(([k, v]) => {
      v === undefined || v === '' || v === false ? next.delete(k) : next.set(k, v === true ? '1' : v);
    });
    setParams(next);
  };

  const applyPrice = (e) => {
    e.preventDefault();
    update({ min_price: priceDraft.min, max_price: priceDraft.max });
  };

  const products = data?.data || [];
  const meta = data?.meta;
  const hasFilters = q || minPrice || maxPrice || inStock || (!fixedCategoryId && categoryId);

  const filters = (
    <div className="space-y-7">
      {!fixedCategoryId && (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">Catégorie</legend>
          <div className="space-y-1">
            {[{ id: '', name: 'Toutes les catégories' }, ...categories].map((c) => (
              <label key={c.id} className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm ${String(categoryId) === String(c.id) ? 'bg-accent-50 font-semibold text-accent-700' : 'hover:bg-slate-100'}`}>
                <span className="flex items-center gap-2">
                  <input type="radio" name="category" className="accent-accent-600" checked={String(categoryId) === String(c.id)} onChange={() => update({ category_id: c.id })} />
                  {c.name}
                </span>
                {c.products_count !== undefined && <span className="text-xs text-slate-400">{c.products_count}</span>}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <form onSubmit={applyPrice}>
        <p className="mb-3 text-sm font-semibold">Prix (MAD)</p>
        <div className="flex items-center gap-2">
          <input type="number" min="0" inputMode="numeric" placeholder="Min" aria-label="Prix minimum" className="input px-3" value={priceDraft.min} onChange={(e) => setPriceDraft((d) => ({ ...d, min: e.target.value }))} />
          <span className="text-slate-400">–</span>
          <input type="number" min="0" inputMode="numeric" placeholder="Max" aria-label="Prix maximum" className="input px-3" value={priceDraft.max} onChange={(e) => setPriceDraft((d) => ({ ...d, max: e.target.value }))} />
        </div>
        <button className="btn-outline btn-sm mt-3 w-full">Appliquer</button>
      </form>

      <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
        <input type="checkbox" className="h-4 w-4 accent-accent-600" checked={inStock} onChange={(e) => update({ in_stock: e.target.checked })} />
        Uniquement les produits en stock
      </label>

      {hasFilters && (
        <button
          className="btn-ghost btn-sm w-full"
          onClick={() => setParams(fixedCategoryId ? {} : {})}
        >
          <X className="h-3.5 w-3.5" /> Réinitialiser les filtres
        </button>
      )}
    </div>
  );

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">{title || (q ? `Résultats pour « ${q} »` : 'Tous les produits')}</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {description || (meta ? `${meta.total} produit(s) trouvé(s)` : 'Chargement du catalogue…')}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
        <aside className="hidden lg:block"><div className="card sticky top-36 p-5">{filters}</div></aside>

        <div>
          <div className="mb-5 flex items-center justify-between gap-3">
            <button className="btn-outline lg:hidden" onClick={() => setFiltersOpen(true)}>
              <SlidersHorizontal className="h-4 w-4" /> Filtres
            </button>
            <div className="ml-auto flex items-center gap-2">
              <label htmlFor="sort" className="hidden text-sm text-ink-soft sm:block">Trier par</label>
              <select id="sort" value={sort} onChange={(e) => update({ sort: e.target.value === 'newest' ? '' : e.target.value })} className="input w-auto py-2 pr-8">
                {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>

          {error ? (
            <EmptyState icon={PackageSearch} title="Impossible de charger les produits" description="Le serveur ne répond pas. Vérifiez que l'API est démarrée." actionLabel="Réessayer" onAction={reload} />
          ) : !loading && products.length === 0 ? (
            <EmptyState icon={PackageSearch} title="Aucun produit trouvé" description="Essayez d'élargir votre recherche ou de modifier les filtres." actionLabel={hasFilters ? 'Réinitialiser' : undefined} onAction={hasFilters ? () => setParams({}) : undefined} />
          ) : (
            <>
              <ProductGrid products={products} loading={loading} skeletonCount={6} columns="md:grid-cols-3" />
              <Pagination meta={meta} onChange={(p) => { update({ page: p > 1 ? String(p) : '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
            </>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[88vw] overflow-y-auto bg-white p-6 shadow-lift">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold">Filtres</h2>
              <button onClick={() => setFiltersOpen(false)} aria-label="Fermer"><X className="h-5 w-5" /></button>
            </div>
            {filters}
          </div>
        </div>
      )}
    </div>
  );
}
