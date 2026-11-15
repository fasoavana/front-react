import {useEffect,useState} from 'react';
import {api,ariary} from '../lib/api';
const kinds=['simple','iphone','bracelet','diamant','blinde','luxe','personnalisee','accessoire','non_classe'];

export function AdminProductEditor(){
  const [products,setProducts]=useState([]),[phones,setPhones]=useState([]),[query,setQuery]=useState(''),[selected,setSelected]=useState(''),[images,setImages]=useState([]),[variants,setVariants]=useState([]),[msg,setMsg]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[dragIndex,setDragIndex]=useState(null);
  const [draft,setDraft]=useState({phone_model:'',color:'Selon photo',status:'sur_commande',stock_count:0});
  const [newPrice,setNewPrice]=useState(''),[newKind,setNewKind]=useState('non_classe');
  const load=async(search='')=>{const [products,phones]=await Promise.all([api('/products/?page_size=100&search='+encodeURIComponent(search),{auth:true}),api('/phone-models/',{auth:true})]);setProducts(products.results||products);setPhones(phones)};
  useEffect(()=>{const timer=setTimeout(()=>load(query).catch(e=>setError(e.message)),300);return()=>clearTimeout(timer)},[query]);
  useEffect(()=>{if(!selected){setImages([]);setVariants([]);return}Promise.all([api('/admin/product-images/?product='+selected,{auth:true}),api('/admin/variants/?product='+selected,{auth:true})])
    .then(([imgs,vars])=>{setImages(imgs.filter(x=>String(x.product)===String(selected)).sort((a,b)=>a.order-b.order));setVariants(vars)}).catch(e=>setError(e.message))},[selected]);
  const current=products.find(p=>String(p.id)===selected);
  useEffect(()=>{setNewPrice(current?String(current.price):'');setNewKind(current?.kind||'non_classe')},[current?.id,selected]);
  async function run(fn){setBusy(true);setError('');setMsg('');try{await fn();setMsg('Modification enregistrée.')}catch(e){setError(e.message)}finally{setBusy(false)}}
  const upload=async e=>{const files=[...e.target.files];if(!files.length)return;await run(async()=>{for(const file of files){const fd=new FormData();fd.append('product',selected);fd.append('image',file);fd.append('order',String(images.length));await api('/admin/product-images/',{method:'POST',auth:true,body:fd})}const r=await api('/admin/product-images/?product='+selected,{auth:true});setImages(r.filter(x=>String(x.product)===selected));});e.target.value=''};
  async function reorder(from,to){if(from===to||from===null)return;const arr=[...images];const [moved]=arr.splice(from,1);arr.splice(to,0,moved);await run(async()=>{await api('/admin/product-images/reorder/',{method:'POST',auth:true,body:{product:Number(selected),ids:arr.map(x=>x.id)}});setImages(arr)});setDragIndex(null)}
  const makeVariant=e=>{e.preventDefault();run(async()=>{const v=await api('/admin/variants/',{method:'POST',auth:true,body:{...draft,phone_model:draft.phone_model?Number(draft.phone_model):null,stock_count:Number(draft.stock_count),product:Number(selected)}});setVariants(x=>[...x,v])})};
  const duplicate=()=>run(async()=>{const copy=await api('/products/'+current.slug+'/duplicate/',{method:'POST',auth:true});await load(query);setSelected(String(copy.id));setMsg('Copie créée non publiée')});
  return <div className="admin-box"><h2>Éditeur de catalogue</h2><p>Gérez directement les photos, l'ordre d'affichage et les modèles compatibles.</p>
    <label>Rechercher un produit (administration)<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Nom, référence, téléphone…"/></label>
    <label>Produit<select value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Sélectionnez un produit</option>{products.map(p=><option value={p.id} key={p.id}>{p.name} · {ariary(p.price)}</option>)}</select></label>
    {error&&<p className="alert">{error}</p>}{msg&&<p className="success-message">{msg}</p>}
    {current&&<><div className="admin-box-heading"><h3>{current.name}</h3><button className="na-btn outline small" disabled={busy} onClick={duplicate}>Dupliquer ce produit</button></div>
    <div className="admin-box"><h3>Vérifier le prix avant commercialisation</h3>
      <p>Les références importées sont consultables mais non payables tant que le tarif n'est pas confirmé. Vérifiez d'abord la catégorie et les caractéristiques du modèle.</p>
      <label>Type réel de housse<select value={newKind} onChange={e=>setNewKind(e.target.value)}>{kinds.filter(x=>x!=='non_classe').map(k=><option key={k} value={k}>{k}</option>)}<option value="non_classe">À classifier</option></select></label>
      <label>Prix validé (Ar) <input type="number" min="35000" step="1000" value={newPrice} onChange={e=>setNewPrice(e.target.value)}/></label>
      <button type="button" className="na-btn gold" disabled={busy||Number(newPrice)<35000||newKind==='non_classe'} onClick={()=>run(async()=>{await api(`/products/${current.slug}/`,{method:'PATCH',auth:true,body:{kind:newKind,price:Number(newPrice),price_confirmed:true}});await load(query)})}>Valider le tarif et autoriser la vente</button>
      {current.price_confirmed&&<button type="button" className="na-btn outline small" disabled={busy} onClick={()=>run(async()=>{await api(`/products/${current.slug}/`,{method:'PATCH',auth:true,body:{price_confirmed:false}});await load(query)})}>Suspendre les commandes</button>}
    </div>
    <details className="na-details"><summary>Aperçu de la fiche produit</summary><div className="admin-preview"><img style={{width:150,maxHeight:180,objectFit:'cover'}} src={images[0]?.image||current.cover_url} alt="Aperçu produit"/><div><strong>{current.name}</strong><p>{ariary(current.price)}</p><p>{current.description}</p><small>Prévisualisation admin, non publiée</small></div></div></details>
    <h3>Photos produit</h3><label className="na-btn outline small" style={{display:'inline-block',cursor:'pointer'}}>Importer des photos<input aria-label="Importer des photos produit" type="file" multiple accept="image/png,image/jpeg,image/webp" onChange={upload} style={{display:'block',marginTop:10}}/></label>
    <div className="admin-gallery-list">{images.map((img,i)=><div key={img.id} className="admin-image" draggable onDragStart={()=>setDragIndex(i)} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();reorder(dragIndex,i)}}>
      <img src={img.image} alt={'Photo '+(i+1)}/><small>Photo {i+1} · glisser</small><button onClick={()=>run(async()=>{await api('/admin/product-images/'+img.id+'/',{method:'DELETE',auth:true});setImages(x=>x.filter(y=>y.id!==img.id))})}>Supprimer</button></div>)}</div>
    <h3>Modèles compatibles et variantes</h3><div className="table-scroll"><table className="admin-table"><thead><tr><th>Téléphone</th><th>Couleur</th><th>État</th><th>Stock</th><th>Action</th></tr></thead><tbody>{variants.map(v=><tr key={v.id}><td>{v.phone_model_name||'Accessoire'}</td><td>{v.color}</td><td><select aria-label="État variante" value={v.status} onChange={e=>run(async()=>{await api('/admin/variants/'+v.id+'/',{method:'PATCH',auth:true,body:{status:e.target.value}});setVariants(x=>x.map(z=>z.id===v.id?{...z,status:e.target.value}:z))})}><option value="sur_commande">Sur commande</option><option value="en_stock">En stock</option><option value="indisponible">Indisponible</option></select></td><td><input aria-label="Stock variante" style={{width:75}} type="number" min="0" defaultValue={v.stock_count} onBlur={e=>{if(Number(e.target.value)!==v.stock_count)run(async()=>{await api('/admin/variants/'+v.id+'/',{method:'PATCH',auth:true,body:{stock_count:Number(e.target.value)}});setVariants(x=>x.map(z=>z.id===v.id?{...z,stock_count:Number(e.target.value)}:z))})}}/></td><td><button onClick={()=>run(async()=>{await api('/admin/variants/'+v.id+'/',{method:'DELETE',auth:true});setVariants(x=>x.filter(z=>z.id!==v.id))})}>Supprimer</button></td></tr>)}</tbody></table></div>
    <form className="form-grid-new" onSubmit={makeVariant}><label>Modèle de téléphone<select value={draft.phone_model} onChange={e=>setDraft(x=>({...x,phone_model:e.target.value}))}><option value="">Accessoire (sans modèle)</option>{phones.map(phone=><option key={phone.id} value={phone.id}>{phone.name}</option>)}</select></label>
      <label>Couleur<input value={draft.color} onChange={e=>setDraft(x=>({...x,color:e.target.value}))}/></label><label>Disponibilité<select value={draft.status} onChange={e=>setDraft(x=>({...x,status:e.target.value}))}><option value="sur_commande">Sur commande</option><option value="en_stock">En stock</option><option value="indisponible">Indisponible</option></select></label>
      <label>Stock<input type="number" min="0" value={draft.stock_count} onChange={e=>setDraft(x=>({...x,stock_count:e.target.value}))}/></label><button disabled={busy} className="na-btn gold">Ajouter la variante</button></form>
    </>}
  </div>
}
export function AdminContent(){const [banners,setBanners]=useState([]),[reviews,setReviews]=useState([]),[error,setError]=useState(''),[info,setInfo]=useState('');const [draft,setDraft]=useState({title:'',subtitle:'',url:'/boutique',active:true});
  const refresh=async()=>{const [b,r]=await Promise.all([api('/banners/',{auth:true}),api('/admin/reviews/',{auth:true})]);setBanners(b);setReviews(r)};
  useEffect(()=>{refresh().catch(e=>setError(e.message))},[]);
  const act=async fn=>{setError('');try{await fn();await refresh();setInfo('Enregistré')}catch(e){setError(e.message)}};
  return <div className="admin-box"><h2>Bannières promotionnelles</h2>{error&&<p className="alert">{error}</p>}{info&&<p className="success-message">{info}</p>}
    <form className="form-grid-new" onSubmit={e=>{e.preventDefault();act(()=>api('/banners/',{method:'POST',auth:true,body:draft}))}}>
      {['title','subtitle','url'].map(k=><label key={k}>{k}<input required={k==='title'} value={draft[k]} onChange={e=>setDraft(x=>({...x,[k]:e.target.value}))}/></label>)}
      <label>Active <input type="checkbox" checked={draft.active} onChange={e=>setDraft(x=>({...x,active:e.target.checked}))}/></label><button className="na-btn gold">Créer une bannière</button></form>
    {banners.map(b=><div key={b.id} className="summary-row"><strong>{b.title}</strong><div><button onClick={()=>act(()=>api('/banners/'+b.id+'/',{method:'PATCH',auth:true,body:{active:!b.active}}))}>{b.active?'Désactiver':'Activer'}</button> · <button onClick={()=>act(()=>api('/banners/'+b.id+'/',{method:'DELETE',auth:true}))}>Supprimer</button></div></div>)}
    <h2>Modération des avis</h2>{reviews.length===0&&<p>Pas d'avis à modérer.</p>}{reviews.map(r=><div key={r.id} className="summary-row"><div><b>{r.display_name}</b> · {r.rating}/5<p>{r.body}</p></div><button onClick={()=>act(()=>api('/admin/reviews/'+r.id+'/',{method:'PATCH',auth:true,body:{approved:!r.approved}}))}>{r.approved?'Masquer':'Approuver'}</button></div>)}
  </div>
}
export function AdminCustomers(){const [data,setData]=useState(null),[error,setError]=useState('');
  const reload=()=>api('/admin/customers/',{auth:true}).then(setData).catch(e=>setError(e.message));useEffect(()=>{reload()},[]);
  return <div className="admin-box"><h2>Clients et comptes</h2>{error&&<p className="alert">{error}</p>}
    <h3>Comptes du site</h3><div className="table-scroll"><table className="admin-table"><thead><tr><th>Nom</th><th>E-mail</th><th>État</th><th>Action</th></tr></thead><tbody>{data?.users?.map(u=><tr key={u.id}><td>{u.first_name}</td><td>{u.email}</td><td>{u.is_active?'Actif':'Bloqué'}</td><td><button onClick={async()=>{await api('/admin/customers/',{method:'PATCH',auth:true,body:{user_id:u.id,is_active:!u.is_active}});reload()}}>{u.is_active?'Bloquer':'Réactiver'}</button></td></tr>)}</tbody></table></div>
    <h3>Clients des commandes site et Facebook</h3><div className="table-scroll"><table className="admin-table"><thead><tr><th>Nom</th><th>Téléphone</th><th>E-mail</th><th>Commandes</th></tr></thead><tbody>{data?.customers?.map((c,i)=><tr key={i}><td>{c.customer_name}</td><td>{c.customer_phone}</td><td>{c.customer_email}</td><td>{c.orders}</td></tr>)}</tbody></table></div>
  </div>
}
export function AdminStock(){const [moves,setMoves]=useState([]),[err,setErr]=useState('');useEffect(()=>{api('/admin/stock-movements/',{auth:true}).then(setMoves).catch(e=>setErr(e.message))},[]);
  return <div className="admin-box"><h2>Historique du stock</h2>{err&&<p className="alert">{err}</p>}
    <div className="table-scroll"><table className="admin-table"><thead><tr><th>Produit</th><th>Variation</th><th>Motif</th><th>Commande</th><th>Date</th></tr></thead><tbody>{moves.map(m=><tr key={m.id}><td>{m.product}<small>{m.variant}</small></td><td>{m.delta}</td><td>{m.reason}</td><td>{m.order||'—'}</td><td>{new Date(m.created_at).toLocaleDateString('fr-FR')}</td></tr>)}</tbody></table></div>
  </div>
}
export function AdminSalesGraph({stats}){const daily=stats?.daily||[];const max=Math.max(1,...daily.map(d=>d.total||0));
  return <section className="admin-box"><h2>Évolution des ventes confirmées (30 jours)</h2>{daily.length===0?<p>Pas de ventes confirmées pendant cette période.</p>:
    <div className="admin-graph" role="img" aria-label="Graphique des ventes confirmées par jour">{daily.map((d,i)=><div key={i} style={{height:Math.max(2,100*d.total/max)+'%'}} title={d.day+' : '+ariary(d.total)}><small>{d.day?.slice(5)}</small></div>)}</div>}
    <h3>Alertes stock bas (produits en stock)</h3>{stats?.low_stock?.length?stats.low_stock.map(s=><p key={s.id}>⚠ {s.product__name} {s.phone_model__name||''} : {s.stock_count} unité(s)</p>):<p>Aucune alerte pour les produits en stock.</p>}
    <small>Les housses sur commande ne sont pas comptabilisées comme stock physique.</small>
  </section>
}
