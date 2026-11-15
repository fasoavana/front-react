import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ClipboardList, Download, LogOut, Package, Plus, RefreshCw, Settings, ShoppingBag, TrendingUp } from 'lucide-react';
import { api, ariary, getAccessToken, login, logout, statuses } from '../lib/api';
import { useStore } from '../context/StoreContext';
import Skeleton from '../ui/Skeleton';
import {AdminProductEditor,AdminContent,AdminCustomers,AdminStock,AdminSalesGraph} from '../ui/AdminExtras';
const paymentLabels={en_attente:'En attente',declare:'Déclaré / non vérifié',verifie:'Vérifié',rejete:'Rejeté'};
const btn=(text,onClick,disabled=false)=> <button type="button" className="na-btn outline small" onClick={onClick} disabled={disabled}>{text}</button>;
export default function AdminNew() {
  const { products, categories, reload, config } = useStore();
  const [authLoading,setAuthLoading]=useState(Boolean(getAccessToken()));
  const [me,setMe]=useState(null),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[tab,setTab]=useState('overview');
  const [orders,setOrders]=useState([]),[stats,setStats]=useState(null),[err,setErr]=useState(''),[info,setInfo]=useState(''),[busy,setBusy]=useState(false);
  const [paymentEdit,setPaymentEdit]=useState({}),[orderStatus,setOrderStatus]=useState({});
  const [sale,setSale]=useState({customer_name:'',customer_phone:'',address:'',city:'Antananarivo',zone:'tana',payment_method:'orange',transaction_reference:'',paid_amount:0,notes:''});
  const [saleRows,setSaleRows]=useState([{product_id:'',variant_id:'',quantity:1,negotiated_unit_price:''}]);
  const [productDraft,setProductDraft]=useState({name:'',slug:'',price:35000,kind:'simple',category:''});
  const [localConfig,setLocalConfig]=useState(null);
  const load = useCallback(async () => {
    try {const user=await api('/auth/me/',{auth:true});if(!user.is_staff){setErr('Ce compte n’a pas les droits administrateur.');return;}
      setMe(user);const [o,s]=await Promise.all([api('/orders/',{auth:true}),api('/admin/dashboard/',{auth:true})]);setOrders(o.results||o);setStats(s);
    }catch(e){if(getAccessToken())setErr(e.message);}finally{setAuthLoading(false)}
  },[]);
  useEffect(()=>{if(getAccessToken())void load();},[load]);
  useEffect(()=>{if(config)setLocalConfig(config);},[config]);
  const errorAction=async (run)=>{try{setBusy(true);setErr('');setInfo('');await run();}catch(e){setErr(e.message)}finally{setBusy(false)}};
  const signin=e=>{e.preventDefault();void errorAction(async()=>{const user=await login(email,password);if(!user.is_staff)throw new Error('Compte administrateur requis.');await load();});};
  const modifyOrder=(id,payload)=>void errorAction(async()=>{await api(`/orders/${id}/manage/`,{auth:true,method:'PATCH',body:payload});setInfo('Commande mise à jour.');await load();});
  const updateRow=(i,field,value)=>setSaleRows(x=>x.map((r,j)=>i===j?{...r,[field]:value,...(field==='product_id'?{variant_id:''}:{})}:r));
  const submitSale=e=>{e.preventDefault();void errorAction(async()=>{
    const rows=saleRows.map(x=>({product_id:Number(x.product_id), variant_id:x.variant_id?Number(x.variant_id):null,
      quantity:Number(x.quantity),...x.negotiated_unit_price?{negotiated_unit_price:Number(x.negotiated_unit_price)}:{}}));
    const result=await api('/orders/',{method:'POST',auth:true,body:{...sale,source:'facebook',items:rows}});
    setInfo(`Vente Facebook enregistrée : ${result.reference}. Paiement à vérifier.`);await load();
  });};
  const patchProduct=(p,field,value)=>void errorAction(async()=>{await api(`/products/${p.slug}/`,{method:'PATCH',auth:true,body:{[field]:value}});setInfo('Produit mis à jour');await reload();});
  const createProduct=e=>{e.preventDefault();void errorAction(async()=>{
    await api('/products/',{method:'POST',auth:true,body:{...productDraft,price:Number(productDraft.price),category:Number(productDraft.category),on_order:true,active:false}});
    setInfo('Produit créé en brouillon. Ajoutez ses images et variantes via « Éditeur photos ».');await reload();
  });};
  if(authLoading&&!me)return <div className="na-wrap admin-login"><Skeleton variant="dashboard"/></div>;
  if(!me)return <div className="na-wrap admin-login"><div className="admin-login-box"><small className="na-kicker">ACCÈS RÉSERVÉ</small><h1>Administration <em>NEW ARRIVALS</em></h1><p>Connectez-vous avec un compte administrateur Django.</p>
    <form onSubmit={signin}><label>E-mail administrateur<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Mot de passe<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label>
      {err && <p className="alert">{err}</p>}<button type="submit" className="na-btn gold full" disabled={busy}>Se connecter <ArrowRight size={16}/></button></form></div></div>;
  return <div className="na-wrap admin-page">
    <div className="admin-heading"><div><small className="na-kicker">BACK OFFICE / NEW ARRIVALS</small><h1>Gestion <em>unifiée.</em></h1><p>Ventes du site et ventes Facebook au même endroit.</p></div><button type="button" onClick={()=>{logout();setMe(null);setErr('')}} className="na-btn outline small"><LogOut size={16}/> Déconnexion</button></div>
    <div className="admin-tabs">{[['overview','Tableau de bord',TrendingUp],['orders','Commandes',ClipboardList],['facebook','Vente Facebook',Plus],['products','Produits',Package],['catalogue','Éditeur photos',Package],['content','Bannières & avis',Settings],['customers','Clients',ShoppingBag],['stock','Stocks',TrendingUp],['settings','Configuration',Settings]].map(([id,label,Icon])=><button type="button" key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}><Icon size={17}/>{label}</button>)}</div>
    {err&&<p className="alert" role="alert">{err}</p>}{info&&<p className="success-message"><Check size={16}/>{info}</p>}
    {tab==='overview' && <><div className="kpi-grid"><div><small>Ventes confirmées aujourd'hui</small><strong>{ariary(stats?.day?.total)}</strong><span>{stats?.day?.count||0} commande(s)</span></div>
      <div><small>Ventes confirmées sur 7 jours</small><strong>{ariary(stats?.week?.total)}</strong><span>Dont encaissements vérifiés : {ariary(stats?.week?.paid)}</span></div>
      <div><small>Ventes confirmées sur 30 jours</small><strong>{ariary(stats?.month?.total)}</strong><span>{stats?.month?.count||0} commande(s)</span></div>
      <div><small>Paiements à traiter</small><strong>{stats?.pending_payment??'—'}</strong><span>Contrôle manuel nécessaire</span></div></div>
      <AdminSalesGraph stats={stats}/><div className="admin-box"><div className="admin-box-heading"><h2>Commandes par canal</h2>{btn(<><RefreshCw size={16}/> Actualiser</>,load)}</div>
      <div className="channel-bars">{stats?.by_source?.map(x=><div key={x.source}><span>{x.source==='facebook'?'Facebook':'Site web'}</span><b>{x.count}</b><div><span style={{width:`${100*x.count/Math.max(1,stats.by_source.reduce((a,x)=>a+x.count,0))}%`}}/></div></div>)}</div></div></>}
    {tab==='orders' && <div className="admin-box"><div className="admin-box-heading"><h2>Toutes les commandes</h2><div>{btn('Actualiser',load)} <button type="button" className="na-btn outline small" onClick={async()=>{
        try {const r=await fetch('/api/v1/orders/export-csv/',{headers:{Authorization:`Bearer ${getAccessToken()}`}});if(!r.ok)throw new Error('Export refusé');const b=await r.blob();const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='commandes_new_arrivals.csv';a.click();URL.revokeObjectURL(u)}catch(e){setErr(e.message)}
      }}><Download size={16}/> CSV</button></div></div>
      <div className="table-scroll"><table className="admin-table"><thead><tr><th>Réf / Canal</th><th>Client</th><th>Montant</th><th>Paiement</th><th>Commande</th><th>Action</th></tr></thead><tbody>
        {orders.map(o=><tr key={o.reference}><td><b>{o.reference}</b><small>{o.source==='facebook'?'Facebook':'Site web'}</small></td><td>{o.customer_name}<small>{o.customer_phone} · {o.city}</small></td>
          <td>{ariary(o.total)}<small>Requis : {ariary(o.required_payment)}</small></td><td><select value={paymentEdit[o.reference]||o.payment_status} onChange={e=>setPaymentEdit(x=>({...x,[o.reference]:e.target.value}))}>
            {Object.entries(paymentLabels).map(([key,label])=><option value={key} key={key}>{label}</option>)}</select></td>
          <td><select value={orderStatus[o.reference]||o.status} onChange={e=>setOrderStatus(x=>({...x,[o.reference]:e.target.value}))}>
            {Object.entries(statuses).map(([key,label])=><option value={key} key={key}>{label}</option>)}</select></td>
          <td>{btn('Enregistrer',()=>modifyOrder(o.id||o.reference,{...(paymentEdit[o.reference] && paymentEdit[o.reference]!==o.payment_status ? {payment_status:paymentEdit[o.reference]} : {}), ...(orderStatus[o.reference] && orderStatus[o.reference]!==o.status ? {status:orderStatus[o.reference]} : {})}),busy)}<button type="button" className="na-btn outline small" onClick={async()=>{try{const r=await fetch(`/api/v1/orders/${o.id}/invoice/`,{headers:{Authorization:`Bearer ${getAccessToken()}`}});if(!r.ok)throw new Error('Document indisponible');const url=URL.createObjectURL(await r.blob());const a=document.createElement('a');a.href=url;a.download=o.reference+'.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}catch(e){setErr(e.message)}}}>Facture PDF</button></td></tr>)}
      </tbody></table></div>{!orders.length&&<p>Aucune commande enregistrée.</p>}</div>}
    {tab==='facebook' && <div className="admin-box form-narrow"><h2>Saisir une vente Facebook</h2><p>Les ventes Facebook seront visibles dans le même tableau que les commandes du site.</p>
      <form onSubmit={submitSale} className="form-grid-new">
        {['customer_name','customer_phone','address','city'].map((k,i)=><label key={k}>{['Nom du client','Téléphone','Adresse','Ville'][i]}<input value={sale[k]} onChange={e=>setSale(x=>({...x,[k]:e.target.value}))} required/></label>)}
        <label>Zone<select value={sale.zone} onChange={e=>setSale(x=>({...x,zone:e.target.value}))}><option value="tana">Antananarivo</option><option value="province">Province</option></select></label>
        <label>Paiement<select value={sale.payment_method} onChange={e=>setSale(x=>({...x,payment_method:e.target.value}))}><option value="orange">Orange Money</option><option value="mvola">MVola</option></select></label>
        <label>Référence de paiement (si reçue)<input value={sale.transaction_reference} onChange={e=>setSale(x=>({...x,transaction_reference:e.target.value}))}/></label>
        <label>Acompte déclaré (Ar)<input type="number" min="0" value={sale.paid_amount} onChange={e=>setSale(x=>({...x,paid_amount:Number(e.target.value)}))}/></label>
        <label>Note interne<input value={sale.notes} onChange={e=>setSale(x=>({...x,notes:e.target.value}))}/></label>
        <div className="wide"><h3>Produits</h3>{saleRows.map((row,i)=>{const p=products.find(x=>x.id===Number(row.product_id));return <div className="sale-row" key={i}>
          <select required value={row.product_id} onChange={e=>updateRow(i,'product_id',e.target.value)}><option value="">Choisir le produit</option>{products.map(x=><option key={x.id} value={x.id}>{x.name} — {ariary(x.price)}</option>)}</select>
          <select value={row.variant_id} onChange={e=>updateRow(i,'variant_id',e.target.value)}><option value="">Modèle de téléphone</option>{p?.variants?.map(v=><option value={v.id} key={v.id}>{v.phone_model_name||'Accessoire'}</option>)}</select>
          <input type="number" aria-label="Quantité" min="1" max="20" value={row.quantity} onChange={e=>updateRow(i,'quantity',e.target.value)}/>
          <input type="number" aria-label="Prix négocié par unité, facultatif" min="1" placeholder="Prix négocié" value={row.negotiated_unit_price} onChange={e=>updateRow(i,'negotiated_unit_price',e.target.value)}/>
          {btn('×',()=>setSaleRows(x=>x.filter((_,j)=>j!==i)))}
        </div>})}<button type="button" className="na-btn outline small" onClick={()=>setSaleRows(x=>[...x,{product_id:'',variant_id:'',quantity:1,negotiated_unit_price:''}])}>+ Ajouter une ligne</button></div>
        <button type="submit" className="na-btn gold wide" disabled={busy}>Enregistrer la vente Facebook</button>
      </form></div>}
    {tab==='products' && <><div className="admin-box"><h2>Catalogue</h2><div className="table-scroll"><table className="admin-table"><thead><tr><th>Produit</th><th>Type</th><th>Prix (Ar)</th><th>Publié</th></tr></thead><tbody>{products.map(p=><tr key={p.id}><td>{p.name}</td><td>{p.kind}</td><td><input aria-label={'Prix '+p.name} type="number" min="1" defaultValue={p.price} onBlur={e=>{if(Number(e.target.value)!==p.price)void patchProduct(p,'price',Number(e.target.value))}}/></td><td><input type="checkbox" aria-label={'Publié '+p.name} checked={p.active} onChange={e=>{void patchProduct(p,'active',e.target.checked)}}/></td></tr>)}</tbody></table></div></div>
      <div className="admin-box form-narrow"><h2>Créer un produit</h2><p>La nouvelle fiche est créée non publiée ; ajoutez ensuite ses photos et ses modèles compatibles.</p><form className="form-grid-new" onSubmit={createProduct}>
        <label>Nom<input required value={productDraft.name} onChange={e=>setProductDraft(x=>({...x,name:e.target.value}))}/></label>
        <label>Identifiant URL (slug)<input required pattern="[a-z0-9-]+" value={productDraft.slug} onChange={e=>setProductDraft(x=>({...x,slug:e.target.value}))}/></label>
        <label>Prix en Ar<input type="number" min="1" required value={productDraft.price} onChange={e=>setProductDraft(x=>({...x,price:e.target.value}))}/></label>
        <label>Type<select value={productDraft.kind} onChange={e=>setProductDraft(x=>({...x,kind:e.target.value}))}>{['simple','iphone','bracelet','diamant','blinde','luxe','personnalisee','accessoire','non_classe'].map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Catégorie<select required value={productDraft.category} onChange={e=>setProductDraft(x=>({...x,category:e.target.value}))}><option value="">Choisir</option>{categories.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
        <button type="submit" className="na-btn gold wide" disabled={busy}>Créer le produit</button></form>
        <p className="muted-note">Pour les photos et variantes, utilisez l’onglet « Éditeur photos » ci-dessus.</p></div></>}
    {tab==='catalogue'&&<AdminProductEditor/>}
    {tab==='content'&&<AdminContent/>}
    {tab==='customers'&&<AdminCustomers/>}
    {tab==='stock'&&<AdminStock/>}
    {tab==='settings'&&localConfig&&<div className="admin-box form-narrow"><h2>Configuration du site</h2><form className="form-grid-new" onSubmit={e=>{e.preventDefault();void errorAction(async()=>{await api('/site-config/',{method:'PATCH',auth:true,body:localConfig});setInfo('Configuration enregistrée.');await reload()})}}>
      {Object.entries({orange_number:'Orange Money',mvola_number:'MVola',min_delivery_days:'Délai minimum (jours)',max_delivery_days:'Délai maximum (jours)',hero_title:'Titre principal',hero_subtitle:'Slogan',legal_business_name:'Nom légal du commerçant',legal_registration:'Numéro d’immatriculation (si applicable)',legal_address:'Adresse commerciale',legal_contact_phone:'Téléphone public',legal_contact_email:'E-mail public',privacy_contact_email:'E-mail confidentialité',hosting_provider:'Hébergeur et coordonnées'}).map(([key,label])=><label key={key} className={['hero_title','hero_subtitle','legal_address','hosting_provider'].includes(key)?'wide':''}>{label}<input value={localConfig[key]||''} onChange={e=>setLocalConfig(x=>({...x,[key]:key.endsWith('days')?Number(e.target.value):e.target.value}))}/></label>)}
      <p className="legal-alert wide">Avant publication, vérifiez les CGV, la politique de confidentialité et les informations juridiques avec un professionnel compétent. Ne renseignez pas de coordonnées fictives.</p>
      <button type="submit" className="na-btn gold wide" disabled={busy}>Enregistrer la configuration</button></form></div>}
  </div>;
}
