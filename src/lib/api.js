const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1';
let access = sessionStorage.getItem('na_access_token') || '';
export function getAccessToken() { return access; }
export function saveToken(token) { access = token || ''; if (token) sessionStorage.setItem('na_access_token', token); else sessionStorage.removeItem('na_access_token'); }
export function logout() { saveToken(''); sessionStorage.removeItem('na_refresh_token'); }
let refreshing = null;
async function refreshAccess() {
  const refresh = sessionStorage.getItem('na_refresh_token');
  if (!refresh) return false;
  if (!refreshing) refreshing=fetch(`${API_BASE}/auth/refresh/`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({refresh})})
    .then(async res=>{if(!res.ok)throw new Error('Session expirée');const data=await res.json();saveToken(data.access);return true;})
    .catch(()=>{logout();return false;}).finally(()=>{refreshing=null});
  return refreshing;
}
export async function api(path, { method = 'GET', body, auth = false, ...options } = {}) {
  const headers = { ...(options.headers || {}) };
  if (body != null && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (auth && access) headers.Authorization = `Bearer ${access}`;
  const payload=body instanceof FormData ? body : body!=null ? JSON.stringify(body) : undefined;
  let res=await fetch(`${API_BASE}${path}`, {...options,method,headers,body:payload});
  if (res.status===401 && auth && await refreshAccess()) {
    res=await fetch(`${API_BASE}${path}`, {...options,method,headers:{...headers,Authorization:`Bearer ${access}`},body:payload});
  }
  let data=null;
  try { data=await res.json(); } catch { /* réponse vide ou non JSON */ }
  if (!res.ok) {
    const msg = data?.detail || data?.error || (data && typeof data === 'object' ? Object.entries(data).map(([k,v])=>`${k} : ${Array.isArray(v)?v.join(' · '):v}`).join(' · ') : '') || `Erreur HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}
export async function login(email, password) {
  const data = await api('/auth/token/', { method: 'POST', body: { username: email, password } });
  saveToken(data.access);
  sessionStorage.setItem('na_refresh_token', data.refresh);
  return api('/auth/me/', { auth: true });
}
export function ariary(value) { return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(value || 0))} Ar`; }
export const statuses = {
  attente_acompte: 'Paiement à vérifier', acompte_recu: 'Paiement confirmé', preparation: 'En préparation',
  prete: 'Prête', expediee: 'Expédiée', livree: 'Livrée', annulee: 'Annulée',
};
