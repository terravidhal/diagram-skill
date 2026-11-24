# Accessible SVG and readable text

A figure is still content. Name it, describe it, keep every glyph legible, and make
sure the drawing survives with colour removed and motion stopped. None of that is a
post-processing step; it belongs to the first draft.

## What every diagram SVG carries

```html
<svg class="diagram" data-slug="checkout"
     viewBox="0 0 960 600" role="img"
     aria-labelledby="checkout-title checkout-desc">
  <title id="checkout-title">Checkout request path</title>
  <desc id="checkout-desc">Browser, API gateway, checkout service, Redis, Postgres,
  a payment provider, and a webhook worker, with the main request path highlighted.</desc>
  <defs>…</defs>
  …
</svg>
```

Requirements:

1. The root `<svg>` declares `role="img"`.
2. `aria-labelledby` lists the `<title>` ID first, then the `<desc>` ID.
3. `<title>` leads the SVG and precedes `<defs>`; some screen readers drop a title
   that arrives late.
4. IDs take the diagram slug as a prefix: `<slug>-title`, `<slug>-desc`. A bare
   `title` or `desc` collides when two figures share a page.
5. `<title>` names the subject in 60 characters or fewer, close to the page H1.
6. `<desc>` says what the reader should understand, never where shapes sit. "A box
   above five boxes" is geometry; "orders fan out to three fulfilment paths" is content.
7. Purely ornamental SVG (icons, specimen marks, background flourishes) is
   `aria-hidden="true" focusable="false"` and gets no title.
8. Read each semantic string once. Repeating a node name in `<text>` and `aria-label`
   makes a screen reader announce it twice.
9. Every ID in the document is unique, including IDs that belong to the HTML around
   the figure.

`scripts/check-skill.mjs` enforces the role, the label resolution, the first-child
title, the non-empty description, and the slug prefix. It cannot judge whether the
description is useful, so read it aloud once.

## Contrast floors

| Element | Minimum ratio |
|---|---|
| Names, labels, and any accent used as type | 4.5:1 |
| Headline type at 24px, or 18.7px at weight 600 | 3:1 |
| Structural ink: strokes, arrowheads, outlines, focus rings, plotted marks | 3:1 |
| Purely ornamental rules and washes | none, as long as they never carry the only cue |

- **One token, every role it plays.** `accent` may be a stroke in one shape and a word
  in another. Test the stricter role, which is text.
- **Blend before you measure.** A translucent fill or hairline is judged against what
  shows through it, not against white.
- **Judge on the real surface.** Type inside `accent-soft` or on `surface` answers to
  that background rather than to `paper`.
- **Do not weaken `muted` or `soft` casually.** Their mix percentages were tuned to
  clear 4.5:1 on every palette's paper. A lower percentage needs a fresh
  `npm run lint:contrast` run.

## When colour cannot be the only cue

Give every state a second signal, such as a word, a symbol, or a shape difference:

- `PASS`, `FAIL`, `SKIPPED`, `NOT REACHED` beside the rule row.
- `BLOCKED` on a kanban card, with a distinct border as well.
- `LATE 14m` on a pipeline stage, plus a warning glyph.
- A dashed boundary carrying `DENY`, rather than a red boundary alone.
- A truncated axis with an explicit note; a zero baseline that is actually drawn.

This keeps the figure readable in greyscale and for the common colour-vision
deficiencies.

## Type sizes and edge labels

- A node name starts at 12px, a technical sublabel at 9px, and an eyebrow or edge
  label at 8px. Those are floors, not targets.
- For Hangul and Han, keep 12px as the floor. Shorten the wording instead of dropping
  below it.
- An edge label is uppercase, at most 14 characters, and centred on its segment. If it
  does not fit, reduce the verb, not the type size.
- Put labels on an opaque mask beside the line; never rotate them or lay them over the
  stroke.
- Estimate label width with the 0.62em mono budget and grow the box by 4px steps until
  the text fits. Text that leaves its box is a defect.
- Do not use `writing-mode: vertical-rl` on node or chart labels.

## Focus and interaction

The default output is a static figure, so it adds no keyboard handling of its own.
Links and buttons around the figure remain ordinary HTML controls with native focus.
Decorative shapes never receive `tabindex`.

A CSS-only animation has no playback controls, so it needs no focus target, no
`role="status"`, and no live region. If a host later wraps the figure in controls,
those must be native buttons with visible focus, a 44×44px hit area, and a complete
final frame when motion is reduced.

## Print, reduced motion, and the static frame

- `@media print` reveals the final frame, hides decorative overlays, and lets the
  wrapper release so the figure scales down as one piece.
- `data-static="true"` is the explicit switch used by screenshots and exports.
- Emulate `prefers-reduced-motion: reduce` before a capture; never capture mid-flight.
- A static export keeps the `<title>` and `<desc>`; only the animation CSS and the
  decorative tokens are dropped.

## Final check

- [ ] `role="img"` and an `aria-labelledby` that resolves.
- [ ] `<title>` first, non-empty, 60 characters or fewer.
- [ ] `<desc>` non-empty and about content, not geometry.
- [ ] Prefixed, document-unique IDs.
- [ ] Decorative SVG hidden from assistive technology.
- [ ] Text at 4.5:1; structural marks at 3:1.
- [ ] No state conveyed by colour alone.
- [ ] Type at or above the floors.
- [ ] No vertical labels.
- [ ] Static and print frames complete.
- [ ] No semantic string announced twice.
