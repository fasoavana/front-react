import { Link, useParams } from "react-router-dom";
import { ArrowUpRight, Mail } from "lucide-react";
import NotFound from "./NotFound";
const pages = {
  "notre-histoire": {
    eyebrow: "NOTRE FAÇON DE VOIR LES CHOSES",
    title: "Le style est dans les détails.",
    paragraphs: [
      "Votre téléphone vous suit partout. Alors pourquoi sa coque devrait-elle être un simple accessoire ? Coque & Style est née de cette envie : faire de la protection un petit plaisir du quotidien.",
      "Des teintes douces, des silhouettes épurées, des matières agréables. Nous aimons les pièces simples, celles que l’on choisit avec soin et que l’on garde près de soi.",
      "Cette boutique est une réalisation de démonstration pour une soutenance de fin d’études, déployable sur ValaDeploy. Les produits et les avis sont illustratifs ; aucune vente réelle n’est réalisée.",
    ],
  },
  livraison: {
    eyebrow: "ON S’OCCUPE DE TOUT",
    title: "Livraison & retours.",
    paragraphs: [
      "Dans le parcours présenté, les frais de livraison sont de 4,90 €, offerts à partir de 60 € de produits. Le délai indicatif est de 2 à 3 jours ouvrés après préparation.",
      "La politique de retour présentée prévoit 30 jours pour changer d’avis. Le produit doit être conservé dans son état initial.",
      "Cette boutique est une démonstration : les commandes ne déclenchent ni paiement, ni livraison, ni retour réel.",
    ],
  },
  faq: {
    eyebrow: "LES RÉPONSES, TOUT SIMPLEMENT",
    title: "Une petite question ?",
    paragraphs: [
      "Quel modèle choisir ? Consultez Réglages > Général > Informations sur iPhone, ou Paramètres > À propos du téléphone sur Android. Choisissez ce modèle dans la fiche produit.",
      "Comment entretenir ma coque ? Utilisez un chiffon doux légèrement humide. Évitez les produits abrasifs et l’exposition prolongée à la chaleur.",
      "Mon panier est-il conservé ? Oui, sur ce navigateur et cet appareil. Les données sont stockées localement ; elles peuvent disparaître si vous effacez les données du site.",
      "Puis-je vraiment acheter ? Non : cette version présente un parcours de commande de démonstration sans paiement.",
    ],
  },
  contact: {
    eyebrow: "PARLONS DES JOLIES CHOSES",
    title: "Un mot, une question.",
    paragraphs: [
      "Pour cette boutique de démonstration, aucune équipe commerciale ne traite de commandes réelles. L’adresse ci-dessous est illustrative.",
      "Vous préparez votre sélection ? Retrouvez les informations de compatibilité sur chaque fiche produit et consultez les questions fréquentes.",
    ],
  },
  "mon-espace": {
    eyebrow: "VOTRE SÉLECTION, EN TOUTE SIMPLICITÉ",
    title: "Pas besoin de compte.",
    paragraphs: [
      "Votre panier est conservé sur cet appareil. Vous pouvez sélectionner vos couleurs et modèles, retrouver vos articles et essayer le parcours de commande sans créer de compte.",
      "Cette version ne propose pas d’espace client connecté ni de suivi de livraison réel.",
    ],
  },
  confidentialite: {
    eyebrow: "VOTRE CONFIANCE COMPTE",
    title: "Votre vie privée.",
    paragraphs: [
      "Le panier est conservé dans le stockage local de votre navigateur. La newsletter enregistre uniquement votre intérêt sur cet appareil ; aucune adresse e-mail n’est envoyée à un service externe.",
      "Les coordonnées saisies lors de la commande de démonstration restent en mémoire pendant le parcours et ne sont pas envoyées au backend.",
      "Les photographies, avatars et polices sont chargés depuis des services externes (Unsplash, Pravatar et Google Fonts), qui reçoivent les informations techniques nécessaires à leur chargement.",
      "Pour supprimer les données locales, videz le stockage du site dans les paramètres de votre navigateur.",
    ],
  },
  conditions: {
    eyebrow: "EN TOUTE TRANSPARENCE",
    title: "Les conditions du site.",
    paragraphs: [
      "Coque & Style est une boutique fictive destinée à illustrer un projet de fin d’études. Les produits, prix, notes et avis sont des données de démonstration.",
      "Aucun paiement n’est collecté. Les confirmations affichées ne constituent pas un contrat de vente et ne déclenchent aucune expédition.",
      "Les images et dessins illustrent les styles de coques ; ils ne constituent pas des photographies contractuelles de produits réels.",
    ],
  },
};
export default function Information() {
  const { page } = useParams(),
    content = pages[page];
  if (!content) return <NotFound />;
  return (
    <section className="container-wide information-page">
      <span className="eyebrow">{content.eyebrow}</span>
      <h1>{content.title}</h1>
      <div className="information-content">
        {content.paragraphs.map((text) => (
          <p key={text}>{text}</p>
        ))}
      </div>
      {page === "contact" && (
        <a className="text-link" href="mailto:bonjour@coque-style.example">
          <Mail size={18} /> bonjour@coque-style.example
        </a>
      )}
      <Link
        className="button button-dark"
        to={page === "mon-espace" ? "/panier" : "/boutique"}
      >
        {page === "mon-espace"
          ? "Retrouver mon panier"
          : "Découvrir la collection"}
        <ArrowUpRight size={18} />
      </Link>
    </section>
  );
}
