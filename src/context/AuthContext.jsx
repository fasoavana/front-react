import { createContext,useCallback,useContext,useEffect,useState } from 'react';
import { api,getAccessToken,logout as logoutTokens } from '../lib/api';
const AuthContext=createContext(null);
export function AuthProvider({children}){
  const [me,setMe]=useState(null),[loading,setLoading]=useState(Boolean(getAccessToken()));
  const reload=useCallback(async()=>{if(!getAccessToken()){setMe(null);setLoading(false);return null}
    try{const user=await api('/auth/me/',{auth:true});setMe(user);return user}
    catch{setMe(null);return null}finally{setLoading(false)}},[]);
  useEffect(()=>{reload()},[reload]);
  const signout=()=>{logoutTokens();setMe(null)};
  return <AuthContext.Provider value={{me,loading,reload,signout}}>{children}</AuthContext.Provider>;
}
export const useAuth=()=>useContext(AuthContext);
