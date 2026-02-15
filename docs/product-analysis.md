# SkillForge — Product Strategy Analysis

_Generated: 2026-02-15_

## 1. The Core User Problem

**Surface request:** "I want to see and manage my AI skills in one place."

**Actual problem:** Developers are building increasingly sophisticated AI workflows through custom prompts, commands, and configs — but these are **trapped in tool-specific formats, scattered across dotfiles, and invisible.** There's no awareness of what you have, no way to reuse across tools, and no way to evolve your "AI toolkit" intentionally.

The deeper insight: **developers are unknowingly building a personal AI skill library, but have zero tooling to treat it as one.** It's like writing code without a file browser or version control.

---

## 2. Highest-Value User Flows

**Flow A — "Show me what I have" (Discovery)**
Scan system → detect tools → enumerate all skills/commands → present unified inventory with counts, duplicates, and gaps.

This is the **aha moment**. "You have 34 skills across Claude Code, Cursor, and Codex — 8 are duplicates, 12 are project-specific." This flow alone creates enough value to justify installation.

**Flow B — "Make this skill work over there" (Portability)**
Select a skill → translate it to another tool's format → export/deploy it.

This is the **retention loop**. Once someone moves a great Cursor rule into Claude Code (or vice versa), they understand the value and come back.

**Everything else is secondary.** Editing, organizing, tagging — these are polish on top of discovery + portability.

---

## 3. Must-Have vs. Nice-to-Have

| Must-have for PMF               | Nice-to-have noise            |
| ------------------------------- | ----------------------------- |
| Auto-detect installed tools     | Manual tool config            |
| Import/scan all existing skills | Skill creation from scratch   |
| Unified skill inventory view    | Tagging/favoriting/categories |
| Cross-tool export (even lossy)  | Lossless bi-directional sync  |
| First-run "wow" moment (counts) | Onboarding tutorial/wizard    |
| 2-3 connectors that work well   | 5+ connectors that half-work  |

**Brutal truth from the codebase:** You have 5 connectors with detection working but **zero import/export actually implemented**. The entire value proposition is stubbed out. The tool detail page is polished but it's a read-only window into what `ls ~/.claude/commands` already shows. The current app is a nice file browser — not a skill manager.

---

## 4. Hidden Assumptions to Challenge

**"Users need a library view."**
Do they? The mental model might be wrong. Developers don't think in "libraries of skills" — they think in **projects** and **tools**. "What skills are active in this project, in this tool?" might be the better frame than a flat library.

**"Multi-tool is the primary value."**
Your biggest risk. If 80% of your users are Claude Code-only or Cursor-only, the cross-tool portability story falls flat. The product needs to be valuable even for single-tool users — which means the discovery/inventory flow must stand alone.

**"Local-first is a feature."**
For developers, local-first is table stakes, not a differentiator. Don't over-invest in marketing this — it's expected.

**"The skill format differences are the hard problem."**
The actual hard problem might be **skill quality and context**. Moving a `.cursorrules` file to `CLAUDE.md` is trivially a file copy. The value isn't in the format translation — it's in helping users understand _which skills are worth keeping, which conflict, and which are stale_. If translation is too easy, your product doesn't have a moat.

**"A marketplace/team sharing is the monetization path."**
Team sharing of prompts is already built into Cursor (`.cursor/rules`), Claude Code (`CLAUDE.md` in repo), etc. Your paid feature would be competing with git + a shared repo. The monetization angle might be better as **analytics/insights** ("your team uses 12 skills, 4 are outdated, here's what top performers use differently").

---

## 5. Non-Obvious Angles

**Skill drift detection.** Skills rot. A prompt written for GPT-4 performs differently on Claude 4. Track which skills haven't been updated since a model change and flag them. No one else does this.

**"Skill diff" across projects.** "Project A has 8 skills. Project B has 3. Here are the 5 you're missing." This is immediately actionable and creates an "I need this tool" moment.

**Reverse distribution — be the skill, not the manager.** Instead of a standalone app, ship a Claude Code slash command (`/skillforge`) and a Cursor extension that acts as the entry point. Meet users where they already are. The Electron app becomes the power-user dashboard, not the primary surface.

**Skill templates as distribution.** "Starting a new Next.js project? Here are the 7 skills that 200 developers use for Next.js across Claude Code + Cursor." This is your marketplace seed — curated starter packs, not an open bazaar.

**Project-scoped skill sets as the unit of sharing.** Don't sell individual skills. Sell "skill configurations for [framework/workflow]." This is how Tailwind configs, ESLint presets, and dotfile repos work — and developers already understand this model.

---

## 6. Sharp MVP Scope (Optimized for Learning Speed)

**Cut to this and ship in 2 weeks:**

1. **First-run scan** — detect tools, import all skills into the library, show the count. This is your hook.
2. **Unified inventory** — one list of all skills, grouped by source tool, with search. Not fancy — a table is fine.
3. **One-click export** — pick a skill, pick a target tool, export it. Even if the translation is "copy the markdown and wrap it in the right format." Start with Claude Code ↔ Cursor only.
4. **Skill diff** — compare skills across two projects or two tools. Show what's missing.

**Explicitly cut:**

- Skill editing (they have editors for that)
- Skill creation (they have editors for that)
- Projects page (premature)
- Settings beyond theme (premature)
- Codex/Gemini/OpenCode connectors (focus on Claude Code + Cursor where your users actually are)
- Database-backed skill management (just read/write from the tool's native config files — don't add a canonical store yet)

**The learning question this MVP answers:** "Do developers care enough about cross-tool skill visibility to install a separate app?"

---

## 7. Success Metrics That Prove Real Value

| Metric                                  | Why it matters                                 | Vanity trap to avoid                                 |
| --------------------------------------- | ---------------------------------------------- | ---------------------------------------------------- |
| **Skills exported to a different tool** | Proves the cross-tool value prop works         | ~~Total skills imported~~ (passive, not intentional) |
| **Return visits after day 1**           | Proves ongoing utility, not just curiosity     | ~~Downloads / installs~~                             |
| **Time from install to first export**   | Measures activation friction                   | ~~Time spent in app~~ (could mean confusion)         |
| **% of users with 2+ tools detected**   | Validates the multi-tool assumption            | ~~Number of connectors shipped~~                     |
| **Skill diff actions taken**            | Proves the "what am I missing" frame resonates | ~~Pages viewed~~                                     |

**The one metric that matters most right now:** **% of installers who complete at least one cross-tool export within the first session.** If this is below 10%, the core value prop isn't landing.

---

## Bottom Line

You've built solid infrastructure but you're polishing the frame before painting the picture. The 5 connectors with detection are great — but the product is currently a read-only dashboard that doesn't do anything a user can't do with `ls` and `cat`.

**The single most important thing to build next is import → export.** Not the library view, not onboarding, not more connectors. Get one skill from Claude Code into Cursor (or vice versa) through your app, and you have a product. Everything else is decoration until that loop works.
