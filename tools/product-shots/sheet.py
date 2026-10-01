#!/usr/bin/env python3
"""
Build before/after contact sheets so the batch can be judged at a glance.

Consistency is the thing that is hard to see one image at a time: a drifting
background or a wandering camera angle only shows up when the shots are side by
side. Each sheet puts the original above its restaged version, in rows.

  python3 tools/product-shots/sheet.py
  python3 tools/product-shots/sheet.py --only ribbons

Writes tools/product-shots/review/sheet-N.jpg.
"""
import argparse, os, sys
from PIL import Image, ImageDraw

ROOT = 'public/products'
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
REVIEW = os.path.join(HERE, 'review')

CELL = 320
PAD = 12
LABEL = 22
COLS = 5
ROWS = 4            # pairs per sheet


def pairs(only):
    found = []
    for base, _, files in os.walk(OUT):
        for f in sorted(files):
            if f.startswith('.') or not f.lower().endswith(('.jpeg', '.jpg', '.png')):
                continue
            edited = os.path.join(base, f)
            rel = os.path.relpath(edited, OUT)
            original = os.path.join(ROOT, rel)
            if only and only not in rel:
                continue
            if os.path.exists(original):
                found.append((rel, original, edited))
    return sorted(found)


def fit(path):
    """Square thumbnail, letterboxed on grey so the real aspect stays visible."""
    cell = Image.new('RGB', (CELL, CELL), (231, 231, 231))
    try:
        img = Image.open(path)
        img.thumbnail((CELL, CELL), Image.LANCZOS)
        cell.paste(img, ((CELL - img.width) // 2, (CELL - img.height) // 2))
    except Exception as exc:                          # noqa: BLE001
        ImageDraw.Draw(cell).text((8, 8), f'unreadable\n{exc}'[:80], fill=(160, 0, 0))
    return cell


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', help='substring filter on the path')
    args = ap.parse_args()

    items = pairs(args.only)
    if not items:
        print(f'nothing in {OUT} yet - run edit.py first')
        return 1
    os.makedirs(REVIEW, exist_ok=True)

    per_sheet = COLS * ROWS
    sheets = 0
    for start in range(0, len(items), per_sheet):
        chunk = items[start:start + per_sheet]
        rows = (len(chunk) + COLS - 1) // COLS
        # Two image rows per pair row (original over edited), plus a label strip.
        w = COLS * (CELL + PAD) + PAD
        h = rows * (2 * CELL + LABEL + PAD * 2) + PAD
        sheet = Image.new('RGB', (w, h), (255, 255, 255))
        draw = ImageDraw.Draw(sheet)
        for i, (rel, original, edited) in enumerate(chunk):
            col, row = i % COLS, i // COLS
            x = PAD + col * (CELL + PAD)
            y = PAD + row * (2 * CELL + LABEL + PAD * 2)
            draw.text((x, y), rel[:52], fill=(40, 40, 40))
            sheet.paste(fit(original), (x, y + LABEL))
            sheet.paste(fit(edited), (x, y + LABEL + CELL + PAD))
        path = os.path.join(REVIEW, f'sheet-{sheets + 1}.jpg')
        sheet.save(path, quality=88)
        print(f'{path}  ({len(chunk)} pairs, originals on top)')
        sheets += 1
    print(f'\n{len(items)} pairs across {sheets} sheet(s)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
