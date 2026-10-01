#!/usr/bin/env python3
"""
Copy approved restaged shots over the live ones in public/products.

The only step that changes what the site serves, kept separate so it is always
deliberate. Originals are copied to tools/product-shots/replaced/ first, so any
image can be put back.

  python3 tools/product-shots/promote.py --dry-run
  python3 tools/product-shots/promote.py --only ribbons
  python3 tools/product-shots/promote.py                 # everything in out/
  python3 tools/product-shots/promote.py --revert        # undo

File names are preserved, so products.ts needs no change: 3.jpeg stays 3.jpeg.
Anything written as .png is converted to .jpeg so the catalogue stays uniform.

Images are re-encoded on the way in. The API returns 1024x1024 frames at a
near-lossless bitrate - about 1.2MB each, which across the catalogue is ~110MB
of product shots to serve for cards that render at 288px. Re-encoding at quality
92 gives ~87KB for a measured 0.45% RMSE difference, far below the ~1% where
anything becomes visible. Dimensions are untouched; only the bitrate changes.
The full-size frames stay in out/, so nothing is lost.
"""
import argparse, os, shutil, sys
from PIL import Image

ROOT = 'public/products'
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
BACKUP = os.path.join(HERE, 'replaced')


def candidates(only):
    found = []
    for base, _, files in os.walk(OUT):
        for f in sorted(files):
            if f.startswith('.') or not f.lower().endswith(('.jpeg', '.jpg', '.png')):
                continue
            edited = os.path.join(base, f)
            rel = os.path.relpath(edited, OUT)
            if only and only not in rel:
                continue
            # Always land as .jpeg, whatever the API returned.
            live = os.path.join(ROOT, os.path.splitext(rel)[0] + '.jpeg')
            found.append((rel, edited, live))
    return sorted(found)


def revert(only):
    restored = 0
    for base, _, files in os.walk(BACKUP):
        for f in sorted(files):
            src = os.path.join(base, f)
            rel = os.path.relpath(src, BACKUP)
            if only and only not in rel:
                continue
            shutil.copy2(src, os.path.join(ROOT, rel))
            print(f'  restored {rel}')
            restored += 1
    print(f'{restored} restored' if restored else 'nothing in replaced/ to restore')
    return 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', help='substring filter on the path')
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--revert', action='store_true')
    ap.add_argument('--quality', type=int, default=92,
                    help='JPEG quality written into public/ (default 92)')
    ap.add_argument('--max-edge', type=int, default=0,
                    help='also cap the long side at this many pixels (0 = keep size)')
    args = ap.parse_args()

    if args.revert:
        return revert(args.only)

    items = candidates(args.only)
    if not items:
        print(f'nothing in {OUT} to promote')
        return 1
    print(f'{len(items)} image(s) would replace live shots:')
    for rel, _, live in items[:10]:
        print(f'  {live}   <- out/{rel}')
    if len(items) > 10:
        print(f'  ... and {len(items) - 10} more')
    if args.dry_run:
        return 0

    done = 0
    before = after = 0
    for rel, edited, live in items:
        if os.path.exists(live):
            dest = os.path.join(BACKUP, os.path.relpath(live, ROOT))
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            if not os.path.exists(dest):          # keep the first original only
                shutil.copy2(live, dest)
        os.makedirs(os.path.dirname(live), exist_ok=True)
        before += os.path.getsize(edited)
        img = Image.open(edited).convert('RGB')
        if args.max_edge and max(img.size) > args.max_edge:
            img.thumbnail((args.max_edge, args.max_edge), Image.LANCZOS)
        # optimize + progressive: smaller again, and a progressive JPEG paints a
        # low-detail pass first instead of nothing, which matters on the strip.
        img.save(live, 'JPEG', quality=args.quality, optimize=True, progressive=True)
        after += os.path.getsize(live)
        done += 1
    saved = (1 - after / before) * 100 if before else 0
    print(f'\n{done} promoted at quality {args.quality}')
    print(f'  {before/1e6:.1f} MB  ->  {after/1e6:.1f} MB   ({saved:.0f}% smaller)')
    print(f'  originals in {BACKUP}')
    print('undo with:  python3 tools/product-shots/promote.py --revert')
    return 0


if __name__ == '__main__':
    sys.exit(main())
