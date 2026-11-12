# Coque & Style

Boutique de démonstration React/Vite, Tailwind CSS, Lucide et React Router.

```sh
npm ci
npm run dev
npm test          # logique du panier et parcours DOM
npm run build
npm run preview
```

## Parcours

- `/` : accueil, meilleures ventes, nouveautés et histoire de marque.
- `/boutique` : recherche, filtres combinables et tri, conservés dans l’URL.
- `/produit/:id` : couleurs, modèle, quantité, avis illustratifs et produits associés.
- `/panier` : variantes distinctes, quantités de 1 à 10, frais de livraison calculés.
- `/commande` : formulaire et confirmation fictive, sans paiement ni envoi de données.
- `/informations/:page` : histoire, livraison, FAQ, contact et confidentialité.

Les données produits et avis sont dans `src/data/products.js`. Le panier est
géré avec React Context et un reducer ; il est validé et restauré depuis
localStorage. Les montants sont calculés en centimes avant affichage.
La livraison coûte 4,90 €, offerte dès 60 €.

## Style

Palette ivoire, encre, sauge et terracotta. Configuration dans
`tailwind.config.js`, styles des composants dans `src/styles.css`.
Les coques sont dessinées en CSS avec des textures photographiques Unsplash,
pour rester visibles même si une image distante est indisponible. Polices
Inter/DM Sans via Google Fonts ; avatars illustratifs via Pravatar.

## Déploiement ValaDeploy

Le Dockerfile existant compile les assets avec `npm ci` puis les sert avec
Nginx. Le `try_files` dans `nginx.conf` permet d’ouvrir directement les routes
React, y compris après rafraîchissement. Le frontend n’exige aucune variable
d’environnement ni modification du backend Django.

La boutique est locale au dépôt : commit/push sur la branche reliée à
ValaDeploy, puis mise à jour du composant frontend pour publier les changements.
La configuration Nginx et les correctifs système de sécurité sont préservés.

## Limites de la démonstration

Aucun compte, paiement, traitement commercial ni stock réel. La newsletter
enregistre seulement un intérêt local sur cet appareil. Les formulaires de
commande ne sont pas transmis à un serveur. Les pages d’information rendent
ces limites explicites.

## Preuve de couverture pour SonarQube

`npm test` mesure la couverture réelle et génère `quality/lcov.info`. Ce rapport
est versionné pour le scanner ValaDeploy, dont les conteneurs de tests ne
rapatrient actuellement pas les artefacts. Régénérer et inclure le rapport
avant chaque commit de code. `src/main.jsx`, simple point d’amorçage, est le
seul fichier applicatif exclu de la mesure ; les pages et composants sont couverts.
