export default function StatsCard({ icon: Icon, label, value, hint, tone = 'emerald' }) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-600',
    sky: 'bg-sky-50 text-sky-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
    rose: 'bg-rose-50 text-rose-600',
  };
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-ink-soft">{label}</p>
        <p className="text-2xl font-bold tracking-tight text-ink">{value}</p>
        {hint && <p className="text-xs text-ink-soft">{hint}</p>}
      </div>
    </div>
  );
}
