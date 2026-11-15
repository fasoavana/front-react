import { Link } from 'react-router-dom';
import { X,Trash2,ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ariary } from '../lib/api';
export default function CartDrawer(){const {items,remove,total,drawerOpen,setDrawerOpen}=useCart();
  if(!drawerOpen)return null;
  return <div className="na-drawer-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setDrawerOpen(false)}}>
    <aside className="na-drawer" role="dialog" aria-modal="true" aria-label="Panier" aria-labelledby="drawer-title">
      <header><h2 id="drawer-title"><ShoppingBag/> Votre panier</h2><button className="na-icon" onClick={()=>setDrawerOpen(false)} aria-label="Fermer le panier"><X/></button></header>
      <div className="na-drawer-list">{items.length===0?<p>Votre panier est vide.</p>:items.map(item=><div className="na-drawer-item" key={item.key}>
        {item.image&&<img src={item.image} alt=""/>}<div><b>{item.name}</b><small>{item.phone} · ×{item.quantity}</small><strong>{ariary(item.price*item.quantity)}</strong></div>
        <button aria-label={'Retirer '+item.name} onClick={()=>remove(item.key)}><Trash2 size={17}/></button></div>)}</div>
      <footer><strong>Total : {ariary(total)}</strong><Link onClick={()=>setDrawerOpen(false)} className="na-btn gold full" to={items.length?'/commande':'/boutique'}>{items.length?'Passer commande':'Découvrir les produits'}</Link></footer>
    </aside>
  </div>
}
