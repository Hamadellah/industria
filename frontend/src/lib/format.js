const mad = new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 2, minimumFractionDigits: 0 });

export const formatMAD = (value) => mad.format(Number(value) || 0).replace(/ /g, ' ');

export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const STATUS = {
  en_attente: { label: 'En attente', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  validee: { label: 'Validée', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  rejetee: { label: 'Rejetée', className: 'bg-red-50 text-red-700 ring-red-200' },
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_RE = /^[0-9+\s().-]{6,30}$/;
