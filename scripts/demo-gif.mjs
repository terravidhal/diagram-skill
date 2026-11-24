/**
 * Dev-only animation demo: capture three live examples with Playwright, then
 * assemble a short GIF with ffmpeg. Nothing in the published diagrams depends
 * on either tool.
 */
import { execFile } from "node:child_process";
import { mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { launchBrowser } from "./browser.mjs";

const run = promisify(execFile);
const root = fileURLToPath(new URL("..", import.meta.url));
const frameDir = path.join(root, "preview/demo");
const outFile = path.join(root, "assets/demo.gif");
const ffmpeg = process.env.FFMPEG ?? "ffmpeg";
const ffprobe = process.env.FFPROBE ?? "ffprobe";

await rm(frameDir, { recursive: true, force: true });
await mkdir(frameDir, { recursive: true });

const browser = await launchBrowser();
const page = await browser.newPage({
  viewport: { width: 1200, height: 1000 },
  deviceScaleFactor: 1,
  reducedMotion: "no-preference",
});

const clips = [
  { file: "sequence-paper.html", scheme: "light", label: "draw" },
  { file: "timeline-sand.html", scheme: "light", label: "reveal" },
  { file: "cycle-forest.html", scheme: "light", label: "flow" },
];
const fps = 10;
const seconds = 2;
const framesPerClip = fps * seconds;

let frame = 0;
for (const clip of clips) {
  await page.emulateMedia({ colorScheme: clip.scheme, reducedMotion: "no-preference" });
  await page.goto(pathToFileURL(path.join(root, "examples", clip.file)).href);
  await page.evaluate(() => {
    document.documentElement.dataset.theme = "auto";
    delete document.documentElement.dataset.static;
    return document.fonts.ready;
  });
  for (let index = 0; index < framesPerClip; index += 1) {
    frame += 1;
    const output = path.join(frameDir, `${String(frame).padStart(4, "0")}.png`);
    await page.screenshot({ path: output });
    await page.waitForTimeout(1000 / fps);
  }
  console.log(`captured ${clip.label}: ${framesPerClip} frames`);
}

await browser.close();

await run(ffmpeg, [
  "-y",
  "-framerate", String(fps),
  "-i", path.join(frameDir, "%04d.png"),
  "-vf",
  "scale=720:600:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=160[p];[s1][p]paletteuse=dither=sierra2_4a",
  "-loop", "0",
  outFile,
]);

const { size } = await stat(outFile);
if (size < 50_000) {
  console.error(`error: assets/demo.gif looks too small (${size} bytes)`);
  process.exit(1);
}

const { stdout } = await run(ffprobe, [
  "-v", "error",
  "-count_frames",
  "-select_streams", "v:0",
  "-show_entries", "stream=nb_read_frames",
  "-of", "default=nw=1:nk=1",
  outFile,
]);
const encoded = Number(stdout.trim());
if (!Number.isFinite(encoded) || encoded < 30) {
  console.error(`error: assets/demo.gif has ${stdout.trim()} decoded frames; expected at least 30`);
  process.exit(1);
}
console.log(
  `ok: assets/demo.gif ${(size / 1024).toFixed(0)} kB, ${encoded} frames at ${fps} fps`,
);
