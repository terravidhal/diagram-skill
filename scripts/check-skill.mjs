/**
 * Repository guard: structure, frontmatter, links, type catalogue, example
 * contracts, palette coverage, accessibility scaffolding, network isolation,
 * anti-patterns, animation declarations, and README captures.
 */
import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const errors = [];
const warnings = [];

const required = [
  "README.md",
  "LICENSE",
  "CONTRIBUTING.md",
  "package.json",
  "skills/diagramforge/SKILL.md",
  "skills/diagramforge/references/index.md",
  "skills/diagramforge/references/diagram-types.md",
  "skills/diagramforge/references/design-system.md",
  "skills/diagramforge/references/palettes.md",
  "skills/diagramforge/references/layout.md",
  "skills/diagramforge/references/connectors.md",
  "skills/diagramforge/references/animation.md",
  "skills/diagramforge/references/accessibility.md",
  "skills/diagramforge/references/export.md",
  "skills/diagramforge/references/choose.md",
  "skills/diagramforge/assets/template.html",
  "skills/diagramforge/assets/themes.css",
  "skills/diagramforge/assets/motion.css",
  "evals/evals.json",
  "assets/readme/before-after.png",
  "assets/readme/palettes.png",
  "assets/readme/examples",
  "assets/demo.gif",
];

const typeSlugs = [
  "architecture", "flowchart", "sequence", "state-machine", "erd",
  "dependency-graph", "tree", "quadrant", "timeline", "before-after-delta",
  "data-flow", "layer-stack", "swimlane", "service-blueprint", "kanban",
  "user-journey", "gantt", "deployment", "network-topology", "data-pipeline",
  "security-boundaries", "integration-map", "db-schema", "uml-class", "org-chart",
  "nested", "venn", "capability-map", "roadmap", "git-graph", "loop-flywheel",
  "pyramid-funnel", "bar", "line", "radar", "heatmap", "treemap", "waterfall",
  "fishbone", "requirement-traceability",
];

const palettes = [
  "paper", "midnight", "ocean", "forest", "sand", "slate", "mono", "contrast", "brand",
];

const exampleSources = (await readdir(path.join(root, "examples/src")))
  .filter((file) => file.endsWith(".html"))
  .sort();
const examples = (await readdir(path.join(root, "examples")))
  .filter((file) => file.endsWith(".html"))
  .sort();

const motionModes = new Set(["none", "draw", "reveal", "flow", "focus", "combo"]);

async function exists(relative) {
  try {
    await access(path.join(root, relative));
    return true;
  } catch {
    return false;
  }
}

async function text(relative) {
  return readFile(path.join(root, relative), "utf8");
}

for (const file of required) {
  if (!(await exists(file))) errors.push(`missing ${file}`);
}

if (exampleSources.length < 12) {
  errors.push(`examples/src has ${exampleSources.length} diagrams; at least 12 are required`);
}
if (examples.length !== exampleSources.length * 2) {
  errors.push(
    `examples has ${examples.length} HTML files; expected ${exampleSources.length * 2} (two palettes per source)`,
  );
}

let animatedDiagrams = 0;

for (const sourceFile of exampleSources) {
  const source = await text(`examples/src/${sourceFile}`);
  const slug = sourceFile.replace(/\.html$/, "");
  const variants = source.match(/<!--\s*variants:\s*([a-z0-9,\s-]+)\s*-->/i)?.[1]
    ?.split(",")
    .map((name) => name.trim())
    .filter(Boolean);
  const mode = source.match(/data-animate="([a-z]+)"/)?.[1] ?? "none";

  if (!variants || variants.length !== 2) {
    errors.push(`examples/src/${sourceFile}: declare exactly two palettes`);
    continue;
  }
  if (new Set(variants).size !== 2) {
    errors.push(`examples/src/${sourceFile}: palettes must be distinct`);
  }
  if (mode !== "none") animatedDiagrams += 1;

  for (const palette of variants) {
    const file = `${slug}-${palette}.html`;
    if (!(await exists(`examples/${file}`))) {
      errors.push(`missing examples/${file}`);
      continue;
    }
    const html = await text(`examples/${file}`);
    const rootTag = html.match(/<html\b[^>]*>/i)?.[0] ?? "";
    if (!/data-theme="auto"/.test(rootTag)) {
      errors.push(`examples/${file}: theme must stay auto; force light/dark at capture`);
    }
    if (!new RegExp(`data-palette="${palette}"`).test(rootTag)) {
      errors.push(`examples/${file}: data-palette is not ${palette}`);
    }
  }
}

if (animatedDiagrams < 6) {
  errors.push(`only ${animatedDiagrams} animated diagrams; at least 6 are required`);
}

const captureDir = path.join(root, "assets/readme/examples");
if (await exists("assets/readme/examples")) {
  const captures = (await readdir(captureDir)).filter((file) => file.endsWith(".png"));
  if (captures.length < exampleSources.length * 4) {
    errors.push(
      `assets/readme/examples has ${captures.length} captures; expected ${exampleSources.length * 4} (two palettes, light and dark)`,
    );
  }
}

const skillFile = "skills/diagramforge/SKILL.md";
if (await exists(skillFile)) {
  const source = await text(skillFile);
  const lineCount = source.split(/\r?\n/).length;
  if (lineCount > 300) errors.push(`${skillFile} is ${lineCount} lines; keep it under 300`);

  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) {
    errors.push(`${skillFile} has no frontmatter`);
  } else {
    const block = frontmatter[1];
    const name = block.match(/^name:\s*(\S+)/m)?.[1];
    if (name !== "diagramforge") errors.push(`${skillFile}: name must be diagramforge`);
    if (!/^description:\s*\S/m.test(block)) errors.push(`${skillFile}: description is missing`);
    const description = block.replace(/^[\s\S]*?description:\s*/m, "");
    if (description.length < 200) errors.push(`${skillFile}: description is too short to trigger reliably`);
    for (const word of ["diagram", "HTML", "SVG", "palette", "animation"]) {
      if (!new RegExp(word, "i").test(description)) {
        errors.push(`${skillFile}: description should mention ${word}`);
      }
    }
    if (!/^license:\s*MIT/m.test(block)) errors.push(`${skillFile}: license must be MIT`);
  }

  for (const match of source.matchAll(/\]\((references\/[^)#]+|assets\/[^)#]+)\)/g)) {
    const target = `skills/diagramforge/${match[1]}`;
    if (!(await exists(target))) errors.push(`${skillFile} links to missing ${target}`);
  }
}

const catalogueFile = "skills/diagramforge/references/diagram-types.md";
if (await exists(catalogueFile)) {
  const source = await text(catalogueFile);
  const sections = source.split(/^## /m).slice(1);
  const found = new Map();
  for (const section of sections) {
    const anchor = section.match(/\{#([a-z0-9-]+)\}/)?.[1];
    if (anchor) found.set(anchor, section);
  }
  for (const slug of typeSlugs) {
    const section = found.get(slug);
    if (!section) {
      errors.push(`${catalogueFile}: missing section #${slug}`);
      continue;
    }
    for (const label of ["Choose if", "Layout", "Budget", "Anti-patterns", "Example"]) {
      if (!section.includes(`**${label}**`)) {
        errors.push(`${catalogueFile}: #${slug} is missing **${label}**`);
      }
    }
  }
  if (found.size !== typeSlugs.length) {
    errors.push(`${catalogueFile}: expected ${typeSlugs.length} typed sections, found ${found.size}`);
  }

  const indexSource = await text("skills/diagramforge/references/index.md");
  for (const slug of typeSlugs) {
    if (!indexSource.includes(`\`${slug}\``)) {
      errors.push(`references/index.md does not list ${slug}`);
    }
  }
}

for (const file of ["evals/evals.json", "package.json"]) {
  if (!(await exists(file))) continue;
  try {
    JSON.parse(await text(file));
  } catch (error) {
    errors.push(`${file}: invalid JSON (${error.message})`);
  }
}

if (await exists("evals/evals.json")) {
  const evals = JSON.parse(await text("evals/evals.json"));
  const cases = Array.isArray(evals.cases) ? evals.cases : [];
  if (cases.length !== 12) errors.push(`evals/evals.json: expected 12 cases, found ${cases.length}`);
  const ids = new Set();
  for (const item of cases) {
    if (!item.id) errors.push("evals/evals.json: a case has no id");
    if (ids.has(item.id)) errors.push(`evals/evals.json: duplicate id ${item.id}`);
    ids.add(item.id);
    if (!item.prompt) errors.push(`evals/evals.json: ${item.id} has no prompt`);
    if (!Array.isArray(item.must) || item.must.length === 0) {
      errors.push(`evals/evals.json: ${item.id} needs a non-empty must[]`);
    }
    if (!Array.isArray(item.must_not) || item.must_not.length === 0) {
      errors.push(`evals/evals.json: ${item.id} needs a non-empty must_not[]`);
    }
  }
}

const themesFile = "skills/diagramforge/assets/themes.css";
if (await exists(themesFile)) {
  const source = await text(themesFile);
  for (const palette of palettes) {
    if (!source.includes(`[data-palette="${palette}"]`)) {
      errors.push(`${themesFile}: palette ${palette} is missing`);
    }
  }
  if (!source.includes("prefers-color-scheme: dark")) errors.push(`${themesFile}: no dark media query`);
  for (const token of ["--paper", "--ink", "--accent", "--muted", "--soft", "--line", "--accent-soft", "--font-tech"]) {
    if (!source.includes(token)) errors.push(`${themesFile}: token ${token} is missing`);
  }
}

const motionFile = "skills/diagramforge/assets/motion.css";
if (await exists(motionFile)) {
  const source = await text(motionFile);
  if (!source.includes("prefers-reduced-motion: reduce")) errors.push(`${motionFile}: no reduced-motion rule`);
  if (!source.includes("@media print")) errors.push(`${motionFile}: no print rule`);
  if (!source.includes('[data-static="true"]')) errors.push(`${motionFile}: no static rule`);
  if (!source.includes(':not(.edge--dashed)')) {
    errors.push(`${motionFile}: reduced motion must preserve semantic dashed edges`);
  }
  for (const keyframe of ["df-draw", "df-reveal", "df-flow", "df-focus"]) {
    if (!source.includes(keyframe)) errors.push(`${motionFile}: missing ${keyframe}`);
  }
}

const templateFile = "skills/diagramforge/assets/template.html";
if (await exists(templateFile)) {
  const source = await text(templateFile);
  for (const needle of [
    'data-theme="auto"', 'data-palette="paper"', "prefers-color-scheme: dark",
    "prefers-reduced-motion: reduce", "@media print", '[data-static="true"]',
    'role="img"', "aria-labelledby", "<title", "<desc", "--font-tech", "--grid",
    "node-mask", "node-box", "label-mask", "marker-muted", "min-width: 960px",
  ]) {
    if (!source.includes(needle)) errors.push(`${templateFile}: missing ${needle}`);
  }
  for (const palette of palettes) {
    if (!source.includes(`[data-palette="${palette}"]`)) {
      errors.push(`${templateFile}: palette ${palette} is missing`);
    }
  }
  const svg = source.match(/<svg\b[^>]*class="[^"]*\bdiagram\b[^"]*"[^>]*>[\s\S]*?<\/svg>/i)?.[0] ?? "";
  if (!svg.includes('role="img"')) errors.push(`${templateFile}: SVG has no role="img"`);
  if (!/<title[^>]*>[\s\S]*?<\/title>/i.test(svg)) errors.push(`${templateFile}: SVG has no title`);
  if (!/<desc[^>]*>[\s\S]*?<\/desc>/i.test(svg)) errors.push(`${templateFile}: SVG has no desc`);
  const titleIndex = svg.indexOf("<title");
  const defsIndex = svg.indexOf("<defs");
  if (titleIndex < 0 || (defsIndex >= 0 && titleIndex > defsIndex)) {
    errors.push(`${templateFile}: <title> must come before <defs>`);
  }
}

const htmlFiles = [
  templateFile,
  ...examples.map((file) => `examples/${file}`),
];

for (const file of htmlFiles) {
  if (!(await exists(file))) continue;
  const source = await text(file);

  for (const pattern of [
    [/<script\b/i, "a <script> element"],
    [/\b(?:src|href)=["']https?:/i, "a remote src/href"],
    [/@import\s+url\(["']?https?:/i, "a remote @import"],
    [/fonts\.googleapis|cdn\./i, "a font/CDN reference"],
    [/box-shadow/i, "box-shadow"],
    [/filter:\s*drop-shadow/i, "drop-shadow"],
    [/backdrop-filter/i, "backdrop-filter"],
    [/JetBrains\s+Mono/i, "JetBrains Mono"],
    [/writing-mode:\s*vertical/i, "vertical writing-mode"],
  ]) {
    if (pattern[0].test(source)) errors.push(`${file}: contains ${pattern[1]}`);
  }
  for (const match of source.matchAll(/border-radius:\s*([0-9.]+)px/g)) {
    if (Number(match[1]) > 10) errors.push(`${file}: border-radius ${match[1]}px is above 10px`);
  }

  if (file === templateFile) continue;

  if (!/^<!DOCTYPE html>/i.test(source.trim())) errors.push(`${file}: missing doctype`);
  if (!/<html\b[^>]*data-theme=["'](?:auto|light|dark)["']/i.test(source)) {
    errors.push(`${file}: missing data-theme`);
  }
  if (!/<html\b[^>]*data-palette=["'][a-z]+["']/i.test(source)) {
    errors.push(`${file}: missing data-palette`);
  }
  if (!source.includes('class="diagram-container"')) errors.push(`${file}: missing diagram-container`);

  const svg = source.match(/<svg\b[^>]*class="[^"]*\bdiagram\b[^"]*"[^>]*>[\s\S]*?<\/svg>/i)?.[0] ?? "";
  if (!svg) {
    errors.push(`${file}: no SVG`);
    continue;
  }
  if (!/role="img"/.test(svg)) errors.push(`${file}: SVG has no role="img"`);
  const labelledBy = svg.match(/aria-labelledby="([^"]+)"/)?.[1] ?? "";
  if (!labelledBy) errors.push(`${file}: SVG has no aria-labelledby`);
  for (const id of labelledBy.split(/\s+/).filter(Boolean)) {
    if (!new RegExp(`id="${id}"`).test(svg)) errors.push(`${file}: aria-labelledby points to missing #${id}`);
  }
  const title = svg.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const desc = svg.match(/<desc[^>]*>([\s\S]*?)<\/desc>/i)?.[1] ?? "";
  if (!title.trim()) errors.push(`${file}: SVG title is empty`);
  if (!desc.trim()) errors.push(`${file}: SVG desc is empty`);
  if (title.trim().length > 60) errors.push(`${file}: SVG title is longer than 60 characters`);
  const titleIndex = svg.indexOf("<title");
  const defsIndex = svg.indexOf("<defs");
  if (titleIndex < 0 || (defsIndex >= 0 && titleIndex > defsIndex)) {
    errors.push(`${file}: SVG title must be before defs`);
  }

  const slug = svg.match(/data-slug="([a-z0-9-]+)"/)?.[1];
  if (!slug) {
    errors.push(`${file}: SVG has no data-slug`);
  } else {
    if (!new RegExp(`id="${slug}-title"`).test(svg)) errors.push(`${file}: missing #${slug}-title`);
    if (!new RegExp(`id="${slug}-desc"`).test(svg)) errors.push(`${file}: missing #${slug}-desc`);
  }

  const mode = svg.match(/data-animate="([a-z]+)"/)?.[1];
  if (!mode) errors.push(`${file}: SVG has no data-animate`);
  else if (!motionModes.has(mode)) errors.push(`${file}: unknown data-animate="${mode}"`);

  const viewBox = svg.match(/viewBox="0 0 ([0-9]+) ([0-9]+)"/);
  if (!viewBox) {
    errors.push(`${file}: viewBox must start at 0 0 with numeric width and height`);
  } else {
    const width = Number(viewBox[1]);
    const height = Number(viewBox[2]);
    if (width % 4 !== 0 || height % 4 !== 0) errors.push(`${file}: viewBox is not on the 4px grid`);
    if (!source.includes(`min-width: ${width}px`)) {
      errors.push(`${file}: no svg min-width: ${width}px matching the viewBox`);
    }
  }

  const bodySvg = svg.replace(/xmlns="[^"]*"/g, "");
  if (/#[0-9a-fA-F]{3,8}\b/.test(bodySvg)) errors.push(`${file}: raw hex colour inside the SVG`);
  if (/\bfill="(?:rgb|hsl)\(/i.test(bodySvg) || /\bstroke="(?:rgb|hsl)\(/i.test(bodySvg)) {
    errors.push(`${file}: raw rgb()/hsl() colour inside the SVG`);
  }

  if (!svg.includes("node-mask") && /class="[^"]*\bedge\b[^"]*"/.test(svg)) {
    warnings.push(`${file}: no node-mask; check that edges do not bleed through`);
  }
}

for (const file of ["README.md", "CONTRIBUTING.md", ...(await readdir(path.join(root, "skills/diagramforge/references"))).map((name) => `skills/diagramforge/references/${name}`)]) {
  if (!(await exists(file)) || !file.endsWith(".md")) continue;
  const source = await text(file);
  const dir = path.dirname(file);
  for (const match of source.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    const link = match[1];
    if (/^(https?:|mailto:|#|\{)/.test(link)) continue;
    const [target] = link.split("#");
    if (!target) continue;
    const resolved = path.normalize(path.join(dir, target));
    if (!(await exists(resolved))) warnings.push(`${file}: relative link not found: ${link}`);
  }
}

for (const file of required.filter((entry) => entry.endsWith(".png"))) {
  if (!(await exists(file))) continue;
  const { size } = await stat(path.join(root, file));
  if (size < 10_000) errors.push(`${file} looks too small (${size} bytes)`);
  const header = (await readFile(path.join(root, file))).subarray(0, 8);
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!header.equals(png)) errors.push(`${file} is not a PNG`);
}

for (const warning of new Set(warnings)) console.warn(`warning: ${warning}`);

if (errors.length > 0) {
  for (const error of new Set(errors)) console.error(`error: ${error}`);
  console.error(`\n${new Set(errors).size} error(s)`);
  process.exit(1);
}

console.log(`ok: structure, frontmatter, ${typeSlugs.length} types, ${examples.length} examples, palettes, motion, a11y, no network`);
