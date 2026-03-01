---
name: session-narrative
description: Convert RPG session transcripts into fictional narrative chapters using an agent team. Use when the user wants to "write the narrative", "create the chapter", "session narrative", "write up session", "novelise session", "campaign chronicle", "turn session into prose", or "write the chronicle".
---

# Session Narrative — Agent Team Fiction Pipeline

Transform RPG session transcripts into polished fictional narrative chapters in the style of Dean Koontz. Uses a team of specialized agents (Director, Writers, Editor, Publisher) working in parallel.

## Configuration

- **Google account:** `pelmog@gmail.com` (for Google Drive upload)

## Prerequisites

- Session transcript at `sessions/sessionXX-transcript.md`
- Character roster at `players/CHARACTERS.md`
- Foundry MCP connection (for publishing to Foundry journal)
- Google Workspace MCP connection (for Google Drive upload)
- Previous session summaries at `sessions/sessionXX-summary.md` (if not the first session)

## Quick Start

When triggered, follow this exact workflow:

### Phase 0: Identify the Session

Determine which session to process:
- User says "write the narrative for session 3" -> `sessions/session03-transcript.md`
- User says "write the chapter" -> find the latest transcript without a matching narrative file
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
  - **Emotional arc** — what the scene feels (e.g., "curiosity -> dread -> dark humour")
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
    7. Upload the chapter markdown to Google Drive:
       Use mcp__google-workspace__import_to_google_doc with:
       - user_google_email: "pelmog@gmail.com"
       - file_name: "Chapter XX: [Title]"
       - file_path: "sessions/sessionXX-narrative.md"
       - source_format: "md"
    8. Report the Google Doc link

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
- `style-guide.md` -> voice consistency
- `sessionXX-summary.md` -> plot continuity (fed to future Directors and Writers)
- `players/CHARACTERS.md` -> character consistency

## Edge Cases

- **Long transcripts (3,000+ lines):** Director creates more scenes (up to 6), more writers spawned
- **Short sessions (<500 lines):** Director creates 2-3 scenes, fewer writers
- **Missing Foundry MCP:** Skip Publisher phase, output markdown only
- **First session:** No previous summaries — Director notes this, writers work without "story so far"
- **Multi-session chapters:** User specifies "combine sessions 3 and 4" — Director reads both transcripts
