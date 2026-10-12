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
  for (const k of ["stats", "tools", "checks", "limits", "files", "parts"]) {
    if (!list(b[k])) fail(`${where}: "${k}" is empty`);
  }
  if (!text(b.prompt?.summary) || !text(b.prompt?.note)) fail(`${where}: prompt summary/note missing`);
  const si = b.standIn;
  for (const k of ["x", "frontY", "width", "length", "height", "boardTop"]) {
    if (typeof si?.[k] !== "number" || !Number.isFinite(si[k])) fail(`${where}: standIn.${k} must be a number (PCB mm)`);
  }
  if (!text(si?.note)) fail(`${where}: standIn.note is empty`);

  const dir = join(root, "public/showcase", b.slug);
  const need = [b.assets?.glb, b.assets?.render, b.assets?.schematic, b.assets?.routed, ...(b.files ?? []).map((f) => f.path)];
  for (const f of need) {
    if (!text(f) || !existsSync(join(dir, f))) fail(`${where}: file missing under public/showcase/${b.slug}/: ${f}`);
  }

  const page = read(join(root, "dist/showcase", b.slug, "index.html"));
  if (page === null) {
    fail(`${where}: dist/showcase/${b.slug}/index.html was not built`);
  } else {
    for (const id of ["prompt", "source", "board", "checks", "files"]) {
      if (!page.includes(`id="${id}"`)) fail(`${where}: page has no section id="${id}"`);
    }
    if (!page.includes("data-board-viewer")) fail(`${where}: page has no 3D viewer hook`);
    if (!page.includes("data-stand-in=")) fail(`${where}: viewer is not given the connector stand-in`);
    if (!/data-spin[^>]*aria-pressed="true"/.test(page)) fail(`${where}: Auto-rotate is not on by default`);
    if (!/data-view="angled"[^>]*aria-pressed="true"/.test(page)) fail(`${where}: Angled view is not selected by default`);
    if (text(si?.note) && !page.includes(si.note)) fail(`${where}: page does not say the connector body is approximate`);
    if (!page.includes(b.assets?.glb ?? "\0")) fail(`${where}: page does not reference the GLB`);
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
