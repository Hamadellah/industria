import { STATUS } from '../lib/format';

export default function StatusBadge({ status }) {
  const s = STATUS[status] || { label: status, className: 'bg-slate-100 text-slate-700 ring-slate-200' };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${s.className}`}>
      {s.label}
    </span>
  );
}
