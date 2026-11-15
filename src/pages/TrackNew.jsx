import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, PackageCheck, Search } from 'lucide-react';
import { api, ariary, statuses } from '../lib/api';
import SEO from '../ui/SEO';
import Skeleton from '../ui/Skeleton';
const steps=['attente_acompte','acompte_recu','preparation','prete','expediee','livree'];
export default function TrackNew() {
  const {token}=useParams();const navigate=useNavigate();const [input,setInput]=useState('');const [data,setData]=useState(null);const [error,setError]=useState('');
  useEffect(()=>{if(!token)return;let active=true;api('/track/'+token+'/').then(x=>{if(active)setData(x)}).catch(e=>{if(active)setError(e.message)});return()=>{active=false}},[token]);
  return <div className="na-wrap track-page"><SEO title="Suivi de commande"/><div className="page-title"><small className="na-kicker">VOTRE COMMANDE</small><h1>Suivez votre <em>arrivée.</em></h1><p>Retrouvez les étapes de préparation et de livraison.</p></div>
    {!token && <form className="track-search" onSubmit={e=>{e.preventDefault();const id=input.trim().split('/').pop();if(id)navigate('/suivi/'+id);}}>
      <label>Lien ou identifiant de suivi<input value={input} onChange={e=>setInput(e.target.value)} placeholder="Collez le lien reçu lors de la commande" required/></label><button type="submit" className="na-btn gold"><Search size={17}/> Consulter</button></form>}
    {error && <p className="alert">{error}</p>}{token&&!data&&!error&&<Skeleton variant="timeline"/>}
    {data && <div className="tracking-card"><PackageCheck size={40}/><h2>{data.reference}</h2><p>{statuses[data.status] || data.status}</p>
      <ol className="tracking-timeline" aria-label="Progression de la commande">{steps.map((step,i)=><li key={step} className={steps.indexOf(data.status)>=i?'done':''}><span>{steps.indexOf(data.status)>=i?<Check size={15}/>:i+1}</span><small>{statuses[step]}</small></li>)}</ol>
      <div className="summary-row"><span>Montant de la commande</span><b>{ariary(data.total)}</b></div>
      <div className="summary-row"><span>Paiement requis à la confirmation</span><b>{ariary(data.required_payment)}</b></div>
      <div className="summary-row"><span>Montant déjà vérifié</span><b>{ariary(data.paid_amount)}</b></div>
      <small>Le délai estimatif commence une fois le paiement confirmé par New arrivals.</small></div>}
  </div>;
}
