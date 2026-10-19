import { useParams } from 'react-router-dom';
import Catalogue from './Catalogue';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { useFetch } from '../lib/hooks';
import { categoryService } from '../services';
import { PackageSearch } from 'lucide-react';

export default function CategoryPage() {
  const { id } = useParams();
  const { data: category, loading, error } = useFetch(() => categoryService.get(id), [id]);

  if (loading) return <LoadingSpinner className="min-h-[50vh]" />;
  if (error || !category) {
    return (
      <div className="container-page py-16">
        <EmptyState icon={PackageSearch} title="Catégorie introuvable" description="Cette catégorie n'existe pas ou a été supprimée." actionLabel="Voir tous les produits" actionTo="/products" />
      </div>
    );
  }

  return <Catalogue key={id} fixedCategoryId={id} title={category.name} description={`${category.products_count} produit(s) dans cette catégorie`} />;
}
