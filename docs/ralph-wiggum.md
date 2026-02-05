# Ralph Wiggum - Autonomous AI Coding Loop

Ralph Wiggum is an autonomous AI coding pattern that runs your AI coding CLI in a loop, letting it work on tasks from a PRD until complete.

## Overview

Instead of writing a new prompt for each phase of development, Ralph:
1. Reads a PRD file to see what needs to be done
2. Reads a progress file to see what's already done
3. Picks the highest priority incomplete task
4. Implements it with feedback loops (types, tests, lint)
5. Commits the code
6. Repeats until done

The key insight: **the agent chooses the task, not you**.

## Quick Start

### HITL Mode (Human-in-the-Loop)

Watch Ralph work, intervene when needed:

```bash
./ralph-once.sh
```

Use this to:
- Learn how Ralph works
- Refine your PRD
- Build confidence before going AFK

### AFK Mode (Away From Keyboard)

Let Ralph run autonomously:

```bash
./ralph.sh 5     # Run 5 iterations
./ralph.sh 10    # Run 10 iterations
```

Always cap iterations. Ralph will stop early if it completes all tasks.

## Files

| File | Purpose |
|------|---------|
| `ralph.sh` | AFK loop script |
| `ralph-once.sh` | Single iteration (HITL) script |
| `prd.json` | Product requirements - your task list |
| `progress.txt` | Session log - tracks what's done |

## PRD Format

The PRD is a JSON file with prioritized tasks:

```json
{
  "name": "Project v1.0",
  "description": "Feature description",
  "items": [
    {
      "id": "1",
      "category": "infrastructure",
      "description": "Add linting",
      "steps": [
        "Add ESLint config",
        "Add lint script",
        "Verify all files pass"
      ],
      "priority": "high",
      "passes": false
    }
  ]
}
```

Ralph marks `passes: true` when complete. You can also manually adjust:
- Set `passes: false` to redo a task
- Add new items mid-sprint
- Change priorities

## Progress Tracking

`progress.txt` carries context between iterations:

```
# Progress Log

## Completed Tasks

### 2026-02-05 - Task Name
- What was done
- Decisions made
- Files changed
- Notes for next iteration
```

**Delete this file between sprints.** It's session-specific.

## Task Prioritization

Ralph prioritizes in this order:

1. **Architectural decisions** - Foundations that cascade through codebase
2. **Integration points** - Reveals incompatibilities early
3. **Unknown unknowns** - Better to fail fast
4. **Standard features** - Normal implementation work
5. **Polish and cleanup** - Easy wins for later

Use HITL mode for risky architectural work. Save AFK for lower-risk tasks.

## Feedback Loops

Before committing, Ralph runs:

```bash
pnpm typecheck   # TypeScript must pass
pnpm test        # Tests must pass (if available)
pnpm lint        # Linting must pass (if available)
```

Ralph won't commit if any loop fails. This prevents entropy.

## Docker Sandboxes (Recommended for AFK)

For overnight or long-running AFK sessions:

```bash
docker sandbox run claude -p "@prd.json @progress.txt ..."
```

This isolates Ralph from your system. It can edit project files but not your home directory.

## Tips

1. **Start with HITL** - Learn and refine before going AFK
2. **Define scope explicitly** - Vague tasks lead to shortcuts
3. **Keep tasks small** - Smaller = better quality
4. **Prioritize risky work first** - Fail fast on hard problems
5. **Watch for entropy** - Ralph amplifies existing code patterns

## References

- [Ralph Wiggum Pattern](https://ghuntley.com/ralph/)
- [11 Tips for AI Coding with Ralph](https://www.aihero.dev/11-tips-for-ai-coding-with-ralph-wiggum)
- [Anthropic: Long-Running Agent Harnesses](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
