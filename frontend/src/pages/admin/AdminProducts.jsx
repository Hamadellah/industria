import { ImagePlus, Package, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import AdminHeader from '../../components/AdminHeader';
import ConfirmationModal from '../../components/ConfirmationModal';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import ProductImage from '../../components/ProductImage';
import { SkeletonRows } from '../../components/SkeletonLoader';
import { useToast } from '../../context/ToastContext';
import { useAdminShell } from '../../layouts/AdminLayout';
import { getErrorMessage, getFieldErrors } from '../../lib/api';
import { formatMAD } from '../../lib/format';
import { useCategories, useDebounced, useFetch } from '../../lib/hooks';
import { adminService } from '../../services';
import Field from '../Field';

const EMPTY = { name: '', price: '', description: '', category_id: '', stock: '0' };

function ProductForm({ product, categories, onSaved, onClose }) {
  const toast = useToast();
  const [values, setValues] = useState(
    product ? { name: product.name, price: String(product.price), description: product.description, category_id: String(product.category_id), stock: String(product.stock) } : EMPTY,
  );
  const [file, setFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));
  const cls = (k) => `input ${errors[k] ? 'input-error' : ''}`;

  const onFile = (e) => {
    const input = e.target;
    const f = input.files?.[0];
    if (!f) return;
    // Sous Windows, le type MIME est parfois vide (ex. .webp) : on se rabat sur l'extension.
    const okType = ['image/jpeg', 'image/png', 'image/webp'].includes(f.type) || (!f.type && /\.(jpe?g|png|webp)$/i.test(f.name));
    const reject = (message) => {
      input.value = '';
      setFile(null);
      setErrors((x) => ({ ...x, image: message }));
    };
    if (!okType) return reject('Formats acceptés : JPG, PNG ou WebP.');
    if (f.size > 2 * 1024 * 1024) return reject("L'image ne doit pas dépasser 2 Mo.");
    setErrors((x) => ({ ...x, image: undefined }));
    setFile(f);
    setRemoveImage(false);
  };

  const validate = () => {
    const next = {};
    if (!values.name.trim()) next.name = 'Le nom est obligatoire.';
    if (values.price === '' || Number(values.price) < 0) next.price = 'Indiquez un prix valide (≥ 0).';
    if (!values.description.trim()) next.description = 'La description est obligatoire.';
    if (!values.category_id) next.category_id = 'Choisissez une catégorie.';
    if (values.stock === '' || !Number.isInteger(Number(values.stock)) || Number(values.stock) < 0) next.stock = 'Le stock doit être un entier ≥ 0.';
    return next;
  };

  const submit = async (e) => {
    e.preventDefault();
    const next = validate();
    setErrors((x) => ({ image: x.image, ...next }));
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      const payload = { ...values, name: values.name.trim(), description: values.description.trim(), image: file || undefined, remove_image: removeImage || undefined };
      const saved = product ? await adminService.updateProduct(product.id, payload) : await adminService.createProduct(payload);
      toast.success(product ? 'Produit mis à jour.' : 'Produit créé.');
      onSaved(saved);
    } catch (err) {
      const fields = getFieldErrors(err);
      if (Object.keys(fields).length) setErrors(fields);
      else toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const currentImage = preview || (!removeImage ? product?.image_url : null);

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field id="p-name" label="Nom du produit" error={errors.name}><input id="p-name" className={cls('name')} value={values.name} onChange={set('name')} /></Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field id="p-price" label="Prix (MAD)" error={errors.price}><input id="p-price" type="number" min="0" step="0.01" className={cls('price')} value={values.price} onChange={set('price')} /></Field>
        <Field id="p-stock" label="Stock" error={errors.stock}><input id="p-stock" type="number" min="0" step="1" className={cls('stock')} value={values.stock} onChange={set('stock')} /></Field>
        <Field id="p-cat" label="Catégorie" error={errors.category_id}>
          <select id="p-cat" className={cls('category_id')} value={values.category_id} onChange={set('category_id')}>
            <option value="">Choisir…</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
      </div>
      <Field id="p-desc" label="Description" error={errors.description}><textarea id="p-desc" rows={4} className={`${cls('description')} resize-none`} value={values.description} onChange={set('description')} /></Field>

      <Field id="p-image" label="Image du produit" error={errors.image} hint="JPG, PNG ou WebP — 2 Mo maximum.">
        <div className="flex items-center gap-4">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
            {currentImage ? <img key={currentImage} src={currentImage} alt="Aperçu" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : <ImagePlus className="h-7 w-7 text-slate-400" />}
          </div>
          <div className="space-y-2">
            <input id="p-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-accent-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-accent-700 hover:file:bg-accent-100" />
            {product?.image && !file && (
              <label className="flex items-center gap-2 text-xs text-ink-soft"><input type="checkbox" className="accent-accent-600" checked={removeImage} onChange={(e) => setRemoveImage(e.target.checked)} /> Supprimer l'image actuelle</label>
            )}
          </div>
        </div>
      </Field>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <button type="button" className="btn-outline" onClick={onClose} disabled={saving}>Annuler</button>
        <button className="btn-primary" disabled={saving}>{saving ? 'Enregistrement…' : product ? 'Enregistrer' : 'Créer le produit'}</button>
      </div>
    </form>
  );
}

function StockCell({ product, onChange }) {
  const toast = useToast();
  const [value, setValue] = useState(String(product.stock));
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setValue(String(product.stock));
  }, [product.stock]);

  const commit = async () => {
    if (value === String(product.stock)) return;
    const n = Number(value);
    if (value === '' || !Number.isInteger(n) || n < 0) {
      toast.error('Le stock doit être un entier positif ou nul.');
      return setValue(String(product.stock));
    }
    setBusy(true);
    try {
      onChange(await adminService.updateStock(product.id, n));
      toast.success('Stock mis à jour.');
    } catch (e) {
      toast.error(getErrorMessage(e));
      setValue(String(product.stock));
    } finally {
      setBusy(false);
    }
  };

  return (
    <input
      type="number"
      min="0"
      aria-label={`Stock de ${product.name}`}
      value={value}
      disabled={busy}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      className={`w-20 rounded-lg border px-2 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-accent-100 ${product.stock === 0 ? 'border-red-300 bg-red-50 text-red-700' : product.stock <= 5 ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-slate-300'}`}
    />
  );
}

export default function AdminProducts() {
  const { openMenu } = useAdminShell();
  const toast = useToast();
  const categories = useCategories();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const q = useDebounced(search);

  useEffect(() => {
    setPage(1);
  }, [q, categoryId]);

  const { data, loading, error, reload } = useFetch(
    () => adminService.products({ q: q || undefined, category_id: categoryId || undefined, page, per_page: 10 }),
    [q, categoryId, page],
  );
  const [overrides, setOverrides] = useState({});
  useEffect(() => {
    setOverrides({});
  }, [data]);

  const rows = (data?.data || []).map((p) => overrides[p.id] || p);

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await adminService.deleteProduct(deleting.id);
      toast.success('Produit supprimé.');
      setDeleting(null);
      reload();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AdminHeader
        title="Produits"
        subtitle="Gérez le catalogue, les images et les stocks"
        onMenu={openMenu}
        actions={<button className="btn-primary btn-sm sm:px-4 sm:py-2.5 sm:text-sm" onClick={() => setEditing('new')}><Plus className="h-4 w-4" /> <span className="hidden sm:inline">Nouveau produit</span></button>}
      />
      <div className="space-y-5 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un produit…" aria-label="Rechercher un produit" className="input pl-11" />
          </div>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input sm:w-56" aria-label="Filtrer par catégorie">
            <option value="">Toutes les catégories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="card overflow-hidden">
          {error ? (
            <div className="p-6"><EmptyState icon={Package} title="Chargement impossible" description="Les produits n'ont pas pu être chargés." actionLabel="Réessayer" onAction={reload} /></div>
          ) : loading ? (
            <SkeletonRows />
          ) : rows.length === 0 ? (
            <div className="p-6"><EmptyState icon={Package} title="Aucun produit" description="Aucun produit ne correspond à votre recherche." actionLabel="Ajouter un produit" onAction={() => setEditing('new')} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-ink-soft">
                  <tr><th className="px-5 py-3">Produit</th><th className="px-3 py-3">Catégorie</th><th className="px-3 py-3">Prix</th><th className="px-3 py-3">Stock</th><th className="px-5 py-3 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100"><ProductImage src={p.image_url} alt="" /></div>
                          <p className="line-clamp-2 max-w-[260px] font-semibold">{p.name}</p>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-ink-soft">{p.category?.name}</td>
                      <td className="px-3 py-3 font-semibold">{formatMAD(p.price)}</td>
                      <td className="px-3 py-3"><StockCell product={p} onChange={(np) => setOverrides((o) => ({ ...o, [np.id]: np }))} /></td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <button className="rounded-lg p-2 text-ink-soft hover:bg-slate-100 hover:text-ink" onClick={() => setEditing(p)} aria-label={`Modifier ${p.name}`}><Pencil className="h-4 w-4" /></button>
                          <button className="rounded-lg p-2 text-ink-soft hover:bg-red-50 hover:text-red-600" onClick={() => setDeleting(p)} aria-label={`Supprimer ${p.name}`}><Trash2 className="h-4 w-4" /></button>
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

      <ConfirmationModal open={!!editing} size="max-w-2xl" title={editing === 'new' ? 'Nouveau produit' : 'Modifier le produit'} onClose={() => setEditing(null)}>
        {editing && <ProductForm product={editing === 'new' ? null : editing} categories={categories} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
      </ConfirmationModal>

      <ConfirmationModal
        open={!!deleting}
        danger
        loading={busy}
        title="Supprimer ce produit ?"
        message={deleting ? `« ${deleting.name} » sera retiré de la boutique, des favoris et des paniers. L'historique des demandes est conservé.` : ''}
        confirmLabel="Supprimer"
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
