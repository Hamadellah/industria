import { Search, ShieldCheck, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import AdminHeader from '../../components/AdminHeader';
import ConfirmationModal from '../../components/ConfirmationModal';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import { SkeletonRows } from '../../components/SkeletonLoader';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useAdminShell } from '../../layouts/AdminLayout';
import { getErrorMessage } from '../../lib/api';
import { formatDate } from '../../lib/format';
import { useDebounced, useFetch } from '../../lib/hooks';
import { adminService } from '../../services';

export default function AdminUsers() {
  const { openMenu } = useAdminShell();
  const { user: me } = useAuth();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [change, setChange] = useState(null); // { user, role }
  const [busy, setBusy] = useState(false);
  const q = useDebounced(search);

  useEffect(() => {
    setPage(1);
  }, [q, role]);
  const { data, loading, error, reload } = useFetch(() => adminService.users({ q: q || undefined, role: role || undefined, page, per_page: 10 }), [q, role, page]);
  const rows = data?.data || [];

  const confirm = async () => {
    setBusy(true);
    try {
      await adminService.updateRole(change.user.id, change.role);
      toast.success('Rôle mis à jour.');
      setChange(null);
      reload();
    } catch (e) {
      toast.error(getErrorMessage(e));
      setChange(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AdminHeader title="Utilisateurs" subtitle="Comptes enregistrés et gestion des rôles" onMenu={openMenu} />
      <div className="space-y-5 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher par nom ou e-mail…" aria-label="Rechercher un utilisateur" className="input pl-11" />
          </div>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="input sm:w-48" aria-label="Filtrer par rôle">
            <option value="">Tous les rôles</option>
            <option value="admin">Administrateurs</option>
            <option value="client">Clients</option>
          </select>
        </div>

        <div className="card overflow-hidden">
          {error ? (
            <div className="p-6"><EmptyState icon={Users} title="Chargement impossible" actionLabel="Réessayer" onAction={reload} /></div>
          ) : loading ? <SkeletonRows /> : rows.length === 0 ? (
            <div className="p-6"><EmptyState icon={Users} title="Aucun utilisateur" description="Aucun compte ne correspond à votre recherche." /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-ink-soft">
                  <tr><th className="px-5 py-3">Utilisateur</th><th className="px-3 py-3">Téléphone</th><th className="px-3 py-3">Demandes</th><th className="px-3 py-3">Inscrit le</th><th className="px-5 py-3">Rôle</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-100 text-sm font-bold text-accent-700">{u.name.charAt(0).toUpperCase()}</span>
                          <div className="min-w-0"><p className="truncate font-semibold">{u.name}{u.id === me.id && <span className="ml-2 text-xs font-medium text-ink-soft">(vous)</span>}</p><p className="truncate text-xs text-ink-soft">{u.email}</p></div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-ink-soft">{u.phone || '—'}</td>
                      <td className="px-3 py-3">{u.demandes_count ?? 0}</td>
                      <td className="px-3 py-3 text-ink-soft">{formatDate(u.created_at)}</td>
                      <td className="px-5 py-3">
                        {u.id === me.id ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white"><ShieldCheck className="h-3.5 w-3.5" /> Administrateur</span>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => e.target.value !== u.role && setChange({ user: u, role: e.target.value })}
                            aria-label={`Rôle de ${u.name}`}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent-100 ${u.role === 'admin' ? 'border-ink bg-ink text-white' : 'border-slate-300 bg-white'}`}
                          >
                            <option value="client">Client</option>
                            <option value="admin">Administrateur</option>
                          </select>
                        )}
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
        open={!!change}
        danger={change?.role === 'admin'}
        loading={busy}
        title="Modifier le rôle ?"
        message={change ? (change.role === 'admin'
          ? `${change.user.name} obtiendra un accès complet à l'administration de la boutique.`
          : `${change.user.name} perdra son accès à l'administration et deviendra client.`) : ''}
        confirmLabel="Confirmer"
        onConfirm={confirm}
        onClose={() => setChange(null)}
      />
    </>
  );
}
