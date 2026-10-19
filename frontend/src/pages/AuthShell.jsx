import { Logo } from '../components/Navbar';

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="container-page grid min-h-[70vh] items-center gap-10 py-12 lg:grid-cols-2">
      <div className="hidden lg:block">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink to-slate-700 p-12 text-white">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent-600/40 blur-3xl" />
          <Logo light />
          <h2 className="relative mt-16 text-4xl font-extrabold leading-tight">Le meilleur du Maroc, à portée de clic.</h2>
          <ul className="relative mt-8 space-y-3 text-slate-200">
            <li>✓ Favoris et panier synchronisés sur tous vos appareils</li>
            <li>✓ Suivi de vos demandes en temps réel</li>
            <li>✓ Aucun paiement en ligne requis</li>
          </ul>
        </div>
      </div>
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>
        <div className="card mt-8 p-6 sm:p-8">{children}</div>
        <div className="mt-6 text-center text-sm text-ink-soft">{footer}</div>
      </div>
    </div>
  );
}
