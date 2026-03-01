# The Bridge — AI GM Companion for Star Trek Adventures

## Vision

A real-time GM companion that brings NPCs to life during tabletop RPG sessions. Each NPC is a persistent Claude Code instance (a "Zigi") with its own personality, memory, motivations, and full access to the live Foundry VTT game world. A web dashboard lets the GM see what NPCs are thinking, approve their dialogue and actions, and run combat — all while player speech is transcribed from Discord and fed to the NPCs as context.

After each session, the captured transcript (enriched with NPC dialogue and game events) feeds into the existing session-narrative skill to produce a fictional chapter.

**Nothing like this exists.** The market has AI prep tools (LitRPG Adventures, LoreKeeper), AI-replaces-the-GM products (AI Dungeon, Friends & Fables), Foundry chat wrappers (RPGX AI Assistant), and basic combat automation (PF2e AI Combat Assistant, mookAI). Nobody is building persistent AI NPC agents connected to a live VTT with voice transcription.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  GM Dashboard (React, localhost:3000)                                │
│  - NPC output streams (thoughts, dialogue, actions)                 │
│  - Live transcript feed (tagged IC/OOC/ACTION/META)                 │
│  - Combat panel (popcorn initiative, threat/momentum)               │
│  - Action approval queue                                            │
│  - Scene status (from Foundry active scene)                         │
└────────────────────┬────────────────────────────────────────────────┘
                     │ WebSocket (bidirectional, real-time)
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Bridge Server (Python/FastAPI, localhost:8000)                      │
│                                                                      │
│  ┌──────────────────┐ ┌──────────────┐ ┌────────────────────────┐  │
│  │ NPC Session Pool  │ │ Foundry      │ │ Transcription Pipeline │  │
│  │ (warm CC instances│ │ Watcher      │ │ - Discord bot audio    │  │
│  │  via IgentSession │ │ - Scene poll │ │ - Whisper STT          │  │
│  │  Pool pattern)    │ │ - Token poll │ │ - Haiku Filter Zigi    │  │
│  │                   │ │ - Combat poll│ │ - Utterance queue      │  │
│  └──────────────────┘ └──────────────┘ └────────────────────────┘  │
│                                                                      │
│  ┌──────────────────┐ ┌──────────────┐ ┌────────────────────────┐  │
│  │ Action Queue      │ │ NPC Database │ │ Session Recorder       │  │
│  │ (pending GM       │ │ (MongoDB)    │ │ (enriched transcript   │  │
│  │  approvals)       │ │              │ │  for narrative skill)  │  │
│  └──────────────────┘ └──────────────┘ └────────────────────────┘  │
└──────┬──────────────┬──────────────────┬──────────────┬─────────────┘
       │              │                  │              │
       ▼              ▼                  ▼              ▼
┌────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────────┐
│ NPC Zigis  │ │ Foundry MCP  │ │ Discord Bot  │ │ Session        │
│ (claude -p │ │ Server       │ │ (voice →     │ │ Narrative      │
│  instances)│ │ (15 tools,   │ │  Whisper →   │ │ Skill          │
│            │ │  already     │ │  text)       │ │ (post-session) │
│ Kirk       │ │  exists)     │ │              │ │                │
│ Kor        │ │              │ │              │ │ Director →     │
│ Chen       │ │              │ │              │ │ Writers →      │
│ Klingon BoP│ │              │ │              │ │ Editor →       │
│ etc.       │ │              │ │              │ │ Publisher      │
└────────────┘ └──────────────┘ └──────────────┘ └────────────────┘
```

## Core Principle: Foundry Is the Source of Truth

The dashboard never duplicates Foundry state. Scene management, combat state, actor data, token positions — all come from Foundry via MCP. The dashboard only adds the AI layer: NPC thoughts, dialogue, action proposals, and the transcription feed. This avoids sync problems and means the GM never updates two places.

---

## Component Design

### 1. NPC Zigis (Persistent Claude Code Instances)

Each NPC is a Claude Code instance launched with `claude -p --output-format=stream-json --input-format=stream-json`. Session IDs are captured from stream-json output and stored in the NPC database for resurrection across sessions.

**Based on the Zigi framework** from `puppeteer-h10`:
- `IgentSession` for subprocess management and streaming
- `IgentSessionPool` for warm instances with configurable idle timeouts
- `IgentStateManager` for MongoDB state tracking
- `--resume {session_id}` for cross-session memory restoration

#### NPC Workspace

Each NPC has a workspace directory with personality and state files:

```
~/.claude/igents/npc-kirk/
├── role.md            # Personality, species, rank, voice, mannerisms
├── memory.md          # What the NPC has experienced (grows across sessions)
├── motivations.md     # Current goals, fears, obligations
├── relationships.md   # How this NPC feels about each PC and other NPCs
├── scene-context.md   # Current scene briefing (updated dynamically)
└── response-rules.md  # When to speak, output format, silence permission
```

#### NPC Response Format

Every NPC outputs structured JSON so the Bridge Server can parse and route it:

```json
{
  "npc": "kirk",
  "responses": [
    {
      "type": "thought",
      "text": "T'Karra handled that well. She's thinking three steps ahead."
    },
    {
      "type": "dialogue",
      "text": "Good work, Lieutenant. Now — what are our options?",
      "tone": "warm, approving"
    },
    {
      "type": "action",
      "description": "Kirk stands and moves to the viewscreen",
      "foundry_action": {
        "tool": "foundry_exec_js",
        "script": "game.canvas.tokens.get('tokenId').update({x: 100, y: 200})"
      }
    },
    {
      "type": "silent"
    }
  ]
}
```

Response types:
- **thought** — GM-only internal reasoning (italic, muted in dashboard)
- **dialogue** — in-character speech, displayed prominently with [Speak] [Edit] [Dismiss] buttons
- **action** — proposed Foundry action, queued for [Approve] [Modify] [Reject]
- **silent** — NPC processed the batch but has nothing to contribute

#### NPC Autonomy Model

**Suggest only — GM approves everything.** NPCs generate dialogue and propose actions. Nothing executes in Foundry until the GM approves. This can be relaxed later (tiered autonomy by NPC tier), but the MVP is fully GM-controlled.

#### NPC Access

Each NPC Zigi has:
- **Foundry MCP** (15 tools) — read their own actor data, scene state, combat state, journal entries
- **STA 2e rulebook** in markdown (via `--add-dir`)
- **sta-combat skill** — personal combat rules, action types, task rolls, momentum/threat
- **sta-starship-combat skill** — starship combat rules, department actions, power management
- **sta-dice skill** — dice rolling recipes via STARoll

### 2. NPC Session Pool

Extends the Zigi framework's `IgentSessionPool` pattern. During a game session, NPC Zigis stay warm in memory with a long idle timeout:

```python
IDLE_TIMEOUT_OPTIONS = {
    "game_session": 7200,   # 2 hours — active game session
    "between_scenes": 1800, # 30 min — NPC off-stage but may return
    "dormant": 0,           # Graceful shutdown, session_id preserved
}
```

- Every transcript batch delivery calls `touch()` → idle timer resets
- Active NPCs never time out during play (sub-second response times)
- Off-stage NPCs stay warm for 30 minutes in case they return
- At session end, all NPCs go dormant — session IDs preserved for `--resume` next time

This means **no cold starts during play**. NPC Zigis are always running and ready.

### 3. Transcription Pipeline

**Source**: Discord voice chat (players are in a Discord voice channel)

**Flow**:
```
Discord voice channel
  → Bot joins, captures per-user audio streams
  → Voice Activity Detection (VAD): silence = end of utterance
  → Whisper STT: speech → text with speaker label
  → HTTP POST to Bridge Server
  → Haiku Filter Zigi (persistent claude -p instance, haiku model)
    Tags each utterance: in_character / ooc / game_action / meta
    Identifies who it's directed at (if identifiable)
  → Tagged utterance queued
  → Batch delivered to all active NPC Zigis (every 5-10s or 3+ utterances)
```

**Utterance-level processing**: Buffer by speech pattern, not time. A player speaks, pauses (300-500ms silence via VAD), and that natural boundary marks one utterance. Utterances queue in order, preserving conversational flow.

**Routing strategy**: Feed everything to all present NPCs — they filter by context. Each NPC's role prompt instructs them when to respond and when to stay silent. This mirrors how real people work at a table — you hear everything, you respond to what's relevant.

The Haiku pre-filter tags help NPCs skip obvious noise (mic checks, laughter, rules lookups) but NPCs still see the full stream for context.

**Estimated latency**:
```
Player finishes speaking
  → ~500ms VAD silence detection
  → ~1-2s Whisper transcription
  → ~200-500ms Haiku classification
  → Queued for NPC batch delivery
  → ~1-3s NPC processes batch (warm instance)
Total: ~3-6 seconds from speech to NPC response (warm)
```

### 4. Foundry Watcher

The Bridge Server polls Foundry state via MCP at regular intervals:

| Poll | Interval | MCP Call | Detects |
|------|----------|----------|---------|
| Active scene | 3-5s | `foundry_exec_js: return game.scenes.active` | Scene changes |
| Scene tokens | 3-5s | `foundry_exec_js: return game.scenes.active.tokens.map(...)` | New actors dragged onto scene |
| Combat state | 2s (combat only) | `foundry_combats` | Combat start/end, turn changes |

**On scene change**:
1. Read new scene's token list
2. Cross-reference with NPC database
3. Activate NPCs present on the new scene (resurrect or create)
4. Deactivate NPCs no longer on stage (keep warm for 30 min)
5. Update each active NPC's `scene-context.md`

**On new token detected**:
1. Check if the actor ID matches an NPC in the database
2. If yes, activate the NPC Zigi
3. If no, ignore (it's a PC or unregistered NPC)

**On combat start**:
1. Identify NPC combatants
2. Send combat briefing to each NPC Zigi (combat state, available actions, STA 2e rules)
3. NPCs begin pre-computing their actions while players take turns
4. Dashboard combat panel appears

### 5. Combat System

STA 2e uses **popcorn initiative** — one actor goes, then chooses who goes next (or spends 2 Momentum for a specific choice). This simplifies the design: the GM always decides when an NPC acts.

**Combat flow**:
```
Players take turns → NPC Zigis observe via transcript + combat state updates
                   → NPCs pre-compute their actions in the background
                   → Dashboard shows pending NPC actions:
                     "Kirk wants to: Rally the crew (Presence+Command)"
                     "Kor wants to: Fire disruptors (Daring+Security)"

GM clicks [Act] on Kor → Reviews proposed action → [Approve] / [Modify] / [Reject]
  → Approved action executes in Foundry (dice roll via STARoll, damage, etc.)
```

NPCs make tactical decisions through the lens of their personality. Commander Kor doesn't just "attack with disruptors" — he taunts Kirk first, then fires, because that's what Klingons do. A retreating ship sends a final transmission before disengaging.

**Starship combat**: A ship Zigi represents the entire bridge crew. It proposes actions for each department (Helm, Tactical, Engineering, Science) on its turn. The GM approves the whole turn or modifies individual department actions.

**Threat/Momentum**: Tracked in the dashboard. NPC Zigis can request Threat spends ("Spend 2 Threat to add bonus dice") but the GM approves via the dashboard.

**Required skills** (new, to be written):
- `sta-combat` — STA 2e personal combat: action types, minor/major actions, task rolls, momentum spends, damage, cover, injuries
- `sta-starship-combat` — STA 2e starship combat: department actions, power management, shields, breaches, attack patterns, scale

### 6. GM Dashboard

Single-page React app running on localhost. Dark theme (alongside Foundry's dark UI).

```
┌─────────────────────────────────────────────────────────────────────┐
│  THE BRIDGE — Session 2: "Into the Dark"                           │
│  Scene: USS Enterprise Bridge    Active NPCs: Kirk, Chen           │
├──────────────────────────────┬──────────────────────────────────────┤
│                              │                                      │
│  LIVE TRANSCRIPT             │  NPC PANEL                          │
│                              │                                      │
│  [Hannah/T'Karra] IC         │  ┌─ KIRK (Major) ─────────────┐    │
│  "Commander, state your      │  │ thought: She's handling     │    │
│   intentions."               │  │   this well.               │    │
│                              │  │                             │    │
│  [Cam/Thon] ACTION           │  │ dialogue: "Good work,      │    │
│  "Steps forward, hand on     │  │   Lieutenant. What are     │    │
│   phaser"                    │  │   our options?"             │    │
│                              │  │      [Speak] [Edit] [X]    │    │
│  [Fred/Brex] OOC             │  │                             │    │
│  "wait my mic was off"       │  │ action: Stands, moves to   │    │
│                              │  │   viewscreen               │    │
│  [Keith/Malevolant] ACTION   │  │   [Approve] [Modify] [X]   │    │
│  "Scanning the vessel"       │  └─────────────────────────────┘    │
│                              │                                      │
│                              │  ┌─ KOR (Major) ──────────────┐    │
│                              │  │ thought: The Andorian is    │    │
│                              │  │   eager. Good. Eager        │    │
│                              │  │   warriors make mistakes.   │    │
│                              │  │                             │    │
│                              │  │ dialogue: "I am Kor, son   │    │
│                              │  │   of Rynar. My intentions   │    │
│                              │  │   are my own, Vulcan."      │    │
│                              │  │      [Speak] [Edit] [X]    │    │
│                              │  └─────────────────────────────┘    │
│                              │                                      │
├──────────────────────────────┤  ┌─ CHEN (Minor) ─────────────┐    │
│  COMBAT (when active)        │  │ [Silent — listening]        │    │
│                              │  └─────────────────────────────┘    │
│  Threat: [4] [+] [-]        │                                      │
│  Momentum: [2]              │──────────────────────────────────────│
│                              │  ACTION QUEUE                       │
│  Kirk ──── 1/1 [Act]        │                                      │
│  Kor ───── 1/1 [Act]        │  Pending: Kirk move to viewscreen   │
│  Koloth ── 1/1 [Act]        │        [Approve] [Modify] [Reject]  │
│                              │                                      │
│                              │  Pending: Kor hail Enterprise       │
│                              │        [Approve] [Modify] [Reject]  │
└──────────────────────────────┴──────────────────────────────────────┘
```

**Panels**:
- **Live Transcript** (left) — tagged utterance stream, OOC/META dimmed, scrolls automatically
- **NPC Panel** (right) — one card per active NPC showing thoughts, dialogue, actions
- **Combat Panel** (bottom-left, combat only) — combatants, action counters, Threat/Momentum
- **Action Queue** (bottom-right) — all pending NPC actions awaiting approval

**Scene status**: Driven entirely by Foundry active scene. When the scene changes in Foundry, the dashboard updates automatically. [+ Add NPC manually] button for NPCs not on the scene (off-screen comms, etc.).

**[Speak] button**: Could trigger ElevenLabs TTS via the existing foundry-audio skill — the NPC's voice line is generated and played through Foundry. Future enhancement.

**Tech stack**: React + Tailwind, WebSocket client, localhost:3000.

### 7. Bridge Server

Python/FastAPI process running on localhost. Central nervous system of the whole operation.

**Responsibilities**:
1. **NPC Session Pool** — create/resurrect/dormant NPC Zigis, manage idle timeouts
2. **Foundry Watcher** — poll scene/tokens/combat state via MCP
3. **Transcription Pipeline** — receive utterances from Discord bot, route through Haiku filter, batch and deliver to NPCs
4. **Action Queue** — buffer NPC-proposed Foundry actions, wait for GM approval, execute via MCP
5. **WebSocket Hub** — push NPC responses + transcript + scene/combat state to dashboard, receive GM commands
6. **Session Recorder** — accumulate enriched transcript for post-session narrative generation

**Event loop**:
```
Every 3-5s:  Poll Foundry scene state → detect changes → activate/deactivate NPCs
Every 2s:    Poll Foundry combat state (combat only) → update dashboard
On utterance: Filter → queue → batch deliver to active NPCs → collect responses → push to dashboard
On approval:  Execute Foundry action via MCP → confirm to dashboard
On [Act]:     Send combat state to NPC → NPC proposes action → queue for approval
```

**Reuses from Zigi framework**:
| Component | Source | Adaptation |
|-----------|--------|------------|
| `IgentSession` | `igent_session.py` | NPC-specific message formatting |
| `IgentSessionPool` | `igent_session_pool.py` | Extended idle timeouts for game sessions |
| `IgentStateManager` | `igent_state_manager.py` | NPC schema (tier, foundry_actor_id, scenes) |
| `claude_summarizer.py` | Session ID capture | Works as-is |
| `igent_workspace_manager.py` | Workspace creation | NPC file templates |
| FastAPI + WebSocket | `app.py` | Upgrade SSE to full WebSocket |
| Job queue | `job_queue/` | NPC activation/deactivation as jobs |

### 8. NPC Creation Flow

NPCs already exist as Foundry actors (created during session prep via `lazy-session-prep`). The Bridge registers them and pulls their data:

```
1. Dashboard: [+ Register NPC] → dropdown of Foundry actors (via foundry_list)

2. Bridge Server pulls actor data from Foundry:
   - foundry_get type: "Actor" id: "{actorId}"
   - Extracts: name, species, values, focuses, talents, traits, rank
   - Searches linked journals for backstory/adventure notes

3. Auto-generates workspace files:
   - role.md ← from actor data + journals (name, species, voice, personality)
   - motivations.md ← from values + adventure design notes
   - relationships.md ← seeded from adventure notes or empty
   - response-rules.md ← copied from NPC template (starfleet/klingon/civilian/starship)
   - memory.md ← empty (first session)

4. NPC database entry:
   { id, name, foundry_actor_id, session_id: null, workspace, tier, state: "new" }

5. GM enriches if desired:
   - Add voice/personality notes
   - Add secret motivations
   - Add relationship details
   - Or leave as-is — Foundry data is often enough for minor NPCs
```

### 9. Session Recorder + Narrative Pipeline

During the session, the Bridge Server records an enriched transcript combining all data streams:

```markdown
## Scene: USS Enterprise Bridge
**Active NPCs:** Kirk, Chen
**Timestamp:** 2026-03-15 19:30:00

[19:30:12] Hannah (T'Karra) [IC]: "Commander, state your intentions."
[19:30:17] Cam (Thon) [ACTION]: Steps forward, hand on phaser.
[19:30:24] **NPC Kirk** [DIALOGUE]: "Easy, Lieutenant. Let them answer."
[19:30:32] Fred (Brex) [OOC]: wait can someone hear me?
[19:30:41] Hannah (T'Karra) [IC]: "Commander, I asked you a question."
[19:30:45] **NPC Kirk** [THOUGHT]: She's right to press. But if these are Klingons, pushing too hard gets people killed.

## Scene Change: Klingon Bridge (viewscreen)
**Active NPCs:** Kor, Koloth

[19:31:10] **NPC Kor** [DIALOGUE]: "I am Kor, son of Rynar. My intentions are my own, Vulcan."
[19:31:15] Keith (Malevolant) [ACTION]: Running tactical scan of the Klingon vessel.
[19:31:20] DICE: Malevolant — Reason+Science, Difficulty 1 — SUCCESS (2 successes)
[19:31:25] **NPC Kor** [THOUGHT]: Their sensor officer is good. She'll see through our cloak modifications.
```

At session end, this is saved as `sessions/sessionXX-transcript.md` — a richer transcript than raw Discord audio because it includes:
- Speaker labels + character names
- IC/OOC tagging (already classified by Haiku filter)
- NPC dialogue interleaved at the correct moments
- NPC thoughts (available for "director's commentary" or Writer enrichment)
- Game actions and dice results in context
- Scene boundaries with active NPC lists

The existing `session-narrative` skill then fires (manually or automatically):
- **Director** reads the enriched transcript — easier scene breakdown because scenes are already marked
- **Writers** have NPC dialogue already written in-character by the NPC Zigis — they add interiority, sensory detail, and narrative structure
- **Editor** assembles and polishes
- **Publisher** pushes to Foundry journal + Google Drive

---

## NPC Database Schema (MongoDB)

```javascript
// Collection: npcs
{
  _id: ObjectId,
  id: "kirk",                              // Unique NPC identifier
  name: "Captain James T. Kirk",
  foundry_actor_id: "abc123",             // Links to Foundry actor
  session_id: "uuid-of-cc-session",       // For --resume (null if never activated)
  workspace: "~/.claude/igents/npc-kirk/",
  tier: "major",                           // minor | notable | major
  template: "starfleet-officer",           // Role template used
  state: "dormant",                        // new | active | dormant | retired
  scenes_present: ["bridge", "ready-room"],
  created_at: ISODate,
  last_active: ISODate,
  session_history: [                       // Which game sessions this NPC appeared in
    { session: 1, scenes: ["bridge"], dialogue_count: 12 },
    { session: 2, scenes: ["bridge", "brig"], dialogue_count: 8 }
  ]
}
```

## Session Lifecycle

```
BEFORE SESSION
  GM reviews NPC roster in dashboard
  Edits motivations/relationships if needed
  Starts Discord bot → joins voice channel
  Opens Foundry VTT

SESSION START (GM clicks [Start Session])
  Bridge Server:
    → Connects to Foundry MCP
    → Starts Foundry Watcher (polling every 3-5s)
    → Creates Haiku Filter Zigi (persistent, haiku model, ephemeral)
    → Reads active Foundry scene → activates on-stage NPC Zigis
    → Begins recording enriched transcript
    → Dashboard goes live

DURING SESSION
  Transcript flows in → tagged → batched → delivered to active NPCs
  NPCs respond with thoughts/dialogue/actions → pushed to dashboard
  GM approves/edits/rejects in dashboard → actions execute in Foundry
  Scene changes in Foundry → NPCs activate/deactivate automatically
  Combat starts → combat panel appears → NPCs pre-compute actions
  GM clicks [Act] → NPC action proposed → approved → executed in Foundry

SESSION END (GM clicks [End Session])
  Bridge Server:
    → All NPC Zigis go dormant (session_ids preserved in database)
    → Haiku Filter Zigi terminated
    → Foundry Watcher stops
    → Discord bot disconnects from voice
    → Enriched transcript saved to sessions/sessionXX-transcript.md
    → Each NPC's memory.md updated with session summary
    → (Optional) session-narrative skill triggered for chapter generation
```

## Project Structure

New repository: `the-bridge`

```
the-bridge/
├── bridge/                        # Bridge Server (Python/FastAPI)
│   ├── server.py                  # FastAPI + WebSocket + main event loop
│   ├── npc_manager.py             # NPC Zigi lifecycle (create/resurrect/dormant)
│   ├── npc_session_pool.py        # Extends IgentSessionPool for game sessions
│   ├── foundry_watcher.py         # Scene + combat polling via MCP
│   ├── transcript_router.py       # Haiku filter + utterance queue + batching
│   ├── action_queue.py            # Pending actions, approval flow
│   ├── session_recorder.py        # Enriched transcript accumulation
│   └── npc_database.py            # MongoDB collection for NPC state
│
├── discord_bot/                   # Discord transcription bot
│   ├── bot.py                     # Join voice channel, capture per-user audio
│   ├── transcriber.py             # Whisper STT + VAD (sentence-level)
│   └── config.py                  # Discord token, channel config
│
├── dashboard/                     # React frontend
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── TranscriptPanel.tsx
│   │   │   ├── NPCCard.tsx
│   │   │   ├── CombatPanel.tsx
│   │   │   ├── ActionQueue.tsx
│   │   │   └── SceneStatus.tsx
│   │   ├── hooks/
│   │   │   └── useWebSocket.ts
│   │   └── types.ts
│   └── package.json
│
├── npc_templates/                 # NPC role templates
│   ├── starfleet-officer/
│   │   ├── role.md
│   │   ├── response-rules.md
│   │   └── motivations.md
│   ├── klingon-warrior/
│   ├── civilian/
│   └── starship/                  # Ship bridge crew template
│
├── skills/                        # Claude Code skills (symlinked to NPCs)
│   ├── sta-combat/
│   │   └── SKILL.md               # STA 2e personal combat rules
│   ├── sta-starship-combat/
│   │   └── SKILL.md               # STA 2e starship combat rules
│   └── npc-response/
│       └── SKILL.md               # Response format, when to speak/stay silent
│
├── docs/plans/
├── pyproject.toml                 # Python deps
└── README.md
```

**Dependencies on sta-compendia** (existing, not duplicated):
- Foundry MCP server (15 tools, already deployed)
- `sta-dice` skill (dice rolling via STARoll)
- `session-narrative` skill (post-session chapter generation)
- `foundry-audio` skill (ElevenLabs TTS — future enhancement for [Speak] button)
- STA 2e rulebook in markdown (shared via `--add-dir`)

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| AI engine | Claude Code instances (`claude -p`) | Persistent sessions, MCP access, `--resume` for memory, proven by Zigi framework |
| NPC routing | Feed everything to all present NPCs | Simplest architecture, NPCs filter by context (like real people), Haiku pre-filter removes obvious noise |
| Autonomy | GM approves everything (MVP) | Safe default, can be relaxed to tiered autonomy later |
| Combat trigger | GM clicks [Act] in dashboard | Popcorn initiative = GM always chooses who goes next. NPCs pre-compute actions while waiting |
| Scene management | Foundry drives it | Poll active scene + tokens. Dashboard displays, doesn't control |
| Transcription | Discord → Whisper (utterance-level via VAD) → Haiku tag → queue | Sentence boundaries from natural speech pauses, not arbitrary time windows |
| NPC persistence | IgentSessionPool with 2-hour idle timeout | Warm instances = sub-second responses. `--resume` for cross-session memory |
| NPC creation | Pull from Foundry actor data | NPCs already exist in Foundry from session prep. Auto-generate role.md from actor values/focuses/talents |
| Post-session | Enriched transcript → session-narrative skill | Closed loop: NPC dialogue captured during play feeds into chapter generation |
| Dashboard | React + Tailwind, localhost | Lightweight, dark theme, WebSocket for real-time |
| Bridge Server | Python/FastAPI | Matches Zigi framework stack, reuses IgentSession/Pool/StateManager |
| Database | MongoDB | Already used by Zigi framework for igent state |

## Market Differentiation

| Existing Product | What It Does | What The Bridge Does Differently |
|-----------------|-------------|----------------------------------|
| RPGX AI Assistant | Chat with AI about your world | Autonomous NPC agents with persistent memory |
| PF2e AI Combat Assistant | Suggest optimal combat actions | Personality-driven tactical decisions ("Kor taunts, then fires") |
| Archivist AI | Transcribe + summarize sessions | Feed transcription into live NPC responses |
| Friends & Fables | AI replaces the GM | AI augments the GM — human stays in control |
| Inworld AI | AI NPCs for video games | AI NPCs for tabletop, connected to Foundry VTT |
| mookAI | Rule-based enemy automation | LLM-driven, personality-aware, narrative combat |

## Future Enhancements

- **[Speak] button → ElevenLabs TTS** — NPC dialogue played as audio through Foundry (per-NPC voices)
- **Tiered autonomy** — minor NPCs act freely, major NPCs need approval
- **Auto-combat triggers** — watch Foundry combat tracker instead of manual [Act] button
- **NPC-to-NPC interaction** — Zigis can address each other (Kor argues with Koloth)
- **Player-facing NPC chat** — selected NPC dialogue appears in Foundry chat (players interact directly)
- **Campaign memory graph** — MongoDB stores NPC relationship evolution across all sessions
- **Multi-campaign support** — different NPC rosters per campaign/adventure
