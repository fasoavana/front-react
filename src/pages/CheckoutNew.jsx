import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { CheckCircle2, ClipboardCopy, LockKeyhole, Smartphone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { api, ariary } from '../lib/api';
export default function CheckoutNew() {
  const { items,total,clear }=useCart();const {config}=useStore();
  const [form,setForm]=useState({customer_name:'',customer_phone:'',customer_email:'',address:'',city:'Antananarivo',zone:'tana',payment_method:'orange',payment_phone:'',transaction_reference:''});
  const [accepted,setAccepted]=useState(false);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [order,setOrder]=useState(null);
  const update=e=>setForm(x=>({...x,[e.target.name]:e.target.value}));
  const required=form.zone==='tana'?Math.ceil(total/2):total;
  const receiver=form.payment_method==='orange'?config?.orange_number:config?.mvola_number;
  async function submit(e){e.preventDefault();if(!accepted)return;
    try {setBusy(true);setError('');const response=await api('/orders/',{method:'POST',auth:true,body:{...form,
      items:items.map(x=>({product_id:x.product_id,variant_id:x.variant_id,quantity:x.quantity,
        color:x.color,...x.artwork_token?{artwork_token:x.artwork_token}:{}}))}});setOrder(response);clear();}
    catch(err){setError(err.message);}finally{setBusy(false);}}
  if(order)return <div className="na-wrap checkout-confirmed"><CheckCircle2 size={57}/><small className="na-kicker">DEMANDE REÇUE</small><h1>Merci pour votre <em>commande.</em></h1>
    <p>Votre commande a été enregistrée sous la référence <strong>{order.reference}</strong>. Le paiement déclaré doit encore être vérifié par New arrivals : la commande n'est pas encore confirmée.</p>
    <div className="confirmed-box"><span>Total : <b>{ariary(order.total)}</b></span><span>Montant requis : <b>{ariary(order.required_payment)}</b></span><span>État : <b>Paiement à vérifier</b></span></div>
    <Link className="na-btn gold" to={`/suivi/${order.tracking_token}`}>Suivre ma commande</Link>
    <p className="muted-note">Conservez votre lien de suivi ; il est personnel et ne doit pas être partagé.</p>
  </div>;
  if(!items.length)return <Navigate to="/panier" replace/>;
  return <div className="na-wrap checkout-new"><div className="page-title"><small className="na-kicker">DERNIÈRE ÉTAPE</small><h1>Confirmer votre <em>sélection.</em></h1><p>Votre paiement sera vérifié manuellement avant validation définitive.</p></div>
    <div className="cart-columns"><form className="checkout-form-new" onSubmit={submit}>
      <h2>Vos coordonnées</h2><div className="form-grid-new">
        <label>Nom complet *<input name="customer_name" value={form.customer_name} onChange={update} required maxLength={130}/></label>
        <label>Téléphone *<input name="customer_phone" type="tel" value={form.customer_phone} onChange={update} required maxLength={30}/></label>
        <label>E-mail (facultatif)<input name="customer_email" type="email" value={form.customer_email} onChange={update}/></label>
        <label>Ville *<input name="city" value={form.city} onChange={update} required/></label>
        <label>Zone de livraison *<select name="zone" value={form.zone} onChange={update}><option value="tana">Antananarivo</option><option value="province">Province</option></select></label>
        <label className="wide">Adresse / point de livraison *<textarea name="address" value={form.address} onChange={update} required rows={3}/></label>
      </div><h2>Votre paiement Mobile Money</h2><p>Choisissez votre moyen de paiement et effectuez le transfert depuis votre téléphone.</p>
      <div className="payment-methods"><label className={form.payment_method==='orange'?'selected':''}><input type="radio" name="payment_method" value="orange" checked={form.payment_method==='orange'} onChange={update}/>Orange Money</label>
      <label className={form.payment_method==='mvola'?'selected':''}><input type="radio" name="payment_method" value="mvola" checked={form.payment_method==='mvola'} onChange={update}/>MVola</label></div>
      <div className="payment-instructions"><Smartphone size={24}/><div><span>Envoyer à</span><strong>{receiver || 'Numéro en cours de chargement'}</strong><small>Montant demandé : {ariary(required)}</small></div></div>
      <div className="form-grid-new"><label>Téléphone utilisé pour payer<input name="payment_phone" type="tel" value={form.payment_phone} onChange={update}/></label>
      <label>Référence de transaction *<input name="transaction_reference" value={form.transaction_reference} onChange={update} required placeholder="Référence reçue après le transfert"/></label></div>
      <p className="muted-note">Une référence saisie ne prouve pas que le transfert a été reçu. Nous vérifions chaque paiement avant de lancer la commande. Livraison en province : paiement intégral requis avant l'envoi.</p>
      <label className="consent"><input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)} required/>J’accepte les <Link to="/informations/conditions" target="_blank">conditions de vente</Link>, notamment le délai indicatif de 9 à 15 jours après confirmation du paiement.</label>
      {error && <p className="alert" role="alert">{error}</p>}
      <button type="submit" className="na-btn gold full" disabled={busy||!accepted}>{busy?'Enregistrement…':'Envoyer ma commande'} <LockKeyhole size={17}/></button>
    </form><aside className="cart-summary"><small className="na-kicker">RÉCAPITULATIF</small><h2>Votre commande</h2>{items.map(x=><div className="mini-line" key={x.key}><img src={x.image} alt=""/><div><b>{x.name}</b><small>{x.phone}</small><small>× {x.quantity}</small></div><strong>{ariary(x.price*x.quantity)}</strong></div>)}
    <div className="summary-row total"><span>Total produits</span><strong>{ariary(total)}</strong></div><div className="summary-row highlighted"><span>À payer maintenant</span><strong>{ariary(required)}</strong></div>
    <small>Frais de livraison éventuels confirmés séparément. Solde à la réception à Tana.</small></aside></div>
  </div>;
}
