import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
const StoreContext = createContext(null);
export function StoreProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [phones, setPhones] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reload = useCallback(async () => {
    try {
      setError('');
      const [p, c, m, s] = await Promise.all([api('/products/?page_size=100&price_confirmed=true'), api('/categories/'), api('/phone-models/'), api('/site-config/')]);
      setProducts(p.results || p);
      setCategories(c.results || c);
      setPhones(m.results || m);
      setConfig(s);
    } catch (e) { setError(`Impossible de charger le catalogue : ${e.message}`); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { reload(); }, [reload]);
  return <StoreContext.Provider value={{ products, categories, phones, config, loading, error, reload }}>{children}</StoreContext.Provider>;
}
export function useStore() { const c = useContext(StoreContext); if (!c) throw new Error('StoreProvider requis'); return c; }
