---
name: character-import
description: Import STA player characters into Foundry VTT. Use when the user wants to "import character", "create character", "character json", "bcholmes", "character sheet", "player character", "import actor", "character from file", "character from url", "build character", or provides a character spec to add to the Foundry world.
---

# STA Character Import

Import Star Trek Adventures player characters into a live Foundry VTT world via the Foundry MCP server.

**Requires**: Foundry MCP connection. GM browser session for `exec_js`.

## Input Detection

Determine the import mode from the user's input:

| Input | Mode | Reference |
|-------|------|-----------|
| Path to a `.json` file | JSON File Import | `references/json-cleanup.md` |
| `sta.bcholmes.org` URL | bcholmes URL Import | `references/bcholmes-mapping.md` |
| Plain text with attributes, disciplines, etc. | Manual Spec Import | `references/manual-spec-checklist.md` |

## Import Flow (all modes)

1. **Parse input** → extract or construct actor data (mode-specific, read the appropriate reference file)
2. **Duplicate check** → `foundry_list type: "Actor" fields: ["name", "type"]`, check name match
3. **If duplicate found** → warn user, ask: replace (delete + create) or create alongside
4. **Create actor** → `foundry_exec_js` with `Actor.create(data)` (includes embedded items)
5. **Report** → actor ID, name, item count

## Quick Start — JSON File Import

```js
// Read JSON, strip _id/_stats/ownership from actor and items, then:
const actor = await Actor.create(cleanedData);
```

See `references/json-cleanup.md` for the full cleanup recipe.

## Quick Start — bcholmes URL Import

The `s=` URL parameter contains base64-encoded zlib-compressed JSON with lifepath data (not final values). Two approaches:
1. **Recommended**: User exports Foundry VTT JSON from bcholmes.org, then use JSON File Import
2. **Direct**: Decode URL, extract metadata, ask user to confirm final attribute/discipline values

See `references/bcholmes-mapping.md` for decoding and field mapping.

## Quick Start — Manual Spec Import

Build actor data from plain text. Look up talents from compendium packs for official descriptions. Add default items (Unarmed Strike, species trait).

See `references/manual-spec-checklist.md` for the step-by-step checklist.

## Reference Files

- **references/json-cleanup.md** — Field stripping, type coercion, exec-js recipe
- **references/bcholmes-mapping.md** — URL decoding, lifepath format, Foundry field mapping
- **references/manual-spec-checklist.md** — Building actors from plain text specs
- **@foundry-mcp/references/sta-data-model.md** — Actor/item creation shapes and field paths
