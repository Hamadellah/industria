import { SkeletonGrid } from './SkeletonLoader';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, loading, skeletonCount = 8, columns = 'md:grid-cols-3 lg:grid-cols-4' }) {
  if (loading) return <SkeletonGrid count={skeletonCount} />;
  return (
    <div className={`grid grid-cols-2 gap-4 sm:gap-6 ${columns}`}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
