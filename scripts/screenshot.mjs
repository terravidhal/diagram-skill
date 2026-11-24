/**
 * Dev-only captures with Playwright/Chromium. It forces the explicit light or
 * dark frame and data-static, waits for fonts, and writes the README images.
 * The generated diagrams never depend on Playwright; this script is for the
 * repository only.
 */
import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { launchBrowser } from "./browser.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const outDir = path.join(root, "assets/readme");
const examplesOutDir = path.join(outDir, "examples");
const previewDir = path.join(root, "preview");

await mkdir(outDir, { recursive: true });
await mkdir(examplesOutDir, { recursive: true });
await mkdir(previewDir, { recursive: true });

for (const file of await readdir(examplesOutDir)) {
  if (file.endsWith(".png")) await rm(path.join(examplesOutDir, file));
}

const browser = await launchBrowser();
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 2,
  colorScheme: "light",
  reducedMotion: "reduce",
});

async function verifyAutoDark() {
  const example = pathToFileURL(path.join(root, "examples/architecture-ocean.html")).href;
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto(example);
  const dark = await page.evaluate(() => {
    document.documentElement.dataset.theme = "auto";
    document.documentElement.dataset.palette = "ocean";
    const style = getComputedStyle(document.documentElement);
    return {
      paper: style.getPropertyValue("--paper").trim(),
      ink: style.getPropertyValue("--ink").trim(),
    };
  });
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  const light = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      paper: style.getPropertyValue("--paper").trim(),
      ink: style.getPropertyValue("--ink").trim(),
    };
  });
  if (dark.paper !== "#081A26" || dark.ink !== "#E6F0F5") {
    throw new Error(`auto dark did not resolve the ocean palette: ${JSON.stringify(dark)}`);
  }
  if (light.paper !== "#F2F7FA" || light.ink !== "#102A43") {
    throw new Error(`auto light did not resolve the ocean palette: ${JSON.stringify(light)}`);
  }
  console.log("ok: data-theme=auto follows the OS for the ocean palette");
}

await verifyAutoDark();

const manifest = JSON.parse(await readFile(path.join(root, "examples/manifest.json"), "utf8"));

async function capture(file, output, { width = 1440, height = 1000, scheme = "light" } = {}) {
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
  await page.goto(pathToFileURL(path.join(root, "examples", file)).href);
  await page.evaluate((theme) => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.static = "true";
  }, scheme);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(outDir, output), fullPage: true });
  console.log(`captured assets/readme/${output}`);
}

function relative(...parts) {
  return path.join(...parts);
}

for (const diagram of manifest.files) {
  for (const palette of diagram.palettes) {
    const file = `${diagram.slug}-${palette}.html`;
    for (const mode of ["light", "dark"]) {
      await capture(file, relative("examples", `${diagram.slug}-${palette}-${mode}.png`), {
        scheme: mode,
        width: diagram.slug === "architecture-mobile" ? 390 : 1440,
        height: diagram.slug === "architecture-mobile" ? 760 : 1000,
      });
    }
  }
}

await capture("architecture-ocean.html", "hero-light.png", { scheme: "light" });
await capture("architecture-ocean.html", "hero-dark.png", { scheme: "dark" });
await capture("architecture-mobile-forest.html", "example-mobile.png", {
  width: 390,
  height: 760,
  scheme: "light",
});

/* Palette gallery: read the real computed tokens from themes.css. */
const themes = await readFile(path.join(root, "skills/diagramforge/assets/themes.css"), "utf8");
const palettes = ["paper", "midnight", "ocean", "forest", "sand", "slate", "mono", "contrast", "brand"];
const brand = {
  paper: "#FFFFFF",
  ink: "#141413",
  accent: "#0B5FFF",
};

await page.setViewportSize({ width: 1440, height: 900 });
await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
await page.setContent(`<!DOCTYPE html>
<html lang="en" data-theme="light" data-palette="paper"
      style="--brand-paper:${brand.paper};--brand-ink:${brand.ink};--brand-accent:${brand.accent}">
<head>
<meta charset="UTF-8">
<style>
${themes}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-name);
}
#gallery-page { padding: 40px; }
h1 {
  margin: 0 0 8px;
  font-family: var(--font-title);
  font-size: 40px;
  font-weight: 400;
}
.lede { margin: 0 0 32px; color: var(--muted); font-size: 14px; }
#gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.card { border: 1px solid #d8d8d2; border-radius: 8px; padding: 16px; }
.card h2 { margin: 0 0 12px; font-size: 14px; font-weight: 600; letter-spacing: .04em; }
.row { display: grid; grid-template-columns: 48px 1fr; gap: 8px; align-items: center; margin-top: 8px; }
.row-label { font-family: var(--font-tech); font-size: 9px; letter-spacing: .08em; text-transform: uppercase; }
.swatches { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; }
.swatch { height: 28px; border-radius: 3px; border: 1px solid rgba(0,0,0,.12); }
.names { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; margin-top: 4px; }
.names span { font-family: var(--font-tech); font-size: 7px; text-align: center; color: var(--muted); }
</style>
</head>
<body>
<main id="gallery-page">
<h1>Nine palettes, one line each</h1>
<p class="lede">Each card shows the computed paper, surface, ink, muted, and accent roles in light and dark. Change data-palette and data-theme; the drawing does not move.</p>
<div id="gallery"></div>
</main>
</body>
</html>`);

await page.evaluate((names) => {
  const root = document.documentElement;
  const gallery = document.getElementById("gallery");
  const probe = document.createElement("div");
  probe.style.display = "none";
  document.body.appendChild(probe);
  const tokens = ["--paper", "--surface", "--ink", "--muted", "--accent"];

  function resolve(token) {
    probe.style.background = `var(${token})`;
    return getComputedStyle(probe).backgroundColor;
  }

  function paletteRow(name, mode) {
    root.dataset.palette = name;
    root.dataset.theme = mode;
    const colors = tokens.map((token) => resolve(token));
    const ink = resolve("--ink");
    const paper = resolve("--paper");
    const swatches = colors
      .map((color) => `<div class="swatch" style="background:${color}"></div>`)
      .join("");
    const labels = tokens
      .map((token) => `<span style="color:${ink}">${token.replace("--", "")}</span>`)
      .join("");
    return `<div class="row" style="color:${ink};background:${paper}">
      <div class="row-label">${mode}</div>
      <div><div class="swatches">${swatches}</div><div class="names" style="color:${ink}">${labels}</div></div>
    </div>`;
  }

  for (const name of names) {
    const card = document.createElement("section");
    card.className = "card";
    card.innerHTML = `<h2>${name}</h2>${paletteRow(name, "light")}${paletteRow(name, "dark")}`;
    gallery.appendChild(card);
  }

  root.dataset.palette = "paper";
  root.dataset.theme = "light";
  probe.remove();
}, palettes);

await page.evaluate(() => document.fonts.ready);
await page.locator("#gallery-page").screenshot({ path: path.join(outDir, "palettes.png") });
console.log("captured assets/readme/palettes.png");

/* Before / after composite. The "before" is a deliberately raw default flowchart:
   identical grey boxes, diagonal arrows, a floating legend, no accessible title. */
const before = `
<div class="bad-stage">
  <div class="code">flowchart TD</div>
  <svg viewBox="0 0 640 440" aria-hidden="true">
    <rect width="640" height="440" fill="#FFFFFF"/>
    <defs>
      <marker id="mermaid-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#666666"/>
      </marker>
    </defs>
    <line x1="200" y1="80" x2="380" y2="170" stroke="#666666" stroke-width="1.5" marker-end="url(#mermaid-arrow)"/>
    <line x1="360" y1="220" x2="180" y2="300" stroke="#666666" stroke-width="1.5" marker-end="url(#mermaid-arrow)"/>
    <line x1="440" y1="80" x2="300" y2="180" stroke="#666666" stroke-width="1.5" marker-end="url(#mermaid-arrow)"/>
    <line x1="440" y1="220" x2="560" y2="300" stroke="#666666" stroke-width="1.5" marker-end="url(#mermaid-arrow)"/>
    <line x1="200" y1="300" x2="380" y2="380" stroke="#666666" stroke-width="1.5" marker-end="url(#mermaid-arrow)"/>
    <line x1="560" y1="220" x2="320" y2="390" stroke="#666666" stroke-width="1.5" marker-end="url(#mermaid-arrow)"/>
    <g fill="#F4F4F4" stroke="#BBBBBB" stroke-width="1">
      <rect x="80" y="40" width="120" height="40" rx="4"/>
      <rect x="300" y="40" width="140" height="40" rx="4"/>
      <rect x="300" y="180" width="140" height="40" rx="4"/>
      <rect x="480" y="180" width="120" height="40" rx="4"/>
      <rect x="80" y="300" width="120" height="40" rx="4"/>
      <rect x="300" y="300" width="140" height="40" rx="4"/>
      <rect x="480" y="300" width="120" height="40" rx="4"/>
    </g>
    <g fill="#333333" font-family="Trebuchet MS, Verdana, Arial, sans-serif" font-size="13" text-anchor="middle">
      <text x="140" y="65">browser</text>
      <text x="370" y="65">api gateway</text>
      <text x="370" y="205">checkout</text>
      <text x="540" y="205">redis</text>
      <text x="140" y="325">payment</text>
      <text x="370" y="325">postgres</text>
      <text x="540" y="325">worker</text>
    </g>
    <text x="24" y="420" fill="#888888" font-family="Trebuchet MS, Verdana, Arial, sans-serif" font-size="11">legend: service = box, arrow = data</text>
  </svg>
</div>`;

const composite = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 40px; background: #0B0F19; color: #E2E8F0; font-family: ui-sans-serif, system-ui, sans-serif; }
  h1 { margin: 0 0 8px; font-family: ui-serif, Georgia, serif; font-size: 36px; font-weight: 400; }
  p { margin: 0 0 28px; color: #94A3B8; font-size: 14px; }
  .compare { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; align-items: start; }
  .panel { min-width: 0; border-radius: 12px; overflow: hidden; border: 1px solid #1E293B; background: #0F172A; }
  .panel-head { padding: 16px 20px 12px; border-bottom: 1px solid #1E293B; }
  .panel-head strong { display: block; font-size: 13px; letter-spacing: .12em; text-transform: uppercase; }
  .panel-head span { display: block; margin-top: 4px; color: #94A3B8; font-size: 12px; }
  .before .panel-head strong { color: #CBD5E1; }
  .after .panel-head strong { color: #7DD3FC; }
  .bad-stage { padding: 16px; background: #FFFFFF; }
  .code { color: #999999; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; margin-bottom: 8px; }
  .bad-stage svg { width: 100%; max-width: 100%; height: auto; display: block; border: 1px solid #E5E7EB; }
  .after img { width: 100%; max-width: 100%; height: auto; display: block; }
  .after .panel-head { background: #F7F5EF; border-bottom-color: #D8D6CF; }
  .after .panel-head span { color: #5A5F68; }
</style>
</head>
<body>
<h1>Same brief. Different discipline.</h1>
<p>Left: a typical default agent output — identical grey boxes, diagonal arrows, a floating legend, no accessible title. Right: Diagramforge — semantic roles, orthogonal routing, one accent, a real SVG figure.</p>
<div class="compare">
  <section class="panel before">
    <div class="panel-head"><strong>Before</strong><span>Typical default output: identical boxes, diagonal lines.</span></div>
    ${before}
  </section>
  <section class="panel after">
    <div class="panel-head"><strong>After</strong><span>Diagramforge · ocean palette · dark</span></div>
    <img src="${pathToFileURL(path.join(examplesOutDir, "architecture-ocean-dark.png")).href}" alt="The same checkout architecture drawn with Diagramforge">
  </section>
</div>
</body>
</html>`;

const compositePath = path.join(previewDir, "before-after.html");
await writeFile(compositePath, composite);
await page.setViewportSize({ width: 1600, height: 1200 });
await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
await page.goto(pathToFileURL(compositePath).href);
await page.evaluate(() => document.fonts.ready);
await page.evaluate(async () => {
  await Promise.all(
    [...document.images].map((image) =>
      image.complete
        ? Promise.resolve()
        : new Promise((resolve) => {
            image.addEventListener("load", resolve, { once: true });
            image.addEventListener("error", resolve, { once: true });
          }),
    ),
  );
});
await page.locator(".compare").screenshot({ path: path.join(outDir, "before-after.png") });
console.log("captured assets/readme/before-after.png");

await browser.close();

const required = [
  "before-after.png",
  "palettes.png",
  "hero-light.png",
  "hero-dark.png",
  "example-mobile.png",
];
for (const file of required) {
  const { size } = await stat(path.join(outDir, file));
  if (size < 10_000) {
    console.error(`error: ${file} looks too small (${size} bytes)`);
    process.exit(1);
  }
  console.log(`ok: ${file} ${(size / 1024).toFixed(1)} kB`);
}

const captures = (await readdir(examplesOutDir)).filter((file) => file.endsWith(".png"));
const expected = manifest.files.length * 4;
if (captures.length !== expected) {
  console.error(`error: ${captures.length} example captures; expected ${expected}`);
  process.exit(1);
}
console.log(`ok: ${captures.length} example captures (two palettes × light/dark)`);
