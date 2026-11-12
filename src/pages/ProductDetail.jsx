import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ChevronRight,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import {
  colorValues,
  formatPrice,
  getProduct,
  products,
  reviews,
} from "../data/products";
import { useCart } from "../context/CartContext";
import ProductVisual from "../components/ProductVisual";
import ProductCard from "../components/ProductCard";
import QuantitySelector from "../components/QuantitySelector";
import Rating from "../components/Rating";
import NotFound from "./NotFound";
export default function ProductDetail() {
  const { id } = useParams(),
    product = getProduct(id);
  const [color, setColor] = useState(product?.color),
    [model, setModel] = useState(product?.models[0]),
    [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  useEffect(() => {
    setColor(product?.color);
    setModel(product?.models[0]);
    setQuantity(1);
  }, [id, product]);
  if (!product) return <NotFound />;
  return (
    <div className="container-wide product-page">
      <nav className="breadcrumbs" aria-label="Fil d’Ariane">
        <Link to="/">Accueil</Link>
        <ChevronRight size={12} />
        <Link to="/boutique">La collection</Link>
        <ChevronRight size={12} />
        <span>{product.name}</span>
      </nav>
      <div className="product-detail-grid">
        <div className="detail-gallery">
          <ProductVisual
            product={product}
            color={color}
            className="detail-visual"
          />
          <span className="gallery-caption">
            Le style, sous tous les angles.
          </span>
          <div className="gallery-thumbnails">
            {product.colors.map((swatch) => (
              <button
                key={swatch}
                aria-label={`Voir la couleur ${swatch}`}
                aria-pressed={swatch === color}
                className={swatch === color ? "selected" : ""}
                onClick={() => setColor(swatch)}
              >
                <ProductVisual product={product} color={swatch} decorative />
              </button>
            ))}
          </div>
        </div>
        <div className="detail-copy">
          <span className="eyebrow">
            {product.category.toUpperCase()} · COLLECTION ESSENTIELLE
          </span>
          <h1>{product.name}</h1>
          <a href="#avis">
            <Rating value={product.rating} count={product.reviewCount} />
          </a>
          <p className="detail-price">
            {formatPrice(product.price)} <span>TVA incluse</span>
          </p>
          <p className="detail-description">{product.description}</p>
          <div className="detail-divider" />
          <div className="choice-label">
            Couleur <strong>{color}</strong>
          </div>
          <div className="swatches detail-swatches">
            {product.colors.map((value) => (
              <button
                key={value}
                className={color === value ? "selected" : ""}
                style={{ "--swatch": colorValues[value] }}
                onClick={() => setColor(value)}
                aria-label={value}
                aria-pressed={color === value}
              />
            ))}
          </div>
          <label className="choice-label" htmlFor="phone-model">
            Votre modèle de téléphone
          </label>
          <select
            className="model-select"
            id="phone-model"
            value={model}
            onChange={(event) => setModel(event.target.value)}
          >
            {product.models.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <div className="add-to-cart-row">
            <QuantitySelector value={quantity} onChange={setQuantity} />
            <button
              className="button button-dark"
              onClick={() => addItem(product, color, model, quantity)}
            >
              <ShoppingBag size={18} /> Ajouter au panier{" "}
              <span>{formatPrice(product.price * quantity)}</span>
            </button>
          </div>
          <p className="stock-status">
            <span /> Disponible · Expédition sous 2 à 3 jours ouvrés
          </p>
          <div className="detail-benefits">
            <div>
              <Truck size={19} />
              <span>Livraison offerte dès 60 €</span>
            </div>
            <div>
              <PackageCheck size={19} />
              <span>30 jours pour changer d’avis</span>
            </div>
            <div>
              <ShieldCheck size={19} />
              <span>Bords surélevés et accès précis aux boutons</span>
            </div>
          </div>
          <details className="product-accordion">
            <summary>Les petits détails qui comptent</summary>
            <p>
              Coque souple, intérieur doux et bords surélevés autour de l’écran
              et de l’appareil photo. Choisissez la variante correspondant
              exactement à votre téléphone. Les visuels sont des illustrations ;
              la découpe varie selon le modèle.
            </p>
          </details>
          <details className="product-accordion">
            <summary>Livraison & retours</summary>
            <p>
              Frais de livraison : 4,90 €, offerts dès 60 €. Vous disposez de 30
              jours pour demander un retour.{" "}
              <Link to="/informations/livraison">En savoir plus.</Link>
            </p>
          </details>
        </div>
      </div>
      <section className="reviews-section" id="avis">
        <div>
          <span className="eyebrow">VOS IMPRESSIONS</span>
          <h2>Leurs petits mots.</h2>
          <Rating value={product.rating} count={product.reviewCount} />
          <p className="muted text-sm mt-4">
            Avis illustratifs pour cette boutique de démonstration.
          </p>
        </div>
        <div className="reviews-list">
          {reviews.map((review) => (
            <article key={review.name}>
              <div>
                <Rating value={review.stars} />
                <span>{review.date}</span>
              </div>
              <p>{review.text}</p>
              <strong>{review.name}</strong>
              <span className="review-variant"> · Collection essentielle</span>
            </article>
          ))}
        </div>
      </section>
      <section className="section-space">
        <div className="section-heading">
          <div>
            <span className="eyebrow">DANS LE MÊME ESPRIT</span>
            <h2>Un autre coup de cœur ?</h2>
          </div>
          <Link className="text-link" to="/boutique">
            Tout découvrir <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {products
            .filter((item) => item.id !== id)
            .slice(0, 4)
            .map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
        </div>
      </section>
    </div>
  );
}
