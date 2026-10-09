#!/usr/bin/env python3
"""WCAG 2.x contrast checker for proposal color pairs (standard library only).

Usage:
  python contrast.py "#15243B:#F6F8FB" "#F1BE48:#FFFFFF" ...
  python contrast.py --large "#FFFFFF:#3C5F8E"       # large text (>=24px, or >=18.5px bold): 3:1
  python contrast.py --fix "#F1BE48:#FFFFFF"          # also suggest a darker/lighter text-safe variant

Each argument is FOREGROUND:BACKGROUND in hex (#RGB or #RRGGBB).
Exit code 1 if any pair fails, so it can be used as a gate.
"""
from __future__ import annotations

import sys


def parse_hex(value: str) -> tuple[int, int, int]:
    h = value.strip().lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    if len(h) != 6:
        raise ValueError(f"not a hex color: {value!r}")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def to_hex(rgb: tuple[int, int, int]) -> str:
    return "#{:02X}{:02X}{:02X}".format(*rgb)


def luminance(rgb: tuple[int, int, int]) -> float:
    def channel(c: int) -> float:
        s = c / 255
        return s / 12.92 if s <= 0.03928 else ((s + 0.055) / 1.055) ** 2.4

    r, g, b = (channel(c) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(fg: tuple[int, int, int], bg: tuple[int, int, int]) -> float:
    l1, l2 = sorted((luminance(fg), luminance(bg)), reverse=True)
    return (l1 + 0.05) / (l2 + 0.05)


def suggest(fg: tuple[int, int, int], bg: tuple[int, int, int], target: float) -> tuple[int, int, int] | None:
    """Scale the foreground toward black (on light bg) or white (on dark bg), keeping its hue, until it passes."""
    toward_black = luminance(bg) > 0.5
    for step in range(1, 101):
        t = step / 100
        if toward_black:
            cand = tuple(round(c * (1 - t)) for c in fg)
        else:
            cand = tuple(round(c + (255 - c) * t) for c in fg)
        if ratio(cand, bg) >= target:
            return cand  # type: ignore[return-value]
    return None


def main(argv: list[str]) -> int:
    large = "--large" in argv
    fix = "--fix" in argv
    pairs = [a for a in argv if not a.startswith("--")]
    if not pairs:
        print(__doc__)
        return 2
    target = 3.0 if large else 4.5
    failed = False
    for pair in pairs:
        try:
            fg_s, bg_s = pair.split(":")
            fg, bg = parse_hex(fg_s), parse_hex(bg_s)
        except ValueError as exc:
            print(f"SKIP  {pair}: {exc}")
            failed = True
            continue
        r = ratio(fg, bg)
        ok = r >= target
        failed |= not ok
        print(f"{'PASS' if ok else 'FAIL'}  {to_hex(fg)} on {to_hex(bg)}  {r:.2f}:1  (needs {target}:1{' large' if large else ''})")
        if fix and not ok:
            s = suggest(fg, bg, target)
            if s:
                print(f"      text-safe variant: {to_hex(s)}  {ratio(s, bg):.2f}:1")
            else:
                print("      no variant of this hue passes; use it as a fill, not as text")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
