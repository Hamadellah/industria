import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function SearchBar({ className = '', autoFocus = false, onSubmitted }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [value, setValue] = useState(params.get('q') || '');

  useEffect(() => {
    setValue(params.get('q') || '');
  }, [params]);

  const submit = (e) => {
    e.preventDefault();
    const q = value.trim();
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : '/products');
    onSubmitted?.();
  };

  return (
    <form onSubmit={submit} role="search" className={`relative ${className}`}>
      <label htmlFor="site-search" className="sr-only">Rechercher un produit</label>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
      <input
        id="site-search"
        type="search"
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Rechercher un produit…"
        className="input rounded-full bg-slate-100 pl-11 pr-4 hover:bg-white focus:bg-white"
      />
    </form>
  );
}
