import {useEffect,useState} from 'react';import {Link} from 'react-router-dom';
import {api,ariary,login,statuses,getAccessToken} from '../lib/api';
import Skeleton from '../ui/Skeleton';import {useAuth} from '../context/AuthContext';import ProductCard from '../ui/ProductCard';import SEO from '../ui/SEO';
function ReviewForm({item,onSaved}){const [rating,setRating]=useState('5'),[body,setBody]=useState(''),[msg,setMsg]=useState('');
  return <form onSubmit={async e=>{e.preventDefault();try{await api('/reviews/submit/',{method:'POST',auth:true,body:{order_item_id:item.id,rating:Number(rating),body}});setMsg('Avis reçu, en attente de modération.');onSaved?.()}catch(e){setMsg(e.message)}}}><b>Votre avis : {item.product_name}</b>
    <select aria-label="Évaluation" value={rating} onChange={e=>setRating(e.target.value)}>{[5,4,3,2,1].map(x=><option key={x} value={x}>{x} / 5</option>)}</select>
    <input placeholder="Votre avis sur cette housse" maxLength={2000} value={body} onChange={e=>setBody(e.target.value)} required/><button>Envoyer</button>{msg&&<small>{msg}</small>}</form>}
export default function AccountNew(){
  const {me,reload,signout,loading}=useAuth();const [mode,setMode]=useState('login'),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[name,setName]=useState('');
  const [orders,setOrders]=useState([]),[wishlist,setWishlist]=useState([]),[addresses,setAddresses]=useState([]),[recent,setRecent]=useState([]),[error,setError]=useState(''),[msg,setMsg]=useState(''),[tab,setTab]=useState('orders');
  const [avatar,setAvatar]=useState(''),[avatarVersion,setAvatarVersion]=useState(0),[uploadingAvatar,setUploadingAvatar]=useState(false);
  const [address,setAddress]=useState({label:'Domicile',address:'',city:'Antananarivo',zone:'tana',phone:''});
  useEffect(()=>{if(!me)return;setName(me.name||'');Promise.all([api('/my-orders/',{auth:true}),api('/wishlist/',{auth:true}),api('/addresses/',{auth:true})])
    .then(([o,w,a])=>{setOrders(o.results||o);setWishlist(w);setAddresses(a)}).catch(e=>setError(e.message));
    try{setRecent(JSON.parse(localStorage.getItem('na-recent')||'[]'))}catch{setRecent([])}
  },[me?.id]);
  useEffect(()=>{
    if(!me?.has_avatar){setAvatar('');return;}
    let current=true;let blobUrl='';
    fetch('/api/v1/auth/avatar/',{headers:{Authorization:'Bearer '+getAccessToken()}})
      .then(r=>{if(!r.ok)throw Error('Photo indisponible');return r.blob()})
      .then(blob=>{blobUrl=URL.createObjectURL(blob);if(current)setAvatar(blobUrl);else URL.revokeObjectURL(blobUrl)})
      .catch(()=>{if(current)setAvatar('')});
    return()=>{current=false;if(blobUrl)URL.revokeObjectURL(blobUrl)};
  },[me?.id,me?.has_avatar,avatarVersion]);
  async function uploadAvatar(file){
    if(!file)return;
    if(file.size>3*1024*1024){setError('Photo : 3 Mo maximum.');return;}
    const fd=new FormData();fd.append('avatar',file);setUploadingAvatar(true);setError('');
    try{await api('/auth/avatar/',{method:'POST',auth:true,body:fd});await reload();setAvatarVersion(x=>x+1);setMsg('Photo de profil enregistrée.');}
    catch(e){setError(e.message)}finally{setUploadingAvatar(false)}
  }
  async function deleteAvatar(){
    try{await api('/auth/avatar/',{method:'DELETE',auth:true});setAvatar('');await reload();setMsg('Photo supprimée.');}
    catch(e){setError(e.message)}
  }
  async function submit(e){e.preventDefault();setError('');try{if(mode==='register')await api('/auth/register/',{method:'POST',body:{email,password,name}});
    await login(email,password);await reload();setMsg('Connexion réussie.');}catch(e){setError(e.message)}}
  async function saveName(e){e.preventDefault();try{await api('/auth/me/',{method:'PATCH',auth:true,body:{name}});await reload();setMsg('Profil mis à jour.')}catch(e){setError(e.message)}}
  async function saveAddress(e){e.preventDefault();try{const a=await api('/addresses/',{method:'POST',auth:true,body:address});setAddresses(x=>[...x,a]);setAddress({label:'Domicile',address:'',city:'Antananarivo',zone:'tana',phone:''});setMsg('Adresse enregistrée.')}catch(e){setError(e.message)}}
  return <div className="na-wrap account-page"><SEO title="Mon compte"/><div className="page-title"><small className="na-kicker">ESPACE CLIENT</small><h1>Mon <em>compte.</em></h1></div>
    {loading?<div aria-label="Chargement du compte"><Skeleton variant="form"/></div>:!me?<form className="account-form" onSubmit={submit}><div className="admin-tabs"><button type="button" className={mode==='login'?'active':''} onClick={()=>setMode('login')}>Connexion</button><button type="button" className={mode==='register'?'active':''} onClick={()=>setMode('register')}>Inscription</button></div>
      {mode==='register'&&<label>Nom<input required value={name} onChange={e=>setName(e.target.value)}/></label>}
      <label>E-mail<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Mot de passe<input type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/></label>
      {error&&<p className="alert">{error}</p>}<button className="na-btn gold full">{mode==='login'?'Se connecter':'Créer mon compte'}</button><p><Link to="/reinitialiser">Mot de passe oublié ?</Link></p></form>:
      <div><div className="admin-heading"><h2>Bonjour {me.name||me.email}</h2><button className="na-btn outline small" onClick={signout}>Déconnexion</button></div>
        <div className="admin-tabs">{[['orders','Commandes'],['wishlist','Favoris'],['recent','Récemment vus'],['profile','Profil et adresses']].map(([key,label])=><button key={key} className={tab===key?'active':''} onClick={()=>setTab(key)}>{label}</button>)}</div>
        {error&&<p className="alert">{error}</p>}{msg&&<p className="success-message">{msg}</p>}
        {tab==='orders'&&<div className="admin-box"><h2>Mes commandes</h2>{orders.length?orders.map(o=><div className="summary-row" key={o.reference}><div><b>{o.reference}</b><small> · {statuses[o.status]||o.status} · {ariary(o.total)}</small></div><div><Link to={'/suivi/'+o.tracking_token}>Suivre</Link> · <a href={'/api/v1/orders/'+o.id+'/invoice/'} onClick={async e=>{e.preventDefault();try{const {getAccessToken}=await import('../lib/api');const r=await fetch('/api/v1/orders/'+o.id+'/invoice/',{headers:{Authorization:'Bearer '+getAccessToken()}});if(!r.ok)throw Error('Facture indisponible');const u=URL.createObjectURL(await r.blob());const a=document.createElement('a');a.href=u;a.download=o.reference+'.pdf';a.click();URL.revokeObjectURL(u)}catch(err){setError(err.message)}}}>Facture PDF</a></div>{o.status==='livree'&&o.items?.map(item=><ReviewForm key={item.id} item={item}/>)}</div>):<p>Aucune commande liée à ce compte.</p>}</div>}
        {tab==='wishlist'&&<div className="admin-box"><h2>Ma liste de souhaits</h2><div className="product-grid">{wishlist.map(p=><ProductCard key={p.id} product={p}/>)}</div>{!wishlist.length&&<p>Ajoutez des housses avec le bouton cœur.</p>}</div>}
        {tab==='recent'&&<div className="admin-box"><h2>Récemment consultés (sur cet appareil)</h2><div className="product-grid">{recent.map(p=><ProductCard key={p.slug} product={p}/>)}</div>{!recent.length&&<p>Vous n'avez pas encore consulté de produit.</p>}</div>}
        {tab==='profile'&&<div className="admin-box form-narrow"><h2>Modifier mon profil</h2>
        <div className="na-avatar-editor">
          {avatar?<img src={avatar} alt="Votre photo de profil"/>:<div className="na-avatar-empty" aria-label="Aucune photo de profil">{(me.name||me.email||'N').charAt(0).toUpperCase()}</div>}
          <div><label>Photo de profil (JPG, PNG, WebP · 3 Mo max.)<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingAvatar} onChange={e=>uploadAvatar(e.target.files?.[0])}/></label>
            {uploadingAvatar&&<small role="status">Enregistrement de la photo…</small>}
            {me.has_avatar&&<button type="button" className="na-btn outline small" onClick={deleteAvatar}>Supprimer la photo</button>}
          </div>
        </div><form onSubmit={saveName} className="form-grid-new"><label>Nom<input value={name} onChange={e=>setName(e.target.value)} required/></label><label>E-mail<input value={me.email} readOnly/></label><button className="na-btn gold">Enregistrer</button></form>
        <h2>Mes adresses</h2>{addresses.map(a=><div className="summary-row" key={a.id}><span>{a.label} : {a.address}, {a.city}</span><button onClick={async()=>{await api('/addresses/'+a.id+'/',{method:'DELETE',auth:true});setAddresses(x=>x.filter(z=>z.id!==a.id))}}>Supprimer</button></div>)}
        <form className="form-grid-new" onSubmit={saveAddress}>{[['label','Nom de l’adresse'],['address','Adresse'],['city','Ville'],['phone','Téléphone']].map(([key,label])=><label key={key}>{label}<input required value={address[key]} onChange={e=>setAddress(x=>({...x,[key]:e.target.value}))}/></label>)}
          <label>Zone<select value={address.zone} onChange={e=>setAddress(x=>({...x,zone:e.target.value}))}><option value="tana">Antananarivo</option><option value="province">Province</option></select></label><button className="na-btn gold">Ajouter l'adresse</button></form></div>}
      </div>}
  </div>;
}
