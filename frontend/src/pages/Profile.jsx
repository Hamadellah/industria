import { Heart, KeyRound, Package, Save, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage, getFieldErrors } from '../lib/api';
import { EMAIL_RE, PHONE_RE, formatDate, formatMAD } from '../lib/format';
import { useFetch } from '../lib/hooks';
import { demandeService, favoriService } from '../services';
import Field from './Field';
import { groupByReference } from './MyDemandes';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { favoriteIds } = useShop();
  const toast = useToast();

  const [values, setValues] = useState({ name: user.name, email: user.email, phone: user.phone || '' });
  const [pwd, setPwd] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const favorites = useFetch(() => favoriService.list({ page: 1 }), []);
  const demandes = useFetch(() => demandeService.list({ per_page: 100 }), []);

  const groups = useMemo(() => groupByReference(demandes.data?.data || []), [demandes.data]);
  const pendingCount = groups.filter((g) => g.lines.some((l) => l.status === 'en_attente')).length;
  const favoriteProducts = (favorites.data?.data || []).filter((p) => favoriteIds.has(p.id)).slice(0, 4);

  const validate = () => {
    const next = {};
    if (!values.name.trim()) next.name = 'Le nom est obligatoire.';
    if (!EMAIL_RE.test(values.email.trim())) next.email = "Cette adresse e-mail n'est pas valide.";
    if (values.phone && !PHONE_RE.test(values.phone)) next.phone = 'Numéro de téléphone invalide.';
    if (pwd.password) {
      if (!pwd.current_password) next.current_password = 'Saisissez votre mot de passe actuel.';
      if (pwd.password.length < 8 || !/[A-Za-z]/.test(pwd.password) || !/\d/.test(pwd.password)) next.password = '8 caractères minimum, avec lettres et chiffres.';
      if (pwd.password !== pwd.password_confirmation) next.password_confirmation = 'Les mots de passe ne correspondent pas.';
    }
    return next;
  };

  const submit = async (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      const payload = { name: values.name.trim(), email: values.email.trim(), phone: values.phone.trim() || null };
      if (pwd.password) Object.assign(payload, pwd);
      await updateProfile(payload);
      setPwd({ current_password: '', password: '', password_confirmation: '' });
      toast.success('Votre profil a été mis à jour.');
    } catch (err) {
      const fields = getFieldErrors(err);
      setErrors(Object.keys(fields).length ? fields : { form: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const set = (setter) => (k) => (e) => setter((v) => ({ ...v, [k]: e.target.value }));
  const setV = set(setValues);
  const setP = set(setPwd);
  const cls = (k) => `input ${errors[k] ? 'input-error' : ''}`;

  return (
    <div className="container-page py-10">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-100 text-2xl font-extrabold text-accent-700">{user.name.charAt(0).toUpperCase()}</span>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{user.name}</h1>
          <p className="text-sm text-ink-soft">{user.email}{user.phone ? ` · ${user.phone}` : ''}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          [Heart, 'Favoris', favoriteIds.size, '/favorites'],
          [Package, 'Demandes en cours', pendingCount, '/my-demandes'],
          [User, 'Demandes au total', groups.length, '/my-demandes'],
        ].map(([Icon, label, value, to]) => (
          <Link key={label} to={to} className="card flex items-center gap-4 p-5 hover:shadow-lift">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-600"><Icon className="h-6 w-6" /></span>
            <div><p className="text-2xl font-extrabold">{value}</p><p className="text-sm text-ink-soft">{label}</p></div>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <form onSubmit={submit} noValidate className="card space-y-5 p-6">
          <h2 className="text-lg font-bold">Informations personnelles</h2>
          {errors.form && <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700" role="alert">{errors.form}</p>}
          <Field id="name" label="Nom complet" error={errors.name}><input id="name" className={cls('name')} value={values.name} onChange={setV('name')} /></Field>
          <Field id="email" label="Adresse e-mail" error={errors.email}><input id="email" type="email" className={cls('email')} value={values.email} onChange={setV('email')} /></Field>
          <Field id="phone" label="Téléphone" error={errors.phone}><input id="phone" type="tel" className={cls('phone')} value={values.phone} onChange={setV('phone')} /></Field>

          <div className="space-y-4 border-t border-slate-100 pt-5">
            <h3 className="flex items-center gap-2 text-sm font-bold"><KeyRound className="h-4 w-4 text-accent-600" /> Changer le mot de passe <span className="font-normal text-ink-soft">(optionnel)</span></h3>
            <Field id="current_password" label="Mot de passe actuel" error={errors.current_password}><input id="current_password" type="password" autoComplete="current-password" className={cls('current_password')} value={pwd.current_password} onChange={setP('current_password')} /></Field>
            <Field id="password" label="Nouveau mot de passe" error={errors.password}><input id="password" type="password" autoComplete="new-password" className={cls('password')} value={pwd.password} onChange={setP('password')} /></Field>
            <Field id="password_confirmation" label="Confirmation" error={errors.password_confirmation}><input id="password_confirmation" type="password" autoComplete="new-password" className={cls('password_confirmation')} value={pwd.password_confirmation} onChange={setP('password_confirmation')} /></Field>
          </div>

          <button className="btn-primary" disabled={saving}><Save className="h-4 w-4" /> {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}</button>
        </form>

        <div className="card h-fit p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Dernières demandes</h2>
            <Link to="/my-demandes" className="text-sm font-semibold text-accent-700 hover:underline">Tout voir</Link>
          </div>
          {demandes.loading ? (
            <div className="mt-4 space-y-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
          ) : groups.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">Vous n'avez pas encore envoyé de demande.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {groups.slice(0, 5).map((g) => (
                <li key={g.reference} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{g.reference}</p>
                    <p className="text-xs text-ink-soft">{formatDate(g.created_at)} · {formatMAD(g.lines.reduce((s, l) => s + l.total, 0))}</p>
                  </div>
                  <StatusBadge status={g.lines.some((l) => l.status === 'en_attente') ? 'en_attente' : g.lines[0].status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {(favorites.loading || favoriteProducts.length > 0) && (
        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Mes favoris</h2>
            <Link to="/favorites" className="text-sm font-semibold text-accent-700 hover:underline">Tout voir</Link>
          </div>
          <ProductGrid products={favoriteProducts} loading={favorites.loading} skeletonCount={4} columns="md:grid-cols-4" />
        </section>
      )}
    </div>
  );
}
