/**
 * Motion guard: declaration, order, budgets, draw markers, focus target,
 * flow edges, reduced motion, print, static frame, and the absence of script.
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const errors = [];

const examples = (await readdir(path.join(root, "examples")))
  .filter((file) => file.endsWith(".html"))
  .sort();

const modes = new Set(["none", "draw", "reveal", "flow", "focus", "combo"]);

for (const file of examples) {
  let source;
  try {
    source = await readFile(path.join(root, "examples", file), "utf8");
  } catch {
    errors.push(`${file}: missing`);
    continue;
  }
  const svg = source.match(/<svg\b[^>]*class="[^"]*\bdiagram\b[^"]*"[^>]*>[\s\S]*?<\/svg>/i)?.[0] ?? "";
  if (!svg) {
    errors.push(`${file}: no SVG`);
    continue;
  }

  if (/<script\b/i.test(source)) errors.push(`${file}: contains a script; motion must be CSS/SVG only`);
  if (!source.includes("prefers-reduced-motion: reduce")) errors.push(`${file}: no reduced-motion rule`);
  if (!source.includes("@media print")) errors.push(`${file}: no print rule`);
  if (!source.includes('[data-static="true"]')) errors.push(`${file}: no static frame rule`);

  const mode = svg.match(/data-animate="([a-z]+)"/)?.[1];
  if (!mode) {
    errors.push(`${file}: no data-animate`);
    continue;
  }
  if (!modes.has(mode)) {
    errors.push(`${file}: unknown mode ${mode}`);
    continue;
  }

  const orders = [...svg.matchAll(/--order:\s*(\d+)/g)].map((match) => Number(match[1]));
  if (mode === "draw" || mode === "reveal" || mode === "combo") {
    if (orders.length === 0) errors.push(`${file}: ${mode} mode has no --order`);
    if (orders.length > 12) errors.push(`${file}: ${orders.length} animated items, budget is 12`);
    for (const order of orders) {
      if (order > 7) errors.push(`${file}: --order ${order} is above 7`);
    }
    const unique = new Set(orders);
    if (unique.size > 8) errors.push(`${file}: ${unique.size} animated steps, budget is 8`);
    const sorted = [...unique].sort((a, b) => a - b);
    sorted.forEach((order, index) => {
      if (order !== index) errors.push(`${file}: --order values must be contiguous from 0`);
    });
    for (const order of unique) {
      const count = orders.filter((value) => value === order).length;
      if (count > 2) errors.push(`${file}: ${count} items share order ${order}, budget is 2`);
    }
    const stagger = Number(source.match(/--stagger:\s*(\d+)ms/)?.[1] ?? 160);
    const duration = Number(source.match(/--dur:\s*(\d+)ms/)?.[1] ?? 700);
    const total = Math.max(...orders) * stagger + duration;
    if (total > 8000) errors.push(`${file}: animation totals ${total}ms, budget is 8000ms`);
  }

  if (mode === "draw" || mode === "combo") {
    for (const match of svg.matchAll(/<(?:line|path)\b[^>]*class="([^"]*)"[^>]*>/g)) {
      const tag = match[0];
      const classes = match[1];
      if (!/\bedge\b/.test(classes)) continue;
      if (/edge--dashed/.test(classes)) continue;
      if (!/\bpathLength="1"/.test(tag)) {
        errors.push(`${file}: a drawn edge has no pathLength="1"`);
      }
    }
  }

  if (mode === "focus") {
    const focused = [...svg.matchAll(/data-focus="true"/g)].length;
    if (focused !== 1) errors.push(`${file}: focus mode needs exactly one data-focus="true", found ${focused}`);
    if (!svg.includes("focus-halo")) errors.push(`${file}: focus mode has no focus-halo`);
  }

  if (mode === "flow") {
    const flowEdges = [...svg.matchAll(/data-flow="true"/g)].length;
    if (flowEdges === 0) errors.push(`${file}: flow mode has no data-flow="true" edge`);
    const flowDuration = Number(source.match(/--flow-dur:\s*(\d+)s/)?.[1] ?? 4);
    if (flowDuration < 3) errors.push(`${file}: flow loop is ${flowDuration}s, minimum is 3s`);
  }

  if (mode === "none" && orders.length > 0) {
    errors.push(`${file}: static mode still declares --order`);
  }
}

if (errors.length > 0) {
  for (const error of new Set(errors)) console.error(`error: ${error}`);
  console.error(`\n${new Set(errors).size} motion error(s)`);
  process.exit(1);
}

console.log("ok: motion modes, order, budgets, draw markers, focus/flow targets, static frame");
