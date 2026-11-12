import { ArrowRight, LockKeyhole, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../data/products";
import { FREE_SHIPPING_AT } from "../context/cartState";
export default function OrderSummary({ checkout = false }) {
  const { subtotal, shipping, total } = useCart();
  const remaining = Math.max(
    0,
    Math.round((FREE_SHIPPING_AT - subtotal) * 100) / 100,
  );
  return (
    <aside className="order-summary">
      <span className="eyebrow">LES BONNES CHOSES S’ADDITIONNENT</span>
      <h2>Votre récapitulatif</h2>
      <dl>
        <div>
          <dt>Sous-total</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <div>
          <dt>Livraison</dt>
          <dd>
            {shipping === 0 ? (
              <span className="shipping-free">Offerte</span>
            ) : (
              formatPrice(shipping)
            )}
          </dd>
        </div>
        <div className="summary-total">
          <dt>
            Total <small>TVA incluse</small>
          </dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
      <div className="shipping-progress">
        <Truck size={18} />
        <p>
          {remaining ? (
            <>
              Encore <strong>{formatPrice(remaining)}</strong> pour la livraison
              offerte.
            </>
          ) : (
            <>La livraison est offerte. Profitez-en !</>
          )}
        </p>
        <div>
          <span
            style={{
              width: `${Math.min(100, (subtotal / FREE_SHIPPING_AT) * 100)}%`,
            }}
          />
        </div>
      </div>
      {!checkout && (
        <Link className="button button-dark" to="/commande">
          Passer commande <ArrowRight size={18} />
        </Link>
      )}
      <span className="checkout-reassurance">
        <LockKeyhole size={13} />{" "}
        {checkout
          ? "Aucun paiement réel dans cette démonstration"
          : "Votre sélection, conservée avec soin"}
      </span>
      <span className="summary-payments">
        VISA <span>mastercard</span> PayPal
      </span>
    </aside>
  );
}
