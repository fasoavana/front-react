import React from 'react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App.jsx';
import { AuthProvider } from '../src/context/AuthContext.jsx';
import { CartProvider, useCart } from '../src/context/CartContext.jsx';
import { ariary } from '../src/lib/api.js';

const demo = { id: 4, name: 'Housse personnalisée — effet verre brillant', slug: 'personnalisee-effet-verre',
  price: 36000, cover_url: '/catalog/personnalisee-ref-3.webp', category_name: 'Personnalisées', kind: 'personnalisee',
  description: 'Votre photo au dos.', is_new:true, active:true, customizable:true, on_order:true,
  variants: [{ id:7,phone_model_name:'Samsung Galaxy A15', color:'Photo du client', status:'sur_commande' }] };
const leopard = { id: 5, name:'Léopard & cœur doré',slug:'leopard-coeur', price: 42000,
  cover_url:'/catalog/leopard-coeur.webp',category_name:'Luxe',kind:'luxe',description:'Housse luxe sur commande.',
  is_new:true, active:true, customizable:false,on_order:true,variants:[{id:8,phone_model_name:'Huawei Pura 80 Pro',color:'Selon photo',status:'sur_commande'}]};
const response = data => ({ ok:true, json:async()=>data });
function setupFetch() {
  globalThis.fetch=vi.fn(async input=>{
    const path=String(input);
    if(path.includes('/products/')){const list=path.includes('kind=personnalisee')?[demo]:[demo,leopard];return response({count:list.length,next:null,results:list});}
    if(path.includes('/categories/'))return response({count:2,results:[{id:1,slug:'luxe',name:'Luxe'},{id:2,slug:'personnalisee',name:'Personnalisées'}]});
    if(path.includes('/phone-models/'))return response([{id:1,name:'Samsung Galaxy A15',brand:'Samsung'}]);
    if(path.includes('/site-config/'))return response({orange_number:'0375578480',mvola_number:'0348595149',min_delivery_days:9,max_delivery_days:15});
    return {ok:false,status:404,json:async()=>({detail:'Introuvable'})};
  });
}
const screenAt=(route='/')=>render(<MemoryRouter initialEntries={[route]}><AuthProvider><CartProvider><App/></CartProvider></AuthProvider></MemoryRouter>);
beforeEach(()=>{localStorage.clear();sessionStorage.clear();setupFetch();vi.stubGlobal('scrollTo',vi.fn())});
afterEach(()=>{cleanup();vi.restoreAllMocks();});

describe('NEW ARRIVALS — règles commerciales',()=>{
  it('formate les prix en Ariary, sans euro',()=>{
    expect(ariary(36000)).toBe('36 000 Ar');
    expect(ariary(55000)).toBe('55 000 Ar');
  });
  it('affiche la marque et le tarif réel de la personnalisation',async()=>{
    screenAt('/');
    expect(screen.getAllByText(/NEW ARRIVALS/).length).toBeGreaterThan(0);
    await waitFor(()=>expect(screen.getAllByText(/36\s*000 Ar/).length).toBeGreaterThan(0));
    expect(screen.getAllByText(/9–15 jours/).length).toBeGreaterThan(0);
  });
  it('filtre les housses personnalisées sans inventer de produits',async()=>{
    screenAt('/boutique?kind=personnalisee');
    await waitFor(()=>expect(screen.getAllByText('Housse personnalisée — effet verre brillant').length).toBeGreaterThan(0));
    expect(screen.queryByText('Léopard & cœur doré')).toBeNull();
  });
  it('le panier conserve le tarif du produit au moment de la sélection',async()=>{
    function Demo(){const c=useCart();return <div><button onClick={()=>c.add(leopard,leopard.variants[0],2)}>Ajouter</button><output>{c.total}</output><output>{c.count}</output></div>}
    const user=userEvent.setup();render(<AuthProvider><CartProvider><Demo/></CartProvider></AuthProvider>);
    await user.click(screen.getByRole('button',{name:'Ajouter'}));
    expect(screen.getByText('84000')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
  });
});
