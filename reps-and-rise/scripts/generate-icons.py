#!/usr/bin/env python3
"""Rasterise the ember mark into the app's icon and splash assets.

The polygon list here is the same one components/EmberMark.tsx draws with
react-native-svg, so the in-app mark and the launcher icon cannot drift apart.

Usage:  python3 scripts/generate-icons.py
Requires Pillow:  pip install pillow
"""

from __future__ import annotations

import os

from PIL import Image, ImageDraw

# Keep in sync with EMBER_POLYGONS in components/EmberMark.tsx (100x100 grid).
POLYGONS = [
    ("26,6 66,2 94,26 98,62 72,94 30,96 4,66 8,30", "#3B2D24"),
    ("52,12 94,26 98,62 72,94 42,92", "#221913"),
    ("26,10 52,12 40,34 14,36", "#4A392E"),
    ("28,42 52,32 62,46 42,56", "#F2762E"),
    ("56,50 78,44 82,60 60,66", "#FFB04D"),
    ("22,62 40,58 38,74 24,72", "#D9541A"),
    ("44,38 54,36 54,45 45,47", "#FFE9C4"),
    ("62,72 74,68 72,80 62,80", "#F2762E"),
]

BACKGROUND = "#141210"
SUPERSAMPLE = 4

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGES = os.path.join(ROOT, "assets", "images")


def parse(points: str, scale: float, offset: float) -> list[tuple[float, float]]:
    pairs = []
    for pair in points.split():
        x, y = pair.split(",")
        pairs.append((float(x) * scale + offset, float(y) * scale + offset))
    return pairs


def render(size: int, background: str | None, mark_fraction: float) -> Image.Image:
    """Draw the mark centred on a square canvas.

    mark_fraction is how much of the canvas width the mark occupies, which is
    how the Android adaptive icon gets its safe-zone inset.
    """
    big = size * SUPERSAMPLE
    fill = background if background else (0, 0, 0, 0)
    image = Image.new("RGBA", (big, big), fill)
    draw = ImageDraw.Draw(image)

    span = big * mark_fraction
    scale = span / 100.0
    offset = (big - span) / 2.0

    for points, colour in POLYGONS:
        draw.polygon(parse(points, scale, offset), fill=colour)

    return image.resize((size, size), Image.LANCZOS)


def write(image: Image.Image, name: str) -> None:
    path = os.path.join(IMAGES, name)
    image.save(path, "PNG")
    print(f"wrote {os.path.relpath(path, ROOT)}  ({image.width}x{image.height})")


def main() -> None:
    os.makedirs(IMAGES, exist_ok=True)

    # iOS/store icon: opaque, mark fills most of the tile.
    write(render(1024, BACKGROUND, 0.66), "icon.png")

    # Android adaptive foreground: transparent, mark inside the 66% safe zone
    # so the launcher's circular/squircle mask never clips it.
    write(render(1024, None, 0.44), "adaptive-icon.png")

    # Splash: transparent, small — Expo scales it onto the splash background.
    write(render(1024, None, 0.52), "splash-icon.png")

    # Web favicon.
    write(render(48, BACKGROUND, 0.70), "favicon.png")


if __name__ == "__main__":
    main()
