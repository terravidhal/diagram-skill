# ETUDE — Diagramforge

> Étude comparative et spécification du skill `diagramforge` : diagrammes HTML + SVG
> autonomes, thèmes commutables en une ligne, clair/sombre automatique, animations
> optionnelles en CSS/SVG pur.
>
> Date de l'étude : 24 novembre 2026.
> Dépôt cible : `terravidhal/diagramforge-skill` (nom de travail).
> Licence du projet : MIT.

---

## 0. TL;DR

1. **La référence `cathrynlavery/diagram-design` est excellente sur la méthode** : choix
   sémantique avant le type visuel, budget de complexité, connecteurs orthogonaux,
   contrat SVG accessible, gate visuel « render and look », et une bibliothèque de
   52 types. C'est le niveau à égaler.
2. **Sa licence est MIT** (vérifié le 24/11/2026, contrairement à la prémisse « aucun
   droit réservé »). Nous n'en copions pas moins aucun fichier, texte ou dessin : nous
   réécrivons tout et nous ne reprenons que des **idées de méthode**, libres.
3. **Ses limites sont précisément nos trois angles d'attaque** :
   - thème figé à la génération (pas de bascule runtime en une ligne, pas de clair/sombre
     automatique) ;
   - animation optionnelle mais pilotée par un contrôleur JS et un template séparé ;
   - dépendance à Google Fonts et à des scripts Python pour les vérifications.
4. **Notre proposition** : `diagramforge`, 40 types utiles (pas 52), un design system
   en variables CSS, 8 palettes + palette de marque, `data-theme="auto"`, animations
   `draw` / `reveal` / `flow` / `focus` 100 % CSS/SVG, sortie unique HTML+SVG sans
   aucune dépendance réseau, et des garde-fous Node + Playwright.
5. **Nom** : `diagramforge` est libre sur GitHub (`terravidhal/diagramforge`) et sur npm
   (`diagramforge`) ; le dépôt peut s'appeler `diagramforge-skill`. Alternatives libres :
   `diagramcraft`, `diagramforge-skill`.

---

## 1. Méthode d'étude et corrections de prémisse

### 1.1 Sources lues

| Source | Ce qui a été lu | Commit / date |
|---|---|---|
| `cathrynlavery/diagram-design` | `SKILL.md`, `README`, `LICENSE`, `references/style-guide.md`, `animation.md`, `primitives-core.md`, `type-architecture.md`, `output-spec.md`, arborescence complète | `0eeda75`, poussé le 23/11/2026 |
| `tt-a1i/archify` | `README.md`, structure, philosophie de validation | branche `main`, 24/11/2026 |
| `Cocoon-AI/architecture-diagram-generator` | `README.md`, structure du template | branche `main`, 24/11/2026 |
| `coleam00/excalidraw-diagram-skill` | `README.md`, `SKILL.md` | branche `main`, 24/11/2026 |
| `terravidhal/logoforge-skill` | `README.md`, `skills/logoforge/SKILL.md`, `scripts/check-skill.mjs`, `evals/evals.json` | branche `main`, 24/11/2026 |

Recherche de dépôts voisins via l'API GitHub (équivalent de `gh search`), tri par
étoiles. Le clone local de la référence n'a pas pu être matérialisé dans cette session :
l'environnement d'exécution bloque `git clone` et l'accès aux répertoires hors workspace.
L'étude a donc été faite sur les fichiers bruts du dépôt, au commit ci-dessus. Le dossier
`ref/` reste prévu et ignoré par Git ; sur un poste non restreint :

```bash
git clone --depth 1 https://github.com/cathrynlavery/diagram-design ref
```

> Note d'implémentation (24/11/2026) : le clone de travail a finalement été
> matérialisé dans `ref/` à partir de l'archive codeload du dépôt. Il reste ignoré par
> Git et n'est jamais publié ; aucun de ses fichiers n'est copié dans le skill.

### 1.2 Correction importante sur la licence

La prémisse « aucune licence = tous droits réservés » est **factuellement inexacte** au
24/11/2026 : le dépôt contient un fichier `LICENSE` MIT (Copyright 2025 Cathryn Lavery),
et l'API GitHub déclare `MIT`. Le dépôt compte ~71 756 étoiles.

Cela ne change pas notre ligne de conduite : **nous n'utilisons aucun fichier, aucun
texte et aucun dessin de la référence**. Nous étudions des idées, des formats et des
contraintes, puis nous écrivons notre propre skill. Cette étude ne cite que de courts
libellés techniques (noms de rôles, de modes) pour décrire la méthode.

### 1.3 Ce que « s'en inspirer » veut dire ici

- Reprendre : la discipline de conception, les catégories de problèmes, les seuils de
  complexité, l'idée de références chargées à la demande, le contrôle visuel final.
- Ne pas reprendre : les fichiers `references/*.md`, les templates HTML, les exemples,
  les palettes nommées, les textes, les scripts, les captures, les dessins.
- Toute nouvelle règle est reformulée et, quand c'est pertinent, **améliorée** (thème
  runtime, animation CSS, zéro réseau, vérification Node).

---

## 2. Anatomie de la référence `diagram-design`

### 2.1 Chiffres et structure

- 52 types visuels, un fichier de référence par type.
- Un `SKILL.md` court (contrat + routage), qui renvoie vers des références spécialisées.
- Un `style-guide.md` unique, source de vérité des couleurs, typographies et tokens.
- Des primitives SVG communes (fond, marqueurs de flèche, boîte de nœud, étiquette,
  légende, contrat d'accessibilité).
- Trois variantes de template : light minimal, dark minimal, full editorial ; plus des
  variantes sketchy et terminal.
- Des scripts Python de vérification : géométrie, contraste, accessibilité, mouvement,
  débordement, captures.
- Des imports (draw.io, Mermaid, Excalidraw, PlantUML) traités comme des **redessins**,
  pas des conversions.
- Des profils clients et un onboarding pour extraire une palette depuis un site.

### 2.2 Le pipeline de décision de l'agent

La référence impose un ordre précis, qui est sa meilleure idée :

1. **Vérifier le style** : si le projet est encore sur le thème par défaut, demander une
   personnalisation avant de dessiner.
2. **Choisir un motif sémantique** quand le comportement, l'état, la sécurité ou le
   risque portent le sens (file d'attente, goulet, zones de confiance, traces de règles,
   cycle de vie…).
3. **Choisir le type visuel** le plus proche pour la mise en page.
4. **Charger la référence du type** avant de dessiner.
5. **Annoncer le plan** : type, taille, coupes prévues.
6. **Dessiner** avec les primitives et les contraintes du type.
7. **Passer le taste gate** (checklist), puis **regarder le rendu** et corriger.

Ce double niveau « intention sémantique → grammaire visuelle » évite le choix paresseux
d'un type au nom séduisant mais inadapté.

### 2.3 Les règles de style qui font la qualité

- **Éditorial, pas décoratif** : titre serif, noms de nœuds en sans, contenu technique en
  mono. Pas de mono comme police « dev » universelle.
- **Une seule couleur focale** (1–2 éléments maximum). Le reste est encre, gris, filets.
- **Pas d'ombre** ; bordures fines, rayons 6–8 px.
- **Grille de 4 px** pour toutes les géométries.
- **Connecteurs orthogonaux** avec coudes arrondis, ports répartis sur les bords, étiquettes
  sur masque opaque avec un espace visible, pas de croisement sauvage.
- **Budget de complexité** : 9 nœuds, 12 flèches, 2 accents, 2 annotations ; au-delà, on
  scinde en vue d'ensemble + détail.
- **Philosophie de suppression** : un nœud qui voyage toujours avec un autre est le même
  nœud ; une flèche évidente peut disparaître ; un schéma est fini quand on ne peut plus
  rien enlever.
- **Contrat SVG accessible** : `role="img"`, `aria-labelledby`, `<title>` en premier
  enfant, IDs préfixés, `<desc>` qui décrit le contenu et non la géométrie.
- **Densité cible 4/10** : techniquement complet, pas besoin d'un guide de lecture.

### 2.4 Ce qui rend leurs résultats beaux

1. **La retenue** : peu de nœuds, peu de couleurs, peu d'effets.
2. **La hiérarchie typographique** : trois familles, des rôles nets, des tailles calibrées.
3. **La géométrie disciplinée** : grille, alignements, ports, labels masqués, z-order.
4. **Le contraste editorial** : papier chaud, encre profonde, un accent brûlé.
5. **Le contrôle du réel** : ils rendent le fichier en PNG et le regardent ; ils ne
   jugent pas le code SVG à l'aveugle.
6. **Les anti-patrons explicites** : dark mode néon, ombres, coins très arrondis,
   légende flottante, flèches diagonales, texte vertical, cartes identiques.
7. **La cohérence des variantes** : light, dark, full, terminal, sketchy, motion.

### 2.5 Limites observées (nos opportunités)

| Limite | Conséquence | Notre réponse |
|---|---|---|
| Les tokens sont résolus **à la génération** ; changer de thème = éditer un fichier et régénérer | Pas de bascule à chaud, pas de thème applicatif | Variables CSS runtime + `data-palette` |
| Light et dark sont deux **fichiers séparés** | Risque de divergence, pas de suivi OS | `data-theme="auto"` + `prefers-color-scheme` |
| L'animation « step » dépend d'un **contrôleur JS** copié verbatim | Poids, surface de bug, couplage | Animations CSS/SVG pures, sans JS |
| Polices Google par défaut | Requête réseau, rendu variable hors ligne | Pile système par défaut, zéro requête |
| Vérifications en **Python** (géométrie, contraste, motion) | Dépendances, portabilité | Vérificateurs Node ESM, Playwright en dev uniquement |
| 52 types = **surface énorme** | Maintenance, références inégales | 40 types, contrats courts, P0/P1/P2 |
| Import = redessin manuel | Friction, mais qualité | Hors périmètre v1 ; on documente le redessin |
| Le `SKILL.md` reste volumineux | Contexte consommé | `SKILL.md` < 300 lignes + index de types |

À noter : la référence fait déjà des choses que beaucoup de skills ne font pas (dark,
animation optionnelle, contraste vérifié, accessibilité). Nos « plus » ne sont pas des
reproches de qualité ; ce sont des **choix d'architecture** plus adaptés à un usage
runtime et à une distribution sans dépendance.

### 2.6 Leurs 52 types, classés

Liste des types proposés par la référence, regroupés par famille (nos propres mots) :

| Famille | Types |
|---|---|
| Systèmes et architecture (12) | architecture, architecture delta, IT current-state, high-level, process, medallion, data flow, DP integration, DP security matrix, deployment, dependency graph (dont arc), architecture containment |
| Flux et temps (13) | flowchart, sequence, state machine, steps, timeline, git graph, swimlane, Gantt, schedule network, event modeling, service blueprint, user journey, loop |
| Structure et hiérarchie (10) | ER, database schema, UML class, tree, org chart, nested, layer stack, exploded axonometric, axonometric plan, Venn |
| Quantitatif (11) | radar, polar, bar, waterfall, treemap, heatmap, line (slopegraph, ridgeline, bump), scatter (bubble, beeswarm, box plot), Sankey, unit grid, marimekko |
| Analyse et stratégie (6) | quadrant, Wardley map, fishbone, kanban, story map, requirement traceability |
| Domaine spécialisé (2) | SBGN (biologie), pyramid/funnel |

Le tableau compte 54 entrées parce qu'il inclut deux variantes de mise en page
(`architecture containment`, `marimekko`) que la référence rattache à un type parent ;
le dépôt annonce bien 52 types. Leur force est la couverture ; leur risque est la
dispersion. Nous préférons **40 types très bien outillés** à 52 types dont certains sont
des variantes déguisées.

---

## 3. Trois autres skills populaires

### 3.1 `tt-a1i/archify` — ~99 400 étoiles, Apache-2.0

- **Approche** : un IR JSON typé, un CLI Node qui valide puis rend un HTML autonome.
  10 types (architecture, workflow, séquence, data flow, lifecycle, ERD, class, tree,
  timeline, waterfall).
- **Forces** : validation atomique avant livraison, reçus de réparation lisibles,
  interactions (focus, routes, upstream/downstream), thèmes clair/sombre à l'exécution,
  preuves visuelles, très bonne narration produit.
- **Limites pour nous** : l'agent doit apprendre un DSL JSON et lancer un CLI Node ;
  le rendu dépend du paquet ; la personnalité visuelle est celle d'Archify, pas une
  palette de marque en une ligne ; animations liées au viewer.
- **À reprendre** : la validation avant livraison, les codes d'erreur stables, l'idée de
  « source typée » et de reçu de fidélité.
- **À ne pas reprendre** : la dépendance à un runtime Node pour produire le fichier.

### 3.2 `Cocoon-AI/architecture-diagram-generator` — ~7 650 étoiles, MIT

- **Approche** : un seul type (architecture), un template HTML sombre, des cartes de
  synthèse, export PNG/PDF intégré.
- **Forces** : simplicité, résultat immédiat, bonne lisibilité pour un schéma système.
- **Limites** : thème sombre uniquement, palette figée par type de composant, JetBrains
  Mono partout, trois cartes identiques, un seul type. C'est exactement le « AI slop »
  élégant que la référence combat.
- **À reprendre** : la promesse « un fichier, aucune install ».
- **À éviter** : la palette figée, la mono décorative, les cartes génériques.

### 3.3 `coleam00/excalidraw-diagram-skill` — ~5 340 étoiles, **sans licence**

- **Approche** : produire du JSON `.excalidraw`, avec une philosophie forte : un diagramme
  doit **argumenter**, pas afficher. Chaque forme imite le comportement (fan-out,
  convergence, timeline, cycle). Boucle obligatoire rendu → inspection → correction.
- **Forces** : la meilleure formulation de l'isomorphisme forme/sens ; les artefacts de
  preuve (extraits de code, payloads réels) ; la validation visuelle avec Playwright.
- **Limites** : sortie non HTML/SVG, aucun thème runtime, pas d'accessibilité intégrée,
  aucune licence (donc méthode seulement).
- **À reprendre** : le test d'isomorphisme, le test d'éducation, la boucle de rendu.
- **À ne pas reprendre** : le format propriétaire et l'absence de contrat a11y.

### 3.4 Comparaison synthétique

| Critère | diagram-design | archify | Cocoon | excalidraw-skill | **Diagramforge (cible)** |
|---|---|---|---|---|---|
| Étoiles (24/11/2026) | ~71 756 | ~99 447 | ~7 648 | ~5 340 | — |
| Licence | MIT | Apache-2.0 | MIT | aucune | **MIT** |
| Sortie | HTML + SVG | HTML (via IR JSON) | HTML + SVG | JSON Excalidraw | **HTML + SVG** |
| Types | 52 | 10 | 1 | motifs | **40** |
| Thème runtime | non (génération) | oui | non | non | **oui, 1 ligne** |
| Clair/sombre auto | non (2 fichiers) | oui | non | non | **oui** |
| Palettes | 1 + profils | 4 styles | 1 | 1 fichier | **8 + marque** |
| Animation | optionnelle, JS | viewer | non | non | **CSS/SVG pur** |
| Dépendances de sortie | Google Fonts | CLI Node | Google Fonts | Excalidraw | **aucune** |
| Vérif. géométrie | Python | Node | non | Playwright | **Node + Playwright** |
| Accessibilité | contrat fort | partielle | partielle | non | **contrat fort** |

---

## 4. Ce que nous reprenons comme méthode

1. **Intention avant type** : d'abord la question (« ordre ? dépendance ? quantité ?
   causalité ? changement ? »), ensuite le type visuel.
2. **Une référence par type, chargée à la demande** : le `SKILL.md` route, il ne contient
   pas tout.
3. **Budget explicite** : 9 nœuds, 12 arêtes, 2 accents, 2 annotations ; au-delà, split.
4. **Primitives partagées** : fond, marqueurs, boîte, étiquette, légende, zone, port.
5. **Contrôle visuel obligatoire** : générer, rendre, regarder, corriger (max 2 passes).
6. **Checklist de sortie** : fit du type, test de suppression, signal, technique,
   typographie, accessibilité.
7. **Anti-patrons nommés** : ombres, rayons excessifs, néon, texte vertical, légende
   flottante, cartes identiques, accents multiples.
8. **Contrat SVG accessible** dès le premier jet, pas en rustine.
9. **Reçu de fidélité** quand on simplifie une source (ce qui a été fusionné, coupé,
   conservé).
10. **Evals comportementales** : des prompts avec `must` / `must_not`, pas seulement des
    tests unitaires.

Ce que nous ne reprenons pas : les textes, les fichiers de référence, les templates, les
palettes nommées, les captures, les scripts et les exemples. Tout est réécrit.

---

## 5. Ce que nous faisons mieux

### 5.1 Thème en une ligne

Le fichier généré contient toutes les variables CSS. L'utilisateur change :

```html
<html data-theme="auto" data-palette="ocean">
```

ou, pour une marque :

```html
<html data-theme="auto" data-palette="brand"
      style="--brand-paper:#ffffff;--brand-ink:#0b0b0c;--brand-accent:#635bff">
```

Aucune régénération, aucun script, aucun rebuild. Les 8 palettes sont livrées dans le
même fichier (ou dans un `<style>` de 4 Ko). La palette de marque dérive les rôles
secondaires à partir de trois entrées.

### 5.2 Clair/sombre automatique, avec override

- `data-theme="auto"` suit `prefers-color-scheme`.
- `data-theme="light"` / `dark` force.
- `color-scheme` est déclaré pour les contrôles natifs et les captures.
- Les deux jeux de tokens vivent dans le même fichier ; pas de variante `-dark` à
  maintenir.

### 5.3 Animations optionnelles, sans JS

Quatre modes, tous en CSS/SVG :

| Mode | Effet | Usage |
|---|---|---|
| `draw` | les traits se dessinent (`stroke-dashoffset` + `pathLength="1"`) | flux, séquence, dépendances |
| `reveal` | les éléments apparaissent dans l'ordre du flux (`opacity` + `translateY`) | étapes, architecture, timeline |
| `flow` | des tirets circulent sur les arêtes actives | trafic, boucle, pipeline |
| `focus` | halo/pulse sur 1 nœud focal | attirer l'œil sans bruit |

`combo` combine `draw` + `reveal`. L'ordre est porté par `--order` (entier) et le rythme
par `--dur` / `--stagger`. Les animations sont **décoratives** : le sens complet existe
dans le cadre statique. `prefers-reduced-motion: reduce` et `@media print` figent l'état
final. L'export statique force cet état.

### 5.4 Zéro dépendance

- Pas de Google Fonts : piles système (`ui-serif`, `ui-sans-serif`, `ui-monospace`).
- Pas de CDN, pas de script externe, pas d'image externe.
- Un seul `.html` avec CSS et SVG inline.
- Les icônes sont des primitives SVG internes, pas un pack externe.
- Les polices web sont **opt-in** (`data-fonts="web"`), jamais le défaut.

### 5.5 Palette de marque réellement utilisable

Trois entrées suffisent (papier, encre, accent). Le skill :

1. vérifie le contraste des couples texte/fond (4,5:1 ; 3:1 pour les grands textes et les
   traits essentiels) ;
2. dérive `surface`, `muted`, `soft`, `line`, `accent-soft`, `link` ;
3. refuse un accent qui ne passe pas et propose la variante la plus proche ;
4. écrit le bloc `:root[data-palette="brand"]` dans le fichier.

### 5.6 Vérification Node, pas Python

- `scripts/check-skill.mjs` : frontmatter, liens, JSON, assets, contrats.
- `scripts/check-geometry.mjs` : diagonales, ports, masques, croisements.
- `scripts/check-contrast.mjs` : toutes les paires des 8 palettes.
- `scripts/check-motion.mjs` : budgets, état final, reduced-motion.
- `scripts/screenshot.mjs` : Playwright/Chromium, light/dark, desktop/mobile, PNG.
- `npm run lint` orchestre le tout. Playwright reste une dépendance de développement ;
  la sortie n'en dépend pas.

### 5.7 Documentation utile, pas un roman

- `SKILL.md` < 300 lignes : philosophie, routage, budget, contrat, checklist.
- `references/index.md` : table des 40 types avec « choisir si… ».
- Un `CHEATSHEET.md` d'une page pour les prompts.
- Une galerie de palettes et une galerie d'animations générées par le dépôt.
- Un README avec before/after, light/dark, mobile, GIF de démo.

### 5.8 Ce que nous ne prétendons pas faire

- Pas d'éditeur graphique.
- Pas d'import Mermaid/draw.io en v1 (le redessin manuel est documenté).
- Pas de contrôle pas-à-pas interactif sans JS en v1 (l'autoplay unique suffit).
- Pas de layout automatique : l'agent choisit et assume la géométrie.

---

## 6. Nom et disponibilité

### 6.1 Proposition

| Élément | Valeur |
|---|---|
| Nom du skill | **`diagramforge`** |
| Dépôt GitHub | **`terravidhal/diagramforge-skill`** |
| Commande | `npx skills add terravidhal/diagramforge-skill --skill diagramforge` |
| Package npm (optionnel) | `diagramforge` (outil de vérification/capture) |
| Dossier | `skills/diagramforge/` |

Le nom est court, prononçable, cohérent avec `logoforge`, et dit ce qu'il fait : une forge
de diagrammes, pas un éditeur.

### 6.2 Vérifications de disponibilité (24/11/2026)

`gh` n'étant pas autorisé dans cet environnement, les vérifications ont été faites via
l'API GitHub et le registre npm (mêmes données que `gh repo view` / `npm view`).

| Candidat | `terravidhal/<nom>` | npm | Verdict |
|---|---|---|---|
| `diagramforge` | 404 → libre | 404 → libre | **retenu** |
| `diagramforge-skill` | 404 → libre | 404 → libre | libre (nom du dépôt) |
| `diagramcraft` | 404 → libre | 404 → libre | bon fallback |

À refaire juste avant publication :

```bash
gh repo view terravidhal/diagramforge-skill
npm view diagramforge version
npm view diagramforge-skill version
```

### 6.3 Identité

- Titre : « Diagramforge — des diagrammes qui tiennent debout ».
- Baseline : « HTML + SVG autonome. 8 palettes. Clair/sombre auto. Animation au choix. »
- Ton : éditorial, précis, anti-slop. Pas de superlatifs, pas d'emoji dans les fichiers.

---

## 7. Nos 40 types de diagrammes

### 7.1 Principes de sélection

- **Un type = une grammaire de layout**, pas une variante cosmétique.
- **40 types maximum** en v1 : au-delà, on ajoute une variante à un type existant.
- **P0** = les 12 types livrés en premier avec exemples et captures.
- **P1** = la vague suivante ; **P2** = backlog documenté.

### 7.2 Table des 40 types

| # | Type | Slug de référence | À utiliser quand… | Prio |
|---|---|---|---|---|
| 1 | Architecture | `architecture` | composants, services, stockage, frontières, flux principal | P0 |
| 2 | Flowchart | `flowchart` | logique de décision, branches, garde-fous | P0 |
| 3 | Sequence | `sequence` | messages ordonnés entre acteurs, retours, async | P0 |
| 4 | State machine | `state-machine` | états, transitions, guards, reprises, états terminaux | P0 |
| 5 | ERD | `erd` | entités, relations, cardinalités, clés | P0 |
| 6 | Dependency graph | `dependency-graph` | qui dépend de quoi, fan-in, cycles | P0 |
| 7 | Tree | `tree` | hiérarchie à parent unique, décomposition | P0 |
| 8 | Quadrant | `quadrant` | positionnement 2 axes, priorisation | P0 |
| 9 | Timeline | `timeline` | événements datés, incidents, historiques | P0 |
| 10 | Before/after delta | `before-after-delta` | changement structurel entre deux états | P0 |
| 11 | Data flow | `data-flow` | sources → transformations → consommateurs, sensibilité | P0 |
| 12 | Layer stack | `layer-stack` | niveaux d'abstraction, responsabilités empilées | P0 |
| 13 | Swimlane | `swimlane` | processus multi-acteurs avec handoffs | P1 |
| 14 | Service blueprint | `service-blueprint` | parcours client vs coulisses, ligne de visibilité | P1 |
| 15 | Kanban | `kanban` | WIP, colonnes, blocages, limites | P1 |
| 16 | User journey | `user-journey` | étapes vécues, émotions, points de friction | P1 |
| 17 | Gantt | `gantt` | tâches, phases, dépendances, jalons | P1 |
| 18 | Deployment | `deployment` | zones, hôtes, artefacts, réplicas, ports | P1 |
| 19 | Network topology | `network-topology` | sous-réseaux, passerelles, flux autorisés | P1 |
| 20 | Data pipeline | `data-pipeline` | ingestion, bronze/argent/or, qualité, lineage | P1 |
| 21 | Security boundaries | `security-boundaries` | zones de confiance, ingress/egress, contrôles | P1 |
| 22 | Integration map | `integration-map` | sources → cœur → consommateurs, APIs, événements | P1 |
| 23 | Database schema | `db-schema` | tables physiques, types SQL, index, contraintes | P1 |
| 24 | UML class | `uml-class` | classes, interfaces, héritage, composition | P1 |
| 25 | Org chart | `org-chart` | propriété, reporting, escalade, routage | P1 |
| 26 | Nested containment | `nested` | poupées russes, scopes imbriqués, quotas | P1 |
| 27 | Venn | `venn` | chevauchements d'ensembles, intersection | P1 |
| 28 | Capability map | `capability-map` | capacités métier, maturité, ownership | P1 |
| 29 | Roadmap | `roadmap` | horizons, releases, jalons, dépendances | P1 |
| 30 | Git graph | `git-graph` | branches, merges, rebase, hotfix, backports | P1 |
| 31 | Loop / flywheel | `loop-flywheel` | cycle renforcé, dernier pas → premier | P1 |
| 32 | Pyramid / funnel | `pyramid-funnel` | hiérarchie, conversion, entonnoir | P1 |
| 33 | Bar chart | `bar` | comparaison de catégories | P1 |
| 34 | Line chart | `line` | tendance continue, slopegraph, bump | P1 |
| 35 | Radar | `radar` | plusieurs entités sur 3–5 critères | P1 |
| 36 | Heatmap | `heatmap` | matrice croisée, intensité par cellule | P1 |
| 37 | Treemap | `treemap` | partie-tout, tailles relatives | P1 |
| 38 | Waterfall (finance) | `waterfall` | total de départ → contributions signées → total final | P1 |
| 39 | Fishbone | `fishbone` | causes d'un effet, par catégorie | P2 |
| 40 | Requirement traceability | `requirement-traceability` | exigences ↔ conception ↔ tests, trous explicites | P2 |

### 7.3 Backlog P2 (variantes ou ajouts)

`process-bpmn`, `cloud-landscape`, `mind-map`, `concept-map`, `schedule-network` (PERT),
`story-map`, `sankey`, `unit-grid`, `event-modeling`, `exploded-axonometric`,
`arc-dependency`, `marimekko`, `box-plot`, `beeswarm`, `slopegraph`, `ridgeline`.

Règle : une variante qui ne change que la décoration ne devient pas un type ; elle devient
une option du type parent.

### 7.4 Arbre de décision (à mettre dans `SKILL.md`)

```
1. La question est-elle « combien / comment ça évolue » ?        → quantitatif
2. « Dans quel ordre / à quel moment » ?                          → flux ou temps
3. « Qui dépend de quoi / qu'est-ce qui contient quoi » ?         → structure
4. « Où ça tourne / qu'est-ce qui communique avec quoi » ?        → systèmes
5. « Pourquoi / quelles causes » ?                                → analyse
6. « Qu'est-ce qui change entre avant et après » ?                → delta
7. Si un tableau de 3 colonnes suffit : ne pas dessiner.
8. Si deux types hésitent : choisir l'axe dominant, pas un second layout.
```

Exemples de routage :

- « Le P99 a triplé, où va le temps ? » → `waterfall` (temps par étape) ou `sequence`
  (si l'ordre des appels est le sujet), pas `architecture`.
- « Comment notre service parle à Redis et Postgres ? » → `architecture` + `sequence`
  seulement si l'ordre est essentiel.
- « Qui peut accéder à quoi ? » → `security-boundaries` ou `quadrant` selon que le sujet
  est la topologie ou le risque.
- « Qu'est-ce qui a changé dans le déploiement ? » → `before-after-delta`, pas deux
  architectures côte à côte sans ledger.

### 7.5 Budgets par défaut

| Contrainte | Valeur |
|---|---|
| Nœuds | 9 (P0) ; 12 max pour les types « liste » (kanban, gantt) |
| Arêtes | 12 |
| Accents | 2 |
| Annotations | 2 |
| Zones | 3 |
| Profondeur de hiérarchie | 4 |
| Étapes animées | 8 |
| Éléments animés | 12 |
| Animations simultanées | 2 |
| Durée totale | ≤ 8 s |
| Boucle décorative | ≥ 3 s |

Au-delà : vue d'ensemble + détail, avec un reçu de fidélité.

---

## 8. Architecture cible du dépôt

```text
diagramforge-skill/
├── README.md                     before/after, light/dark, mobile, GIF, install
├── LICENSE                       MIT
├── CONTRIBUTING.md               règles et fichiers à éditer
├── ETUDE.md                      ce document
├── package.json                  scripts lint/screenshot, devDeps Playwright
├── .gitignore                    ref/, node_modules/, artefacts temporaires
├── ref/                          clone de travail de la référence (ignoré)
├── skills/diagramforge/
│   ├── SKILL.md                  < 300 lignes, routage + contrat
│   ├── references/
│   │   ├── index.md              table des 40 types + « choisir si… »
│   │   ├── diagram-types.md      grammaire de disposition par type
│   │   ├── design-system.md      tokens, rôles, typographie, espacement
│   │   ├── palettes.md           8 palettes + marque, dérivation et contraste
│   │   ├── layout.md             grille, budgets, tailles, zones
│   │   ├── connectors.md         orthogonaux, ports, labels, hops
│   │   ├── animation.md          6 modes, budgets, reduced-motion
│   │   ├── accessibility.md      contrat SVG, contraste, focus
│   │   ├── export.md             HTML/SVG/PNG, static, thème
│   │   └── choose.md             arbre de décision + exemples
│   └── assets/
│       ├── template.html         base auto light/dark, variables, SVG vide
│       ├── themes.css            thèmes et palettes
│       └── motion.css            animation CSS décorative
├── examples/
│   ├── src/                      16 sources avec un placeholder de palette
│   ├── <slug>-<palette>.html     32 fichiers autonomes (2 palettes par source)
│   └── manifest.json             slugs, titres, mode d'animation, palettes
├── assets/
│   ├── readme/
│   │   ├── before-after.png      Mermaid brut vs diagramme tracé
│   │   ├── palettes.png          9 palettes en light et dark
│   │   ├── hero-light.png
│   │   ├── hero-dark.png
│   │   ├── example-mobile.png
│   │   └── examples/             64 captures, 2 palettes × light/dark
│   └── demo.gif                  draw, reveal et flow
├── evals/evals.json              12 cas comportementaux
└── scripts/
    ├── check-skill.mjs
    ├── check-geometry.mjs
    ├── check-contrast.mjs
    ├── check-motion.mjs
    ├── build-examples.mjs
    ├── browser.mjs               chargeur Playwright dev-only
    ├── screenshot.mjs
    └── demo-gif.mjs              frames Playwright + ffmpeg
```

Le modèle `logoforge-skill` est suivi : `skills/<nom>/SKILL.md` + `references/` +
`examples/` + `scripts/check-skill.mjs` + `evals/evals.json` + README avec captures +
LICENSE MIT + `npm run lint`.

---

## 9. Design system

### 9.1 Tokens sémantiques

Les types et les exemples n'utilisent **jamais** un hex direct : uniquement des rôles.

| Rôle | Usage |
|---|---|
| `--paper` | fond de page et de masque |
| `--surface` | fond secondaire (zone, carte) |
| `--ink` | texte principal, trait principal |
| `--muted` | texte secondaire, flèches par défaut |
| `--soft` | sous-labels, labels de frontière |
| `--line` | filets fins |
| `--line-strong` | bordures fortes, axes |
| `--accent` | 1–2 éléments focaux |
| `--accent-soft` | fond des boîtes focales |
| `--link` | appels HTTP/API, flèches externes |
| `--ok` / `--warn` / `--danger` | états, toujours doublés d'un texte/symbole |
| `--series-1..5` | séries multiples (radar, lignes) |
| `--radius-sm/md/lg` | 4 / 6 / 8 px |
| `--stroke-1/2` | 1 / 1,25 px |
| `--grid` | 4 px |
| `--font-title/name/tech` | piles de polices |

Les attributs SVG utilisent des classes CSS (`class="node-name"`) plutôt que des attributs
de présentation, pour que les variables runtime s'appliquent partout, y compris dans les
exports.

### 9.2 Les 8 palettes + marque

Chaque palette définit un jeu clair et un jeu sombre. Le tableau donne les trois couleurs
structurantes ; les rôles dérivés (`surface`, `muted`, `soft`, `line`, `accent-soft`,
`link`) sont calculés et vérifiés par `check-contrast.mjs`.

| Palette | Mode | `paper` | `ink` | `accent` | Intention |
|---|---|---|---|---|---|
| `paper` (défaut) | clair | `#F7F5EF` | `#20242B` | `#B4451F` | éditorial chaud, encre profonde |
| | sombre | `#14171C` | `#F2EFE7` | `#F08A5D` | papier nuit, accent lisible |
| `midnight` | clair | `#F2F4F7` | `#111827` | `#4F46E5` | tech, contraste doux |
| | sombre | `#0B1020` | `#E8ECF4` | `#8B9CFF` | écran, focus violet |
| `ocean` | clair | `#F2F7FA` | `#102A43` | `#0B6E99` | données, confiance |
| | sombre | `#081A26` | `#E6F0F5` | `#4FB3D9` | profondeur, cyan maîtrisé |
| `forest` | clair | `#F4F7F1` | `#1D2A22` | `#2F6B4F` | produit, croissance |
| | sombre | `#0F1A14` | `#E9F0EA` | `#6FBF94` | nature, calme |
| `sand` | clair | `#FAF6EE` | `#2B241B` | `#A35A2A` | document, archive |
| | sombre | `#1C1712` | `#F4EBDD` | `#D89A63` | chaleur, faible bruit |
| `slate` | clair | `#F3F4F6` | `#1F2937` | `#3B5BDB` | neutre, produit |
| | sombre | `#111827` | `#E5E7EB` | `#7C9CFF` | dashboard |
| `mono` | clair | `#FAFAF8` | `#111111` | `#111111` | impression, photocopie |
| | sombre | `#0D0D0D` | `#F5F5F5` | `#F5F5F5` | contraste, focal par graisse |
| `contrast` | clair | `#FFFFFF` | `#000000` | `#0033A0` | AAA, projection, malvoyance |
| | sombre | `#000000` | `#FFFFFF` | `#66B2FF` | AAA en sombre |
| `brand` | libre | `--brand-paper` | `--brand-ink` | `--brand-accent` | marque de l'utilisateur |

Notes :

- `mono` est volontairement monochrome : le focal est porté par `--accent-soft`, la graisse
  et la forme, pas par une couleur.
- `brand` n'est pas une palette de plus : c'est un mode de dérivation. Il vérifie les
  contrastes et corrige l'accent si nécessaire.
- `series-1..5` sont désaturées et réservées aux graphiques multi-séries ; jamais aux
  architectures.

### 9.3 Logique de thème

```css
:root {
  color-scheme: light;
  --paper: #F7F5EF; /* ... */
  --ink: #20242B;
  --accent: #B4451F;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
    --paper: #14171C;
    --ink: #F2EFE7;
    --accent: #F08A5D;
  }
}

:root[data-theme="dark"] { /* mêmes tokens sombres, explicites */ }
:root[data-theme="light"] { /* force le clair */ }

:root[data-palette="ocean"] { /* tokens océan clair */ }
@media (prefers-color-scheme: dark) {
  :root[data-palette="ocean"]:not([data-theme="light"]) { /* océan sombre */ }
}
:root[data-palette="ocean"][data-theme="dark"] { /* océan sombre explicite */ }
```

Ordre de priorité : `data-theme` explicite > OS > palette claire par défaut. Une seule
ligne change le rendu, sans toucher au SVG.

### 9.4 Typographie

| Rôle | Pile système | Taille | Graisse |
|---|---|---|---|
| Titre | `ui-serif, Georgia, "Times New Roman", serif` | 26–32 px | 400 |
| Nom de nœud | `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` | 12–13 px | 600 |
| Sous-label technique | `ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace` | 9–10 px | 400 |
| Eyebrow / tag | idem mono | 7–8 px, tracking 0.14em, uppercase | 500 |
| Label de flèche | idem mono | 8 px, tracking 0.06em | 400 |
| Annotation | titre serif italique | 13–14 px | 400 |

Règles :

- La mono est réservée au **technique** : ports, protocoles, URLs, types de champs.
- Les noms lisibles vont en sans.
- Le titre de page va en serif.
- Pas de JetBrains Mono, pas de mono décorative.
- CJK : ajouter une pile de secours par langue, ne pas changer la palette.
- Plancher de 12 px pour le Hangul/Han ; on coupe le texte plutôt que de rétrécir.

### 9.5 Géométrie et traitements

- Grille de 4 px pour origines, tailles, gaps, paddings.
- Rayon 6 px pour les nœuds, 2 px pour les tags, 8 px pour les zones.
- Trait 1 px par défaut, 1,25 px pour l'emphase, 0,8 px pour les filets.
- Pas d'ombre portée. Jamais.
- Traitements de nœuds : `focal` (accent-soft + accent), `backend` (surface + ink),
  `store` (ink 5 % + muted), `external` (ink 3 % + ink 30 %), `input` (muted 10 % + soft),
  `optional` (pointillés), `security` (accent 5 % + accent 50 %, pointillés).
- La légende est une bande horizontale en bas, jamais flottante dans la zone.

---

## 10. Animation CSS/SVG pure

### 10.1 Contrat

1. **La source est complète** : sans animation, tout est lisible.
2. **Une seule horloge** : durées et délais déterministes, pas de hasard.
3. **L'ordre suit le flux** : `--order: 0..7`, un ou deux éléments par cran.
4. **Pas de mouvement de layout** : on anime l'opacité, la translation (≤ 8 px), le dash
   offset, un halo. Jamais `viewBox`, taille de nœud, position d'un connecteur.
5. **L'animation ne porte jamais le sens** : un état ne se lit pas uniquement par le
   mouvement ou la couleur.
6. **Reduced motion** : état final complet, animations et éléments décoratifs masqués.
7. **Print/export** : état final, contrôles absents.
8. **Budget** : ≤ 8 étapes, ≤ 12 éléments, ≤ 2 simultanés, ≤ 8 s au total.

### 10.2 Modes

| Mode | Mécanisme | État réduit |
|---|---|---|
| `none` | aucune animation | trame complète |
| `reveal` | `@keyframes` opacity + translateY, `animation-delay: calc(var(--order) * var(--stagger))` | tout visible |
| `draw` | `pathLength="1"`, `stroke-dasharray:1`, `stroke-dashoffset:1 → 0` | offset 0, traits complets |
| `flow` | `stroke-dasharray: 6 10`, `stroke-dashoffset` en boucle ≥ 3 s | tirets fixes ; décorations masquées |
| `focus` | halo `opacity/scale` 2,4 s sur 1 nœud | halo masqué |
| `combo` | `draw` + `reveal` | état final |

Les arêtes `edge--dashed` gardent leur pointillé sémantique sous reduced motion et en
export statique : la règle de remise à zéro cible `.edge:not(.edge--dashed)`.

### 10.3 Markup type

```html
<svg data-animate="draw" role="img" aria-labelledby="d-title d-desc">
  <title id="d-title">Checkout request</title>
  <desc id="d-desc">Order of calls from client to payment provider.</desc>
  <path class="edge" pathLength="1" style="--order:0" d="..."/>
  <path class="edge" pathLength="1" style="--order:1" d="..."/>
  <g class="node" style="--order:2">...</g>
</svg>
```

```css
[data-animate="draw"] .edge {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: draw var(--dur) var(--ease) both;
  animation-delay: calc(var(--order) * var(--stagger));
}
@keyframes df-draw { to { stroke-dashoffset: 0; } }

@media (prefers-reduced-motion: reduce) {
  [data-animate] *, [data-animate] *::before, [data-animate] *::after {
    animation: none !important;
    transition: none !important;
  }
  .edge { stroke-dashoffset: 0 !important; }
  .edge:not(.edge--dashed) { stroke-dasharray: none !important; }
  .node { opacity: 1 !important; transform: none !important; }
  .focus-halo, .flow-token { display: none !important; }
}
```

### 10.4 Export statique

Aucun JS n'est nécessaire :

- `@media print` fige l'état final.
- `[data-static="true"]` fige l'état final (attribut posé par l'outil d'export).
- Playwright peut émuler `prefers-reduced-motion: reduce` avant la capture.
- Le SVG extrait omet styles d'animation et éléments décoratifs.

### 10.5 Anti-patrons

- Autoplay infini d'un élément sémantique.
- Animation qui « sauve » un schéma trop dense.
- Décalage au hasard, rebond, zoom, parallaxe, particules, clignotement.
- Couleur seule pour un état (PASS/FAIL doit avoir un texte/symbole).
- Capture après un délai arbitraire : on force l'état statique.

---

## 11. Accessibilité et export

### 11.1 Contrat SVG

1. `<svg role="img" aria-labelledby="<slug>-title <slug>-desc">`.
2. `<title>` en premier enfant, avant `<defs>`.
3. IDs préfixés par le slug du fichier (`checkout-title`, `checkout-desc`).
4. `<title>` = nom court du sujet, ≤ 60 caractères.
5. `<desc>` = une phrase sur le contenu, pas sur la géométrie.
6. SVG décoratif : `aria-hidden="true" focusable="false"`.
7. Le texte sémantique n'existe qu'une fois dans l'arbre d'accessibilité.
8. Contraste : 4,5:1 texte, 3:1 grands textes et marques essentielles.
9. Aucun état uniquement par la couleur.
10. `min-width` = largeur du `viewBox`, dans un wrapper `overflow-x: auto` local.

### 11.2 Tailles

| Preset | viewBox | Usage |
|---|---|---|
| `doc-inline` | 960 × 600 | article, README |
| `doc-wide` | 1280 × 720 | documentation, wiki |
| `slide-16x9` | 1280 × 720 | présentation |
| `social-og` | 1200 × 630 | carte de lien |
| `social-square` | 1080 × 1080 | feed |
| `print-a4` | 1120 × 792 | PDF, handout |
| `fit` | dérivé du contenu | handoff vectoriel |

La rampe typographique change avec le preset (les noms ne rétrécissent pas sur une slide).

### 11.3 Export

- **HTML** : source de vérité, autonome.
- **SVG** : extrait du seul nœud `<svg>`, sans wrapper éditorial ni script.
- **PNG** : Playwright/Chromium, `deviceScaleFactor` 1/2/3, thème forcé, état statique.
- **Thème** : `--theme light|dark|auto`, `--palette <nom>`.
- **Jamais** d'export non demandé ; les previews restent dans un dossier temporaire.

---

## 12. Qualité : scripts et evals

### 12.1 `scripts/check-skill.mjs`

Vérifie :

- présence des fichiers requis (README, LICENSE, CONTRIBUTING, SKILL.md, 40 refs, evals,
  templates, captures) ;
- frontmatter : `name: diagramforge`, `description` riche et déclencheuse, `license: MIT` ;
- tous les liens relatifs du Markdown ;
- JSON valides (`evals.json`, `package.json`) ;
- chaque référence de type contient les sections `Quand`, `Layout`, `Budget`,
  `Anti-patrons`, `Exemple` ;
- le template contient les tokens, au moins 8 palettes, `prefers-color-scheme`,
  `prefers-reduced-motion`, `@media print`, `[data-static]` ;
- contrat a11y : `role="img"`, `aria-labelledby`, `<title>` premier, IDs préfixés ;
- aucune dépendance réseau : pas de `<script src>`, pas de `<link href="http…">`, pas de
  `@import url(http…)`, pas de Google Fonts ;
- anti-patrons interdits : `box-shadow`, `border-radius` > 10, `JetBrains Mono`,
  `writing-mode: vertical`, `filter: drop-shadow`, `backdrop-filter` ;
- budgets d'animation : étapes ≤ 8, éléments ≤ 12, simultanés ≤ 2, total ≤ 8 s ;
- captures README présentes et de taille crédible (> 10 Ko) ; GIF valide (`GIF8`).

### 12.2 Autres vérificateurs

- `check-geometry.mjs` : diagonales, segments le long des bords, ports partagés,
  étiquettes qui chevauchent un nœud postérieur, masques manquants, croisements non pontés.
- `check-contrast.mjs` : toutes les paires des 9 palettes × 2 modes ; échoue si un texte
  descend sous 4,5:1.
- `check-motion.mjs` : état final, reduced-motion, absence de contrôleur JS, ordre
  contigu, budgets.
- `screenshot.mjs` : Playwright/Chromium ; light/dark, 1440/390, `deviceScaleFactor` 2 ;
  attend `document.fonts.ready` ; force l'état statique ; écrit dans `assets/readme/`.

### 12.3 Evals (12 cas)

| ID | Prompt | `must` | `must_not` |
|---|---|---|---|
| palette-one-line | « Passe ce diagramme en palette océan, mode sombre. » | changer `data-palette` et `data-theme` ; garder le SVG | régénérer le SVG, ajouter un script |
| auto-dark | « Il doit suivre le thème de l'OS. » | `data-theme="auto"` + `prefers-color-scheme` | deux fichiers, JS |
| brand | « Utilise #0B5FFF comme accent. » | vérifier le contraste, dériver `accent-soft` | accent brut illisible, thème figé |
| reduced-motion | « L'animation doit respecter les préférences d'accessibilité. » | état final complet, décorations masquées | laisser un état partiel |
| static-export | « Exporte une PNG statique. » | forcer l'état final, thème explicite | capturer au hasard |
| budget | « Dessine 25 microservices. » | splitter ou zoner, reçu de fidélité | 25 boîtes identiques |
| no-shadow | « Rends ça premium. » | hiérarchie par taille/graisse/filets | ombres, glow, coins 20 px |
| a11y | « Ajoute un titre accessible. » | `role`, `aria-labelledby`, `<title>` + `<desc>` | SVG muet |
| connectors | « Relie ces quatre services. » | orthogonaux, ports répartis, labels masqués | diagonales, labels sur le trait |
| zero-network | « Ça doit marcher hors ligne. » | piles système, aucune requête | Google Fonts, CDN |
| animation-order | « Montre le flux dans l'ordre. » | `--order` selon le flux, ≤ 8 étapes | ordre aléatoire, boucle sémantique |
| french-labels | « Diagramme en français, labels longs. » | mesurer la largeur, couper au besoin | rétrécir sous 12 px, déborder |

Chaque cas est un prompt réel + des assertions lisibles par un humain, comme dans
`logoforge-skill`. Les scripts peuvent plus tard les transformer en tests automatiques.

### 12.4 Boucle de rendu

1. Générer le HTML.
2. Lancer `npm run lint` (structure + géométrie + contraste + motion).
3. Capturer en light et dark, desktop et mobile.
4. Regarder les PNG : texte coupé, chevauchement, flèche qui rate sa cible, espacements
   inégaux, contenu hors cadre, texte illisible à 100 %.
5. Nommer au moins un défaut, ou expliquer pourquoi il ne s'applique pas.
6. Corriger en restructurant d'abord (direction, groupes, labels), pas en déplaçant des
   coordonnées au hasard.
7. Re-rendre, deux passes maximum.

En cas de doute géométrique, le vérificateur prime sur l'œil.

---

## 13. Risques, limites et non-objectifs

| Risque | Mitigation |
|---|---|
| 40 types = maintenance | contrats courts, primitives partagées, P0/P1/P2, variantes plutôt que nouveaux types |
| Variables CSS dans SVG | classes CSS, pas d'attributs de présentation codés en dur ; test de rendu |
| Contraste des palettes | script de contraste en CI, accent corrigé automatiquement |
| Animations coûteuses | budgets, pas de filtre/ombre, `transform`/`opacity` uniquement |
| Accessibilité oubliée | checklist + eval dédiée + script |
| Polices système différentes | largeurs mesurées, padding généreux, pas de boîte au pixel près |
| Pas d'import Mermaid | assumé en v1 ; documenter le redessin |
| Pas de contrôle pas-à-pas | assumé ; l'autoplay unique et le statique suffisent |
| Dépendance Playwright | dev uniquement ; la sortie n'en dépend pas |

Non-objectifs : éditeur WYSIWYG, layout automatique générique, serveur, compte, télémétrie,
collection de polices, pack d'icônes externe.

---

## 14. Plan de réalisation

### Phase 0 — Cadre (cette étude)

- ETUDE.md, `.gitignore`, décision de nom, licences.
- `git init` sur `main` si le dossier n'est pas déjà un dépôt (bloqué par le sandbox ici ;
  à exécuter sur un poste normal).

### Phase 1 — Socle + 12 types P0

- `SKILL.md`, `design-system.md`, `palettes.md`, `layout.md`, `connectors.md`,
  `animation.md`, `accessibility.md`, `export.md`, `choose.md`.
- `assets/template.html` + `template-motion.html`.
- 12 références P0 : architecture, flowchart, sequence, state-machine, erd,
  dependency-graph, tree, quadrant, timeline, before-after-delta, data-flow, layer-stack.
- `check-skill.mjs`, `check-contrast.mjs`, `check-geometry.mjs`, `check-motion.mjs`.
- 6 exemples, 12 evals.
- 4 captures : before/after, light, dark, mobile.

### Phase 2 — 28 types P1 + animations

- Références P1, variantes de graphiques.
- 2 exemples animés (`draw`, `reveal`), 1 exemple `flow`, 1 exemple `focus`.
- Galerie de palettes (`assets/readme/palettes.png`).
- `screenshot.mjs` + `npm run lint` en CI.

### Phase 3 — Finition et publication

- README final avec GIF de démo et comparatif before/after.
- Vérification de disponibilité du nom, `gh repo create`, push (hors de cette session).
- Release `v0.1.0`, `npx skills add …` testé sur Claude Code, Codex, OpenCode.

---

## 15. Sources

- Référence principale : <https://github.com/cathrynlavery/diagram-design>
  (commit `0eeda75`, licence MIT, ~71 756 étoiles au 24/11/2026).
- Archify : <https://github.com/tt-a1i/archify> (Apache-2.0, ~99 447 étoiles).
- Cocoon architecture skill : <https://github.com/Cocoon-AI/architecture-diagram-generator>
  (MIT, ~7 648 étoiles).
- Excalidraw skill : <https://github.com/coleam00/excalidraw-diagram-skill>
  (sans licence, ~5 340 étoiles).
- Modèle de qualité et de structure : <https://github.com/terravidhal/logoforge-skill>
  (MIT).
- Recherche de dépôts : API GitHub `GET /search/repositories?q=diagram+skill+claude`.
- Disponibilité : API GitHub `GET /repos/terravidhal/diagramforge(-skill)` et registre
  npm `GET /diagramforge(-skill)` → 404 au 24/11/2026.

---

## Annexe A — Prompts de démonstration pour le README

1. « Dessine l'architecture d'un checkout : navigateur → API → Redis → Postgres, avec la
   zone de paiement et le webhook fournisseur. Palette océan, sombre, 8 nœuds max. »
2. « Explique la séquence d'un cache miss, en animation de dessin, avec un focus sur
   l'appel Postgres. »
3. « Montre ce qui change entre le déploiement v1 (monolithe) et v2 (services), en ledger
   avant/après. »
4. « Fais un ERD de commandes, produits et paiements. Palette de marque #0B5FFF, clair,
   labels français. »
5. « Une timeline d'incident en 6 événements, avec une seule alerte focale, export PNG. »

## Annexe B — Checklist de sortie (à recopier dans `SKILL.md`)

- [ ] Le type est choisi par la question, pas par le nom.
- [ ] Un tableau ou une phrase ne ferait pas mieux.
- [ ] La référence du type a été chargée.
- [ ] Budget respecté (nœuds, arêtes, accents, annotations, zones).
- [ ] Test de suppression : un nœud, une arête, un label peuvent-ils partir ?
- [ ] Connecteurs orthogonaux, ports distincts, labels masqués, pas de transit caché.
- [ ] Grille de 4 px, rayons ≤ 8 px, aucune ombre.
- [ ] Tokens uniquement ; aucune couleur codée en dur dans le SVG.
- [ ] `data-theme` / `data-palette` testés en clair, sombre et auto.
- [ ] Animation optionnelle, ordonnée, budgétée, et état final complet.
- [ ] `prefers-reduced-motion` et impression figent l'état final.
- [ ] Contrat a11y complet (`role`, `aria-labelledby`, `<title>`, `<desc>`, IDs).
- [ ] Contraste 4,5:1 / 3:1 vérifié.
- [ ] Aucune requête réseau, aucune police externe.
- [ ] `npm run lint` passe ; captures light/dark/mobile regardées.
- [ ] Reçu de fidélité si la source a été simplifiée.
