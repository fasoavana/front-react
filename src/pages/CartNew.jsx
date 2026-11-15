import { Link } from 'react-router-dom';
import { ArrowRight, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ariary } from '../lib/api';
export default function CartNew() {
  const { items, quantity, remove, total }=useCart();
  return <div className="na-wrap cart-new"><div className="page-title"><small className="na-kicker">VOTRE SÉLECTION</small><h1>Votre <em>panier.</em></h1><p>Les frais de livraison éventuels seront confirmés selon votre destination.</p></div>
    {!items.length ? <div className="empty-state">Votre panier est vide.<div className="space-top"><Link className="na-btn gold" to="/boutique">Découvrir les housses <ArrowRight size={16}/></Link></div></div>
    : <div className="cart-columns"><div className="cart-list">{items.map(x=><article className="cart-item" key={x.key}>
      {x.image && <img src={x.image} alt={x.name}/>}<div><h3>{x.name}</h3><p>{x.phone || 'Accessoire'} · {x.color}</p>{x.artwork_token && <small>Photo personnalisée reçue</small>}
        <div className="qty-actions"><button aria-label="Diminuer" onClick={()=>quantity(x.key,x.quantity-1)}><Minus size={16}/></button><span>{x.quantity}</span><button aria-label="Augmenter" onClick={()=>quantity(x.key,x.quantity+1)}><Plus size={16}/></button>
          <button aria-label="Retirer du panier" onClick={()=>remove(x.key)}><Trash2 size={17}/></button></div></div><strong>{ariary(x.price*x.quantity)}</strong>
    </article>)}</div><aside className="cart-summary"><small className="na-kicker">RÉCAPITULATIF</small><h2>Votre commande</h2><div className="summary-row"><span>Sous-total</span><strong>{ariary(total)}</strong></div>
      <div className="summary-row"><span>Acompte indicatif (Tana)</span><strong>{ariary(Math.ceil(total/2))}</strong></div>
      <div className="summary-row total"><span>Total produits</span><strong>{ariary(total)}</strong></div>
      <p>Antananarivo : 50 % à la confirmation. Province : 100 % avant expédition. Livraison en supplément si applicable.</p>
      <Link className="na-btn gold full" to="/commande">Passer commande <ArrowRight size={18}/></Link></aside></div>}
  </div>;
}
