import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const STYLES = {
  success: { icon: CheckCircle2, className: 'text-emerald-600' },
  error: { icon: AlertCircle, className: 'text-red-600' },
  info: { icon: Info, className: 'text-sky-600' },
};

export default function ToastNotifications({ toasts, onDismiss }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const { icon: Icon, className } = STYLES[t.type] || STYLES.info;
        return (
          <div
            key={t.id}
            role={t.type === 'error' ? 'alert' : 'status'}
            className="toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lift"
          >
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${className}`} aria-hidden />
            <p className="flex-1 text-sm font-medium text-ink">{t.message}</p>
            <button onClick={() => onDismiss(t.id)} className="text-slate-400 hover:text-ink" aria-label="Fermer la notification">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
