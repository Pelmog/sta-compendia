# Character Import Skill Design

## Purpose

A Claude Code skill that imports Star Trek Adventures player characters into a live Foundry VTT world via the Foundry MCP server. Supports three input modes: JSON file import, bcholmes.org URL import, and manual plain-text spec construction.

## Skill Identity

- **Name**: `character-import`
- **Location**: `.claude/skills/character-import/`
- **Triggers**: "import character", "create character", "character json", "bcholmes", "character sheet", "player character", "import actor", "character from file", "character from url", "build character"

## Import Modes

### Mode 1: JSON File Import

Input: Path to a Foundry VTT actor export JSON file (e.g., `characters/T'Karra-foundry-vtt.json`).

Steps:
1. Read the JSON file
2. Strip stale fields: `_id`, `_stats`, `ownership` from actor and all embedded items
3. Coerce string attribute/discipline values to numbers (exports sometimes have `"10"` not `10`)
4. Check for duplicate actors by name in the world
5. Call `Actor.create(data)` via `foundry_exec_js`
6. Report created actor ID and item count

Foundry handles version migration (e.g., v10 → v13) automatically during `Actor.create()`.

### Mode 2: bcholmes.org URL Import

Input: A `sta.bcholmes.org/view?s=...` URL.

Steps:
1. Fetch the URL and extract character data from the page
2. Map bcholmes field names to Foundry STA system fields
3. Build Foundry actor data structure with embedded items
4. Same cleanup, duplicate check, and `Actor.create()` as Mode 1

### Mode 3: Manual Spec Import

Input: Plain-text character details (attributes, disciplines, talents, etc.).

Steps:
1. Parse the provided spec for character fields
2. Construct actor data using `foundry-mcp` skill's `sta-data-model.md` for field shapes
3. Look up talent descriptions from compendium packs via `foundry_pack_contents` when possible
4. Add standard default items: Unarmed Strike weapon, species trait item
5. Same duplicate check and `Actor.create()` path

### Shared: Duplicate Detection

Before creating any actor:
1. Query `foundry_list type: "Actor" fields: ["name", "type"]`
2. Check for name matches (case-insensitive)
3. If match found: warn user, ask whether to replace (delete + create) or create alongside
4. If no match: proceed with creation

## File Structure

```
.claude/skills/character-import/
  SKILL.md                          # ~80 lines: triggers, flowchart, mode summaries
  references/
    json-cleanup.md                 # Field stripping rules, string→number coercion, exec-js recipe
    bcholmes-mapping.md             # bcholmes.org page → Foundry field mapping
    manual-spec-checklist.md        # Checklist for constructing actor from plain text
```

## Dependencies

- `foundry-mcp` skill (for `sta-data-model.md` reference and MCP tool knowledge)
- `sta-dice` skill (referenced for roll-related items but not required for import)
- Foundry MCP server connection (required at import time)
- GM browser session (required for exec-js)

## Design Decisions

- **Approach B chosen**: Thin SKILL.md + reference files. Keeps context cost low, reuses existing foundry-mcp data model docs.
- **Import only**: No export support (can be added later).
- **Duplicate handling**: Warn and ask, not auto-replace or silent duplicate creation.
- **Version migration**: Delegated entirely to Foundry's `Actor.create()` — no manual migration logic needed.
- **Compendium lookups**: Mode 3 attempts to find official talent/focus descriptions from compendium packs to enrich manually-specified characters.
