import { ChevronLeft, ChevronRight } from 'lucide-react';

function pageWindow(current, last) {
  const pages = new Set([1, last, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('…' + p);
    out.push(p);
  });
  return out;
}

/** `meta` est l'objet de pagination renvoyé par Laravel (current_page, last_page, total). */
export default function Pagination({ meta, onChange }) {
  if (!meta || meta.last_page <= 1) return null;
  const { current_page: current, last_page: last } = meta;

  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        className="btn-ghost btn-sm"
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
        aria-label="Page précédente"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pageWindow(current, last).map((p) =>
        typeof p === 'string' ? (
          <span key={p} className="px-1 text-slate-400">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === current ? 'page' : undefined}
            className={`h-9 min-w-9 rounded-lg px-3 text-sm font-semibold ${
              p === current ? 'bg-ink text-white' : 'text-ink-soft hover:bg-slate-100'
            }`}
          >
            {p}
          </button>
        ),
      )}
      <button
        className="btn-ghost btn-sm"
        disabled={current === last}
        onClick={() => onChange(current + 1)}
        aria-label="Page suivante"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
