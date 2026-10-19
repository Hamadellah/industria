import { ArrowLeft, MapPin, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartItem from '../components/CartItem';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage, getFieldErrors } from '../lib/api';
import { formatMAD } from '../lib/format';
import { demandeService } from '../services';

export default function Cart() {
  const { user } = useAuth();
  const { cart, cartLoading, updateCartItem, removeCartItem, refreshCart } = useShop();
  const toast = useToast();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const value = address.trim();
    if (value.length < 10) return setError('Indiquez une adresse de livraison complète (au moins 10 caractères).');
    setError('');
    setSubmitting(true);
    try {
      const demandes = await demandeService.create(value);
      await refreshCart();
      toast.success(`Votre demande ${demandes[0]?.reference || ''} a bien été envoyée.`);
      navigate('/my-demandes');
    } catch (err) {
      const fields = getFieldErrors(err);
      setError(fields.address || fields.cart || getErrorMessage(err));
      refreshCart(); // le stock a peut-être changé
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading && cart.data.length === 0) return <LoadingSpinner className="min-h-[50vh]" />;

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Mon panier</h1>
      <p className="mt-1 text-sm text-ink-soft">{user?.name}, vérifiez vos articles avant d'envoyer votre demande.</p>

      {cart.data.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={ShoppingBag} title="Votre panier est vide" description="Parcourez la boutique et ajoutez les produits qui vous plaisent." actionLabel="Découvrir les produits" actionTo="/products" />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="card px-5 sm:px-6">
            <ul className="divide-y divide-slate-100">
              {cart.data.map((item) => (
                <CartItem key={item.id} item={item} onQuantity={updateCartItem} onRemove={removeCartItem} />
              ))}
            </ul>
            <div className="border-t border-slate-100 py-4">
              <Link to="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-accent-700 hover:underline">
                <ArrowLeft className="h-4 w-4" /> Continuer mes achats
              </Link>
            </div>
          </div>

          <form onSubmit={submit} noValidate className="card h-fit space-y-5 p-6 lg:sticky lg:top-36">
            <h2 className="text-lg font-bold">Récapitulatif</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-ink-soft">Articles</dt><dd className="font-medium">{cart.count}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-soft">Livraison</dt><dd className="font-medium">Confirmée après validation</dd></div>
              <div className="flex justify-between border-t border-slate-100 pt-3 text-base"><dt className="font-semibold">Total</dt><dd className="text-xl font-extrabold">{formatMAD(cart.total)}</dd></div>
            </dl>

            <div>
              <label htmlFor="address" className="label flex items-center gap-2"><MapPin className="h-4 w-4 text-accent-600" /> Adresse de livraison</label>
              <textarea
                id="address"
                rows={3}
                maxLength={255}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="N°, rue, quartier, ville, code postal"
                aria-invalid={!!error}
                className={`input resize-none ${error ? 'input-error' : ''}`}
              />
              {error && <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">{error}</p>}
            </div>

            <button className="btn-primary w-full py-3.5 text-base" disabled={submitting}>
              {submitting ? 'Envoi en cours…' : 'Envoyer ma demande'}
            </button>
            <p className="text-center text-xs text-ink-soft">Aucun paiement n'est demandé en ligne. Un administrateur validera votre demande.</p>
          </form>
        </div>
      )}
    </div>
  );
}
