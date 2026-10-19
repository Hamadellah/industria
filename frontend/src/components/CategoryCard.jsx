import { Dumbbell, Gem, Home, Laptop, Shirt, Sparkles, Tag, Watch } from 'lucide-react';
import { Link } from 'react-router-dom';

const ICONS = [
  [/homme/i, Shirt],
  [/femme/i, Gem],
  [/lectro|tech|high/i, Laptop],
  [/maison|d[ée]co/i, Home],
  [/beaut|soin/i, Sparkles],
  [/sport|loisir/i, Dumbbell],
  [/artisan/i, Watch],
];

export const categoryIcon = (name = '') => ICONS.find(([re]) => re.test(name))?.[1] || Tag;

const TINTS = [
  'from-emerald-50 to-teal-100 text-emerald-700',
  'from-sky-50 to-blue-100 text-sky-700',
  'from-amber-50 to-orange-100 text-amber-700',
  'from-rose-50 to-pink-100 text-rose-700',
  'from-violet-50 to-purple-100 text-violet-700',
  'from-lime-50 to-green-100 text-lime-700',
  'from-cyan-50 to-sky-100 text-cyan-700',
];

export default function CategoryCard({ category, index = 0 }) {
  const Icon = categoryIcon(category.name);
  return (
    <Link
      to={`/categories/${category.id}`}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lift ${TINTS[index % TINTS.length]}`}
    >
      <Icon className="h-9 w-9 transition group-hover:scale-110" aria-hidden />
      <div className="mt-10">
        <h3 className="font-bold text-ink">{category.name}</h3>
        <p className="text-xs font-medium text-ink-soft">{category.products_count ?? 0} produit(s)</p>
      </div>
      <Icon className="absolute -bottom-4 -right-4 h-24 w-24 opacity-10" aria-hidden />
    </Link>
  );
}
