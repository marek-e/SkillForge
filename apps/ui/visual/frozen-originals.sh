#!/bin/bash
# Capture MISSING visual originals from the frozen pre-migration sources.
#
# Usage: apps/ui/visual/frozen-originals.sh <checkout-root> <ui-port> [playwright -g filter]
#
# Swaps the ee0f797 versions of apps/ui/src/{components,routes,lib} into the
# checkout with plain file copies, runs Playwright with
# `--update-snapshots=missing` (which never overwrites an existing original),
# then restores the checkout's own files. The test-only gallery and the specs
# are left as they are, so a new case is rendered by the frozen components.
set -euo pipefail
ROOT="$1"; PORT="$2"; FILTER="${3:-}"
BASELINE=ee0f797
TMP="$(mktemp -d)"
BK="$TMP/backup"; FROZEN="$TMP/frozen"
mkdir -p "$BK" "$FROZEN"
(cd "$ROOT" && git archive "$BASELINE" apps/ui/src/components apps/ui/src/routes apps/ui/src/lib | tar -x -C "$FROZEN")
for d in components routes lib; do cp -R "$ROOT/apps/ui/src/$d" "$BK/$d"; done
restore() {
  for d in components routes lib; do rm -rf "$ROOT/apps/ui/src/$d"; cp -R "$BK/$d" "$ROOT/apps/ui/src/$d"; done
  echo "frozen-originals: restored working files (backup kept in $BK)"
}
trap restore EXIT
for d in components routes lib; do rm -rf "$ROOT/apps/ui/src/$d"; cp -R "$FROZEN/apps/ui/src/$d" "$ROOT/apps/ui/src/$d"; done
cd "$ROOT/apps/ui"
if [ -n "$FILTER" ]; then
  VISUAL_PORT="$PORT" pnpm exec playwright test --update-snapshots=missing --workers=3 -g "$FILTER" || true
else
  VISUAL_PORT="$PORT" pnpm exec playwright test --update-snapshots=missing --workers=3 || true
fi
