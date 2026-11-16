import React from 'react';
import {it,expect,vi,beforeEach,afterEach} from 'vitest';
import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {AuthProvider,useAuth} from '../src/context/AuthContext';
import {CartProvider,useCart} from '../src/context/CartContext';
import Wishlist from '../src/ui/WishlistButton';
import Reset from '../src/pages/ResetNew';
import Account from '../src/pages/AccountNew';
import {api,saveToken,logout,getAccessToken} from '../src/lib/api';
let calls,fail,wishes,server,userId=100,hasAvatar;
const product={id:1,name:'Coque',kind:'simple',price:45000,variants:[{id:7,phone_model_name:'iPhone'}]};
const local={key:'1-7-base',product_id:1,variant_id:7,name:'Coque',price:45000,quantity:2};
beforeEach(()=>{logout();localStorage.clear();sessionStorage.clear();calls=[];fail='';wishes=[];server=[];hasAvatar=false;userId++;
 vi.stubGlobal('fetch',vi.fn(async(url,options={})=>{
  const path=String(url).replace('/api/v1','');calls.push({path,...options});
  if(path===fail)return {ok:false,status:400,json:async()=>({detail:'Refus du serveur'})};
  let data={};
  if(path==='/auth/me/')data={id:userId,name:'Alice',email:'alice@example.com',has_avatar:hasAvatar};
  if(path==='/wishlist/')data=wishes;
  if(path==='/cart/')data=server;
  if(path==='/addresses/'||path==='/my-orders/')data=[];
  if(path==='/auth/password-reset/confirm/')data={detail:'Mot de passe modifié'};
  return {ok:true,status:200,json:async()=>structuredClone(data),blob:async()=>new Blob(['image'],{type:'image/png'})};
 }));
 vi.spyOn(URL,'createObjectURL').mockReturnValue('blob:avatar');vi.spyOn(URL,'revokeObjectURL').mockImplementation(()=>{});
});
afterEach(()=>{cleanup();logout();vi.restoreAllMocks();vi.unstubAllGlobals()});
function CartProbe(){const cart=useCart(),auth=useAuth();return <><output data-testid="items">{JSON.stringify(cart.items)}</output><output data-testid="count">{cart.count}</output><button onClick={()=>cart.add(product,product.variants[0])}>Ajouter</button><button onClick={auth.signout}>Sortir</button></>}
function mount(children){render(<MemoryRouter><AuthProvider><CartProvider>{children}</CartProvider></AuthProvider></MemoryRouter>)}
it('fusionne le panier local et serveur sans doubler la même ligne, puis synchronise',async()=>{
 saveToken('access');localStorage.setItem('new-arrivals-cart-v1',JSON.stringify([local]));server=[{...local,quantity:3},{...local,key:'other',product_id:2,quantity:1}];mount(<CartProbe/>);
 await waitFor(()=>expect(screen.getByTestId('count').textContent).toBe('4'));
 fireEvent.click(screen.getByRole('button',{name:'Ajouter'}));await waitFor(()=>expect(screen.getByTestId('count').textContent).toBe('5'));
 await waitFor(()=>expect(calls.some(c=>c.path==='/cart/'&&c.method==='PUT')).toBe(true),{timeout:2000});
 expect(JSON.parse(calls.find(c=>c.method==='PUT').body).items).toHaveLength(2);
 fireEvent.click(screen.getByRole('button',{name:'Sortir'}));await waitFor(()=>expect(screen.getByTestId('items').textContent).toBe('[]'));
});
it('conserve le panier local si le chargement serveur échoue',async()=>{saveToken('access');fail='/cart/';localStorage.setItem('new-arrivals-cart-v1',JSON.stringify([local]));mount(<CartProbe/>);await waitFor(()=>expect(calls.some(c=>c.path==='/cart/')).toBe(true));expect(screen.getByTestId('count').textContent).toBe('2');});
it('récupère un panier vide lorsque le stockage est corrompu',()=>{localStorage.setItem('new-arrivals-cart-v1','invalid json');mount(<CartProbe/>);expect(screen.getByTestId('count').textContent).toBe('0');});
it('partage la liste de favoris entre deux composants et propage ajout et suppression',async()=>{saveToken('access');mount(<><Wishlist product={product}/><Wishlist product={product}/></>);await waitFor(()=>expect(calls.some(c=>c.path==='/wishlist/')).toBe(true));expect(calls.filter(c=>c.path==='/wishlist/')).toHaveLength(1);fireEvent.click(screen.getAllByRole('button',{name:'Ajouter aux favoris'})[0]);await waitFor(()=>expect(screen.getAllByRole('button',{name:'Retirer des favoris'})).toHaveLength(2));fireEvent.click(screen.getAllByRole('button',{name:'Retirer des favoris'})[1]);await waitFor(()=>expect(screen.getAllByRole('button',{name:'Ajouter aux favoris'})).toHaveLength(2));expect(calls.some(c=>c.path==='/wishlist/'&&c.method==='DELETE')).toBe(true);});
it('affiche le refus d’une action sur les favoris',async()=>{saveToken('access');mount(<Wishlist product={product}/>);await waitFor(()=>expect(calls.some(c=>c.path==='/wishlist/')).toBe(true));fail='/wishlist/';fireEvent.click(screen.getByRole('button',{name:'Ajouter aux favoris'}));await screen.findByText('Refus du serveur');expect(screen.getByRole('button',{name:'Ajouter aux favoris'}).disabled).toBe(false);});
it('déconnecte la session quand le refresh token est refusé',async()=>{saveToken('expired');sessionStorage.setItem('na_refresh_token','expired-refresh');globalThis.fetch=vi.fn(async()=>({ok:false,status:401,json:async()=>({detail:'Session expirée'})}));await expect(api('/private/',{auth:true})).rejects.toThrow('Session expirée');expect(getAccessToken()).toBe('');expect(sessionStorage.getItem('na_refresh_token')).toBeNull();});
it('partage un seul refresh entre deux requêtes concurrentes',async()=>{saveToken('old');sessionStorage.setItem('na_refresh_token','refresh');globalThis.fetch=vi.fn(async(url,options)=>{if(String(url).endsWith('/auth/refresh/'))return {ok:true,status:200,json:async()=>({access:'new'})};return {ok:options.headers.Authorization==='Bearer new',status:options.headers.Authorization==='Bearer new'?200:401,json:async()=>({ok:true})}});await expect(Promise.all([api('/a',{auth:true}),api('/b',{auth:true})])).resolves.toEqual([{ok:true},{ok:true}]);expect(fetch.mock.calls.filter(([url])=>String(url).endsWith('/auth/refresh/'))).toHaveLength(1);});
it('confirme le mot de passe avec le lien privé et transmet le nouveau secret',async()=>{render(<MemoryRouter initialEntries={['/reinitialiser?uid=abc&token=private-token']}><Reset/></MemoryRouter>);fireEvent.change(screen.getByLabelText('Nouveau mot de passe'),{target:{value:'NewSecret123!'}});fireEvent.click(screen.getByRole('button',{name:'Envoyer'}));await screen.findByText('Mot de passe modifié');expect(JSON.parse(calls.find(c=>c.path==='/auth/password-reset/confirm/').body)).toEqual({uid:'abc',token:'private-token',password:'NewSecret123!'});});
it('charge et supprime une photo de profil privée',async()=>{saveToken('access');hasAvatar=true;mount(<Account/>);await screen.findByText('Bonjour Alice');fireEvent.click(screen.getByRole('button',{name:'Profil et adresses'}));await screen.findByAltText('Votre photo de profil');expect(calls.find(c=>c.path==='/auth/avatar/').headers.Authorization).toBe('Bearer access');hasAvatar=false;fireEvent.click(screen.getByRole('button',{name:'Supprimer la photo'}));await screen.findByText('Photo supprimée.');expect(calls.some(c=>c.path==='/auth/avatar/'&&c.method==='DELETE')).toBe(true);expect(screen.queryByAltText('Votre photo de profil')).toBeNull();});
