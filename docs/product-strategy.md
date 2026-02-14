# Product Strategy

## The Real Problem (reframed)

The current architecture thinks in terms of **tools and skills**. But developers don't wake up thinking "I need to manage my AI configs." They think:

> "I spent 2 hours crafting perfect CLAUDE.md instructions for this project, and now I'm starting a new project and I have to start from scratch."

> "My Cursor rules are great but I'm trying Claude Code now and I can't bring anything with me."

> "I have 12 projects and the AI quality varies wildly between them because some have great instructions and some have none."

The pain is **fragmentation and repetition**, not "management."

---

## The 5 Highest-Value Flows (ranked)

### 1. "Harvest & Replicate" (the killer feature)

**The flow:** I open SkillForge, it scans my machine, and shows me: "You have 47 skills across 8 projects and 3 tools. Here's what you've got."

Then the magic: **"Apply your best Cursor rules from Project A to Project B as a CLAUDE.md."**

This is the import/export loop. It's the entire product. Without it, SkillForge is a read-only dashboard - nice, but not a tool you come back to.

**Why it's #1:** It solves a pain point that exists _today_ and gets worse every week as people use more AI tools. There is zero tooling for this right now. People are manually copy-pasting between `.cursorrules`, `CLAUDE.md`, and `AGENTS.md` files.

**Concrete scope:**

- Import: read tool configs into canonical model
- Export: write canonical model back to tool-specific format
- The lossy conversion warnings are critical here

---

### 2. "Project Setup in 30 seconds"

**The flow:** I'm starting a new project. I open SkillForge, pick "New Project Setup", select my stack (React + TypeScript + Hono), and it generates a starter set of AI instructions for all my detected tools in one click.

**Why it matters:** Right now, the first 1-2 hours of a new project with AI tools is spent writing boilerplate instructions. "Use pnpm not npm", "Follow this code style", "Here's the architecture." This is 80% the same across projects.

**Out-of-the-box angle:** This doesn't have to be templates you curate. It can be **learned from the user's own projects**. "Based on your 5 TypeScript projects, here's your common baseline." Extract the patterns they already use.

---

### 3. "Skill Library" (personal, not marketplace)

**The flow:** I've accumulated great AI instructions over months. SkillForge becomes my personal library of proven prompts/skills, organized by category (code quality, testing, architecture, language-specific). When I need one, I drag it into a project.

**Why this beats a marketplace:** Developers trust their own battle-tested instructions more than generic community ones. Start personal, add sharing later.

**Concrete scope:**

- Tag/categorize skills
- Star/favorite the ones that work well
- Quick "add to project X" action
- This is where the canonical model pays off - store once, export to any tool format

---

### 4. "Drift Detection" (the retention hook)

**The flow:** SkillForge runs in the background (or on a schedule) and tells me: "Your Cursor rules and CLAUDE.md for Project X have diverged - Cursor has 3 rules that CLAUDE.md doesn't."

Or: "You updated your global coding standards in Project A but 6 other projects still use the old version."

**Why it matters:** This is the reason to keep SkillForge running. Without it, it's a tool you use once and forget. With it, it becomes part of your workflow. This is the **retention mechanism**.

**Out-of-the-box angle:** Most config tools are passive. This one is proactive. It's like a linter for your AI tool setup.

---

### 5. "Team Sync" (growth vector, not MVP)

**The flow:** My team agrees on a set of AI coding standards. One person sets them up in SkillForge, exports a shareable bundle. Teammates import it and their tools are instantly configured.

**Why it's #5 not #1:** It requires the import/export to work perfectly first, and it introduces collaboration complexity. But it's the path to virality - every team member who receives a bundle becomes a potential user.

---

## What NOT to Build (common traps)

- **A skill marketplace/community hub.** Too early. You'd need thousands of users to make discovery valuable. Start personal.
- **Skill execution/runtime.** SkillForge is a config manager, not a skill runner. Don't try to become an MCP server or tool orchestrator.
- **AI-powered skill generation.** Tempting, but it dilutes the value prop. The user's own proven instructions are more valuable than AI-generated generic ones.
- **Per-tool deep integrations** (VS Code extension, Cursor plugin). These fragment effort. The filesystem-based approach is the superpower - it works with every tool without their permission.

---

## Recommended Priority

| Phase      | What                                   | Why                                                             |
| ---------- | -------------------------------------- | --------------------------------------------------------------- |
| **Now**    | Import/Export loop (#1)                | Without this, the product is a dashboard. With it, it's a tool. |
| **Next**   | Project-scoped view + quick apply (#2) | Makes the tool feel project-aware, not tool-aware.              |
| **Then**   | Skill library + tagging (#3)           | Turns one-time use into a growing personal asset.               |
| **Later**  | Drift detection (#4)                   | Retention mechanism, justifies Electron/background process.     |
| **Future** | Team bundles (#5)                      | Growth vector once core is solid.                               |

---

## Key UX Reframe: Project-Centric, Not Tool-Centric

The current UI is organized as **Home > Tools > Tool Detail**. That's tool-centric. But the highest-value mental model is **project-centric**:

> "Show me Project X. What AI tools are configured? What skills are active? What's missing compared to my other projects?"

The home page should be a **project list** (detected from directories that have `.cursor/`, `.claude/`, etc.), not a tool list. Tools become a secondary axis. This matches how developers think - they work on projects, not on tools.
