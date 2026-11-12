import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
export default function NotFound() {
  return (
    <section className="container-wide empty-state not-found">
      <span className="eyebrow">404 · UN PETIT DÉTOUR</span>
      <h1>Cette page nous échappe.</h1>
      <p>Mais votre prochain coup de cœur est certainement par ici.</p>
      <Link className="button button-dark" to="/boutique">
        <ArrowLeft size={17} /> Retour à la boutique
      </Link>
    </section>
  );
}
