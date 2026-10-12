// Checks the built site, not the source: run `pnpm build` first.
// Usage: node scripts/check-showcase.mjs
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const failures = [];
const fail = (msg) => failures.push(msg);

const { boards } = await import(join(root, "src/data/showcase.ts")).catch((e) => {
  fail(`src/data/showcase.ts could not be loaded: ${e.code ?? e.message}`);
  return { boards: [] };
});
if (boards.length === 0) fail("no showcase boards are defined");

const text = (v) => typeof v === "string" && v.trim().length > 0;
const list = (v) => Array.isArray(v) && v.length > 0;
const read = (p) => (existsSync(p) ? readFileSync(p, "utf8") : null);

const home = read(join(root, "dist/index.html"));
if (home === null) fail("dist/index.html missing: run `pnpm build` first");

for (const b of boards) {
  const where = `board "${b.slug}"`;
  for (const k of ["slug", "title", "tagline", "status", "summary", "model", "renderAlt", "schematicAlt", "routedAlt"]) {
    if (!text(b[k])) fail(`${where}: "${k}" is empty`);
  }
  if (!text(b.reviewedBy)) fail(`${where}: "reviewedBy" is empty`);
  for (const k of ["stats", "tools", "checks", "limits", "files", "parts"]) {
    if (!list(b[k])) fail(`${where}: "${k}" is empty`);
  }
  if (!text(b.prompt?.summary) || !text(b.prompt?.note)) fail(`${where}: prompt summary/note missing`);

  const dir = join(root, "public/showcase", b.slug);
  const need = [b.assets?.glb, b.assets?.render, b.assets?.schematic, b.assets?.routed, ...(b.files ?? []).map((f) => f.path)];
  for (const f of need) {
    if (!text(f) || !existsSync(join(dir, f))) fail(`${where}: file missing under public/showcase/${b.slug}/: ${f}`);
  }

  const glb = existsSync(join(dir, b.assets?.glb ?? "\0")) ? readFileSync(join(dir, b.assets.glb)) : null;
  if (glb !== null) {
    const { materials = [] } = JSON.parse(glb.subarray(20, 20 + glb.readUInt32LE(12)).toString("utf8"));
    if (!materials.some((m) => m.alphaMode === "BLEND")) fail(`${where}: GLB has no solder mask (export with --include-soldermask)`);
  }

  // The prompt must be runnable by someone else: no author-specific plumbing.
  const prompt = read(join(dir, "prompt.md"));
  if (prompt === null) {
    fail(`${where}: public/showcase/${b.slug}/prompt.md is missing`);
  } else {
    const plumbing = /\b(commit|worktree|co-authored|pull request|firecrawl|toolsearch|sub-?agents?|token budget)\b|\bPR\b|\/home\/|\/tmp\/|\bgit\b/gi;
    const found = [...new Set(prompt.match(plumbing) ?? [])];
    if (found.length > 0) fail(`${where}: prompt.md has author-specific plumbing: ${found.join(", ")}`);
    if (!/\bCH342F\b/.test(prompt) || !/\bTHVD1450\b/.test(prompt)) fail(`${where}: prompt.md does not name the key parts`);
  }

  const page = read(join(root, "dist/showcase", b.slug, "index.html"));
  if (page === null) {
    fail(`${where}: dist/showcase/${b.slug}/index.html was not built`);
  } else {
    for (const id of ["prompt", "source", "board", "checks", "files"]) {
      if (!page.includes(`id="${id}"`)) fail(`${where}: page has no section id="${id}"`);
    }
    if (!page.includes("data-board-viewer")) fail(`${where}: page has no 3D viewer hook`);
    if (!/data-spin[^>]*aria-pressed="true"/.test(page)) fail(`${where}: Auto-rotate is not on by default`);
    if (!/data-view="angled"[^>]*aria-pressed="true"/.test(page)) fail(`${where}: Angled view is not selected by default`);
    if (!page.includes(b.assets?.glb ?? "\0")) fail(`${where}: page does not reference the GLB`);
    if (text(b.reviewedBy) && !page.includes(`Reviewed by ${b.reviewedBy}`)) fail(`${where}: page does not name the reviewer`);
    if (!page.includes("data-lightbox")) fail(`${where}: page has no image lightbox`);
    if (!page.includes('id="prompt-text"')) fail(`${where}: page does not show the runnable prompt`);
    for (const f of [b.assets?.schematic, b.assets?.routed]) {
      if (!new RegExp(`<a [^>]*(?=[^>]*\\bhref="[^"]*${f}")[^>]*\\bdata-zoom="[^"]*${f}"`).test(page)) fail(`${where}: Zoom for ${f} must be a link that works without JavaScript`);
      if (!new RegExp(`<a [^>]*href="[^"]*${f}"[^>]*\\bdownload\\b`).test(page)) fail(`${where}: no Download link for ${f}`);
    }
    if ((page.match(/<button[^>]*\sdata-copy(?=[\s>=])/g) ?? []).length < 2) fail(`${where}: source and brief blocks need Copy buttons`);
  }
  if (home !== null && !home.includes(`href="/showcase/${b.slug}/"`)) {
    fail(`${where}: homepage has no card linking to /showcase/${b.slug}/`);
  }
}

if (failures.length > 0) {
  console.error(failures.map((f) => `FAIL ${f}`).join("\n"));
  process.exit(1);
}
console.log(`showcase ok: ${boards.length} board(s)`);
