import React from 'react';
import {it,expect,vi,beforeEach,afterEach} from 'vitest';
import {render,screen,fireEvent,cleanup,waitFor} from '@testing-library/react';
import {AdminContent,AdminCustomers,AdminStock,AdminProductEditor} from '../src/ui/AdminExtras';
import Admin from '../src/pages/AdminNew';
import {StoreProvider} from '../src/context/StoreContext';
import {MemoryRouter} from 'react-router-dom';
import {saveToken,logout} from '../src/lib/api';
let calls,fail;
beforeEach(()=>{calls=[];fail=false;vi.stubGlobal('fetch',vi.fn(async(url,options={})=>{
 const path=String(url).replace('/api/v1','');calls.push({path,...options});
 if(fail)return {ok:false,status:403,json:async()=>({detail:'Accès refusé'})};
 let data=[];
 if(path==='/banners/')data=[{id:1,title:'Promotion',active:true}];
 if(path==='/admin/reviews/')data=[{id:2,display_name:'Alice',rating:5,body:'Bonne coque',approved:false}];
 if(path==='/admin/customers/')data={users:[{id:1,first_name:'Alice',email:'alice@test.fr',is_active:true}],customers:[{customer_name:'Bob',customer_phone:'034',orders:2}]};
 if(path==='/admin/stock-movements/')data=[{id:1,product:'Coque',variant:'Bleu',delta:-1,reason:'Vente',order:'NA-1',created_at:'2026-11-16'}];
 if(path.startsWith('/products/?'))data={results:[{id:1,name:'Coque',slug:'coque',price:45000,kind:'simple',price_confirmed:true}]};
 if(path.startsWith('/admin/variants/?'))data=[{id:2,product:1,color:'Bleu',status:'sur_commande',stock_count:1}];
 return {ok:true,status:200,json:async()=>data};
}));});
afterEach(()=>{cleanup();vi.unstubAllGlobals();logout()});
it('administre le catalogue et enregistre la configuration',async()=>{
 saveToken('access');
 const original=globalThis.fetch;
 vi.stubGlobal('fetch',vi.fn(async(url,options={})=>{
  const path=String(url).replace('/api/v1','');
  const data=path==='/auth/me/'?{id:1,is_staff:true}:path==='/orders/'?[]:path==='/admin/dashboard/'?{}:path==='/site-config/'?{hero_title:'Collection'}:null;
  if(data!==null){calls.push({path,...options});return {ok:true,status:200,json:async()=>data};}
  return original(url,options);
 }));
 render(<MemoryRouter><StoreProvider><Admin/></StoreProvider></MemoryRouter>);
 await screen.findByText('Gestion');fireEvent.click(screen.getByRole('button',{name:'Produits'}));
 await screen.findByLabelText('Prix Coque');fireEvent.blur(screen.getByLabelText('Prix Coque'),{target:{value:'49000'}});
 await screen.findByText('Produit mis à jour');
 expect(JSON.parse(calls.find(c=>c.method==='PATCH').body)).toEqual({price:49000});
 fireEvent.click(screen.getByRole('button',{name:'Configuration'}));
 fireEvent.change(screen.getByLabelText('Titre principal'),{target:{value:'Nouvelle collection'}});
 fireEvent.click(screen.getByRole('button',{name:'Enregistrer la configuration'}));
 await screen.findByText('Configuration enregistrée.');
 expect(calls.some(c=>c.path==='/site-config/'&&c.method==='PATCH'&&JSON.parse(c.body).hero_title==='Nouvelle collection')).toBe(true);
 fireEvent.click(screen.getByRole('button',{name:'Déconnexion'}));expect(screen.getByLabelText('E-mail administrateur')).toBeTruthy();
});
it.each([AdminContent,AdminCustomers,AdminStock,AdminProductEditor])('affiche les erreurs de chargement de %s',async(Component)=>{fail=true;render(<Component/>);await screen.findByText('Accès refusé');});
it.each(['Approuver','Supprimer','Désactiver'])('effectue la modération %s',async(action)=>{render(<AdminContent/>);await screen.findByText('Promotion');fireEvent.click(screen.getByRole('button',{name:action}));await screen.findByText('Enregistré');expect(calls.some(c=>c.method===(action==='Supprimer'?'DELETE':'PATCH'))).toBe(true);});
it('crée une bannière avec les champs saisis',async()=>{render(<AdminContent/>);await screen.findByText('Promotion');for(const [name,value] of [['title','Été'],['subtitle','Collection'],['url','/boutique']])fireEvent.change(screen.getByLabelText(name),{target:{value}});fireEvent.click(screen.getByLabelText(/Active/));fireEvent.click(screen.getByRole('button',{name:'Créer une bannière'}));await screen.findByText('Enregistré');expect(JSON.parse(calls.find(c=>c.method==='POST').body)).toEqual({title:'Été',subtitle:'Collection',url:'/boutique',active:false});});
it('bloque un compte client et recharge la liste',async()=>{render(<AdminCustomers/>);await screen.findByText('alice@test.fr');fireEvent.click(screen.getByRole('button',{name:'Bloquer'}));await waitFor(()=>expect(calls.some(c=>c.method==='PATCH')).toBe(true));expect(JSON.parse(calls.find(c=>c.method==='PATCH').body)).toEqual({user_id:1,is_active:false});});
it('affiche les mouvements réels du stock',async()=>{render(<AdminStock/>);await screen.findByText('Coque');expect(screen.getByText('NA-1')).toBeTruthy();expect(screen.getByText('-1')).toBeTruthy();});
it('sélectionne un produit et suspend ses commandes',async()=>{render(<AdminProductEditor/>);await screen.findByRole('option',{name:/Coque/});fireEvent.change(screen.getByLabelText('Produit'),{target:{value:'1'}});await screen.findByRole('button',{name:'Suspendre les commandes'});fireEvent.click(screen.getByRole('button',{name:'Suspendre les commandes'}));await screen.findByText('Modification enregistrée.');expect(JSON.parse(calls.find(c=>c.method==='PATCH').body)).toEqual({price_confirmed:false});});
