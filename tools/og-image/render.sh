#!/bin/sh
# Renders og.html into public/og-image.jpg, the 1200x630 picture link previews
# show (WhatsApp, LinkedIn, Facebook, X). Edit og.html, run this from the repo
# root, then deploy. Kept a JPEG well under 300 KB: WhatsApp drops larger ones.
set -e
dir=$(cd "$(dirname "$0")" && pwd)
tmp=$(mktemp -d)
chromium --headless=new --disable-gpu --no-sandbox --user-data-dir="$tmp/profile" \
  --allow-file-access-from-files --hide-scrollbars --virtual-time-budget=6000 \
  --window-size=1200,630 --screenshot="$tmp/og.png" "file://$dir/og.html" 2>/dev/null
magick "$tmp/og.png" -strip -quality 86 -sampling-factor 4:2:0 -interlace JPEG "$dir/../../public/og-image.jpg"
rm -rf "$tmp"
ls -l "$dir/../../public/og-image.jpg"
