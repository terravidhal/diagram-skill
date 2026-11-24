# Rapport de livraison — Diagramforge

## Objet

Skill d'agent pour produire des diagrammes **HTML + SVG autonomes**, sans réseau ni
dépendance à l'exécution. Le dépôt suit la structure du modèle `logoforge-skill` :
`skills/diagramforge/SKILL.md`, neuf références, trois assets, seize sources d'exemples,
douze evals, des scripts de vérification, un README avec captures avant/après, une
licence MIT et un workflow CI.

Le dépôt de référence `cathrynlavery/diagram-design` a été cloné dans `ref/` pour
l'étude (méthode, contraintes, anatomie, choix de rendu). `ref/` est ignoré par git et
n'est ni publié ni vendu. Aucun fichier, paragraphe, palette ou dessin n'en est repris.

## Ce qui est livré

- **40 types de diagrammes** documentés : architecture, flux, séquence, états, ERD,
  schéma SQL, arbre, org chart, timeline, quadrant, Gantt, kanban, parcours, data flow,
  pipeline, topologie, frontières de sécurité, dépendances, Venn, heatmap, radar,
  waterfall, fishbone, traçabilité d'exigences, etc.
- **9 palettes** (`paper`, `midnight`, `ocean`, `forest`, `sand`, `slate`, `mono`,
  `contrast`, `brand`) réglées en une ligne sur `<html>`, avec dérivation des rôles par
  `color-mix()` et bascule clair/sombre automatique via `prefers-color-scheme`.
- **Palette de marque** : trois variables (`--brand-paper`, `--brand-ink`,
  `--brand-accent`) suffisent ; le reste est dérivé.
- **Six modes d'animation CSS/SVG purs** : `none`, `draw`, `reveal`, `flow`, `focus`,
  `combo`. Ordre par `--order`, budgets contrôlés, arrêt complet sous
  `prefers-reduced-motion`, `@media print` et `data-static="true"`.
- **16 diagrammes réels**, chacun en deux palettes et en clair/sombre, soit 32 fichiers
  HTML autonomes et 64 captures.
- **Contrat d'accessibilité** : `role="img"`, `<title>` en premier enfant, `<desc>`,
  IDs préfixés, contraste texte ≥ 4,5:1, marques structurelles ≥ 3:1, aucun état porté
  par la couleur seule.
- **README** avec comparatif avant/après, galerie de palettes, captures, GIF de démo,
  commande d'installation `npx skills add terravidhal/diagramforge-skill --skill diagramforge`.
- **12 evals** (`evals/evals.json`) : palette en une ligne, auto-dark, accent de marque,
  reduced motion, export statique, budget, retenue, SVG accessible, connecteurs
  orthogonaux, zéro réseau, ordre d'animation, labels français longs.

## Captures

- Comparatif avant/après : [`assets/readme/before-after.png`](assets/readme/before-after.png)
- Même architecture en clair et sombre :
  [`hero-light.png`](assets/readme/hero-light.png) ·
  [`hero-dark.png`](assets/readme/hero-dark.png)
- Neuf palettes, clair et sombre : [`palettes.png`](assets/readme/palettes.png)
- Mise en page mobile 390 px : [`example-mobile.png`](assets/readme/example-mobile.png)
- 64 déclinaisons : [`assets/readme/examples/`](assets/readme/examples/)
- Démonstration animée `draw` + `reveal` + `flow` : [`assets/demo.gif`](assets/demo.gif)

## Vérifications exécutées

Toutes les commandes ci-dessous sont passées au vert avant le commit.

| Commande | Résultat |
|---|---|
| `npm run lint` | structure, frontmatter, 40 types, 32 exemples, palettes, motion, a11y, zéro réseau |
| `npm run lint` (contraste) | 342 paires sur 9 palettes × 2 modes ; marge minimale 4,73:1 |
| `npm run lint` (géométrie) | grille 4 px, bornes, lignes orthogonales, masques de nœuds et de labels, marqueurs, budgets |
| `npm run lint` (motion) | modes, ordre, budgets, traits dessinés, cibles `focus`/`flow`, cadre statique |
| `npm run lint` (provenance) | 153 fichiers comparés octet par octet à `ref/`, 77 fichiers texte ; aucun fichier identique, aucun paragraphe copié, aucune suite de 12 mots partagée |
| `npm run lint:browser` | 32 fichiers × clair/sombre : aucune erreur console, aucune requête réseau, texte complet ; 12 fichiers animés tournent puis se figent sous `data-static`, impression et reduced motion |
| `npm run lint:shots` | 64 captures + hero clair/sombre + palette + mobile + avant/après, en Chromium |
| `npm run lint:demo` | GIF de 60 images à 10 fps, 190 kB |
| `npm run lint:examples:check` | les 32 fichiers générés correspondent aux sources et aux feuilles partagées |

Contrôles visuels : les captures ont été ouvertes et relues. Les textes sont dans leur
cadre, les étiquettes sur masque, les traits orthogonaux, les accents limités à un rôle
focal. Le cadrage des captures a été corrigé (marge de page) après une première passe
qui coupait le haut des titres.

## Limites connues

- **16 exemples pour 40 types.** Les 24 autres types ont une recette de disposition, un
  budget et des anti-exemples, mais pas de fichier de démonstration dédié.
- **Export SVG/PNG documenté, pas packagé.** La procédure et les contraintes sont dans
  `references/export.md` ; l'agent ou le navigateur produit le fichier. Aucun script
  d'export autonome n'est fourni.
- **Vérification navigateur sur Chromium uniquement.** Firefox et Safari n'ont pas été
  exécutés. Les polices sont des piles système : les métriques peuvent varier de
  quelques pixels selon l'OS. Les budgets de labels utilisent une estimation de 0,62em
  par caractère mono.
- **Palette de marque manuelle.** L'utilisateur fournit trois couleurs ; le skill ne
  scrape pas un site ni n'extrait automatiquement une charte.
- **Animation sans JavaScript.** Pas de contrôles de lecture, de pause ou de scrubbing :
  c'est un choix, la sémantique est complète sans mouvement.
- **Provenance locale.** `lint:provenance` ne s'exécute que si `ref/` est présent ; en CI
  il s'ignore proprement. Les dessins ne sont pas comparés image par image, seulement
  les fichiers et la prose.
- **Non publié.** Aucun `git push`, aucune release, aucun test réel de
  `npx skills add …` puisque le dépôt n'existe pas encore côté GitHub.
- **`ETUDE.md`** contient les notes de recherche et les sources. C'est un document de
  travail volumineux ; sa présence dans le dépôt public est à confirmer.

## Ce qui reste à Vidhal

1. **Créer le dépôt GitHub** `terravidhal/diagramforge-skill` (ou valider un autre nom),
   pousser `main`, puis tester `npx skills add terravidhal/diagramforge-skill --skill diagramforge`
   sur Claude Code, Codex et OpenCode.
2. **Valider les métadonnées** : nom du dépôt, version `0.1.0`, détenteur du copyright
   dans `LICENSE`, description et topics GitHub.
3. **Décider du sort d'`ETUDE.md`** : le garder comme note publique, le déplacer dans un
   dossier interne, ou le retirer. Si retiré, ajuster le lien du README.
4. **Relire les captures sur l'OS cible** (macOS/Windows) pour confirmer les piles de
   polices, l'impression et le rendu sombre.
5. **Optionnel** : ajouter un job CI Playwright (captures et `lint:browser`), une galerie
   GitHub Pages, et un petit script d'export SVG/PNG packagé.
6. **Optionnel** : compléter la galerie avec les 24 types non illustrés, ou assumer les
   16 exemples comme jeu de preuve.

## État du dépôt

- `ref/`, `node_modules/`, `preview/` et `.vague/` sont ignorés.
- Aucun secret, aucune donnée personnelle, aucun chemin local dans les fichiers publiés.
- Commit initial sur `main`, auteur `terravidhal`.
- Licence MIT.
