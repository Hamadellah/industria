import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminHeader({ title, subtitle, onMenu, actions }) {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button onClick={onMenu} className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" aria-label="Ouvrir le menu"><Menu className="h-5 w-5" /></button>
      <div className="min-w-0">
        <h1 className="truncate text-lg font-bold">{title}</h1>
        {subtitle && <p className="hidden truncate text-xs text-ink-soft sm:block">{subtitle}</p>}
      </div>
      <div className="ml-auto flex items-center gap-3">
        {actions}
        <div className="hidden items-center gap-2 sm:flex">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-100 text-sm font-bold text-accent-700">{user?.name?.charAt(0).toUpperCase()}</span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">{user?.name}</p>
            <p className="text-xs text-ink-soft">Administrateur</p>
          </div>
        </div>
      </div>
    </header>
  );
}
