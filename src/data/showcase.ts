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
  source: { file: string };
  schematicAlt: string;
  layers: { id: string; label: string; file: string; alt: string; note: string }[];
  assets: { glb: string; render: string; schematic: string };
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
      note: "There is no single prompt: the board came from a long chat plus agent briefs. The prompt below is a cleaned, self-contained version of that brief, with our local setup removed, so you can run it yourself. It is not the exact text we ran, and a different run will not give an identical board. The original brief is linked below.",
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
      { label: "Time to route", value: "348 s on this run, on a laptop with a debug build. An earlier run of the same board took 117 s. From the route record." },
      { label: "Router", value: "FreeRouting 2.4.1. Record: reports/synth-route-record.json" },
      { label: "Synth build", value: "synth 0.1.1, built locally from absmach/synth main (commit 5f62566) plus the board's branch (absmach/synth#103, commit 722eb30). Ground pours are filled, as current main delivers them. KiCad 10.0.7 for the DRC and the 3D export." },
    ],
    limits: [
      `Not fabricated and not tested on hardware. Reviewed by ${reviewedBy}.`,
      "The U1 exposed pad holds one ground via inside the pad (0.6 mm pad, 0.3 mm drill). JLCPCB would have to fill and cap it, at extra cost on a 4-layer board. This is not confirmed with JLCPCB for this board.",
      "The USB data pair is not impedance-verified. The router does not couple the pair: D+ is 17.0 mm and D- is 18.4 mm, a 1.4 mm skew.",
      "KiCad's library has no 3D model for this USB-C connector, so the viewer shows no body for it.",
      "Silkscreen reference text is oversized and overlaps. That is a current limit of the Synth exporter.",
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
        note: "Bottom copper (B.Cu), seen from below, so it is mirrored. 38 track segments and a ground pour.",
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
      { label: "Bill of materials", path: "kicad/bom.csv", note: "Reference, value, description" },
      { label: "3D model", path: "usb-uart.glb", note: "Binary glTF, as shown in the viewer" },
      { label: "Route record", path: "reports/synth-route-record.json", note: "Synth's routing run: router, settings, nets, segments, vias. Local paths replaced." },
      { label: "Design-rule check", path: "reports/kicad-drc.json", note: "KiCad 10 DRC report for the routed board" },
      { label: "Prompt", path: "prompt.md", note: "A cleaned version you can run yourself" },
      { label: "Original agent brief", path: "brief.txt", note: "Round 2, word for word, as we gave it" },
    ],
  },
];
