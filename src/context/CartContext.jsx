import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';
const CartContext = createContext(null);
const KEY = 'new-arrivals-cart-v1';
const initial = () => { try { const data = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(data) ? data : []; } catch { return []; } };
export function CartProvider({ children }) {
  const [items, setItems] = useState(initial);
  const [notice, setNotice] = useState('');
  const [drawerOpen,setDrawerOpen]=useState(false);
  const {me}=useAuth(); const mergedFor=useRef(null);const ready=useRef(false);
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify(items));},[items]);
  useEffect(()=>{
    if(!me){if(mergedFor.current!==null)setItems([]);mergedFor.current=null;ready.current=false;return}
    if(mergedFor.current===me.id)return;
    mergedFor.current=me.id;
    let cancelled=false;ready.current=false;
    api('/cart/',{auth:true}).then(server=>{if(cancelled)return;
      setItems(local=>{const merged=[...server];for(const item of local){const found=merged.find(x=>x.key===item.key);
        if(found)found.quantity=Math.max(Number(found.quantity),Number(item.quantity));else merged.push(item)}
        return merged;});ready.current=true;
    }).catch(()=>{ready.current=true});
    return()=>{cancelled=true}
  },[me?.id]);
  useEffect(()=>{if(!me||!ready.current)return;
    const timer=setTimeout(()=>{api('/cart/',{method:'PUT',auth:true,body:{items}}).catch(()=>{})},650);
    return()=>clearTimeout(timer);
  },[items,me?.id]);
  function add(product, variant, quantity = 1, artwork_token = null) {
    if (!variant && product.kind !== 'accessoire') throw new Error('Choisissez un modèle compatible.');
    if (product.customizable && !artwork_token) throw new Error('Ajoutez votre photo pour personnaliser cette housse.');
    const cartLine = { key: `${product.id}-${variant?.id || 'none'}-${artwork_token || 'base'}`, product_id: product.id,
      variant_id: variant?.id || null, name: product.name, price: product.price, image: product.cover_url,
      phone: variant?.phone_model_name || '', color: variant?.color || '', quantity: Math.min(20, Number(quantity)), artwork_token };
    setItems(old => { const match = old.find(item => item.key === cartLine.key); if (!match) return [...old, cartLine];
      return old.map(x => x.key === cartLine.key ? { ...x, quantity: Math.min(20, x.quantity + cartLine.quantity) } : x); });
    setNotice('Produit ajouté au panier.'); setTimeout(() => setNotice(''), 3000);
  }
  const remove = key => setItems(old => old.filter(item => item.key !== key));
  const quantity = (key, value) => setItems(old => old.map(item => item.key === key ? { ...item, quantity: Math.max(1, Math.min(20, Number(value))) } : item));
  const clear = () => setItems([]);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return <CartContext.Provider value={{ items, add, remove, quantity, clear, total, count, notice, setNotice, drawerOpen, setDrawerOpen }}>{children}</CartContext.Provider>;
}
export function useCart() { const c = useContext(CartContext); if (!c) throw new Error('CartProvider requis'); return c; }
