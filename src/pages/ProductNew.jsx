import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Check, ShoppingBag, ShieldCheck, Truck, UploadCloud } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { api, ariary } from '../lib/api';
import ProductCard from '../ui/ProductCard';
import WishlistButton from '../ui/WishlistButton';
import SEO from '../ui/SEO';
import Skeleton from '../ui/Skeleton';
export default function ProductNew() {
  const { slug } = useParams(); const nav = useNavigate();
  const { products, loading, config } = useStore(); const { add } = useCart();
  const cached = products.find(x => x.slug === slug);
  const [fetched,setFetched] = useState(null);const [selectedImage,setSelectedImage]=useState(0);const [zoom,setZoom]=useState(false);
  const [detailLoading,setDetailLoading] = useState(false);
  useEffect(()=>{if(cached)return;let live=true;setDetailLoading(true);api('/products/'+slug+'/').then(x=>{if(live)setFetched(x)}).catch(()=>{if(live)setFetched(null)}).finally(()=>{if(live)setDetailLoading(false)});return()=>{live=false}},[slug,cached]);
  const product = cached || (fetched?.slug===slug ? fetched : null);
  const [variantId, setVariantId] = useState(''); const [quantity,setQuantity] = useState(1);
  const [file,setFile] = useState(null);const [preview,setPreview] = useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  useEffect(()=>{setVariantId('');setSelectedImage(0);setQuantity(1);setFile(null);setPreview('');setError('');},[slug]);
  useEffect(()=>{if(!product)return;try{const all=JSON.parse(localStorage.getItem('na-recent')||'[]');const item={id:product.id,slug:product.slug,name:product.name,price:product.price,cover_url:product.cover_url,category_name:product.category_name,variants:product.variants,kind:product.kind};
    localStorage.setItem('na-recent',JSON.stringify([item,...all.filter(p=>p.slug!==item.slug)].slice(0,12)))}catch{}},[product?.slug]);
  useEffect(()=>{if(!file){setPreview('');return;} const url=URL.createObjectURL(file);setPreview(url);return()=>URL.revokeObjectURL(url);},[file]);
  if (!product) return <div className="na-wrap empty-state">{loading || detailLoading ? <Skeleton variant="detail"/> : <>Produit introuvable. <Link to="/boutique">Retour au catalogue</Link></>}</div>;
  const gallery=[product.cover_url,...(product.images||[]).map(p=>p.image)].filter(Boolean);
  const variant=product.variants?.find(v=>String(v.id)===String(variantId));
  async function addToCart() {
    if (product.price_confirmed===false){setError('Prix à confirmer auprès de New arrivals avant toute commande.');return;}
    if (product.kind!=='accessoire' && !variant) {setError('Sélectionnez le modèle exact de votre téléphone.');return;}
    try {setError('');setBusy(true);let token=null;
      if (product.customizable) {if(!file)throw new Error('Ajoutez une photo pour votre housse personnalisée.');
        const fd=new FormData();fd.append('image',file);const res=await api('/customizations/upload/',{method:'POST',body:fd});token=res.token;}
      add(product,variant,quantity,token);nav('/panier');
    } catch(e){setError(e.message);}finally{setBusy(false);}
  }
  return <div className="na-wrap product-new"><SEO title={product.name} description={product.description||'Housse disponible sur commande'} image={product.cover_url}/>
    <nav className="crumbs"><Link to="/boutique"><ArrowLeft size={16}/> Boutique</Link><span>/</span><span>{product.name}</span></nav>
    <div className="product-new-grid"><div>
      <div className="product-photo-panel">{gallery.length>0 && <button className="gallery-main" onClick={()=>setZoom(true)} title="Agrandir la photo"><img src={gallery[selectedImage]||gallery[0]} alt={product.name}/></button>}
        {product.customizable && preview && <div className="photo-preview"><span>APERÇU INDICATIF</span><div className="mock-case"><div className="mock-cameras">●●</div><img src={preview} alt="Aperçu de votre photo sur une housse"/></div></div>}
        <span className="image-note">{product.customizable ? 'Aperçu non contractuel · Découpe selon téléphone' : 'Photo de référence · Découpe selon téléphone'}</span>
      </div>
      {gallery.length>1&&<div className="detail-thumbs">{gallery.map((url,index)=><button key={url+index} onClick={()=>setSelectedImage(index)} className={index===selectedImage?'selected':''} aria-label={'Voir photo '+(index+1)}><img src={url} alt={'Vue '+(index+1)}/></button>)}</div>}
      {zoom&&<div className="zoom-overlay" role="dialog" aria-modal="true" aria-label="Photo agrandie" onClick={()=>setZoom(false)}><button aria-label="Fermer le zoom" onClick={()=>setZoom(false)}>×</button><img src={gallery[selectedImage]||gallery[0]} alt={product.name}/></div>}
      {product.customizable && <div className="detail-thumbs"><img src="/catalog/personnalisee-ref-1.webp" alt="Exemple de personnalisation 1"/><img src="/catalog/personnalisee-ref-2.webp" alt="Exemple de personnalisation 2"/><img src="/catalog/personnalisee-ref-3.webp" alt="Exemple de personnalisation 3"/></div>}
    </div>
    <div className="product-info"><small className="na-kicker">{product.category_name} / NEW ARRIVALS</small><h1>{product.name}</h1><p className="big-price">{product.price_confirmed===false?'À partir de '+ariary(product.price):ariary(product.price)}</p>{product.price_confirmed===false&&<p className="alert">Cette photo est consultable, mais son tarif et sa finition doivent être vérifiés avec New arrivals avant la commande et le paiement.</p>}<WishlistButton product={product}/>
      <span className="product-status"><span/> Disponible sur commande · {config?.min_delivery_days||9} à {config?.max_delivery_days||15} jours</span>
      <p className="product-desc">{product.description}</p>
      <div className="select-line"><label htmlFor="variant">Modèle de téléphone <b>*</b></label>
        <select id="variant" value={variantId} onChange={e=>setVariantId(e.target.value)}><option value="">Sélectionner un modèle compatible</option>
          {product.variants?.filter(v=>v.status!=='indisponible').map(v=><option key={v.id} value={v.id}>{v.phone_model_name || 'Accessoire'} — {v.status==='sur_commande'?'sur commande':'en stock'}</option>)}
        </select><small>Un modèle non indiqué ? Demandez sa disponibilité à New arrivals avant de commander.</small></div>
      {product.customizable && <div className="upload-section"><label htmlFor="customer-photo"><Camera size={19}/> Votre photo personnalisée <b>*</b></label>
        <input id="customer-photo" type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setFile(e.target.files?.[0]||null)}/>
        <p><UploadCloud size={17}/> JPG, PNG ou WebP, 8 Mo maximum. Photo privée, non affichée sur le catalogue.</p>
        {file && <span className="success-message"><Check size={15}/> {file.name} sélectionnée</span>}</div>}
      <div className="buy-row"><label>Quantité <input type="number" min="1" max="20" value={quantity} onChange={e=>setQuantity(Math.max(1,Math.min(20,+e.target.value||1)))}/></label>
        <button className="na-btn gold" onClick={addToCart} disabled={busy||product.price_confirmed===false}>{busy?'Envoi de la photo…':'Ajouter au panier'} <ShoppingBag size={18}/></button></div>
      {error && <p className="alert" role="alert">{error}</p>}
      <div className="detail-assurance"><p><ShieldCheck size={18}/> Acompte de 50 % à Antananarivo, après confirmation.</p>
        <p><Truck size={18}/> Paiement intégral avant expédition en province.</p></div>
      <details className="na-details"><summary>Comment fonctionne la commande ?</summary><p>Choisissez votre téléphone puis confirmez la commande. Saisissez la référence Mobile Money. Votre paiement est vérifié manuellement ; le délai commence après confirmation.</p></details>
      <details className="na-details"><summary>Compatibilité et finitions</summary><p>Les photos montrent des modèles précis. La présence d’une housse pour un appareil ne garantit pas sa disponibilité sur un autre. Pour les modèles personnalisés, le dos a un aspect verre brillant ; sa composition exacte reste à confirmer.</p></details>
    </div></div>
    <section className="na-section"><div className="section-head"><h2>Vous pourriez <em>aimer aussi.</em></h2></div><div className="product-grid">{products.filter(p=>p.id!==product.id).slice(0,4).map(p=><ProductCard key={p.id} product={p}/>)}</div></section>
  </div>;
}
