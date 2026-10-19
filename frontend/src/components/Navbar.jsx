import { ChevronDown, Heart, LayoutDashboard, LogOut, Menu, Package, Search, ShoppingBag, User, Wrench, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { useToast } from '../context/ToastContext';
import { useCategories } from '../lib/hooks';
import SearchBar from './SearchBar';

export function Logo({ light = false }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="INDUSTRIA — accueil">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#052B75] text-white shadow-sm">
        <Wrench className="h-5 w-5 text-sky-400" />
      </span>
      <div className="flex flex-col">
        <span className={`text-xl font-black tracking-wider uppercase leading-none ${light ? 'text-white' : 'text-[#052B75]'}`}>
          INDUSTRIA
        </span>
        <span className="text-[10px] font-semibold tracking-widest text-sky-600 uppercase">
          Équipement & Matériel
        </span>
      </div>
    </Link>
  );
}

function IconLink({ to, label, count, children }) {
  return (
    <Link to={to} className="relative rounded-full p-2.5 text-slate-700 hover:bg-slate-100 transition-colors" aria-label={label}>
      {children}
      {count > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#0279B6] px-1 text-[10px] font-bold text-white shadow-sm">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { cart, favoriteIds } = useShop();
  const categories = useCategories();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const close = (e) => accountRef.current && !accountRef.current.contains(e.target) && setAccountOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Vous êtes déconnecté.');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
      {/* Top Banner Informative */}
      <div className="bg-[#031B4E] px-4 py-2 text-center text-xs font-semibold text-slate-200 tracking-wide">
        Livraison partout au Maroc · Matériel & Équipement Professionnel Certifié · Service Client 7j/7
      </div>

      <div className="container-page flex h-16 items-center gap-3 sm:gap-6">
        <button 
          className="rounded-full p-2 hover:bg-slate-100 lg:hidden text-slate-700" 
          onClick={() => setMenuOpen((o) => !o)} 
          aria-label="Menu" 
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Logo />

        <SearchBar className="hidden max-w-xl flex-1 md:block" />

        <div className="ml-auto flex items-center gap-1.5">
          <IconLink to="/favorites" label="Favoris" count={favoriteIds?.size || 0}>
            <Heart className="h-5 w-5" />
          </IconLink>
          <IconLink to="/cart" label="Panier" count={cart?.count || 0}>
            <ShoppingBag className="h-5 w-5" />
          </IconLink>

          {user ? (
            <div className="relative" ref={accountRef}>
              <button
                onClick={() => setAccountOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-2 hover:bg-slate-100 transition-colors"
                aria-haspopup="menu"
                aria-expanded={accountOpen}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-[#052B75]">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-[110px] truncate text-sm font-bold text-slate-800 sm:block">
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
              </button>

              {accountOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl">
                  <div className="border-b border-slate-100 px-4 pb-3 pt-1">
                    <p className="truncate text-sm font-bold text-slate-900">{user.name}</p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                  </div>
                  <MenuLink to="/profile" icon={User}>Mon profil</MenuLink>
                  <MenuLink to="/my-demandes" icon={Package}>Mes demandes</MenuLink>
                  <MenuLink to="/favorites" icon={Heart}>Mes favoris</MenuLink>
                  {isAdmin && <MenuLink to="/admin" icon={LayoutDashboard}>Espace administrateur</MenuLink>}
                  <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut className="h-4 w-4" /> Se déconnecter
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-1">
              <Link to="/login" className="hidden sm:inline-flex rounded-lg px-4 py-2 text-sm font-bold text-[#052B75] hover:bg-slate-100 transition">
                Connexion
              </Link>
              <Link to="/register" className="inline-flex rounded-lg bg-[#052B75] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#031B4E] transition">
                Créer un compte
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Categories Navigation Bar */}
      <nav className="hidden border-t border-slate-100 bg-slate-50/80 lg:block" aria-label="Catégories">
        <div className="container-page flex items-center gap-1 overflow-x-auto py-2">
          <NavLink 
            to="/products" 
            end 
            className={({ isActive }) => `whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-bold transition-colors ${isActive ? 'bg-[#052B75] text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200/60'}`}
          >
            Toutes les catégories
          </NavLink>
          {categories.map((c) => (
            <NavLink 
              key={c.id} 
              to={`/categories/${c.id}`} 
              className={({ isActive }) => `whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${isActive ? 'bg-[#052B75] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'}`}
            >
              {c.name}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div className="border-t border-slate-100 bg-white px-4 pb-5 pt-3 lg:hidden">
          <SearchBar className="mb-3 md:hidden" onSubmitted={() => setMenuOpen(false)} />
          <p className="mb-2 flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Search className="h-3.5 w-3.5" /> Catégories & Produits
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <Link to="/products" className="rounded-lg px-3 py-2 text-sm font-bold text-[#052B75] hover:bg-slate-100">
              Toutes les catégories
            </Link>
            {categories.map((c) => (
              <Link key={c.id} to={`/categories/${c.id}`} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function MenuLink({ to, icon: Icon, children }) {
  return (
    <Link to={to} role="menuitem" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
      <Icon className="h-4 w-4 text-slate-400" /> {children}
    </Link>
  );
}