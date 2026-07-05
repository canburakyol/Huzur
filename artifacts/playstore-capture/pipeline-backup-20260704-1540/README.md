# Google Play Screenshot Pipeline

This pipeline uses Fastlane Frameit to frame the six Turkish Google Play phone screenshots.

## Prerequisites

- Ruby and Fastlane (`gem install fastlane`)
- ImageMagick (`magick` or `convert` must be available in `PATH`)
- A Bash environment (Git Bash, WSL, Linux, or macOS)

## Source screenshots

Place these unframed PNG files in `fastlane/metadata/android/tr-TR/images/phoneScreenshots/`:

- `01_home.png`
- `02_prayer_times.png`
- `03_quran.png`
- `04_qibla.png`
- `05_dhikr.png`
- `06_dua.png`

Do not use the `framed_` prefix for source files. Frameit writes its generated files alongside them with that prefix.

## Generate screenshots

From the repository root:

```bash
bash scripts/generate_playstore_screenshots.sh
```

Or invoke the lane directly:

```bash
fastlane frame_screenshots
```

The script verifies Fastlane, ImageMagick, the screenshot directory, and `Framefile.json` before running the lane. The lane also stops with a clear error when any of the six source screenshots is missing.

## Visual customization

`Framefile.json` uses a dark navy background (`#071A2B`), gold keywords, and white titles. It intentionally relies on Frameit's default font so the pipeline does not reference a missing font file.

To use a custom font, add the font file under `fastlane/assets/fonts/` and set `font` in both the `keyword` and `title` objects to its path. To use an image background, add it under `fastlane/assets/backgrounds/` and replace the `background` color with that image path.
