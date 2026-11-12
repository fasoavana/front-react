import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight, Camera, Mail } from "lucide-react";
export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  function subscribe(event) {
    event.preventDefault();
    try {
      localStorage.setItem(
        "coque-style-newsletter",
        JSON.stringify({ email, date: new Date().toISOString() }),
      );
    } catch {
      /* Confirmation sans stockage. */
    }
    setSubscribed(true);
  }
  return (
    <footer className="site-footer">
      <div className="container-wide footer-top">
        <div className="footer-intro">
          <Link to="/" className="brand">
            coque<span>&</span>style<span className="brand-dot">.</span>
          </Link>
          <p>
            Votre téléphone. Votre personnalité.
            <br />
            Le style se cache dans les détails.
          </p>
          <div className="social-links">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Découvrir Instagram"
            >
              <Camera size={19} />
            </a>
            <a
              href="mailto:bonjour@coque-style.example"
              aria-label="Nous écrire"
            >
              <Mail size={19} />
            </a>
          </div>
        </div>
        <div className="footer-links">
          <h3>Explorer</h3>
          <Link to="/boutique">Toutes les coques</Link>
          <Link to="/boutique?nouveautes=oui">Les nouveautés</Link>
          <Link to="/boutique?collection=Silicone">Les essentielles</Link>
          <Link to="/informations/notre-histoire">Notre histoire</Link>
        </div>
        <div className="footer-links">
          <h3>On vous accompagne</h3>
          <Link to="/informations/livraison">Livraison & retours</Link>
          <Link to="/informations/faq">Questions fréquentes</Link>
          <Link to="/informations/contact">Nous contacter</Link>
          <Link to="/panier">Mon panier</Link>
        </div>
        <div className="newsletter">
          <span className="eyebrow">RESTONS EN CONTACT</span>
          <h3>
            Un peu de style
            <br />
            dans votre boîte mail.
          </h3>
          {subscribed ? (
            <p role="status" className="newsletter-success">
              Merci ! Votre intérêt a été enregistré sur cet appareil.
            </p>
          ) : (
            <form onSubmit={subscribe}>
              <label className="sr-only" htmlFor="newsletter-email">
                Votre adresse e-mail
              </label>
              <input
                id="newsletter-email"
                type="email"
                autoComplete="email"
                value={email}
                required
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Votre adresse e-mail"
              />
              <button
                type="submit"
                aria-label="Enregistrer mon intérêt pour la newsletter"
              >
                <ArrowRight size={21} />
              </button>
            </form>
          )}
          <p className="newsletter-note">
            De jolies nouveautés, jamais de superflu.
          </p>
        </div>
      </div>
      <div className="container-wide footer-bottom">
        <span>
          © {new Date().getFullYear()} Coque & Style. Tout simplement vous.
        </span>
        <div>
          <Link to="/informations/confidentialite">Confidentialité</Link>
          <Link to="/informations/conditions">
            Conditions générales <ArrowUpRight size={11} />
          </Link>
        </div>
        <span className="payment-label">
          VISA <span>mastercard</span> PayPal
        </span>
      </div>
    </footer>
  );
}
