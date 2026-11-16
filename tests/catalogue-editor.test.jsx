import React from 'react';
import {it,expect,vi,beforeEach,afterEach} from 'vitest';
import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';
import {AdminProductEditor} from '../src/ui/AdminExtras';

let calls,fail,images,variants,products;
beforeEach(()=>{
 calls=[];fail='';images=[{id:10,product:1,image:'/a.webp',order:0},{id:11,product:1,image:'/b.webp',order:1}];
 variants=[{id:7,product:1,color:'Bleu',phone_model_name:'iPhone',status:'sur_commande',stock_count:2}];
 products=[{id:1,name:'Coque',slug:'coque',price:45000,kind:'simple',price_confirmed:false}];
 vi.stubGlobal('fetch',vi.fn(async(url,options={})=>{
  const path=String(url).replace('/api/v1','');calls.push({path,...options});
  if(path===fail)return {ok:false,status:400,json:async()=>({detail:'Modification refusée'})};
  let data={};
  if(path.startsWith('/products/?'))data={results:products};
  if(path==='/phone-models/')data=[{id:3,name:'iPhone'}];
  if(path.startsWith('/admin/product-images/?'))data=images;
  if(path.startsWith('/admin/variants/?'))data=variants;
  if(path==='/admin/variants/'&&options.method==='POST'){data={id:8,...JSON.parse(options.body)};variants.push(data)}
  if(path==='/admin/product-images/'&&options.method==='POST'){data={id:12,product:1,image:'/new.webp',order:2};images.push(data)}
  if(path==='/products/coque/duplicate/'){data={id:2};products.push({...products[0],id:2,slug:'copie',name:'Copie'})}
  return {ok:true,status:200,json:async()=>structuredClone(data)};
 }));
});
afterEach(()=>{cleanup();vi.unstubAllGlobals()});
async function selected(){render(<AdminProductEditor/>);await screen.findByRole('option',{name:/Coque/});fireEvent.change(screen.getByLabelText('Produit'),{target:{value:'1'}});await screen.findByLabelText('État variante');await screen.findByAltText('Photo 1')}
const change=(label,value)=>fireEvent.change(screen.getByLabelText(label),{target:{value}});
it('valide le tarif et la classification avant commercialisation',async()=>{await selected();change('Type réel de housse','luxe');change('Prix validé (Ar)','49000');fireEvent.click(screen.getByRole('button',{name:'Valider le tarif et autoriser la vente'}));await screen.findByText('Modification enregistrée.');expect(JSON.parse(calls.find(c=>c.path==='/products/coque/'&&c.method==='PATCH').body)).toEqual({kind:'luxe',price:49000,price_confirmed:true});});
it('crée une variante avec un téléphone, couleur et stock',async()=>{await selected();change('Modèle de téléphone','3');change('Couleur','Rouge');change('Disponibilité','en_stock');change('Stock','4');fireEvent.click(screen.getByRole('button',{name:'Ajouter la variante'}));await screen.findByText('Rouge');expect(JSON.parse(calls.find(c=>c.path==='/admin/variants/'&&c.method==='POST').body)).toEqual({phone_model:3,color:'Rouge',status:'en_stock',stock_count:4,product:1});});
it('modifie le statut et le stock puis supprime une variante',async()=>{await selected();change('État variante','en_stock');await screen.findByText('Modification enregistrée.');fireEvent.blur(screen.getByLabelText('Stock variante'),{target:{value:'5'}});await waitFor(()=>expect(calls.some(c=>c.method==='PATCH'&&JSON.parse(c.body).stock_count===5)).toBe(true));const row=screen.getByLabelText('Stock variante').closest('tr');fireEvent.click(row.querySelector('button'));await waitFor(()=>expect(screen.queryByLabelText('Stock variante')).toBeNull());expect(calls.some(c=>c.path==='/admin/variants/7/'&&c.method==='DELETE')).toBe(true);});
it('affiche un refus de modification sans perdre la variante',async()=>{await selected();fail='/admin/variants/7/';change('État variante','indisponible');await screen.findByText('Modification refusée');expect(screen.getByLabelText('État variante').value).toBe('sur_commande')});
it('importe et supprime une photo produit',async()=>{await selected();fireEvent.change(screen.getByLabelText('Importer des photos produit'),{target:{files:[new File(['image'],'new.webp',{type:'image/webp'})]}});await screen.findByAltText('Photo 3');expect(calls.find(c=>c.path==='/admin/product-images/'&&c.method==='POST').body).toBeInstanceOf(FormData);fireEvent.click(screen.getByAltText('Photo 3').closest('.admin-image').querySelector('button'));await waitFor(()=>expect(screen.queryByAltText('Photo 3')).toBeNull());expect(calls.some(c=>c.path==='/admin/product-images/12/'&&c.method==='DELETE')).toBe(true);});
it('réordonne les photos par glisser-déposer',async()=>{await selected();const first=screen.getByAltText('Photo 1').closest('.admin-image'),second=screen.getByAltText('Photo 2').closest('.admin-image');fireEvent.dragStart(first);fireEvent.dragOver(second);fireEvent.drop(second);await screen.findByText('Modification enregistrée.');expect(JSON.parse(calls.find(c=>c.path==='/admin/product-images/reorder/').body)).toEqual({product:1,ids:[11,10]});expect(screen.getByAltText('Photo 1').getAttribute('src')).toBe('/b.webp');});
it('duplique un produit et sélectionne la copie',async()=>{await selected();fireEvent.click(screen.getByRole('button',{name:'Dupliquer ce produit'}));await waitFor(()=>expect(screen.getByLabelText('Produit').value).toBe('2'));expect(calls.some(c=>c.path==='/products/coque/duplicate/'&&c.method==='POST')).toBe(true);});
it('désactive la validation du prix non commercialisable',async()=>{await selected();change('Prix validé (Ar)','100');expect(screen.getByRole('button',{name:'Valider le tarif et autoriser la vente'}).disabled).toBe(true);change('Prix validé (Ar)','45000');change('Type réel de housse','non_classe');expect(screen.getByRole('button',{name:'Valider le tarif et autoriser la vente'}).disabled).toBe(true);});
