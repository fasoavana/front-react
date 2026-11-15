import {useEffect} from 'react';

/** Metas pour navigation client ; métadonnées OG serveur pour robots sociaux dans Nginx/Django. */
export default function SEO({title='NEW ARRIVALS',description='Housses sur commande et accessoires à Madagascar.',image}){
  useEffect(()=>{
    const pageTitle=title==='NEW ARRIVALS'?title:`${title} | NEW ARRIVALS`;
    document.title=pageTitle;
    const canonical=new URL(window.location.pathname,window.location.origin).toString();
    const picture=image?new URL(image,window.location.origin).toString():new URL('/favicon.svg',window.location.origin).toString();
    const fields=[['name','description',description],['property','og:title',pageTitle],['property','og:description',description],
      ['property','og:type','website'],['property','og:url',canonical],['property','og:image',picture],['name','twitter:card','summary_large_image']];
    for(const [att,key,value] of fields){let node=document.head.querySelector(`meta[${att}="${key}"]`);if(!node){node=document.createElement('meta');node.setAttribute(att,key);document.head.appendChild(node)}node.setAttribute('content',value)}
    let link=document.head.querySelector('link[rel="canonical"]');if(!link){link=document.createElement('link');link.rel='canonical';document.head.appendChild(link)}link.href=canonical;
  },[title,description,image]);
  return null;
}
