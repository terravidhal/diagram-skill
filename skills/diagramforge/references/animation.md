# Optional animation

Motion explains a diagram that is already complete. It never supplies missing meaning,
never rescues an over-dense figure, and never forces the reader to wait for the point.

**Static is the default.** Add motion only when the user asks for it or when order,
accumulation, or flow is materially clearer when shown. The HTML is complete before the
first frame.

## Modes

Set one mode on the SVG with `data-animate`:

| Mode | What moves | Mechanism | Default duration |
|---|---|---|---|
| `none` | nothing | no animation CSS | — |
| `draw` | strokes draw from start to end | `pathLength="1"` + `stroke-dashoffset` | 700ms per item |
| `reveal` | nodes and labels appear in flow order | `opacity` + 8px `translateY` | 700ms per item |
| `flow` | dashes circulate on active edges | `stroke-dashoffset` loop | 4s, ≥3s |
| `focus` | one halo pulses on the focal node | `opacity` + subtle scale | 2.4s loop |
| `combo` | `draw` + `reveal` | both | 700ms per item |

The mode is decorative. The source order is the narrative order; the `--order` value
only controls when an element appears, not what it means.

## Markup

```html
<svg class="diagram" data-animate="draw" data-slug="checkout"
     viewBox="0 0 960 600" role="img"
     aria-labelledby="checkout-title checkout-desc">
  <title id="checkout-title">Cache miss on checkout</title>
  <desc id="checkout-desc">Four actors exchange a checkout request, a cache miss, a
  database read, and a success response.</desc>
  <defs>…</defs>
  <rect class="diagram-bg" width="960" height="600"/>
  <line class="edge" pathLength="1" style="--order:0" …/>
  <line class="edge" pathLength="1" style="--order:1" …/>
  <g class="node" style="--order:2">…</g>
</svg>
```

- `data-animate` accepts only `none`, `draw`, `reveal`, `flow`, `focus`, `combo`.
- Every animated element carries an integer `--order` from 0 to 7.
- At most two elements share an order (two simultaneous reveals).
- For `draw` and `combo`, every `.edge` that should draw gets `pathLength="1"`.
- For `focus`, exactly one node has `data-focus="true"` and contains a `.focus-halo`.
- For `flow`, only the active edges get `data-flow="true"`.

## CSS contract

```css
:root {
  --dur: 700ms;
  --stagger: 160ms;
  --ease: cubic-bezier(.2, .8, .2, 1);
  --flow-dur: 4s;
  --focus-dur: 2.4s;
}

[data-animate="draw"] .edge,
[data-animate="combo"] .edge {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: df-draw var(--dur) var(--ease) both;
  animation-delay: calc(var(--order, 0) * var(--stagger));
}
@keyframes df-draw { to { stroke-dashoffset: 0; } }

[data-animate="reveal"] .node,
[data-animate="combo"] .node {
  opacity: 0;
  transform: translateY(8px);
  animation: df-reveal var(--dur) var(--ease) both;
  animation-delay: calc(var(--order, 0) * var(--stagger));
}
@keyframes df-reveal { to { opacity: 1; transform: none; } }

[data-animate="flow"] .edge[data-flow] {
  stroke-dasharray: 6 10;
  animation: df-flow var(--flow-dur) linear infinite;
}
@keyframes df-flow { to { stroke-dashoffset: -64; } }

[data-animate="focus"] .focus-halo {
  transform-box: fill-box;
  transform-origin: center;
  animation: df-focus var(--focus-dur) ease-in-out infinite;
}
@keyframes df-focus {
  0%, 100% { opacity: .15; transform: scale(.98); }
  50%      { opacity: .55; transform: scale(1.04); }
}
```

`assets/motion.css` carries the same rules with a few defensive defaults. Copy it into
the template; do not invent a second controller.

## Budget

| Constraint | Value |
|---|---|
| Animated steps | 8 maximum (3–6 preferred) |
| Animated items | 12 maximum |
| Simultaneous reveals | 2 maximum |
| Drawn paths | 2 maximum |
| Flow loops | 1, ≥3s |
| Transition | 160–800ms |
| Hold | 400–1200ms |
| Total autoplay | 8s maximum |

Total = `max(--order) * --stagger + --dur`. At the defaults, eight steps take about
1.8s. Do not use random delays, springs, bounce, zoom, parallax, particles, or blinking.

## Reduced motion, print, static

The final frame is complete and the decoration is hidden in all three cases:

```css
@media (prefers-reduced-motion: reduce) {
  [data-animate] *,
  [data-animate] *::before,
  [data-animate] *::after {
    animation: none !important;
    transition: none !important;
  }
  [data-animate] .edge { stroke-dashoffset: 0 !important; }
  [data-animate="draw"] .edge:not(.edge--dashed),
  [data-animate="combo"] .edge:not(.edge--dashed),
  [data-animate="flow"] .edge[data-flow]:not(.edge--dashed) { stroke-dasharray: none !important; }
  [data-animate] .node { opacity: 1 !important; transform: none !important; }
  [data-animate] .focus-halo,
  [data-animate] .flow-token { display: none !important; }
}

[data-static="true"] .edge { stroke-dashoffset: 0 !important; }
[data-static="true"] .edge[data-flow]:not(.edge--dashed) { stroke-dasharray: none !important; }
[data-static="true"] .node { opacity: 1 !important; transform: none !important; }
[data-static="true"] .focus-halo,
[data-static="true"] .flow-token { display: none !important; }

@media print {
  [data-animate] * { animation: none !important; transition: none !important; }
  [data-animate] .edge { stroke-dashoffset: 0 !important; }
  [data-animate="draw"] .edge:not(.edge--dashed),
  [data-animate="combo"] .edge:not(.edge--dashed),
  [data-animate="flow"] .edge[data-flow]:not(.edge--dashed) { stroke-dasharray: none !important; }
  [data-animate] .node { opacity: 1 !important; transform: none !important; }
  [data-animate] .focus-halo,
  [data-animate] .flow-token { display: none !important; }
}
```

`prefers-reduced-motion: reduce` is an accessibility preference, not a suggestion. It
must produce the complete figure, not a mid-animation state. A screenshot must force
`data-static="true"` (or emulate reduced motion) before capture; never capture after an
arbitrary delay.

## What not to animate

- Layout coordinates, `viewBox`, node size, connector route, or text content.
- A semantic state that is not also legible in the static frame.
- A queue counter without the final count visible.
- A pass/fail outcome without the word or symbol.
- An infinite loop on a semantic element. Only `flow` may loop, and only as a quiet
  circulation hint on an edge that is already labelled.

## Verification

1. Disable animation (`data-animate="none"` or `data-static="true"`): the figure is
   complete and meaningful.
2. Emulate `prefers-reduced-motion: reduce`: the final frame is shown, decorations are
   hidden, nothing is left at 12% opacity.
3. Print preview: same final frame, no decoration.
4. Count the orders: contiguous 0..7, at most 12 items, at most 2 per step.
5. If `draw` is used, every animated edge has `pathLength="1"`.
6. If `focus` is used, exactly one `data-focus="true"`.
7. Capture twice with the same static state: the pixels are identical.

## Anti-patterns

- Autoplay outside the single optional run; a semantic infinite loop.
- A blank or partial no-JS frame.
- Animation used to hide an over-dense diagram.
- Motion that moves layout, changes `viewBox`, or shifts a connector.
- A colour-only state change during animation.
- JavaScript required for the static meaning.
- Capturing at wall-clock delay instead of the explicit static state.
