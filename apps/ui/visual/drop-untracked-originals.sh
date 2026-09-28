#!/bin/bash
# Remove visual originals that are NOT yet committed (git status `??`), by name
# fragment. Committed originals are never touched: the frozen set is immutable.
#
# Usage: apps/ui/visual/drop-untracked-originals.sh <name-fragment> [<name-fragment>…]
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
for frag in "$@"; do
  git status --porcelain -- apps/ui/visual/__originals__ | grep '^?? ' | sed 's/^?? //' | grep -F -- "$frag" | while read -r f; do
    rm -f -- "$f" && echo "dropped $f"
  done
done
