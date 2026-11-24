/**
 * Dev-only Playwright loader. The published diagrams never depend on it.
 * A cached Chromium from another Playwright revision is enough for captures.
 */
import { access, readdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

async function loadChromium() {
  const candidates = [];
  if (process.env.PLAYWRIGHT_MODULE) candidates.push(path.resolve(process.env.PLAYWRIGHT_MODULE));
  candidates.push("playwright");

  for (const candidate of candidates) {
    try {
      const specifier = candidate === "playwright" ? candidate : pathToFileURL(candidate).href;
      const module = await import(specifier);
      const chromium = module.chromium ?? module.default?.chromium;
      if (chromium) return chromium;
    } catch {
      // Try the next candidate.
    }
  }

  throw new Error(
    "Playwright is not installed. Run: npm install -D playwright && npx playwright install chromium",
  );
}

async function cachedChrome() {
  if (process.env.DIAGRAMFORGE_CHROME) return process.env.DIAGRAMFORGE_CHROME;
  const base = path.join(os.homedir(), ".cache", "ms-playwright");
  let entries = [];
  try {
    entries = await readdir(base);
  } catch {
    return null;
  }
  const candidates = entries
    .filter((name) => name.startsWith("chromium-"))
    .sort()
    .reverse()
    .flatMap((name) => [
      path.join(base, name, "chrome-linux64", "chrome"),
      path.join(base, name, "chrome-linux", "chrome"),
    ]);
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next cached build.
    }
  }
  return null;
}

export async function launchBrowser() {
  const chromium = await loadChromium();
  const executablePath = await cachedChrome();
  return chromium.launch(executablePath ? { headless: true, executablePath } : { headless: true });
}
