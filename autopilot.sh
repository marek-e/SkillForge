#!/bin/bash
# autopilot.sh - Autonomous Linear ticket solver for SkillForge
#
# Flow per iteration:
# 1. Fetch highest-priority Todo issue from the SkillForge project (via MCP inside claude session)
# 2. Run docker sandbox session with /ticket-solver skill
#    - Creates branch linear/<id>-<slug>
#    - Marks In Progress, implements, validates, commits, pushes
#    - Marks In Review on success
# 3. On failure: adds Blocked label to the issue
# 4. Loops until no more Todo issues

set -e

TEAM="Melmayan"
PROJECT="SkillForge"
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

# Load .env if present
if [ -f "$PROJECT_ROOT/.env" ]; then
  set -a
  source "$PROJECT_ROOT/.env"
  set +a
fi

# Ensure GH_TOKEN exists
if [ -z "$GH_TOKEN" ]; then
  echo "ERROR: GH_TOKEN not set in environment or .env file."
  exit 1
fi

echo "Autopilot starting for project: $PROJECT"
echo "Project root: $PROJECT_ROOT"
echo ""

while true; do
  echo "=== Fetching next Todo issue from Linear ==="

  issue_result=$(docker sandbox run -e GH_TOKEN="$GH_TOKEN" claude -p \
"@CLAUDE.md

You are running in autopilot issue-picker mode. Your ONLY job is to identify the next issue to work on.

## Task

Use the Linear MCP tools to:
1. List non archived issues for project \"$PROJECT\" with state \"Todo\", ordered by priority
2. If NO issues are found in Todo state, output exactly: <sentinel>NO_ISSUES</sentinel>
3. If issues are found, pick the highest priority one and output exactly:
   <sentinel>ISSUE_ID:<issue-identifier></sentinel>
   For example: <sentinel>ISSUE_ID:MEL-42</sentinel>

Output ONLY the sentinel tag, nothing else.
")

  echo "$issue_result"

  if [[ "$issue_result" == *"<sentinel>NO_ISSUES</sentinel>"* ]]; then
    echo "=== No more Todo issues. Autopilot complete. ==="
    exit 0
  fi

  ISSUE_ID=$(echo "$issue_result" | grep -o '<sentinel>ISSUE_ID:[^<]*</sentinel>' | sed 's/<sentinel>ISSUE_ID://;s/<\/sentinel>//')

  if [ -z "$ISSUE_ID" ]; then
    echo "ERROR: Could not parse issue ID from output. Stopping."
    exit 1
  fi

  echo ""
  echo "=== Working on issue: $ISSUE_ID ==="

  session_result=$(docker sandbox run -e GH_TOKEN="$GH_TOKEN" claude -p \
"@CLAUDE.md @.claude/skills/ticket-solver/SKILL.md

Issue to implement: $ISSUE_ID
Team: $TEAM
Project: $PROJECT

Follow the ticket-solver skill instructions exactly.
")

  echo "$session_result"
  echo ""

  if [[ "$session_result" == *"<sentinel>BLOCKED</sentinel>"* ]]; then
    echo "=== Issue $ISSUE_ID blocked. Adding label and continuing. ==="
    docker sandbox run -e GH_TOKEN="$GH_TOKEN" claude -p \
"Use the Linear MCP tools to add a 'Blocked' label to issue $ISSUE_ID.
If the label doesn't exist, create it with color #FF6B6B.
Output: done" || true
    echo "Continuing to next issue..."
    echo ""
  elif [[ "$session_result" == *"<sentinel>PUSHED</sentinel>"* ]]; then
    echo "=== Issue $ISSUE_ID complete and pushed. ==="
    echo ""
  else
    echo "WARNING: Unexpected output from ticket-solver for $ISSUE_ID. Stopping for safety."
    exit 1
  fi
done
