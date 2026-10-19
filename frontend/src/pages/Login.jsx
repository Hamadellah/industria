import { LogIn } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage, getFieldErrors } from '../lib/api';
import { EMAIL_RE } from '../lib/format';
import AuthShell from './AuthShell';
import Field from './Field';

export default function Login() {
  const { user, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={user.role === 'admin' && !from ? '/admin' : from || '/'} replace />;

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!values.email.trim()) next.email = "L'adresse e-mail est obligatoire.";
    else if (!EMAIL_RE.test(values.email.trim())) next.email = "Cette adresse e-mail n'est pas valide.";
    if (!values.password) next.password = 'Le mot de passe est obligatoire.';
    return next;
  };

  const submit = async (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      const u = await login({ email: values.email.trim(), password: values.password });
      toast.success(`Bienvenue ${u.name.split(' ')[0]} !`);
      navigate(from || (u.role === 'admin' ? '/admin' : '/'), { replace: true });
    } catch (err) {
      const fields = getFieldErrors(err);
      setErrors(Object.keys(fields).length ? fields : { form: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Content de vous revoir"
      subtitle="Connectez-vous pour retrouver votre panier, vos favoris et vos demandes."
      footer={<>Pas encore de compte ? <Link to="/register" state={{ from }} className="font-semibold text-accent-700 hover:underline">Créer un compte</Link></>}
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        {errors.form && <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700" role="alert">{errors.form}</p>}
        <Field id="email" label="Adresse e-mail" error={errors.email}>
          <input id="email" type="email" autoComplete="email" value={values.email} onChange={set('email')} placeholder="vous@exemple.ma" className={`input ${errors.email ? 'input-error' : ''}`} aria-invalid={!!errors.email} />
        </Field>
        <Field id="password" label="Mot de passe" error={errors.password}>
          <input id="password" type="password" autoComplete="current-password" value={values.password} onChange={set('password')} placeholder="••••••••" className={`input ${errors.password ? 'input-error' : ''}`} aria-invalid={!!errors.password} />
        </Field>
        <button className="btn-primary w-full py-3" disabled={submitting}>
          <LogIn className="h-4 w-4" /> {submitting ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </AuthShell>
  );
}
