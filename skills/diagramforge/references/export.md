# Export

The HTML is the source of truth. SVG and PNG are produced **from** the HTML, never
hand-authored. Export is manual: do not emit files the user did not ask for, and keep
previews in a scratch folder.

## Formats

| Format | What it is | Keeps | Drops |
|---|---|---|---|
| HTML | one self-contained file | header, diagram, theme, motion | nothing |
| SVG | the single `<svg>` node | vector text, classes, markers | page shell, motion CSS |
| PNG | a browser render at a scale | pixels exactly as seen | vector editability |

SVG and PNG are diagram-only. The editorial wrapper (eyebrow, H1, lede) is not part of
the figure.

## Before any export

1. Pick a theme explicitly: `data-theme="light"` or `data-theme="dark"`. Do not export
   `auto`; the result would depend on the machine.
2. Pick a palette explicitly with `data-palette`.
3. Force the static frame: `data-animate="none"` or `data-static="true"`.
4. Wait for `document.fonts.ready`. System fonts resolve immediately, but a host page may
   add a font.
5. Check the `viewBox` and the wrapper's `min-width`. They must agree.

## SVG

Extract the `<svg>` element and keep:

- the `viewBox`, `role`, `aria-labelledby`, `<title>`, and `<desc>`;
- the semantic classes and the `<defs>` markers;
- the static geometry.

Remove or omit:

- the page shell and `.diagram-container`;
- animation keyframes and animation-only classes;
- decorative flow tokens and focus halos;
- any `<script>` (there should be none).

If the SVG references CSS classes, inline the needed CSS in the SVG or replace the
classes with presentation attributes **after** export. Do not hand-maintain a second
copy of the drawing.

## PNG

Use Playwright/Chromium. It is a development dependency; the HTML output never depends
on it.

```bash
npm install -D playwright
npx playwright install chromium
```

The repository helper captures every example with reduced motion, a forced static
frame, and `document.fonts.ready`:

```bash
npm run lint:shots
```

The helper writes to `assets/readme/` at `deviceScaleFactor: 2`. It does not use a
wall-clock delay.

For a one-off capture, force the static state in the page:

```js
import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: "light",
  reducedMotion: "reduce",
});
await page.goto(`file://${process.cwd()}/examples/architecture-ocean-dark.html`);
await page.evaluate(() => {
  document.documentElement.dataset.theme = "dark";
  document.documentElement.dataset.static = "true";
});
await page.evaluate(() => document.fonts.ready);
await page.locator(".frame").screenshot({ path: "preview/architecture.png" });
await browser.close();
```

`reducedMotion: "reduce"` is the simplest way to freeze a CSS animation without adding
a script to the diagram. Set `data-static="true"` as well so the rule is explicit.

## Sizes

| Destination | Preset | Scale |
|---|---|---|
| README / docs | `doc-inline` 960×600 | 2 |
| Slide | `slide-16x9` 1280×720 | 2 |
| Social card | `social-og` 1200×632 | 2 |
| Print | `print-a4` 1120×792 | 3 |
| Vector handoff | `fit` | 1 |

The preset sets the type ramp; do not export a 960×600 layout at 1280×720 by scaling the
SVG. Redraw at the preset, or accept that the names become smaller.

## Static frame

The final frame is a first-class state:

- `@media print` freezes it.
- `[data-static="true"]` freezes it.
- `prefers-reduced-motion: reduce` freezes it.
- `data-animate="none"` leaves it as the only state.

A capture must assert one of these. A screenshot taken after "wait 2 seconds" is not
reproducible and may catch a half-drawn figure.

## Verification

- [ ] The export was requested; no unrequested file was written.
- [ ] The theme and palette are explicit.
- [ ] The static frame is forced.
- [ ] `document.fonts.ready` was awaited.
- [ ] The SVG contains `role`, `aria-labelledby`, `<title>`, and `<desc>`.
- [ ] The PNG was opened and looked at, not only generated.
- [ ] The file size is credible; a blank or clipped image is a failure.
