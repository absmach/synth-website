# Qualification matrix: USB-C dual UART + RS-485 adapter (SYN-66)

**Status: requires expert review. This is not a completed qualification result.**
Nothing here was fabricated or powered. Section A lists what Synth or KiCad checked and the evidence. Section B lists what no tool here proves and an SI/PI/RF or manufacturing expert has to sign off. No expert has reviewed this board.

Revision A is a two-layer board and routes with 0 open nets; it passes Synth's release gate (`release_ready: true` in `reports/release.json`, see A4). A passed gate means the tool's checks passed; it is not a qualification. The previous revision was four layers, but its In1.Cu and In2.Cu carried no routing (all 255 segments were on F.Cu and B.Cu), so they were removed rather than kept as unused planes.

## Reproduce

Run from the repository root. Use Synth `main` 1eac8a1 plus PR #103 at 7a0f3b3. Use an empty `XDG_DATA_HOME` so a user registry cannot shadow parts.

```
export XDG_DATA_HOME=$(mktemp -d)
scripts/setup-routing-engines.sh --freerouting-only
synth validate qualification/class-b/usb-uart/usb_uart.synth
synth export-kicad qualification/class-b/usb-uart/usb_uart.synth --out <dir> --router free-routing --krt-allow-via-in-pad
kicad-cli pcb drc --severity-all --refill-zones --format json <dir>/usb_uart.kicad_pcb
kicad-cli sch erc --severity-all --format json <dir>/usb_uart.kicad_sch
(cd qualification/class-b/usb-uart && sha256sum -c SHA256SUMS)
```

Tool versions used: KiCad 10.0.7 for the DRC, the ERC and the published SVGs, render, GLB and STEP; `release.json` records `kicad_version` 10.0.5 for the export. FreeRouting 2.4.1 on OpenJDK 25.0.4.1, Synth `main` 1eac8a1 plus the export changes in PR #103 at 7a0f3b3, on 2026-10-24. Routing is not bit-for-bit repeatable across placements: J3 at its earlier x 25.56 mm left DTR1 open, and the committed placement moves J3 and J4 1.44 mm right.

## Artifact hashes

`SHA256SUMS` in this folder lists every published file except the zip and itself. The key ones:

| Artifact | SHA-256 |
| --- | --- |
| `usb_uart.synth` | `4872d7cdbfc0f8e401a251a0c6fc0168c30353d014cb4218925bad60191c9c16` |
| `usb_uart.placement.layout.toml` | `2da76977947d68423f8c0f8eaf33158e1d4f1492cf19feb5458ea32c1e6d12f6` |
| `kicad/usb_uart.kicad_pcb` | `d9a4465eb42699d54587f513f1c7e37950f20b009dfd8822bec476d8d813482d` |
| `kicad/usb_uart.kicad_sch` | `9a7a04d2618c3d05bbaf3ec1f291ffb55b817f717025b323ef4c177d9de91354` |
| `kicad/bom.csv` | `a31eca59db4cebdace543fac91243b759232a423a18428d544bce109c23ec462` |
| `reports/release.json` | `96e6d6f741cd5f676c4438f0d28531248f6eeb08d810bf5e5e3dcf448525f57b` |
| `reports/usb_uart.drc.json` | `4267998b9c245a7f4125ac508a150c6cd4ba356a29b8a45729bffb9c54429e03` |
| `reports/usb_uart.erc.json` | `682b6d986cdf1e966be344ce0b9c48667cf746b2417326e2cb9744f2dbf584a4` |

`reports/` holds the files as captured; artifact paths inside them are relative to the machine that produced them. The hashes in `SHA256SUMS` are of the published files.

## A. Checked by tools

| # | Claim | Evidence | Result |
| --- | --- | --- | --- |
| A1 | The source parses, resolves and lowers | `synth validate` | No errors. Warnings only: E-SYNTH-POWER-004 x2, E-SYNTH-SCHEM-005 x2, W-SYNTH-ANOMALY-001, W-SYNTH-SUPPLY-002 x8, W-SYNTH-PART-UNVERIFIED x9 |
| A2 | Every net is connected end to end | Synth connectivity re-derived from copper, in `reports/usb_uart.routing.json` (`validation.connectivity`) | 26 nets connected, 0 open, 0 unconnected pads. One via-in-pad is recorded: U1 pin 25 (the exposed pad). The route record carries no separate connectivity report (`connectivity_report: null`), so this result is the one Synth derived during the route; `synth drc` re-routes and cannot produce a report for this exact board |
| A3 | No KiCad DRC rule violation on the routed board | `kicad-cli pcb drc --severity-all --refill-zones` on the delivered board, `reports/usb_uart.drc.json` | 0 errors, 0 unconnected, 39 warnings: 36 footprint library links, 2 silkscreen over copper, 1 silkscreen overlap. The raw report also lists one F.Cu GND zone against itself as an unconnected item; no two objects are missing a connection, so Synth's gate keeps it as a warning. Run with the project's `usb_uart.kicad_dru` (copper to a board edge 0.3 mm, to a hole or an NPTH hole 0.2 mm, from the JLCPCB profile) |
| A4 | The package passes Synth's release gate | `synth export-kicad`, `reports/release.json` | **Yes**: `release_ready` and `route_complete` are true, 0 open nets, and `fabrication_ready` is true in the routing record. A passed gate is not a qualification |
| A5 | Schematic electrical rules | `kicad-cli sch erc`, `reports/usb_uart.erc.json` | 1 error (`power_pin_not_driven` on the VIO symbol, a jumper-selected rail), 119 warnings: 81 symbol-library link issues, 36 footprint links, 1 label on multiple wires, 1 net with multiple names |
| A6 | Routing is complete | `reports/usb_uart.routing.json` | FreeRouting 2.4.1: 26 nets, 271 track segments (241 F.Cu, 30 B.Cu), 38 through vias, 507.7 mm of copper, 148 s |
| A7 | The board is two layers | `kicad/usb_uart.kicad_pcb` | `F.Cu` and `B.Cu` only, 1.6 mm thick, a GND pour on both. No inner copper |

## B. Not proven: needs expert review

| # | Claim | Why it is not proven | Status |
| --- | --- | --- | --- |
| B1 | USB D+/D- is a controlled-impedance pair | No impedance target is declared, and none can be met: at 1.6 mm on two layers a 90 ohm differential pair needs about 1.18 mm traces. The pair is routed at 0.242 mm and is not coupled | Requires expert review |
| B2 | USB return path and layer transitions | With no inner planes, the return path is the F.Cu/B.Cu ground pour. The signal-integrity pass (`signal_integrity` in `reports/release.json`, 0 blocking, 15 warnings) reports 15 layer changes with no ground return via within 1.53 mm, on CC2 (2), MODEM_IDLE (2), CTS1 (2), RXD0 (2), +3V3 (2), RXD1, RXD1_MCU, DTR1, LED_TX1 and VBUS. It does not name USB_DP or USB_DN. Nobody has judged whether these matter at these speeds | Requires expert review |
| B3 | USB coupling and skew | The pair is left as the router produced it: not coupled, no length or skew measurement. The chip is full speed (12 Mb/s) | Requires expert review |
| B4 | RS-485 surge protection (IEC 61000-4-5) | There is no external TVS on A or B and no series pulse-proof resistor; only the THVD1450's on-chip +/-18 kV IEC contact ESD protects the bus. TI's 1 kV circuit (SLLSEY3E figure 37) is not built | Requires expert review |
| B5 | RS-485 common-mode range, bias and fail-safe | Relies on the THVD1450's own fail-safe. No bias network, no common-mode choke | Requires expert review |
| B6 | RS-485 termination | R_TERM (120 ohm 1 %) is permanently across A and B. Every node on the bus is terminated whether or not it is the end node; the registry has no 2-pin header for a jumper | Requires expert review |
| B7 | Power integrity | LDO, VBUS and VIO rails, decoupling placement and loop areas were not analysed. No VBUS bulk capacitor, fuse, reverse or inrush protection | Requires expert review |
| B8 | Via-in-pad fabrication | The U1 exposed-pad via (0.6 mm pad / 0.3 mm drill, at 23.8, 17.2 mm) needs a filled and capped via. JLCPCB offers it as a paid option, but has not been asked about this board | Requires manufacturer confirmation |
| B9 | Clearance at the 0.5 mm-pitch J1 and U1 pads | The router works to 0.127 mm, the JLCPCB minimum. FreeRouting's escape analysis says neither a fabrication-floor via nor a minimum track fits between adjacent pads on either part and suggests 4 layers. The route completes on two layers with one via-in-pad. Whether 0.127 mm clearance is acceptable for this order is for the fab and a reviewer to confirm | Requires review |
| B10 | Thermal, EMC and the two-layer stackup | Not analysed. No declared stackup; the exporter writes the 1.6 mm default | Requires expert review |
| B11 | Function on real hardware | Nothing was powered, programmed or measured | Not done |
| B12 | Datasheet and part currency | The J1 connector datasheet was not read, so its pinout and ratings are the KiCad footprint only. The Lite-On LED numbers are second-hand. CH342F V1E is the newest sheet found; its exposed pad is 2.6 mm in the KiCad footprint and 2.4 mm in the supplier drawing. LCSC numbers, stock and JLCPCB assembly were not checked | Not done |

Rows B1-B10 are the ones that decide whether this board meets a Class-B bar (issue #38 treats missing SI/PI/RF evidence as a failure). They are open.
