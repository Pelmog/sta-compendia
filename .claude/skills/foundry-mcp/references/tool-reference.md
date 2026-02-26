# Foundry MCP — Tool Reference

All tools are invoked as `mcp__foundry__<tool_name>`.

## foundry_status

Check connection status and world info. No parameters.

```
foundry_status
→ { world, system, version, user, role }
```

## foundry_list

List world documents by type.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `type` | Yes | Document type: `Actor`, `Item`, `JournalEntry`, `RollTable`, `Scene`, `ChatMessage`, `Macro` |
| `fields` | No | Array of field names to include (e.g., `["name", "type", "img"]`) |

```
foundry_list  type: "Actor"  fields: ["name", "type", "img"]
→ [{ _id, name, type, img }, ...]
```

## foundry_get

Get a full document by ID.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `type` | Yes | Document type |
| `id` | Yes | Document ID |

```
foundry_get  type: "Actor"  id: "WW37bijK9ETtaNep"
→ { _id, name, type, system: {...}, items: [...], ... }
```

## foundry_create

Create a new document. Supports embedded items via `parent`.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `type` | Yes | Document type |
| `data` | Yes | Document data object |
| `parent` | No | Parent reference for embedded docs (e.g., `"Actor.WW37bijK9ETtaNep"`) |

```
# World-level actor
foundry_create  type: "Actor"  data: { name: "Kirk", type: "character", system: {...} }

# Embedded item on an actor
foundry_create  type: "Item"  data: { name: "Phaser", type: "characterweapon2e", system: {...} }  parent: "Actor.WW37bijK9ETtaNep"
```

## foundry_update

Update an existing document.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `type` | Yes | Document type |
| `id` | Yes | Document ID |
| `data` | Yes | Fields to update (dot-notation supported) |

```
foundry_update  type: "Actor"  id: "WW37bijK9ETtaNep"  data: { "system.stress.value": 5 }
```

## foundry_delete

Delete documents by IDs.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `type` | Yes | Document type |
| `ids` | Yes | JSON string of ID array: `"[\"id1\",\"id2\"]"` |

```
foundry_delete  type: "Item"  ids: "[\"abc123\",\"def456\"]"
```

## foundry_search

Search documents.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `type` | Yes | Document type |
| `query` | Yes | Search query string |

```
foundry_search  type: "Actor"  query: "Klingon"
```

## foundry_packs

List compendium packs. **Returns 0 results** due to getJoinData limitation.

**Workaround** — use exec-js:
```js
return game.packs.filter(p => p.metadata.packageName === "sta-compendia")
  .map(p => ({ id: p.collection, label: p.metadata.label, type: p.metadata.type }))
```

## foundry_pack_contents

Get contents of a compendium pack.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `pack` | Yes | Pack collection ID (e.g., `"sta-compendia.general-talents-core"`) |
| `type` | Yes | Document type in the pack: `Item`, `Actor`, `JournalEntry`, `RollTable`, `Scene` |

```
foundry_pack_contents  pack: "sta-compendia.focuses-core"  type: "Item"
→ [{ _id, name, type, system: {...} }, ...]
```

## foundry_exec_js

Execute JavaScript in the GM browser context. **Requires GM browser session.**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `script` | Yes | JavaScript to execute. Use `return` to send data back. |

```
foundry_exec_js  script: "return game.actors.contents.map(a => ({name: a.name, id: a.id}))"
```

The script runs in the Foundry browser tab with full `game.*` access. Must include a `return` statement to get data back.

## foundry_exec_macro

Execute a macro by UUID. **Requires GM browser session.**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `uuid` | Yes | Macro UUID |

## foundry_roll

Roll a dice formula and post to chat. **Requires GM browser session.**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `formula` | Yes | Dice formula (e.g., `"2d20"`, `"4d6"`) |
| `flavor` | No | Flavor text shown with the roll |

```
foundry_roll  formula: "2d20"  flavor: "Command + Daring task roll"
```

**Note**: For proper STA rolls with success counting, use `foundry_exec_js` with `STARoll` instead.

## foundry_combats

List and manage combat encounters. **Requires GM browser session.**

## foundry_files

Browse, upload, and download Foundry data files. **Requires GM browser session.**

## foundry_macros

List available macros. **Requires GM browser session.**
