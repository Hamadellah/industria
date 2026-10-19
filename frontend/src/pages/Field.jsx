export default function Field({ id, label, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {error ? <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">{error}</p> : hint ? <p className="mt-1.5 text-xs text-ink-soft">{hint}</p> : null}
    </div>
  );
}
