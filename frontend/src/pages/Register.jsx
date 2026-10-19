import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage, getFieldErrors } from '../lib/api';
import { EMAIL_RE, PHONE_RE } from '../lib/format';
import AuthShell from './AuthShell';
import Field from './Field';

export default function Register() {
  const { user, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const from = useLocation().state?.from;

  const [values, setValues] = useState({ name: '', email: '', phone: '', password: '', password_confirmation: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={from || '/'} replace />;

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!values.name.trim()) next.name = 'Le nom est obligatoire.';
    if (!values.email.trim()) next.email = "L'adresse e-mail est obligatoire.";
    else if (!EMAIL_RE.test(values.email.trim())) next.email = "Cette adresse e-mail n'est pas valide.";
    if (values.phone && !PHONE_RE.test(values.phone)) next.phone = 'Numéro de téléphone invalide.';
    if (values.password.length < 8) next.password = 'Le mot de passe doit contenir au moins 8 caractères.';
    else if (!/[A-Za-z]/.test(values.password) || !/\d/.test(values.password)) next.password = 'Utilisez au moins une lettre et un chiffre.';
    if (values.password_confirmation !== values.password) next.password_confirmation = 'Les mots de passe ne correspondent pas.';
    return next;
  };

  const submit = async (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      const payload = { ...values, name: values.name.trim(), email: values.email.trim(), phone: values.phone.trim() || null };
      const u = await register(payload);
      toast.success(`Bienvenue ${u.name.split(' ')[0]}, votre compte est créé !`);
      navigate(from || '/', { replace: true });
    } catch (err) {
      const fields = getFieldErrors(err);
      setErrors(Object.keys(fields).length ? fields : { form: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const input = (id, props = {}) => ({
    id,
    value: values[id],
    onChange: set(id),
    className: `input ${errors[id] ? 'input-error' : ''}`,
    'aria-invalid': !!errors[id],
    ...props,
  });

  return (
    <AuthShell
      title="Créer votre compte"
      subtitle="Rejoignez Maison Atlas en moins d'une minute."
      footer={<>Déjà inscrit ? <Link to="/login" state={{ from }} className="font-semibold text-accent-700 hover:underline">Se connecter</Link></>}
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        {errors.form && <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700" role="alert">{errors.form}</p>}
        <Field id="name" label="Nom complet" error={errors.name}><input {...input('name', { autoComplete: 'name', placeholder: 'Yasmine El Idrissi' })} /></Field>
        <Field id="email" label="Adresse e-mail" error={errors.email}><input {...input('email', { type: 'email', autoComplete: 'email', placeholder: 'vous@exemple.ma' })} /></Field>
        <Field id="phone" label="Téléphone (optionnel)" error={errors.phone}><input {...input('phone', { type: 'tel', autoComplete: 'tel', placeholder: '06 12 34 56 78' })} /></Field>
        <Field id="password" label="Mot de passe" error={errors.password} hint="8 caractères minimum, avec lettres et chiffres.">
          <input {...input('password', { type: 'password', autoComplete: 'new-password' })} />
        </Field>
        <Field id="password_confirmation" label="Confirmer le mot de passe" error={errors.password_confirmation}>
          <input {...input('password_confirmation', { type: 'password', autoComplete: 'new-password' })} />
        </Field>
        <button className="btn-primary w-full py-3" disabled={submitting}>
          <UserPlus className="h-4 w-4" /> {submitting ? 'Création…' : 'Créer mon compte'}
        </button>
      </form>
    </AuthShell>
  );
}
