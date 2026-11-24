# Design system

The drawing is skinnable. Colours, type families, strokes, radii, and spacing are
semantic roles resolved from CSS variables. A type reference says `accent`, `ink`, or
`edge`; it never says a hex value. That is what makes a palette change one line.

## Tokens

| Role | Purpose | Light default | Dark default |
|---|---|---|---|
| `--paper` | page background, node mask, label mask | `#F7F5EF` | `#14171C` |
| `--surface` | secondary fill, cards, table headers | paper + 6% ink | paper + 6% ink |
| `--mask` | zone fills and zone-matched label masks | paper + 1% ink | paper + 1% ink |
| `--ink` | primary text, primary stroke | `#20242B` | `#F2EFE7` |
| `--muted` | secondary text, default arrows | ink 72% + paper | ink 72% + paper |
| `--soft` | sublabels, boundary labels, axis ticks | ink 67% + paper | ink 67% + paper |
| `--line` | hairlines, zone borders | ink 14% + paper | ink 14% + paper |
| `--line-strong` | stronger borders, axes | ink 55% + paper | ink 55% + paper |
| `--accent` | 1–2 focal elements | `#B4451F` | `#F08A5D` |
| `--accent-soft` | focal box fill | accent 10% + paper | accent 10% + paper |
| `--accent-line` | focal dashed boundary | accent 55% + paper | accent 55% + paper |
| `--link` | HTTP/API and external arrows | `--accent` | `--accent` |
| `--ok` | success state | `#2F7A4F` | `#7FD1A0` |
| `--warn` | warning state | `#8A5A00` | `#F2C14E` |
| `--danger` | failure state | `#A62F25` | `#FF8A7A` |
| `--series-1..5` | multi-series charts only | see `palettes.md` | see `palettes.md` |

Mixes use `color-mix(in srgb, …)`. They are resolved by the browser at runtime, so a
palette only needs to set `--paper`, `--ink`, and `--accent`; the rest follows. The
contrast checker reads the same mix percentages, so the CSS and the check cannot drift.
`--mask` matches a 1% zone fill, so a zone-matched label mask (`.label-mask--zone`)
disappears inside a zone while still hiding the line behind it. A label on the page uses
`--paper`. Edge labels use `--muted`, not `--soft`: at 8px they need the
extra contrast.

### Geometry tokens

| Token | Value | Use |
|---|---|---|
| `--grid` | 4px | every origin, size, gap, padding |
| `--radius-sm` | 2px | tags, label masks |
| `--radius-md` | 6px | nodes, tables |
| `--radius-lg` | 8px | zones, frames |
| `--stroke-hair` | 0.8px | hairlines, dividers |
| `--stroke-1` | 1px | default stroke |
| `--stroke-2` | 1.25px | emphasis, focal path |

## Typography

| Role | Font stack | Size | Weight | Notes |
|---|---|---|---|---|
| `title` | `ui-serif, Georgia, "Times New Roman", serif` | 28–40px | 400 | page H1, never inside the SVG |
| `node-name` | `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` | 12–13px | 600 | human-readable names |
| `node-tech` | `ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace` | 9–10px | 400 | ports, protocols, URLs, field types |
| `eyebrow` | same mono | 8px | 500 | uppercase, tracking 0.14em |
| `edge-label` | same mono | 8px | 400 | tracking 0.06em, max 14 characters |
| `annotation` | title serif, italic | 14px | 400 | at most two per diagram |

Mono is for **technical** content. A product name, a team name, or a human verb goes in
the sans. A page title goes in the serif. There is no fourth family.

For CJK labels, extend the family on that `<text>` element; do not swap the palette:

```xml
<text class="node-name" font-family="ui-sans-serif, 'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif">결제 서비스</text>
```

Keep a 12px floor for Hangul and Han; cut a label rather than shrink it. Technical
sublabels stay Latin.

## Node treatments

| Class | Fill | Stroke | Use |
|---|---|---|---|
| `.node-box--focal` | `accent-soft` | `accent` | 1–2 per diagram |
| `.node-box--backend` | `surface` | `line-strong` | services, APIs, workers |
| `.node-box--store` | ink 5% + paper | `muted` | databases, buckets, caches |
| `.node-box--external` | ink 3% + paper | ink 30% + paper | third parties |
| `.node-box--input` | muted 10% + paper | `soft` | users, clients, sources |
| `.node-box--optional` | ink 2% + paper | `line-strong`, dashed | async, passive, tentative |
| `.node-box--security` | accent 5% + paper | `accent-line`, dashed | boundaries, controls |

Every node is drawn in three layers, in this order:

1. `.node-mask` — an opaque `paper` rect that hides any edge behind the node.
2. `.node-box` — the styled box with the treatment class.
3. text — tag (top-left), name (centre), technical sublabel (below).

Draw zones first, then edges, then nodes. A node mask only works if the node is painted
after the line it crosses.

## Composition

- **One idea per node.** If two nodes always travel together, merge them.
- **One direction.** Left → right for a request path; top → bottom for a stack, a
  hierarchy, or a decision. Do not zig-zag.
- **One focal point.** Accent the service where the story turns, the store that is the
  subject, or the one edge that is the headline. Two is the ceiling.
- **Whitespace is structure.** A 24px gap means "sibling"; a 40px gap means "new
  group"; a zone boundary means "different rule".
- **No decoration that does not carry meaning.** No shadow, glow, gradient, icon pack,
  watermark, or stock illustration. If an icon is used, it is an internal SVG primitive
  with a text label.

## Anti-patterns

| Anti-pattern | Why it fails |
|---|---|
| Dark mode + neon cyan/purple glow | Reads as "technical" without a design decision |
| Shadow or blur on a node | Fights the flat editorial system; hides the grid |
| Radius above 8px on a node | Turns a schematic into a pill-shaped UI card |
| Mono for every label | Erases the name/tech distinction |
| Identical boxes for every node | Removes hierarchy |
| A legend floating inside the canvas | Collides with nodes and labels; use a bottom strip |
| An arrow label with no mask | The stroke bleeds through the text |
| Vertical text on an arrow | Unreadable at small sizes |
| Three identical summary cards | Generic grid; vary width and content, or omit |
| Accent on every "important" node | Nothing is focal |
| Colour-only state | Fails for colour-blind readers and in print |
