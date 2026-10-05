#!/usr/bin/env python3
"""Rebuild the hero's real RP2350 board artwork with KiCad's SVG plotter.

Only colors and SVG metadata are changed. All copper and silkscreen geometry
comes from the source board, which is a design review example, not a claim of
production readiness. Requires kicad-cli; no third-party Python packages.
"""

from copy import deepcopy
from pathlib import Path
import argparse
import re
import subprocess
import tempfile
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_BOARD = ROOT.parent / "synth/examples/rp2350/rp2350_devboard_freerouting_clean.kicad_pcb"
SVG_NS = "http://www.w3.org/2000/svg"
ET.register_namespace("", SVG_NS)


def tag(name):
    return f"{{{SVG_NS}}}{name}"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--board", type=Path, default=DEFAULT_BOARD)
    parser.add_argument("--output", type=Path, default=ROOT / "public/images/synth-board.svg")
    args = parser.parse_args()

    # Source Edge.Cuts spans x=0..84.44 mm and y=0..73 mm. A small margin
    # preserves the full edge stroke without adding framing to the asset.
    svg = ET.Element(tag("svg"), {
        "viewBox": "-0.15 -0.15 84.74 73.30",
        "width": "1017", "height": "880", "fill": "none",
        "role": "img", "aria-labelledby": "board-title board-description",
    })
    svg.append(ET.Comment(
        " Authentic Synth RP2350 development board design-review example. "
        "Source: synth/examples/rp2350/rp2350_devboard_freerouting_clean.kicad_pcb. "
        "Exported using kicad-cli pcb export svg, recolored by "
        "scripts/generate-board-art.py. All copper, pads, vias, silkscreen, "
        "and board-edge geometry are from the original KiCad design. "
        "The dark rectangle follows the original 84.44 x 73 mm board outline. "
        "This artwork does not assert manufacturing or production readiness. "
    ))
    ET.SubElement(svg, tag("title"), {"id": "board-title"}).text = "Synth RP2350 development board"
    ET.SubElement(svg, tag("desc"), {"id": "board-description"}).text = (
        "An actual Synth example PCB, showing front copper in lime, back copper "
        "in teal, and cream component markings on dark green substrate. "
        "Design review artifact."
    )
    ET.SubElement(svg, tag("rect"), {
        "x": "0", "y": "0", "width": "84.44", "height": "73", "fill": "#13251c",
    })

    layers = [
        ("B_Cu", "back-copper", "#39765e"),
        ("F_Cu", "front-copper", "#b9ef82"),
        ("F_Silkscreen", "silkscreen", "#e5e9d8"),
        ("Edge_Cuts", "board-outline", "#718d70"),
    ]
    with tempfile.TemporaryDirectory(prefix="synth-board-svg-") as output_dir:
        subprocess.run([
            "kicad-cli", "pcb", "export", "svg", "--layers", "B.Cu,F.Cu,F.SilkS,Edge.Cuts",
            "--mode-multi", "--page-size-mode", "2", "--exclude-drawing-sheet",
            "--drill-shape-opt", "2", "--output", output_dir, str(args.board),
        ], check=True)
        for suffix, group_id, color in layers:
            source = ET.parse(Path(output_dir) / f"{args.board.stem}-{suffix}.svg").getroot()
            group = ET.SubElement(svg, tag("g"), {"id": group_id})
            for child in source:
                if child.tag != tag("g"):
                    continue
                child = deepcopy(child)
                for element in child.iter():
                    if "style" in element.attrib:
                        # Filled copper pours are long polygon paths; give
                        # them a quiet substrate tone so fine tracks remain
                        # readable at hero scale. Pads retain the copper color.
                        is_pour = (
                            group_id in ("front-copper", "back-copper")
                            and len(element.get("d", "")) > 1000
                            and "fill-rule:evenodd" in element.get("style", "")
                        )
                        def recolor(match):
                            original = match.group(0).lower()
                            if original in ("#ffffff", "#000000"):
                                return "#13251c"
                            if is_pour:
                                return "#1c3325" if group_id == "front-copper" else "#172c22"
                            return color
                        element.set("style", re.sub(r"#[a-fA-F0-9]{6}", recolor, element.get("style")))
                        if is_pour:
                            element.set("opacity", "0.72")
                    # KiCad includes invisible selectable text and its exact
                    # stroke outlines. Retain the outlines; omit hidden text.
                    for descendant in list(element):
                        if descendant.tag == tag("text") and descendant.get("opacity") == "0":
                            element.remove(descendant)
                group.append(child)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    ET.ElementTree(svg).write(args.output, encoding="utf-8", xml_declaration=True)
    print(f"Wrote {args.output} ({args.output.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
