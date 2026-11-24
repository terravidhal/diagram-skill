# Contributing

Diagramforge is a skill repository: the product is the instruction set in
`skills/diagramforge/`, the reusable assets it copies, the examples that prove the
result, and the checks that keep it honest.

## What to edit

| Change | Files |
|---|---|
| Triggering, workflow, rules, final checklist | `skills/diagramforge/SKILL.md` |
| Type catalogue and layout grammar | `skills/diagramforge/references/index.md`, `diagram-types.md` |
| Colour system, palettes, contrast | `references/design-system.md`, `palettes.md`, `assets/themes.css` |
| Grid, budgets, spacing, size presets | `references/layout.md` |
| Connector routing and labels | `references/connectors.md` |
| Animation modes and budgets | `references/animation.md`, `assets/motion.css` |
| SVG accessibility contract | `references/accessibility.md` |
| HTML/SVG/PNG export | `references/export.md` |
| Reusable starting point | `skills/diagramforge/assets/template.html` |
| Proof renders | `examples/src/`, then `npm run lint:examples` |
| README captures and animation demo | `assets/readme/`, `assets/demo.gif`, `scripts/screenshot.mjs`, `scripts/demo-gif.mjs` |
| Behavioural expectations | `evals/evals.json` |
| Repository guard rails | `scripts/` |

## Rules

1. **No copied artwork or reference prose.** Methods and constraints may be studied;
   files, templates, drawings, palettes, and text are written here from scratch.
2. **No network in the output.** No Google Fonts, CDN, remote script, external image,
   or web-font link. System font stacks only.
3. **Tokens only.** Diagram markup uses semantic classes and CSS variables. No hex
   colour inside the SVG body.
4. **Single file.** An example is one `.html` with inline CSS and inline SVG.
5. **Theme and motion are runtime.** A palette or light/dark change must not require
   editing the drawing. Motion is optional and decorative.
6. **Accessibility is not a patch.** `role="img"`, prefixed `<title>`/`<desc>`, and a
   complete static frame ship in the first draft.
7. **Budgets are hard.** Nine nodes, twelve edges, two accents, two annotations. Above
   that: overview + detail, with a fidelity ledger.

## Before opening a pull request

```bash
npm run lint
npm run lint:browser    # requires Playwright; console, theme, and motion checks
npm run lint:examples   # rebuild examples/ from examples/src/
npm run lint:shots      # requires Playwright; dev-only
npm run lint:demo       # requires Playwright and ffmpeg; dev-only
npm run lint:provenance # only in the study workspace that has ref/
```

`npm run lint` checks structure, links, palettes and contrast, geometry, motion
budgets, accessibility contracts, and the absence of network dependencies. The
screenshot command eases reduced motion and forces the static frame so captures are
reproducible. Each source declares two palettes; the build writes one file per palette
and the capture script records both light and dark.

Look at the renders. A geometry check cannot see an ugly gap, a label that feels
detached, or a hierarchy that collapsed. Name at least one defect, or say why none
applies, then fix by restructuring rather than nudging coordinates at random.

## Style

- British spelling in prose is fine; be consistent.
- Sentence case for headings, except proper nouns.
- No marketing superlatives, no emoji in repository files.
- Keep reference files short enough to load on demand.
