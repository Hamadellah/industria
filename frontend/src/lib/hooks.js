import { useCallback, useEffect, useRef, useState } from 'react';
import { categoryService } from '../services';

/** Charge des données asynchrones avec états loading/error et possibilité de recharger. */
export function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcherRef
      .current()
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((error) => active && setState({ data: null, loading: false, error }));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    const cancel = run();
    return () => cancel();
  }, [run]);

  return { ...state, reload: run };
}

let categoriesCache = null;

export function invalidateCategories() {
  categoriesCache = null;
}

export function useCategories() {
  const [categories, setCategories] = useState(categoriesCache || []);

  useEffect(() => {
    if (categoriesCache) return;
    categoryService.list().then((list) => {
      categoriesCache = list;
      setCategories(list);
    }).catch(() => {});
  }, []);

  return categories;
}

export function useDebounced(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
