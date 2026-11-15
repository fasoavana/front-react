import {Link,useParams} from 'react-router-dom';
import {useStore} from '../context/StoreContext';
import SEO from '../ui/SEO';
import Skeleton from '../ui/Skeleton';

const Field=({value,label})=>value?.trim()?value:<strong className="legal-pending">{label} : information à renseigner par le commerçant</strong>;
function Section({title,children}){return <section className="legal-section"><h2>{title}</h2>{children}</section>}
export default function InformationNew(){
  const {page}=useParams(),{config,loading}=useStore();
  if(loading)return <div className="na-wrap"><Skeleton variant="article"/></div>;
  const business=config?.legal_business_name,addr=config?.legal_address,phone=config?.legal_contact_phone,
    email=config?.legal_contact_email,privacy=config?.privacy_contact_email||email,registration=config?.legal_registration;
  const missing=[business,addr,phone,email,registration].some(x=>!x?.trim());
  const title={conditions:'Conditions générales de vente',mentions:'Mentions légales',confidentialite:'Politique de confidentialité'}[page]||'Informations';
  return <div className="na-wrap info-new"><SEO title={title} description={title+' de la boutique NEW ARRIVALS, Madagascar.'}/>
    <small className="na-kicker">NEW ARRIVALS / INFORMATIONS</small><h1>{title}</h1>
    {missing&&<p className="legal-alert" role="note"><strong>Document à compléter avant publication commerciale.</strong> Certaines coordonnées ou informations juridiques ne sont pas encore fournies. Ces textes ne constituent pas une validation juridique.</p>}
    {page==='mentions'&&<>
      <Section title="Identification du commerçant"><p>Nom commercial : <strong>NEW ARRIVALS</strong></p>
        <p>Nom ou raison sociale : <Field value={business} label="Identité juridique"/></p>
        <p>Adresse commerciale : <Field value={addr} label="Adresse"/></p>
        <p>Immatriculation ou identifiant administratif, si applicable : <Field value={registration} label="Immatriculation"/></p>
        <p>Téléphone : <Field value={phone} label="Téléphone de contact"/></p>
        <p>Adresse électronique : <Field value={email} label="E-mail de contact"/></p></Section>
      <Section title="Activité et prix"><p>NEW ARRIVALS propose la vente à distance de housses de téléphone sur commande et d'accessoires à Madagascar. Les prix sont indiqués en ariary (Ar). La disponibilité des modèles est à confirmer.</p></Section>
      <Section title="Propriété intellectuelle"><p>Les textes, photos et éléments graphiques sont utilisés dans le cadre de la boutique. Les visuels fournis par les fournisseurs restent soumis à leurs droits respectifs. Les photographies des clients ne font pas partie du catalogue public.</p></Section>
      <Section title="Hébergement"><p><Field value={config?.hosting_provider} label="Hébergeur, adresse et contact"/>. À compléter dès le choix définitif de l'hébergement.</p></Section>
    </>}
    {page==='conditions'&&<>
      <Section title="1. Objet"><p>Les présentes conditions décrivent les règles de vente à distance de NEW ARRIVALS. Le vendeur est <Field value={business} label="Identité juridique"/>. Contact : <Field value={email||phone} label="Coordonnées"/>.</p></Section>
      <Section title="2. Catalogue et disponibilité"><p>Toutes les housses proposées sont disponibles sur commande, sous réserve de confirmation du fournisseur et de la compatibilité exacte avec le téléphone. Les photographies sont des références visuelles, notamment pour les découpes d'appareil photo.</p></Section>
      <Section title="3. Prix"><p>Les prix sont affichés en ariary. Les housses simples commencent à 35 000 Ar, celles avec bracelet à 38 000 Ar, les modèles à cristaux à 50 000 Ar, les blindées à 55 000 Ar, et les personnalisées à dos effet verre brillant à 36 000 Ar. Les frais de livraison éventuels sont communiqués avant la validation. Les références marquées « tarif à confirmer » ne peuvent pas être payées directement.</p></Section>
      <Section title="4. Commandes et paiement"><p>À Antananarivo, l'acompte demandé pour une housse est de 50 % et le solde est dû à la réception. Pour la province, la totalité doit être réglée avant l'expédition. Moyens acceptés : Orange Money et MVola. La référence de transaction saisie sur le site ne prouve pas l'encaissement : la commande est confirmée uniquement après vérification manuelle.</p></Section>
      <Section title="5. Délais et livraison"><p>Le délai indicatif est de 9 à 15 jours après confirmation du paiement. Une estimation n'est pas une garantie de date exacte. En cas de retard ou d'indisponibilité, le vendeur informe le client et convient avec lui de la suite de la commande.</p></Section>
      <Section title="6. Personnalisation"><p>Le client fournit l'image à placer au dos de la housse brillante, sous réserve des droits nécessaires pour l'utiliser. L'aperçu à l'écran est indicatif ; l'impression peut présenter des différences de couleur, cadrage ou positionnement selon le modèle de téléphone. La disponibilité de la référence personnalisée est vérifiée avant confirmation.</p></Section>
      <Section title="7. Réclamations et litiges"><p>En cas d'erreur, de produit endommagé ou de problème de conformité, contactez NEW ARRIVALS avec la référence de commande, les photos du problème et une description précise. Les conditions d'annulation, de retour, de remboursement et de résolution des litiges doivent encore être complétées et validées selon le droit applicable avant l'ouverture commerciale.</p></Section>
    </>}
    {page==='confidentialite'&&<>
      <Section title="1. Responsable des données"><p>Responsable : <Field value={business} label="Identité juridique"/>. Contact pour les demandes relatives aux données personnelles : <Field value={privacy} label="Contact confidentialité"/>.</p></Section>
      <Section title="2. Données traitées"><p>Lors d'une commande, nous recueillons nom, téléphone, adresse de livraison, ville, produit, quantité, compatibilité téléphone, référence de paiement déclarée et, si communiqué, e-mail. Les comptes clients utilisent une adresse e-mail et un mot de passe haché. Les photos téléversées pour les housses personnalisées sont enregistrées séparément du catalogue public.</p></Section>
      <Section title="3. Utilisation"><p>Les données servent au traitement des commandes, à la vérification des paiements déclarés, à l'expédition, au suivi client et à la prévention des abus. Les informations des commandes Facebook saisies par l'équipe sont centralisées avec celles du site pour éviter les erreurs de traitement.</p></Section>
      <Section title="4. Accès et sous-traitants"><p>Seules les personnes habilitées à traiter les commandes et les prestataires nécessaires (hébergement, messagerie transactionnelle, transport) peuvent recevoir les données utiles à leurs missions. Les images de personnalisation ne sont pas publiées ni affichées dans le catalogue.</p></Section>
      <Section title="5. Sécurité"><p>Les accès aux comptes sont protégés par authentification. Les transferts doivent utiliser HTTPS en production. Aucune donnée de carte bancaire n'est saisie sur le site ; seules des références de paiement Mobile Money déclarées sont collectées.</p></Section>
      <Section title="6. Conservation"><p>Une durée de conservation doit être arrêtée en fonction des obligations commerciales et administratives. La configuration actuelle prévoit {config?.data_retention_months||24} mois comme proposition technique, à valider avant publication. Les demandes de suppression sont examinées au regard des obligations de conservation applicables.</p></Section>
      <Section title="7. Vos demandes"><p>Pour demander l'accès, la rectification ou la suppression de certaines informations personnelles, contactez <Field value={privacy} label="E-mail ou téléphone dédié"/> en précisant la référence de commande et les informations permettant de vous identifier sans divulguer votre mot de passe.</p></Section>
      <Section title="8. Évolutions et technologies utilisées"><p>Le site utilise le stockage local pour conserver un panier non connecté et peut utiliser des cookies strictement nécessaires à la sécurité et à la session. Tout outil d'analyse ou de publicité ajouté ultérieurement devra être documenté ici. Dernière validation juridique : <Field value={config?.legal_updated_at} label="Date"/>.</p></Section>
    </>}
    {!['mentions','conditions','confidentialite'].includes(page)&&<p>Cette page n'existe pas. <Link to="/">Retour à l'accueil.</Link></p>}
    <p className="muted-note">Informations publiées par NEW ARRIVALS. Les champs incomplets doivent être renseignés dans l'administration avant l'ouverture du site.</p>
  </div>;
}
