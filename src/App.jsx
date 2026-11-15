import { Routes, Route } from 'react-router-dom';
import Layout from './ui/Layout';
import HomeNew from './pages/HomeNew';
import ShopNew from './pages/ShopNew';
import ProductNew from './pages/ProductNew';
import CartNew from './pages/CartNew';
import CheckoutNew from './pages/CheckoutNew';
import TrackNew from './pages/TrackNew';
import InformationNew from './pages/InformationNew';
import AdminNew from './pages/AdminNew';
import AccountNew from './pages/AccountNew';
import ResetNew from './pages/ResetNew';
import NotFoundNew from './pages/NotFoundNew';
import { StoreProvider } from './context/StoreContext';
import './new-arrivals.css';
export default function App(){return <StoreProvider><Routes><Route element={<Layout/>}>
  <Route index element={<HomeNew/>}/><Route path="boutique" element={<ShopNew/>}/>
  <Route path="produit/:slug" element={<ProductNew/>}/><Route path="panier" element={<CartNew/>}/>
  <Route path="commande" element={<CheckoutNew/>}/><Route path="suivi" element={<TrackNew/>}/><Route path="suivi/:token" element={<TrackNew/>}/>
  <Route path="informations/:page" element={<InformationNew/>}/><Route path="admin-panel" element={<AdminNew/>}/>
  <Route path="mon-compte" element={<AccountNew/>}/><Route path="reinitialiser" element={<ResetNew/>}/>
  <Route path="*" element={<NotFoundNew/>}/>
  </Route></Routes></StoreProvider>}
