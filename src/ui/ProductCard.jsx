import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { ariary } from '../lib/api';
import WishlistButton from './WishlistButton';
import { motion, useReducedMotion } from 'framer-motion';
export default function ProductCard({ product }) {
  const reduceMotion=useReducedMotion();
  return <motion.article className="na-card" initial={reduceMotion?false:{opacity:0,y:22}} whileInView={reduceMotion?{}:{opacity:1,y:0}} viewport={{once:true,amount:0.08}} transition={{duration:0.52,ease:[0.22,1,0.36,1]}}>
    <WishlistButton product={product}/><Link to={'/produit/'+product.slug} className="na-card-image">
      {product.cover_url ? <img src={product.cover_url} alt={product.name} loading="lazy"/> : <div className="image-placeholder">NEW ARRIVALS</div>}
      <span className="image-badges">{product.is_new && <i>NEW</i>}{product.customizable && <i>À PERSONNALISER</i>}</span>
      <span className="image-arrow" aria-hidden="true"><ArrowUpRight size={18}/></span>
    </Link>
    <div className="na-card-meta"><small>{product.category_name} · {product.on_order ? 'Sur commande' : 'En stock'}</small><Link to={'/produit/'+product.slug}><h3>{product.name}</h3></Link>
      <strong>{product.price_confirmed===false?'Dès '+ariary(product.price):ariary(product.price)}</strong>{product.price_confirmed===false&&<span className="na-price-pending">Tarif à confirmer avant paiement</span>}<span className="na-card-phone">{product.variants?.length ? `${product.variants.length} modèle(s) répertorié(s)` : 'Compatibilité à confirmer'}</span>
    </div>
  </motion.article>;
}
