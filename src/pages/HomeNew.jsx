import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Camera, Gem, PackageCheck, Smartphone, Sparkles, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../ui/ProductCard';
import { motion, useReducedMotion } from 'framer-motion';
import Skeleton from '../ui/Skeleton';
import SEO from '../ui/SEO';
export default function HomeNew() {
  const reduced=useReducedMotion();
  const rise=reduced?{}:{initial:{opacity:0,y:28},whileInView:{opacity:1,y:0},viewport:{once:true,amount:0.12},transition:{duration:0.7,ease:[0.22,1,0.36,1]}};
  const [banners,setBanners]=useState([]);
  useEffect(()=>{api('/banners/').then(setBanners).catch(()=>{})},[]);
  const { products, loading, error, config } = useStore();
  const hero = products.find(x=>x.slug==='papillons-chromes') || products[0];
  const second = products.find(x=>x.slug==='leopard-coeur') || products[1];
  return <><SEO title="NEW ARRIVALS" description="Housses tendances, blindées, personnalisées et accessoires sur commande à Madagascar."/>
    {banners.map(b=><div className="na-wrap" key={b.id} style={{padding:'18px 0',textAlign:'center',borderBottom:'1px solid #aaa4'}}><strong>{b.title}</strong> · {b.subtitle} <a href={b.url}>Découvrir →</a></div>)}
    <section className="hero-new"><div className="na-wrap hero-inner">
      <motion.div className="hero-copy-new" {...rise}><span className="na-kicker"><span/> NOUVELLES ENVIES. NOUVELLES ARRIVÉES.</span>
        <h1>Votre style.<br/><em>Sans limite.</em></h1>
        <p>{config?.hero_subtitle || 'Une sélection de housses et d’accessoires qui font la différence. Sur commande, partout à Madagascar.'}</p>
        <div className="hero-ctas"><Link className="na-btn gold" to="/boutique">Explorer la collection <ArrowUpRight size={18}/></Link>
          <Link className="na-btn line" to="/boutique?kind=personnalisee">Créer ma housse <Camera size={18}/></Link></div>
        <div className="hero-stats"><div><strong>35 000 Ar</strong><span>Housses dès</span></div><div><strong>9–15 jours</strong><span>Délai estimatif</span></div><div><strong>100 %</strong><span>Sur commande</span></div></div>
      </motion.div>
      <div className="hero-media">
        <div className="hero-medal">THE NEW<br/>COLLECTION<br/><b>2026</b></div>
        {hero?.cover_url && <img className="hero-main-image" src={hero.cover_url} alt={hero.name}/>}
        {second?.cover_url && <img className="hero-second-image" src={second.cover_url} alt={second.name}/>}
        <div className="hero-media-caption">CURATED STYLES — NEW ARRIVALS <span>01 / 02</span></div>
      </div>
    </div></section>
    <section className="na-value-strip"><div className="na-wrap"><span><PackageCheck size={22}/> Sur commande</span><span><Truck size={22}/> Livraison à Madagascar</span><span><Gem size={22}/> Styles sélectionnés</span><span><Smartphone size={22}/> Compatibilité vérifiée</span></div></section>
    <motion.section {...rise} className="na-wrap na-section"><div className="section-head"><div><small className="na-kicker">DÉCOUVREZ LA SÉLECTION</small><h2>Les nouvelles <em>arrivées.</em></h2><p>Photographies issues de notre catalogue réel de housses.</p></div><Link to="/boutique" className="view-all">Tout voir <ArrowUpRight size={18}/></Link></div>
      {loading&&<Skeleton count={8}/>}{error && <p className="alert" role="alert">{error}</p>}
      <div className="product-grid">{products.slice(0,8).map(item=><ProductCard key={item.id} product={item}/>)}</div>
    </motion.section>
    <section className="personalization-banner"><div className="na-wrap personalization-grid">
      <div className="personalization-copy"><small className="na-kicker">UNE COQUE UNIQUEMENT À VOUS</small><h2>Votre image.<br/><em>Votre histoire.</em></h2><p>Envoyez votre photo et personnalisez une housse à dos effet verre brillant. Sur commande, selon le modèle de votre téléphone.</p>
        <strong>36 000 Ar</strong><Link className="na-btn gold" to="/produit/personnalisee-effet-verre">Personnaliser ma housse <ArrowRight size={18}/></Link>
      </div><div className="personalization-visual"><img src="/catalog/personnalisee-ref-3.webp" alt="Exemple de housse à dos brillant personnalisée avec une photo"/><span>VOTRE PHOTO. VOTRE STYLE.</span></div>
    </div></section>
    <motion.section {...rise} className="na-wrap na-section"><div className="section-head"><div><small className="na-kicker">FAITES VOTRE CHOIX</small><h2>Une collection, <em>mille envies.</em></h2></div></div>
      <div className="collection-tiles"><Link to="/boutique?kind=luxe"><Sparkles/> <strong>Collection luxe</strong><span>Explorer <ArrowUpRight size={16}/></span></Link>
      <Link to="/boutique?kind=diamant"><Gem/> <strong>Brillance & cristaux</strong><span>Explorer <ArrowUpRight size={16}/></span></Link>
      <Link to="/boutique?kind=bracelet"><Smartphone/> <strong>Cordons & bijoux</strong><span>Explorer <ArrowUpRight size={16}/></span></Link></div>
    </motion.section>
  </>;
}
