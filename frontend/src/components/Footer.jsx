import { Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCategories } from '../lib/hooks';
import { Logo } from './Navbar';

// Lucide v1 ne fournit plus les logos de marques : icônes SVG simples en ligne.
const svgProps = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
const Instagram = (p) => (<svg {...svgProps} {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></svg>);
const Facebook = (p) => (<svg {...svgProps} {...p}><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z" /></svg>);
const Youtube = (p) => (<svg {...svgProps} {...p}><rect x="2.5" y="5" width="19" height="14" rx="4" /><path d="M10 9l5 3-5 3z" fill="currentColor" /></svg>);

export default function Footer() {
  const categories = useCategories();

  return (
    <footer className="mt-24 bg-ink text-slate-300">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            La boutique en ligne qui réunit mode, high-tech, maison et le meilleur de l'artisanat marocain, livrée chez vous.
          </p>
          <div className="mt-5 flex gap-3">
            {[Instagram, Facebook, Youtube].map((Icon, i) => (
              <a key={i} href="#" onClick={(e) => e.preventDefault()} aria-label="Réseau social" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-accent-600">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-white">Catégories</h3>
          <ul className="space-y-2 text-sm">
            {categories.slice(0, 6).map((c) => (
              <li key={c.id}><Link to={`/categories/${c.id}`} className="hover:text-white">{c.name}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-white">Mon compte</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/profile" className="hover:text-white">Mon profil</Link></li>
            <li><Link to="/my-demandes" className="hover:text-white">Mes demandes</Link></li>
            <li><Link to="/favorites" className="hover:text-white">Mes favoris</Link></li>
            <li><Link to="/cart" className="hover:text-white">Mon panier</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-white">Contact</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" /> 45 boulevard Mohammed V, Casablanca, Maroc</li>
            <li className="flex gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" /> +212 5 22 00 00 00</li>
            <li className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" /> contact@maisonatlas.ma</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Maison Atlas. Tous droits réservés. Les demandes sont traitées sans paiement en ligne.
      </div>
    </footer>
  );
}
