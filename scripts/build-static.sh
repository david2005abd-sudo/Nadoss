#!/usr/bin/env bash
# Builds a static preview of NADOS for GitHub Pages.
# Removes server-only code paths (middleware, API, dashboard, store, server actions)
# for the duration of the build, then restores them.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Preparing static export..."
mv src/middleware.ts src/middleware.ts.disabled
cp "src/app/(auth)/actions.ts" /tmp/nados-actions.real.ts
cp scripts/static-actions-stub.ts "src/app/(auth)/actions.ts"
rm -rf src/app/dashboard src/app/store src/app/api

restore() {
  echo "==> Restoring server code..."
  [ -f src/middleware.ts.disabled ] && mv src/middleware.ts.disabled src/middleware.ts || true
  if [ -f /tmp/nados-actions.real.ts ]; then
    cp /tmp/nados-actions.real.ts "src/app/(auth)/actions.ts"
  fi
}
trap restore EXIT

echo "==> Building static site..."
rm -rf .next out
NEXT_EXPORT=true NEXT_PUBLIC_STATIC_EXPORT=true node node_modules/next/dist/bin/next build

echo "==> Static site ready in ./out"
