# Dada Drinks — refonte du site (Next.js)

Proposition de refonte complète du site Dada Drinks, construite à partir du contenu du site actuel (dadadrinks.com).

| Page | Adresse | Contenu |
|---|---|---|
| Accueil | `/` | Hero interactif, histoire Dada en 6 actes au défilement, catalogue filtrable, collabs, espace pros |
| Boutique | `/boutique` | Les 13 saveurs en pack de 24, ajout au panier |
| Fiches produits 3D | `/saveurs/cerise` … `/saveurs/ice-tea-peche` | Canette aluminium en 3D sous un projecteur, mode « Verser », quantité + panier |
| Professionnels | `/professionnels` | Arguments, palette mixte et vitrines (slim, moyen, big), enseignes, formulaire de devis |
| Notre histoire | `/notre-histoire` | Le parcours du fondateur, de Nanterre à aujourd'hui (frise chronologique) |
| Collaborations | `/collaborations` | Ninho, Jul, Alonzo, Paris Basket, Fianso, PFL, Cédric Doumbé, JCDecaux, influenceurs |
| Actualités | `/actualites` + 4 articles | Toutes les actualités du site actuel |
| Contact | `/contact` | WhatsApp, réseaux, formulaire |
| Panier | `/panier` | Panier gardé dans le navigateur, quantités, total |
| Légal | `/mentions-legales`, `/cgv`, `/confidentialite` | Gabarits à compléter (éléments entre crochets) |

Également : page 404, `sitemap.xml`, `robots.txt`, menu mobile, lien d'évitement pour l'accessibilité.

## Recevoir les formulaires par e-mail

Les formulaires (contact, devis pro, newsletter) envoient vers `app/api/contact/route.ts`.
Dans Vercel → Settings → Environment Variables, ajoutez :

| Variable | Exemple |
|---|---|
| `RESEND_API_KEY` | clé créée sur https://resend.com (offre gratuite suffisante) |
| `CONTACT_TO` | `contact@dadadrinks.com` |
| `CONTACT_FROM` | `Site Dada <site@dadadrinks.com>` (domaine vérifié chez Resend) |
| `NEXT_PUBLIC_SITE_URL` | `https://www.dadadrinks.com` (pour le sitemap et les partages) |

Sans ces variables, les messages sont seulement visibles dans les logs Vercel.

## Lancer en local

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000

## Déployer sur Vercel

**Option 1 — via GitHub (recommandé)**
1. Créer un dépôt GitHub et y pousser ce dossier.
2. Sur vercel.com → *Add New… → Project* → importer le dépôt.
3. Vercel détecte Next.js tout seul : cliquer sur *Deploy*.

**Option 2 — en ligne de commande**
```bash
npm i -g vercel
vercel        # préversion
vercel --prod # mise en production
```

## Où modifier quoi

| Quoi | Fichier |
|---|---|
| Saveurs, textes des fiches, ingrédients, couleurs, prix | `lib/flavors.ts` |
| Menu, WhatsApp, réseaux sociaux, enseignes | `lib/site.ts` |
| Offre pro (palette, vitrines) | `lib/pro.ts` |
| Collaborations | `lib/collabs.ts` |
| Actualités et articles | `lib/news.ts` |
| Panier | `components/cart/` |
| Moteur 3D de la fiche produit | `lib/can3d/engine.ts` |
| Mise en page de la fiche produit | `components/product/ProductView.tsx` + `app/globals.css` (section « Fiche produit 3D ») |
| Étiquettes des canettes (gabarit + Cerise) | `public/labels/` |
| Textes et collages des 6 actes | `lib/story.ts` |
| Mots du générateur de poème | `lib/story.ts` (`POEM_WORDS`) |
| Couleur d'accent, typos, styles globaux | `app/globals.css` (`--accent`…) |
| Titre et description SEO | `app/layout.tsx` |
| Vitesse de l'histoire au scroll | `components/Story.tsx` (`STEP`) |

## À compléter avant la mise en ligne

- Photos de face des 12 autres canettes : elles remplaceront le fruit stylisé provisoire sur les étiquettes 3D.
- Ingrédients : la même liste (avec « arôme naturel de pomme ») figure sur toutes les eaux fruitées du site actuel, et ils manquent pour le Lemon et les colas — à vérifier avec Dada.

- Couleurs exactes des canettes (à caler sur les packagings).
- Visuels des collabs (Ninho, Jul, PFL) : remplacer les blocs « [ VISUEL … ] ».
- Paiement : le panier fonctionne, il reste à brancher le paiement (Stripe Checkout ou Shopify) sur le bouton « Passer commande » (`components/cart/CartView.tsx`).
- Offre pro : confirmer si les prix des vitrines et de la palette sont HT ou TTC.
- Pages légales : compléter les éléments entre crochets (raison sociale, SIREN, adresse…).
- Formulaire newsletter : brancher l'outil d'e-mailing.
- Mentions légales et CGV.
