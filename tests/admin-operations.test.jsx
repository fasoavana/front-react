import React from 'react';
import {it,expect,vi,beforeEach,afterEach} from 'vitest';
import {render,screen,fireEvent,cleanup,waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import Admin from '../src/pages/AdminNew';
import {StoreProvider} from '../src/context/StoreContext';
import {saveToken,logout} from '../src/lib/api';

let calls,staff,errorPath;
beforeEach(()=>{
 logout();calls=[];staff=true;errorPath='';
 vi.stubGlobal('fetch',vi.fn(async(url,options={})=>{
  const path=String(url).replace('/api/v1','');calls.push({path,...options});
  if(path===errorPath)return {ok:false,status:403,json:async()=>({detail:'Action interdite'})};
  let data={};
  if(path==='/auth/token/')data={access:'access',refresh:'refresh'};
  if(path==='/auth/me/')data={id:1,is_staff:staff};
  if(path.startsWith('/products/?'))data={results:[{id:1,name:'Coque',slug:'coque',price:45000,kind:'simple',active:true,variants:[{id:7,phone_model_name:'iPhone'}]}]};
  if(path==='/categories/')data=[{id:2,name:'Luxe'}];
  if(path==='/phone-models/')data=[];
  if(path==='/site-config/')data={min_delivery_days:9};
  if(path==='/orders/')data=options.method==='POST'?{reference:'FB-2'}:[{id:1,reference:'NA-1',customer_name:'Alice',total:45000,required_payment:22500,payment_status:'declare',status:'attente_acompte',source:'facebook'}];
  if(path==='/admin/dashboard/')data={day:{total:45000,count:1},week:{total:45000,paid:22500},month:{total:45000,count:1},pending_payment:1,by_source:[{source:'facebook',count:1},{source:'web',count:1}]};
  return {ok:true,status:200,json:async()=>data};
 }));
});
afterEach(()=>{cleanup();logout();vi.unstubAllGlobals()});
function mount(){render(<MemoryRouter><StoreProvider><Admin/></StoreProvider></MemoryRouter>)}
async function authenticated(){saveToken('access');mount();await screen.findByText('Gestion')}
const change=(label,value)=>fireEvent.change(screen.getByLabelText(label),{target:{value}});
it.each([true,false])('authentifie un administrateur, droits staff=%s',async(allowed)=>{staff=allowed;mount();change('E-mail administrateur','admin@test.fr');change('Mot de passe','Secret123!');fireEvent.submit(screen.getByLabelText('E-mail administrateur').closest('form'));if(allowed)await screen.findByText('Gestion');else await screen.findByText('Compte administrateur requis.');});
it('refuse une session valide sans droits administrateur',async()=>{staff=false;saveToken('access');mount();await screen.findByText('Ce compte n’a pas les droits administrateur.');expect(screen.queryByRole('button',{name:'Commandes'})).toBeNull()});
it('affiche une erreur de session',async()=>{errorPath='/auth/me/';saveToken('access');mount();expect(await screen.findByText('Action interdite')).toBeTruthy();expect(screen.getByLabelText('E-mail administrateur')).toBeTruthy();expect(screen.queryByRole('button',{name:'Commandes'})).toBeNull()});
it.each([false,true])('met à jour les états de paiement et commande, erreur=%s',async(error)=>{await authenticated();fireEvent.click(screen.getByRole('button',{name:'Commandes'}));await screen.findByText('NA-1');const selects=screen.getAllByRole('combobox');fireEvent.change(selects[0],{target:{value:'verifie'}});fireEvent.change(selects[1],{target:{value:'preparation'}});if(error)errorPath='/orders/1/manage/';fireEvent.click(screen.getByRole('button',{name:'Enregistrer'}));await screen.findByText(error?'Action interdite':'Commande mise à jour.');expect(JSON.parse(calls.find(c=>c.path==='/orders/1/manage/').body)).toEqual({payment_status:'verifie',status:'preparation'});});
it.each(['CSV','Facture PDF'])('affiche les refus du téléchargement %s',async(action)=>{await authenticated();fireEvent.click(screen.getByRole('button',{name:'Commandes'}));errorPath=action==='CSV'?'/orders/export-csv/':'/orders/1/invoice/';fireEvent.click(screen.getByRole('button',{name:action}));await screen.findByText(action==='CSV'?'Export refusé':'Document indisponible')});
it('crée un produit brouillon et modifie sa publication',async()=>{await authenticated();fireEvent.click(screen.getByRole('button',{name:'Produits'}));await screen.findByLabelText('Publié Coque');fireEvent.click(screen.getByLabelText('Publié Coque'));await screen.findByText('Produit mis à jour');expect(JSON.parse(calls.find(c=>c.path==='/products/coque/').body)).toEqual({active:false});change('Nom','Nouvelle coque');change('Identifiant URL (slug)','nouvelle-coque');change('Prix en Ar','50000');change('Type','luxe');change('Catégorie','2');fireEvent.click(screen.getByRole('button',{name:'Créer le produit'}));await screen.findByText(/Produit créé en brouillon/);expect(JSON.parse(calls.find(c=>c.path==='/products/'&&c.method==='POST').body)).toEqual({name:'Nouvelle coque',slug:'nouvelle-coque',price:50000,kind:'luxe',category:2,on_order:true,active:false});});
it('enregistre une vente Facebook avec variante et prix négocié',async()=>{await authenticated();fireEvent.click(screen.getByRole('button',{name:'Vente Facebook'}));for(const [label,value] of [['Nom du client','Alice'],['Téléphone','034'],['Adresse','Rue 1'],['Ville','Toamasina'],['Zone','province'],['Paiement','mvola'],['Référence de paiement (si reçue)','TX'],['Acompte déclaré (Ar)','45000'],['Note interne','Livrer après appel']])change(label,value);
 const row=document.querySelector('.sale-row');fireEvent.change(row.querySelectorAll('select')[0],{target:{value:'1'}});fireEvent.change(row.querySelectorAll('select')[1],{target:{value:'7'}});change('Quantité','2');change('Prix négocié par unité, facultatif','40000');
 fireEvent.click(screen.getByRole('button',{name:'+ Ajouter une ligne'}));expect(screen.getAllByLabelText('Quantité')).toHaveLength(2);fireEvent.click(screen.getAllByRole('button',{name:'×'})[1]);
 fireEvent.click(screen.getByRole('button',{name:'Enregistrer la vente Facebook'}));await screen.findByText(/Vente Facebook enregistrée : FB-2/);expect(JSON.parse(calls.find(c=>c.path==='/orders/'&&c.method==='POST').body)).toMatchObject({source:'facebook',zone:'province',payment_method:'mvola',items:[{product_id:1,variant_id:7,quantity:2,negotiated_unit_price:40000}]});
});
