#!/usr/bin/env bash
# Native Android startup smoke gate. Runs inside a clean CI emulator.
# It deliberately does not grant permissions or exercise purchases.
set -euo pipefail

APK_PATH="${1:-android/app/build/outputs/apk/debug/app-debug.apk}"
PACKAGE_NAME="com.huzurapp.android"
ACTIVITY_NAME="${PACKAGE_NAME}/.MainActivity"
ARTIFACT_DIR="${QA_ARTIFACT_DIR:-e2e/results/android-native}"

if [[ ! -f "$APK_PATH" ]]; then
  echo "Debug APK not found: $APK_PATH" >&2
  exit 1
fi

mkdir -p "$ARTIFACT_DIR"
adb wait-for-device
adb install -r -d "$APK_PATH"
adb logcat -c
adb shell am force-stop "$PACKAGE_NAME"
adb shell am start -W -n "$ACTIVITY_NAME" | tee "$ARTIFACT_DIR/activity-start.txt"

# Let Capacitor/WebView initialise, then persist useful evidence regardless of outcome.
sleep 12
adb shell pidof "$PACKAGE_NAME" | tee "$ARTIFACT_DIR/app-pid.txt"
adb exec-out screencap -p > "$ARTIFACT_DIR/launch.png"
adb logcat -d -v threadtime > "$ARTIFACT_DIR/logcat.txt"
adb shell dumpsys window windows > "$ARTIFACT_DIR/windows.txt"

if ! grep -Eq 'mCurrentFocus=.*com\.huzurapp\.android|mFocusedApp=.*com\.huzurapp\.android' "$ARTIFACT_DIR/windows.txt"; then
  echo "Huzur is not the focused Android activity after launch." >&2
  exit 1
fi

if grep -Eq 'FATAL EXCEPTION|Process: com\.huzurapp\.android.*has died|AndroidRuntime:.*Fatal' "$ARTIFACT_DIR/logcat.txt"; then
  echo "Fatal Android runtime error detected during native launch smoke." >&2
  grep -nE 'FATAL EXCEPTION|Process: com\.huzurapp\.android.*has died|AndroidRuntime:.*Fatal' "$ARTIFACT_DIR/logcat.txt" >&2 || true
  exit 1
fi

echo "Android native launch smoke passed."
