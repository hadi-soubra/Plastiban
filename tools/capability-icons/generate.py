#!/usr/bin/env python3
"""
Generate the six capability icons (Manufacturing & Printing section) through
the OpenAI images API, in the same style as the process-step icons.

They share the process icons' prompt, and every one is generated with a process
icon attached as the reference, so the two sets read as one series. The model
paints them on solid navy; publishing flood-fills that background out from the
corners (navy inside the drawing survives) and scales to 256px into
public/capabilities/, the same form as public/process/.

  python3 tools/capability-icons/generate.py --dry-run
  python3 tools/capability-icons/generate.py --quality medium
  python3 tools/capability-icons/generate.py --quality medium --redo
"""
import argparse, base64, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
OUT = os.path.join(HERE, 'out')
PUBLIC = os.path.join(ROOT, 'public', 'capabilities')
# The process set's style prompt and its first icon, the reference for all six.
PROMPT_FILE = os.path.join(ROOT, 'tools', 'process-icons', 'prompt.txt')
REFERENCE = os.path.join(ROOT, 'tools', 'process-icons', 'out', '01.png')

# Order matches capabilities.ts.
SUBJECTS = [
    ('01', 'an offset printing press seen from the side: two large stacked rollers with a single sheet feeding out between them'),
    ('02', 'a compact desktop digital printer with one printed sheet coming out of its front slot'),
    ('03', 'a flat cutting die with a sharp outline pressing down onto a flat unfolded box template'),
    ('04', 'a router bit, a spiral drill bit pointing down, cutting a smooth curved groove into a flat board'),
    ('05', 'two flat stacked sheets with a thin protective film peeling back from the corner of the top sheet'),
    ('06', 'a closed box with a small star emblem on its lid and two small sparkles beside it'),
]
COST = {'low': 0.006, 'medium': 0.053, 'high': 0.211}


def load_key():
    env = os.path.join(ROOT, 'tools', 'product-shots', '.env')
    if not os.environ.get('OPENAI_API_KEY') and os.path.exists(env):
        for raw in open(env):
            line = raw.strip()
            if line and not line.startswith('#') and '=' in line:
                k, _, v = line.partition('=')
                os.environ.setdefault(k.strip(), v.strip().strip('\'"'))
    return bool(os.environ.get('OPENAI_API_KEY'))


def publish(number):
    """Key out the navy backdrop from the corners inwards and frame it at 256px."""
    import subprocess
    os.makedirs(PUBLIC, exist_ok=True)
    src, dest = os.path.join(OUT, f'{number}.png'), os.path.join(PUBLIC, f'{number}.png')
    fill = []
    for x, y in ((0, 0), (1023, 0), (0, 1023), (1023, 1023)):
        fill += ['-draw', f'color {x},{y} floodfill']
    # The model draws the subject smaller than the process icons, so trim to the
    # drawing and centre it at their size: about 240px of the 256px frame.
    subprocess.run(['magick', src, '-alpha', 'set', '-fuzz', '12%', '-fill', 'none', *fill,
                    '-trim', '+repage', '-resize', '240x240', '-background', 'none',
                    '-gravity', 'center', '-extent', '256x256', '-strip', dest], check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--quality', choices=['low', 'medium', 'high'], default='medium')
    ap.add_argument('--model', default='gpt-image-2')
    ap.add_argument('--size', default='1024x1024')
    ap.add_argument('--redo', action='store_true')
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--only', help='generate just these numbers, e.g. 01 or 02,03')
    args = ap.parse_args()

    style = open(PROMPT_FILE).read().strip()
    todo = [(n, s) for n, s in SUBJECTS
            if args.redo or not os.path.exists(os.path.join(OUT, f'{n}.png'))]
    if args.only:
        todo = [(n, s) for n, s in todo if n in args.only.split(',')]
    per = COST[args.quality]
    print(f'{len(todo)} icon(s)  x  ~${per:.3f}  =  ~${len(todo) * per:.2f}'
          f'   [{args.model}, {args.quality}, {args.size}]')
    if args.dry_run or not todo:
        for n, s in todo:
            print(f'  {n}  {s}')
        return 0
    if not load_key():
        print('OPENAI_API_KEY not set (looked in tools/product-shots/.env)', file=sys.stderr)
        return 1

    from openai import OpenAI
    client = OpenAI()
    os.makedirs(OUT, exist_ok=True)
    failed = 0

    for number, subject in sorted(todo):
        prompt = (f'{style} {subject}.\n\nMatch the attached reference exactly: the same '
                  'background colour, the same line weight, the same palette, the same level of '
                  'detail and the same subject scale within the frame. Only the subject differs.')
        try:
            with open(REFERENCE, 'rb') as ref:
                res = client.images.edit(model=args.model, image=ref, prompt=prompt,
                                         size=args.size, quality=args.quality, n=1)
            dest = os.path.join(OUT, f'{number}.png')
            with open(dest, 'wb') as fh:
                fh.write(base64.b64decode(res.data[0].b64_json))
            publish(number)
            print(f'  wrote {dest}')
        except Exception as exc:                      # noqa: BLE001 - reported, not swallowed
            failed += 1
            print(f'  FAILED {number}: {str(exc)[:200]}')
    print(f'\n{len(todo) - failed} written, {failed} failed   ~${(len(todo) - failed) * per:.2f}')
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
