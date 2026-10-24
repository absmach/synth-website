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
const REVISION = "4ab0eb9";
// absmach/synth main as merged into that revision.
const MAIN_REVISION = "1eac8a1";
// The Synth main the routing and release reports were produced with, as QUALIFICATION.md records it.
const REPORT_BUILD_REVISION = "1eac8a1";

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
      "Port 1 is TTL serial for debugging microcontroller boards: console, flashing, logs. Port 2 is RS-485 for industrial gear such as Modbus sensors, meters and motor drives, and its direction switches by itself from the bridge's DTR0/TNOW0 pin. Power comes from USB, and a jumper picks 3.3 V or 5 V I/O. Protection is on the USB side: a PRTR5V0U2X ESD array on D+ and D-, and PTVS6V0S1UR TVS diodes on VBUS, CC1 and CC2. The RS-485 pair has no external TVS or common-mode choke, and the 120 Ω termination is always in circuit.",
    renderAlt:
      "Ray-traced 3D view of a small green circuit board with a USB-C receptacle at the top edge, a QFN chip in the middle, an RS-485 chip on the right, four mounting holes and four pin headers along the bottom edge",
    stats: [
      { label: "Overall size", value: "41.5 × 32.23 mm" },
      { label: "Layers", value: "2" },
      { label: "Nets routed", value: "26 of 26" },
      { label: "KiCad DRC", value: "0 errors, 0 unconnected" },
    ],
    prompt: {
      summary:
        "A real USB-C to dual-UART and RS-485 adapter, with USB ESD and TVS protection, where every claim must be true and measured.",
      note: "There is no single prompt: the board came from a long chat plus agent briefs. The prompt below is a cleaned, self-contained version of that brief, with our local setup removed, so you can run it yourself. It is not the exact text we ran, and it describes the published board (revision A). A different run will not give an identical board.",
    },
    model: "Claude Sonnet 5.5 (claude-sonnet-5-5), run in Claude Code",
    tools: [
      { name: "Synth MCP", use: "synth_language_reference and synth_validate, once each in the first design round" },
      { name: "Firecrawl MCP", use: "web search and page scrape to read manufacturer datasheets" },
      { name: "Command line", use: "synth export, kicad-cli design-rule check, 3D render and GLB export. These did not go through MCP." },
    ],
    parts: [
      { ref: "U1", name: "WCH CH342F", role: "USB to dual UART bridge" },
      { ref: "U3", name: "TI THVD1450D", role: "RS-485 transceiver, direction set automatically" },
      { ref: "D1", name: "Nexperia PRTR5V0U2X", role: "ESD array on the USB data pair" },
      { ref: "D2 D5 D6", name: "Nexperia PTVS6V0S1UR", role: "TVS diodes on VBUS, CC1 and CC2" },
      { ref: "R_TERM", name: "120 Ω resistor", role: "Bus termination, permanently across A and B; there is no jumper" },
      { ref: "U2", name: "TI LP5907", role: "3.3 V low-noise regulator" },
      { ref: "J1", name: "USB-C receptacle", role: "HRO TYPE-C-31-M-12: power and data in" },
      { ref: "H1 to H4", name: "M2.5 mounting holes", role: "Four 2.5 mm holes, two in the top corners and two at the sides" },
      { ref: "J_VIO", name: "3-pin jumper", role: "Picks 3.3 V or 5 V for the serial I/O" },
      { ref: "J2 J3 J4", name: "3-pin headers", role: "TTL serial, flow control and the RS-485 bus" },
    ],
    checks: [
      { label: "Routing", value: "26 nets connected, 0 open" },
      { label: "KiCad design-rule check", value: "0 errors, 0 unconnected, 39 warnings (36 footprint library links, 2 silkscreen-over-copper, 1 silkscreen overlap), run with the project's custom rules (copper to a board edge 0.3 mm, to a hole or an NPTH hole 0.2 mm, from the JLCPCB profile). The raw report also lists one F.Cu GND zone against itself as an unconnected item; no two objects are missing a connection. Report: reports/usb_uart.drc.json" },
      { label: "Schematic ERC", value: "1 error (VIO power pin not driven, jumper-selected rail), 119 warnings (81 symbol-library link issues, 36 footprint links, 1 label on multiple wires, 1 net with multiple names). Report: reports/usb_uart.erc.json" },
      { label: "Release gate", value: "Passed: release_ready and fabrication_ready are true in Synth's records. That means Synth's own checks passed (routed, 0 open nets, KiCad DRC clean). It is not a manufacturing sign-off: nothing was fabricated or tested, and the fabrication note below applies. Records: reports/usb_uart.routing.json, reports/release.json" },
      { label: "Fabrication note", value: "One via-in-pad: the U1 exposed-pad ground via at (23.8, 17.2) mm needs filled and capped vias at the fab. Not confirmed with JLCPCB for this board." },
      { label: "Copper", value: "271 track segments, 38 vias, 507.7 mm. 241 segments on F.Cu and 30 on B.Cu; every via is a through via between the two copper layers." },
      { label: "Signal integrity", value: "15 warnings, none blocking: every one is a layer change with no ground return via within 1.53 mm, so the return current has to jump between the F.Cu and B.Cu pours. Nobody has judged them." },
      { label: "Time to route", value: "148 s, from the route record. J3 at its earlier x 25.56 mm left DTR1 open on two layers; the committed placement moves J3 and J4 1.44 mm right. The result is not bit-for-bit repeatable." },
      { label: "Router", value: "FreeRouting 2.4.1. Record: reports/usb_uart.routing.json" },
      { label: "Published files", value: `Board, schematic, source and layout files are byte-identical to absmach/synth#103 at commit ${REVISION} (qualification/class-b/usb-uart/). The 3D model, copper-layer SVGs, schematic SVG and the renders are made from that board by KiCad 10.0.7 with the ground pours refilled.` },
      { label: "Synth build", value: `The routing and release reports were produced on Synth main ${REPORT_BUILD_REVISION} plus the export changes in PR #103 at ${REVISION}.` },
    ],
    limits: [
      `Engineering draft, not a completed Class-B qualification. Not fabricated and not tested on hardware. Reviewed by ${reviewedBy}; no signal-integrity, power-integrity or RF expert has signed it off.`,
      "Two copper layers and no declared stackup: the exporter writes the 1.6 mm default. There is no inner reference plane, so a return current under an outer-layer track has to use the F.Cu or B.Cu ground pour.",
      "The USB pair is not impedance-controlled. A 90 Ω differential pair needs about 1.18 mm traces at 1.6 mm on two layers, so no impedance target is declared. FreeRouting does not couple the pair, and its length and skew were not measured.",
      "The signal-integrity pass reports 15 layer changes with no ground return via within 1.53 mm (CC2, MODEM_IDLE, CTS1, RXD0, +3V3, RXD1, RXD1_MCU, DTR1, LED_TX1 and VBUS). Nobody has judged them.",
      "FreeRouting's escape analysis flags J1 and U1 (0.5 mm pitch): neither a minimum via nor a minimum track fits between adjacent pads, and it suggests 4 layers. The route completes, with the only via-in-pad at U1 pin 25.",
      "R_TERM (120 Ω 1 %) is permanently across A and B; the registry has no 2-pin header for a jumper. Every node on the bus is terminated whether or not it is the end node.",
      "The RS-485 pair has no external TVS and no common-mode choke. Only the THVD1450's on-chip ±18 kV IEC contact ESD protects the bus; TI's 1 kV surge circuit is not built and the bus is not surge-tested.",
      "The U1 exposed-pad via needs filled and capped vias. JLCPCB has not been asked about this board, and on two layers the filled-via option was not priced.",
      "No VBUS bulk capacitor, fuse, or reverse and inrush protection.",
      "The J1 connector datasheet was not read. The Lite-On LED numbers are second-hand. The CH342F exposed pad is 2.6 mm in the KiCad footprint and 2.4 mm in the supplier drawing. Part availability, JLCPCB assembly and the registry LCSC numbers were not checked.",
      "Header labels (GND, TXD1, RXD1 and so on) exist only in the schematic: Synth has no silkscreen text.",
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
        note: "Top copper (F.Cu) with silkscreen. 241 track segments and a ground pour.",
      },
      {
        id: "bottom",
        label: "Bottom",
        file: "layer-bottom.svg",
        alt: "Bottom copper layer seen from below: a few tracks and a ground pour, with the through-hole header pads",
        note: "Bottom copper (B.Cu), seen from below, so it is mirrored. 30 track segments and a ground pour.",
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
      { label: "KiCad PCB", path: "kicad/usb_uart.kicad_pcb", note: "Routed board" },
      { label: "KiCad schematic", path: "kicad/usb_uart.kicad_sch", note: "Generated sheet" },
      { label: "KiCad symbols", path: "kicad/usb_uart.kicad_sym", note: "Generated symbol library" },
      { label: "KiCad project", path: "kicad/usb_uart.kicad_pro", note: "Project settings" },
      { label: "KiCad custom rules", path: "kicad/usb_uart.kicad_dru", note: "Copper to a board edge 0.3 mm, to a hole or NPTH hole 0.2 mm, from the manufacturer profile" },
      { label: "Bill of materials", path: "kicad/bom.csv", note: "Reference, value, description" },
      { label: "3D model", path: "usb-uart.glb", note: "Binary glTF, as shown in the viewer" },
      { label: "3D model (STEP)", path: "usb_uart.step", note: "The whole board as a STEP assembly, with KiCad's model of the connector, for CAD and enclosure work" },
      { label: "Connectivity report", path: "reports/usb_uart.connectivity.json", note: "Synth's connectivity check, re-derived from the copper" },
      { label: "Route record", path: "reports/usb_uart.routing.json", note: "Synth's routing run: router, settings, nets, segments, vias" },
      { label: "Design-rule check", path: "reports/usb_uart.drc.json", note: "KiCad 10 DRC report for the routed board" },
      { label: "Schematic ERC", path: "reports/usb_uart.erc.json", note: "KiCad 10.0.7 ERC report for the generated schematic" },
      { label: "Qualification matrix", path: "QUALIFICATION.md", note: "What was checked, what was not, and what is open" },
      { label: "File hashes", path: "SHA256SUMS", note: "SHA-256 of every file in this folder except the zip" },
      { label: "Release gate result", path: "reports/release.json", note: "Synth's release gate record" },
      { label: "Prompt", path: "prompt.md", note: "A cleaned version you can run yourself" },
    ],
  },
];
