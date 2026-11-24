# Connectors, labels, zones, and legends

A connector is a claim about a relationship. It must be traceable from end to end. The
rules below are non-negotiable; a geometrically clean drawing with one diagonal arrow
still fails the taste gate.

## The six rules

1. **Orthogonal only.** A connector between off-axis endpoints is a rounded right-angle
   elbow. A straight `<line>` is allowed only when both endpoints share `x` or `y`.
   Diagonals are forbidden.
2. **Perpendicular exit.** The first segment leaves the box perpendicular to the edge it
   touches, at least 8px from a corner. A horizontal segment may not start on a top or
   bottom edge; it would run along the border behind the node fill.
3. **Label clearance.** Back every edge label with an opaque patch, then keep 6–10px of
   clear stroke between that patch and the line. The text never touches or hides the
   connector it names.
4. **No overlaps.** No shared stroke path, no stacked parallel strokes. Parallel routes
   are offset by at least 12px. A crossing uses one small hop on the less important
   line; never bridge both.
5. **Fan the ports.** N connectors on one edge get N distinct attach points at
   `L * k / (N + 1)` from the leading corner, at least 12px apart (8px on a tiny box).
6. **No transit behind a box.** A connector must not pass behind a node that is not its
   source or destination. Reroute. The only exception is an unavoidable cross-cutting
   bar, and then the stroke is dashed and the marker lands on the true destination.

## Port recipe

For a box `x, y, w, h`, the edge ports are:

| Edge | Point for connector `k` of `N` |
|---|---|
| top | `(x + w * k / (N + 1), y)` |
| bottom | `(x + w * k / (N + 1), y + h)` |
| left | `(x, y + h * k / (N + 1))` |
| right | `(x + w, y + h * k / (N + 1))` |

Round the port to the 4px grid. If two boxes are adjacent and the port lands within 8px
of a corner radius, move it inward. Keep the list of ports next to the node while
drawing; it is the only way to avoid two arrows meeting at one point.

## Elbow paths

Two bends, `r = 8`, horizontal first:

```svg
<!-- right then down: from (x1,y1) to (x2,y2), mid = (x1+x2)/2 -->
<path class="edge" d="M x1,y1 H mid-8 Q mid,y1 mid,y1+8 V y2-8 Q mid,y2 mid+8,y2 H x2"
      marker-end="url(#arrow)"/>
```

Two bends, vertical first:

```svg
<!-- down then right -->
<path class="edge" d="M x1,y1 V mid-8 Q x1,mid x1+8,mid H x2-8 Q x2,mid x2,mid+8 V y2"
      marker-end="url(#arrow)"/>
```

One bend:

```svg
<!-- down then left -->
<path class="edge" d="M x1,y1 V y2-8 Q x1,y2 x1-8,y2 H x2"
      marker-end="url(#arrow)"/>
```

Use a plain `<line>` only for a shared axis:

```svg
<line class="edge" x1="192" y1="272" x2="248" y2="272" marker-end="url(#arrow)"/>
```

All `x`, `y`, and `mid` values are on the 4px grid. The bend radius is less important
than the direction; do not invent a third bend to avoid restructuring.

## Crossing arrows

When two orthogonal connectors must cross, put a semicircular hop on the less important
one (dashed, secondary, passive), and leave the important one uninterrupted:

```svg
<!-- horizontal hop over a vertical line at x = cx -->
<path class="edge edge--dashed" d="M x1,y H cx-8 a 8,8 0 0,1 16,0 H x2"/>
<!-- vertical hop over a horizontal line at y = cy -->
<path class="edge edge--dashed" d="M x,cy1 V cy-8 a 8,8 0 0,1 0,16 V cy2"/>
```

Never bridge both lines. If you need more than one hop in a small area, the layout is
too dense; regroup.

## Arrow roles

| Marker | Class | Use |
|---|---|---|
| Default | `marker-muted` | internal, generic |
| Accent | `marker-accent` | the headline path, at most one |
| Link | `marker-link` | HTTP, API, external call |
| Open | `marker-open` | async, fire-and-forget (no fill) |

Dashed edges (`stroke-dasharray: 4 3`) mean optional, return, async, or passive. A
return is dashed **and** keeps a filled head. An async message is dashed **and** uses an
open head.

Define all markers once in `<defs>` and colour them through CSS classes, not
presentation attributes:

```svg
<marker id="df-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
  <polygon class="marker-muted" points="0 0, 8 3, 0 6"/>
</marker>
```

```css
.marker-muted { fill: var(--muted); }
.marker-accent { fill: var(--accent); }
.marker-link { fill: var(--link); }
.marker-open { fill: none; stroke: var(--muted); stroke-width: 1.2; }
```

## Edge labels

Structure every label as a group: mask first, then text.

```svg
<g class="edge-label-group">
  <rect class="label-mask" x="228" y="252" width="56" height="12" rx="2"/>
  <text class="edge-label" x="256" y="261" text-anchor="middle">POST</text>
</g>
```

Rules:

- 14 characters maximum, uppercase for protocols and verbs.
- Centred on the segment for a horizontal line; placed to the side for a vertical line.
- Mask width = text width + 8px, rounded to 4px. A mono character is about 0.62em.
- Mask fill is `--paper` on the page, and `--mask` inside a zone
  (`.label-mask--zone`), so the patch matches its own background; the line must be fully
  hidden behind it.
- The mask may not overlap a node painted after it. Put the label on an open segment.

## Zones

Zones are drawn before edges and nodes. They group 2+ nodes that share a rule (tier,
trust boundary, subnet, phase).

```svg
<rect class="zone" x="40" y="200" width="360" height="128" rx="8"/>
<g class="zone-label-group">
  <rect class="label-mask" x="52" y="208" width="96" height="12" rx="2"/>
  <text class="zone-label" x="100" y="217" text-anchor="middle">PAYMENT</text>
</g>
```

- Zone fill: `ink` at 1%, no stronger. It must not compete with node fills.
- Zone stroke: `line`, 0.8px, radius 8.
- Zone label: `soft`, mono, uppercase, tracking 0.14em.
- Leave 16px between the label and the first enclosed node.
- Maximum three flat zones. Nested scopes use the `nested` type, not more zones.
- A managed service sits in the administrative zone that owns it, not inside a subnet.
  Only its private endpoint belongs inside the traffic boundary.

## Legends

A legend is a horizontal strip at the bottom, separated by a hairline. It explains
treatments that are not obvious (optional, security, series), never the structure.

```svg
<line class="legend-rule" x1="40" y1="552" x2="920" y2="552"/>
<text class="legend-label" x="40" y="572">LEGEND</text>
<g class="legend-item">…</g>
```

Expanding the `viewBox` height by 60px for the strip is expected. If the legend is
larger than the diagram, remove the legend and name the treatments directly.

## Anti-patterns

- A diagonal line between two off-axis boxes.
- An arrowhead landing in empty space, or on the wrong box.
- Two arrows sharing one port, or running on top of each other.
- A label on the stroke, with no mask; a mask that hides the stroke and leaves no gap.
- A connector through a non-endpoint box.
- A loop back-edge that crosses the whole drawing instead of returning to a nearby port.
- A legend inside the canvas.
- A dashed line used as decoration rather than as a semantic role.
