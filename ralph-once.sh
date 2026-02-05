#!/bin/bash
# ralph-once.sh - Run a single Ralph iteration (HITL mode)
# Usage: ./ralph-once.sh
#
# Use this for human-in-the-loop development:
# - Watch what Ralph does
# - Intervene when needed
# - Refine your PRD and prompts

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "Running single Ralph iteration (HITL mode)..."
echo "Project: $PROJECT_ROOT"
echo ""

claude -p \
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
"

echo ""
echo "=== Iteration complete ==="
echo "Review the changes, then run again or use ./ralph.sh for AFK mode."
