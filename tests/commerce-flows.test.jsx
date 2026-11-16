import React from 'react';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,waitFor,cleanup,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter,Routes,Route,useLocation} from 'react-router-dom';
import {AuthProvider} from '../src/context/AuthContext';
import {CartProvider} from '../src/context/CartContext';
import {StoreProvider} from '../src/context/StoreContext';
import {logout} from '../src/lib/api';
import Product from '../src/pages/ProductNew';
import Shop from '../src/pages/ShopNew';
import Cart from '../src/pages/CartNew';
import Checkout from '../src/pages/CheckoutNew';
import Track from '../src/pages/TrackNew';
import App from '../src/App';

const baseProduct={id:1,slug:'coque',name:'Coque test',price:45000,price_confirmed:true,
 kind:'simple',description:'Protection renforcée',cover_url:'/front.webp',images:[{image:'/back.webp'}],
 variants:[{id:7,phone_model_name:'iPhone 16',color:'Bleu',status:'en_stock'},
 {id:8,phone_model_name:'Samsung A15',color:'Noir',status:'indisponible'}]};
const line={key:'1-7-base',product_id:1,variant_id:7,name:'Coque test',price:45000,
 image:'/front.webp',phone:'iPhone 16',color:'Bleu',quantity:2};
let product,calls,errors,list,count;
const ok=data=>({ok:true,status:200,json:async()=>structuredClone(data)});
beforeEach(()=>{
 logout();localStorage.clear();sessionStorage.clear();product=structuredClone(baseProduct);calls=[];errors=new Set();list=null;count=49;
 vi.stubGlobal('scrollTo',vi.fn());
 vi.stubGlobal('IntersectionObserver',class{observe(){}unobserve(){}disconnect(){}});
 vi.stubGlobal('fetch',vi.fn(async(url,options={})=>{
  const u=new URL(String(url),'http://localhost');const path=u.pathname.replace('/api/v1','');calls.push({path,query:u.searchParams,...options});
  if(errors.has(path))return {ok:false,status:400,json:async()=>({detail:'Service indisponible'})};
  if(path==='/products/')return ok({results:list??[product],count:list?list.length:count});
  if(path==='/products/coque/')return ok(product);
  if(path==='/categories/')return ok([{id:1,name:'Luxe'}]);
  if(path==='/phone-models/')return ok([{id:1,name:'iPhone 16'}]);
  if(path==='/site-config/')return ok({orange_number:'037TEST',mvola_number:'034TEST',min_delivery_days:9,max_delivery_days:15});
  if(path==='/customizations/upload/')return ok({token:'private-artwork'});
  if(path==='/orders/')return ok({reference:'NA-123',tracking_token:'private-track',total:90000,required_payment:45000});
  if(path==='/track/private-track/')return ok({reference:'NA-123',status:'livree',total:90000,required_payment:45000,paid_amount:90000});
  return {ok:false,status:404,json:async()=>({detail:'Introuvable'})};
 }));
 vi.spyOn(URL,'createObjectURL').mockReturnValue('blob:preview');vi.spyOn(URL,'revokeObjectURL').mockImplementation(()=>{});
});
afterEach(()=>{cleanup();logout();vi.restoreAllMocks();vi.unstubAllGlobals()});
function Location(){return <output data-testid="route">{useLocation().pathname+useLocation().search}</output>}
function mount(path='/produit/coque',full=false){return render(<MemoryRouter initialEntries={[path]}><AuthProvider><CartProvider>{full?<App/>:<StoreProvider><Routes>
 <Route path="/produit/:slug" element={<Product/>}/><Route path="/boutique" element={<Shop/>}/>
 <Route path="/panier" element={<Cart/>}/><Route path="/commande" element={<Checkout/>}/>
 <Route path="/suivi/:token" element={<Track/>}/><Route path="/mon-compte" element={<p>Connexion requise</p>}/>
 </Routes></StoreProvider>}<Location/></CartProvider></AuthProvider></MemoryRouter>)}
function cartSeed(){localStorage.setItem('new-arrivals-cart-v1',JSON.stringify([line]))}
const change=(label,value)=>fireEvent.change(screen.getByLabelText(label),{target:{value}});
async function detail(){mount();await screen.findByRole('heading',{name:'Coque test'})}

it('sélectionne un modèle disponible, contrôle la quantité et ajoute au panier',async()=>{
 await detail();expect(screen.queryByRole('option',{name:/Samsung A15/})).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:/Ajouter au panier/}));await screen.findByRole('alert');
 change(/Modèle de téléphone/,'7');change('Quantité','99');expect(screen.getByLabelText('Quantité').value).toBe('20');
 fireEvent.click(screen.getByRole('button',{name:/Ajouter au panier/}));await screen.findByRole('heading',{name:/Votre panier/});
 await waitFor(()=>expect(JSON.parse(localStorage.getItem('new-arrivals-cart-v1'))[0].quantity).toBe(20));
 expect(JSON.parse(localStorage.getItem('na-recent'))[0].slug).toBe('coque');
});
it('change la photo du produit et ferme le zoom',async()=>{await detail();fireEvent.click(screen.getByRole('button',{name:'Voir photo 2'}));fireEvent.click(screen.getByTitle('Agrandir la photo'));expect(within(screen.getByRole('dialog')).getByRole('img').getAttribute('src')).toBe('/back.webp');fireEvent.click(screen.getByRole('button',{name:'Fermer le zoom'}));expect(screen.queryByRole('dialog')).toBeNull();});
it('interdit la commande quand le prix est à confirmer',async()=>{product.price_confirmed=false;await detail();expect(screen.getByRole('button',{name:/Ajouter au panier/}).disabled).toBe(true);expect(screen.getByText(/Cette photo est consultable/)).toBeTruthy();});
it('ajoute un accessoire sans modèle de téléphone',async()=>{product.kind='accessoire';await detail();fireEvent.click(screen.getByRole('button',{name:/Ajouter au panier/}));await screen.findByRole('heading',{name:/Votre panier/});expect(JSON.parse(localStorage.getItem('new-arrivals-cart-v1'))[0].variant_id).toBeNull();});
it('exige une photo pour la personnalisation',async()=>{product.customizable=true;await detail();change(/Modèle de téléphone/,'7');fireEvent.click(screen.getByRole('button',{name:/Ajouter au panier/}));expect(await screen.findByText('Ajoutez une photo pour votre housse personnalisée.')).toBeTruthy();expect(calls.some(c=>c.path==='/customizations/upload/')).toBe(false);expect(screen.getByTestId('route').textContent).toBe('/produit/coque');});
it.each([false,true])('traite un upload personnalisé avec erreur=%s',async(error)=>{product.customizable=true;if(error)errors.add('/customizations/upload/');await detail();change(/Modèle de téléphone/,'7');const file=new File(['image'],'client.png',{type:'image/png'});fireEvent.change(screen.getByLabelText(/Votre photo personnalisée/),{target:{files:[file]}});await screen.findByAltText('Aperçu de votre photo sur une housse');fireEvent.click(screen.getByRole('button',{name:/Ajouter au panier/}));if(error){await screen.findByText('Service indisponible');expect(JSON.parse(localStorage.getItem('new-arrivals-cart-v1'))).toEqual([])}else{await screen.findByRole('heading',{name:/Votre panier/});expect(JSON.parse(localStorage.getItem('new-arrivals-cart-v1'))[0].artwork_token).toBe('private-artwork')}expect(calls.find(x=>x.path==='/customizations/upload/').body).toBeInstanceOf(FormData);});
it('affiche une erreur de produit introuvable après échec du détail',async()=>{errors.add('/products/missing/');mount('/produit/missing');await screen.findByText(/Produit introuvable/);expect(screen.getByRole('link',{name:'Retour au catalogue'}).getAttribute('href')).toBe('/boutique');});
it('charge le détail absent du catalogue',async()=>{list=[];await detail();expect(calls.some(c=>c.path==='/products/coque/')).toBe(true)});
it('redirige les favoris anonymes vers le compte',async()=>{await detail();fireEvent.click(screen.getByRole('button',{name:'Ajouter aux favoris'}));expect(await screen.findByText('Connexion requise')).toBeTruthy();expect(screen.getByTestId('route').textContent).toBe('/mon-compte');});
it('modifie les quantités persistées, calcule le total et vide le panier',async()=>{cartSeed();mount('/panier');fireEvent.click(screen.getByRole('button',{name:'Augmenter'}));await waitFor(()=>expect(JSON.parse(localStorage.getItem('new-arrivals-cart-v1'))[0].quantity).toBe(3));expect(screen.getAllByText(/135\s*000 Ar/).length).toBeGreaterThan(0);fireEvent.click(screen.getByRole('button',{name:'Diminuer'}));await waitFor(()=>expect(JSON.parse(localStorage.getItem('new-arrivals-cart-v1'))[0].quantity).toBe(2));fireEvent.click(screen.getByRole('button',{name:'Retirer du panier'}));await screen.findByText('Votre panier est vide.');});
it('redirige une commande sans panier vers le panier',async()=>{mount('/commande');await screen.findByText('Votre panier est vide.');expect(screen.getByTestId('route').textContent).toBe('/panier');});
it.each([false,true])('enregistre une commande et traite un refus API=%s',async(error)=>{cartSeed();if(error)errors.add('/orders/');mount('/commande');await screen.findByText('037TEST');expect(screen.getByRole('button',{name:/Envoyer ma commande/}).disabled).toBe(true);change('Nom complet *','Alice');change('Téléphone *','0340000000');change('E-mail (facultatif)','alice@example.com');change('Ville *','Toamasina');change('Zone de livraison *','province');change('Adresse / point de livraison *','Rue 12');fireEvent.click(screen.getByLabelText('MVola'));expect(screen.getByText('034TEST')).toBeTruthy();change('Téléphone utilisé pour payer','0340000000');change('Référence de transaction *','TX-1');fireEvent.click(screen.getByRole('checkbox'));fireEvent.click(screen.getByRole('button',{name:/Envoyer ma commande/}));if(error){await screen.findByText('Service indisponible');expect(JSON.parse(localStorage.getItem('new-arrivals-cart-v1'))).toHaveLength(1)}else{await screen.findByText('NA-123');expect(screen.getByRole('link',{name:'Suivre ma commande'}).getAttribute('href')).toBe('/suivi/private-track');await waitFor(()=>expect(JSON.parse(localStorage.getItem('new-arrivals-cart-v1'))).toEqual([]))}expect(JSON.parse(calls.find(c=>c.path==='/orders/').body)).toMatchObject({zone:'province',payment_method:'mvola',items:[{product_id:1,variant_id:7,quantity:2}]});});
it('applique recherche, filtres, tri, pagination et réinitialisation',async()=>{
 mount('/boutique');await screen.findAllByRole('link',{name:/Coque test/});
 fireEvent.click(screen.getByRole('button',{name:'Filtres'}));expect(screen.getByRole('button',{name:'Filtres'}).getAttribute('aria-expanded')).toBe('true');
 for(const [label,value,key] of [['Rechercher','Bleu','search'],['Votre téléphone','iPhone 16','phone'],['Couleur','Bleu','color'],['Prix min. (Ar)','35000','min_price'],['Prix max. (Ar)','60000','max_price'],['Trier les produits','price_asc','sort']]){change(label,value);await waitFor(()=>expect(calls.some(c=>c.path==='/products/'&&c.query.get(key)===value)).toBe(true))}
 fireEvent.click(screen.getByLabelText('Luxe'));await waitFor(()=>expect(calls.some(c=>c.query.get('kind')==='luxe')).toBe(true));
 await screen.findByRole('button',{name:'Page suivante'});fireEvent.click(screen.getByRole('button',{name:'Page suivante'}));await waitFor(()=>expect(screen.getByTestId('route').textContent).toContain('page=2'));
 fireEvent.click(screen.getByRole('button',{name:'Page précédente'}));await waitFor(()=>expect(screen.getByTestId('route').textContent).toContain('page=1'));
 fireEvent.click(screen.getByRole('button',{name:'Vue liste'}));expect(screen.getByRole('button',{name:'Vue liste'}).getAttribute('aria-pressed')).toBe('true');
 fireEvent.click(screen.getByRole('button',{name:'Vue grille'}));fireEvent.click(screen.getByRole('button',{name:'Effacer'}));await waitFor(()=>expect(screen.getByTestId('route').textContent).toBe('/boutique'));
});
it.each([false,true])('affiche un catalogue vide ou une erreur=%s',async(error)=>{list=[];if(error)errors.add('/products/');mount('/boutique');await screen.findByText(error?'Service indisponible':'Aucune référence trouvée pour ces filtres.');});
it.each([false,true])('affiche le suivi livré ou une erreur=%s',async(error)=>{if(error)errors.add('/track/private-track/');mount('/suivi/private-track');if(error)await screen.findByText('Service indisponible');else{await screen.findByText('NA-123');expect(screen.getByRole('list',{name:'Progression de la commande'}).children).toHaveLength(6);expect(screen.getAllByText('Livrée')).toHaveLength(2)}});
it('utilise recherche, menu et fermeture du tiroir dans le vrai layout',async()=>{
 mount('/boutique',true);await screen.findAllByRole('link',{name:/Coque test/});
 fireEvent.click(screen.getByRole('button',{name:'Ouvrir le menu'}));expect(screen.getByRole('button',{name:'Fermer le menu'})).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'Fermer le menu'}));
 fireEvent.click(screen.getByRole('button',{name:'Rechercher'}));await userEvent.type(screen.getByLabelText('Recherche'),'coque bleue');fireEvent.submit(screen.getByLabelText('Recherche').closest('form'));await waitFor(()=>expect(screen.getByTestId('route').textContent).toBe('/boutique?search=coque%20bleue'));
 for(const close of ['Escape','outside','button']){fireEvent.click(screen.getByRole('button',{name:/Panier :/}));expect(screen.getByRole('dialog')).toBeTruthy();if(close==='Escape')fireEvent.keyDown(document,{key:'Escape'});if(close==='outside')fireEvent.pointerDown(document.body);if(close==='button')fireEvent.click(screen.getByRole('button',{name:'Fermer le panier'}));expect(screen.queryByRole('dialog')).toBeNull()}
});
it('affiche les articles du tiroir, permet leur suppression et revient au catalogue',async()=>{
 cartSeed();mount('/boutique',true);await screen.findAllByRole('link',{name:/Coque test/});fireEvent.click(screen.getByRole('button',{name:/Panier :/}));
 const dialog=screen.getByRole('dialog');expect(within(dialog).getByText('Coque test')).toBeTruthy();expect(within(dialog).getByRole('link',{name:'Passer commande'}).getAttribute('href')).toBe('/commande');
 fireEvent.click(within(dialog).getByRole('button',{name:'Retirer Coque test'}));await within(dialog).findByText('Votre panier est vide.');
 fireEvent.click(within(dialog).getByRole('link',{name:'Découvrir les produits'}));expect(screen.queryByRole('dialog')).toBeNull();
});
