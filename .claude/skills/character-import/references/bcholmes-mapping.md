# bcholmes.org URL Import

## URL Format

`https://sta.bcholmes.org/view?s=<payload>`

The `s=` parameter is: URL-safe base64 → zlib-compressed → JSON

## Decoding

Extract the `s=` parameter from the URL. Decode in bash:

```bash
echo '<payload>' | tr '_-' '/+' | base64 -d | python3 -c \
  "import sys,zlib,json; print(json.dumps(json.loads(zlib.decompress(sys.stdin.buffer.read())),indent=2))"
```

## bcholmes JSON Schema

The decoded JSON stores **lifepath creation steps**, NOT final computed attribute/discipline values.

### Core Fields

| Field | Type | Example | Maps to |
|-------|------|---------|---------|
| `name` | string | `"T'Karra"` | `name` |
| `pronouns` | string | `"she/her"` | `system.pronouns` |
| `species.primary` | string | `"Vulcan"` | `system.species` |
| `era` | string | `"OriginalSeries"` | (metadata only) |
| `stereotype` | string | `"mainCharacter"` | (metadata — mainCharacter, npc, etc.) |
| `type` | string | `"AmbassadorDiplomat"` | `system.careerpath` |
| `role.id` | string | `"PoliticalLiaison"` | `system.characterrole` |
| `assignedShip` | string | `"USS Enterprise"` | `system.assignment` |
| `environment.id` | string | `"Vulcan23rd"` | `system.environment` → extract location name |
| `upbringing.id` | string | `"ScienceAndTechnology"` | `system.upbringing` |
| `upbringing.accepted` | boolean | `true` | (A) if true, (R) if false |
| `career.length` | string | `"Young"` | `system.experience` (see mapping below) |
| `age` | string | `"Adult"` | (metadata only) |
| `traits` | array | `["Sensitive"]` | Additional traits beyond species |
| `pastime` | array | `["3d Chess"]` | `system.pastimes` (join with ", ") |

### Extracting Embedded Items

| bcholmes source | Item type | Foundry type |
|-----------------|-----------|--------------|
| `environment.value` | Value | `value` |
| `training.value` | Value | `value` |
| `career.value` | Value | `value` |
| `finish.value` | Value | `value` |
| `upbringing.focus` | Focus | `focus` |
| `training.focuses[]` | Focus (array) | `focus` |
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

### Environment ID → Name Mapping

Strip the era suffix from the environment ID:
- `"Vulcan23rd"` → `"Vulcan"`
- `"StarfleetAcademy24th"` → `"Starfleet Academy"`
- `"BusyColony23rd"` → `"Busy Colony"`

Use camelCase splitting to extract the location name.

### Career Events

`careerEvents` is an array of objects with:
- `id` — numeric event ID (maps to STA career event tables)
- `focus` — the focus gained from this event
- `attribute` — attribute incremented
- `discipline` — discipline incremented

The event `id` maps to event names but the mapping is complex. For import purposes, extract the focuses and note the event IDs in `system.careerevents`.

## Important: No Final Attribute/Discipline Values

The bcholmes JSON does **NOT** contain final attribute or discipline scores. It stores which attributes/disciplines were incremented at each lifepath step. Computing final values requires knowing:
- Base attribute values per species (all start at 7 in STA 2e)
- Exact increment rules for each lifepath step
- Which choices give +1 vs +2

This computation is non-trivial and version-dependent.

## Recommended Workflow

1. Navigate to the bcholmes URL in a browser
2. Use the site's **"Export to Foundry VTT"** button to download a JSON file
3. Import using the JSON File Import mode (see `json-cleanup.md`)

This is the safest path because bcholmes.org computes the final values correctly.

## Direct Decode Workflow (when no JSON export available)

1. Decode the URL parameter to get lifepath data
2. Extract: name, species, talents, focuses, values, traits, assignment, pronouns
3. Present the extracted data to the user
4. **Ask the user to provide or confirm final attribute and discipline values**
5. Construct the Foundry actor data using `@foundry-mcp/references/sta-data-model.md`
6. Look up talent descriptions from compendium packs (`foundry_pack_contents`)
7. Add default items: Unarmed Strike, species trait
8. Import via `Actor.create()` (same as JSON import — see `json-cleanup.md`)
