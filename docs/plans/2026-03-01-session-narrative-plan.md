# Session Narrative Skill — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Claude Code skill that uses an agent team (Director, Writers, Editor, Publisher) to convert RPG session transcripts into Dean Koontz-style fictional narrative chapters, output as both markdown and Foundry VTT journal pages.

**Architecture:** A skill (`session-narrative`) that, when triggered, creates a team with 4 agent roles. The Director reads the transcript and creates a scene outline. Writers work in parallel on individual scenes. The Editor assembles and polishes. The Publisher outputs markdown + Foundry journal. Continuity is maintained via summary files, not agent memory.

**Tech Stack:** Claude Code skills, Agent tool (team-based), Foundry MCP (`foundry_exec_js`, `foundry_create`), file I/O (`Read`, `Write`)

**Design doc:** `docs/plans/2026-03-01-session-narrative-design.md`

---

### Task 1: Create the Style Guide

**Files:**
- Create: `.claude/skills/session-narrative/style-guide.md`

**Step 1: Write the Koontz style guide**

This is injected verbatim into every Writer agent's prompt. It must be self-contained — a writer with zero context about our project should be able to follow it.

```markdown
# Session Narrative — Style Guide

You are a fiction writer crafting chapters of a serialized novel set in the Star Trek universe. Your style draws from Dean Koontz: thriller pacing, deep character interiority, atmospheric horror, dark humour, and genuine warmth between characters.

## Voice & Tone

- **POV:** Third-person limited, rotating between PCs per scene. Choose whoever is driving the action.
- **Rhythm:** Short, punchy sentences for tension. Longer flowing ones for wonder. Sentence rhythm IS pacing.
- **Humour:** Dark humour emerges from character voice, not narrator commentary. The crew roasts each other because they love each other.
- **Warmth:** These are people who would die for each other. Show it in small gestures — the look across the bridge, the hand on a shoulder, the joke that means "I'm glad you're alive."

## The Koontz Toolkit

### Interiority
We hear what the POV character thinks. Their fears. Their training fighting their instincts. The thing they'd never say out loud. A Vulcan suppressing an emotion is more interesting than a human expressing one.

### Sensory Saturation
What does recycled air on a derelict ship smell like? What does a subspace shimmer feel like against your skin? What sound does a turbolift make when the ship is too quiet? Ground every scene in at least two senses beyond sight.

### Dread Through Normality
The horror isn't the monster. It's the sleeping bags arranged in a perfect spiral. It's the coffee cup still warm. It's the crewmate who smiles at the wrong moment. Koontz teaches us that the ordinary made wrong is more terrifying than the extraordinary.

### Chapter Hooks
Open mid-action or with a line of dialogue that raises a question. End on a revelation, a door opening onto darkness, or a single line that recontextualises everything before it.

### Pacing
Alternate tension and release. After a horror beat, give the reader a moment of crew warmth or dark humour. After a quiet character moment, drop something that makes the skin crawl. Never let the reader settle.

## Player-to-Character Translation

The source material is an RPG session transcript — real people playing characters. Your job is to transform this into pure fiction while preserving the energy of the table.

| Transcript Element | Fiction Treatment |
|-------------------|-------------------|
| OOC jokes and banter | Becomes character wit — the joke stays, attributed to the character |
| Dice failures | Dramatic near-misses or costly successes — the task gets done but something goes wrong |
| Dice successes with Momentum | Moments of brilliance, intuition, or perfect teamwork |
| Complications | Things that go viscerally, physically wrong |
| Rules discussions | Silently dropped |
| "I roll [Discipline]" | The character actually doing the thing — tricorder readings, combat stances, surgical precision |
| Momentum spends | Flashes of expertise — the trained instinct kicking in |
| Threat spends (GM) | Environmental shifts, things getting worse, the universe pushing back |
| Table talk, breaks | Silently dropped |
| Meta-gaming | Silently dropped |
| Player personality quirks | Bleed through as character personality — the "flavoured fiction" approach |
| Repeated/stalled actions | Compress to the version that advances the story |

## Scene Structure

Each scene should run 1,000-2,000 words. A full chapter is 4,000-10,000 words.

### Scene Opening
Drop the reader into the middle. No preamble, no "meanwhile on the Enterprise." Start with action, dialogue, or a sensory detail that establishes mood.

### Scene Body
Follow the action of the transcript but elevate it. Add interiority, sensory detail, and subtext. Show the characters thinking, feeling, and reacting — not just acting.

### Scene Closing
End on a beat that propels the reader forward. A question unanswered. A door opened. A look exchanged. A single sentence that changes the meaning of everything before it.

## What to Skip

- Rules clarifications and mechanical discussions
- Bathroom breaks, food orders, technical issues
- Mechanical language ("I spend 2 Momentum", "that's Difficulty 2")
- Repeated actions that didn't advance the story
- Extended dice-rolling sequences with no narrative content
- Meta-gaming discussions about optimal strategy

## Character Voice Consistency

Each PC should have a distinct narrative voice when they're the POV character:
- Their internal monologue reflects their species, training, and personality
- A Vulcan thinks in logical structures with suppressed emotion bleeding through
- An Andorian thinks in terms of threats, honour, and action
- A Kzinti predator-turned-healer fights instinct with compassion
- An Orion navigates trust and suspicion — always reading the room
- An Edosian's three hands are always doing something — show it

## Tone Calibration

This is Star Trek, not grimdark. Even in horror:
- Hope is earned but never extinguished
- The crew's bonds are stronger than the threat
- Curiosity is a virtue, not a death sentence
- The moral question matters as much as the tactical one
- There is always a moment of wonder
```

**Step 2: Commit**

```bash
git add .claude/skills/session-narrative/style-guide.md
git commit -m "feat(session-narrative): add Koontz style guide for writers"
```

---

### Task 2: Create the Chapter Template

**Files:**
- Create: `.claude/skills/session-narrative/chapter-template.md`

**Step 1: Write the markdown template**

```markdown
# Chapter {{chapter_number}}: {{chapter_title}}

*USS Enterprise, NCC-1701 — Stardate {{stardate}}*

---

{{scene_content}}

---

*To be continued...*
```

**Step 2: Commit**

```bash
git add .claude/skills/session-narrative/chapter-template.md
git commit -m "feat(session-narrative): add chapter markdown template"
```

---

### Task 3: Create the SKILL.md — Director Workflow

This is the main skill file. It defines:
- Trigger phrases
- The Director's full workflow (team creation, scene breakdown, agent spawning, assembly)
- Agent prompt templates for Writers, Editor, Publisher

**Files:**
- Create: `.claude/skills/session-narrative/SKILL.md`

**Step 1: Write SKILL.md**

```markdown
---
name: session-narrative
description: Convert RPG session transcripts into fictional narrative chapters using an agent team. Use when the user wants to "write the narrative", "create the chapter", "session narrative", "write up session", "novelise session", "campaign chronicle", "turn session into prose", or "write the chronicle".
---

# Session Narrative — Agent Team Fiction Pipeline

Transform RPG session transcripts into polished fictional narrative chapters in the style of Dean Koontz. Uses a team of specialized agents (Director, Writers, Editor, Publisher) working in parallel.

## Prerequisites

- Session transcript at `sessions/sessionXX-transcript.md`
- Character roster at `players/CHARACTERS.md`
- Foundry MCP connection (for publishing to Foundry journal)
- Previous session summaries at `sessions/sessionXX-summary.md` (if not the first session)

## Quick Start

When triggered, follow this exact workflow:

### Phase 0: Identify the Session

Determine which session to process:
- User says "write the narrative for session 3" → `sessions/session03-transcript.md`
- User says "write the chapter" → find the latest transcript without a matching narrative file
- Confirm the transcript file exists before proceeding

### Phase 1: Director — Scene Breakdown

Read these files:
1. The session transcript (`sessions/sessionXX-transcript.md`)
2. Character roster (`players/CHARACTERS.md`)
3. Adventure design doc (`docs/plans/*-design.md` — find the relevant one)
4. All previous session summaries (`sessions/session*-summary.md`)

Then create a **scene outline** covering:
- **Scene count:** 3-6 scenes depending on transcript length
- For each scene:
  - **Title** — evocative, not mechanical
  - **Transcript lines** — start and end line numbers
  - **POV character** — which PC drives this scene
  - **Characters present** — PCs and NPCs in the scene
  - **Location** — where it takes place
  - **Emotional arc** — what the scene feels (e.g., "curiosity → dread → dark humour")
  - **Key beats** — the 2-3 most important moments
  - **Comedy opportunities** — OOC moments that become great character beats
  - **Narrative purpose** — why this scene exists in the chapter

Save the outline to `sessions/sessionXX-outline.json`.

Generate a **"story so far" brief** — a 500-word synopsis of all previous chapters (from summary files). This gets sent to every writer.

### Phase 2: Create Team and Spawn Writers

Create a team called `session-narrative`:

```
TeamCreate: team_name: "session-narrative", description: "Writing chapter XX"
```

Create tasks for each scene (one per writer) plus editor and publisher tasks.

Spawn one Writer agent per scene, all in parallel:

```
Agent:
  subagent_type: "general-purpose"
  team_name: "session-narrative"
  name: "writer-1"  (writer-2, writer-3, etc.)
  run_in_background: true
  prompt: |
    You are a fiction writer on a team. Your job is to write ONE scene
    of a chapter.

    READ the style guide first:
    .claude/skills/session-narrative/style-guide.md

    YOUR SCENE ASSIGNMENT:
    - Scene: [N] of [total] — "[scene title]"
    - POV Character: [name]
    - Location: [location]
    - Emotional arc: [arc]
    - Key beats: [beats]

    TRANSCRIPT EXCERPT (your scene):
    Read `sessions/sessionXX-transcript.md` lines [start]-[end]

    FULL OUTLINE (for narrative arc awareness):
    [paste outline]

    STORY SO FAR:
    [paste story-so-far brief]

    CHARACTER DATA:
    Read `players/CHARACTERS.md` for full PC details.

    INSTRUCTIONS:
    1. Read the style guide completely
    2. Read your transcript excerpt
    3. Read the character data for characters in your scene
    4. Write your scene (1,000-2,000 words)
    5. Save to `sessions/sessionXX-scene-[N].md`
    6. Mark your task as completed
```

### Phase 3: Editor — Assembly and Polish

After all writers complete, spawn the Editor:

```
Agent:
  subagent_type: "general-purpose"
  team_name: "session-narrative"
  name: "editor"
  prompt: |
    You are the editor for a fiction chapter. The writers have completed
    their scenes. Your job:

    1. Read the style guide: .claude/skills/session-narrative/style-guide.md
    2. Read all scene files: sessions/sessionXX-scene-*.md (in order)
    3. Read the outline: sessions/sessionXX-outline.json
    4. Read character data: players/CHARACTERS.md

    TASKS:
    a) Smooth transitions between scenes — ensure they flow as one
       continuous narrative, not disconnected vignettes
    b) Add chapter opening — a hook that grabs the reader mid-action
    c) Add chapter closing — a cliffhanger or revelation
    d) Fix character voice inconsistencies between scenes
    e) Ensure POV discipline (no head-hopping within scenes)
    f) Cut redundancy — if two writers covered the same beat, keep
       the stronger version
    g) Verify character names, ranks, species are consistent

    OUTPUT:
    Save the complete chapter to: sessions/sessionXX-narrative.md
    Use the template from: .claude/skills/session-narrative/chapter-template.md

    Then generate a CONTINUITY SUMMARY (500 words max):
    - What happened in this chapter (plot)
    - Character development (who changed, how)
    - Unresolved threads (what's hanging)
    - Emotional state of the crew at chapter's end
    - Key revelations or mysteries introduced

    Save to: sessions/sessionXX-summary.md

    Mark your task as completed.
```

### Phase 4: Publisher — Foundry Journal

After the Editor completes, spawn the Publisher:

```
Agent:
  subagent_type: "general-purpose"
  team_name: "session-narrative"
  name: "publisher"
  prompt: |
    You are the publisher. Take the finished chapter and publish it
    to Foundry VTT.

    1. Read the chapter: sessions/sessionXX-narrative.md
    2. Convert to styled HTML matching the project's dark theme:
       - Dark background sections with off-white text
       - Styled headers with accent colours
       - Italic scene-break markers
       - Readable body font
    3. Check if journal "The Silent Cartographer: Chronicle" exists:
       foundry_search type: "JournalEntry" query: "Chronicle"
    4. If it doesn't exist, create it:
       foundry_create type: "JournalEntry" data: {
         name: "The Silent Cartographer: Chronicle",
         ownership: { default: 1 }
       }
    5. Add a new page for this chapter:
       foundry_exec_js with JournalEntry.pages.createEmbeddedDocuments
       - Page name: "Chapter XX: [Title]"
       - Page type: "text"
       - text.format: 1 (HTML)
       - text.content: [styled HTML]
       - ownership: { default: 2 } (Observer — players can read)
    6. Report the journal ID and page ID

    Mark your task as completed.
```

### Phase 5: Cleanup

After Publisher completes:
1. Delete intermediate scene files (`sessions/sessionXX-scene-*.md`)
2. Keep: `sessionXX-narrative.md`, `sessionXX-summary.md`, `sessionXX-outline.json`
3. Delete the team: `TeamDelete`
4. Report to user: chapter title, word count, Foundry journal link

## File Structure

```
.claude/skills/session-narrative/
├── SKILL.md              # This file — Director workflow
├── style-guide.md        # Koontz writing brief (injected into writer prompts)
└── chapter-template.md   # Markdown template for chapter output

sessions/
├── session01-transcript.md    # Raw transcript (user provides)
├── session01-narrative.md     # Generated chapter (output, kept)
├── session01-outline.json     # Director's scene breakdown (kept)
├── session01-summary.md       # Continuity synopsis (kept, auto-generated)
└── session01-scene-*.md       # Writer drafts (deleted after assembly)
```

## Foundry Output

- **JournalEntry:** "The Silent Cartographer: Chronicle"
- One page per chapter, styled HTML with dark theme
- Journal ownership: Limited (1) — players see it but can't browse hidden pages
- Page ownership: Observer (2) — revealed pages are readable by all players
- Pages added incrementally as sessions are played

## Continuity Model

Agents are stateless. Continuity comes from files:
- `style-guide.md` → voice consistency
- `sessionXX-summary.md` → plot continuity (fed to future Directors and Writers)
- `players/CHARACTERS.md` → character consistency

## Edge Cases

- **Long transcripts (3,000+ lines):** Director creates more scenes (up to 6), more writers spawned
- **Short sessions (<500 lines):** Director creates 2-3 scenes, fewer writers
- **Missing Foundry MCP:** Skip Publisher phase, output markdown only
- **First session:** No previous summaries — Director notes this, writers work without "story so far"
- **Multi-session chapters:** User specifies "combine sessions 3 and 4" — Director reads both transcripts
```

**Step 2: Commit**

```bash
git add .claude/skills/session-narrative/SKILL.md
git commit -m "feat(session-narrative): add skill definition with Director workflow"
```

---

### Task 4: Update CLAUDE.md with Skill Reference

**Files:**
- Modify: `CLAUDE.md` (project root)

**Step 1: Add skill reference**

Find the line referencing `lazy-session-prep` and add after it:

```markdown
See also: `session-narrative` skill (`.claude/skills/session-narrative/`) for converting session transcripts into fictional narrative chapters using an agent team.
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: reference session-narrative skill in CLAUDE.md"
```

---

### Task 5: Test Run — Session 1

**Step 1: Verify prerequisites exist**

```bash
# Transcript exists
cat sessions/session01-transcript.md | head -5

# Characters exist
cat players/CHARACTERS.md | head -5

# No existing narrative (first run)
ls sessions/session01-narrative.md 2>/dev/null && echo "EXISTS" || echo "READY"
```

**Step 2: Trigger the skill**

Say: "Write the narrative for session 1"

The skill should:
1. Director reads transcript + characters, creates outline with 3-6 scenes
2. Team created, writers spawned in parallel
3. Writers produce scene files
4. Editor assembles, polishes, generates summary
5. Publisher creates Foundry journal page
6. Cleanup removes scene files, reports results

**Step 3: Review output**

- Read `sessions/session01-narrative.md` — verify quality, style, completeness
- Read `sessions/session01-summary.md` — verify continuity summary is useful
- Check Foundry journal page renders correctly
- Verify intermediate scene files were cleaned up

**Step 4: Commit outputs**

```bash
git add sessions/session01-narrative.md sessions/session01-summary.md sessions/session01-outline.json
git commit -m "feat: add Session 1 narrative chapter — The Silent Cartographer"
```

---

## Task Summary

| Task | Description | Dependencies |
|------|-------------|-------------|
| 1 | Create style guide | None |
| 2 | Create chapter template | None |
| 3 | Create SKILL.md (Director workflow + agent prompts) | None |
| 4 | Update CLAUDE.md | Task 3 |
| 5 | Test run with Session 1 transcript | Tasks 1-4 |

Tasks 1-3 can be executed in parallel. Task 4 depends on Task 3. Task 5 depends on all.
