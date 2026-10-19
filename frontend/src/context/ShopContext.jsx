import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../lib/api';
import { cartService, favoriService } from '../services';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const ShopContext = createContext(null);
const EMPTY_CART = { data: [], count: 0, total: 0 };

/** Panier et favoris de l'utilisateur connecté — persistés en base de données via l'API. */
export function ShopProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [cart, setCart] = useState(EMPTY_CART);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const [cartLoading, setCartLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setCart(EMPTY_CART);
      setFavoriteIds(new Set());
      return;
    }
    let active = true;
    setCartLoading(true);
    Promise.all([cartService.get(), favoriService.ids()])
      .then(([c, ids]) => {
        if (!active) return;
        setCart(c);
        setFavoriteIds(new Set(ids));
      })
      .catch(() => {})
      .finally(() => active && setCartLoading(false));
    return () => {
      active = false;
    };
  }, [user]);

  const requireAuth = useCallback(
    (message = 'Connectez-vous pour continuer.') => {
      if (user) return true;
      toast.info(message);
      navigate('/login', { state: { from: location.pathname + location.search } });
      return false;
    },
    [user, toast, navigate, location],
  );

  const addToCart = useCallback(
    async (productId, quantity = 1) => {
      if (!requireAuth('Connectez-vous pour ajouter des articles au panier.')) return false;
      try {
        setCart(await cartService.add(productId, quantity));
        toast.success('Produit ajouté au panier.');
        return true;
      } catch (e) {
        toast.error(getErrorMessage(e));
        return false;
      }
    },
    [requireAuth, toast],
  );

  const updateCartItem = useCallback(
    async (id, quantity) => {
      try {
        setCart(await cartService.update(id, quantity));
      } catch (e) {
        toast.error(getErrorMessage(e));
      }
    },
    [toast],
  );

  const removeCartItem = useCallback(
    async (id) => {
      try {
        setCart(await cartService.remove(id));
        toast.info('Article retiré du panier.');
      } catch (e) {
        toast.error(getErrorMessage(e));
      }
    },
    [toast],
  );

  const refreshCart = useCallback(async () => {
    try {
      setCart(await cartService.get());
    } catch {
      /* ignoré */
    }
  }, []);

  const toggleFavorite = useCallback(
    async (productId) => {
      if (!requireAuth('Connectez-vous pour gérer vos favoris.')) return;
      const isFav = favoriteIds.has(productId);
      // Mise à jour optimiste, annulée en cas d'erreur.
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        isFav ? next.delete(productId) : next.add(productId);
        return next;
      });
      try {
        isFav ? await favoriService.remove(productId) : await favoriService.add(productId);
        toast.success(isFav ? 'Retiré des favoris.' : 'Ajouté aux favoris.');
      } catch (e) {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          isFav ? next.add(productId) : next.delete(productId);
          return next;
        });
        toast.error(getErrorMessage(e));
      }
    },
    [requireAuth, favoriteIds, toast],
  );

  const value = useMemo(
    () => ({ cart, cartLoading, favoriteIds, addToCart, updateCartItem, removeCartItem, refreshCart, toggleFavorite }),
    [cart, cartLoading, favoriteIds, addToCart, updateCartItem, removeCartItem, refreshCart, toggleFavorite],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export const useShop = () => useContext(ShopContext);
