// Checks the built site, not the source: run `pnpm build` first.
// Usage: node scripts/check-showcase.mjs
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
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
else if (!home.includes('class="menu-toggle"') || !home.includes('aria-controls="primary-nav"')) fail("home page has no mobile menu toggle");

for (const b of boards) {
  const where = `board "${b.slug}"`;
  for (const k of ["slug", "title", "tagline", "status", "summary", "model", "renderAlt", "schematicAlt"]) {
    if (!text(b[k])) fail(`${where}: "${k}" is empty`);
  }
  if (!text(b.reviewedBy)) fail(`${where}: "reviewedBy" is empty`);
  if (!Array.isArray(b.layers) || ![2, 4].includes(b.layers.length)) fail(`${where}: expected 2 or 4 copper layers`);
  for (const l of b.layers ?? []) {
    for (const k of ["id", "label", "file", "alt", "note"]) if (!text(l[k])) fail(`${where}: layer "${l.id}" has an empty "${k}"`);
  }
  for (const k of ["stats", "tools", "checks", "limits", "files", "parts"]) {
    if (!list(b[k])) fail(`${where}: "${k}" is empty`);
  }
  if (!text(b.prompt?.summary) || !text(b.prompt?.note)) fail(`${where}: prompt summary/note missing`);

  const dir = join(root, "public/showcase", b.slug);
  const need = [b.assets?.glb, b.assets?.render, b.assets?.schematic, ...(b.layers ?? []).map((l) => l.file), ...(b.files ?? []).map((f) => f.path)];
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

  // The zip is built from everything in the board folder: it must contain all of it.
  const zipName = `${b.slug}-files.zip`;
  const zipPath = join(root, "dist/showcase", b.slug, zipName);
  if (!existsSync(zipPath)) {
    fail(`${where}: ${zipName} was not built (run pnpm build)`);
  } else {
    const zip = readFileSync(zipPath);
    const eocd = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
    const names = [];
    for (let n = zip.readUInt16LE(eocd + 10), at = zip.readUInt32LE(eocd + 16); n > 0; n--) {
      const len = zip.readUInt16LE(at + 28);
      names.push(zip.subarray(at + 46, at + 46 + len).toString("utf8"));
      at += 46 + len + zip.readUInt16LE(at + 30) + zip.readUInt16LE(at + 32);
    }
    const walk = (d, pre = "") => readdirSync(join(d), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name), `${pre}${e.name}/`) : [`${pre}${e.name}`]));
    // KiCad writes this local editor state when the board is opened; it is not a published artifact.
    const expected = [...walk(dir).filter((f) => f !== zipName && !f.endsWith(".kicad_prl")), "LICENSE"].map((f) => `${b.slug}/${f}`);
    const missing = expected.filter((f) => !names.includes(f));
    if (missing.length > 0) fail(`${where}: ${zipName} is missing: ${missing.join(", ")}`);
  }
  const licenseNotes = read(join(dir, "LICENSE-NOTES.md"));
  if (licenseNotes === null) fail(`${where}: LICENSE-NOTES.md is missing`);
  const synthBuild = (b.checks ?? []).find((c) => c.label === "Synth build");
  if (!synthBuild || !/\b[0-9a-f]{7,40}\b/.test(synthBuild.value)) fail(`${where}: checks need a "Synth build" entry with a commit hash`);

  // A page that says "not fabricated" must not ship a record that says fabrication-ready
  // unless the page itself explains what the field means.
  const record = read(join(dir, "reports/usb_uart.routing.json"));
  if (record !== null && /not fabricated/i.test(b.status) && JSON.parse(record).validation?.fabrication_ready !== false) {
    const gate = (b.checks ?? []).find((c) => c.label === "Release gate")?.value ?? "";
    if (!/fabrication_ready/.test(gate) || !/not a manufacturing sign-off/i.test(gate)) {
      fail(`${where}: reports/usb_uart.routing.json says fabrication_ready, the page says the board is not fabricated, and the "Release gate" check does not explain that fabrication_ready is not a manufacturing sign-off`);
    }
  }
  // The tool commit the reports came from is the one QUALIFICATION.md names, and every report it cites is published.
  const qual = read(join(dir, "QUALIFICATION.md")) ?? "";
  const qualTool = qual.match(/Synth `main` ([0-9a-f]{7})\b/)?.[1];
  if (!qualTool || qualTool !== b.reportBuildRevision) fail(`${where}: reportBuildRevision ${b.reportBuildRevision} is not the Synth main commit QUALIFICATION.md names (${qualTool})`);
  for (const cited of new Set(qual.match(/reports\/[\w.-]+\.json/g) ?? [])) {
    if (!existsSync(join(dir, cited))) fail(`${where}: QUALIFICATION.md cites ${cited}, which is not published`);
  }
  // The qualification state is stated, with the evidence a reviewer needs.
  if (!/engineering draft/i.test(b.qualification?.text ?? "") || !/not a completed class-b qualification/i.test(b.qualification?.text ?? "")) {
    fail(`${where}: qualification.text must call the board an engineering draft, not a completed Class-B qualification`);
  }
  for (const e of b.qualification?.evidence ?? []) {
    if (!existsSync(join(dir, e.path))) fail(`${where}: qualification evidence missing: ${e.path}`);
  }
  if (!(b.qualification?.evidence ?? []).some((e) => e.path === "QUALIFICATION.md")) fail(`${where}: qualification evidence must include QUALIFICATION.md`);
  // SHA256SUMS lists every published file except the zip and itself, and each hash is right.
  const sums = read(join(dir, "SHA256SUMS"));
  if (sums === null) {
    fail(`${where}: SHA256SUMS is missing`);
  } else {
    const listed = new Map(sums.split("\n").filter(Boolean).map((l) => [l.slice(66), l.slice(0, 64)]));
    const files = (d, pre = "") => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(join(d, e.name), `${pre}${e.name}/`) : [`${pre}${e.name}`]));
    for (const f of files(dir).filter((f) => f !== "SHA256SUMS" && f !== `${b.slug}-files.zip` && !f.endsWith(".kicad_prl"))) {
      if (!listed.has(f)) fail(`${where}: SHA256SUMS does not list ${f}`);
      else if (listed.get(f) !== createHash("sha256").update(readFileSync(join(dir, f))).digest("hex")) fail(`${where}: SHA256SUMS has the wrong hash for ${f}`);
    }
  }
  // Protection wording must not imply tested surge protection.
  for (const [k, v] of [["summary", b.summary], ["prompt.summary", b.prompt?.summary ?? ""]]) {
    if (/surge/i.test(v) && !/not surge-tested/i.test(v)) fail(`${where}: ${k} mentions surge protection without saying it is not surge-tested`);
  }
  // One revision per artifact set: the commits named in the checks are the board's revision and the Synth main it was built on.
  const shas = new Set((b.checks ?? []).flatMap((c) => c.value.match(/\b[0-9a-f]{7,40}\b/g) ?? []).filter((s) => /[a-f]/.test(s) && /\d/.test(s)));
  for (const s of shas) if (![b.revision, b.mainRevision, b.reportBuildRevision].includes(s)) fail(`${where}: checks name commit ${s}, which is not one of revision ${b.revision}, mainRevision ${b.mainRevision}, reportBuildRevision ${b.reportBuildRevision}`);
  if (!text(b.revision) || !(b.checks ?? []).some((c) => c.value.includes(b.revision ?? "\0"))) fail(`${where}: checks must name the board's revision`);

  const page = read(join(root, "dist/showcase", b.slug, "index.html"));
  if (page === null) {
    fail(`${where}: dist/showcase/${b.slug}/index.html was not built`);
  } else {
    for (const id of ["prompt", "source", "board", "checks", "files"]) {
      if (!page.includes(`id="${id}"`)) fail(`${where}: page has no section id="${id}"`);
    }
    if (!page.includes("data-board-viewer")) fail(`${where}: page has no 3D viewer hook`);
    if (!page.includes('class="menu-toggle"') || !page.includes('aria-controls="primary-nav"')) fail(`${where}: page has no mobile menu toggle`);
    if (!/data-spin[^>]*aria-pressed="true"/.test(page)) fail(`${where}: Auto-rotate is not on by default`);
    if (!/data-view="angled"[^>]*aria-pressed="true"/.test(page)) fail(`${where}: Angled view is not selected by default`);
    if (!page.includes(b.assets?.glb ?? "\0")) fail(`${where}: page does not reference the GLB`);
    if (text(b.reviewedBy) && !page.includes(`Reviewed by ${b.reviewedBy}`)) fail(`${where}: page does not name the reviewer`);
    if (page.indexOf("data-qualification") < page.indexOf('id="files"')) fail(`${where}: the qualification note belongs at the end of the page, after the files section`);
    if (!page.includes("data-qualification") || !page.includes((b.qualification?.text ?? "\0").slice(0, 40))) fail(`${where}: page does not show the qualification status`);
    if (!page.includes("data-lightbox")) fail(`${where}: page has no image lightbox`);
    if (!page.includes('id="prompt-text"')) fail(`${where}: page does not show the runnable prompt`);
    // The whole source is on the page, not an excerpt: its last statement must be there.
    const source = read(join(dir, b.source.file)) ?? "";
    const lastStatement = source.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("connect ")).at(-1);
    const decoded = page.replace(/&gt;|&#62;/g, ">").replace(/&lt;|&#60;/g, "<").replace(/&quot;|&#34;/g, '"').replace(/&amp;|&#38;/g, "&");
    if (!lastStatement || !decoded.includes(lastStatement)) fail(`${where}: page does not show the whole ${b.source.file} (last statement missing)`);
    if (!new RegExp(`<a [^>]*href="[^"]*${b.slug}-files\\.zip"[^>]*\\bdownload\\b`).test(page)) fail(`${where}: no download link for the zip`);
    for (const para of (licenseNotes ?? "").split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean)) {
      if (!page.includes(para.slice(0, 40))) fail(`${where}: page does not show the license note: "${para.slice(0, 40)}..."`);
    }
    if (synthBuild && !page.includes("Synth build")) fail(`${where}: page does not show the Synth build`);
    for (const l of b.layers ?? []) {
      if (!new RegExp(`<a [^>]*href="[^"]*${l.file}"[^>]*\\bdata-layer="${l.id}"`).test(page)) fail(`${where}: no tab link for layer ${l.id} that works without JavaScript`);
      if (!page.includes(l.alt.slice(0, 40))) fail(`${where}: layer ${l.id} alt text is not on the page`);
    }
    if (!/role="tablist"/.test(page)) fail(`${where}: layer tabs need role="tablist"`);
    if (/<a [^>]*data-layer="[^"]*"[^>]*tabindex="-1"/.test(page) || /<a [^>]*tabindex="-1"[^>]*data-layer=/.test(page)) fail(`${where}: layer tabs must be keyboard-reachable without JavaScript (no tabindex="-1" in the HTML)`);
    if (!/role="tabpanel"/.test(page) || !/aria-controls="layer-panel"/.test(page)) fail(`${where}: layer tabs need a tabpanel that the tabs control`);
    for (const f of [b.assets?.schematic, b.layers?.[0]?.file]) {
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
