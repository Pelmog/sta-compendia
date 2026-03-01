# The Bridge — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build "The Bridge" — a real-time AI GM companion that runs persistent Claude Code NPC agents connected to Foundry VTT, with Discord voice transcription and a web dashboard for GM control.

**Architecture:** New Python/FastAPI backend (`the-bridge` repo) manages NPC Zigis (persistent `claude -p` instances) with an `IgentSessionPool` adapted from the `puppeteer-h10` Zigi framework. React dashboard communicates via WebSocket. Discord bot transcribes player audio via Whisper. Foundry MCP provides game state access.

**Tech Stack:** Python 3.12+, FastAPI, Motor (MongoDB), React 18, Tailwind CSS, TypeScript, WebSocket, discord.py, openai-whisper, Claude Code CLI (`claude -p`)

**Reference:** Design doc at `docs/plans/2026-03-01-the-bridge-design.md`

**Zigi framework reference:** `/Users/gordonmclennan/repos/puppeteer-h10/puppeteer_h10/` — specifically `igent_session.py`, `igent_session_pool.py`, `igent_state_manager.py`, `claude_summarizer.py`

---

## Milestone 1: Repository Foundation

### Task 1: Scaffold the-bridge repository

**Files:**
- Create: `~/repos/the-bridge/pyproject.toml`
- Create: `~/repos/the-bridge/bridge/__init__.py`
- Create: `~/repos/the-bridge/bridge/config.py`
- Create: `~/repos/the-bridge/dashboard/package.json`
- Create: `~/repos/the-bridge/.gitignore`
- Create: `~/repos/the-bridge/.env.example`
- Create: `~/repos/the-bridge/CLAUDE.md`

**Step 1: Create repo directory and initialize git**

```bash
mkdir -p ~/repos/the-bridge
cd ~/repos/the-bridge
git init
```

**Step 2: Create pyproject.toml**

```toml
[project]
name = "the-bridge"
version = "0.1.0"
description = "AI GM Companion — persistent NPC agents for Foundry VTT"
authors = [{ name = "Gordon McLennan", email = "pelmog@gmail.com" }]
readme = "README.md"
requires-python = ">=3.12,<4.0"
dependencies = [
    "fastapi>=0.115.5",
    "uvicorn>=0.32.0",
    "websockets>=12.0",
    "motor>=3.3.2",
    "pydantic>=2.11.0",
    "pydantic-settings>=2.9.0",
    "python-dotenv>=1.1.0",
]

[dependency-groups]
dev = [
    "pytest>=8.0.0",
    "pytest-asyncio>=0.23.0",
    "mongomock-motor>=0.0.36",
    "ruff>=0.11.0",
]
discord = [
    "discord.py[voice]>=2.3.0",
    "openai-whisper>=20231117",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["bridge"]

[tool.pytest.ini_options]
testpaths = ["tests"]
pythonpath = ["."]
asyncio_mode = "auto"

[tool.ruff]
target-version = "py312"
line-length = 120
fix = true
```

**Step 3: Create config.py with Pydantic Settings**

```python
# bridge/config.py
"""Bridge Server configuration via environment variables."""

from pydantic_settings import BaseSettings


class BridgeConfig(BaseSettings):
    """Configuration loaded from .env or environment."""

    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_database: str = "the_bridge"

    # NPC session pool
    npc_idle_timeout_game: int = 7200      # 2 hours during active session
    npc_idle_timeout_offstage: int = 1800  # 30 min for off-stage NPCs
    pool_cleanup_interval: int = 30        # Check expired sessions every 30s

    # Foundry watcher
    foundry_poll_interval: float = 4.0     # Scene/token poll interval (seconds)
    combat_poll_interval: float = 2.0      # Combat state poll interval (seconds)

    # Transcription
    transcript_batch_interval: float = 8.0  # Seconds between NPC batch deliveries
    transcript_batch_min_size: int = 3      # Min utterances before early delivery

    # WebSocket
    ws_host: str = "0.0.0.0"
    ws_port: int = 8000

    # NPC workspaces
    npc_workspace_root: str = "~/.claude/igents"

    # Claude Code
    claude_command: str = "claude"

    model_config = {"env_prefix": "BRIDGE_", "env_file": ".env"}
```

**Step 4: Create .env.example**

```
BRIDGE_MONGODB_URI=mongodb://localhost:27017
BRIDGE_MONGODB_DATABASE=the_bridge
BRIDGE_NPC_WORKSPACE_ROOT=~/.claude/igents
```

**Step 5: Create .gitignore**

```
__pycache__/
*.pyc
.env
.venv/
node_modules/
dist/
.ruff_cache/
.pytest_cache/
*.egg-info/
```

**Step 6: Create CLAUDE.md**

```markdown
# The Bridge — AI GM Companion

## What This Is
Real-time GM companion for Star Trek Adventures. Persistent Claude Code NPC agents
connected to Foundry VTT via MCP, with Discord voice transcription and a web dashboard.

## Project Structure
- `bridge/` — Python backend (FastAPI + WebSocket)
- `dashboard/` — React frontend (Vite + Tailwind)
- `discord_bot/` — Discord voice transcription bot
- `npc_templates/` — NPC role templates (starfleet, klingon, etc.)
- `skills/` — Claude Code skills for NPC combat behavior
- `tests/` — Python tests

## Key Dependencies
- Foundry MCP server (lives in sta-compendia repo, already deployed)
- MongoDB (local, same instance as Zigi framework)
- Claude Code CLI (`claude -p` for NPC instances)
- Discord bot token (for voice transcription)

## Running
```bash
# Backend
uv run uvicorn bridge.server:app --host 0.0.0.0 --port 8000

# Dashboard
cd dashboard && npm run dev

# Discord bot (separate process)
uv run python -m discord_bot.bot
```

## Architecture
See `docs/plans/2026-03-01-the-bridge-design.md` in sta-compendia repo.
```

**Step 7: Create directory structure and __init__.py files**

```bash
mkdir -p bridge tests dashboard/src discord_bot npc_templates skills docs/plans
touch bridge/__init__.py tests/__init__.py discord_bot/__init__.py
```

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold the-bridge repository"
```

---

### Task 2: Data models (Pydantic schemas)

**Files:**
- Create: `~/repos/the-bridge/bridge/models.py`
- Test: `~/repos/the-bridge/tests/test_models.py`

**Step 1: Write the test**

```python
# tests/test_models.py
"""Tests for Bridge data models."""

import pytest
from bridge.models import (
    NPC,
    NPCTier,
    NPCState,
    Utterance,
    UtteranceTag,
    NPCResponse,
    NPCResponseType,
    PendingAction,
    SceneState,
)


def test_npc_creation():
    npc = NPC(
        id="kirk",
        name="Captain James T. Kirk",
        foundry_actor_id="abc123",
        tier=NPCTier.MAJOR,
        template="starfleet-officer",
    )
    assert npc.id == "kirk"
    assert npc.state == NPCState.NEW
    assert npc.session_id is None
    assert npc.workspace == ""


def test_npc_workspace_path():
    npc = NPC(
        id="kirk",
        name="Captain James T. Kirk",
        foundry_actor_id="abc123",
        tier=NPCTier.MAJOR,
        template="starfleet-officer",
        workspace="/home/user/.claude/igents/npc-kirk",
    )
    assert "npc-kirk" in npc.workspace


def test_utterance_creation():
    utt = Utterance(
        speaker="Hannah",
        character="T'Karra",
        text="Commander, state your intentions.",
        tag=UtteranceTag.IN_CHARACTER,
    )
    assert utt.tag == UtteranceTag.IN_CHARACTER
    assert utt.directed_at is None


def test_utterance_with_direction():
    utt = Utterance(
        speaker="Hannah",
        character="T'Karra",
        text="Commander, state your intentions.",
        tag=UtteranceTag.IN_CHARACTER,
        directed_at="kor",
    )
    assert utt.directed_at == "kor"


def test_npc_response_dialogue():
    resp = NPCResponse(
        npc_id="kirk",
        type=NPCResponseType.DIALOGUE,
        text="Good work, Lieutenant.",
        tone="warm, approving",
    )
    assert resp.type == NPCResponseType.DIALOGUE
    assert resp.foundry_action is None


def test_npc_response_action():
    resp = NPCResponse(
        npc_id="kirk",
        type=NPCResponseType.ACTION,
        text="Stands and moves to viewscreen",
        foundry_action={"tool": "foundry_exec_js", "script": "// move token"},
    )
    assert resp.foundry_action is not None


def test_npc_response_silent():
    resp = NPCResponse(
        npc_id="chen",
        type=NPCResponseType.SILENT,
    )
    assert resp.text is None


def test_pending_action():
    action = PendingAction(
        npc_id="kirk",
        description="Move to viewscreen",
        foundry_action={"tool": "foundry_exec_js", "script": "// move"},
    )
    assert action.status == "pending"
    assert action.action_id is not None


def test_scene_state():
    scene = SceneState(
        scene_id="scene123",
        scene_name="USS Enterprise Bridge",
        token_actor_ids=["abc123", "def456"],
    )
    assert len(scene.token_actor_ids) == 2
```

**Step 2: Run tests to verify they fail**

```bash
cd ~/repos/the-bridge
uv run pytest tests/test_models.py -v
```
Expected: FAIL (module not found)

**Step 3: Write the models**

```python
# bridge/models.py
"""Data models for The Bridge."""

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional
from uuid import uuid4

from pydantic import BaseModel, Field


class NPCTier(str, Enum):
    MINOR = "minor"
    NOTABLE = "notable"
    MAJOR = "major"


class NPCState(str, Enum):
    NEW = "new"
    ACTIVE = "active"
    DORMANT = "dormant"
    RETIRED = "retired"


class NPC(BaseModel):
    """An NPC registered in The Bridge."""

    id: str
    name: str
    foundry_actor_id: str
    session_id: Optional[str] = None
    workspace: str = ""
    tier: NPCTier = NPCTier.MINOR
    template: str = "starfleet-officer"
    state: NPCState = NPCState.NEW
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_active: Optional[datetime] = None
    session_history: list[dict[str, Any]] = Field(default_factory=list)


class UtteranceTag(str, Enum):
    IN_CHARACTER = "in_character"
    OOC = "ooc"
    GAME_ACTION = "game_action"
    META = "meta"


class Utterance(BaseModel):
    """A single tagged utterance from the transcription pipeline."""

    speaker: str                          # Discord username
    character: Optional[str] = None       # PC character name (if mapped)
    text: str
    tag: UtteranceTag = UtteranceTag.IN_CHARACTER
    directed_at: Optional[str] = None     # NPC id if identifiable
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class NPCResponseType(str, Enum):
    THOUGHT = "thought"
    DIALOGUE = "dialogue"
    ACTION = "action"
    SILENT = "silent"


class NPCResponse(BaseModel):
    """A response from an NPC Zigi."""

    npc_id: str
    type: NPCResponseType
    text: Optional[str] = None
    tone: Optional[str] = None            # For dialogue: "warm", "threatening", etc.
    foundry_action: Optional[dict[str, Any]] = None  # For action type
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PendingAction(BaseModel):
    """An NPC-proposed action awaiting GM approval."""

    action_id: str = Field(default_factory=lambda: uuid4().hex[:12])
    npc_id: str
    description: str
    foundry_action: dict[str, Any]
    status: str = "pending"  # pending | approved | rejected | modified
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SceneState(BaseModel):
    """Current Foundry scene state."""

    scene_id: str
    scene_name: str
    token_actor_ids: list[str] = Field(default_factory=list)
    combat_active: bool = False
    combatants: list[dict[str, Any]] = Field(default_factory=list)
    threat: int = 0
    momentum: int = 0
```

**Step 4: Run tests to verify they pass**

```bash
uv run pytest tests/test_models.py -v
```
Expected: All PASS

**Step 5: Commit**

```bash
git add bridge/models.py tests/test_models.py
git commit -m "feat: add data models for NPCs, utterances, responses, actions"
```

---

### Task 3: NPC database (MongoDB CRUD)

**Files:**
- Create: `~/repos/the-bridge/bridge/npc_database.py`
- Test: `~/repos/the-bridge/tests/test_npc_database.py`

**Step 1: Write the test**

```python
# tests/test_npc_database.py
"""Tests for NPC database operations."""

import pytest
import pytest_asyncio
from mongomock_motor import AsyncMongoMockClient

from bridge.models import NPC, NPCState, NPCTier
from bridge.npc_database import NPCDatabase


@pytest_asyncio.fixture
async def db():
    client = AsyncMongoMockClient()
    database = client["test_bridge"]
    npc_db = NPCDatabase(database)
    await npc_db.ensure_indexes()
    return npc_db


@pytest.mark.asyncio
async def test_create_npc(db):
    npc = NPC(
        id="kirk",
        name="Captain James T. Kirk",
        foundry_actor_id="abc123",
        tier=NPCTier.MAJOR,
        template="starfleet-officer",
        workspace="/tmp/npc-kirk",
    )
    result = await db.create(npc)
    assert result is True


@pytest.mark.asyncio
async def test_get_npc(db):
    npc = NPC(id="kirk", name="Kirk", foundry_actor_id="abc123", tier=NPCTier.MAJOR)
    await db.create(npc)
    retrieved = await db.get("kirk")
    assert retrieved is not None
    assert retrieved.name == "Kirk"
    assert retrieved.tier == NPCTier.MAJOR


@pytest.mark.asyncio
async def test_get_nonexistent(db):
    result = await db.get("nobody")
    assert result is None


@pytest.mark.asyncio
async def test_list_all(db):
    await db.create(NPC(id="kirk", name="Kirk", foundry_actor_id="a1", tier=NPCTier.MAJOR))
    await db.create(NPC(id="chen", name="Chen", foundry_actor_id="a2", tier=NPCTier.MINOR))
    npcs = await db.list_all()
    assert len(npcs) == 2


@pytest.mark.asyncio
async def test_list_by_state(db):
    await db.create(NPC(id="kirk", name="Kirk", foundry_actor_id="a1", state=NPCState.ACTIVE))
    await db.create(NPC(id="chen", name="Chen", foundry_actor_id="a2", state=NPCState.DORMANT))
    active = await db.list_by_state(NPCState.ACTIVE)
    assert len(active) == 1
    assert active[0].id == "kirk"


@pytest.mark.asyncio
async def test_update_state(db):
    await db.create(NPC(id="kirk", name="Kirk", foundry_actor_id="a1"))
    await db.update_state("kirk", NPCState.ACTIVE)
    npc = await db.get("kirk")
    assert npc.state == NPCState.ACTIVE


@pytest.mark.asyncio
async def test_update_session_id(db):
    await db.create(NPC(id="kirk", name="Kirk", foundry_actor_id="a1"))
    await db.update_session_id("kirk", "session-uuid-123")
    npc = await db.get("kirk")
    assert npc.session_id == "session-uuid-123"


@pytest.mark.asyncio
async def test_find_by_actor_ids(db):
    await db.create(NPC(id="kirk", name="Kirk", foundry_actor_id="actor-1"))
    await db.create(NPC(id="chen", name="Chen", foundry_actor_id="actor-2"))
    await db.create(NPC(id="kor", name="Kor", foundry_actor_id="actor-3"))
    found = await db.find_by_actor_ids(["actor-1", "actor-3"])
    assert len(found) == 2
    ids = {n.id for n in found}
    assert ids == {"kirk", "kor"}


@pytest.mark.asyncio
async def test_delete_npc(db):
    await db.create(NPC(id="kirk", name="Kirk", foundry_actor_id="a1"))
    await db.delete("kirk")
    assert await db.get("kirk") is None
```

**Step 2: Run tests to verify they fail**

```bash
uv run pytest tests/test_npc_database.py -v
```
Expected: FAIL

**Step 3: Implement npc_database.py**

```python
# bridge/npc_database.py
"""NPC database — MongoDB CRUD for NPC state."""

from datetime import datetime, timezone
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

from bridge.models import NPC, NPCState


class NPCDatabase:
    """MongoDB-backed NPC storage."""

    def __init__(self, database: AsyncIOMotorDatabase):
        self._collection = database["npcs"]

    async def ensure_indexes(self) -> None:
        """Create indexes for common query patterns."""
        await self._collection.create_index("id", unique=True)
        await self._collection.create_index("foundry_actor_id")
        await self._collection.create_index("state")

    async def create(self, npc: NPC) -> bool:
        """Insert a new NPC. Returns True on success."""
        doc = npc.model_dump()
        await self._collection.insert_one(doc)
        return True

    async def get(self, npc_id: str) -> Optional[NPC]:
        """Get an NPC by its id."""
        doc = await self._collection.find_one({"id": npc_id})
        if doc is None:
            return None
        doc.pop("_id", None)
        return NPC(**doc)

    async def list_all(self) -> list[NPC]:
        """List all NPCs."""
        docs = await self._collection.find().to_list(length=1000)
        return [NPC(**{k: v for k, v in d.items() if k != "_id"}) for d in docs]

    async def list_by_state(self, state: NPCState) -> list[NPC]:
        """List NPCs filtered by state."""
        docs = await self._collection.find({"state": state.value}).to_list(length=1000)
        return [NPC(**{k: v for k, v in d.items() if k != "_id"}) for d in docs]

    async def update_state(self, npc_id: str, state: NPCState) -> None:
        """Update an NPC's state."""
        update: dict = {"state": state.value}
        if state == NPCState.ACTIVE:
            update["last_active"] = datetime.now(timezone.utc)
        await self._collection.update_one({"id": npc_id}, {"$set": update})

    async def update_session_id(self, npc_id: str, session_id: str) -> None:
        """Store the Claude Code session_id for resurrection."""
        await self._collection.update_one(
            {"id": npc_id}, {"$set": {"session_id": session_id}}
        )

    async def find_by_actor_ids(self, actor_ids: list[str]) -> list[NPC]:
        """Find NPCs whose foundry_actor_id is in the given list."""
        docs = await self._collection.find(
            {"foundry_actor_id": {"$in": actor_ids}}
        ).to_list(length=100)
        return [NPC(**{k: v for k, v in d.items() if k != "_id"}) for d in docs]

    async def delete(self, npc_id: str) -> None:
        """Delete an NPC."""
        await self._collection.delete_one({"id": npc_id})
```

**Step 4: Run tests**

```bash
uv run pytest tests/test_npc_database.py -v
```
Expected: All PASS

**Step 5: Commit**

```bash
git add bridge/npc_database.py tests/test_npc_database.py
git commit -m "feat: add NPC database with MongoDB CRUD operations"
```

---

## Milestone 2: NPC Lifecycle

### Task 4: NPC workspace manager

**Files:**
- Create: `~/repos/the-bridge/bridge/npc_workspace.py`
- Create: `~/repos/the-bridge/npc_templates/starfleet-officer/role.md`
- Create: `~/repos/the-bridge/npc_templates/starfleet-officer/response-rules.md`
- Create: `~/repos/the-bridge/npc_templates/starfleet-officer/motivations.md`
- Create: `~/repos/the-bridge/npc_templates/klingon-warrior/role.md`
- Create: `~/repos/the-bridge/npc_templates/klingon-warrior/response-rules.md`
- Create: `~/repos/the-bridge/npc_templates/klingon-warrior/motivations.md`
- Create: `~/repos/the-bridge/npc_templates/civilian/role.md`
- Create: `~/repos/the-bridge/npc_templates/civilian/response-rules.md`
- Create: `~/repos/the-bridge/npc_templates/starship/role.md`
- Create: `~/repos/the-bridge/npc_templates/starship/response-rules.md`
- Test: `~/repos/the-bridge/tests/test_npc_workspace.py`

Creates NPC workspace directories from templates + Foundry actor data. When an NPC is registered, this module:
1. Creates `~/.claude/igents/npc-{id}/`
2. Copies template files (response-rules.md, motivations.md base)
3. Generates `role.md` from Foundry actor data (name, species, values, focuses, talents)
4. Creates empty `memory.md`, `relationships.md`, `scene-context.md`

**Reference:** Zigi workspace manager at `/Users/gordonmclennan/repos/puppeteer-h10/puppeteer_h10/igent_workspace_manager.py`

The NPC templates should be markdown files with placeholder sections. The `response-rules.md` is the critical one — it defines the JSON output format, when to speak vs stay silent, and how to handle tagged transcript batches.

Write tests that verify workspace creation, file contents, and template copying. Use `tmp_path` fixture instead of real `~/.claude/igents/`.

**Commit message:** `feat: add NPC workspace manager with role templates`

---

### Task 5: NPC session pool (adapt from Zigi)

**Files:**
- Create: `~/repos/the-bridge/bridge/npc_session.py`
- Create: `~/repos/the-bridge/bridge/npc_session_pool.py`
- Test: `~/repos/the-bridge/tests/test_npc_session_pool.py`

Adapt `IgentSessionPool` from the Zigi framework for NPC-specific needs:

**Reference files to study:**
- `/Users/gordonmclennan/repos/puppeteer-h10/puppeteer_h10/igent_session.py` — core session (subprocess mgmt, streaming, shutdown)
- `/Users/gordonmclennan/repos/puppeteer-h10/puppeteer_h10/igent_session_pool.py` — pool with idle timeouts
- `/Users/gordonmclennan/repos/puppeteer-h10/puppeteer_h10/claude_summarizer.py` — `PersistentClaudeSession` (the actual `claude -p` subprocess)

`npc_session.py` wraps a Claude Code subprocess (`claude -p --output-format=stream-json --input-format=stream-json`). Key methods:
- `start(session_id: Optional[str] = None)` — launch subprocess, optionally with `--resume {session_id}`
- `send(message: str) -> str` — send JSONL message to stdin, read JSONL response from stdout
- `stop()` — terminate subprocess gracefully
- `session_id` property — extracted from stream-json output on first message

`npc_session_pool.py` manages multiple `NPCSession` instances with idle timeouts:
- `activate(npc_id: str, session_id: Optional[str], workspace: str, idle_timeout: int) -> NPCSession`
- `deactivate(npc_id: str)` — stop session, preserve session_id
- `send_to(npc_id: str, message: str) -> str` — send message + touch
- `get_active_ids() -> list[str]`
- Background cleanup loop (same pattern as Zigi's `_cleanup_loop`)

The Zigi framework's `PersistentClaudeSession` in `claude_summarizer.py` (lines 450+) shows the exact subprocess pattern — study that carefully. It uses `subprocess.Popen` with stdin/stdout pipes and JSONL format.

For testing: mock the `claude` subprocess (don't actually launch Claude Code in tests). Test pool lifecycle: activate, touch, expire, deactivate.

**Commit message:** `feat: add NPC session and session pool (adapted from Zigi framework)`

---

## Milestone 3: Foundry Integration

### Task 6: Foundry watcher

**Files:**
- Create: `~/repos/the-bridge/bridge/foundry_watcher.py`
- Test: `~/repos/the-bridge/tests/test_foundry_watcher.py`

Polls Foundry VTT via the Foundry MCP server for state changes. Runs as an async background task.

**Polling strategy:**
- Every `foundry_poll_interval` (4s): check active scene ID and scene token list
- Every `combat_poll_interval` (2s, only during combat): check combat state

**MCP interaction:** The watcher needs to call Foundry MCP tools. Since MCP is accessed through Claude Code (the NPC Zigis have it), the watcher itself should use a lightweight approach — either a dedicated "watcher" Claude Code instance, or direct socket.io to Foundry.

**Recommended approach for MVP:** Use a simple HTTP/socket.io client to Foundry directly (like `publish-chapter.mjs` does in sta-compendia). This avoids the overhead of a Claude Code instance just for polling. The watcher connects to Foundry's socket.io API, authenticates, and can emit `modifyDocument('get', 'Scene', {})` to read scene state.

**Alternative (simpler for first pass):** Shell out to `claude -p` with a one-shot prompt like "Return the active scene ID and token list as JSON" — but this is slow (~2-3s per poll). Better to go direct.

**Key state to track:**
```python
@dataclass
class FoundryState:
    scene_id: str
    scene_name: str
    token_actor_ids: list[str]
    combat_active: bool
    combatants: list[dict]  # [{actor_id, name, initiative, has_acted}]
```

**Events emitted (via callback):**
- `on_scene_change(old_scene_id, new_scene_id, new_token_actor_ids)`
- `on_token_added(actor_id)` — new token dragged onto scene
- `on_token_removed(actor_id)` — token removed from scene
- `on_combat_start(combatants)`
- `on_combat_end()`
- `on_combat_update(combatants)` — turn changes, action counters

For testing: mock the Foundry connection, test event detection logic.

**Commit message:** `feat: add Foundry watcher for scene and combat state polling`

---

## Milestone 4: Claude Code Skills

### Task 7: npc-response skill

**Files:**
- Create: `~/repos/the-bridge/skills/npc-response/SKILL.md`

This skill is injected into every NPC Zigi. It defines:
- The JSON response format (thought/dialogue/action/silent)
- When to speak vs stay silent
- How to process tagged transcript batches
- The SILENT option (explicit permission to say nothing)

```markdown
---
name: npc-response
description: Response format and behavior rules for NPC agents in The Bridge.
---

# NPC Response Protocol

You are an NPC in a live tabletop RPG session. You receive batches of tagged
transcript from the players and must respond in character.

## Input Format

You receive transcript batches like this:

[Hannah/T'Karra] [in_character]: "Commander, state your intentions."
[Cam/Thon] [game_action]: Steps forward, hand on phaser.
[Fred/Brex] [ooc]: wait my mic was off
[Keith/Malevolant] [game_action]: Scanning the vessel.

Tags: in_character, ooc, game_action, meta

## Output Format

You MUST respond with valid JSON. Nothing else — no markdown, no explanation:

{
  "npc": "your-npc-id",
  "responses": [
    {"type": "thought", "text": "Your internal reasoning (GM only)"},
    {"type": "dialogue", "text": "What you say out loud", "tone": "warm"},
    {"type": "action", "description": "What you physically do", "foundry_action": {"tool": "...", "script": "..."}},
    {"type": "silent"}
  ]
}

## Response Rules

1. **Focus on `in_character` and `game_action` entries.** Ignore `ooc` and `meta` unless they directly affect the scene.
2. **Only respond when your character would naturally respond.** If nobody addressed you and nothing affects your interests, respond with `{"type": "silent"}`.
3. **SILENT is the default.** You should be silent MORE than you speak. Real NPCs don't react to everything.
4. **Thoughts are cheap, dialogue is expensive.** Have thoughts often (they help the GM). Only speak dialogue when it matters.
5. **Never break character.** Never reference game mechanics, dice, or out-of-character information.
6. **Actions need Foundry commands.** If you propose an action, include the `foundry_action` with the MCP tool and script.
7. **One response per batch.** Don't generate multiple dialogue lines — pick the most important thing to say.
```

**Commit message:** `feat: add npc-response skill for NPC output format`

---

### Task 8: sta-combat skill

**Files:**
- Create: `~/repos/the-bridge/skills/sta-combat/SKILL.md`

Write a comprehensive STA 2e personal combat reference skill. This is injected into NPC Zigis during combat. Must cover:

- **Action economy**: 1 Minor + 1 Major action per turn
- **Minor actions**: Aim, Prepare, Draw Item, Drop Prone, Movement, Interact, Stand
- **Major actions**: Attack (melee/ranged), Create Advantage, Direct, First Aid, Guard, Pass, Rally, Sprint, Ready
- **Task rolls**: Attribute + Discipline, target number, Difficulty, focuses (crit on ≤ discipline if focused)
- **Momentum spends**: Create Opportunity (1), Obtain Information (1), Create Problem (2), Extra Action (2+)
- **Threat spends** (NPC): Complication (2), Reinforcements (2+), Environmental Change (2), Lethal Force (variable)
- **Damage**: Challenge dice (d6: 1=1, 2=2, 3-4=0, 5-6=1+effect), stress, injuries
- **Cover and terrain**: Light (+1 Difficulty to hit), Heavy (+2)
- **Popcorn initiative**: "You choose who goes next. Spend 2 Momentum to nominate a specific ally."

Reference the STA 2e rulebook for exact mechanics. Write in a style that an NPC agent can use to make tactical decisions. Include examples of how a Klingon warrior vs a Starfleet officer would think about combat.

**Commit message:** `feat: add sta-combat skill for STA 2e personal combat rules`

---

### Task 9: sta-starship-combat skill

**Files:**
- Create: `~/repos/the-bridge/skills/sta-starship-combat/SKILL.md`

Same approach as Task 8 but for starship-scale combat:

- **Turn structure**: Each department gets one action per round
- **Departments**: Command (Rally, Direct), Conn (Maneuver, Attack Pattern, Evasive), Security (Fire Weapon, Boarding), Engineering (Power Management, Damage Control), Science (Scan, Technobabble), Medicine (Triage)
- **Power management**: Route power between systems (weapons, shields, engines, sensors)
- **Shields**: Hit location (d6 for facing), shield values per facing, breach threshold
- **Breaches**: Severity 1-5, escalation
- **Scale**: Ship scale affects damage dice and difficulty
- **NPC ship crew**: How a bridge crew NPC coordinates department actions

Include tactical personalities: a Klingon Bird-of-Prey decloaks for alpha strike, a Romulan Warbird stays at range, a Federation ship tries to disable not destroy.

**Commit message:** `feat: add sta-starship-combat skill for starship combat rules`

---

## Milestone 5: Transcription Pipeline

### Task 10: Transcript router (Haiku filter + batching)

**Files:**
- Create: `~/repos/the-bridge/bridge/transcript_router.py`
- Test: `~/repos/the-bridge/tests/test_transcript_router.py`

The transcript router:
1. Receives raw utterances (speaker + text) from the Discord bot
2. Sends each to the Haiku Filter Zigi for tagging (IC/OOC/ACTION/META + direction)
3. Queues tagged utterances
4. Delivers batches to all active NPC Zigis on a timer or count threshold

**Haiku Filter Zigi**: A persistent `claude -p` instance running haiku model. Receives one utterance, returns a tag. System prompt:

```
You are a transcript classifier for a Star Trek RPG session.
For each utterance, respond with ONLY a JSON object:
{"tag": "in_character|ooc|game_action|meta", "directed_at": "npc-id or null"}

Rules:
- in_character: Player speaking as their character
- game_action: Player declaring what their character does
- ooc: Out-of-character chatter, jokes, real-world talk
- meta: Rules discussion, audio issues, Foundry UI talk
```

**Batching logic**:
- Buffer utterances in a queue
- Deliver to NPCs when: (a) queue reaches `transcript_batch_min_size` (3), OR (b) `transcript_batch_interval` (8s) elapsed since last delivery
- Format batch as readable text for NPC consumption (not raw JSON)

For testing: mock the Haiku Zigi, test batching logic (time-based, count-based, formatting).

**Commit message:** `feat: add transcript router with Haiku filter and utterance batching`

---

### Task 11: Discord transcription bot

**Files:**
- Create: `~/repos/the-bridge/discord_bot/bot.py`
- Create: `~/repos/the-bridge/discord_bot/transcriber.py`
- Create: `~/repos/the-bridge/discord_bot/config.py`

**NOTE:** This task requires `discord.py[voice]` and `openai-whisper`. Install with:
```bash
uv sync --group discord
```

**config.py**: Discord bot token, voice channel ID, Bridge Server URL (for posting utterances).

**transcriber.py**: Wraps Whisper for utterance-level STT:
- Receive audio buffer (per-user PCM from Discord)
- VAD: detect end of speech (300-500ms silence)
- Transcribe with Whisper (local, `base` or `small` model)
- Return `{speaker, text, timestamp}`

**bot.py**: Discord bot that:
- Joins a voice channel on command (`!join`)
- Captures per-user audio via `discord.VoiceClient.listen()`
- Routes audio to transcriber
- POSTs completed utterances to Bridge Server: `POST http://localhost:8000/api/utterance`

**Important**: discord.py's voice receive is experimental. Check the latest discord.py docs for the receive API. If voice receive isn't stable, an alternative is using a Discord bot that captures audio via `ffmpeg` and pipes it to Whisper.

For testing: this is hard to unit test (real Discord + audio). Write a manual test script that posts mock utterances to the Bridge Server's `/api/utterance` endpoint for development without Discord.

Create `~/repos/the-bridge/scripts/mock_utterances.py`:
```python
"""Post mock utterances to the Bridge Server for testing without Discord."""
import httpx, asyncio, time

UTTERANCES = [
    ("Hannah", "T'Karra", "Commander, state your intentions."),
    ("Cam", "Thon", "Thon steps forward, hand on phaser."),
    ("Fred", "Brex", "wait can someone hear me? my mic was off"),
    ("Hannah", "T'Karra", "Commander, I asked you a question."),
    ("Keith", "Malevolant", "I'm scanning the Klingon vessel."),
]

async def main():
    async with httpx.AsyncClient() as client:
        for speaker, character, text in UTTERANCES:
            await client.post("http://localhost:8000/api/utterance", json={
                "speaker": speaker, "character": character, "text": text,
            })
            print(f"[{speaker}/{character}]: {text}")
            time.sleep(2)

asyncio.run(main())
```

**Commit message:** `feat: add Discord transcription bot with Whisper STT`

---

## Milestone 6: Bridge Server Core

### Task 12: Action queue

**Files:**
- Create: `~/repos/the-bridge/bridge/action_queue.py`
- Test: `~/repos/the-bridge/tests/test_action_queue.py`

Simple in-memory queue of `PendingAction` objects:
- `add(action: PendingAction)` — add to queue
- `list_pending() -> list[PendingAction]` — get all pending
- `approve(action_id: str) -> PendingAction` — mark approved, return for execution
- `reject(action_id: str)` — mark rejected
- `modify(action_id: str, new_action: dict)` — update action, mark approved

When an action is approved, the Bridge Server executes it via Foundry MCP (or direct socket.io). The action queue doesn't execute — it just tracks state.

**Commit message:** `feat: add action queue for NPC Foundry action approval`

---

### Task 13: Session recorder

**Files:**
- Create: `~/repos/the-bridge/bridge/session_recorder.py`
- Test: `~/repos/the-bridge/tests/test_session_recorder.py`

Accumulates the enriched transcript during a session:
- `record_utterance(utterance: Utterance)` — add tagged player utterance
- `record_npc_response(response: NPCResponse)` — add NPC dialogue/thought/action
- `record_dice_roll(description: str)` — add game event
- `record_scene_change(scene_name: str, active_npcs: list[str])` — add scene boundary
- `save(path: str)` — write the enriched transcript to markdown file

Output format matches what the session-narrative Director expects:

```markdown
## Scene: USS Enterprise Bridge
**Active NPCs:** Kirk, Chen
**Timestamp:** 2026-03-15 19:30:00

[19:30:12] Hannah (T'Karra) [IC]: "Commander, state your intentions."
[19:30:17] **NPC Kirk** [DIALOGUE]: "Easy, Lieutenant. Let them answer."
[19:30:32] Fred (Brex) [OOC]: wait can someone hear me?
```

**Commit message:** `feat: add session recorder for enriched transcript capture`

---

### Task 14: Bridge Server (FastAPI + WebSocket + event loop)

**Files:**
- Create: `~/repos/the-bridge/bridge/server.py`
- Create: `~/repos/the-bridge/bridge/websocket_hub.py`

This is the main integration point. Ties everything together:

**server.py** — FastAPI app:

```python
# Endpoints:
POST /api/utterance              # Discord bot posts utterances here
POST /api/session/start          # GM starts a session
POST /api/session/end            # GM ends a session
GET  /api/npcs                   # List all registered NPCs
POST /api/npcs/register          # Register NPC from Foundry actor
POST /api/npcs/{id}/activate     # Manually activate an NPC
POST /api/npcs/{id}/deactivate   # Manually deactivate an NPC
POST /api/actions/{id}/approve   # Approve a pending action
POST /api/actions/{id}/reject    # Reject a pending action
POST /api/actions/{id}/modify    # Modify and approve a pending action
POST /api/combat/{npc_id}/act    # Trigger NPC combat action
GET  /api/state                  # Current scene + combat state
WS   /ws                         # WebSocket for dashboard
```

**websocket_hub.py** — manages connected dashboard clients:
- `broadcast(event: dict)` — send to all connected dashboards
- Events: `npc_response`, `utterance`, `scene_change`, `combat_update`, `action_queued`, `action_resolved`

**Event loop (runs as background tasks on startup):**
1. Foundry Watcher — polls scene/combat, emits events
2. Transcript Router — processes utterance queue, delivers batches to NPCs
3. NPC Response Collector — reads NPC stdout, parses JSON, routes to WebSocket + action queue
4. Session Pool Cleanup — expires idle NPC sessions

**On startup:**
```python
@app.on_event("startup")
async def startup():
    app.state.config = BridgeConfig()
    app.state.db = NPCDatabase(motor_client[config.mongodb_database])
    app.state.pool = NPCSessionPool()
    app.state.watcher = FoundryWatcher(config)
    app.state.router = TranscriptRouter(config)
    app.state.actions = ActionQueue()
    app.state.recorder = SessionRecorder()
    app.state.ws_hub = WebSocketHub()
    # Start background loops
    await app.state.pool.start_cleanup_loop()
```

This is a large task. Focus on getting the WebSocket working first (dashboard can connect, receives events), then wire up each subsystem incrementally.

**Commit message:** `feat: add Bridge Server with FastAPI, WebSocket hub, and event loop`

---

## Milestone 7: Dashboard

### Task 15: Dashboard scaffolding

**Files:**
- Create: `~/repos/the-bridge/dashboard/package.json`
- Create: `~/repos/the-bridge/dashboard/vite.config.ts`
- Create: `~/repos/the-bridge/dashboard/tailwind.config.js`
- Create: `~/repos/the-bridge/dashboard/tsconfig.json`
- Create: `~/repos/the-bridge/dashboard/index.html`
- Create: `~/repos/the-bridge/dashboard/src/main.tsx`
- Create: `~/repos/the-bridge/dashboard/src/App.tsx`
- Create: `~/repos/the-bridge/dashboard/src/types.ts`
- Create: `~/repos/the-bridge/dashboard/src/hooks/useWebSocket.ts`

Scaffold a Vite + React + TypeScript + Tailwind project with dark theme defaults.

```bash
cd ~/repos/the-bridge/dashboard
npm create vite@latest . -- --template react-ts
npm install tailwindcss @tailwindcss/vite
```

**types.ts** — TypeScript equivalents of the Python models (NPC, Utterance, NPCResponse, PendingAction, SceneState).

**useWebSocket.ts** — custom hook that:
- Connects to `ws://localhost:8000/ws`
- Reconnects on disconnect (with backoff)
- Parses incoming JSON events
- Provides `send(event)` for GM commands (approve, reject, act)
- Returns event stream for components to subscribe to

**App.tsx** — layout shell with the four-panel grid:
- Top bar: session title, scene status
- Left: TranscriptPanel
- Right: NPC Panel (list of NPCCards)
- Bottom-left: CombatPanel (hidden when no combat)
- Bottom-right: ActionQueue

Dark theme: `bg-gray-900 text-gray-100` base.

**Commit message:** `feat: scaffold React dashboard with Vite, Tailwind, and WebSocket hook`

---

### Task 16: Dashboard components

**Files:**
- Create: `~/repos/the-bridge/dashboard/src/components/TranscriptPanel.tsx`
- Create: `~/repos/the-bridge/dashboard/src/components/NPCCard.tsx`
- Create: `~/repos/the-bridge/dashboard/src/components/CombatPanel.tsx`
- Create: `~/repos/the-bridge/dashboard/src/components/ActionQueue.tsx`
- Create: `~/repos/the-bridge/dashboard/src/components/SceneStatus.tsx`

Build each component matching the dashboard wireframe from the design doc.

**TranscriptPanel**: Scrolling list of utterances. Color-code by tag: IC = white, OOC = gray/dimmed, ACTION = blue, META = gray/italic. Auto-scroll to bottom. Show speaker name + character name.

**NPCCard**: Card per active NPC showing:
- Header: NPC name + tier badge
- Thoughts: italic, muted text (most recent)
- Dialogue: prominent text with [Speak] [Edit] [Dismiss] buttons
- Actions: description with [Approve] [Modify] [Reject] buttons
- Silent state: subtle "Listening..." indicator
- Each button sends appropriate WebSocket command

**CombatPanel**: Only visible during combat. Shows:
- Threat counter with +/- buttons
- Momentum counter with +/- buttons
- Combatant list with action counters (1/1, 0/1) and [Act] button per NPC

**ActionQueue**: List of PendingActions with [Approve] [Modify] [Reject] buttons. Approved actions show checkmark, rejected show X.

**SceneStatus**: Shows current scene name, active NPC count, [+ Add NPC] button.

**Commit message:** `feat: add dashboard components (transcript, NPC cards, combat, actions)`

---

## Milestone 8: Integration

### Task 17: NPC manager (orchestration layer)

**Files:**
- Create: `~/repos/the-bridge/bridge/npc_manager.py`
- Test: `~/repos/the-bridge/tests/test_npc_manager.py`

The NPC Manager is the high-level orchestration layer that coordinates all subsystems for NPC lifecycle:

- `register_npc(foundry_actor_id: str, template: str, tier: NPCTier)` — pull Foundry data, create workspace, add to database
- `activate_npc(npc_id: str)` — create/resume Claude Code session in pool, update state
- `deactivate_npc(npc_id: str)` — release from pool, preserve session_id, update state
- `send_transcript_batch(npc_id: str, batch: list[Utterance])` — format + send to NPC, parse response
- `send_combat_briefing(npc_id: str, combat_state: dict)` — send combat state, get tactical proposal
- `handle_scene_change(token_actor_ids: list[str])` — activate/deactivate NPCs based on scene tokens
- `shutdown_all()` — gracefully shut down all active NPCs

This wires together: NPCDatabase + NPCWorkspace + NPCSessionPool + TranscriptRouter.

For testing: mock the session pool (don't launch real Claude Code instances). Test orchestration logic: register → activate → send batch → parse response → deactivate.

**Commit message:** `feat: add NPC manager orchestration layer`

---

### Task 18: End-to-end integration test

**Files:**
- Create: `~/repos/the-bridge/scripts/integration_test.py`

A manual integration test script that:
1. Starts the Bridge Server
2. Connects a WebSocket client (simulating the dashboard)
3. Registers a test NPC ("Kirk") with a mock Foundry actor
4. Activates Kirk
5. Posts mock utterances via `/api/utterance`
6. Verifies NPC responses appear on the WebSocket
7. Posts an action approval
8. Ends the session
9. Verifies enriched transcript was saved

This is NOT an automated test — it requires:
- MongoDB running locally
- Claude Code CLI installed
- Foundry MCP server accessible (or mocked)

Run with:
```bash
uv run python scripts/integration_test.py
```

Expected output: logs showing the full flow from utterance → NPC response → dashboard event.

**Commit message:** `feat: add end-to-end integration test script`

---

## Milestone 9: Polish

### Task 19: NPC creation from Foundry (dashboard flow)

**Files:**
- Modify: `~/repos/the-bridge/bridge/server.py` (add `/api/foundry/actors` endpoint)
- Modify: `~/repos/the-bridge/bridge/npc_manager.py` (add Foundry data pull)
- Create: `~/repos/the-bridge/dashboard/src/components/RegisterNPCModal.tsx`

Add the dashboard flow for registering NPCs:
1. Dashboard calls `GET /api/foundry/actors` → Bridge Server queries Foundry via MCP → returns actor list
2. GM selects actor, chooses template and tier
3. Dashboard calls `POST /api/npcs/register` with actor ID, template, tier
4. Bridge Server pulls full actor data from Foundry (name, species, values, focuses, talents, traits)
5. Auto-generates `role.md` from Foundry data
6. Returns the created NPC

The `RegisterNPCModal` component shows a dropdown of Foundry actors (filtered to exclude PCs), template selector, tier selector, and a preview of the auto-generated role.md.

**Commit message:** `feat: add NPC registration from Foundry actors in dashboard`

---

### Task 20: Session lifecycle (start/end flow)

**Files:**
- Modify: `~/repos/the-bridge/bridge/server.py` (flesh out session start/end)
- Create: `~/repos/the-bridge/dashboard/src/components/SessionControls.tsx`

Wire up the full session lifecycle:

**Start Session:**
1. GM clicks [Start Session] in dashboard
2. Bridge Server: start Foundry watcher, create Haiku filter Zigi, read active scene, activate NPCs
3. Dashboard: show "Session Active" indicator, enable transcript panel, show NPCs

**End Session:**
1. GM clicks [End Session]
2. Bridge Server: deactivate all NPCs (preserve session_ids), stop watcher, stop filter, save transcript
3. Each NPC's memory.md gets a session summary appended
4. Dashboard: show "Session Ended" indicator, offer "Generate Chapter" button

**Commit message:** `feat: add session start/end lifecycle with dashboard controls`

---

## Summary: Build Order

| # | Task | Depends On | Est. Complexity |
|---|------|-----------|----------------|
| 1 | Repo scaffold | — | Low |
| 2 | Data models | 1 | Low |
| 3 | NPC database | 2 | Low |
| 4 | NPC workspace + templates | 2 | Medium |
| 5 | NPC session pool | 2 | High (Zigi adaptation) |
| 6 | Foundry watcher | 2 | Medium |
| 7 | npc-response skill | — | Low (writing) |
| 8 | sta-combat skill | — | Medium (rules research) |
| 9 | sta-starship-combat skill | — | Medium (rules research) |
| 10 | Transcript router | 2, 5 | Medium |
| 11 | Discord bot | — | Medium |
| 12 | Action queue | 2 | Low |
| 13 | Session recorder | 2 | Low |
| 14 | Bridge Server | 3, 5, 6, 10, 12, 13 | High (integration) |
| 15 | Dashboard scaffold | — | Low |
| 16 | Dashboard components | 15 | Medium |
| 17 | NPC manager | 3, 4, 5 | High (orchestration) |
| 18 | Integration test | 14, 16, 17 | Medium |
| 19 | NPC creation from Foundry | 14, 16, 17 | Medium |
| 20 | Session lifecycle | 14, 16, 17 | Medium |

**Parallelizable:** Tasks 7-9 (skills) can be done in parallel with Tasks 3-6 (backend). Task 11 (Discord bot) is independent. Task 15-16 (dashboard) can start once Task 2 (models/types) is done.

**Critical path:** 1 → 2 → 3 → 5 → 14 → 17 → 18
