#!/usr/bin/env bash
# Gera o PDF do moodboard a partir do site (index.html + assets/).
# Uso:  bash pdf/build.sh            → captura tudo e gera o PDF
#       bash pdf/build.sh --no-capture  → reaproveita as capturas (só texto/diagramação mudou)
# Requisitos: Node 18+, Playwright com Chromium, Python 3 com Pillow e numpy.
set -euo pipefail
cd "$(dirname "$0")/.."
PORT="${PORT:-8765}"
python3 -m http.server "$PORT" >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null' EXIT
sleep 1
node pdf/extract-data.mjs
if [ "${1:-}" != "--no-capture" ]; then
  for part in stage covers meet plan; do node pdf/capture.mjs "$part"; done
  python3 pdf/crop.py >/dev/null
fi
PORT="$PORT" node pdf/render.mjs "${2:-pdf/out/The-Reveal-Moodboard.pdf}"
