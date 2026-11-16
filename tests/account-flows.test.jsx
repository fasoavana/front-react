import React from 'react';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import Account from '../src/pages/AccountNew';
import {AuthProvider} from '../src/context/AuthContext';
import {saveToken,logout} from '../src/lib/api';

let requests, fail;
const user={id:1,name:'Alice',email:'alice@example.com'};
beforeEach(()=>{
 logout();localStorage.clear();sessionStorage.clear();requests=[];fail='';
 vi.stubGlobal('fetch',vi.fn(async(url,options={})=>{
  const path=String(url).replace('/api/v1',''); requests.push({path,...options});
  if(path===fail)return {ok:false,status:400,json:async()=>({detail:'Action refusée'})};
  let data={};
  if(path==='/auth/me/')data=user;
  if(path==='/auth/token/')data={access:'access',refresh:'refresh'};
  if(path==='/my-orders/')data=[{id:8,reference:'NA-8',status:'livree',total:45000,tracking_token:'track',items:[{id:9,product_name:'Coque'}]}];
  if(path==='/wishlist/'||path==='/addresses/')data=options.method==='POST'?{id:2,...JSON.parse(options.body)}:[];
  return {ok:true,status:200,json:async()=>data};
 }));
});
afterEach(()=>{cleanup();vi.unstubAllGlobals();logout()});
function mount(){return render(<MemoryRouter><AuthProvider><Account/></AuthProvider></MemoryRouter>)}
async function profile(){saveToken('access');mount();await screen.findByText('Bonjour Alice');fireEvent.click(screen.getByRole('button',{name:'Profil et adresses'}));}
function change(label,value){fireEvent.change(screen.getByLabelText(label),{target:{value}})}

it.each(['Connexion','Inscription'])('authentifie via %s et permet la déconnexion',async(mode)=>{
 mount();fireEvent.click(screen.getByRole('button',{name:mode}));
 if(mode==='Inscription')change('Nom','Alice');
 change('E-mail','alice@example.com');change('Mot de passe','Secret123!');
 fireEvent.click(screen.getByRole('button',{name:mode==='Connexion'?'Se connecter':'Créer mon compte'}));
 await screen.findByText('Bonjour Alice');
 expect(requests.some(r=>r.path==='/auth/token/'&&JSON.parse(r.body).username==='alice@example.com')).toBe(true);
 if(mode==='Inscription')expect(requests.some(r=>r.path==='/auth/register/')).toBe(true);
 fireEvent.click(screen.getByRole('button',{name:'Déconnexion'}));expect(screen.getByRole('button',{name:mode==='Connexion'?'Se connecter':'Créer mon compte'})).toBeTruthy();expect(screen.queryByText('Bonjour Alice')).toBeNull();
});
it('affiche le refus de connexion',async()=>{fail='/auth/token/';mount();change('E-mail','alice@example.com');change('Mot de passe','Secret123!');fireEvent.click(screen.getByRole('button',{name:'Se connecter'}));expect(await screen.findByText('Action refusée')).toBeTruthy();expect(screen.queryByText('Bonjour Alice')).toBeNull();expect(sessionStorage.getItem('na_access_token')).toBeNull();});
it.each([false,true])('enregistre le profil et traite une erreur=%s',async(error)=>{await profile();if(error)fail='/auth/me/';change('Nom','Alice Martin');fireEvent.click(screen.getByRole('button',{name:'Enregistrer'}));await screen.findByText(error?'Action refusée':'Profil mis à jour.');expect(requests.some(r=>r.method==='PATCH'&&JSON.parse(r.body).name==='Alice Martin')).toBe(true);});
it.each([false,true])('ajoute une adresse et traite une erreur=%s',async(error)=>{await profile();if(error)fail='/addresses/';change('Nom de l’adresse','Travail');change('Adresse','Rue 12');change('Ville','Toamasina');change('Téléphone','0340000000');change('Zone','province');fireEvent.click(screen.getByRole('button',{name:"Ajouter l'adresse"}));await screen.findByText(error?'Action refusée':'Adresse enregistrée.');if(!error){expect(screen.getByText(/Travail : Rue 12/)).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'Supprimer'}));await waitFor(()=>expect(screen.queryByText(/Travail : Rue 12/)).toBeNull());}});
it.each([false,true])('soumet un avis livré et traite une erreur=%s',async(error)=>{saveToken('access');mount();await screen.findByText('NA-8');if(error)fail='/reviews/submit/';change('Évaluation','4');fireEvent.change(screen.getByPlaceholderText('Votre avis sur cette housse'),{target:{value:'Bonne protection'}});fireEvent.click(screen.getByRole('button',{name:'Envoyer'}));await screen.findByText(error?'Action refusée':'Avis reçu, en attente de modération.');expect(screen.getByRole('link',{name:'Suivre'}).getAttribute('href')).toBe('/suivi/track');});
it('affiche les listes personnelles vides',async()=>{saveToken('access');mount();await screen.findByText('Bonjour Alice');fireEvent.click(screen.getByRole('button',{name:'Favoris'}));await screen.findByText('Ajoutez des housses avec le bouton cœur.');fireEvent.click(screen.getByRole('button',{name:'Récemment vus'}));expect(screen.getByText("Vous n'avez pas encore consulté de produit.")).toBeTruthy();});
it('refuse une photo de plus de 3 Mo avant tout upload',async()=>{await profile();const file=new File([new Uint8Array(3*1024*1024+1)],'photo.jpg',{type:'image/jpeg'});fireEvent.change(screen.getByLabelText(/Photo de profil \(JPG/),{target:{files:[file]}});await screen.findByText('Photo : 3 Mo maximum.');expect(requests.some(r=>r.path==='/auth/avatar/')).toBe(false);});
it.each([false,true])('envoie une photo et traite une erreur=%s',async(error)=>{await profile();if(error)fail='/auth/avatar/';fireEvent.change(screen.getByLabelText(/Photo de profil \(JPG/),{target:{files:[new File(['image'],'photo.jpg',{type:'image/jpeg'})]}});await screen.findByText(error?'Action refusée':'Photo de profil enregistrée.');expect(requests.find(r=>r.path==='/auth/avatar/').body).toBeInstanceOf(FormData);});
