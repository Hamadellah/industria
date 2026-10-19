import { ArrowRight, BadgePercent, Wrench, ShieldCheck, Headphones, RotateCcw, Truck, Drill, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard';
import ProductGrid from '../components/ProductGrid';
import { useCategories, useFetch } from '../lib/hooks';
import { productService } from '../services';

// Image de fond industrielle / forage de haute qualité
const HERO_IMAGE_URL = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2000&auto=format&fit=crop';

function SectionHeader({ title, subtitle, to, linkLabel = 'Tout voir' }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <h2 className="section-title font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
      </div>
      {to && (
        <Link to={to} className="hidden items-center gap-1 text-sm font-semibold text-blue-700 hover:underline sm:flex">
          {linkLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const categories = useCategories();
  const trending = useFetch(() => productService.list({ sort: 'popular', per_page: 8 }), []);
  const latest = useFetch(() => productService.list({ sort: 'newest', per_page: 8 }), []);

  const trendingProducts = trending.data?.data || [];
  const latestProducts = latest.data?.data || [];

  const categoryLink = (re) => {
    const c = categories.find((cat) => re.test(cat.name));
    return c ? `/categories/${c.id}` : '/products';
  };

  return (
    <>
      {/* 1. Hero Section */}
      <section className="relative min-h-[520px] w-full overflow-hidden bg-slate-900 text-white">
        {/* Background Image avec URL Industrie */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url("${HERO_IMAGE_URL}")` }}
        >
          {/* Overlay dégradé bleu */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#031B4E] via-[#052B75]/85 to-transparent" />
        </div>

        <div className="container-page relative z-10 flex min-h-[520px] flex-col justify-between py-12 lg:py-16">
          <div className="max-w-2xl pt-4">
            {/* Tagline avec le trait bleu */}
            <div className="flex items-center gap-2">
              <span className="h-[3px] w-6 bg-sky-400"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-200">
                L'ÉQUIPEMENT DES PROJETS QUI AVANCENT
              </span>
            </div>

            {/* Titre */}
            <h1 className="mt-6 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              La puissance au service <br className="hidden sm:inline" />
              de vos projets
            </h1>

            {/* Sous-titre */}
            <p className="mt-4 text-base font-normal text-slate-200 sm:text-lg">
              Tout pour le forage, le pompage et l'industrie.
            </p>

            {/* Boutons */}
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-bold text-[#052B75] shadow-lg transition hover:bg-slate-100"
              >
                <ArrowRight className="h-4 w-4 text-[#052B75]" />
                Découvrir nos produits
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:underline"
              >
                Un projet ? Parlons-en <span className="text-xs">↗</span>
              </Link>
            </div>
          </div>

          {/* Slider Indicators */}
          <div className="mt-12 flex items-center gap-1.5">
            <span className="h-1.5 w-6 rounded-full bg-sky-400"></span>
            <span className="h-1.5 w-1.5 rounded-full bg-white/40"></span>
            <span className="h-1.5 w-1.5 rounded-full bg-white/40"></span>
          </div>
        </div>
      </section>

      {/* 2. Les Produits (Meilleures ventes + Bannières + Nouveautés) */}
      <section className="container-page mt-16">
        <SectionHeader title="Nos meilleures ventes" subtitle="Les équipements les plus sollicités par les professionnels." to="/products?sort=popular" linkLabel="Voir toutes les ventes" />
        <ProductGrid products={trendingProducts} loading={trending.loading} />
      </section>

      {/* Bannières promotionnelles */}
      <section className="container-page mt-16 grid gap-6 md:grid-cols-2">
        <Link to={categoryLink(/artisan|forage/i)} className="group relative overflow-hidden rounded-3xl border border-blue-800 bg-gradient-to-br from-blue-900 to-slate-900 p-8 text-white sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">Le rendement pour vous équiper</p>
          <h3 className="mt-3 max-w-xs text-2xl font-extrabold text-white sm:text-3xl">Vos projets prennent de la pression.</h3>
          <p className="mt-2 text-sm text-slate-300">Jusqu'à -15% sur une sélection de pompes et accessoires.</p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-400 group-hover:underline">Profiter des offres <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          <Droplets className="absolute -bottom-6 -right-6 h-40 w-40 text-blue-400 opacity-10" aria-hidden />
        </Link>
        <Link to={categoryLink(/outillage|lectro/i)} className="group relative overflow-hidden rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-950 p-8 text-white sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">Pour une installation complète</p>
          <h3 className="mt-3 max-w-xs text-2xl font-extrabold text-white sm:text-3xl">Le détail qui fait la différence.</h3>
          <p className="mt-2 text-sm text-slate-300">Tuyaux, raccords et pièces de précision garantis.</p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 group-hover:underline">Tous les accessoires <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          <Drill className="absolute -bottom-6 -right-6 h-40 w-40 text-cyan-400 opacity-10" aria-hidden />
        </Link>
      </section>

      {/* Dernières nouveautés */}
      <section className="container-page mt-16">
        <SectionHeader title="Dernières nouveautés" subtitle="Matériel récent et équipements innovants." to="/products?sort=newest" />
        <ProductGrid products={latestProducts} loading={latest.loading} />
      </section>

      {/* 3. Les Catégories */}
      <section className="container-page mt-20">
        <SectionHeader title="De quoi équiper tous vos projets" subtitle="Forage, pompage, outillage et solutions industrielles." to="/products" linkLabel="Toutes les catégories" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.length === 0
            ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)
            : categories.map((c, i) => <CategoryCard key={c.id} category={c} index={i} />)}
        </div>
      </section>

      {/* 4. Réassurance + Badge Floating "DU PUITS À L'INSTALLATION" */}
      <section className="mt-20 border-t border-slate-200 bg-slate-50 py-12">
        <div className="container-page space-y-10">
          {/* Badge "DU PUITS À L'INSTALLATION" */}
          <div className="mx-auto flex max-w-md items-center justify-center gap-4 rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Droplets className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                DU PUITS À L'INSTALLATION
              </p>
              <p className="text-base font-extrabold text-[#031B4E]">
                Une solution pour chaque chantier.
              </p>
            </div>
          </div>

          {/* Cartes de Réassurance */}
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {[
              [Truck, 'Livraison nationale', 'Expédition partout au Maroc'],
              [ShieldCheck, 'Paiement sécurisé', 'Conçu, sécurisé et performant'],
              [RotateCcw, 'Produits professionnels', 'Conçus pour nos techniques'],
              [Headphones, 'Conseils d\'experts', 'Le bon équipement, au bon usage'],
            ].map(([Icon, t, s]) => (
              <div key={t} className="flex flex-col items-center text-center sm:flex-row sm:text-left gap-3 rounded-xl bg-white p-4 border border-slate-100 shadow-sm">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}