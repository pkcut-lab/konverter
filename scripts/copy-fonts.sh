#!/usr/bin/env bash
set -euo pipefail

DEST="public/fonts"
mkdir -p "$DEST"

INTER_SRC="node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2"
JBM_SRC="node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2"

if [[ ! -f "$INTER_SRC" ]]; then
  echo "❌ Inter source not found at $INTER_SRC"
  echo "   Did you run 'npm install'? Check file name with: ls node_modules/@fontsource-variable/inter/files/"
  exit 1
fi
if [[ ! -f "$JBM_SRC" ]]; then
  echo "❌ JetBrains Mono source not found at $JBM_SRC"
  exit 1
fi

cp "$INTER_SRC" "$DEST/Inter-Variable.woff2"
cp "$JBM_SRC" "$DEST/JetBrainsMono-Variable.woff2"

echo "✓ Copied:"
ls -la "$DEST"/*.woff2
