/** Skeletons adaptés au contexte et accessibles aux technologies d'assistance. */
export default function Skeleton({count=6,variant='products'}){
  if(variant==='form'||variant==='detail'||variant==='article')return <div className={'na-skeleton-page '+variant} role="status" aria-label="Chargement" aria-busy="true">
    <span className="sk-title"/><span className="sk-line"/><span className="sk-line medium"/>
    {variant==='detail'&&<div className="sk-photo"/>}
    {Array.from({length:variant==='form'?4:3},(_,i)=><span className="sk-field" key={i}/>)}
  </div>;
  if(variant==='timeline')return <div className="na-skeleton-page timeline" role="status" aria-label="Chargement du suivi" aria-busy="true"><span className="sk-title"/><div className="sk-track">{Array.from({length:6},(_,i)=><span key={i}/>)}</div><span className="sk-field"/><span className="sk-field"/></div>;
  if(variant==='dashboard')return <div role="status" aria-label="Chargement de l'administration" aria-busy="true" className="na-skeleton-dashboard">{Array.from({length:4},(_,i)=><div className="na-skeleton" key={i}><span/><span/></div>)}</div>;
  return <div className="product-grid" role="status" aria-label="Chargement des produits" aria-busy="true">{Array.from({length:count},(_,i)=><div className="na-skeleton" key={i}><div/><span/><span/></div>)}</div>;
}
