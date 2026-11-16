# Actualités (MDX)

Une actualité = un fichier `.mdx` de ce dossier.

- `export const meta = { ... }` : les informations de la carte (titre, date `AAAA-MM`, catégorie, résumé, image, vidéo, source).
  - `"article": true` : l'actualité a sa propre page `/actualites/<slug>` avec le texte écrit sous `meta`.
  - sans `article` : la carte renvoie vers `external` (lien YouTube, article…).
- Sous `meta` : le texte de l'article en Markdown (un paragraphe = un bloc séparé par une ligne vide).

Pour ajouter une actualité : créer le fichier puis l'ajouter à la liste `MODULES` de `lib/news.ts` (l'ordre de la liste = l'ordre d'affichage).
