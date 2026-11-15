import {useState} from 'react';import {useSearchParams} from 'react-router-dom';import {api} from '../lib/api';import SEO from '../ui/SEO';
export default function ResetNew(){const [sp]=useSearchParams();const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[msg,setMsg]=useState(''),[error,setError]=useState('');
  const token=sp.get('token'),uid=sp.get('uid');const submit=async e=>{e.preventDefault();setError('');setMsg('');try{
    const data=token&&uid?await api('/auth/password-reset/confirm/',{method:'POST',body:{uid,token,password}}):await api('/auth/password-reset/',{method:'POST',body:{email}});setMsg(data.detail)
  }catch(e){setError(e.message)}};
  return <div className="na-wrap account-page"><SEO title="Réinitialiser le mot de passe"/><h1>Mot de passe <em>oublié ?</em></h1><form className="account-form" onSubmit={submit}>
    {token&&uid?<label>Nouveau mot de passe<input type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/></label>:
      <label>Adresse e-mail<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>}
    {error&&<p className="alert">{error}</p>}{msg&&<p className="success-message">{msg}</p>}<button className="na-btn gold">Envoyer</button></form></div>
}
