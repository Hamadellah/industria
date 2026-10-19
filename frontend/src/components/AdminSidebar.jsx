import { LayoutDashboard, LogOut, Package, Store, Tags, Users, ClipboardList, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Logo } from './Navbar';

const LINKS = [
  { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Produits', icon: Package },
  { to: '/admin/categories', label: 'Catégories', icon: Tags },
  { to: '/admin/demandes', label: 'Demandes', icon: ClipboardList },
  { to: '/admin/users', label: 'Utilisateurs', icon: Users },
];

export default function AdminSidebar({ open, onClose, onLogout }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-ink/50 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-ink text-slate-300 transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navigation administrateur"
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Logo light />
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-white/10 lg:hidden" aria-label="Fermer le menu"><X className="h-5 w-5" /></button>
        </div>
        <p className="px-5 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Administration</p>
        <nav className="flex-1 space-y-1 px-3">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-accent-600 text-white' : 'hover:bg-white/10 hover:text-white'}`
              }
            >
              <Icon className="h-[18px] w-[18px]" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-1 border-t border-white/10 p-3">
          <NavLink to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-white/10 hover:text-white">
            <Store className="h-[18px] w-[18px]" /> Voir la boutique
          </NavLink>
          <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-white/10 hover:text-white">
            <LogOut className="h-[18px] w-[18px]" /> Se déconnecter
          </button>
        </div>
      </aside>
    </>
  );
}
