import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

/** Modale générique. Sans `onConfirm`, elle sert de conteneur (formulaires) via `children`. */
export default function ConfirmationModal({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  danger = false,
  loading = false,
  onConfirm,
  onClose,
  children,
  size = 'max-w-md',
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`toast-in relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-lift sm:rounded-2xl ${size}`}>
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-ink" aria-label="Fermer">
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-start gap-3">
          {danger && (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </span>
          )}
          <div className="min-w-0 flex-1 pr-6">
            <h2 className="text-lg font-bold text-ink">{title}</h2>
            {message && <p className="mt-1 text-sm text-ink-soft">{message}</p>}
          </div>
        </div>
        {children && <div className="mt-5">{children}</div>}
        {onConfirm && (
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button className="btn-outline" onClick={onClose} disabled={loading}>
              {cancelLabel}
            </button>
            <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm} disabled={loading}>
              {loading ? 'Veuillez patienter…' : confirmLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
