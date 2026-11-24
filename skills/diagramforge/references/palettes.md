# Palettes and theming

A palette sets three base colours: `paper`, `ink`, and `accent`. Every other token is
derived with `color-mix`, so the palette is small, consistent, and verified. Light and
dark sets live in the same file; no `-dark` variant is maintained separately.

## One-line switch

```html
<html lang="en" data-theme="auto" data-palette="ocean">
```

`data-theme` accepts `auto`, `light`, or `dark`. `auto` follows the operating system via
`prefers-color-scheme`. `data-palette` accepts any name below plus `brand`.

The drawing is not regenerated. The SVG references semantic classes; the CSS variables
change underneath it.

## The eight palettes

| Palette | Mode | `paper` | `ink` | `accent` | Intention |
|---|---|---|---|---|---|
| `paper` (default) | light | `#F7F5EF` | `#20242B` | `#B4451F` | warm editorial paper, deep ink, burnt accent |
| | dark | `#14171C` | `#F2EFE7` | `#F08A5D` | night paper, readable ember |
| `midnight` | light | `#F2F4F7` | `#111827` | `#4F46E5` | cool product, indigo focus |
| | dark | `#0B1020` | `#E8ECF4` | `#8B9CFF` | screen, violet focus |
| `ocean` | light | `#F2F7FA` | `#102A43` | `#0B6E99` | data, trust, measured blue |
| | dark | `#081A26` | `#E6F0F5` | `#4FB3D9` | depth, controlled cyan |
| `forest` | light | `#F4F7F1` | `#1D2A22` | `#2F6B4F` | product, growth, calm |
| | dark | `#0F1A14` | `#E9F0EA` | `#6FBF94` | nature, low noise |
| `sand` | light | `#FAF6EE` | `#2B241B` | `#A35A2A` | document, archive, warmth |
| | dark | `#1C1712` | `#F4EBDD` | `#D89A63` | paper at night, amber |
| `slate` | light | `#F3F4F6` | `#1F2937` | `#3B5BDB` | neutral product, blue |
| | dark | `#111827` | `#E5E7EB` | `#7C9CFF` | dashboard, soft contrast |
| `mono` | light | `#FAFAF8` | `#111111` | `#111111` | print, photocopy, focal by weight |
| | dark | `#0D0D0D` | `#F5F5F5` | `#F5F5F5` | high contrast, monochrome |
| `contrast` | light | `#FFFFFF` | `#000000` | `#0033A0` | AAA, projection, low vision |
| | dark | `#000000` | `#FFFFFF` | `#66B2FF` | AAA in the dark |

`mono` is intentionally monochrome: focus is carried by weight, outline, and
`accent-soft`, not by hue. `contrast` is for maximum legibility, not for branding.

## Brand palette

Three inputs are enough:

```html
<html lang="en" data-theme="auto" data-palette="brand"
      style="--brand-paper:#FFFFFF;--brand-ink:#141413;--brand-accent:#0B5FFF">
```

The CSS maps the brand inputs to the three base roles, then derives `surface`, `muted`,
`soft`, `line`, `accent-soft`, and `link`. In dark mode the brand is converted: dark
paper is drawn from the brand ink, light ink from the brand paper, and the accent is
lightened toward white.

Before shipping a brand palette, check the accent:

1. Accent as text on `paper` must be ≥ 4.5:1.
2. Accent as a stroke must be ≥ 3:1.
3. If it fails, darken it (light mode) or lighten it (dark mode) in small steps until it
   passes, and say which value you used.
4. Never use a second hue as a second accent. Pick one focal colour.

`npm run lint:contrast` checks the eight built-in palettes. For a brand, paste the three
values into a scratch copy of `scripts/check-contrast.mjs` or measure with any WCAG
tool.

## Derivation

The base tokens are explicit; the rest are mixed at runtime:

```css
--surface:      color-mix(in srgb, var(--paper) 94%, var(--ink));
--mask:         color-mix(in srgb, var(--ink) 1%, var(--paper));
--muted:        color-mix(in srgb, var(--ink) 72%, var(--paper));
--soft:         color-mix(in srgb, var(--ink) 67%, var(--paper));
--line:         color-mix(in srgb, var(--ink) 14%, var(--paper));
--line-strong:  color-mix(in srgb, var(--ink) 55%, var(--paper));
--accent-soft:  color-mix(in srgb, var(--accent) 10%, var(--paper));
--accent-line:  color-mix(in srgb, var(--accent) 55%, var(--paper));
--link:         var(--accent);
```

The percentages are deliberate. `muted` at 72% ink clears 4.5:1 on every light paper;
`soft` at 67% is the lightest text role that still clears it, including on the 1% label
mask. Do not lower them without running the contrast check. On a dark paper the same mix produces a lighter ink, so the
roles invert without a second set of values.

## Theme logic

The selectors are ordered so that an explicit `data-theme` beats the operating system,
and a palette beats the default skin:

```css
:root { /* default light base + derived tokens */ }

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { /* default dark base */ }
}
:root[data-theme="dark"] { /* explicit default dark base */ }

:root[data-palette="ocean"] { /* ocean light base */ }
@media (prefers-color-scheme: dark) {
  :root[data-palette="ocean"]:not([data-theme="light"]) { /* ocean dark base */ }
}
:root[data-palette="ocean"][data-theme="dark"] { /* explicit ocean dark base */ }
```

`color-scheme` is set with the base colours so native controls, scrollbars, and form
widgets follow the same mode. In a static export, force `data-theme` to `light` or
`dark`; never capture `auto` after an arbitrary delay.

## Status and series

Status roles are not palette-dependent in hue: `ok` is green, `warn` is amber, `danger`
is red, in a tone that clears contrast on the paper of each mode. They are always paired
with a word or a symbol (`PASS`, `FAIL`, `LATE`, `BLOCKED`). Colour is never the only
carrier.

`series-1..5` are desaturated colours for charts that genuinely overlap multiple
entities (radar, multi-line, scatter). They are not a licence to add colour to an
architecture. The focal series still uses `accent`; the others use the series palette.
Fills sit at 18% opacity, strokes at full strength.

## Checklist

- [ ] The palette is named in `data-palette`, not hard-coded in the SVG.
- [ ] Light, dark, and auto were each rendered.
- [ ] Accent is used on at most two elements.
- [ ] Text contrast is ≥ 4.5:1; essential marks ≥ 3:1.
- [ ] A brand accent was measured, not assumed.
- [ ] Status colours are paired with text or a symbol.
- [ ] `color-scheme` is declared so native UI matches.
