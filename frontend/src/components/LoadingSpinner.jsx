export default function LoadingSpinner({ label = 'Chargement…', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-16 text-ink-soft ${className}`} role="status">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-accent-600" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
