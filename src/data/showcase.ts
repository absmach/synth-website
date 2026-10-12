export interface Board {
  slug: string;
  title: string;
  tagline: string;
  status: string;
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
  source: { file: string; from: number; to: number; note: string };
  schematicAlt: string;
  routedAlt: string;
  assets: { glb: string; render: string; schematic: string; routed: string };
  files: { label: string; path: string; note: string }[];
}

const reviewedBy = "Steve Munene";

export const boards: Board[] = [
  {
    slug: "usb-uart",
    title: "USB-C dual UART and RS-485 adapter",
    tagline: "One USB-C cable. Two serial ports.",
    status: `Not fabricated. Not tested on hardware. Reviewed by ${reviewedBy}.`,
    reviewedBy,
    summary:
      "Port 1 is TTL serial for debugging microcontroller boards: console, flashing, logs. Port 2 is RS-485 for industrial gear such as Modbus sensors, meters and motor drives, and its direction is designed to switch by itself. Power comes from USB, and a jumper picks 3.3 V or 5 V I/O.",
    renderAlt:
      "Ray-traced 3D view of a small green circuit board with a USB-C receptacle at the top edge, a QFN chip in the middle, an RS-485 chip on the right and four pin headers along the bottom edge",
    stats: [
      { label: "Overall size", value: "45.1 × 35.8 mm" },
      { label: "Layers", value: "4" },
      { label: "Nets routed", value: "26 of 26" },
      { label: "KiCad DRC", value: "0 errors" },
    ],
    prompt: {
      summary:
        "A real USB-C to dual-UART and RS-485 adapter, with ESD and surge protection, where every claim must be true and measured.",
      note: "There is no single prompt. The board came from a long chat plus agent briefs. The second-round brief is published word for word below; only local file paths are replaced.",
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
      { ref: "U2", name: "TI LP5907", role: "3.3 V low-noise regulator" },
      { ref: "J1", name: "USB-C receptacle", role: "Power and data in" },
      { ref: "J_VIO", name: "3-pin jumper", role: "Picks 3.3 V or 5 V for the serial I/O" },
    ],
    checks: [
      { label: "Routing", value: "26 nets connected, 0 open" },
      { label: "KiCad design-rule check", value: "0 errors, 0 unconnected, 49 warnings (silkscreen and library notes). Report: reports/kicad-drc.json" },
      { label: "Copper", value: "263 track segments, 28 vias, 549 mm" },
      { label: "Time to route", value: "117 s of routing on a laptop, debug build. From the route record." },
      { label: "Router", value: "FreeRouting 2.4.1. Record: reports/synth-route-record.json" },
    ],
    limits: [
      `Not fabricated and not tested on hardware. Reviewed by ${reviewedBy}.`,
      "The U1 exposed pad holds one ground via inside the pad (0.6 mm pad, 0.3 mm drill). JLCPCB would have to fill and cap it, at extra cost on a 4-layer board. This is not confirmed with JLCPCB for this board.",
      "The USB data pair is not impedance-verified. The router does not couple the pair: D+ is 17.0 mm and D- is 18.4 mm, a 1.4 mm skew.",
      "KiCad's library has no 3D model for this USB-C connector, so the viewer shows no body for it.",
      "Silkscreen reference text is oversized and overlaps. That is a current limit of the Synth exporter.",
    ],
    source: { file: "usb_uart.synth", from: 1, to: 30, note: "the intent, the layer count, the stackup and the power rails." },
    schematicAlt:
      "Schematic of the board: USB-C input and protection, the CH342F bridge, the RS-485 transceiver, the regulator and the headers, each in its own colored group box",
    routedAlt:
      "Routed copper of the board: top and bottom layer traces, pads and the four pin headers inside the board outline",
    assets: {
      glb: "usb-uart.glb",
      render: "render-3d.png",
      schematic: "schematic.svg",
      routed: "routed-copper.svg",
    },
    files: [
      { label: "Design source", path: "usb_uart.synth", note: "The .synth file Synth compiles" },
      { label: "KiCad PCB", path: "kicad/usb_uart.kicad_pcb", note: "Routed board" },
      { label: "KiCad schematic", path: "kicad/usb_uart.kicad_sch", note: "Generated sheet" },
      { label: "KiCad symbols", path: "kicad/usb_uart.kicad_sym", note: "Generated symbol library" },
      { label: "KiCad project", path: "kicad/usb_uart.kicad_pro", note: "Project settings" },
      { label: "Bill of materials", path: "kicad/bom.csv", note: "Reference, value, description" },
      { label: "3D model", path: "usb-uart.glb", note: "Binary glTF, as shown in the viewer" },
      { label: "Route record", path: "reports/synth-route-record.json", note: "Synth's routing run: router, settings, nets, segments, vias. Local paths replaced." },
      { label: "Design-rule check", path: "reports/kicad-drc.json", note: "KiCad 10 DRC report for the routed board" },
      { label: "Agent brief", path: "brief.txt", note: "Round 2, word for word" },
    ],
  },
];
