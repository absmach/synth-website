export interface Board {
  slug: string;
  title: string;
  tagline: string;
  status: string;
  qualification: { text: string; evidence: { label: string; path: string }[] };
  revision: string;
  mainRevision: string;
  reportBuildRevision: string;
  reviewedBy: string;
  summary: string;
  renderAlt: string;
  stats: { label: string; value: string }[];
  prompt: { summary: string; note: string };
  model: string;
  tools: { name: string; use: string }[];
  parts: { ref: string; name: string; role: string }[];
  checks: { label: string; value: string }[];
  limits: string[];
  source: { file: string };
  schematicAlt: string;
  layers: { id: string; label: string; file: string; alt: string; note: string }[];
  assets: { glb: string; render: string; schematic: string };
  files: { label: string; path: string; note: string }[];
}

const reviewedBy = "Steve Munene";
// One revision for every published artifact: absmach/synth#103, qualification/class-b/usb-uart/.
const REVISION = "a965f7f";
// absmach/synth main as merged into that revision.
const MAIN_REVISION = "50a165c";
// The Synth main the routing and release reports were produced with, as QUALIFICATION.md records it.
const REPORT_BUILD_REVISION = "50a165c";

export const boards: Board[] = [
  {
    slug: "usb-uart",
    title: "USB-C dual UART and RS-485 adapter",
    tagline: "One USB-C cable. Two serial ports.",
    status: `Engineering draft. Not fabricated. Not tested on hardware. Reviewed by ${reviewedBy}.`,
    qualification: {
      text: "This is an engineering draft and a showcase artifact. It is not a completed Class-B qualification result: the qualification matrix is published, but no signal-integrity, power-integrity or RF expert has signed it off, and Synth's release gate passing is not a qualification. The matrix, the gate result and the file hashes are linked below.",
      evidence: [
        { label: "Qualification matrix and open items", path: "QUALIFICATION.md" },
        { label: "Release gate result", path: "reports/release.json" },
        { label: "SHA-256 of every published file", path: "SHA256SUMS" },
      ],
    },
    revision: REVISION,
    mainRevision: MAIN_REVISION,
    reportBuildRevision: REPORT_BUILD_REVISION,
    reviewedBy,
    summary:
      "Port 1 is TTL serial for debugging microcontroller boards: console, flashing, logs. Port 2 is RS-485 for industrial gear such as Modbus sensors, meters and motor drives, and its direction is designed to switch by itself; a jumper fits the 120 Ω bus termination only when the board is at the end of the bus. Power comes from USB, and a jumper picks 3.3 V or 5 V I/O. Protection: ESD and TVS diodes on the USB side, and 10 Ω series resistors with a TVS array on the RS-485 A and B lines, following TI's surge circuit. The RS-485 network is not surge-tested.",
    renderAlt:
      "Ray-traced 3D view of a small green circuit board with a USB-C receptacle at the top edge, a QFN chip in the middle, an RS-485 chip on the right, four large mounting holes and five pin headers along the bottom edge",
    stats: [
      { label: "Overall size", value: "50.5 × 38.4 mm" },
      { label: "Layers", value: "4" },
      { label: "Nets routed", value: "29 of 29" },
      { label: "KiCad DRC", value: "0 errors, 0 unconnected" },
    ],
    prompt: {
      summary:
        "A real USB-C to dual-UART and RS-485 adapter, with USB ESD and TVS protection and a TI-style surge network on the RS-485 lines (not surge-tested), where every claim must be true and measured.",
      note: "There is no single prompt: the board came from a long chat plus agent briefs. The prompt below is a cleaned, self-contained version of that brief, with our local setup removed, so you can run it yourself. It is not the exact text we ran, and it describes revision B of the board (switchable RS-485 termination and a surge network on A and B, added after review), the Amphenol connector, four mounting holes and a 0.3 mm VBUS; the original brief produced revision A. A different run will not give an identical board. The original brief is linked below.",
    },
    model: "Claude Sonnet 5.5 (claude-sonnet-5-5), run in Claude Code",
    tools: [
      { name: "Synth MCP", use: "synth_language_reference and synth_validate, once each in the first design round" },
      { name: "Firecrawl MCP", use: "web search and page scrape to read manufacturer datasheets" },
      { name: "Command line", use: "synth route, kicad-cli export, design-rule check, 3D render and GLB export. These did not go through MCP." },
    ],
    parts: [
      { ref: "U1", name: "WCH CH342F", role: "USB to dual UART bridge" },
      { ref: "U3", name: "TI THVD1450D", role: "RS-485 transceiver, direction set automatically" },
      { ref: "D1", name: "Nexperia PRTR5V0U2X", role: "ESD array on the USB data pair" },
      { ref: "D2 D5 D6", name: "Nexperia PTVS6V0S1UR", role: "TVS diodes on VBUS, CC1 and CC2" },
      { ref: "R_A R_B D8", name: "10 Ω resistors, Bourns CDSOT23-SM712", role: "Series resistors and TVS array on the RS-485 A and B lines" },
      { ref: "R_TERM J_TERM", name: "120 Ω resistor, 2-pin jumper", role: "Bus termination, in circuit only with the jumper fitted" },
      { ref: "U2", name: "TI LP5907", role: "3.3 V low-noise regulator" },
      { ref: "J1", name: "Amphenol 12401610E4#2A", role: "USB-C receptacle: power and data in" },
      { ref: "H1 to H4", name: "M3 mounting holes", role: "Four 3.2 mm non-plated holes, two in the top corners and two at the sides" },
      { ref: "J_VIO", name: "3-pin jumper", role: "Picks 3.3 V or 5 V for the serial I/O" },
    ],
    checks: [
      { label: "Routing", value: "29 nets connected, 0 open" },
      { label: "KiCad design-rule check", value: "0 errors, 0 unconnected, 54 warnings (silkscreen and library notes), also after a KiCad re-save, run with the project's custom rules (copper to a board edge 0.3 mm, to a hole or an NPTH hole 0.2 mm, from the JLCPCB profile). Report: reports/usb_uart.drc.json" },
      { label: "Release gate", value: "Passed: release_ready and fabrication_ready are true in Synth's records. That means Synth's own checks passed (routed, 0 open nets, KiCad DRC clean). It is not a manufacturing sign-off: nothing was fabricated or tested, and the fabrication note below applies. Records: reports/usb_uart.routing.json, reports/release.json" },
      { label: "Fabrication note", value: "One via-in-pad: the U1 exposed-pad ground via at (23.8, 20.1) mm needs filled and capped vias at the fab. Not confirmed with JLCPCB for this board." },
      { label: "Ground return", value: "A ground via sits 0.8 to 1.8 mm from the ground pad of every decoupling and protection part, except D6 (2.6 mm). J1's ground contacts A12 and B1 are 5.8 and 6.3 mm from one. D6 pin 2 and J1 A12 got no via for lack of room and connect through tracks." },
      { label: "Copper", value: "271 track segments, 44 vias (22 of them ground), 582 mm. VBUS is routed at 0.3 mm to fit the connector's 0.3 mm contacts." },
      { label: "Time to route", value: "109 s, from the route record. Most placements tried with the M3 holes failed: they left nets open, a stray ground-pour piece or DRC errors. The result changes from one placement to the next." },
      { label: "Router", value: "FreeRouting 2.4.1. Record: reports/usb_uart.routing.json" },
      { label: "Published files", value: `Board, schematic, source and layout files are byte-identical to absmach/synth#103 at commit ${REVISION} (qualification/class-b/usb-uart/). The 3D model, copper-layer SVGs, schematic SVG and the renders are made from that board by KiCad 10.0.7 with the ground pours refilled. The routing and release reports have local paths replaced, so only their hashes in QUALIFICATION.md differ from these files.` },
      { label: "Synth build", value: `The routing and release reports were produced by a local build of PR #103 merged with Synth main ${REPORT_BUILD_REVISION}, which already has the tool PRs this board needs: #154 (clearances in the exported project file and the DRC), #162 (outline round mounting holes), #173 (labels next to their part), #175 (a ground via beside every ground pad) and #176 (no copper under the screw heads).` },
    ],
    limits: [
      `Engineering draft, not a completed Class-B qualification. Not fabricated and not tested on hardware. Reviewed by ${reviewedBy}; no signal-integrity, power-integrity or RF expert has signed it off.`,
      "The RS-485 surge network (10 Ω series resistors and a TVS array) follows TI's circuit but is not surge-tested, and the series resistors are not the pulse-proof part TI lists.",
      "The design-rule check holds copper to an NPTH hole at JLCPCB's 0.2 mm, not KiCad's stricter 0.5 mm and 0.25 mm defaults (a board edge stays at 0.3 mm): the connector's NPTH holes sit 0.30 to 0.33 mm from its pads. A reviewer may want the wider margin.",
      "The U1 exposed pad holds one ground via inside the pad (0.6 mm pad, 0.3 mm drill). JLCPCB would have to fill and cap it, at extra cost on a 4-layer board. This is not confirmed with JLCPCB for this board.",
      "The USB data pair is not impedance-verified. The router does not couple the pair: D+ is 20.3 mm and D- is 20.2 mm, 2 vias each. Per connector contact the skew is 4.0 mm on the A side and 0.4 mm on the B side, and the chip is full speed (12 Mb/s). It is the router's result and nobody tuned it (track centre-line length from the board file, not a field-solver result). Synth's signal-integrity pass also reports 22 layer changes with no ground return via within 0.64 mm (USB_DP, CC1, CC2, V3 and several UART and LED nets) and one 5.8 mm parallel run of two UART lines; nobody has judged them.",
      "The manufacturer datasheets of the USB-C connector (Amphenol), the USB ESD and TVS diodes (Nexperia) and the LEDs (Lite-On) were not read (the sites refused every request), so the connector's pinout, ratings and drawing are KiCad's footprint only. The viewer shows the 3D model KiCad ships for it.",
      "J1's oval NPTH hole is 0.95 × 0.65 mm, and JLCPCB states 1.0 mm as the smallest non-plated slot. Whether that applies to this connector hole is not confirmed. The via annular ring is 0.15 mm, JLCPCB's absolute minimum.",
      "The current the CH342F's TXD pins can sink was not checked for the TX LEDs.",
      "Some reference labels near U1 (D1, D2, D5, D6) still crowd each other on the silkscreen.",
    ],
    source: { file: "usb_uart.synth" },
    schematicAlt:
      "Schematic of the board: USB-C input and protection, the CH342F bridge, the RS-485 transceiver, the regulator and the headers, each in its own colored group box",
    layers: [
      {
        id: "top",
        label: "Top",
        file: "layer-top.svg",
        alt: "Top copper layer with silkscreen: tracks and pads around the USB-C connector, the CH342F bridge and the RS-485 chip, over a ground pour",
        note: "Top copper (F.Cu) with silkscreen. 225 track segments and a ground pour.",
      },
      {
        id: "inner1",
        label: "Inner 1",
        file: "layer-inner1.svg",
        alt: "Inner copper layer 1: a solid ground plane with clearance rings around the vias and header pins",
        note: "Inner 1 (In1.Cu). A solid ground plane with no tracks; the rings are clearances around vias and pins.",
      },
      {
        id: "inner2",
        label: "Inner 2",
        file: "layer-inner2.svg",
        alt: "Inner copper layer 2: a solid ground plane with clearance rings around the vias and header pins",
        note: "Inner 2 (In2.Cu). A second solid ground plane with no tracks.",
      },
      {
        id: "bottom",
        label: "Bottom",
        file: "layer-bottom.svg",
        alt: "Bottom copper layer seen from below: a few tracks and a ground pour, with the through-hole header pads",
        note: "Bottom copper (B.Cu), seen from below, so it is mirrored. 46 track segments and a ground pour.",
      },
    ],
    assets: {
      glb: "usb-uart.glb",
      render: "render-3d.png",
      schematic: "schematic.svg",
    },
    files: [
      { label: "Design source", path: "usb_uart.synth", note: "The .synth file Synth compiles" },
      { label: "Placement layout", path: "usb_uart.placement.layout.toml", note: "Where each part sits on the board, in board millimetres" },
      { label: "Schematic layout", path: "usb_uart.schematic.layout.toml", note: "Where each part sits on the sheet, in sheet millimetres" },
      { label: "KiCad PCB", path: "kicad/usb_uart.kicad_pcb", note: "Routed board" },
      { label: "KiCad schematic", path: "kicad/usb_uart.kicad_sch", note: "Generated sheet" },
      { label: "KiCad symbols", path: "kicad/usb_uart.kicad_sym", note: "Generated symbol library" },
      { label: "KiCad project", path: "kicad/usb_uart.kicad_pro", note: "Project settings" },
      { label: "KiCad custom rules", path: "kicad/usb_uart.kicad_dru", note: "Copper to a board edge 0.3 mm, to a hole or NPTH hole 0.2 mm, from the manufacturer profile" },
      { label: "Bill of materials", path: "kicad/bom.csv", note: "Reference, value, description" },
      { label: "3D model", path: "usb-uart.glb", note: "Binary glTF, as shown in the viewer" },
      { label: "3D model (STEP)", path: "usb_uart.step", note: "The whole board as a STEP assembly, with KiCad's model of the connector, for CAD and enclosure work" },
      { label: "Connectivity report", path: "reports/usb_uart.connectivity.json", note: "Synth's connectivity check, re-derived from the copper" },
      { label: "Route record", path: "reports/usb_uart.routing.json", note: "Synth's routing run: router, settings, nets, segments, vias. Local paths replaced." },
      { label: "Design-rule check", path: "reports/usb_uart.drc.json", note: "KiCad 10 DRC report for the routed board" },
      { label: "Qualification matrix", path: "QUALIFICATION.md", note: "What was checked, what was not, and what is open" },
      { label: "File hashes", path: "SHA256SUMS", note: "SHA-256 of every file in this folder except the zip" },
      { label: "Release gate result", path: "reports/release.json", note: "Synth's release gate record. Local paths replaced." },
      { label: "Prompt", path: "prompt.md", note: "A cleaned version you can run yourself" },
      { label: "Original agent brief", path: "brief.txt", note: "Round 2, word for word, as we gave it" },
    ],
  },
];
