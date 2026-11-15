import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Menu, Search, ShoppingBag, X, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';
import { useAuth } from '../context/AuthContext';
import { UserCircle } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useStore } from '../context/StoreContext';
export default function Layout() {
  const { count, notice,setDrawerOpen } = useCart(); const { config } = useStore();const { me }=useAuth();
  const [menu, setMenu] = useState(false); const [searchOpen, setSearchOpen] = useState(false); const [q, setQ] = useState('');
  const nav = useNavigate(); const loc = useLocation();
  useEffect(() => { setMenu(false); setSearchOpen(false); window.scrollTo(0, 0); }, [loc.pathname]);
  const reduceMotion=useReducedMotion();
  const searchInput=useRef(null);
  useEffect(()=>{if(searchOpen)searchInput.current?.focus()},[searchOpen]);
  return <div className="na-shell">
    <div className="topline"><span>NEW ARRIVALS / MADAGASCAR</span><span>Housses sur commande · 9–15 jours</span><span>Mobile Money</span></div>
    <header className="na-header">
      <div className="na-wrap nav-row">
        <button type="button" className="na-icon mobile-menu" aria-label={menu ? 'Fermer le menu' : 'Ouvrir le menu'} onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</button>
        <Link to="/" className="na-logo">NEW<span>ARRIVALS</span><i>.</i></Link>
        <nav className={menu ? 'main-nav open' : 'main-nav'} aria-label="Navigation principale">
          <NavLink to="/" end>Accueil</NavLink><NavLink to="/boutique">Boutique</NavLink>
          <NavLink to="/boutique?kind=personnalisee">Personnalisation</NavLink><NavLink to="/suivi">Suivi</NavLink>
        </nav>
        <div className="nav-actions">
          <button type="button" className="na-icon" aria-label="Rechercher" onClick={() => setSearchOpen(!searchOpen)}><Search size={21}/></button>
          <Link to="/mon-compte" className="na-icon" aria-label="Mon compte"><UserCircle size={21}/></Link><button type="button" onClick={()=>setDrawerOpen(true)} className="na-icon bag" aria-label={`Panier : ${count} article(s)`}><ShoppingBag size={21}/><b>{count}</b></button>
        </div>
      </div>
      {searchOpen && <form className="nav-search na-wrap" onSubmit={e => {e.preventDefault();nav('/boutique?search='+encodeURIComponent(q));}}>
        <Search size={18}/><input ref={searchInput} aria-label="Recherche" value={q} onChange={e=>setQ(e.target.value)} placeholder="Une housse, un modèle de téléphone…"/><button type="submit">Rechercher <ArrowUpRight size={16}/></button></form>}
    </header>
    <AnimatePresence mode="wait" initial={false}><motion.main id="main" key={loc.pathname} initial={reduceMotion?false:{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={reduceMotion?{opacity:1}:{opacity:0,y:-8}} transition={{duration:reduceMotion?0:0.27}}><Outlet/></motion.main></AnimatePresence>
    <footer className="na-footer"><div className="na-wrap footer-grid"><div><Link to="/" className="na-logo">NEW<span>ARRIVALS</span><i>.</i></Link>
      <p>Des nouveautés qui vous ressemblent. Importation de housses et accessoires à Madagascar.</p></div>
      <div><h3>Découvrir</h3><Link to="/boutique">Toutes les housses</Link><Link to="/boutique?kind=personnalisee">Housses personnalisées</Link><Link to="/suivi">Suivre une commande</Link></div>
      <div><h3>Informations</h3><Link to="/informations/conditions">Conditions de vente</Link><Link to="/informations/mentions">Mentions légales</Link><Link to="/informations/confidentialite">Confidentialité</Link><Link to="/admin-panel">Administration</Link></div>
      <div><h3>Mobile Money</h3><p>Orange Money : {config?.orange_number || '—'}</p><p>MVola : {config?.mvola_number || '—'}</p><small>Le paiement doit être vérifié par notre équipe.</small></div></div>
      <div className="na-wrap footer-bottom"><span>© {new Date().getFullYear()} NEW ARRIVALS</span><span>Conçu pour Madagascar · Prix en Ariary</span></div>
    </footer>
    <CartDrawer/>{notice && <div className="notice" role="status"><ShieldCheck size={18}/>{notice}</div>}
  </div>;
}
