#!/usr/bin/env python3
"""Sample the dominant colors from brand material (slides, posts, logos).

Usage:
  python sample_colors.py slide1.png slide2.png [--colors 8]

Prints each image's dominant colors as hex with their share of the image,
then a merged palette across all images. Needs Pillow (`pip install pillow`).
Near-duplicate colors (e.g. anti-aliasing shades) are merged.

Exit codes: 0 success; 2 usage or input error (no arguments, bad --colors,
unreadable image, Pillow missing).
"""
from __future__ import annotations

import sys
from collections import Counter

try:
    from PIL import Image
except ImportError:  # pragma: no cover - environment dependent
    Image = None  # reported in main(), after argument checks


def hexify(rgb: tuple[int, int, int]) -> str:
    return "#{:02X}{:02X}{:02X}".format(*rgb)


def distance(a: tuple[int, int, int], b: tuple[int, int, int]) -> float:
    return sum((x - y) ** 2 for x, y in zip(a, b)) ** 0.5


def dominant(path: str, n: int) -> list[tuple[tuple[int, int, int], float]]:
    img = Image.open(path).convert("RGB")
    img.thumbnail((300, 300))
    quant = img.quantize(colors=n * 2, method=Image.Quantize.MEDIANCUT)
    palette = quant.getpalette() or []
    pixels = quant.get_flattened_data() if hasattr(quant, "get_flattened_data") else quant.getdata()
    counts = Counter(pixels)
    total = sum(counts.values())
    colors: list[tuple[tuple[int, int, int], float]] = []
    for idx, count in counts.most_common():
        rgb = tuple(palette[idx * 3: idx * 3 + 3])
        share = count / total
        for i, (existing, s) in enumerate(colors):
            if distance(existing, rgb) < 24:
                colors[i] = (existing, s + share)
                break
        else:
            colors.append((rgb, share))  # type: ignore[arg-type]
    colors.sort(key=lambda c: c[1], reverse=True)
    return colors[:n]


def main(argv: list[str]) -> int:
    n = 8
    if "--colors" in argv:
        i = argv.index("--colors")
        try:
            n = int(argv[i + 1])
            if not 1 <= n <= 128:
                raise ValueError
        except (IndexError, ValueError):
            print("ERROR  --colors needs a whole number from 1 to 128, e.g. --colors 6", file=sys.stderr)
            return 2
        del argv[i:i + 2]
    if not argv:
        print(__doc__)
        return 2
    if Image is None:
        print("Pillow is required: pip install pillow", file=sys.stderr)
        return 2
    for path in argv:
        try:
            with Image.open(path) as probe:
                probe.verify()
        except (OSError, ValueError) as exc:  # missing file, directory, or not an image
            print(f"ERROR  cannot read image {path}: {exc}", file=sys.stderr)
            return 2
    merged: list[tuple[tuple[int, int, int], float]] = []
    for path in argv:
        print(f"\n{path}")
        for rgb, share in dominant(path, n):
            print(f"  {hexify(rgb)}  {share:6.1%}")
            for i, (existing, s) in enumerate(merged):
                if distance(existing, rgb) < 24:
                    merged[i] = (existing, s + share)
                    break
            else:
                merged.append((rgb, share))
    merged.sort(key=lambda c: c[1], reverse=True)
    print("\nMerged palette (by total share across images):")
    for rgb, share in merged[:n]:
        print(f"  {hexify(rgb)}  weight {share:.2f}")
    print("\nPick brand colors from these; neutrals (near-white/black) are usually backgrounds.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
