# Google Play Screenshot Pipeline

This pipeline uses Fastlane Frameit to frame seven Turkish Google Play phone screenshots captured from the connected Android device.

## Prerequisites

- Ruby and Fastlane (`gem install fastlane`)
- ImageMagick (`magick` must be available in `PATH`)
- A Bash environment (WSL, Git Bash, Linux, or macOS)

The generation script also supports Fastlane and ImageMagick installed on Windows while it is invoked from WSL.

## Source screenshots

The unframed PNG files live in `fastlane/metadata/android/tr-TR/images/phoneScreenshots/`:

- `01_home.png`
- `02_prayer_times.png`
- `03_quran.png`
- `04_qibla.png`
- `05_dhikr.png`
- `06_dua.png`
- `07_premium.png`

Frameit writes the generated files alongside them with an `_framed.png` suffix.

## Generate screenshots

From the repository root:

```bash
bash scripts/generate_playstore_screenshots.sh
```

Or invoke the Android lane directly:

```bash
fastlane android frame_screenshots
```

The platform prefix is required because `fastlane frame_screenshots` by itself is also a built-in Fastlane CLI command and would bypass this project's lane.

The script verifies Fastlane, ImageMagick, the screenshot directory, `Framefile.json`, and `background.png`. The lane stops with a clear error when any source screenshot is missing.

## Visual design

`Framefile.json` uses `background.png`, gold keywords, and white titles. The background has a dark navy/emerald palette with restrained Islamic geometric ornament. Frameit uses its default Unicode-capable font, so the pipeline does not reference a missing local font.
