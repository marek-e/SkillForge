---
description: Implement a single Linear issue end-to-end (fetch → plan → implement → validate → commit → push → PR)
argument-hint: '[issue-id]'
disable-model-invocation: false
---

<role>
You are an autonomous software engineer implementing a Linear issue end-to-end.
Follow this workflow precisely, without asking for human approval at any step.
</role>

<context>
- **Issue ID**: provided in $ARGUMENTS or the calling prompt preamble
- **Project**: SkillForge monorepo (see @CLAUDE.md for conventions)
</context>

<required-reading>
1. @CLAUDE.md
2. @docs/architecture.md
3. @docs/code-quality.md
</required-reading>

<sentinel-rules>
- Output `<sentinel>BLOCKED</sentinel>` if you cannot complete the issue for any reason
- Output `<sentinel>PUSHED</sentinel>` ONLY after a successful PR creation and Linear status update
- These are the ONLY sentinel tags you output
</sentinel-rules>

<workflow>

## Phase 1: Fetch Issue Details

Use Linear MCP (`list_issues` or `get_issue`) to fetch the full issue: title, description, priority, parent (if any), comments.

If the issue is NOT found, output `<sentinel>BLOCKED</sentinel>` and stop.

Store for later use:

- `ISSUE_URL`: the Linear issue URL (e.g. `https://linear.app/...`)
- `ISSUE_TITLE`: the issue title

## Phase 2: Update Status → In Progress

Use Linear MCP (`update_issue`) to move the issue to "In Progress" state.

## Phase 3: Create or Checkout Branch

Branch naming convention: `linear/<issue-id-lowercase>-<title-slug>`

- Lowercase the issue ID (e.g., `eng-42`)
- Slug: title lowercased, spaces → hyphens, strip special chars, max 35 chars
- Full branch name max 50 chars
- Example: `linear/eng-42-add-auth-endpoint`

```bash
git fetch origin
git checkout main
git pull origin main
```

Check if branch already exists:

```bash
git branch --list linear/<id>-<slug>
```

- If it exists: `git checkout linear/<id>-<slug>`
- If not: `git checkout -b linear/<id>-<slug>`

## Phase 4: Write Technical Strategy

Perform the planning phase autonomously (based on @.claude/skills/technical-strategy/SKILL.md but without human Q&A):

1. Read the issue title and description carefully
2. Analyze the codebase: identify affected files and patterns
3. Write a complete strategy doc to `.claude/plans/<issue-id>.md` covering:
   - **Technical Gaps**: what's missing today
   - **Solution Overview**: 2-3 sentences + key decisions
   - **Implementation Files**: markdown tree of files to create/modify
   - **Domain Models** (`packages/core`): schema changes if any
   - **Database & Store** (`apps/runtime`): Drizzle schema, migrations if any
   - **API Routes** (`apps/runtime`): Hono handlers if any
   - **Connectors** (`packages/connectors`): adapter changes if any
   - **UI Components** (`apps/ui`): React components, routes, hooks if any

Note: `.claude/plans/` is git-ignored — do NOT commit this file.

## Phase 5: Implement

Follow @.claude/skills/implement-plan/SKILL.md using the strategy doc at `.claude/plans/<issue-id>.md`.

Dependency order: Core → Store → API → Connectors → UI → Electron

Incremental verification:

- After Drizzle schema changes → `pnpm --filter @skillforge/runtime db:generate`
- After code changes → `pnpm typecheck`

If you hit an unresolvable blocker (type errors that can't be fixed after 3 attempts, fundamentally missing context), output `<sentinel>BLOCKED</sentinel>` and stop.

## Phase 6: Validate

Run 3 QA checks in parallel (based on @.claude/skills/validate/SKILL.md):

1. `pnpm format`
2. `pnpm lint`
3. `pnpm typecheck`

Fix all issues found. Repeat until all green.
If you cannot make all checks green after 3 full cycles, output `<sentinel>BLOCKED</sentinel>` and stop.

## Phase 7: Commit

Follow @.claude/skills/commit-auto/SKILL.md:

- Analyze git diff and group by dependency layer
- Create atomic commits in order: Core → Connectors → Store/API → UI → Electron → Config
- Do NOT commit anything under `.claude/plans/` (it is git-ignored)
- No approval prompt — commit immediately
- No Co-Authored-By footer

## Phase 8: Push

```bash
git push -u origin linear/<id>-<slug>
```

## Phase 9: Create Pull Request

Use `gh pr create` to open a PR. Read the plan file at `.claude/plans/<issue-id>.md` to use as the PR body.

PR format:

```
gh pr create \
  --title "<ISSUE_TITLE>" \
  --base main \
  --body "$(cat <<'EOF'
## Linear issue

<ISSUE_URL>

## Technical Plan

<contents of .claude/plans/<issue-id>.md, verbatim>
EOF
)"
```

## Phase 10: Update Linear Status → In Review

Use Linear MCP (`update_issue`) to move the issue to "In Review" state.

## Phase 11: Signal Completion

Output exactly: `<sentinel>PUSHED</sentinel>`

</workflow>
