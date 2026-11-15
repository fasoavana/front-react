import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { api } from '../lib/api';
import ProductCard from '../ui/ProductCard';
import Skeleton from '../ui/Skeleton';
import SEO from '../ui/SEO';
import {pageNumbers} from '../lib/pagination';

const PAGE_SIZE=24;
const kinds=[['','Toutes'],['simple','Simples'],['luxe','Luxe'],['bracelet','Avec bracelet'],['diamant','Diamant'],['blinde','Blindées'],['iphone','iPhone'],['personnalisee','Personnalisées'],['accessoire','Accessoires'],['non_classe','Photos à classifier']];
export default function ShopNew(){
  const {phones}=useStore();
  const [visible,setVisible]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
  const [total,setTotal]=useState(0),[view,setView]=useState('grid'),[sp,setSp]=useSearchParams(),[filtersOpen,setFiltersOpen]=useState(false);
  const page=Math.max(1,Math.min(999999,parseInt(sp.get('page')||'1',10)||1));
  const search=sp.get('search')||'',kind=sp.get('kind')||'',phone=sp.get('phone')||'',color=sp.get('color')||'',minPrice=sp.get('min_price')||'',maxPrice=sp.get('max_price')||'',sort=sp.get('sort')||'new';
  const last=Math.max(1,Math.ceil(total/PAGE_SIZE));
  function set(key,value){const next=new URLSearchParams(sp);if(value)next.set(key,String(value));else next.delete(key);if(key!=='page')next.delete('page');setSp(next)}
  const query=useMemo(()=>{const params=new URLSearchParams({page:String(page),page_size:String(PAGE_SIZE),sort});
    for(const [key,val] of Object.entries({search,kind,phone,color,min_price:minPrice,max_price:maxPrice}))if(val)params.set(key,val);
    return '?'+params.toString();},[page,search,kind,phone,color,minPrice,maxPrice,sort]);
  useEffect(()=>{let live=true;setLoading(true);setError('');
    api('/products/'+query).then(data=>{if(live){setVisible(data.results||data);setTotal(Number(data.count??data.length)||0)}})
      .catch(e=>{if(live){setError(e.message);setVisible([])}}).finally(()=>{if(live)setLoading(false)});
    return()=>{live=false};},[query]);
  useEffect(()=>{if(!loading&&page>last&&total>0)set('page',last)},[loading,page,last,total]);
  function goto(n){if(n>=1&&n<=last){set('page',n);window.scrollTo({top:0,behavior:'smooth'})}}
  const nums=pageNumbers(page,last);
  return <div className="na-wrap shop-new"><SEO title="Catalogue" description="Explorez les housses de téléphone, bijoux, coques blindées et personnalisées sur commande à Madagascar."/>
    <div className="page-title"><small className="na-kicker">NEW ARRIVALS / CATALOGUE</small><h1>Une coque pour <em>chaque style.</em></h1><p>Housses sur commande, prix dès 35 000 Ar.</p></div>
    <div className="shop-toolbar"><span>{total} référence(s)</span><button className="filter-toggle" onClick={()=>setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen}><SlidersHorizontal size={18}/> Filtres</button>
      <div className="view-switch"><button aria-label="Vue grille" aria-pressed={view==='grid'} onClick={()=>setView('grid')}>▦</button><button aria-label="Vue liste" aria-pressed={view==='list'} onClick={()=>setView('list')}>☷</button></div>
      <select aria-label="Trier les produits" value={sort} onChange={e=>set('sort',e.target.value)}><option value="new">Nouveautés</option><option value="price_asc">Prix croissant</option><option value="price_desc">Prix décroissant</option><option value="popular">Sélection</option></select></div>
    <div className="shop-layout"><aside className={'shop-filters '+(filtersOpen?'open':'')}>
      <div className="filter-top"><h2>Affiner</h2><button onClick={()=>{setSp({});setFiltersOpen(false)}}><X size={15}/> Effacer</button></div>
      <label>Rechercher<span><Search size={15}/><input value={search} placeholder="Papillon, léopard…" onChange={e=>set('search',e.target.value)}/></span></label>
      <label>Votre téléphone<select value={phone} onChange={e=>set('phone',e.target.value)}><option value="">Tous les modèles</option>{phones.map(x=><option key={x.id} value={x.name}>{x.name}</option>)}</select></label>
      <label>Couleur<input value={color} placeholder="Noir, rose, doré…" onChange={e=>set('color',e.target.value)}/></label>
      <label>Prix min. (Ar)<input type="number" min="0" value={minPrice} onChange={e=>set('min_price',e.target.value)}/></label>
      <label>Prix max. (Ar)<input type="number" min="0" value={maxPrice} onChange={e=>set('max_price',e.target.value)}/></label>
      <fieldset><legend>Catégorie</legend>{kinds.map(([value,label])=><label key={value} className="radio-line"><input type="radio" checked={kind===value} onChange={()=>set('kind',value)}/>{label}</label>)}</fieldset>
    </aside><section aria-label="Résultats du catalogue">
      {loading&&<Skeleton count={12}/>} {error&&<p className="alert" role="alert">{error}</p>}
      {!loading&&!visible.length&&!error&&<div className="empty-state">Aucune référence trouvée pour ces filtres.</div>}
      {!loading&&<div className={view==='grid'?'product-grid':'product-grid list-view'}>{visible.map(product=><ProductCard key={product.id} product={product}/>)}</div>}
      {!loading&&total>0&&<nav className="na-pagination" aria-label="Pages du catalogue"><button onClick={()=>goto(page-1)} disabled={page<=1} aria-label="Page précédente">← Précédent</button>
        {nums.map((n,i)=><span key={n}>{i>0&&n-nums[i-1]>1&&<span className="page-ellipsis">…</span>}<button onClick={()=>goto(n)} className={page===n?'current':''} aria-label={'Page '+n} aria-current={page===n?'page':undefined}>{n}</button></span>)}
        <button onClick={()=>goto(page+1)} disabled={page>=last} aria-label="Page suivante">Suivant →</button></nav>}
      <p className="muted-note" role="status">Page {page} sur {last} · {visible.length} produits affichés · {total} références</p>
    </section></div>
  </div>;
}
