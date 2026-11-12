import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Information from "./pages/Information";
import NotFound from "./pages/NotFound";
import { useCart } from "./context/CartContext";
import { Check, X } from "lucide-react";

export default function App() {
  const { pathname } = useLocation();
  const { notice, dismissNotice } = useCart();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return (
    <>
      <a className="skip-link" href="#main">
        Aller au contenu
      </a>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/boutique" element={<Shop />} />
          <Route path="/produit/:id" element={<ProductDetail />} />
          <Route path="/panier" element={<Cart />} />
          <Route path="/commande" element={<Checkout />} />
          <Route path="/informations/:page" element={<Information />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      {notice && (
        <div className="toast" role="status">
          <Check size={19} />
          <span>{notice}</span>
          <button onClick={dismissNotice} aria-label="Fermer la notification">
            <X size={17} />
          </button>
        </div>
      )}
    </>
  );
}
