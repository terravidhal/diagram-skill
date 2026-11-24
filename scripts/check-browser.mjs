/**
 * Browser guard: every example is opened in Chromium in light and dark, with
 * reduced motion, and checked for console/page errors, network requests,
 * invisible text, clipped text, overflow, and the complete static frame.
 * Animated files are then opened with motion enabled to prove the CSS/SVG
 * animation exists, and re-checked with data-static and print.
 *
 * Dev-only. The published diagrams never load this script or Playwright.
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { launchBrowser } from "./browser.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const examplesDir = path.join(root, "examples");
const manifest = JSON.parse(await readFile(path.join(examplesDir, "manifest.json"), "utf8"));
const files = (await readdir(examplesDir)).filter((file) => file.endsWith(".html")).sort();

const errors = [];
const warnings = [];

const browser = await launchBrowser();
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});

let consoleErrors = [];
let pageErrors = [];
let failedRequests = [];
let externalRequests = [];

page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => pageErrors.push(error.message));
page.on("requestfailed", (request) => failedRequests.push(`${request.url()} ${request.failure()?.errorText ?? ""}`));
page.on("request", (request) => {
  const url = request.url();
  if (!url.startsWith("file:") && !url.startsWith("data:") && !url.startsWith("blob:")) {
    externalRequests.push(url);
  }
});

function resetSignals() {
  consoleErrors = [];
  pageErrors = [];
  failedRequests = [];
  externalRequests = [];
}

async function collect(file, theme, { reducedMotion = "reduce", staticFrame = true } = {}) {
  resetSignals();
  await page.emulateMedia({ colorScheme: theme, reducedMotion, media: "screen" });
  await page.goto(pathToFileURL(path.join(examplesDir, file)).href, { waitUntil: "load" });
  await page.evaluate(
    ({ theme, staticFrame }) => {
      document.documentElement.dataset.theme = theme;
      if (staticFrame) document.documentElement.dataset.static = "true";
      else delete document.documentElement.dataset.static;
    },
    { theme, staticFrame },
  );
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(() => {
    const rootStyle = getComputedStyle(document.documentElement);
    const bodyStyle = getComputedStyle(document.body);
    const svg = document.querySelector("svg.diagram");
    const title = svg?.querySelector("title")?.textContent?.trim() ?? "";
    const desc = svg?.querySelector("desc")?.textContent?.trim() ?? "";
    const texts = [...(svg?.querySelectorAll("text") ?? [])];
    const invisible = [];
    const outside = [];
    const tiny = [];
    const viewBox = svg?.viewBox?.baseVal;
    for (const text of texts) {
      const style = getComputedStyle(text);
      const opacity = Number(style.opacity);
      if (style.display === "none" || style.visibility === "hidden" || opacity < 0.99) {
        invisible.push(`${text.textContent?.trim() || "(empty)"} [${style.display},${style.visibility},${opacity}]`);
      }
      const size = Number.parseFloat(style.fontSize);
      if (Number.isFinite(size) && size < 7.5) tiny.push(`${text.textContent?.trim()} ${size}px`);
      if (viewBox && viewBox.width > 0) {
        try {
          const box = text.getBBox();
          if (
            box.x < -0.6 ||
            box.y < -0.6 ||
            box.x + box.width > viewBox.width + 0.6 ||
            box.y + box.height > viewBox.height + 0.6
          ) {
            outside.push(
              `${text.textContent?.trim()} [${box.x.toFixed(1)},${box.y.toFixed(1)},${(box.x + box.width).toFixed(1)},${(box.y + box.height).toFixed(1)}]`,
            );
          }
        } catch {
          // getBBox can fail for hidden text; the visibility check already reports it.
        }
      }
    }
    const animations = document.getAnimations().map((animation) => ({
      name: animation.animationName ?? "",
      state: animation.playState,
    }));
    const running = animations.filter((animation) => animation.state === "running" || animation.state === "pending");
    return {
      theme: document.documentElement.dataset.theme,
      palette: document.documentElement.dataset.palette,
      paper: rootStyle.getPropertyValue("--paper").trim(),
      ink: rootStyle.getPropertyValue("--ink").trim(),
      bodyBackground: bodyStyle.backgroundColor,
      bodyColor: bodyStyle.color,
      textCount: texts.length,
      markCount: svg?.querySelectorAll(".node, .entity, .dot, .bar, .cell, .field-name").length ?? 0,
      edgeCount: svg?.querySelectorAll(".edge").length ?? 0,
      title,
      desc,
      role: svg?.getAttribute("role"),
      labelledBy: svg?.getAttribute("aria-labelledby"),
      invisible,
      outside,
      tiny,
      running: running.map((animation) => animation.name),
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    };
  });
}

function expect(condition, message) {
  if (!condition) errors.push(message);
}

for (const file of files) {
  const mobile = file.startsWith("architecture-mobile");
  await page.setViewportSize({ width: mobile ? 390 : 1440, height: mobile ? 760 : 1000 });
  for (const theme of ["light", "dark"]) {
    const result = await collect(file, theme);
    const tag = `${file} [${theme}]`;
    for (const message of consoleErrors) errors.push(`${tag}: console error: ${message}`);
    for (const message of pageErrors) errors.push(`${tag}: page error: ${message}`);
    for (const message of failedRequests) errors.push(`${tag}: failed request: ${message}`);
    for (const message of externalRequests) errors.push(`${tag}: external request: ${message}`);
    expect(result.textCount > 0, `${tag}: no SVG text`);
    expect(result.markCount > 0, `${tag}: no diagram marks`);
    expect(result.title.length > 0 && result.title.length <= 60, `${tag}: bad title length`);
    expect(result.desc.length > 0, `${tag}: empty desc`);
    expect(result.role === "img", `${tag}: SVG role is not img`);
    expect(Boolean(result.labelledBy), `${tag}: SVG has no aria-labelledby`);
    expect(result.paper.length > 0 && result.ink.length > 0, `${tag}: theme tokens did not resolve`);
    expect(result.bodyBackground !== "rgba(0, 0, 0, 0)", `${tag}: transparent body background`);
    expect(result.bodyColor !== result.bodyBackground, `${tag}: body ink equals paper`);
    expect(result.invisible.length === 0, `${tag}: invisible text: ${result.invisible.join("; ")}`);
    expect(result.outside.length === 0, `${tag}: text outside the viewBox: ${result.outside.join("; ")}`);
    expect(result.tiny.length === 0, `${tag}: text below 7.5px: ${result.tiny.join("; ")}`);
    expect(result.running.length === 0, `${tag}: reduced/static frame still animates: ${result.running.join(", ")}`);
    const width = file.startsWith("architecture-mobile") ? 390 : 1440;
    expect(result.scrollWidth <= width + 1, `${tag}: horizontal overflow ${result.scrollWidth} > ${width}`);
  }
}

const animated = manifest.files.filter((diagram) => diagram.mode !== "none");
for (const diagram of animated) {
  const file = `${diagram.slug}-${diagram.palettes[0]}.html`;
  await page.setViewportSize({ width: 1440, height: 1000 });
  const live = await collect(file, "light", { reducedMotion: "no-preference", staticFrame: false });
  expect(live.running.length > 0, `${file}: ${diagram.mode} animation is not running`);

  const frozen = await collect(file, "light", { reducedMotion: "no-preference", staticFrame: true });
  expect(frozen.running.length === 0, `${file}: data-static does not freeze: ${frozen.running.join(", ")}`);
  expect(frozen.invisible.length === 0, `${file}: static frame has invisible text`);

  await page.emulateMedia({ colorScheme: "light", reducedMotion: "no-preference", media: "print" });
  await page.goto(pathToFileURL(path.join(examplesDir, file)).href);
  await page.evaluate(() => document.fonts.ready);
  const print = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length);
  expect(print === 0, `${file}: print media still animates`);

  warnings.push(`${file}: ${diagram.mode} runs live and freezes for static/print/reduced motion`);
}

await browser.close();

if (errors.length > 0) {
  for (const error of new Set(errors)) console.error(`error: ${error}`);
  console.error(`\n${new Set(errors).size} browser error(s)`);
  process.exit(1);
}

console.log(`ok: ${files.length} files × light/dark, no console errors, no network, static frame complete`);
console.log(`ok: ${animated.length} animated files run live and freeze for static, print, and reduced motion`);
