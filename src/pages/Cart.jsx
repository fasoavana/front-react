import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { getProduct, formatPrice } from "../data/products";
import { itemKey } from "../context/cartState";
import ProductVisual from "../components/ProductVisual";
import QuantitySelector from "../components/QuantitySelector";
import OrderSummary from "../components/OrderSummary";
export default function Cart() {
  const { items, count, setQuantity, removeItem } = useCart();
  return (
    <div className="container-wide cart-page">
      <header className="page-heading">
        <span className="eyebrow">VOS PETITS COUPS DE CŒUR</span>
        <h1>
          Votre panier<span className="heading-count">{count}</span>
        </h1>
        <p>Une belle sélection. Bientôt entre vos mains.</p>
      </header>
      {!items.length ? (
        <div className="empty-state cart-empty">
          <ShoppingBag size={45} strokeWidth={1} />
          <h2>Tout commence par un coup de cœur.</h2>
          <p>Votre panier attend sa première belle pièce.</p>
          <Link className="button button-dark" to="/boutique">
            Découvrir les coques <ArrowRight size={17} />
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div>
            <div className="cart-table-header">
              <span>Votre sélection</span>
              <span>Quantité</span>
              <span>Total</span>
            </div>
            <div className="cart-items">
              {items.map((item) => {
                const product = getProduct(item.id),
                  key = itemKey(item.id, item.color, item.model);
                return (
                  <article className="cart-item" key={key}>
                    <Link
                      className="cart-item-image"
                      to={`/produit/${item.id}`}
                    >
                      <ProductVisual product={product} color={item.color} />
                    </Link>
                    <div className="cart-item-description">
                      <Link to={`/produit/${item.id}`}>
                        <h2>{product.name}</h2>
                      </Link>
                      <p>{item.model}</p>
                      <p>
                        {item.color} · {product.category}
                      </p>
                      <span>{formatPrice(product.price)}</span>
                      <button
                        className="remove-item"
                        onClick={() => removeItem(key)}
                        aria-label={`Retirer ${product.name}, ${item.color}, ${item.model}`}
                      >
                        <Trash2 size={13} /> Retirer
                      </button>
                    </div>
                    <QuantitySelector
                      value={item.quantity}
                      onChange={(value) => setQuantity(key, value)}
                      label={`Quantité de ${product.name}`}
                    />
                    <strong className="cart-item-total">
                      {formatPrice(product.price * item.quantity)}
                    </strong>
                  </article>
                );
              })}
            </div>
            <Link className="text-link continue-shopping" to="/boutique">
              <ArrowLeft size={16} /> Continuer mes découvertes
            </Link>
            <p className="cart-note">
              Un doute sur votre modèle ? Vérifiez-le dans les réglages de votre
              téléphone. Chaque coque est préparée pour le modèle choisi.
            </p>
          </div>
          <OrderSummary />
        </div>
      )}
    </div>
  );
}
