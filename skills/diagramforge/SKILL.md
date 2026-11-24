---
name: diagramforge
description: >-
  Create polished, self-contained HTML + SVG diagrams: architecture, flowcharts,
  sequence diagrams, state machines, ERD and database schemas, dependency graphs,
  trees, timelines, quadrants, data flows, layer stacks, swimlanes, Gantt, kanban,
  user journeys, roadmaps, and quantitative charts. Use when the user asks to draw,
  map, visualise, explain, redesign, theme, animate, or export a diagram — including
  "show the architecture", "diagram this flow", "explain the sequence", "draw the
  schema", "make a timeline", "chart this", "before/after", or "turn this into a
  diagram". Output is one offline HTML file with inline SVG, switchable CSS palettes,
  automatic light/dark, optional pure CSS/SVG animation, accessible markup, and static
  SVG/PNG export. No network, no build step, no runtime dependency.
license: MIT
---

# Diagramforge

Make a diagram that a reader understands in one pass. The highest-quality move is
usually **deletion**: fewer nodes, fewer lines, fewer colours, fewer words.

The source of truth is the HTML file. SVG, PNG, themes, and motion are all produced
from it. No diagram is finished until it has been rendered and looked at.

## Non-negotiable rules

1. **Question before type.** Decide what the reader must understand (order, dependency,
   quantity, change, cause, containment) before choosing a layout. A seductive type
   name is not a reason.
2. **A table or a sentence may win.** If three columns communicate it, write the table.
   If one shape carries no relationship, write the sentence.
3. **One file, no network.** Inline CSS and inline SVG; system font stacks; no script,
   font link, CDN, remote image, or external stylesheet.
4. **Semantic tokens only.** The SVG body uses classes such as `node-name`, `edge`,
   `label-mask`. No hex colour, no hard-coded font family, no presentation colour.
5. **One accent, twice at most.** Accent marks the focal node or the headline path.
   If four things are accented, nothing is focal.
6. **Orthogonal connectors.** Lines leave and enter perpendicular to a box edge, with
   distinct ports and rounded elbows. Diagonals are forbidden.
7. **Labels sit beside their line, on an opaque mask.** Never on the stroke, never
   vertical, never over a node painted later.
8. **Theme is runtime.** `<html data-theme="auto" data-palette="ocean">` changes the
   whole diagram. The drawing is never regenerated for a palette or a mode.
9. **Motion is optional and decorative.** The complete meaning exists with animation
   off. `prefers-reduced-motion`, print, and static export show the final frame.
10. **Accessibility ships first.** `role="img"`, prefixed `<title>` and `<desc>`, text
    contrast, and no colour-only state. This is part of the drawing, not a patch.

## When to use this skill

Use it when a reader learns more from a visual than from prose: a system, a flow, an
ordered exchange, a schema, a hierarchy, a delta, a distribution, a position, or a
cycle. Do **not** use it for a list, a single sentence, a decorative hero image, or an
attribute-only comparison where a table is clearer.

## Workflow

### 0. Read the context

Identify the audience, the question, the destination (README, docs, slide, social
card, print), the language of the labels, and any existing brand colours or theme.
If the project already has a palette, use it. Never silently ship the default skin
into a branded context: ask once, or use the supplied brand colour.

### 1. Choose the question, then the type

Use the routing tree below, then read the matching section of
[`references/diagram-types.md`](references/diagram-types.md). If two types fit, choose
the dominant axis and drop the second layout. If behaviour or risk carries the
meaning, read [`references/choose.md`](references/choose.md) first.

### 2. State the plan in one line

Before drawing, say: type, size preset, approximate node count, the cuts you expect,
and whether motion was requested. If the request already pins all of that, proceed and
put the plan in the final report.

### 3. Copy the base

Start from [`assets/template.html`](assets/template.html). It already contains the
theme machinery, the SVG primitives, the accessibility scaffolding, and the motion
stylesheet hook. Replace the eyebrow, title, slug, `<title>`, `<desc>`, and SVG body.
Read [`references/layout.md`](references/layout.md) for the grid and size presets.

### 4. Draw with the primitives

Draw zones first, then edges, then nodes: z-order must put lines behind boxes. Each
node is an opaque paper mask, a styled box, a tag, a name, and an optional technical
sublabel. Connector geometry and label masks are specified in
[`references/connectors.md`](references/connectors.md).

### 5. Apply the theme

Pick a palette from [`references/palettes.md`](references/palettes.md). For a brand,
set three inline variables:

```html
<html lang="en" data-theme="auto" data-palette="brand"
      style="--brand-paper:#FFFFFF;--brand-ink:#141413;--brand-accent:#0B5FFF">
```

`data-theme` accepts `auto`, `light`, or `dark`. `auto` follows the operating system
through `prefers-color-scheme`. Changing either attribute is the whole operation; no
SVG edit, no rebuild, no second file.

### 6. Add motion only when asked

If the user asks for animation, or motion materially clarifies order, read
[`references/animation.md`](references/animation.md). Add `data-animate` to the SVG and
`--order` on the elements that enter. Stay inside the animation budget. If motion was
not requested, ship `data-animate="none"` and no animation CSS behaviour.

### 7. Verify, then look

Run the repository checks if you are in this repo (`npm run lint`). Open the file in a
browser, or capture it with `npm run lint:shots`. Look for clipped text, overlaps, a
label away from its line, a line through a box, uneven gaps, an empty band, or text
too small at 100%. Name at least one defect, or say why none applies. Fix by changing
the structure first, then coordinates. Two passes maximum.

### 8. Export only on request

HTML is the deliverable. SVG and PNG are produced from it. Read
[`references/export.md`](references/export.md) before rasterising. Never emit an export
file that was not asked for; keep previews in a scratch folder.

## Routing tree

```
1. "How much / how does it change over time?"        → quantitative chart
2. "In what order / when?"                            → flow or time
3. "What depends on what / what contains what?"       → structure
4. "Where does it run / what talks to what?"          → systems
5. "Why / what causes this?"                          → analysis
6. "What changed between before and after?"           → delta
7. A table of three columns would do it               → do not draw
8. Two types fit                                      → pick the dominant axis
```

| Question | First choice | Not this |
|---|---|---|
| Components, services, stores, trust boundaries | `architecture` | a flowchart of method calls |
| Decision logic, guards, retries | `flowchart` | an architecture with arrows |
| Ordered messages between actors | `sequence` | a list of endpoints |
| States, transitions, terminal outcomes | `state-machine` | a flowchart with circles |
| Entities, fields, cardinality | `erd` | a database screenshot |
| Who depends on whom, fan-in, cycles | `dependency-graph` | a tree that hides cycles |
| Parent → children, one owner | `tree` | a mind-map cloud |
| Two-axis position or priority | `quadrant` | a bar chart of scores |
| Dated events, incident history | `timeline` | a table of dates |
| Structural change between two states | `before-after-delta` | two unrelated diagrams |
| Sources → transforms → consumers | `data-flow` | an architecture without data |
| Abstraction levels, responsibilities | `layer-stack` | nested boxes with no labels |
| Handoffs across actors | `swimlane` | a sequence without time |
| Customer actions vs hidden work | `service-blueprint` | a journey with no visibility line |
| WIP, columns, blockers | `kanban` | a table of tickets |
| Stages experienced, emotion, friction | `user-journey` | a feature list |
| Tasks, phases, milestones | `gantt` or `roadmap` | a timeline of releases only |
| Zones, hosts, artifacts, replicas | `deployment` | a logical architecture |
| Subnets, gateways, allowed paths | `network-topology` | a cloud logo collage |
| Ingestion, quality tiers, lineage | `data-pipeline` | a generic ETL box |
| Trust zones, ingress/egress, controls | `security-boundaries` | a lock icon |
| Sources → core → consumers, APIs | `integration-map` | an org chart |
| Physical tables, SQL types, indexes | `db-schema` | an ERD with no types |
| Classes, interfaces, inheritance | `uml-class` | a file tree |
| Ownership, reporting, escalation | `org-chart` | a tree of teams only |
| Nested scopes, quotas, containment | `nested` | a flat set of zones |
| Set overlap | `venn` | three unrelated lists |
| Capabilities, maturity, ownership | `capability-map` | a feature backlog |
| Branches, merges, hotfixes | `git-graph` | a commit list |
| Reinforcing cycle | `loop-flywheel` | a circular arrow decoration |
| Ranked hierarchy or conversion | `pyramid-funnel` | a pie chart |
| Category comparison | `bar` | a table with no visual |
| Continuous trend, two states, rank movement | `line` | a bar per timestamp |
| Several entities across 3–5 criteria | `radar` | a table of scores |
| Cross-tabulated intensity | `heatmap` | a bar per cell |
| Part-of-whole with relative sizes | `treemap` | a pie with 12 slices |
| Start total → signed contributions → end total | `waterfall` | a line that implies continuity |
| Causes of one effect | `fishbone` | a list of opinions |
| Requirements ↔ design ↔ tests, with gaps | `requirement-traceability` | a spreadsheet screenshot |

The full 40-type catalogue with layout, budget, anti-patterns, and an example is in
[`references/index.md`](references/index.md) and
[`references/diagram-types.md`](references/diagram-types.md).

## Design system in one page

- **Roles:** `paper`, `surface`, `ink`, `muted`, `soft`, `line`, `line-strong`,
  `accent`, `accent-soft`, `link`, `ok`, `warn`, `danger`, `series-1..5`.
- **Type:** title in a system serif; node names in a system sans at 600; technical
  sublabels, tags, and edge labels in a system mono. Mono is for ports, protocols,
  URLs, and field types, never as a blanket "developer" font.
- **Grid:** 4px for origins, sizes, gaps, and padding. Radius 6px for nodes, 2px for
  tags, 8px for zones. Stroke 1px; 1.25px for emphasis; 0.8px for hairlines.
- **No shadow.** No glow, no blur, no gradient as a substitute for hierarchy. Borders,
  weight, size, and space carry hierarchy.
- **Node treatments:** `focal`, `backend`, `store`, `external`, `input`, `optional`,
  `security`. Define them once in CSS; apply by class.
- **Legend:** a horizontal strip at the bottom, never floating inside the drawing.

Read [`references/design-system.md`](references/design-system.md) for the token table
and [`references/layout.md`](references/layout.md) for the grid, size presets, and
complexity budget.

## Complexity budget

| Limit | Value |
|---|---|
| Nodes | 9 (12 for list-like types: kanban, gantt, roadmap) |
| Edges / transitions | 12 |
| Accent elements | 2 |
| Annotation callouts | 2 |
| Zones | 3 |
| Hierarchy depth | 4 |
| Animated steps | 8 |
| Animated items | 12 |
| Simultaneous reveals | 2 |
| Total animation | 8s maximum; decorative loop ≥3s |

Above the budget: split into an overview and a detail, and report what was merged,
collapsed, or dropped. More nodes never buys more accents.

## Accessibility contract

- `<svg role="img" aria-labelledby="<slug>-title <slug>-desc">`.
- `<title>` is the first child of `<svg>`, before `<defs>`; IDs are prefixed with the
  diagram slug and unique in the document.
- `<title>` is the subject, 60 characters or fewer. `<desc>` is one sentence about the
  content, not the geometry.
- Decorative SVG is `aria-hidden="true" focusable="false"`.
- Text contrast ≥ 4.5:1; essential strokes and marks ≥ 3:1. Accent is checked as text
  when it is used as a label.
- No state is carried by colour alone: add a word, a symbol, or a shape.
- The wrapper scrolls locally on narrow screens; the SVG keeps its readable
  `min-width` (equal to the viewBox width) until print, where it scales down whole.

Read [`references/accessibility.md`](references/accessibility.md) for the long form.

## Animation in one page

Modes: `none` (default), `draw` (strokes draw in), `reveal` (items appear in flow
order), `flow` (dashes circulate on active edges), `focus` (one halo pulses), and
`combo` (`draw` + `reveal`). Drive order with integer `--order` values and rhythm with
`--stagger` / `--dur`. Animate only opacity, a small translation (≤8px), dash offset,
and one halo. Never animate layout, geometry, `viewBox`, or semantic text. Under
`prefers-reduced-motion: reduce`, `@media print`, and `[data-static="true"]`, the final
frame is complete and decorations are hidden. Read
[`references/animation.md`](references/animation.md).

## Before you finish

- [ ] The type was chosen by the question, not by its name.
- [ ] A table or a sentence would not do better.
- [ ] The matching type reference was read, and its budget respected.
- [ ] The deletion test was run: no node, edge, or label can leave without losing meaning.
- [ ] Connectors are orthogonal, ports are distinct, labels are masked with a 6–10px gap.
- [ ] Geometry sits on the 4px grid; radii ≤ 8px; no shadow, glow, or gradient.
- [ ] Only semantic tokens; no hex colour inside the SVG.
- [ ] `data-theme` and `data-palette` were checked in light, dark, and auto.
- [ ] Animation, if present, is ordered, budgeted, optional, and complete when off.
- [ ] `prefers-reduced-motion` and print freeze the final frame.
- [ ] The SVG has `role`, `aria-labelledby`, a first-child `<title>`, a `<desc>`, and
      prefixed IDs.
- [ ] Contrast is verified (4.5:1 text, 3:1 essential marks).
- [ ] No network request, no external font, no script.
- [ ] The file was rendered and looked at; at least one defect was named or ruled out.
- [ ] A fidelity ledger is ready if the source was simplified.

## Report

When done, state: the file path, the type and palette, whether motion is on, what you
verified (light/dark, reduced motion, contrast, geometry), what you cut, and any
assumption you had to make. Keep it short.

## Reference map

| Need | Read |
|---|---|
| The 40 types, choose-if, budgets | [`references/index.md`](references/index.md) |
| Per-type layout recipes and anti-patterns | [`references/diagram-types.md`](references/diagram-types.md) |
| Decision tree, semantic patterns, worked prompts | [`references/choose.md`](references/choose.md) |
| Tokens, type ramp, node treatments | [`references/design-system.md`](references/design-system.md) |
| 8 palettes, brand derivation, contrast, theme CSS | [`references/palettes.md`](references/palettes.md) |
| Grid, sizes, spacing, complexity budget | [`references/layout.md`](references/layout.md) |
| Orthogonal routing, ports, labels, zones, legends | [`references/connectors.md`](references/connectors.md) |
| Draw/reveal/flow/focus, budgets, reduced motion | [`references/animation.md`](references/animation.md) |
| SVG contract, contrast, text, keyboard | [`references/accessibility.md`](references/accessibility.md) |
| HTML/SVG/PNG export, theme forcing, static frame | [`references/export.md`](references/export.md) |
| Reusable HTML skeleton | [`assets/template.html`](assets/template.html) |
| Theme stylesheet | [`assets/themes.css`](assets/themes.css) |
| Motion stylesheet | [`assets/motion.css`](assets/motion.css) |
