import {Link} from 'react-router-dom';import SEO from '../ui/SEO';
export default function NotFoundNew(){return <div className="na-wrap not-found-new"><SEO title="Page introuvable"/><span>404</span><h1>Cette arrivée n’existe pas.</h1><p>Le produit ou la page a peut-être changé d’adresse.</p><Link className="na-btn gold" to="/boutique">Voir les nouveautés →</Link></div>}
