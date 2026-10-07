#!/usr/bin/env python3
"""
Generate the six process-step icons through the OpenAI images API.

The first icon is generated from the prompt alone; every later one is generated
with that first icon attached as a reference, because the API is stateless and a
written style description alone drifts across six independent calls.

  python3 tools/process-icons/generate.py --dry-run
  python3 tools/process-icons/generate.py --quality low     # ~$0.04 for six
  python3 tools/process-icons/generate.py --quality medium --redo
"""
import argparse, base64, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
PROMPT_FILE = os.path.join(HERE, 'prompt.txt')
ANCHOR = '01.png'

# Order matches the steps in process.ts.
SUBJECTS = [
    ('01', 'a magnifying glass held over a simple closed box'),
    ('02', 'a flat unfolded box dieline, showing fold lines and glue tabs'),
    ('03', 'a single half-assembled box with one flap standing open'),
    ('04', 'a neat stack of three identical finished closed boxes'),
    ('05', 'a closed box with a ribbon tied in a bow across its lid'),
    ('06', 'a closed box with a curved motion arrow sweeping over it'),
]
COST = {'low': 0.006, 'medium': 0.053, 'high': 0.211}


def load_key():
    env = os.path.join(os.path.dirname(HERE), 'product-shots', '.env')
    if not os.environ.get('OPENAI_API_KEY') and os.path.exists(env):
        for raw in open(env):
            line = raw.strip()
            if line and not line.startswith('#') and '=' in line:
                k, _, v = line.partition('=')
                os.environ.setdefault(k.strip(), v.strip().strip('\'"'))
    return bool(os.environ.get('OPENAI_API_KEY'))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--quality', choices=['low', 'medium', 'high'], default='low')
    ap.add_argument('--model', default='gpt-image-2')
    ap.add_argument('--size', default='1024x1024')
    ap.add_argument('--redo', action='store_true')
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()

    style = open(PROMPT_FILE).read().strip()
    todo = [(n, s) for n, s in SUBJECTS
            if args.redo or not os.path.exists(os.path.join(OUT, f'{n}.png'))]
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
    anchor = os.path.join(OUT, ANCHOR)
    failed = 0

    # 01 must exist first: it is what every other icon is matched against.
    for number, subject in sorted(todo):
        prompt = f'{style} {subject}.'
        try:
            if number != '01' and os.path.exists(anchor):
                prompt += ('\n\nMatch the attached reference exactly: the same background colour, '
                           'the same line weight, the same palette, the same level of detail and '
                           'the same subject scale within the frame. Only the subject differs.')
                with open(anchor, 'rb') as ref:
                    res = client.images.edit(model=args.model, image=ref, prompt=prompt,
                                             size=args.size, quality=args.quality, n=1)
            else:
                res = client.images.generate(model=args.model, prompt=prompt,
                                             size=args.size, quality=args.quality, n=1)
            dest = os.path.join(OUT, f'{number}.png')
            with open(dest, 'wb') as fh:
                fh.write(base64.b64decode(res.data[0].b64_json))
            print(f'  wrote {dest}')
        except Exception as exc:                      # noqa: BLE001 - reported, not swallowed
            failed += 1
            print(f'  FAILED {number}: {str(exc)[:160]}')
    print(f'\n{len(todo) - failed} written, {failed} failed   ~${(len(todo) - failed) * per:.2f}')
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
