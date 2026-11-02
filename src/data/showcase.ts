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
  keyParts: string[];
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
// Published artifacts are byte-identical to the merged Synth commit; the reports name the Synth build they came from.
const USB_REVISION = "de3613e";
const USB_MAIN_REVISION = "e6455e1";
const USB_REPORT_BUILD_REVISION = "e6455e1";
const BUCK_REVISION = "f1d3947";
const BUCK_MAIN_REVISION = "a79570c";
const BUCK_REPORT_BUILD_REVISION = "a79570c";

export const boards: Board[] = [
  {
    slug: "usb-uart",
    title: "USB-C dual UART and RS-485 adapter",
    tagline: "One USB-C cable. Two serial ports.",
    status: `Engineering draft. Not fabricated. Not tested on hardware. Reviewed by ${reviewedBy}.`,
    qualification: {
      text: "This is an engineering draft and a showcase artifact. It is not a completed Class-B qualification result: the qualification matrix is published and its Section B lists the analysis that is still open, and Synth's release gate passing is not a qualification. The matrix, the gate result and the file hashes are linked below.",
      evidence: [
        { label: "Qualification matrix and open items", path: "QUALIFICATION.md" },
        { label: "Release gate result", path: "reports/release.json" },
        { label: "SHA-256 of every published file", path: "SHA256SUMS" },
      ],
    },
    revision: USB_REVISION,
    mainRevision: USB_MAIN_REVISION,
    reportBuildRevision: USB_REPORT_BUILD_REVISION,
    reviewedBy,
    summary:
      "Intended use: a bench or lab adapter, with short cables, point-to-point or as the last node on an RS-485 bus. It is not for industrial installs, long cable runs or a node in the middle of a multidrop bus. Port 1 is TTL serial for debugging microcontroller boards: console, flashing, logs. Port 2 is RS-485 for industrial gear such as Modbus sensors, meters and motor drives, and its direction switches by itself from the bridge's DTR0/TNOW0 pin. Power comes from USB, and a jumper picks 3.3 V or 5 V I/O. Protection is on the USB side: a PRTR5V0U2X ESD array on D+ and D-, and PTVS6V0S1UR TVS diodes on VBUS, CC1 and CC2. The RS-485 pair has no external TVS or common-mode choke, and the 120 Ω termination is always in circuit. The two TX LEDs take their current from VIO and sink it into the TX lines, so they are dark while a line idles.",
    renderAlt:
      "Ray-traced 3D view of a small green circuit board with a USB-C receptacle at the top edge, a QFN chip in the middle, an RS-485 chip on the right, four mounting holes and four pin headers along the bottom edge",
    stats: [
      { label: "Overall size", value: "40.99 × 32.23 mm" },
      { label: "Layers", value: "2" },
      { label: "Nets routed", value: "26 of 26" },
      { label: "KiCad DRC", value: "0 errors, 0 warnings" },
    ],
    prompt: {
      summary:
        "A real USB-C to dual-UART and RS-485 adapter, with USB ESD and TVS protection, where every claim must be true and measured.",
      note: "There is no single prompt: the board came from a long chat plus agent briefs. The prompt below is a cleaned, self-contained version of that brief, with our local setup removed, so you can run it yourself. It is not the exact text we ran, and it describes the published board (the merged absmach/synth#103). A different run will not give an identical board.",
    },
    model: "Claude Sonnet 5.5 (claude-sonnet-5-5), run in Claude Code",
    keyParts: ["CH342F", "THVD1450"],
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
      { ref: "J1", name: "USB-C receptacle", role: "HRO TYPE-C-31-M-12: power and data in. KiCad's 3D model is not installed, so the viewer shows only its outline" },
      { ref: "H1 to H4", name: "M2.5 mounting holes", role: "Four 2.5 mm holes, two in the top corners and two at the sides" },
      { ref: "J_VIO", name: "3-pin jumper", role: "Picks 3.3 V or 5 V for the serial I/O" },
      { ref: "D3 D4 D7", name: "Lite-On LTST-C190 LEDs", role: "Green on VIO; red TX LEDs on TXD0 and TXD1, fed from VIO, so they are dark while a line idles" },
      { ref: "J2 J3 J4", name: "3-pin headers", role: "TTL serial, flow control and the RS-485 bus" },
    ],
    checks: [
      { label: "Routing", value: "26 nets connected, 0 open" },
      { label: "KiCad design-rule check", value: "0 errors, 0 warnings, 0 unconnected items, from `kicad-cli pcb drc --severity-all --refill-zones` with the project's custom rules (copper to a board edge 0.3 mm, to a hole or an NPTH hole 0.2 mm, from the JLCPCB profile). The ground pour is one connected cluster. Report: reports/usb_uart.drc.json" },
      { label: "Schematic ERC", value: "0 errors, 1 warning (a MODEM_IDLE label on more than one wire of the same net), run with the KiCad libraries installed. Report: reports/usb_uart.erc.json" },
      { label: "Release gate", value: "Passed: release_ready and fabrication_ready are true in Synth's records. That means Synth's own checks passed (routed, 0 open nets, KiCad DRC clean). It is not a manufacturing sign-off: nothing was fabricated or tested, and the fabrication note below applies. Records: reports/usb_uart.routing.json, reports/release.json" },
      { label: "Fabrication note", value: "One via-in-pad: the U1 exposed-pad ground via at (23.8, 17.3) mm needs filled and capped vias at the fab. Not confirmed with JLCPCB for this board." },
      { label: "Copper", value: "273 track segments, 43 vias, 515.4 mm. 213 segments on F.Cu and 60 on B.Cu; every via is a through via between the two copper layers." },
      { label: "Signal integrity", value: "23 warnings, none blocking: every one is a layer change with no ground return via within 1.53 mm, so the return current has to jump between the F.Cu and B.Cu pours. None is on the USB pair, which stays on F.Cu with no via. Nobody has judged them." },
      { label: "Time to route", value: "211 s, from the route record. The router is sensitive to placement: J3 at x 27.0 mm and J4 at x 36.1 mm split the ground pour and left DTR1 unrouted, and 0.5 mm shifts left other nets open. Three exports of the committed inputs gave a byte-identical board on one machine; another machine or FreeRouting version was not tried." },
      { label: "Router", value: "FreeRouting 2.4.1. Record: reports/usb_uart.routing.json" },
      { label: "Published files", value: `Board, schematic, source, layout and report files are byte-identical to absmach/synth#103 as merged, commit ${USB_REVISION} (qualification/class-b/usb-uart/). The 3D model, copper-layer SVGs, schematic SVG and the render are made from that board by KiCad 10.0.7 with the ground pours refilled.` },
      { label: "Synth build", value: `The routing and release reports were produced on Synth ${USB_REPORT_BUILD_REVISION}, the source_revision recorded in reports/release.json.` },
    ],
    limits: [
      "Two copper layers and no declared stackup: the exporter writes the 1.6 mm default. There is no inner reference plane, so a return current under an outer-layer track has to use the F.Cu or B.Cu ground pour.",
      "The USB pair is not impedance-controlled or coupled. A 90 Ω differential pair needs about 1.18 mm traces at 1.6 mm on two layers, so no impedance target is declared. Measured by the author on the committed board: both lines are on F.Cu with no via, 38.63 mm (D+) and 13.52 mm (D-), 25.11 mm of skew (about 0.2 percent of a 12 Mb/s bit), 91.4 percent of the length over solid B.Cu ground fill. Not an independent review.",
      "The signal-integrity pass reports 23 layer changes with no ground return via within 1.53 mm (V3, LED_TX1, RXD0, +3V3, CTS0_LOW, RXD1, TNOW0, MODEM_IDLE, DTR1 and VBUS). None is on the USB pair. Nobody has judged them.",
      "FreeRouting's escape analysis flags J1 and U1 (0.5 mm pitch): neither a minimum via nor a minimum track fits between adjacent pads, and it suggests 4 layers. The route completes, with the only via-in-pad at U1 pin 25.",
      "R_TERM (120 Ω 1 %) is permanently across A and B; the registry part for a 2-pin jumper (header_1x2) is not on this board. Every node on the bus is terminated whether or not it is the end node. Intended use is bench or lab, short cables, point-to-point or the last node on a bus.",
      "The RS-485 pair has no external TVS and no common-mode choke. Only the THVD1450's on-chip ±18 kV IEC contact ESD protects the bus; TI's 1 kV surge circuit is not built and the bus is not surge-tested. A surge TVS, series resistors and a selectable termination are left for a later revision.",
      "The U1 exposed-pad via needs filled and capped vias. JLCPCB has not been asked about this via. Its quote flow accepted the previous revision of the board on 2026-10-27 and the Gerbers were regenerated for this one, but the quote, BOM matching and DFM findings were not redone.",
      "No VBUS bulk capacitor, fuse, or reverse and inrush protection.",
      "J1 courtyard to the top board edge is 0.01 mm: the shell face sits 0.50 mm inside Edge.Cuts, and the enclosure cutout fit is not checked. The J1 connector datasheet was not read. The Lite-On LED numbers are second-hand. The CH342F exposed pad is 2.6 mm in the KiCad footprint and 2.4 mm in the supplier drawing. Part availability, JLCPCB assembly and the registry LCSC numbers were not checked.",
      "Header pin labels (GND, TXD1, RXD1 and so on) exist only in the schematic: Synth has no silkscreen text for them. Only the reference labels D7, J4, J_VIO and U1 are placed by hand in the sidecar.",
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
        note: "Top copper (F.Cu) with silkscreen. 213 track segments and a ground pour.",
      },
      {
        id: "bottom",
        label: "Bottom",
        file: "layer-bottom.svg",
        alt: "Bottom copper layer seen from below: a few tracks and a ground pour, with the through-hole header pads",
        note: "Bottom copper (B.Cu), seen from below, so it is mirrored. 60 track segments and a ground pour.",
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
      { label: "3D model (STEP)", path: "usb_uart.step", note: "The board and component models as a STEP assembly, for CAD and enclosure work. The connector has no installed model, so only its pads appear" },
      { label: "Route record", path: "reports/usb_uart.routing.json", note: "Synth's routing run: router, settings, nets, segments, vias" },
      { label: "Design-rule check", path: "reports/usb_uart.drc.json", note: "KiCad 10 DRC report for the routed board" },
      { label: "Schematic ERC", path: "reports/usb_uart.erc.json", note: "KiCad 10.0.7 ERC report for the generated schematic" },
      { label: "Qualification matrix", path: "QUALIFICATION.md", note: "What was checked, what was not, and what is open" },
      { label: "File hashes", path: "SHA256SUMS", note: "SHA-256 of every file in this folder except the zip" },
      { label: "Release gate result", path: "reports/release.json", note: "Synth's release gate record" },
      { label: "Prompt", path: "prompt.md", note: "A cleaned version you can run yourself" },
    ],
  },
  {
    slug: "buck",
    title: "24 V to 3.3 V buck converter",
    tagline: "24 V in. 3.3 V out. Power-good on the header.",
    status: `Engineering draft. Not fabricated. Not tested on hardware. Reviewed by ${reviewedBy}.`,
    qualification: {
      text: "This is an engineering draft and a showcase artifact. It is not a completed Class-B qualification result: the qualification matrix is published and its Section B lists the analysis that is still open, and Synth's release gate passing is not a qualification. The matrix, the gate results, the reviewer state and the file hashes are linked below.",
      evidence: [
        { label: "Qualification matrix and open items", path: "QUALIFICATION.md" },
        { label: "Release gate result", path: "reports/release.json" },
        { label: "Manufacturing-package gate result", path: "reports/release-fab.json" },
        { label: "SHA-256 of every published file", path: "SHA256SUMS" },
      ],
    },
    revision: BUCK_REVISION,
    mainRevision: BUCK_MAIN_REVISION,
    reportBuildRevision: BUCK_REPORT_BUILD_REVISION,
    reviewedBy,
    summary:
      "Intended use: a bench or prototype 24 V rail, with a 1 A load and a short input cable. It is not for automotive, industrial or mains-derived 24 V systems, and it is not a general-purpose module: the input has a PTC, a reverse-block Schottky and a TVS, but the board is not surge-tested and no thermal or loop-stability result exists. 24 V nominal (+10%, 26.4 V maximum) comes in on J1, and 3.3 V at 1 A comes out on J2, with power-good on pin 3. The converter is a TI LMR38010 at 800 kHz, with a 6.8 µH inductor and three 22 µF output capacitors. Feedback is taken from the output node, never from the switch node; the published negative twin takes it from SW, and the rule rejects it. Power-good is open drain with a 100 kΩ pull-up, and a green LED lights while PG is low. A second green LED shows the 3.3 V rail. A UVLO divider starts the converter at about 18.4 V and stops it at about 16.2 V.",
    renderAlt:
      "Ray-traced 3D view of a long green four-layer circuit board with a cylindrical electrolytic capacitor and a 2-pin connector on the left, an 8-pin regulator and a shielded inductor in the middle, and a 4-pin connector at the right edge",
    stats: [
      { label: "Overall size", value: "70.99 × 33.99 mm" },
      { label: "Layers", value: "4" },
      { label: "Nets routed", value: "13 of 13" },
      { label: "KiCad DRC", value: "0 errors, 0 warnings" },
    ],
    prompt: {
      summary:
        "A 24 V to 3.3 V, 1 A buck converter with a PTC, reverse-block Schottky and TVS on the input, power-good and thermal vias in the regulator pad, where every claim must be true and measured.",
      note: "There is no single prompt: the board came from an agent session plus hand review. The prompt below is a cleaned, self-contained version of that brief, with our local setup removed, so you can run it yourself. It is not the exact text we ran, and it describes the published board (the merged absmach/synth#110). A different run will not give an identical board.",
    },
    model: "Claude Sonnet 5.5 (claude-sonnet-5-5), run in Claude Code",
    keyParts: ["LMR38010", "SMBJ30A"],
    tools: [
      { name: "Synth MCP", use: "placement review and validation during the design; the placement review was not rerun on the final hand-pinned board" },
      { name: "Manufacturer datasheets", use: "TI, Vishay, Bourns, JST, Lite-On and Honor Elec datasheets, read from the web and cited in the qualification matrix" },
      { name: "Command line", use: "synth validate, synth registry qualify and synth export-kicad, then kicad-cli DRC, ERC, Gerber, drill, 3D render and GLB/STEP export. These did not go through MCP." },
    ],
    parts: [
      { ref: "U1", name: "TI LMR38010SDDAR", role: "24 V to 3.3 V synchronous buck, 1 A, 800 kHz, exposed pad on GND" },
      { ref: "L1", name: "Bourns SRN6045TA", role: "6.8 µH shielded inductor from SW to the output node" },
      { ref: "D1", name: "Vishay SS36", role: "3 A 60 V Schottky in series, reverse-polarity block" },
      { ref: "D2", name: "Vishay SMBJ30A", role: "600 W transient suppressor on the VIN node, 48.4 V clamp" },
      { ref: "F1", name: "Bourns MF-MSMF110/33X", role: "Resettable PTC, 1.1 A hold, 33 V maximum" },
      { ref: "C1", name: "Honor Elec 47 µF", role: "Input bulk electrolytic, 50 V" },
      { ref: "C2 C3", name: "10 µF and 220 nF", role: "50 V X7R ceramics at the VIN pin" },
      { ref: "C5 C6 C9", name: "3 × 22 µF", role: "25 V X7R output ceramics" },
      { ref: "R_UV_T R_UV_B", name: "1.37 MΩ and 100 kΩ", role: "UVLO divider: 18.4 V start, 16.2 V stop, typical" },
      { ref: "R_FB_T R_FB_B C7", name: "100 kΩ, 43.2 kΩ and 56 pF", role: "Feedback divider from the output node, 3.315 V typical" },
      { ref: "R_RT", name: "33 kΩ", role: "Sets the switching frequency to 800 kHz" },
      { ref: "R_PG", name: "100 kΩ", role: "Open-drain power-good pull-up to 3.3 V" },
      { ref: "D3 D4", name: "Lite-On LTST-C190KGKT", role: "Green power LED and green PG-fault LED, 470 Ω each; D4 is lit while PG is low" },
      { ref: "J1 J2", name: "JST XH", role: "2-pin 24 V input and 4-pin output: 3.3 V, GND, power-good, GND" },
      { ref: "H1 H2", name: "M2.5 mounting holes", role: "Non-plated holes in opposite corners" },
    ],
    checks: [
      { label: "Routing", value: "13 nets connected, 0 open; 97 segments, 21 vias, 200.08 mm of copper. Every segment is on F.Cu and all 21 vias are GND, six of them in U1's pad. Record: reports/buck.routing.json" },
      { label: "KiCad design-rule check", value: "0 errors, 0 warnings, 0 unconnected items, from `kicad-cli pcb drc --severity-all --refill-zones` with the project's custom rules (copper to a board edge 0.3 mm, to a hole or an NPTH hole 0.2 mm, from the JLCPCB profile). The ground pour is stored filled. Report: reports/buck.kicad-drc.json" },
      { label: "Schematic ERC", value: "0 violations, run with the KiCad libraries installed. Report: reports/buck.kicad-erc.json" },
      { label: "Release gate", value: "Passed: release_ready and fabrication_ready are true in Synth's records. That means Synth's own checks passed (routed, 0 open nets, KiCad DRC clean). It is not a manufacturing sign-off: nothing was fabricated or tested, and the fabrication note below applies. Records: reports/release.json, reports/release-fab.json, reports/buck.routing.json" },
      { label: "Fabrication note", value: "Six vias in U1's exposed pad are via-in-pad. The board declares jlc-filled-via and requires filled and capped vias. Not confirmed with a fab." },
      { label: "Manufacturing gate disagreement", value: "`synth check --fab` does not agree: that stage routes with KiCadRoutingTools, whose copper leaves 11 signal vias without a ground return via within 0.64 mm, so it fails manufacturing. The published board was routed with FreeRouting and has no W-SYNTH-DRC-016 finding. The qualification matrix keeps expect_fab = fail for that reason." },
      { label: "Part reviews", value: "Eight of the board's nine registry parts are covered by `synth registry qualify`, and all eight qualify (record: reports/registry-qualify.txt). LMR38010 and LTST-C190KGKT were reviewed on 2026-10-29, the rest of the reviewed parts on 2026-10-28. The generic passives and the mounting holes have no MPN or review record." },
      { label: "Published files", value: `Board, schematic, source, layout and report files are copied from absmach/synth#110 as merged, revision ${BUCK_REVISION} (qualification/class-b/buck/). The LMR38010 and LTST-C190KGKT reviewer-status paragraphs in QUALIFICATION.md are corrected to match the registry; the same fix is in absmach/synth#404. The 3D model, copper-layer SVGs, schematic SVG and the render are made from that board by KiCad 10.0.7 with the ground pours refilled.` },
      { label: "Synth build", value: `The routing and release reports were produced on Synth ${BUCK_REPORT_BUILD_REVISION}, the source_revision recorded in reports/buck.routing.json.` },
    ],
    limits: [
      "Four copper layers on KiCad's default 1.6 mm stackup, with GND pours on all four. There is no declared stackup and no controlled-impedance net.",
      "No thermal result. Synth's thermal-relief analysis is unsupported (the relief gap and spoke width are export defaults), U1's exposed pad carries six 0.3 mm vias where TI's datasheet asks for at least a 4 × 3 array of 10 mil vias, and no junction temperature is estimated. The datasheet's RθJA is not valid for design.",
      "The six vias in U1's pad are via-in-pad. The board declares jlc-filled-via and requires filled and capped vias; no fab has confirmed it.",
      "Input transient protection is datasheet-only. The SMBJ30A clamps at 48.4 V against the regulator's 85 V absolute maximum, but nothing was surge-tested, no IEC 61000-4-5 rating is claimed, and a sustained overvoltage relies on the PTC and the 50 V capacitors.",
      "Filtering and loop stability are unverified. TI's datasheet table has no 3.3 V row, the DC-bias derating of C2, C5, C6 and C9 is unknown, and crossover, phase margin and load-transient response were not computed or measured.",
      "Power-good behaviour is unverified. The connection, pull-up and LED are proven; the 110/112/114 % rising and 90/92/94 % falling thresholds, the 40 µs glitch filter and the 4 ms start-up delay are datasheet numbers that nothing here checks.",
      "Return-path analysis is a proximity test only. Every layer change is a GND via (all 21 vias are GND), and W-SYNTH-DRC-016 finds none within 0.64 mm, but Synth's capability descriptor still declares return-path analysis unsupported.",
      "The placement is hand-pinned and not scored. C3 is 0.82 mm and C2 1.46 mm from U1's VIN pad, and C5/C6/C9 are 0.83/2.29/0.70 mm from L1's output pad; R_PG is 22.63 mm from the PG pin and R_FB_B's ground is 11.31 mm from U1 GND, both left as they are.",
      "Synth's two gates disagree. `synth check --fab` (KiCadRoutingTools) fails manufacturing with 11 signal vias without a ground return via within 0.64 mm, while the published FreeRouting board has none; the matrix row keeps expect_fab = fail.",
      "Schematic readability is scored, not tidy: 0 overlapping text pairs, 7 texts with a wire through them and 1 wire crossing.",
      "The comment block in buck.synth still says there are no vias in U1's pad. The placement sidecar adds six, and the exported PCB and connectivity report list them.",
      "Nothing was fabricated, powered or measured. The generic passives have no MPN and no LCSC number, availability was not checked, and no human reference layout was compared.",
      "Earlier outlines were 58.0 × 32.6, 70.99 × 31.1 and 60.75 × 31.9 mm. The current 70.99 × 33.99 mm follows the pinned parts and corner holes, and the cause of the final size was not isolated.",
    ],
    source: { file: "buck.synth" },
    schematicAlt:
      "Schematic of the board: the input connector and protection, the UVLO divider, the LMR38010 buck with its inductor and output capacitors, the feedback divider, the power-good LEDs and the output connector, each in its own colored group box",
    layers: [
      {
        id: "top",
        label: "Top",
        file: "layer-top.svg",
        alt: "Top copper layer with silkscreen: the input protection and connector on the left, the regulator and inductor in the middle, the output capacitors and connector on the right, over a ground pour",
        note: "Top copper (F.Cu) with silkscreen. 97 track segments, six thermal vias in U1's pad and a ground pour.",
      },
      {
        id: "inner1",
        label: "Inner 1",
        file: "layer-inner1.svg",
        alt: "Inner layer 1: a continuous ground plane with the through-hole connector pads",
        note: "Inner copper (In1.Cu), a GND pour.",
      },
      {
        id: "inner2",
        label: "Inner 2",
        file: "layer-inner2.svg",
        alt: "Inner layer 2: a second continuous ground plane with the through-hole connector pads",
        note: "Inner copper (In2.Cu), a GND pour.",
      },
      {
        id: "bottom",
        label: "Bottom",
        file: "layer-bottom.svg",
        alt: "Bottom copper layer seen from below: a ground plane with the through-hole connector pads",
        note: "Bottom copper (B.Cu), seen from below, so it is mirrored. A GND pour.",
      },
    ],
    assets: {
      glb: "buck.glb",
      render: "render-3d.png",
      schematic: "schematic.svg",
    },
    files: [
      { label: "Design source", path: "buck.synth", note: "The .synth file Synth compiles" },
      { label: "Negative twin", path: "buck_neg_fb_sw.synth", note: "The feedback-from-SW twin that must fail with E-SYNTH-POWER-011" },
      { label: "Placement layout", path: "buck.placement.layout.toml", note: "Where each part sits on the board, in board millimetres" },
      { label: "KiCad PCB", path: "kicad/buck.kicad_pcb", note: "Routed board" },
      { label: "KiCad schematic", path: "kicad/buck.kicad_sch", note: "Generated sheet" },
      { label: "KiCad symbols", path: "kicad/buck.kicad_sym", note: "Generated symbol library" },
      { label: "KiCad project", path: "kicad/buck.kicad_pro", note: "Project settings" },
      { label: "KiCad custom rules", path: "kicad/buck.kicad_dru", note: "Copper to a board edge 0.3 mm, to a hole or NPTH hole 0.2 mm, from the manufacturer profile" },
      { label: "Bill of materials", path: "kicad/bom.csv", note: "Reference, value, description" },
      { label: "Symbol library table", path: "kicad/sym-lib-table", note: "The symbol libraries the generated schematic uses" },
      { label: "3D model", path: "buck.glb", note: "Binary glTF, as shown in the viewer" },
      { label: "3D model (STEP)", path: "buck.step", note: "The board and component models as a STEP assembly, for CAD and enclosure work" },
      { label: "Route record", path: "reports/buck.routing.json", note: "Synth's routing run: router, settings, nets, segments, vias" },
      { label: "Connectivity report", path: "reports/buck.connectivity.json", note: "Net-by-net connectivity and the via-in-pad list" },
      { label: "Registry qualification", path: "reports/registry-qualify.txt", note: "synth registry qualify output for the eight parts it covers" },
      { label: "Design-rule check", path: "reports/buck.kicad-drc.json", note: "KiCad 10 DRC report for the routed board" },
      { label: "Schematic ERC", path: "reports/buck.kicad-erc.json", note: "KiCad 10.0.7 ERC report for the generated schematic" },
      { label: "Release gate result", path: "reports/release.json", note: "Synth's source and DRC release record" },
      { label: "Manufacturing-package gate result", path: "reports/release-fab.json", note: "Synth's record for the Gerber, drill and pick-and-place package" },
      { label: "Qualification matrix", path: "QUALIFICATION.md", note: "What was checked, what was not, and what is open. Published as merged; its reproduce section and the Gerber, drill, pick-and-place and pad-gap files live in absmach/synth#110" },
      { label: "File hashes", path: "SHA256SUMS", note: "SHA-256 of every file in this folder except the zip. Regenerated for this folder; the matrix's hash paragraph describes the Synth repository copy" },
      { label: "Prompt", path: "prompt.md", note: "A cleaned version you can run yourself" },
    ],
  },
];
