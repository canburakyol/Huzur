#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCREENSHOT_DIR="$ROOT_DIR/fastlane/metadata/android/tr-TR/images/phoneScreenshots"
FRAMEFILE="$SCREENSHOT_DIR/Framefile.json"

fail() {
  printf 'ERROR: %s\n' "$1" >&2
  exit 1
}

command -v fastlane >/dev/null 2>&1 || fail "fastlane is not installed or is not available in PATH."

if command -v magick >/dev/null 2>&1; then
  IMAGEMAGICK_COMMAND="magick"
elif command -v convert >/dev/null 2>&1; then
  IMAGEMAGICK_COMMAND="convert"
else
  fail "ImageMagick is not installed or neither 'magick' nor 'convert' is available in PATH."
fi

[[ -d "$SCREENSHOT_DIR" ]] || fail "Screenshot directory does not exist: $SCREENSHOT_DIR"
[[ -f "$FRAMEFILE" ]] || fail "Framefile.json does not exist: $FRAMEFILE"

printf 'fastlane: %s\n' "$(command -v fastlane)"
printf 'ImageMagick: %s (%s)\n' "$(command -v "$IMAGEMAGICK_COMMAND")" "$IMAGEMAGICK_COMMAND"
printf 'Screenshot directory: %s\n' "$SCREENSHOT_DIR"
printf 'Framefile: %s\n' "$FRAMEFILE"

cd "$ROOT_DIR"
fastlane frame_screenshots
