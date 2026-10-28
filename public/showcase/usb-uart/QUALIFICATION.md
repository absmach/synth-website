# Qualification matrix: USB-C dual UART + RS-485 adapter (SYN-66)

**Status: requires expert review. This is not a completed qualification result.**
Nothing here was fabricated or powered. Section A lists what Synth or KiCad checked and the evidence. Section B lists what no tool here proves and an SI/PI/RF or manufacturing expert has to sign off. No expert has reviewed this board.

The board is absmach/synth#103 as merged (commit de3613e). It is a two-layer board and routes with 0 open nets; it passes Synth's release gate (`release_ready: true` in `reports/release.json`, see A4). A passed gate means the tool's checks passed; it is not a qualification. The previous revision was four layers, but its In1.Cu and In2.Cu carried no routing (all 255 segments were on F.Cu and B.Cu), so they were removed rather than kept as unused planes.

## Reproduce

Run from the repository root of absmach/synth at de3613e. The reports were produced with Synth `main` e6455e1 (`source_revision` in `reports/release.json`). Use an empty `XDG_DATA_HOME` so a user registry cannot shadow parts.

```
export XDG_DATA_HOME=$(mktemp -d)
scripts/setup-routing-engines.sh --freerouting-only
synth validate qualification/class-b/usb-uart/usb_uart.synth
synth export-kicad qualification/class-b/usb-uart/usb_uart.synth --out <dir> --router free-routing --krt-allow-via-in-pad
kicad-cli pcb drc --severity-all --refill-zones --format json <dir>/usb_uart.kicad_pcb
kicad-cli sch erc --severity-all --format json <dir>/usb_uart.kicad_sch
(cd qualification/class-b/usb-uart && sha256sum -c SHA256SUMS)
```

Tool versions used: KiCad 10.0.7 for the DRC, the ERC and the published SVGs, render, GLB and STEP; FreeRouting 2.4.1 on OpenJDK 25.0.4.1, Synth `main` e6455e1, on 2026-10-27. Three exports of the committed inputs gave a byte-identical PCB on that machine; another machine or FreeRouting or KiCad version was not tried. Routing is sensitive to placement: J3 at x 27.0 mm and J4 at x 36.1 mm split the ground pour and left DTR1 unrouted, and other 0.5 mm shifts left +3V3, TNOW0 or USB_DN open, so the committed placement (J3 at 26.0 mm, J4 at 35.1 mm) is one that routes, not a tolerance.

## Artifact hashes

`SHA256SUMS` in this folder lists every published file except the zip and itself. The key ones:

| Artifact | SHA-256 |
| --- | --- |
| `usb_uart.synth` | `e814e04cbe0e8262da7efc62f0edbd28b3656e76046f1ea1b31f05ef5aa0afde` |
| `usb_uart.placement.layout.toml` | `8e18ab25c177f36d6fe2e38af55cf27bc293096fc212a90893d0cb15336a583d` |
| `kicad/usb_uart.kicad_pcb` | `881ae8349543e44cc1b4da7847152cb46610757ee40c5888e1ab259817d8652a` |
| `kicad/usb_uart.kicad_sch` | `d92e6c11c94f279f0ceafbc81c848d775be112f618914af4caef9cf0b8f96a0f` |
| `kicad/bom.csv` | `a31eca59db4cebdace543fac91243b759232a423a18428d544bce109c23ec462` |
| `reports/release.json` | `38f18f79c3c932b37a6dce65cdd63f9599ca2f8a8a81032ad5f3fca53ae5e4db` |
| `reports/usb_uart.drc.json` | `466d3692d6022c2e65053555bc220c7cfa4a82b3b04653be906f7a9f2300abb2` |
| `reports/usb_uart.erc.json` | `cd5845d0f09bac128afbc6c443be6915f97407d97288a28e150cf8fcab951dde` |

`reports/` holds the files as captured; artifact paths inside them are relative to the machine that produced them. The hashes in `SHA256SUMS` are of the published files.

## A. Checked by tools

| # | Claim | Evidence | Result |
| --- | --- | --- | --- |
| A1 | The source parses, resolves and lowers | `synth validate` | No errors. Warnings only: E-SYNTH-POWER-004 x2, E-SYNTH-SCHEM-005 x2, W-SYNTH-ANOMALY-001, W-SYNTH-SUPPLY-002 x8, W-SYNTH-PART-UNVERIFIED x9 (as listed in the board's README at de3613e) |
| A2 | Every net is connected end to end | Synth connectivity re-derived from copper, in `reports/usb_uart.routing.json` (`validation.connectivity`) | 26 nets connected, 0 open, 0 unconnected pads. One via-in-pad is recorded: U1 pin 25 (the exposed pad) |
| A3 | No KiCad DRC rule violation on the routed board | `kicad-cli pcb drc --severity-all --refill-zones` on the delivered board, `reports/usb_uart.drc.json` | 0 errors, 0 warnings, 0 unconnected items. pcbnew's connectivity puts every GND pad and via in one cluster; an earlier revision had a real GND split that the gate hid, and the gate now blocks on it. Run with the project's `usb_uart.kicad_dru` (copper to a board edge 0.3 mm, to a hole or an NPTH hole 0.2 mm, from the JLCPCB profile) |
| A4 | The package passes Synth's release gate | `synth export-kicad`, `reports/release.json` | **Yes**: `release_ready` and `route_complete` are true, 0 open nets, and `fabrication_ready` is true in the routing record. A passed gate is not a qualification |
| A5 | Schematic electrical rules | `kicad-cli sch erc`, `reports/usb_uart.erc.json` | 0 errors, 1 warning (`label_multiple_wires`: the MODEM_IDLE label touches several wires, all of that net), run with the KiCad libraries installed. VIO carries a PWR_FLAG |
| A6 | Routing is complete | `reports/usb_uart.routing.json` | FreeRouting 2.4.1: 26 nets, 273 track segments (213 F.Cu, 60 B.Cu), 43 through vias, 515.4 mm of copper, 211 s |
| A7 | The board is two layers | `kicad/usb_uart.kicad_pcb` | `F.Cu` and `B.Cu` only, 1.6 mm thick, a GND pour on both. No inner copper |

## B. Not proven: needs expert review

| # | Claim | Why it is not proven | Status |
| --- | --- | --- | --- |
| B1 | USB D+/D- is a controlled-impedance pair | No impedance target is declared, and none can be met: at 1.6 mm on two layers a 90 ohm differential pair needs about 1.18 mm traces. The pair is routed at 0.242 mm and is not coupled; the closest gap between the two lines is 0.13 mm | Requires expert review |
| B2 | USB return path and layer transitions | With no inner planes, the return path is the F.Cu/B.Cu ground pour. The signal-integrity pass (`signal_integrity` in `reports/release.json`, 0 blocking, 23 warnings) reports 23 layer changes with no ground return via within 1.53 mm, on V3 (4), LED_TX1 (4), RXD0 (3), +3V3 (3), CTS0_LOW (2), RXD1 (2), TNOW0 (2), MODEM_IDLE, DTR1 and VBUS. None is on USB_DP or USB_DN. Nobody has judged whether these matter at these speeds | Requires expert review |
| B3 | USB coupling and skew | The pair is left as the router produced it: not coupled. The author measured both lines on F.Cu with no via: D+ 38.63 mm, D- 13.52 mm, 25.11 mm of skew (about 0.2 percent of a 12 Mb/s bit), 91.4 percent of the length over solid B.Cu GND fill. These are not an independent review. The chip is full speed (12 Mb/s) | Requires expert review |
| B4 | RS-485 surge protection (IEC 61000-4-5) | There is no external TVS on A or B and no series pulse-proof resistor; only the THVD1450's on-chip +/-18 kV IEC contact ESD protects the bus. TI's 1 kV circuit (SLLSEY3E figure 37) is not built | Requires expert review |
| B5 | RS-485 common-mode range, bias and fail-safe | Relies on the THVD1450's own fail-safe. No bias network, no common-mode choke | Requires expert review |
| B6 | RS-485 termination | R_TERM (120 ohm 1 %) is permanently across A and B. Every node on the bus is terminated whether or not it is the end node; the registry parts for a selectable termination (`header_1x2`) and A/B surge protection are not on this board. Intended use is bench or lab, short cables, point-to-point or the last node on a bus | Requires expert review |
| B7 | Power integrity | LDO, VBUS and VIO rails, decoupling placement and loop areas were not analysed. No VBUS bulk capacitor, fuse, reverse or inrush protection | Requires expert review |
| B8 | Via-in-pad fabrication | The U1 exposed-pad via (at 23.8, 17.3 mm) needs a filled and capped via. JLCPCB has not been asked about this via. Its quote flow accepted the previous revision of the board on 2026-10-27, and the quote, BOM matching and DFM findings were not redone for this one | Requires manufacturer confirmation |
| B9 | Clearance at the 0.5 mm-pitch J1 and U1 pads | The router works to 0.127 mm, the JLCPCB minimum. FreeRouting's escape analysis says neither a fabrication-floor via nor a minimum track fits between adjacent pads on either part and suggests 4 layers. The route completes on two layers with one via-in-pad. Whether 0.127 mm clearance is acceptable for this order is for the fab and a reviewer to confirm | Requires review |
| B10 | Thermal, EMC and the two-layer stackup | Not analysed. No declared stackup; the exporter writes the 1.6 mm default | Requires expert review |
| B11 | Function on real hardware | Nothing was powered, programmed or measured | Not done |
| B12 | Datasheet and part currency | The J1 connector datasheet was not read, so its pinout and ratings are the KiCad footprint only. The Lite-On LED numbers are second-hand. CH342F V1E is the newest sheet found; its exposed pad is 2.6 mm in the KiCad footprint and 2.4 mm in the supplier drawing. LCSC numbers, stock and JLCPCB assembly were not checked | Not done |
| B13 | J1 courtyard to the top board edge | 0.01 mm: the shell face sits 0.50 mm inside Edge.Cuts and the 0.01 mm is the courtyard margin. The enclosure cutout fit is not checked | Requires mechanical review |

Rows B1-B10 are the ones that decide whether this board meets a Class-B bar (issue #38 treats missing SI/PI/RF evidence as a failure). They are open.
