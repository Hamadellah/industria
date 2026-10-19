import { Pencil, Plus, Search, Tags, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import AdminHeader from '../../components/AdminHeader';
import ConfirmationModal from '../../components/ConfirmationModal';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import { SkeletonRows } from '../../components/SkeletonLoader';
import { useToast } from '../../context/ToastContext';
import { useAdminShell } from '../../layouts/AdminLayout';
import { getErrorMessage, getFieldErrors } from '../../lib/api';
import { formatDate } from '../../lib/format';
import { invalidateCategories, useDebounced, useFetch } from '../../lib/hooks';
import { adminService } from '../../services';
import Field from '../Field';

function CategoryForm({ category, onSaved, onClose }) {
  const toast = useToast();
  const [name, setName] = useState(category?.name || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Le nom est obligatoire.');
    setError('');
    setSaving(true);
    try {
      category ? await adminService.updateCategory(category.id, name.trim()) : await adminService.createCategory(name.trim());
      invalidateCategories();
      toast.success(category ? 'Catégorie mise à jour.' : 'Catégorie créée.');
      onSaved();
    } catch (err) {
      setError(getFieldErrors(err).name || getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field id="c-name" label="Nom de la catégorie" error={error}>
        <input id="c-name" autoFocus className={`input ${error ? 'input-error' : ''}`} value={name} onChange={(e) => setName(e.target.value)} maxLength={255} />
      </Field>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" className="btn-outline" onClick={onClose} disabled={saving}>Annuler</button>
        <button className="btn-primary" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
      </div>
    </form>
  );
}

export default function AdminCategories() {
  const { openMenu } = useAdminShell();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const q = useDebounced(search);

  useEffect(() => {
    setPage(1);
  }, [q]);
  const { data, loading, error, reload } = useFetch(() => adminService.categories({ q: q || undefined, page, per_page: 10 }), [q, page]);
  const rows = data?.data || [];

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await adminService.deleteCategory(deleting.id);
      invalidateCategories();
      toast.success('Catégorie supprimée.');
      setDeleting(null);
      reload();
    } catch (e) {
      toast.error(getErrorMessage(e));
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AdminHeader title="Catégories" subtitle="Organisez votre catalogue" onMenu={openMenu}
        actions={<button className="btn-primary btn-sm sm:px-4 sm:py-2.5 sm:text-sm" onClick={() => setEditing('new')}><Plus className="h-4 w-4" /> <span className="hidden sm:inline">Nouvelle catégorie</span></button>} />
      <div className="space-y-5 p-4 sm:p-6 lg:p-8">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher une catégorie…" aria-label="Rechercher une catégorie" className="input pl-11" />
        </div>

        <div className="card overflow-hidden">
          {error ? (
            <div className="p-6"><EmptyState icon={Tags} title="Chargement impossible" actionLabel="Réessayer" onAction={reload} /></div>
          ) : loading ? <SkeletonRows rows={4} /> : rows.length === 0 ? (
            <div className="p-6"><EmptyState icon={Tags} title="Aucune catégorie" description="Créez votre première catégorie." actionLabel="Nouvelle catégorie" onAction={() => setEditing('new')} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-ink-soft">
                  <tr><th className="px-5 py-3">Nom</th><th className="px-3 py-3">Produits</th><th className="px-3 py-3">Créée le</th><th className="px-5 py-3 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3 font-semibold">{c.name}</td>
                      <td className="px-3 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">{c.products_count}</span></td>
                      <td className="px-3 py-3 text-ink-soft">{formatDate(c.created_at)}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <button className="rounded-lg p-2 text-ink-soft hover:bg-slate-100 hover:text-ink" onClick={() => setEditing(c)} aria-label={`Modifier ${c.name}`}><Pencil className="h-4 w-4" /></button>
                          <button className="rounded-lg p-2 text-ink-soft hover:bg-red-50 hover:text-red-600" onClick={() => setDeleting(c)} aria-label={`Supprimer ${c.name}`}><Trash2 className="h-4 w-4" /></button>
                        </div>
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

      <ConfirmationModal open={!!editing} title={editing === 'new' ? 'Nouvelle catégorie' : 'Modifier la catégorie'} onClose={() => setEditing(null)}>
        {editing && <CategoryForm category={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
      </ConfirmationModal>

      <ConfirmationModal
        open={!!deleting}
        danger
        loading={busy}
        title="Supprimer cette catégorie ?"
        message={deleting ? (deleting.products_count > 0 ? `« ${deleting.name} » contient ${deleting.products_count} produit(s) : la suppression sera refusée tant qu'elle n'est pas vide.` : `« ${deleting.name} » sera définitivement supprimée.`) : ''}
        confirmLabel="Supprimer"
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
