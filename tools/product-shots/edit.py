#!/usr/bin/env python3
"""
Batch-restage the product photographs through the OpenAI images API.

Reads every shot under public/products, sends each one through `images.edit`
with one identical prompt, and writes the result to tools/product-shots/out/
under the same relative path. Nothing in public/ is touched: promote.py does
that, once you have looked at the results.

  export OPENAI_API_KEY=sk-...
  python3 tools/product-shots/edit.py --dry-run            # what it would cost
  python3 tools/product-shots/edit.py --limit 6 --quality low   # pilot
  python3 tools/product-shots/edit.py --quality high       # the real run

Re-running skips anything already in out/, so an interrupted run resumes where
it stopped. Delete a file from out/ to have it redone.
"""
import argparse, base64, csv, os, random, sys, time
from concurrent.futures import ThreadPoolExecutor, as_completed

ROOT = 'public/products'
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
MANIFEST = os.path.join(HERE, 'manifest.csv')
PROMPT_FILE = os.path.join(HERE, 'prompt.txt')
# Drop an approved frame here and every later call is anchored to it.
DEFAULT_REFERENCE = os.path.join(HERE, 'reference.jpeg')

# Rough per-image output cost at 1024x1024, in USD. Inputs add ~$0.01 per image
# sent (the photo, plus the reference if used) at $8/1M image-input tokens.
COST = {'low': 0.006, 'medium': 0.053, 'high': 0.211}
INPUT_COST = 0.010


def keep_patterns():
    """Paths to leave alone, listed in keep.txt - the shots already good enough."""
    path = os.path.join(HERE, 'keep.txt')
    if not os.path.exists(path):
        return []
    return [ln.strip() for ln in open(path)
            if ln.strip() and not ln.lstrip().startswith('#')]


def sources(use_keep, min_edge):
    """
    Every shot to restage: all of them, minus anything keep.txt protects.

    An earlier version guessed from pixel dimensions, on the theory that small
    files had already been processed. That was wrong - most of the catalogue is
    phone photography that merely happens to be saved small, and being low
    resolution is a reason to restage, not to skip. Which shots are already
    good is a judgement call, so it is written down in keep.txt rather than
    inferred. `--min-edge` is still there if a size cutoff is ever wanted.
    """
    keep = keep_patterns() if use_keep else []
    found, kept, small = [], 0, 0
    for base, _, files in os.walk(ROOT):
        for f in sorted(files):
            if f.startswith('.') or not f.lower().endswith(('.jpeg', '.jpg', '.png')):
                continue
            path = os.path.join(base, f)
            rel = os.path.relpath(path, ROOT)
            if any(pat in rel for pat in keep):
                kept += 1
                continue
            if min_edge:
                from PIL import Image
                try:
                    if max(Image.open(path).size) < min_edge:
                        small += 1
                        continue
                except Exception:                     # noqa: BLE001 - unreadable, let it through
                    pass
            found.append(path)
    if kept:
        print(f'keeping {kept} shot(s) protected by keep.txt')
    if small:
        print(f'skipping {small} image(s) under {min_edge}px')
    return sorted(found)


def out_path(src):
    """
    Where a source's result lands. Always .jpeg, whatever the source extension,
    because promote.py writes .jpeg into public/ - if the two disagreed, a later
    run would not recognise its own output as done, and would re-edit an already
    edited image. Generating from a generated frame drifts further from the real
    product every pass.
    """
    rel = os.path.relpath(src, ROOT)
    return os.path.join(OUT, os.path.splitext(rel)[0] + '.jpeg')


def restage(client, src, prompt, quality, reference, model, size):
    """One image. Returns (src, dest, error). Retries transient failures."""
    dest = out_path(src)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    last = None
    for attempt in range(4):
        handles = []
        try:
            handles.append(open(src, 'rb'))
            if reference:
                handles.append(open(reference, 'rb'))
            res = client.images.edit(
                model=model,
                image=handles if len(handles) > 1 else handles[0],
                prompt=prompt,
                size=size,
                quality=quality,
                n=1,
            )
            with open(dest, 'wb') as fh:
                fh.write(base64.b64decode(res.data[0].b64_json))
            return src, dest, None
        except Exception as exc:                      # noqa: BLE001 - reported, not swallowed
            last = exc
            text = str(exc).lower()
            # An empty balance also arrives as 429, but no amount of waiting
            # fixes it - retrying just turns one clear error into four slow
            # ones, per image. Stop immediately and let the run report it.
            if any(k in text for k in ('no credits', 'insufficient', 'quota', 'billing', 'exceeded your current')):
                break
            # Back off on real rate limits and transient 5xx; fail fast on the rest.
            if not any(k in text for k in ('rate', 'timeout', 'timed out', '429', '500', '502', '503', '529')):
                break
            time.sleep((2 ** attempt) + random.random())
        finally:
            for h in handles:
                h.close()
    return src, dest, last


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--quality', choices=['low', 'medium', 'high'], default='low')
    ap.add_argument('--model', default='gpt-image-2')
    ap.add_argument('--size', default='1024x1024')
    ap.add_argument('--limit', type=int, help='only the first N, for a pilot')
    ap.add_argument('--only', help='substring filter on the path, e.g. ribbons')
    ap.add_argument('--reference', help='an approved shot to anchor the style to')
    ap.add_argument('--workers', type=int, default=4)
    ap.add_argument('--min-edge', type=int, default=0,
                    help='also skip images smaller than this on the long side')
    ap.add_argument('--all', action='store_true',
                    help='ignore keep.txt and edit everything')
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--redo', action='store_true', help='ignore existing out/ files')
    args = ap.parse_args()

    prompt = open(PROMPT_FILE).read().strip()

    # The API is stateless: each call sees only this prompt and these images, so
    # an approved frame passed alongside is the one thing that carries the look
    # from one call to the next. Without it the written spec is all there is.
    reference = args.reference
    if not reference and os.path.exists(DEFAULT_REFERENCE):
        reference = DEFAULT_REFERENCE
    args.reference = reference

    todo = sources(not args.all, args.min_edge)
    if args.only:
        todo = [p for p in todo if args.only in p]
    if not args.redo:
        todo = [p for p in todo if not os.path.exists(out_path(p))]
    if args.limit:
        todo = todo[:args.limit]

    per = COST[args.quality] + INPUT_COST * (2 if args.reference else 1)
    print(f'{len(todo)} images  x  ~${per:.3f}  =  ~${len(todo) * per:.2f}'
          f'   [{args.model}, {args.quality}, {args.size}]')
    if args.reference:
        print(f'style anchored to {args.reference}')
    else:
        print('no style anchor - prompt only. once a frame looks right, save it as\n'
              f'  {DEFAULT_REFERENCE}\nand every later run matches it.')
    if args.dry_run:
        for p in todo[:10]:
            print('  ' + p)
        if len(todo) > 10:
            print(f'  ... and {len(todo) - 10} more')
        return 0
    if not todo:
        print('nothing to do - out/ already has every image (use --redo to force)')
        return 0

    try:
        from openai import OpenAI
    except ImportError:
        print('pip install openai', file=sys.stderr)
        return 1

    # A gitignored .env beside this script, so the key never has to live in a
    # shell profile or get pasted into a command that lands in shell history.
    env_file = os.path.join(HERE, '.env')
    if not os.environ.get('OPENAI_API_KEY') and os.path.exists(env_file):
        for raw in open(env_file):
            line = raw.strip()
            if line.startswith('#') or '=' not in line:
                continue
            key, _, value = line.partition('=')
            os.environ.setdefault(key.strip(), value.strip().strip('\'"'))
    if not os.environ.get('OPENAI_API_KEY'):
        print(f'OPENAI_API_KEY is not set.\nPut it in {env_file} as:\n'
              '  OPENAI_API_KEY=sk-...', file=sys.stderr)
        return 1
    client = OpenAI()

    os.makedirs(OUT, exist_ok=True)
    done = failed = 0
    rows = []
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = [pool.submit(restage, client, p, prompt, args.quality,
                               args.reference, args.model, args.size) for p in todo]
        for fut in as_completed(futures):
            src, dest, err = fut.result()
            if err:
                failed += 1
                print(f'  FAILED {src}: {str(err)[:140]}')
            else:
                done += 1
                print(f'  [{done + failed}/{len(todo)}] {src}')
            rows.append({'source': src, 'output': dest if not err else '',
                         'quality': args.quality, 'model': args.model,
                         'error': str(err)[:200] if err else ''})

    write_header = not os.path.exists(MANIFEST)
    with open(MANIFEST, 'a', newline='') as fh:
        w = csv.DictWriter(fh, fieldnames=['source', 'output', 'quality', 'model', 'error'])
        if write_header:
            w.writeheader()
        w.writerows(sorted(rows, key=lambda r: r['source']))

    print(f'\n{done} written, {failed} failed   ~${done * per:.2f} spent')
    if failed and any('no credits' in r['error'].lower() or 'quota' in r['error'].lower()
                      for r in rows):
        print('\nThe key works - the account is out of credits.\n'
              'Top up at https://platform.openai.com/settings/organization/billing'
              '\nthen re-run: completed images are skipped, so nothing is paid for twice.')
    print(f'manifest: {MANIFEST}')
    print('review with:  python3 tools/product-shots/sheet.py')
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
