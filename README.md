# DADA Drinks — boutique découverte

Première maquette de boutique française (EUR), statique et sans dépendance de production.

## Utilisation

- `npm test` : tests du catalogue et des calculs du panier.
- `npm run build` : vérification des fichiers statiques à servir depuis `public/`.
- Pour un aperçu local : `python3 -m http.server 3000 --directory public`, puis ouvrir `http://localhost:3000`.

Vercel détecte le dossier `public/` avec le préréglage **Other** du projet existant. Aucun secret ni service externe requis. La navigation, les filtres, les fiches produits et le panier découverte fonctionnent côté navigateur. Le panier utilise localStorage si disponible, avec repli en mémoire. Les quantités sont limitées à 24 packs par saveur.

## Données et limites avant ouverture

Le catalogue reprend les sept tarifs explicitement affichés à **32 € par pack de 24 canettes** sur https://www.dadadrinks.com/shop-brine lors de la consultation du 10 novembre 2026 : Mangue, Cerise, Lemon, Cola, Pomme, Ice Tea et Cola Zéro. Le site source indique des ruptures de stock. Les autres saveurs sans tarif vérifié ne sont pas proposées. Aucun stock disponible n’est affirmé par cette maquette.

Les canettes SVG et la signature typographique sont des **illustrations provisoires originales**, pas les photos ni le logo officiels. À remplacer par les fichiers de marque autorisés avant publication commerciale. Les textes d’ambiance sont des propositions éditoriales, pas des informations nutritionnelles.

**Aucun paiement, commande, réservation de stock, collecte d’adresse ou e-mail n’est effectué.** Les ajouts au panier sont des simulations clairement identifiées. Le bouton de paiement est désactivé. Le site est `noindex` tant qu’il s’agit d’une maquette.

Pour la mise en vente : intégrer les fichiers de marque, valider les prix TTC et stocks réels, renseigner le volume, la composition, les allergènes et les informations nutritionnelles de chaque produit, connecter un service de commande/paiement côté serveur avec validation des prix et des stocks, définir la livraison et les retours, et ajouter CGV, mentions légales et politique de confidentialité. Ne jamais utiliser le panier client comme source de vérité pour un paiement.

Les polices Google Fonts sont chargées à distance avec des polices système de secours ; envisager leur hébergement local avant ouverture.
