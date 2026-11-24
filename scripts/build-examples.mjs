/**
 * Assemble the self-contained examples from examples/src and the shared sheets.
 *
 * Each source declares two palettes in a `<!-- variants: one, two -->` comment.
 * The build writes one standalone HTML file per palette and leaves the theme at
 * `auto`, so the same file follows the operating system and can be forced light
 * or dark at capture or export time. The generated files are checked in; this
 * script only removes copy-paste drift.
 */
import { readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const check = process.argv.includes("--check");
const root = fileURLToPath(new URL("..", import.meta.url));
const srcDir = path.join(root, "examples/src");
const outDir = path.join(root, "examples");
const expected = new Set();

const themes = await readFile(path.join(root, "skills/diagramforge/assets/themes.css"), "utf8");
const base = await readFile(path.join(srcDir, "_base.css"), "utf8");
const motion = await readFile(path.join(root, "skills/diagramforge/assets/motion.css"), "utf8");

const files = (await readdir(srcDir)).filter((file) => file.endsWith(".html")).sort();

if (files.length < 12) {
  console.error(`error: ${files.length} sources; the public set needs at least 12 diagrams`);
  process.exit(1);
}

if (!check) {
  for (const file of await readdir(outDir)) {
    if (file.endsWith(".html")) await rm(path.join(outDir, file));
  }
}

const manifest = [];
const stale = [];

for (const file of files) {
  const source = await readFile(path.join(srcDir, file), "utf8");
  const variants = source.match(/<!--\s*variants:\s*([a-z0-9,\s-]+)\s*-->/i)?.[1]
    ?.split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  if (!variants || variants.length !== 2) {
    console.error(`error: ${file} must declare exactly two palettes, e.g. <!-- variants: ocean, sand -->`);
    process.exit(1);
  }
  if (!source.includes("@@PALETTE@@")) {
    console.error(`error: ${file} has no @@PALETTE@@ placeholder`);
    process.exit(1);
  }

  const slug = path.basename(file, ".html");
  const mode = source.match(/data-animate="([a-z]+)"/)?.[1] ?? "none";
  const title = source.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]?.trim() ?? slug;

  for (const palette of variants) {
    const built = source
      .replace("/* @@THEMES@@ */", themes.trim())
      .replace("/* @@BASE@@ */", base.trim())
      .replace("/* @@MOTION@@ */", motion.trim())
      .replaceAll("@@PALETTE@@", palette);
    if (built.includes("@@")) {
      console.error(`error: ${file} still contains a placeholder`);
      process.exit(1);
    }
    if (/[A-Z]/.test(palette)) {
      console.error(`error: ${file} palette "${palette}" must be lowercase`);
      process.exit(1);
    }
    const output = `${slug}-${palette}.html`;
    expected.add(output);
    if (check) {
      let current = null;
      try {
        current = await readFile(path.join(outDir, output), "utf8");
      } catch {
        // Reported as stale below.
      }
      if (current !== built) stale.push(`examples/${output}`);
    } else {
      await writeFile(path.join(outDir, output), built);
      console.log(`built examples/${output}`);
    }
  }

  manifest.push({ slug, title, mode, palettes: variants });
}

const manifestBody = `${JSON.stringify({ diagrams: manifest.length, variants: manifest.length * 2, files: manifest }, null, 2)}\n`;

if (check) {
  const currentFiles = (await readdir(outDir)).filter((file) => file.endsWith(".html"));
  for (const file of currentFiles) {
    if (!expected.has(file)) stale.push(`examples/${file} (no source)`);
  }
  let currentManifest = null;
  try {
    currentManifest = await readFile(path.join(outDir, "manifest.json"), "utf8");
  } catch {
    // Reported as stale below.
  }
  if (currentManifest !== manifestBody) stale.push("examples/manifest.json");

  if (stale.length > 0) {
    for (const file of stale) console.error(`error: ${file} is out of date; run npm run lint:examples`);
    process.exit(1);
  }
  console.log(`ok: ${files.length * 2} generated example files match examples/src`);
} else {
  await writeFile(path.join(outDir, "manifest.json"), manifestBody);
  console.log(`ok: ${files.length} diagram(s), ${files.length * 2} variant file(s)`);
}
