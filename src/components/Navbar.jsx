import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { useCart } from "../context/CartContext";
export default function Navbar() {
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const input = useRef(null);
  const searchButton = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location]);
  useEffect(() => {
    if (searchOpen) input.current?.focus();
  }, [searchOpen]);
  useEffect(() => {
    const close = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
        searchButton.current?.focus();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const search = (event) => {
    event.preventDefault();
    navigate(
      `/boutique${query.trim() ? `?recherche=${encodeURIComponent(query.trim())}` : ""}`,
    );
  };
  return (
    <>
      <div className="announcement">
        Les beaux détails font la différence.
        <span>
          Livraison offerte dès 60 € <ArrowRight size={12} />
        </span>
      </div>
      <header className="site-header">
        <div className="nav-shell container-wide">
          <button
            className="icon-button mobile-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          <Link to="/" className="brand" aria-label="Coque & Style, accueil">
            coque<span>&</span>style<span className="brand-dot">.</span>
          </Link>
          <nav
            id="main-navigation"
            className={menuOpen ? "main-navigation is-open" : "main-navigation"}
            aria-label="Navigation principale"
          >
            <NavLink to="/" end>
              Accueil
            </NavLink>
            <NavLink to="/boutique">La boutique</NavLink>
            <Link to="/boutique?nouveautes=oui">
              Nouveautés
              <span className="nav-new-dot" />
            </Link>
            <Link to="/informations/notre-histoire">Notre histoire</Link>
          </nav>
          <div className="nav-actions">
            <button
              ref={searchButton}
              className="icon-button"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Rechercher un produit"
              aria-expanded={searchOpen}
              aria-controls="nav-search"
            >
              <Search size={20} />
            </button>
            <Link
              className="icon-button account-link"
              to="/informations/mon-espace"
              aria-label="Mon espace"
            >
              <UserRound size={20} />
            </Link>
            <Link
              className="icon-button cart-link"
              to="/panier"
              aria-label={`Panier, ${count} article${count > 1 ? "s" : ""}`}
            >
              <ShoppingBag size={20} />
              <span className="cart-count">{count}</span>
            </Link>
          </div>
        </div>
        {searchOpen && (
          <form
            className="nav-search container-wide"
            id="nav-search"
            onSubmit={search}
          >
            <Search size={19} />
            <label className="sr-only" htmlFor="search-query">
              Rechercher une coque
            </label>
            <input
              ref={input}
              id="search-query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Un modèle, une couleur, une envie…"
            />
            <button className="text-link" type="submit">
              Rechercher <ArrowRight size={16} />
            </button>
          </form>
        )}
      </header>
    </>
  );
}
