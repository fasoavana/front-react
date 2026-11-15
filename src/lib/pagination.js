/** Pages utiles, avec ellipses calculées dans le composant (large catalogue). */
export function pageNumbers(page,last){
  if(!Number.isInteger(page)||!Number.isInteger(last)||last<1)return [];
  const set=new Set([1,last,page,page-1,page+1]);
  return [...set].filter(n=>n>=1&&n<=last).sort((a,b)=>a-b);
}
