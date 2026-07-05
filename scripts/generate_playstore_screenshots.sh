#!/usr/bin/env bash
set -euo pipefail

export FASTLANE_SKIP_DOCS=1

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCREENSHOT_DIR="$ROOT_DIR/fastlane/metadata/android/tr-TR/images/phoneScreenshots"
FRAMEFILE="$SCREENSHOT_DIR/Framefile.json"
BACKGROUND="$SCREENSHOT_DIR/background.png"

fail() {
  printf 'ERROR: %s\n' "$1" >&2
  exit 1
}

WINDOWS_FASTLANE=""
WINDOWS_IMAGEMAGICK_DIR=""

if grep -qi microsoft /proc/version 2>/dev/null && command -v powershell.exe >/dev/null 2>&1; then
  WINDOWS_FASTLANE="$(compgen -G '/mnt/c/Ruby*/bin/fastlane.bat' | head -n 1 || true)"
  WINDOWS_MAGICK="$(compgen -G '/mnt/c/Program Files/ImageMagick*/magick.exe' | head -n 1 || true)"
  [[ -n "$WINDOWS_FASTLANE" ]] || fail "fastlane is not installed in the Windows Ruby installation."
  [[ -n "$WINDOWS_MAGICK" ]] || fail "ImageMagick is not installed in the standard Windows location."
  WINDOWS_IMAGEMAGICK_DIR="$(dirname "$WINDOWS_MAGICK")"
  IMAGEMAGICK_COMMAND="$WINDOWS_MAGICK"
elif command -v fastlane >/dev/null 2>&1; then
  if command -v magick >/dev/null 2>&1 && magick -version 2>/dev/null | grep -qi 'ImageMagick'; then
  IMAGEMAGICK_COMMAND="magick"
  elif command -v convert >/dev/null 2>&1 && convert -version 2>/dev/null | grep -qi 'ImageMagick'; then
    IMAGEMAGICK_COMMAND="convert"
  else
    fail "ImageMagick is not installed or its 'magick'/'convert' command is not available in PATH."
  fi
else
  fail "fastlane is not installed or is not available in PATH."
fi

[[ -d "$SCREENSHOT_DIR" ]] || fail "Screenshot directory does not exist: $SCREENSHOT_DIR"
[[ -f "$FRAMEFILE" ]] || fail "Framefile.json does not exist: $FRAMEFILE"
[[ -f "$BACKGROUND" ]] || fail "Frameit background does not exist: $BACKGROUND"

printf 'fastlane: %s\n' "${WINDOWS_FASTLANE:-$(command -v fastlane)}"
printf 'ImageMagick: %s\n' "$IMAGEMAGICK_COMMAND"
printf 'Screenshot directory: %s\n' "$SCREENSHOT_DIR"
printf 'Framefile: %s\n' "$FRAMEFILE"
printf 'Background: %s\n' "$BACKGROUND"

cd "$ROOT_DIR"
if [[ -n "$WINDOWS_FASTLANE" ]]; then
  WINDOWS_ROOT="$(wslpath -w "$ROOT_DIR")"
  WINDOWS_FASTLANE_PATH="$(wslpath -w "$WINDOWS_FASTLANE")"
  WINDOWS_IMAGEMAGICK_PATH="$(wslpath -w "$WINDOWS_IMAGEMAGICK_DIR")"
  powershell.exe -NoProfile -Command \
    "\$env:Path = '$WINDOWS_IMAGEMAGICK_PATH;' + \$env:Path; Set-Location -LiteralPath '$WINDOWS_ROOT'; & '$WINDOWS_FASTLANE_PATH' android frame_screenshots; exit \$LASTEXITCODE"
else
  fastlane android frame_screenshots
fi
