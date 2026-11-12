import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, PackageCheck } from "lucide-react";
import { useCart } from "../context/CartContext";
import OrderSummary from "../components/OrderSummary";
import { formatPrice } from "../data/products";
export default function Checkout() {
  const { items, clearCart, total } = useCart();
  const [confirmation, setConfirmation] = useState(null),
    [accepted, setAccepted] = useState(false);
  function submit(event) {
    event.preventDefault();
    if (!accepted) return;
    const data = new FormData(event.currentTarget);
    setConfirmation({
      name: data.get("firstName"),
      reference: `CS-${Date.now().toString(36).toUpperCase()}`,
      total,
    });
    clearCart();
  }
  if (confirmation)
    return (
      <div className="container-wide confirmation-page">
        <span className="confirmation-icon">
          <PackageCheck size={38} strokeWidth={1.3} />
        </span>
        <span className="eyebrow">UNE BELLE SÉLECTION</span>
        <h1>Merci, {confirmation.name}.</h1>
        <p>
          Votre commande de démonstration est confirmée.
          <br />
          Aucun paiement n’a été effectué et aucun colis ne sera expédié.
        </p>
        <div className="confirmation-reference">
          <span>{confirmation.reference}</span>
          <strong>{formatPrice(confirmation.total)}</strong>
        </div>
        <Link className="button button-dark" to="/boutique">
          Retour à la collection <ArrowRight size={18} />
        </Link>
      </div>
    );
  if (!items.length) return <Navigate to="/panier" replace />;
  return (
    <div className="container-wide checkout-page">
      <header className="page-heading">
        <span className="eyebrow">LA DERNIÈRE PETITE ÉTAPE</span>
        <h1>À vous de jouer.</h1>
        <p>Une commande de démonstration, sans paiement réel.</p>
      </header>
      <div className="cart-layout">
        <form className="checkout-form" onSubmit={submit}>
          <h2>Vos coordonnées</h2>
          <p className="muted">
            Ces informations restent dans cette page et ne sont pas envoyées.
          </p>
          <div className="form-grid">
            <label>
              Prénom
              <input
                name="firstName"
                autoComplete="given-name"
                required
                maxLength={60}
              />
            </label>
            <label>
              Nom
              <input
                name="lastName"
                autoComplete="family-name"
                required
                maxLength={60}
              />
            </label>
            <label className="form-full">
              Adresse e-mail
              <input type="email" name="email" autoComplete="email" required />
            </label>
            <label className="form-full">
              Adresse de livraison
              <input name="address" autoComplete="street-address" required />
            </label>
            <label>
              Code postal
              <input name="postalCode" autoComplete="postal-code" required />
            </label>
            <label>
              Ville
              <input name="city" autoComplete="address-level2" required />
            </label>
            <label className="form-full">
              Pays
              <select name="country" autoComplete="country-name">
                <option>France</option>
                <option>Belgique</option>
                <option>Suisse</option>
                <option>Madagascar</option>
              </select>
            </label>
          </div>
          <label className="check-label checkout-consent">
            <input
              type="checkbox"
              required
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
            />
            <span>
              Je comprends qu’il s’agit d’une démonstration sans paiement ni
              livraison réelle.
            </span>
          </label>
          <button className="button button-dark" type="submit">
            Confirmer ma commande démo <Check size={17} />
          </button>
          <Link className="text-link mt-6" to="/panier">
            <ArrowLeft size={15} /> Revenir au panier
          </Link>
        </form>
        <OrderSummary checkout />
      </div>
    </div>
  );
}
