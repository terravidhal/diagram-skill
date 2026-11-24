# Layout, grid, and budgets

Layout is where a diagram succeeds or fails. A correct connector on a bad grid still
reads as noise. Put every origin, size, gap, and padding on the 4px grid, then spend the
remaining decisions on grouping and direction.

## Size presets

Choose a preset before drawing; it sets the `viewBox` and the type ramp. Changing it
later is a redraw.

| Preset | `viewBox` | Aspect | Use |
|---|---|---|---|
| `doc-inline` (default) | `0 0 960 600` | 8:5 | article, README, docs |
| `doc-wide` | `0 0 1280 720` | 16:9 | full-width documentation, wiki |
| `slide-16x9` | `0 0 1280 720` | 16:9 | presentation |
| `slide-4x3` | `0 0 1024 768` | 4:3 | legacy deck |
| `social-og` | `0 0 1200 632` | ~1.9:1 | link preview |
| `social-square` | `0 0 1080 1080` | 1:1 | feed post |
| `print-a4` | `0 0 1120 792` | ~1.41:1 | A4 landscape, handout |
| `fit` | content box + chrome | any | vector handoff |

`fit` is the content bounding box rounded up to 4px, plus 40px on every side and 60px
at the bottom for the legend. Content never touches the edge.

### Type ramp per preset

| Role | doc | slide | print |
|---|---|---|---|
| Node name | 12–13 | 16 | 12 |
| Technical sublabel | 9–10 | 12 | 9 |
| Edge label | 8 | 12 | 8 |
| Eyebrow / tag | 8 | 8 | 8 |
| Node box minimum height | 48 | 64 | 48 |
| Minimum gap between peers | 24 | 40 | 24 |

Do not shrink type to make a layout fit. A projected slide with 12px names is a failed
slide; drop a detail level or split the figure.

## Grid and spacing

- Origins, widths, heights, gaps, and padding divide by 4.
- Text sizes are not forced onto the grid; use the ramp.
- Sibling gap: 24px minimum, 32px comfortable, 40px for a new group.
- Zone padding: 24px on the sides, 32px on top (the zone eyebrow lives in the top
  margin), 24px at the bottom.
- Outer safe area: 40px, except `social-og`, where the outer 64px stay clear.
- Zone label to first node: 16px minimum.
- Edge label mask to its stroke: 6–10px visible gap.
- Legend strip: the bottom 60px, with a hairline separator.

## Complexity budget

| Limit | Value |
|---|---|
| Nodes | 9 (12 for list-like: kanban, gantt, roadmap, tree, org chart) |
| Edges / transitions | 12 |
| Accent elements | 2 |
| Annotation callouts | 2 |
| Flat zones | 3 |
| Hierarchy depth | 4 |
| Series in a chart | 5 |
| Animated steps | 8 |
| Animated items | 12 |
| Simultaneous reveals | 2 |
| Total animation | 8s maximum |

Above the budget, produce an overview and a detail rather than shrinking. Name what was
merged or dropped.

### Detail dial

| Level | Nodes | Edges | What survives |
|---|---|---|---|
| `faithful` | ≤ 24, zoned | ≤ 32 | every distinct component; only exact duplicates merge |
| `balanced` (default) | ≤ 12 | ≤ 16 | the story; leaf clusters collapse |
| `simplified` | ≤ 7 | ≤ 9 | capabilities and sequence; infrastructure disappears |

`faithful` is the only exemption from the nine-node rule, and it requires zones. Above
24 nodes, split regardless of level. The connector rules never relax.

Degrade in this order: decorative cells, exact duplicates, leaf clusters, degree-1
sinks, cross-cutting infrastructure, then split.

## Page shell

The page is part of the deliverable. Keep it quiet:

```html
<div class="frame">
  <p class="eyebrow">ARCHITECTURE · CHECKOUT</p>
  <h1>Checkout request path</h1>
  <p class="lede">One sentence on what the reader should notice.</p>
  <div class="diagram-container">
    <svg class="diagram" viewBox="0 0 960 600" …>…</svg>
  </div>
</div>
```

The wrapper scrolls locally on a narrow screen:

```css
.diagram-container { width: 100%; overflow-x: auto; }
svg.diagram { width: 100%; min-width: 960px; display: block; }
```

`min-width` equals the viewBox width. If an ancestor has `overflow: hidden`, put the
wrapper inside that ancestor, or the diagram is clipped with no scrollbar. In print,
release both:

```css
@media print {
  .diagram-container { overflow-x: visible; }
  svg.diagram { min-width: 0; }
}
```

The print rule must come after the base `svg` rule; a media query adds no specificity.

## Density

Target 4/10: technically complete, no reading guide required. If a reader needs a legend
to understand the layout, the layout is not doing its job. Legends explain treatments,
not structure.

## Composition patterns

| Pattern | Use | Avoid |
|---|---|---|
| Left → right pipeline | data, request, integration | mixing directions per tier |
| Top → bottom stack | hierarchy, decision, deployment | a wide row of equal boxes |
| Centre + satellites | core + consumers, hub + spokes | satellites that also connect to each other |
| Two panels | before/after, compare | different scales or grids |
| Grid of cards | capability map, kanban | identical card widths with no hierarchy |
| Axis + points | quadrant, timeline | a legend that repeats the axis |

## Split rule

When the figure exceeds the budget, split on a **semantic boundary**: overview + a
detail per zone, or happy path + failure path, or before + after. Do not split on an
arbitrary count. Each split gets its own title, slug, and `<desc>`.
