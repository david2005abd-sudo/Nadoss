#!/usr/bin/env bash
# Builds a static preview of NADOS for GitHub Pages.
# Parks middleware (unsupported by `output: 'export'`), builds, restores.
set -euo pipefail
cd "$(dirname "$0")/.."

restore() {
  if [ -f src/middleware.ts.disabled ]; then
    mv src/middleware.ts.disabled src/middleware.ts
  fi
}
trap restore EXIT

echo "==> Parking middleware..."
if [ -f src/middleware.ts ]; then
  mv src/middleware.ts src/middleware.ts.disabled
fi

echo "==> Building static site..."
rm -rf .next out
NEXT_EXPORT=true NEXT_PUBLIC_STATIC_EXPORT=true \
  node node_modules/next/dist/bin/next build

echo "==> Static site ready in ./out"
