# Character Import Skill Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a Claude Code skill that imports STA player characters into Foundry VTT from JSON files, bcholmes.org URLs, or manual plain-text specs.

**Architecture:** Single skill with SKILL.md + 3 reference files. SKILL.md handles input detection and routing. Reference files document the cleanup transform (JSON), bcholmes URL decoding (URL), and manual construction checklist (spec). Uses `foundry_exec_js` with `Actor.create()` for all three modes. Reuses `foundry-mcp` skill's `sta-data-model.md` for field shapes.

**Tech Stack:** Claude Code skill (SKILL.md + references), Foundry MCP tools (`foundry_list`, `foundry_exec_js`, `foundry_delete`, `foundry_pack_contents`), WebFetch (bcholmes URL decoding)

---

### Task 1: Create SKILL.md with frontmatter and decision flowchart

**Files:**
- Create: `.claude/skills/character-import/SKILL.md`

**Step 1: Create the skill directory**

```bash
mkdir -p .claude/skills/character-import/references
```

**Step 2: Write SKILL.md**

```markdown
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

1. **Parse input** → extract or construct actor data (mode-specific)
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
```

**Step 3: Commit**

```bash
git add .claude/skills/character-import/SKILL.md
git commit -m "feat: add character-import skill with SKILL.md"
```

---

### Task 2: Create references/json-cleanup.md

**Files:**
- Create: `.claude/skills/character-import/references/json-cleanup.md`

**Step 1: Write json-cleanup.md**

The content should document:

1. **Fields to strip** from the top-level actor object: `_id`, `_stats`, `ownership`, `flags.exportSource`
2. **Fields to strip** from each item in the `items` array: `_id`, `_stats`, `ownership`
3. **Type coercion**: attribute/discipline `.value` fields may be strings (`"10"`) — coerce to numbers
4. **The complete exec-js recipe** for creating the actor:

```markdown
# JSON File Import — Cleanup & Import

## Reading the File

Use the Read tool to read the JSON file. Parse it as a Foundry VTT actor export.

## Fields to Strip

Remove these fields from the **top-level actor** before import:
- `_id` — Foundry regenerates on create
- `_stats` — Version metadata from the source world
- `ownership` — User IDs from the source world (won't match)
- `flags.exportSource` — Export metadata

Remove these fields from **each item** in the `items` array:
- `_id`
- `_stats`
- `ownership`

## Type Coercion

Foundry exports sometimes store numeric values as strings. Coerce these to numbers:

```js
// For each attribute in system.attributes:
for (const [key, attr] of Object.entries(data.system.attributes)) {
  if (typeof attr.value === 'string') attr.value = parseInt(attr.value, 10);
}
// Same for system.disciplines:
for (const [key, disc] of Object.entries(data.system.disciplines)) {
  if (typeof disc.value === 'string') disc.value = parseInt(disc.value, 10);
}
```

## Duplicate Check

Before creating, check for existing actors with the same name:

```
foundry_list  type: "Actor"  fields: ["name", "type", "_id"]
```

If a match is found, warn the user and ask whether to:
- **Replace**: delete the existing actor (`foundry_delete`), then create
- **Create alongside**: just create (will result in two actors with the same name)

## Import Recipe — exec-js

After cleanup, pass the full data (with embedded items) to `Actor.create()`:

```js
// data = the cleaned JSON object (with items array intact)
const actor = await Actor.create(data);
return {
  id: actor.id,
  name: actor.name,
  type: actor.type,
  itemCount: actor.items.size,
  items: actor.items.contents.map(i => ({ name: i.name, type: i.type }))
};
```

Foundry handles:
- Assigning new `_id` to actor and all items
- Setting `ownership` to the current GM user
- Data migration if the export is from an older Foundry version

## Constructing the exec-js Script

The cleaned JSON must be serialized inline in the exec-js script. Use `JSON.stringify()` on the cleaned data and embed it:

```js
const data = <PASTE_CLEANED_JSON_HERE>;
// Strip residual _id from items
if (data.items) data.items.forEach(i => { delete i._id; delete i._stats; delete i.ownership; });
delete data._id; delete data._stats; delete data.ownership;
const actor = await Actor.create(data);
return { id: actor.id, name: actor.name, itemCount: actor.items.size, items: actor.items.contents.map(i => ({ name: i.name, type: i.type })) };
```
```

**Step 2: Commit**

```bash
git add .claude/skills/character-import/references/json-cleanup.md
git commit -m "feat: add JSON cleanup reference for character-import skill"
```

---

### Task 3: Create references/bcholmes-mapping.md

**Files:**
- Create: `.claude/skills/character-import/references/bcholmes-mapping.md`

**Step 1: Write bcholmes-mapping.md**

The content should document:

1. **URL format**: `sta.bcholmes.org/view?s=<payload>` where payload is URL-safe base64 → zlib-compressed JSON
2. **Decoding**: `tr '_-' '/+'` → base64 decode → zlib decompress → JSON
3. **bcholmes JSON schema** with all fields documented (from the T'Karra example)
4. **Lifepath data vs final values**: the JSON stores creation *steps* not computed stats
5. **Recommended workflow**: export Foundry VTT JSON from bcholmes.org, then use JSON File Import
6. **Direct decode workflow**: decode URL, extract name/species/talents/focuses/values/traits, ask user for final attribute/discipline values
7. **Field mapping table**: bcholmes field → Foundry actor field

Key mappings from decoded bcholmes JSON:

```markdown
# bcholmes.org URL Import

## URL Format

`https://sta.bcholmes.org/view?s=<payload>`

The `s=` parameter is: URL-safe base64 → zlib-compressed → JSON

## Decoding

In a bash context:
```bash
echo '<payload>' | tr '_-' '/+' | base64 -d | python3 -c \
  "import sys,zlib,json; print(json.dumps(json.loads(zlib.decompress(sys.stdin.buffer.read())),indent=2))"
```

## bcholmes JSON Schema

The decoded JSON stores **lifepath creation steps**, NOT final computed values.

| Field | Type | Example | Maps to |
|-------|------|---------|---------|
| `name` | string | `"T'Karra"` | `name` |
| `pronouns` | string | `"she/her"` | `system.pronouns` |
| `species.primary` | string | `"Vulcan"` | `system.species` |
| `era` | string | `"OriginalSeries"` | (metadata only) |
| `type` | string | `"AmbassadorDiplomat"` | `system.careerpath` |
| `role.id` | string | `"PoliticalLiaison"` | `system.characterrole` |
| `assignedShip` | string | `"USS Enterprise"` | `system.assignment` |
| `environment.id` | string | `"Vulcan23rd"` | `system.environment` → "Vulcan" |
| `upbringing.id` | string | `"ScienceAndTechnology"` | `system.upbringing` |
| `career.length` | string | `"Young"` | `system.experience` → "Novice" |
| `age` | string | `"Adult"` | (metadata only) |
| `traits` | array | `["Sensitive"]` | Additional traits beyond species |
| `pastime` | array | `["3d Chess"]` | `system.pastimes` |

### Extracting Items

| bcholmes source | Item type | Foundry type |
|-----------------|-----------|--------------|
| `environment.value` | Value | `value` |
| `training.value` | Value | `value` |
| `career.value` | Value | `value` |
| `finish.value` | Value | `value` |
| `upbringing.focus` | Focus | `focus` |
| `training.focuses[]` | Focus | `focus` |
| `careerEvents[].focus` | Focus | `focus` |
| `upbringing.talent.name` | Talent | `talent` |
| `training.talent.name` | Talent | `talent` |
| `career.talent.name` | Talent | `talent` |
| `finish.talent.name` | Talent | `talent` |

### Career Length → Experience Mapping

| `career.length` | `system.experience` |
|------------------|---------------------|
| `"Young"` | `"Novice"` |
| `"Experienced"` | `"Experienced Officer"` |
| `"Veteran"` | `"Veteran Officer"` |

## Important: No Final Attribute/Discipline Values

The bcholmes JSON does NOT contain final attribute or discipline scores. It stores which attributes/disciplines were incremented at each lifepath step. Computing final values requires knowing the exact base values and increment rules for each step, which vary by STA edition.

## Recommended Workflow

1. Navigate to the bcholmes URL in a browser
2. Use the site's "Export to Foundry VTT" button to download a JSON file
3. Import using the JSON File Import mode (see `json-cleanup.md`)

## Direct Decode Workflow (when no JSON export available)

1. Decode the URL parameter to get lifepath data
2. Extract: name, species, talents, focuses, values, traits, assignment, pronouns
3. Present the extracted data to the user
4. Ask the user to provide or confirm final attribute and discipline values
5. Construct the Foundry actor data using `@foundry-mcp/references/sta-data-model.md`
6. Look up talent descriptions from compendium packs
7. Import via `Actor.create()` (same as JSON import)
```

**Step 2: Commit**

```bash
git add .claude/skills/character-import/references/bcholmes-mapping.md
git commit -m "feat: add bcholmes URL mapping reference for character-import skill"
```

---

### Task 4: Create references/manual-spec-checklist.md

**Files:**
- Create: `.claude/skills/character-import/references/manual-spec-checklist.md`

**Step 1: Write manual-spec-checklist.md**

```markdown
# Manual Spec Import — Checklist

Build a Foundry VTT actor from a plain-text character specification.

## Step 1: Extract Core Fields

From the user's spec, identify:

- [ ] Name
- [ ] Pronouns
- [ ] Species
- [ ] Rank
- [ ] Assignment
- [ ] Character role
- [ ] Environment
- [ ] Upbringing
- [ ] Career path
- [ ] Traits (comma-separated in `system.traits`, PLUS individual trait items)
- [ ] Career events
- [ ] Pastimes

## Step 2: Extract Attributes (all 6 required)

| Attribute | Range |
|-----------|-------|
| Control | 7-12 |
| Daring | 7-12 |
| Fitness | 7-12 |
| Insight | 7-12 |
| Presence | 7-12 |
| Reason | 7-12 |

**2e main character total: 56**. Verify if provided.

## Step 3: Extract Disciplines (all 6 required)

| Discipline | Range |
|------------|-------|
| Command | 1-5 |
| Conn | 1-5 |
| Security | 1-5 |
| Engineering | 1-5 |
| Science | 1-5 |
| Medicine | 1-5 |

**2e main character total: 16**. Verify if provided.

## Step 4: Calculate Derived Values

- **Stress max** = Fitness + Security
- **Determination** = 1 (default), max 3
- **Reputation** = 10 (default for new characters)

Note: If species ability changes stress calculation (e.g., Vulcan Mental Discipline uses Control instead of Fitness), note this but still set the standard formula — the STA system handles the override.

## Step 5: Collect Values (4 required)

List all 4 character values. These become embedded items of type `value`.

## Step 6: Collect Focuses (6 required)

List all 6 character focuses. These become embedded items of type `focus`.

## Step 7: Collect Talents

List all talents. For each talent:
1. Search compendium packs for the official description:
   - `sta-compendia.general-talents-core`
   - `sta-compendia.discipline-talents-core`
   - `sta-compendia.species-talents-core`
   - `sta-compendia.starship-talents-core`
   - `sta-compendia.roles-core`
2. If found: use the compendium entry's `system.description` and `system.talenttype`
3. If not found: create with user-provided or empty description

Use `foundry_pack_contents` to search packs.

## Step 8: Add Default Items

Always add these unless already present:

### Unarmed Strike (characterweapon2e)
```json
{
  "name": "Unarmed Strike",
  "type": "characterweapon2e",
  "img": "systems/sta/assets/compendia/icons/weapons-core/unarmed-strike.webp",
  "system": {
    "damage": 2, "severity": 2, "range": "Melee", "hands": 1,
    "qualities": { "stun": true, "area": false, "intense": false, "knockdown": false,
      "accurate": false, "charge": false, "cumbersome": false, "deadly": false,
      "debilitating": false, "grenade": false, "inaccurate": false, "nonlethal": false,
      "hiddenx": 0, "piercingx": 0, "viciousx": 0 }
  }
}
```

### Species Trait (trait)
```json
{
  "name": "<species name>",
  "type": "trait",
  "img": "systems/sta/assets/icons/VoyagerCombadgeIcon.png",
  "system": { "description": "", "quantity": 1 }
}
```

## Step 9: Collect Equipment

List any equipment, weapons, or armor mentioned. Map to appropriate item types:
- General items → type `item`
- Personal weapons → type `characterweapon2e` (see `@foundry-mcp/references/sta-data-model.md`)
- Armor → type `armor`

## Step 10: Build Actor Data

Use the character creation shape from `@foundry-mcp/references/sta-data-model.md`.

Assemble the full actor object with all embedded items in the `items` array.

## Step 11: Icon Paths

| Item type | Icon path |
|-----------|-----------|
| value | `systems/sta/assets/compendia/icons/values-core/value-core.svg` |
| focus | `systems/sta/assets/compendia/icons/focuses-core/focus-core.svg` |
| talent | `systems/sta/assets/compendia/icons/talents-core/talent-core.svg` |
| trait | `systems/sta/assets/icons/VoyagerCombadgeIcon.png` |
| item | `systems/sta/assets/compendia/icons/items-core/placeholder.webp` |
| characterweapon2e | `systems/sta/assets/compendia/icons/weapons-core/unarmed-strike.webp` |
| actor (character) | `icons/svg/mystery-man.svg` |

Note: Compendium talents have specific icons (e.g., `talent-vulcan.svg`, `talent-science.svg`). Use the compendium icon if importing from a pack.

## Step 12: Import

Follow the same duplicate check and `Actor.create()` flow as JSON import (see `json-cleanup.md`).
```

**Step 2: Commit**

```bash
git add .claude/skills/character-import/references/manual-spec-checklist.md
git commit -m "feat: add manual spec checklist reference for character-import skill"
```

---

### Task 5: Verify skill loads and update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Test skill loading**

Use the Skill tool to invoke `character-import`. Verify it loads the SKILL.md content.

**Step 2: Update CLAUDE.md**

Add a reference to the new skill in the Foundry MCP Server section:

After the line `See also: \`sta-dice\` skill...` add:
`See also: \`character-import\` skill (\`.claude/skills/character-import/\`) for importing player characters from JSON, bcholmes.org URLs, or plain-text specs.`

**Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: reference character-import skill in CLAUDE.md"
```

---

### Task 6: End-to-end test with T'Karra JSON

**Step 1: Delete existing T'Karra from Foundry**

```
foundry_list  type: "Actor"  fields: ["name", "_id"]
```

Find T'Karra's ID, then:
```
foundry_delete  type: "Actor"  ids: ["<id>"]
```

**Step 2: Invoke the skill and import**

Use Skill tool to invoke `character-import`, then follow the skill's instructions to import `characters/T'Karra-foundry-vtt.json`.

**Step 3: Verify the import**

```
foundry_get  type: "Actor"  id: "<new_id>"
```

Confirm: 18 items, correct attributes/disciplines, correct species/assignment.

**Step 4: Final commit if any adjustments were needed**

```bash
git add -A && git commit -m "fix: adjust character-import skill based on testing"
```
