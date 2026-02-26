---
name: foundry-mcp
description: Interact with a live Foundry VTT world via the Foundry MCP server (direct socket connection). Use when the user mentions "foundry mcp", "foundry vtt", "create actor", "list items", "compendium pack", "foundry search", "foundry combat", "foundry macro", "foundry files", "update actor", "delete item", or wants to query/modify world data.
---

# Foundry MCP Server

Direct socket connection to a live Foundry VTT world via 15 MCP tools (`mcp__foundry__*`).

## Quick Start — 5 Most Common Operations

```
# Check connection and world info
foundry_status

# List all actors with key fields
foundry_list  type: "Actor"  fields: ["name", "type", "img"]

# Get full actor document
foundry_get  type: "Actor"  id: "<ACTOR_ID>"

# Create a new character
foundry_create  type: "Actor"  data: { name: "...", type: "character", system: {...} }

# Run arbitrary JS (most powerful — full game.* API)
foundry_exec_js  script: "return game.actors.contents.map(a => a.name)"
```

## Tool Reference

| Tool | GM Browser? | Description |
|------|-------------|-------------|
| `foundry_status` | No | World info, connection status |
| `foundry_list` | No | List documents by type with optional field filter |
| `foundry_get` | No | Get full document by ID |
| `foundry_create` | No | Create document (supports `parent` for embedded items) |
| `foundry_update` | No | Update document fields |
| `foundry_delete` | No | Delete documents by IDs |
| `foundry_search` | No | Search documents by query |
| `foundry_packs` | No | List packs (returns 0 — use exec-js workaround) |
| `foundry_pack_contents` | No | Get compendium pack contents by pack ID + type |
| `foundry_exec_js` | **Yes** | Execute JS in browser context (full `game.*` access) |
| `foundry_exec_macro` | **Yes** | Execute a macro by UUID |
| `foundry_roll` | **Yes** | Roll dice formula, post to chat |
| `foundry_combats` | **Yes** | List/manage combat encounters |
| `foundry_files` | **Yes** | Browse/upload/download Foundry files |
| `foundry_macros` | **Yes** | List macros |

## Key Facts

- **GM browser session required** for `exec_js`, `exec_macro`, `roll`, `combats`, `files`, `macros` — the MCP bridge module runs in the browser
- **`foundry_packs` returns 0** due to getJoinData limitation — use exec-js instead:
  ```js
  return game.packs.filter(p => p.metadata.packageName === "sta-compendia")
    .map(p => ({ id: p.collection, label: p.metadata.label, type: p.metadata.type }))
  ```
- **Embedded items**: use `parent: "Actor.<id>"` in `foundry_create` for items on actors
- **Delete IDs format**: pass as JSON string `"[\"id1\",\"id2\"]"`
- **Document types**: `Actor`, `Item`, `JournalEntry`, `RollTable`, `Scene`, `ChatMessage`, `Macro`

## STA-Specific Pack IDs

Use with `foundry_pack_contents`:

| Pack ID | Type | Contents |
|---------|------|----------|
| `sta-compendia.general-talents-core` | Item | 25 general talents |
| `sta-compendia.discipline-talents-core` | Item | 29 discipline talents |
| `sta-compendia.species-talents-core` | Item | 17 species talents |
| `sta-compendia.starship-talents-core` | Item | 35 starship talents |
| `sta-compendia.roles-core` | Item | 10 role talents |
| `sta-compendia.focuses-core` | Item | 103 focuses |
| `sta-compendia.values-core` | Item | 55 values |
| `sta-compendia.personal-weapons-core` | Item | 20 weapons (1e) |
| `sta-compendia.personal-weapons-2e-core` | Item | 18 weapons (2e) |
| `sta-compendia.starship-weapons-core` | Item | 51 starship weapons (1e) |
| `sta-compendia.starship-weapons-2e-core` | Item | 15 starship weapons (2e) |
| `sta-compendia.personal-equipment-core` | Item | 30 equipment/armor |
| `sta-compendia.damage-core` | Item | 24 injuries |
| `sta-compendia.starfleet-starships-core` | Actor | 16 Starfleet ships |
| `sta-compendia.alien-starships-core` | Actor | 14 alien ships |
| `sta-compendia.npc-starship-crew-core` | Actor | 5 NPC crew templates |
| `sta-compendia.playable-species-core` | JournalEntry | 8 species journals |
| `sta-compendia.roll-tables-core` | RollTable | 8 lifepath tables |
| `sta-compendia.manual-tutorials-core` | JournalEntry | 1 module manual |
| `sta-compendia.default-maps` | Scene | 2 maps |

## Reference Files

For detailed information, read these files from this skill's directory:

- **references/tool-reference.md** — All 15 tools with parameters and examples
- **references/sta-data-model.md** — Actor/item types, field paths, creation shapes
- **references/exec-js-recipes.md** — Common exec-js patterns for world manipulation
