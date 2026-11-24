/**
 * WCAG 2.x contrast check for the eight built-in palettes plus the brand
 * example. It mirrors the color-mix percentages in assets/themes.css, so the
 * CSS and this check cannot silently drift.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const themes = await readFile(path.join(root, "skills/diagramforge/assets/themes.css"), "utf8");
const brandExample = await readFile(path.join(root, "examples/database-schema-brand.html"), "utf8");

const errors = [];
const rows = [];

function parseHex(value) {
  if (!value || !value.startsWith("#")) return null;
  const hex = value.slice(1);
  if (hex.length === 3) {
    return [0, 1, 2].map((i) => parseInt(hex[i] + hex[i], 16));
  }
  if (hex.length === 6) {
    return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  }
  return null;
}

function mix(a, b, weightA) {
  const t = weightA / 100;
  return a.map((channel, i) => Math.round(channel * t + b[i] * (1 - t)));
}

function luminance(rgb) {
  const [r, g, b] = rgb.map((channel) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function value(body, token) {
  return body.match(new RegExp(`(?:^|\\s)${token}:\\s*([^;]+);`))?.[1].trim();
}

const palettes = new Map();

for (const match of themes.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  const selector = match[1].replace(/\s+/g, " ").trim();
  if (!selector.includes(":root")) continue;
  const body = match[2];
  const paper = parseHex(value(body, "--paper"));
  const ink = parseHex(value(body, "--ink"));
  const accent = parseHex(value(body, "--accent"));
  if (!paper || !ink || !accent) continue;

  const named = selector.match(/data-palette="([a-z]+)"/)?.[1] ?? "paper";
  const dark =
    selector.includes('data-theme="dark"') ||
    selector.includes(':not([data-theme="light"])');
  const entry = palettes.get(named) ?? {};
  entry[dark ? "dark" : "light"] = { paper, ink, accent };
  palettes.set(named, entry);
}

const brand = {
  paper: parseHex(brandExample.match(/--brand-paper:\s*(#[0-9a-fA-F]{6})/)?.[1]),
  ink: parseHex(brandExample.match(/--brand-ink:\s*(#[0-9a-fA-F]{6})/)?.[1]),
  accent: parseHex(brandExample.match(/--brand-accent:\s*(#[0-9a-fA-F]{6})/)?.[1]),
};

if (brand.paper && brand.ink && brand.accent) {
  palettes.set("brand", {
    light: brand,
    dark: {
      paper: mix(brand.ink, parseHex("#05070A"), 88),
      ink: mix(brand.paper, parseHex("#FFFFFF"), 92),
      accent: mix(brand.accent, parseHex("#FFFFFF"), 72),
    },
  });
}

const expected = ["paper", "midnight", "ocean", "forest", "sand", "slate", "mono", "contrast", "brand"];
for (const name of expected) {
  const entry = palettes.get(name);
  if (!entry?.light || !entry?.dark) {
    errors.push(`palette ${name}: missing light or dark base values`);
  }
}

const status = {
  light: { ok: parseHex("#2F7A4F"), warn: parseHex("#8A5A00"), danger: parseHex("#A62F25") },
  dark: { ok: parseHex("#7FD1A0"), warn: parseHex("#F2C14E"), danger: parseHex("#FF8A7A") },
};

const series = {
  light: ["#5F7A4E", "#3F6488", "#8A642B", "#8A5238", "#5A5068"].map(parseHex),
  dark: ["#9CB48E", "#82A7CC", "#D8B074", "#D09478", "#A99BB8"].map(parseHex),
};

function check(name, mode, role, foreground, background, minimum) {
  const valueRatio = ratio(foreground, background);
  rows.push({ name, mode, role, ratio: valueRatio, minimum });
  if (valueRatio + 1e-9 < minimum) {
    errors.push(
      `${name}/${mode}: ${role} is ${valueRatio.toFixed(2)}:1, below ${minimum}:1`,
    );
  }
}

for (const [name, entry] of palettes) {
  for (const mode of ["light", "dark"]) {
    const palette = entry[mode];
    if (!palette) continue;
    const { paper, ink, accent } = palette;

    check(name, mode, "ink on paper", ink, paper, 4.5);
    check(name, mode, "muted on paper", mix(ink, paper, 72), paper, 4.5);
    check(name, mode, "soft on paper", mix(ink, paper, 67), paper, 4.5);
    check(name, mode, "accent as text", accent, paper, 4.5);
    check(name, mode, "link as text", accent, paper, 4.5);
    check(name, mode, "ink on surface", ink, mix(paper, ink, 94), 4.5);
    check(name, mode, "muted on surface", mix(ink, paper, 72), mix(paper, ink, 94), 4.5);
    check(name, mode, "soft on label mask", mix(ink, paper, 67), mix(paper, ink, 99), 4.5);
    check(name, mode, "muted on label mask", mix(ink, paper, 72), mix(paper, ink, 99), 4.5);
    check(name, mode, "ink on accent-soft", ink, mix(accent, paper, 10), 4.5);
    check(name, mode, "line-strong as a mark", mix(ink, paper, 55), paper, 3);

    for (const [key, colour] of Object.entries(status[mode])) {
      check(name, mode, `status ${key}`, colour, paper, 4.5);
    }
    series[mode].forEach((colour, index) => {
      check(name, mode, `series-${index + 1}`, colour, paper, 3);
    });
  }
}

const worst = rows
  .slice()
  .sort((a, b) => a.ratio - a.minimum - (b.ratio - b.minimum))
  .slice(0, 5);

if (errors.length > 0) {
  for (const error of errors) console.error(`error: ${error}`);
  console.error(`\n${errors.length} contrast error(s)`);
  process.exit(1);
}

console.log(
  `ok: ${rows.length} contrast pairs across ${palettes.size} palettes × 2 modes ` +
  `(lowest margin: ${worst[0].name}/${worst[0].mode} ${worst[0].role} ${worst[0].ratio.toFixed(2)}:1)`,
);
