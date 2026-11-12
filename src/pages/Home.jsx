import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  Leaf,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { products } from "../data/products";
import ProductCard from "../components/ProductCard";
import ProductVisual from "../components/ProductVisual";
import Rating from "../components/Rating";
export default function Home() {
  const carousel = useRef(null);
  return (
    <>
      <section className="hero">
        <div className="container-wide hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="tiny-line" /> BIEN PLUS QU’UNE COQUE
            </span>
            <h1>
              Protégez
              <br />
              votre <em>style.</em>
            </h1>
            <p>
              Des coques pensées pour votre quotidien.
              <br />
              Belles à regarder. Douces à tenir. Faites pour vous.
            </p>
            <Link className="button button-dark" to="/boutique">
              Trouver ma coque <ArrowUpRight size={19} />
            </Link>
            <div className="hero-social-proof">
              <div className="customer-avatars">
                <img src="https://i.pravatar.cc/64?img=47" alt="" />
                <img src="https://i.pravatar.cc/64?img=12" alt="" />
                <img src="https://i.pravatar.cc/64?img=44" alt="" />
              </div>
              <div>
                <Rating value={4.9} />
                <span>Déjà adoptées, déjà adorées.</span>
              </div>
            </div>
          </div>
          <div
            className="hero-art"
            aria-label="Coques de téléphone sauge et terracotta"
          >
            <div className="hero-circle" />
            <span className="hero-vertical">
              LES ESSENTIELLES — COLLECTION 01
            </span>
            <div className="hero-case-back">
              <ProductVisual product={products[1]} decorative />
            </div>
            <div className="hero-case-front">
              <ProductVisual product={products[0]} decorative />
            </div>
            <div className="hero-floating-note">
              <span className="note-icon">
                <Leaf size={20} strokeWidth={1.3} />
              </span>
              <div>
                Moins de superflu.<strong>Plus de vous.</strong>
              </div>
            </div>
            <span className="hero-image-caption">
              <i /> Le toucher doux. Le détail juste.
            </span>
          </div>
        </div>
        <div className="container-wide hero-bottom">
          <a href="#bestsellers">
            LE BON STYLE, AU CREUX DE LA MAIN <ArrowDown size={13} />
          </a>
          <span>
            01 <i /> 03
          </span>
        </div>
      </section>
      <section
        className="benefits-bar"
        aria-label="Les avantages de la boutique"
      >
        <div className="container-wide benefits-grid">
          <div>
            <Truck />
            <span>Livraison offerte dès 60 €</span>
          </div>
          <div>
            <ShieldCheck />
            <span>Protection au quotidien</span>
          </div>
          <div>
            <PackageCheck />
            <span>Retours sous 30 jours</span>
          </div>
          <div>
            <Heart />
            <span>Choisies avec attention</span>
          </div>
        </div>
      </section>
      <section id="bestsellers" className="container-wide section-space">
        <div className="section-heading">
          <div>
            <span className="eyebrow">VOS COUPS DE CŒUR</span>
            <h2>Les belles évidences.</h2>
            <p>Les coques que vous aimez. Et que vous allez adorer.</p>
          </div>
          <Link className="text-link" to="/boutique">
            Toute la collection <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-4 lg:gap-x-7">
          {products
            .filter((product) => product.bestSeller)
            .map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>
      </section>
      <section className="collection-section container-wide">
        <div className="collection-photo">
          <img
            src="https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1200&q=85"
            alt="Ombres douces et matières naturelles, inspiration de la collection"
            loading="lazy"
          />
          <div className="collection-phone">
            <ProductVisual product={products[2]} decorative />
          </div>
          <span className="image-editorial-label">L’ART DU DÉTAIL</span>
        </div>
        <div className="collection-copy">
          <span className="eyebrow">BELLE, TOUT SIMPLEMENT.</span>
          <h2>
            Un petit détail.
            <br />
            Une vraie différence.
          </h2>
          <p>
            On croit aux objets que l’on aime garder près de soi. Aux couleurs
            qui apaisent. Aux matières que l’on a envie de toucher.
          </p>
          <p>
            Nos coques sont choisies pour ça : protéger votre téléphone, sans
            jamais cacher votre personnalité.
          </p>
          <Link className="text-link" to="/informations/notre-histoire">
            L’esprit Coque & Style <ArrowUpRight size={18} />
          </Link>
          <div className="collection-signature">
            Pensées pour vous accompagner.
          </div>
        </div>
      </section>
      <section className="container-wide section-space new-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              <Sparkles size={13} /> UN SOUFFLE DE NOUVEAUTÉ
            </span>
            <h2>Le prochain coup de cœur.</h2>
          </div>
          <div className="carousel-controls">
            <button
              className="round-button"
              aria-label="Voir les nouveautés précédentes"
              onClick={() =>
                carousel.current?.scrollBy({ left: -350, behavior: "smooth" })
              }
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="round-button"
              aria-label="Voir les nouveautés suivantes"
              onClick={() =>
                carousel.current?.scrollBy({ left: 350, behavior: "smooth" })
              }
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="new-carousel" ref={carousel} aria-label="Nouveautés">
          {products
            .filter((product) => product.isNew)
            .map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>
      </section>
      <section className="quote-section">
        <div className="container-wide">
          <span className="eyebrow">LES PETITS MOTS QUI COMPTENT</span>
          <Rating value={5} />
          <blockquote>
            « Une coque aussi agréable à tenir
            <br className="hidden md:block" /> qu’à regarder. Je ne la quitte
            plus. »
          </blockquote>
          <p>
            Camille R. <span>— L’Essentielle, Sauge</span>
          </p>
          <span className="quote-caption">
            Exemple d’avis de notre collection de démonstration.
          </span>
        </div>
      </section>
      <section className="container-wide closing-cta">
        <div>
          <span className="eyebrow">À CHAQUE TÉLÉPHONE, SON STYLE.</span>
          <h2>Et vous, quelle sera la vôtre ?</h2>
        </div>
        <Link to="/boutique" className="button button-dark">
          Explorer les coques <ArrowRight size={18} />
        </Link>
      </section>
    </>
  );
}
