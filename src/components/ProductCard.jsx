import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Plus } from "lucide-react";
import { colorValues, formatPrice } from "../data/products";
import ProductVisual from "./ProductVisual";
import Rating from "./Rating";
import { useCart } from "../context/CartContext";
export default function ProductCard({ product }) {
  const [color, setColor] = useState(product.color);
  const { addItem } = useCart();
  return (
    <article className="product-card group">
      <div className="product-card-image">
        <Link
          to={`/produit/${product.id}`}
          aria-label={`Découvrir ${product.name}`}
        >
          <ProductVisual product={product} color={color} />
        </Link>
        {product.bestSeller ? (
          <span className="product-badge">Best-seller</span>
        ) : (
          product.isNew && <span className="product-badge">Nouveau</span>
        )}
        <Link
          className="card-detail"
          to={`/produit/${product.id}`}
          aria-label={`Détails de ${product.name}`}
        >
          <ArrowUpRight size={17} />
        </Link>
        <button className="quick-add" onClick={() => addItem(product, color)}>
          <Plus size={16} />
          <span>Ajouter · {product.models[0]}</span>
        </button>
      </div>
      <div className="product-card-heading">
        <Link to={`/produit/${product.id}`}>
          <h3>{product.name}</h3>
        </Link>
        <span>{formatPrice(product.price)}</span>
      </div>
      <div className="product-card-sub">
        <span>
          {product.category} · {color}
        </span>
        <Rating value={product.rating} compact />
      </div>
      <div className="swatches" aria-label={`Couleurs de ${product.name}`}>
        {product.colors.map((swatch) => (
          <button
            key={swatch}
            className={color === swatch ? "selected" : ""}
            style={{ "--swatch": colorValues[swatch] }}
            onClick={() => setColor(swatch)}
            aria-label={swatch}
            aria-pressed={color === swatch}
          />
        ))}
        <span>{product.models.length} modèles disponibles</span>
      </div>
    </article>
  );
}
