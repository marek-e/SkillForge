#!/bin/bash
# ralph.sh - Run Claude Code autonomously in a loop
# Usage: ./ralph.sh <iterations>
#
# Ralph Wiggum is an autonomous AI coding loop that:
# 1. Reads the PRD to see what needs to be done
# 2. Reads progress.txt to see what's already done
# 3. Picks the highest priority task
# 4. Implements it with feedback loops (types, tests, lint)
# 5. Commits and updates progress
# 6. Repeats until done or max iterations reached

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  echo ""
  echo "Examples:"
  echo "  ./ralph.sh 5      # Run 5 iterations"
  echo "  ./ralph.sh 10     # Run 10 iterations"
  exit 1
fi

ITERATIONS=$1
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "Starting Ralph Wiggum loop with $ITERATIONS iterations..."
echo "Project: $PROJECT_ROOT"
echo ""

for ((i=1; i<=$ITERATIONS; i++)); do
  echo "=== Iteration $i of $ITERATIONS ==="

  result=$(docker sandbox run claude -p \
"@prd.json @progress.txt @AGENTS.md

You are running in Ralph Wiggum mode - an autonomous coding loop.

## Your Task

1. **Pick the next task**: Read prd.json and progress.txt. Choose the highest priority incomplete task - not necessarily the first one. Prioritize:
   - Architectural decisions and core abstractions
   - Integration points between modules
   - Unknown unknowns and spike work
   - Standard features
   - Polish and cleanup

2. **Implement it**: Make small, focused changes. One logical change per commit.

3. **Run feedback loops**: Before committing, run ALL checks:
   - TypeScript: pnpm typecheck (must pass)
   - Tests: pnpm test (if available, must pass)
   - Lint: pnpm lint (if available, must pass)
   Do NOT commit if any feedback loop fails. Fix issues first.

4. **Update progress**: Append to progress.txt:
   - Task completed and PRD item reference
   - Key decisions made
   - Files changed
   - Any blockers or notes for next iteration
   Keep entries concise.

5. **Commit**: Make a git commit with a clear message.

## Important

- ONLY WORK ON A SINGLE TASK per iteration
- Keep changes small and focused
- Quality over speed
- If all tasks in prd.json are complete, output <promise>COMPLETE</promise>
")

  echo "$result"
  echo ""

  if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
    echo "=== PRD COMPLETE ==="
    echo "All tasks finished after $i iterations."
    exit 0
  fi
done

echo "=== MAX ITERATIONS REACHED ==="
echo "Completed $ITERATIONS iterations. Check progress.txt for status."
