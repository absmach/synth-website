// Builds public/showcase/<slug>/<slug>-files.zip from everything in that folder
// plus the repo LICENSE. Runs before `astro build`; the zip is not committed.
// Plain Node, no dependencies, same output every run (fixed timestamps).
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { crc32, deflateRawSync } from "node:zlib";

const root = new URL("..", import.meta.url).pathname;
const showcase = join(root, "public/showcase");
const DOS_TIME = 0;
const DOS_DATE = (30 << 9) | (1 << 5) | 1; // 2010-01-01

const walk = (dir, prefix = "") =>
  readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name), `${prefix}${e.name}/`) : [`${prefix}${e.name}`]));

const u16 = (n) => Buffer.from([n & 255, (n >> 8) & 255]);
const u32 = (n) => Buffer.from([n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255]);

for (const slug of readdirSync(showcase, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)) {
  const dir = join(showcase, slug);
  const zipName = `${slug}-files.zip`;
  // KiCad writes this local editor state when the board is opened; it is not a published artifact.
  const files = walk(dir)
    .filter((f) => f !== zipName && !f.endsWith(".kicad_prl"))
    .map((f) => [`${slug}/${f}`, readFileSync(join(dir, f))]);
  files.push([`${slug}/LICENSE`, readFileSync(join(root, "LICENSE"))]);

  const parts = [];
  const central = [];
  let offset = 0;
  for (const [name, data] of files) {
    const nameBytes = Buffer.from(name, "utf8");
    const packed = deflateRawSync(data, { level: 9 });
    const crc = crc32(data);
    const common = [u16(20), u16(0x0800), u16(8), u16(DOS_TIME), u16(DOS_DATE), u32(crc), u32(packed.length), u32(data.length), u16(nameBytes.length), u16(0)];
    const local = Buffer.concat([u32(0x04034b50), ...common, nameBytes, packed]);
    central.push(Buffer.concat([u32(0x02014b50), u16(20), ...common, u16(0), u16(0), u16(0), u32(0), u32(offset), nameBytes]));
    parts.push(local);
    offset += local.length;
  }
  const centralBytes = Buffer.concat(central);
  const end = Buffer.concat([u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(centralBytes.length), u32(offset), u16(0)]);
  writeFileSync(join(dir, zipName), Buffer.concat([...parts, centralBytes, end]));
  console.log(`${slug}/${zipName}: ${files.length} files`);
}
