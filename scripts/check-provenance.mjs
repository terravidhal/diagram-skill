/**
 * Provenance guard: the working clone in ref/ must never contribute a file or
 * a copied passage to the published tree. Method study is allowed; copied
 * expression is not.
 *
 * The check is skipped when ref/ is absent, which is the normal state for a
 * published clone. It is local-only, like the study itself.
 *
 * What is compared:
 * - every text file, byte for byte, against every ref file;
 * - prose only (Markdown, with code, markup, links, and frontmatter removed),
 *   paragraph by paragraph, and as shared 12-word runs. Markup and generic SVG
 *   attribute sequences are deliberately outside this check: the drawings are
 *   authored here, and a marker polygon is not a paragraph.
 */
import { createHash } from "node:crypto";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const refDir = path.join(root, "ref");
const errors = [];

const ownSkipDirs = new Set([".git", "node_modules", "ref", "preview", "tmp", ".vague"]);
const textSkipDirs = new Set([...ownSkipDirs, "assets"]);
const textExtensions = new Set([".md", ".html", ".css", ".mjs", ".js", ".json", ".yml", ".yaml", ".txt", ".svg"]);
const skipNames = new Set(["LICENSE", "package-lock.json"]);

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

if (!(await exists(refDir))) {
  console.log("skip: ref/ is absent; provenance check runs only in the study workspace");
  process.exit(0);
}

async function walk(directory, relative = "", skip = ownSkipDirs) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const child = path.join(directory, entry.name);
    const childRelative = path.join(relative, entry.name);
    if (entry.isDirectory()) {
      if (skip.has(entry.name)) continue;
      output.push(...(await walk(child, childRelative, skip)));
    } else if (entry.isFile()) {
      output.push(childRelative);
    }
  }
  return output;
}

function digest(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function isText(file) {
  return textExtensions.has(path.extname(file).toLowerCase()) && !skipNames.has(path.basename(file));
}

function normalize(text) {
  return text.replace(/\r\n?/g, "\n").replace(/[ \t]+$/gm, "").trim();
}

function prose(text) {
  let output = text;
  output = output.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, " ");
  output = output.replace(/```[\s\S]*?```/g, " ");
  output = output.replace(/`[^`\n]*`/g, " ");
  output = output.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1");
  output = output.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  output = output.replace(/<[^>]+>/g, " ");
  output = output.replace(/https?:\/\/\S+/g, " ");
  return normalize(output);
}

function words(text) {
  return (text.toLowerCase().match(/[a-zà-öø-ÿ0-9]+/gi) ?? []).map((word) => word.toLowerCase());
}

const refAllFiles = await walk(refDir, "", new Set([".git"]));
const ownAllFiles = await walk(root, "", ownSkipDirs);
const refTextFiles = refAllFiles.filter(isText);
const ownTextFiles = (await walk(root, "", textSkipDirs)).filter(isText);

const refHashes = new Map();
for (const file of refAllFiles) {
  const buffer = await readFile(path.join(refDir, file));
  if (buffer.length === 0) continue;
  const hash = digest(buffer);
  if (!refHashes.has(hash)) refHashes.set(hash, file);
}
for (const file of ownAllFiles) {
  const buffer = await readFile(path.join(root, file));
  if (buffer.length === 0) continue;
  const match = refHashes.get(digest(buffer));
  if (match) errors.push(`${file}: byte-identical to ref/${match}`);
}

const refContents = new Map();
for (const file of refTextFiles) {
  refContents.set(file, await readFile(path.join(refDir, file), "utf8"));
}

const refProse = refTextFiles.filter((file) => file.endsWith(".md")).map((file) => prose(refContents.get(file)));
const refParagraphs = new Set();
for (const text of refProse) {
  for (const paragraph of text.split(/\n\s*\n/)) {
    const clean = paragraph.trim();
    if (clean.length >= 160 && words(clean).length >= 20) refParagraphs.add(clean);
  }
}

function sharedRuns(ownText, length) {
  const refShingles = new Set();
  for (const text of refProse) {
    const list = words(text);
    for (let index = 0; index + length <= list.length; index += 1) {
      refShingles.add(list.slice(index, index + length).join(" "));
    }
  }
  const shared = [];
  const list = words(ownText);
  for (let index = 0; index + length <= list.length; index += 1) {
    const shingle = list.slice(index, index + length).join(" ");
    if (refShingles.has(shingle)) shared.push(shingle);
  }
  return [...new Set(shared)];
}

let longest = 0;

for (const file of ownTextFiles) {
  const text = await readFile(path.join(root, file), "utf8");

  if (!file.endsWith(".md")) continue;
  const ownProse = prose(text);

  for (const paragraph of ownProse.split(/\n\s*\n/)) {
    const clean = paragraph.trim();
    if (refParagraphs.has(clean)) errors.push(`${file}: paragraph copied from ref/`);
  }

  for (const length of [30, 24, 20, 18, 16, 14, 12]) {
    const shared = sharedRuns(ownProse, length);
    if (shared.length === 0) continue;
    longest = Math.max(longest, length);
    for (const run of shared) errors.push(`${file}: shared ${length}-word prose run: "${run}"`);
  }
}

if (errors.length > 0) {
  for (const error of new Set(errors)) console.error(`error: ${error}`);
  console.error(`\n${new Set(errors).size} provenance error(s)`);
  process.exit(1);
}

console.log(
  `ok: ${ownAllFiles.length} files (all bytes) and ${ownTextFiles.length} text files; ` +
    `no identical ref file, no copied paragraph, no shared 12-word prose run` +
    (longest > 0 ? ` (longest shared run: ${longest} words)` : ""),
);
