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

Note: If species ability changes stress calculation (e.g., Vulcan Mental Discipline uses Control instead of Fitness), note this but still set the standard formula — the STA system handles the override via the talent.

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
2. If found: use the compendium entry's `system.description`, `system.talenttype`, and `img`
3. If not found: create with user-provided or empty description

Use `foundry_pack_contents` to search packs.

## Step 8: Add Default Items

Always add these unless already present in the spec:

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

Assemble the full actor object with all embedded items in the `items` array:

```js
{
  name: "<name>",
  type: "character",
  img: "icons/svg/mystery-man.svg",
  system: {
    species: "<species>",
    rank: "<rank>",
    assignment: "<assignment>",
    characterrole: "<role>",
    environment: "<environment>",
    upbringing: "<upbringing>",
    careerpath: "<career path>",
    pronouns: "<pronouns>",
    traits: "<species>, <trait2>, ...",   // comma-separated string
    careerevents: "<event1>, <event2>",
    pastimes: "<pastimes>",
    npcType: "major",
    attributes: {
      control: { value: N }, daring: { value: N }, fitness: { value: N },
      insight: { value: N }, presence: { value: N }, reason: { value: N }
    },
    disciplines: {
      command: { value: N }, conn: { value: N }, security: { value: N },
      engineering: { value: N }, science: { value: N }, medicine: { value: N }
    },
    determination: { value: 1, max: 3 },
    stress: { value: 0, max: <fitness + security> },
    reputation: 10,
  },
  items: [ /* all embedded items: values, focuses, talents, traits, equipment, weapons */ ]
}
```

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
