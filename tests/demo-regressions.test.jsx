// The original demonstration modules remain shipped in src/. These tests
// preserve their observable catalogue/navigation behavior during migration.
import React from 'react';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,cleanup,waitFor,within} from '@testing-library/react';
import {MemoryRouter,Routes,Route,useLocation} from 'react-router-dom';
import {AuthProvider} from '../src/context/AuthContext';
import {CartProvider} from '../src/context/CartContext';
import {logout} from '../src/lib/api';
import Shop from '../src/pages/Shop';
import Home from '../src/pages/Home';
import Product from '../src/pages/ProductDetail';
import Information from '../src/pages/Information';
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';
import Cart from '../src/pages/Cart';
import Checkout from '../src/pages/Checkout';
import {products,models} from '../src/data/products';
beforeEach(()=>{logout();localStorage.clear();vi.stubGlobal('fetch',vi.fn());vi.stubGlobal('scrollTo',vi.fn())});
afterEach(()=>{cleanup();logout();vi.restoreAllMocks();vi.unstubAllGlobals()});
function Location(){return <output data-testid="location">{useLocation().pathname+useLocation().search}</output>}
function mount(element,path='/'){return render(<MemoryRouter initialEntries={[path]}><AuthProvider><CartProvider>{element}<Location/></CartProvider></AuthProvider></MemoryRouter>)}
it('filtre le catalogue de démonstration par recherche, modèle, couleur, collection et prix',()=>{
 mount(<Shop/>);expect(screen.getByRole('heading',{name:'La collection.'})).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Filtres'}));expect(screen.getByRole('button',{name:'Filtres'}).getAttribute('aria-expanded')).toBe('true');
 fireEvent.click(screen.getByLabelText(models[0]));expect(screen.getByTestId('location').textContent).toContain('modele=');fireEvent.click(screen.getByLabelText(models[0]));
 fireEvent.click(screen.getByLabelText('Silicone'));fireEvent.click(screen.getByLabelText('Silicone'));
 fireEvent.click(screen.getByRole('button',{name:'Couleur Sauge'}));fireEvent.click(screen.getByRole('button',{name:'Couleur Sauge'}));
 fireEvent.change(screen.getByRole('slider'),{target:{value:'20'}});expect(screen.getByTestId('location').textContent).toContain('prix=20');
 fireEvent.click(screen.getByRole('button',{name:/Tout réinitialiser/}));
 fireEvent.click(screen.getByLabelText('Nouveautés uniquement'));expect(screen.getByRole('heading',{name:'Les nouveautés.'})).toBeTruthy();fireEvent.click(screen.getByLabelText('Nouveautés uniquement'));
 for(const sort of ['prix-croissant','prix-decroissant','avis'])fireEvent.change(screen.getByLabelText('Trier les produits'),{target:{value:sort}});
 fireEvent.change(screen.getByLabelText('Rechercher dans la collection'),{target:{value:'zzzz introuvable'}});expect(screen.getByText('Votre perle rare se fait discrète.')).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Effacer la recherche'}));expect(screen.queryByText('Votre perle rare se fait discrète.')).toBeNull();
});
it('ouvre les nouveautés et parcourt le carrousel de démonstration',()=>{
 const scroll=vi.fn();const original=HTMLElement.prototype.scrollBy;HTMLElement.prototype.scrollBy=scroll;
 try{mount(<Home/>);expect(screen.getByRole('link',{name:/Trouver ma coque/}).getAttribute('href')).toBe('/boutique');fireEvent.click(screen.getByRole('button',{name:'Voir les nouveautés suivantes'}));fireEvent.click(screen.getByRole('button',{name:'Voir les nouveautés précédentes'}));expect(scroll).toHaveBeenCalledWith({left:350,behavior:'smooth'});expect(scroll).toHaveBeenCalledWith({left:-350,behavior:'smooth'});}finally{HTMLElement.prototype.scrollBy=original}
});
it.each([false,true])('enregistre la newsletter locale même si le stockage échoue=%s',error=>{mount(<Footer/>);if(error)vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('quota')});fireEvent.change(screen.getByLabelText('Votre adresse e-mail'),{target:{value:'client@example.com'}});fireEvent.click(screen.getByRole('button',{name:'Enregistrer mon intérêt pour la newsletter'}));expect(screen.getByText(/Votre intérêt a été enregistré/)).toBeTruthy();if(!error)expect(JSON.parse(localStorage.getItem('coque-style-newsletter')).email).toBe('client@example.com');});
it('change les options du détail et les quantités bornées',()=>{const p=products[0];mount(<Routes><Route path="/produit/:id" element={<Product/>}/></Routes>,`/produit/${p.id}`);expect(screen.getByRole('heading',{name:p.name})).toBeTruthy();const colors=within(document.querySelector('.detail-swatches'));fireEvent.click(colors.getByRole('button',{name:p.colors[1]}));expect(colors.getByRole('button',{name:p.colors[1]}).getAttribute('aria-pressed')).toBe('true');fireEvent.change(screen.getByLabelText('Votre modèle de téléphone'),{target:{value:p.models[1]}});expect(screen.getByLabelText('Votre modèle de téléphone').value).toBe(p.models[1]);expect(screen.getByRole('button',{name:'Diminuer quantité'}).disabled).toBe(true);fireEvent.click(screen.getByRole('button',{name:'Augmenter quantité'}));expect(screen.getByRole('button',{name:'Diminuer quantité'}).disabled).toBe(false);fireEvent.click(screen.getByRole('button',{name:'Diminuer quantité'}));expect(screen.getByRole('button',{name:'Diminuer quantité'}).disabled).toBe(true);});
it('affiche le produit absent du catalogue de démonstration',()=>{mount(<Routes><Route path="/produit/:id" element={<Product/>}/></Routes>,'/produit/absent');expect(screen.getByText('Cette page nous échappe.')).toBeTruthy();});
it('recherche depuis la navigation, ferme au clavier et conserve les URLs',()=>{mount(<Navbar/>);fireEvent.click(screen.getByRole('button',{name:'Ouvrir le menu'}));expect(screen.getByRole('button',{name:'Fermer le menu'})).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'Rechercher un produit'}));fireEvent.change(screen.getByLabelText('Rechercher une coque'),{target:{value:'sauge'}});fireEvent.submit(screen.getByLabelText('Rechercher une coque').closest('form'));expect(screen.getByTestId('location').textContent).toBe('/boutique?recherche=sauge');fireEvent.click(screen.getByRole('button',{name:'Rechercher un produit'}));fireEvent.keyDown(window,{key:'Escape'});expect(screen.queryByLabelText('Rechercher une coque')).toBeNull();});
it.each(['notre-histoire','livraison','faq','contact','mon-espace','confidentialite','conditions','inconnue'])('présente les informations de démonstration : %s',page=>{mount(<Routes><Route path="/informations/:page" element={<Information/>}/></Routes>,`/informations/${page}`);expect(screen.getByRole('heading',{level:1})).toBeTruthy();if(page==='inconnue')expect(screen.getByText('Cette page nous échappe.')).toBeTruthy();if(page==='contact')expect(screen.getByRole('link',{name:/bonjour@/}).getAttribute('href')).toContain('mailto:');});
it('présente le panier vide et redirige une commande vide',async()=>{mount(<Routes><Route path="/commande" element={<Checkout/>}/><Route path="/panier" element={<Cart/>}/></Routes>,'/commande');await screen.findByText('Tout commence par un coup de cœur.');expect(screen.getByTestId('location').textContent).toBe('/panier');});
