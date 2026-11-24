/**
 * Geometry guard for the examples: 4px grid, diagonal lines, path bounds,
 * node masks, label masks over later nodes, markers, edge labels, and budgets.
 * It is intentionally conservative: it checks the contracts this repository
 * promises, not every SVG in the world.
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const errors = [];

const examples = (await readdir(path.join(root, "examples")))
  .filter((file) => file.endsWith(".html"))
  .sort();

function attr(tag, name) {
  return tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
}

function number(tag, name, fallback = null) {
  const raw = attr(tag, name);
  if (raw == null) return fallback;
  if (raw.includes("%")) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function onGrid(value) {
  return Number.isInteger(value) && value % 4 === 0;
}

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function walkPath(d, file) {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+/g) ?? [];
  let command = "";
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;
  let index = 0;
  const points = [];
  const read = () => Number(tokens[index++]);
  const push = (px, py) => points.push([px, py]);

  while (index < tokens.length) {
    if (/^[a-zA-Z]$/.test(tokens[index])) {
      command = tokens[index++];
      if (command === "Z" || command === "z") {
        x = startX;
        y = startY;
      }
      continue;
    }

    const relative = command === command.toLowerCase();
    switch (command.toLowerCase()) {
      case "m": {
        const nx = read();
        const ny = read();
        x = relative ? x + nx : nx;
        y = relative ? y + ny : ny;
        startX = x;
        startY = y;
        push(x, y);
        command = relative ? "l" : "L";
        break;
      }
      case "l": {
        const nx = read();
        const ny = read();
        if (nx !== 0 && ny !== 0) errors.push(`${file}: diagonal L segment (${nx}, ${ny})`);
        x = relative ? x + nx : nx;
        y = relative ? y + ny : ny;
        push(x, y);
        break;
      }
      case "h": {
        const nx = read();
        x = relative ? x + nx : nx;
        push(x, y);
        break;
      }
      case "v": {
        const ny = read();
        y = relative ? y + ny : ny;
        push(x, y);
        break;
      }
      case "q": {
        const cx = read();
        const cy = read();
        const ex = read();
        const ey = read();
        const ax = relative ? x + cx : cx;
        const ay = relative ? y + cy : cy;
        const bx = relative ? x + ex : ex;
        const by = relative ? y + ey : ey;
        push(ax, ay);
        push(bx, by);
        x = bx;
        y = by;
        break;
      }
      case "s": {
        const cx = read();
        const cy = read();
        const ex = read();
        const ey = read();
        const ax = relative ? x + cx : cx;
        const ay = relative ? y + cy : cy;
        const bx = relative ? x + ex : ex;
        const by = relative ? y + ey : ey;
        push(ax, ay);
        push(bx, by);
        x = bx;
        y = by;
        break;
      }
      case "c": {
        const c1x = read();
        const c1y = read();
        const c2x = read();
        const c2y = read();
        const ex = read();
        const ey = read();
        const ax = relative ? x + c1x : c1x;
        const ay = relative ? y + c1y : c1y;
        const bx = relative ? x + c2x : c2x;
        const by = relative ? y + c2y : c2y;
        const dx = relative ? x + ex : ex;
        const dy = relative ? y + ey : ey;
        push(ax, ay);
        push(bx, by);
        push(dx, dy);
        x = dx;
        y = dy;
        break;
      }
      case "a": {
        read();
        read();
        read();
        read();
        read();
        const ex = read();
        const ey = read();
        x = relative ? x + ex : ex;
        y = relative ? y + ey : ey;
        push(x, y);
        break;
      }
      default:
        index += 1;
    }

    if (!onGrid(x) || !onGrid(y)) errors.push(`${file}: path point ${x},${y} is off the 4px grid`);
  }

  return points;
}

for (const file of examples) {
  const source = await readFile(path.join(root, "examples", file), "utf8");
  const svg = source.match(/<svg\b[^>]*class="[^"]*\bdiagram\b[^"]*"[^>]*>[\s\S]*?<\/svg>/i)?.[0] ?? "";
  if (!svg) {
    errors.push(`${file}: no SVG`);
    continue;
  }
  const viewBox = svg.match(/viewBox="0 0 ([0-9]+) ([0-9]+)"/);
  if (!viewBox) {
    errors.push(`${file}: no usable viewBox`);
    continue;
  }
  const width = Number(viewBox[1]);
  const height = Number(viewBox[2]);

  if (svg.includes("transform=")) errors.push(`${file}: transform attribute in SVG; draw in place`);

  const nodeBounds = [];
  const labels = [];

  for (const match of svg.matchAll(/<rect\b[^>]*>/g)) {
    const tag = match[0];
    const x = number(tag, "x", null);
    const y = number(tag, "y", null);
    const w = number(tag, "width", null);
    const h = number(tag, "height", null);
    if (x == null || y == null || w == null || h == null) continue;
    for (const [name, value] of [["x", x], ["y", y], ["width", w], ["height", h]]) {
      if (!onGrid(value)) errors.push(`${file}: rect ${name}=${value} is off the 4px grid`);
    }
    if (x < 0 || y < 0 || x + w > width || y + h > height) {
      errors.push(`${file}: rect ${x},${y} ${w}×${h} leaves the viewBox`);
    }
    const rx = number(tag, "rx", null);
    if (rx != null && rx > 8) errors.push(`${file}: rect rx=${rx} is above 8px`);
    const cls = attr(tag, "class") ?? "";
    if (/\bnode-box\b|\bentity-head\b/.test(cls)) {
      nodeBounds.push({ x, y, w, h, label: cls });
    }
    if (/\blabel-mask\b/.test(cls)) labels.push({ x, y, w, h });
  }

  for (const match of svg.matchAll(/<polygon\b[^>]*>/g)) {
    const tag = match[0];
    const polygonClass = attr(tag, "class") ?? "";
    if (polygonClass.includes("marker")) continue;
    const points = attr(tag, "points") ?? "";
    const values = [...points.matchAll(/-?\d*\.?\d+/g)].map((m) => Number(m[0]));
    for (const value of values) {
      if (!onGrid(value)) errors.push(`${file}: polygon point ${value} is off the 4px grid`);
    }
    const xs = values.filter((_, index) => index % 2 === 0);
    const ys = values.filter((_, index) => index % 2 === 1);
    if (Math.min(...xs) < 0 || Math.min(...ys) < 0 || Math.max(...xs) > width || Math.max(...ys) > height) {
      errors.push(`${file}: polygon leaves the viewBox`);
    }
    if (polygonClass.split(/\s+/).includes("node-box")) {
      nodeBounds.push({
        x: Math.min(...xs),
        y: Math.min(...ys),
        w: Math.max(...xs) - Math.min(...xs),
        h: Math.max(...ys) - Math.min(...ys),
        label: "node-box polygon",
      });
    }
  }

  for (const match of svg.matchAll(/<line\b[^>]*>/g)) {
    const tag = match[0];
    const x1 = number(tag, "x1", null);
    const y1 = number(tag, "y1", null);
    const x2 = number(tag, "x2", null);
    const y2 = number(tag, "y2", null);
    if ([x1, y1, x2, y2].some((value) => value == null)) continue;
    if (x1 !== x2 && y1 !== y2) errors.push(`${file}: diagonal <line> from ${x1},${y1} to ${x2},${y2}`);
    for (const [name, value] of [["x1", x1], ["y1", y1], ["x2", x2], ["y2", y2]]) {
      if (!onGrid(value)) errors.push(`${file}: line ${name}=${value} is off the 4px grid`);
    }
    if (Math.min(x1, x2) < 0 || Math.min(y1, y2) < 0 || Math.max(x1, x2) > width || Math.max(y1, y2) > height) {
      errors.push(`${file}: line leaves the viewBox`);
    }
  }

  for (const match of svg.matchAll(/<path\b[^>]*>/g)) {
    const d = attr(match[0], "d");
    if (!d) continue;
    const points = walkPath(d, file);
    const xs = points.map((point) => point[0]);
    const ys = points.map((point) => point[1]);
    if (xs.length === 0 || Math.min(...xs) < 0 || Math.min(...ys) < 0 || Math.max(...xs) > width || Math.max(...ys) > height) {
      errors.push(`${file}: path leaves the viewBox`);
    }
  }

  for (const match of svg.matchAll(/<circle\b[^>]*>/g)) {
    const tag = match[0];
    const cx = number(tag, "cx", null);
    const cy = number(tag, "cy", null);
    const r = number(tag, "r", null);
    if ([cx, cy, r].some((value) => value == null)) continue;
    if (cx - r < 0 || cy - r < 0 || cx + r > width || cy + r > height) {
      errors.push(`${file}: circle leaves the viewBox`);
    }
  }

  const textSizes = {
    "node-name": 13,
    "node-tech": 9,
    "node-tag": 8,
    "edge-label": 8,
    "zone-label": 8,
    "axis-label": 8,
    "field-name": 10,
    "field-type": 8,
    "field-key": 8,
    "legend-label": 8,
    "legend-item-text": 8,
    "annotation": 14,
    "quad-label": 11,
    "quad-label--focal": 12,
    "quad-corner": 8,
  };

  for (const match of svg.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)) {
    const attributes = match[1];
    const content = match[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (!content) continue;
    const classes = (attr(`<text ${attributes}>`, "class") ?? "").split(/\s+/);
    const size = classes.map((name) => textSizes[name]).find(Boolean);
    if (!size) continue;
    const x = number(`<text ${attributes}>`, "x", 0);
    const anchor = attr(`<text ${attributes}>`, "text-anchor") ?? "start";
    const isMono = classes.some((name) => /tech|tag|label|field|legend|axis|quad-corner/.test(name));
    const isSerif = classes.includes("annotation");
    const estimated = content.length * size * (isSerif ? 0.5 : isMono ? 0.62 : 0.6);
    if (anchor === "middle") {
      if (x - estimated / 2 < 8 || x + estimated / 2 > width - 8) {
        errors.push(`${file}: text "${content}" leaves the viewBox horizontally`);
      }
    } else if (anchor === "end") {
      if (x - estimated < 8) errors.push(`${file}: text "${content}" leaves the viewBox horizontally`);
    } else if (x + estimated > width - 8) {
      errors.push(`${file}: text "${content}" leaves the viewBox horizontally`);
    }
  }

  for (const group of svg.matchAll(/<g\b[^>]*class="[^"]*\bnode\b[^"]*"[^>]*>[\s\S]*?<\/g>/g)) {
    const body = group[0];
    const mask = body.indexOf("node-mask");
    const box = body.indexOf("node-box");
    if (mask < 0) errors.push(`${file}: a .node group has no node-mask`);
    if (box < 0) errors.push(`${file}: a .node group has no node-box`);
    if (mask >= 0 && box >= 0 && mask > box) errors.push(`${file}: node-mask must precede node-box`);
  }

  for (const group of svg.matchAll(/<g\b[^>]*class="[^"]*edge-label-group[^"]*"[^>]*>[\s\S]*?<\/g>/g)) {
    const body = group[0];
    if (!body.includes("label-mask")) errors.push(`${file}: edge label has no label-mask`);
    const label = body.match(/<text[^>]*class="[^"]*edge-label[^"]*"[^>]*>([\s\S]*?)<\/text>/)?.[1] ?? "";
    if (label.trim().length > 14) errors.push(`${file}: edge label "${label.trim()}" is longer than 14 characters`);
  }

  for (const label of labels) {
    for (const node of nodeBounds) {
      if (overlap(label, node)) {
        errors.push(`${file}: a label mask overlaps a node box (${node.label})`);
      }
    }
  }

  const markerRefs = new Set([...svg.matchAll(/url\(#([a-z0-9-]+)\)/g)].map((m) => m[1]));
  const markerIds = new Set([...svg.matchAll(/<marker\b[^>]*id="([a-z0-9-]+)"/g)].map((m) => m[1]));
  for (const ref of markerRefs) {
    if (!markerIds.has(ref)) errors.push(`${file}: marker #${ref} is referenced but not defined`);
  }

  const nodes = (svg.match(/data-node=/g) ?? []).length + (svg.match(/data-item=/g) ?? []).length;
  let edges = 0;
  let accents = 0;
  for (const match of svg.matchAll(/<(?:line|path)\b[^>]*class="([^"]*)"[^>]*>/g)) {
    const tokens = match[1].split(/\s+/);
    if (tokens.includes("edge")) edges += 1;
  }
  for (const match of svg.matchAll(/class="([^"]*)"/g)) {
    const tokens = match[1].split(/\s+/);
    for (const token of tokens) {
      if (["node-box--focal", "edge--accent", "dot--focal", "entity-head--focal"].includes(token)) {
        accents += 1;
      }
    }
  }
  accents += [...svg.matchAll(/data-focus="true"/g)].length;

  if (nodes > 9) errors.push(`${file}: ${nodes} semantic nodes, budget is 9`);
  if (edges > 12) errors.push(`${file}: ${edges} edges, budget is 12`);
  if (accents > 2) errors.push(`${file}: ${accents} accents, budget is 2`);
}

if (errors.length > 0) {
  for (const error of new Set(errors)) console.error(`error: ${error}`);
  console.error(`\n${new Set(errors).size} geometry error(s)`);
  process.exit(1);
}

console.log("ok: grid, bounds, orthogonal lines, node masks, label masks, markers, budgets");
