#!/bin/bash
set -euo pipefail

# One-time setup: publishes the glyph ranges that the map style's `glyphs`
# endpoint serves. Without these, every symbol/text layer renders nothing.
#
# Run with: npm run fonts
#
# Only the fonts named in a layer's `text-font` need to be here. MapLibre asks
# for the whole text-font array as one comma-joined path, and this is a plain
# object store with no font-compositing server, so keep `text-font` to a single
# name that matches one of the directories uploaded below.

FONTS_URL="https://github.com/openmaptiles/fonts/releases/download/v2.0/v2.0.zip"
FONT_STACKS=("Open Sans Regular")

rm -rif /data/fonts
mkdir -p /data/fonts

echo -e "== Downloading glyph ranges =="
wget -q -O /tmp/openmaptiles-fonts.zip "${FONTS_URL}"

for stack in "${FONT_STACKS[@]}"; do
  echo -e "== Extracting ${stack} =="
  unzip -q -o /tmp/openmaptiles-fonts.zip "${stack}/*" -d /data/fonts
done

echo -e "== Sending fonts to cloud =="
s5cmd cp -acl 'public-read' '/data/fonts/*' s3://monarques/fonts/

rm -f /tmp/openmaptiles-fonts.zip
