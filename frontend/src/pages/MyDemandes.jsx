import { CalendarDays, ClipboardList, MapPin } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductImage from '../components/ProductImage';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatMAD } from '../lib/format';
import { useFetch } from '../lib/hooks';
import { demandeService } from '../services';

/** Regroupe les lignes de demande issues d'une même soumission du panier. */
export function groupByReference(demandes) {
  const map = new Map();
  demandes.forEach((d) => {
    if (!map.has(d.reference)) map.set(d.reference, { reference: d.reference, created_at: d.created_at, address: d.address, lines: [] });
    map.get(d.reference).lines.push(d);
  });
  return [...map.values()];
}

function DemandeGroup({ group }) {
  const total = group.lines.reduce((sum, l) => sum + l.total, 0);
  return (
    <article className="card overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4">
        <div>
          <p className="font-bold">{group.reference}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
            <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{formatDate(group.created_at)}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{group.address}</span>
          </p>
        </div>
        <p className="text-lg font-extrabold">{formatMAD(total)}</p>
      </header>
      <ul className="divide-y divide-slate-100">
        {group.lines.map((l) => (
          <li key={l.id} className="flex items-center gap-4 px-5 py-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
              <ProductImage src={l.product?.image_url} alt={l.product?.name || 'Produit'} />
            </div>
            <div className="min-w-0 flex-1">
              {l.product && !l.product.deleted_at ? (
                <Link to={`/products/${l.product.id}`} className="line-clamp-1 font-semibold hover:text-accent-700">{l.product.name}</Link>
              ) : (
                <p className="line-clamp-1 font-semibold">{l.product?.name || 'Produit supprimé'}</p>
              )}
              <p className="text-xs text-ink-soft">{l.quantity} × {formatMAD(l.unit_price)}</p>
            </div>
            <div className="text-right">
              <StatusBadge status={l.status} />
              <p className="mt-1 text-sm font-semibold">{formatMAD(l.total)}</p>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function MyDemandes() {
  const [filter, setFilter] = useState('');
  const { data, loading } = useFetch(() => demandeService.list({ per_page: 100 }), []);

  const groups = useMemo(() => groupByReference(data?.data || []), [data]);
  const isOpen = (g) => g.lines.some((l) => l.status === 'en_attente');
  const visible = groups.filter((g) => !filter || g.lines.some((l) => l.status === filter));
  const current = visible.filter(isOpen);
  const history = visible.filter((g) => !isOpen(g));

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Mes demandes</h1>
          <p className="mt-1 text-sm text-ink-soft">Suivez le statut de vos demandes et retrouvez votre historique.</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-auto" aria-label="Filtrer par statut">
          <option value="">Tous les statuts</option>
          <option value="en_attente">En attente</option>
          <option value="validee">Validées</option>
          <option value="rejetee">Rejetées</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner className="min-h-[40vh]" />
      ) : groups.length === 0 ? (
        <div className="mt-8"><EmptyState icon={ClipboardList} title="Aucune demande" description="Vos demandes apparaîtront ici après l'envoi de votre panier." actionLabel="Découvrir les produits" actionTo="/products" /></div>
      ) : (
        <div className="mt-8 space-y-10">
          <section>
            <h2 className="mb-4 text-lg font-bold">Demandes en cours <span className="text-sm font-medium text-ink-soft">({current.length})</span></h2>
            {current.length === 0 ? <p className="text-sm text-ink-soft">Aucune demande en cours.</p> : <div className="space-y-4">{current.map((g) => <DemandeGroup key={g.reference} group={g} />)}</div>}
          </section>
          <section>
            <h2 className="mb-4 text-lg font-bold">Historique <span className="text-sm font-medium text-ink-soft">({history.length})</span></h2>
            {history.length === 0 ? <p className="text-sm text-ink-soft">Aucune demande traitée pour le moment.</p> : <div className="space-y-4">{history.map((g) => <DemandeGroup key={g.reference} group={g} />)}</div>}
          </section>
        </div>
      )}
    </div>
  );
}
