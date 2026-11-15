import { Heart } from 'lucide-react';
import { useEffect,useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

// A shared request avoids fetching the entire wishlist once per product card.
let cachedUser=null;
let cachedIDs=null;
let pending=null;
function getIDs(userId){
  if(cachedUser!==userId){cachedUser=userId;cachedIDs=null;pending=null}
  if(cachedIDs!==null)return Promise.resolve(cachedIDs);
  if(!pending)pending=api('/wishlist/',{auth:true}).then(products=>{
    cachedIDs=new Set(products.map(p=>p.id));return cachedIDs;
  }).finally(()=>{pending=null});
  return pending;
}
function broadcast(){window.dispatchEvent(new CustomEvent('new-arrivals-wishlist'))}
export default function WishlistButton({product}){
  const {me}=useAuth(),nav=useNavigate();
  const [active,setActive]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
  useEffect(()=>{
    if(!me){setActive(false);return}
    let alive=true;
    const sync=()=>getIDs(me.id).then(ids=>{if(alive)setActive(ids.has(product.id))}).catch(()=>{});
    sync();window.addEventListener('new-arrivals-wishlist',sync);
    return()=>{alive=false;window.removeEventListener('new-arrivals-wishlist',sync)};
  },[me?.id,product.id]);
  async function toggle(event){
    event.preventDefault();event.stopPropagation();
    if(!me){nav('/mon-compte');return}
    setBusy(true);setError('');
    try{
      await api('/wishlist/',{method:active?'DELETE':'POST',auth:true,body:{product_id:product.id}});
      const ids=await getIDs(me.id);
      if(active)ids.delete(product.id);else ids.add(product.id);
      setActive(!active);broadcast();
    }catch(e){setError(e.message)}finally{setBusy(false)}
  }
  return <><button className={'wish-btn '+(active?'selected':'')} disabled={busy}
    aria-label={active?'Retirer des favoris':'Ajouter aux favoris'} title={error||'Favoris'} onClick={toggle}>
      <Heart size={19} fill={active?'currentColor':'none'}/>
    </button>{error&&<small role="alert" className="wishlist-error">{error}</small>}</>;
}
