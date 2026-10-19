import { Heart } from 'lucide-react';
import { useState } from 'react';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import ProductGrid from '../components/ProductGrid';
import { useShop } from '../context/ShopContext';
import { useFetch } from '../lib/hooks';
import { favoriService } from '../services';

export default function Favorites() {
  const { favoriteIds } = useShop();
  const [page, setPage] = useState(1);
  const { data, loading } = useFetch(() => favoriService.list({ page }), [page]);

  // Un produit retiré des favoris disparaît immédiatement de la liste.
  const products = (data?.data || []).filter((p) => favoriteIds.has(p.id));

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Mes favoris</h1>
      <p className="mt-1 text-sm text-ink-soft">Les produits que vous avez mis de côté.</p>

      <div className="mt-8">
        {!loading && products.length === 0 ? (
          <EmptyState icon={Heart} title="Aucun favori pour le moment" description="Touchez le cœur d'un produit pour le retrouver ici." actionLabel="Parcourir la boutique" actionTo="/products" />
        ) : (
          <>
            <ProductGrid products={products} loading={loading} skeletonCount={4} />
            <Pagination meta={data?.meta} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
