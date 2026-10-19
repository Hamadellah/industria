import { Check, ClipboardList, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import AdminHeader from '../../components/AdminHeader';
import ConfirmationModal from '../../components/ConfirmationModal';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import ProductImage from '../../components/ProductImage';
import { SkeletonRows } from '../../components/SkeletonLoader';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { useAdminShell } from '../../layouts/AdminLayout';
import { getErrorMessage } from '../../lib/api';
import { formatDate, formatMAD } from '../../lib/format';
import { useDebounced, useFetch } from '../../lib/hooks';
import { adminService } from '../../services';

const TABS = [['', 'Toutes'], ['en_attente', 'En attente'], ['validee', 'Validées'], ['rejetee', 'Rejetées']];

export default function AdminDemandes() {
  const { openMenu } = useAdminShell();
  const toast = useToast();
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [action, setAction] = useState(null); // { type: 'validate' | 'reject', demande }
  const [busy, setBusy] = useState(false);
  const q = useDebounced(search);

  useEffect(() => {
    setPage(1);
  }, [q, status]);
  const { data, loading, error, reload } = useFetch(
    () => adminService.demandes({ status: status || undefined, q: q || undefined, page, per_page: 10 }),
    [status, q, page],
  );
  const rows = data?.data || [];

  const run = async () => {
    setBusy(true);
    try {
      action.type === 'validate' ? await adminService.validateDemande(action.demande.id) : await adminService.rejectDemande(action.demande.id);
      toast.success(action.type === 'validate' ? 'Demande validée, stock mis à jour.' : 'Demande rejetée.');
      setAction(null);
      reload();
    } catch (e) {
      toast.error(getErrorMessage(e));
      setAction(null);
      reload();
    } finally {
      setBusy(false);
    }
  };

  const d = action?.demande;

  return (
    <>
      <AdminHeader title="Demandes" subtitle="Validez ou rejetez les demandes des clients" onMenu={openMenu} />
      <div className="space-y-5 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-200/60 p-1" role="tablist">
            {TABS.map(([value, label]) => (
              <button key={value} role="tab" aria-selected={status === value} onClick={() => setStatus(value)}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold ${status === value ? 'bg-white text-ink shadow-sm' : 'text-ink-soft hover:text-ink'}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="relative lg:w-80">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Client, produit, référence…" aria-label="Rechercher une demande" className="input pl-11" />
          </div>
        </div>

        <div className="card overflow-hidden">
          {error ? (
            <div className="p-6"><EmptyState icon={ClipboardList} title="Chargement impossible" actionLabel="Réessayer" onAction={reload} /></div>
          ) : loading ? <SkeletonRows /> : rows.length === 0 ? (
            <div className="p-6"><EmptyState icon={ClipboardList} title="Aucune demande" description="Aucune demande ne correspond à ces critères." /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-ink-soft">
                  <tr><th className="px-5 py-3">Référence</th><th className="px-3 py-3">Client</th><th className="px-3 py-3">Produit</th><th className="px-3 py-3">Total</th><th className="px-3 py-3">Date</th><th className="px-3 py-3">Statut</th><th className="px-5 py-3 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((r) => (
                    <tr key={r.id} className="align-top hover:bg-slate-50/60">
                      <td className="px-5 py-3"><p className="font-semibold">{r.reference}</p><p className="max-w-[170px] truncate text-xs text-ink-soft" title={r.address}>{r.address}</p></td>
                      <td className="px-3 py-3"><p className="font-medium">{r.user?.name}</p><p className="text-xs text-ink-soft">{r.user?.email}</p></td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100"><ProductImage src={r.product?.image_url} alt="" /></div>
                          <div className="min-w-0"><p className="line-clamp-1 max-w-[190px] font-medium">{r.product?.name}</p><p className="text-xs text-ink-soft">{r.quantity} × {formatMAD(r.unit_price)} · stock {r.product?.stock}</p></div>
                        </div>
                      </td>
                      <td className="px-3 py-3 font-semibold">{formatMAD(r.total)}</td>
                      <td className="px-3 py-3 text-ink-soft">{formatDate(r.created_at)}</td>
                      <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-5 py-3">
                        {r.status === 'en_attente' ? (
                          <div className="flex justify-end gap-2">
                            <button className="btn-primary btn-sm" onClick={() => setAction({ type: 'validate', demande: r })}><Check className="h-3.5 w-3.5" /> Valider</button>
                            <button className="btn-outline btn-sm text-red-600 hover:border-red-300 hover:bg-red-50" onClick={() => setAction({ type: 'reject', demande: r })}><X className="h-3.5 w-3.5" /> Rejeter</button>
                          </div>
                        ) : <p className="text-right text-xs text-ink-soft">Traitée</p>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <Pagination meta={data?.meta} onChange={setPage} />
      </div>

      <ConfirmationModal
        open={!!action}
        danger={action?.type === 'reject'}
        loading={busy}
        title={action?.type === 'validate' ? 'Valider cette demande ?' : 'Rejeter cette demande ?'}
        message={d ? (action.type === 'validate'
          ? `Le stock de « ${d.product?.name} » sera diminué de ${d.quantity} unité(s) (stock actuel : ${d.product?.stock}).`
          : `La demande ${d.reference} de ${d.user?.name} sera rejetée. Le stock ne sera pas modifié.`) : ''}
        confirmLabel={action?.type === 'validate' ? 'Valider' : 'Rejeter'}
        onConfirm={run}
        onClose={() => setAction(null)}
      />
    </>
  );
}
