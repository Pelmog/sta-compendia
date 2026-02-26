# STA Data Model Reference

Field paths and creation shapes for Star Trek Adventures actors and items.

## Character Actor (`type: "character"`)

### Creation Shape

```js
{
  name: "Captain Theron Vasik",
  type: "character",
  img: "icons/svg/mystery-man.svg",
  system: {
    species: "Human",
    rank: "Captain",
    assignment: "Commanding Officer",
    characterrole: "Command",
    environment: "Starfleet Academy",
    upbringing: "Starfleet",
    careerpath: "Experienced Officer",
    pronouns: "he/him",
    traits: "Human, Starfleet Officer",
    npcType: "major",                    // "minor" | "major"

    attributes: {
      control:  { value: 10 },
      daring:   { value: 9 },
      fitness:  { value: 8 },
      insight:  { value: 9 },
      presence: { value: 11 },
      reason:   { value: 9 },
    },
    disciplines: {
      command:     { value: 5 },
      conn:        { value: 2 },
      engineering: { value: 1 },
      medicine:    { value: 3 },
      science:     { value: 2 },
      security:    { value: 3 },
    },

    determination: { value: 1, max: 3 },
    stress: { value: 0, max: 11 },       // max = fitness + security
    reputation: 10,
  }
}
```

### Update Field Paths

```
system.stress.value
system.stress.max
system.determination.value
system.attributes.daring.value       (control|daring|fitness|insight|presence|reason)
system.disciplines.command.value     (command|conn|engineering|medicine|science|security)
system.reputation
system.species
system.rank
system.traits
```

### 2e Main Character Limits

- Attribute total: 56 (each: 7-12)
- Discipline total: 16 (each: 1-5)

## Starship Actor (`type: "starship"`)

### Creation Shape

```js
{
  name: "USS Enterprise",
  type: "starship",
  img: "icons/svg/ship.svg",
  system: {
    shipclass: "Constitution",
    scale: 4,

    systems: {
      communications: { value: 8 },
      computers:      { value: 9 },
      engines:        { value: 9 },
      sensors:        { value: 8 },
      structure:      { value: 8 },
      weapons:        { value: 9 },
    },
    departments: {
      command:     { value: 3 },
      conn:        { value: 2 },
      engineering: { value: 2 },
      medicine:    { value: 1 },
      science:     { value: 2 },
      security:    { value: 2 },
    },

    hull:    { value: 12, max: 12 },
    shields: { value: 10, max: 10 },
    power:   { value: 8 },
  }
}
```

### Update Field Paths

```
system.hull.value / system.hull.max
system.shields.value / system.shields.max
system.power.value
system.scale
system.shipclass
system.systems.weapons.value         (communications|computers|engines|sensors|structure|weapons)
system.departments.security.value    (command|conn|engineering|medicine|science|security)
```

## Item Types — Creation Shapes

### focus / value / talent / trait / injury

```js
{
  name: "Diplomacy",
  type: "focus",          // focus | value | talent | trait | injury
  img: "systems/sta/assets/icons/focus.webp",
  system: { description: "Freetext description." }
}
```

**Icon paths**: `systems/sta/assets/icons/<type>.webp` (focus, value, talent)

### item (equipment)

```js
{
  name: "Tricorder",
  type: "item",
  system: {
    description: "...",
    quantity: 1,
    opportunity: 0,
    escalation: 0,
  }
}
```

### characterweapon (1e personal weapon)

```js
{
  name: "Phaser Type-2",
  type: "characterweapon",
  system: {
    damage: 3,
    range: "close",          // close | medium | long
    hands: 1,
    quantity: 1,
    opportunity: 1,
    escalation: 0,
    includescale: false,
    qualities: {
      charge: false, grenade: false, area: false, intense: false,
      knockdown: false, accurate: false, debilitating: false,
      cumbersome: false, inaccurate: false, deadly: false, nonlethal: false,
      hiddenx: 0, piercingx: 0, viciousx: 0,
    }
  }
}
```

### characterweapon2e (2e personal weapon)

```js
{
  name: "Phaser Type-2",
  type: "characterweapon2e",
  system: {
    damage: 3,
    range: "close",
    hands: 1,
    quantity: 1,
    opportunity: 1,
    escalation: 0,
    qualities: {
      accurate: false, area: false, charge: false, cumbersome: false,
      debilitating: false, grenade: false, inaccurate: false, intense: false,
      stun: false, deadly: false,
      piercingx: 0, hiddenx: 0,
      severity: 0,              // 2e-only
    }
  }
}
```

**2e differences from 1e**: no `knockdown`/`viciousx`/`nonlethal`; adds `stun`, `severity`.

### starshipweapon (1e starship weapon)

```js
{
  name: "Phaser Banks",
  type: "starshipweapon",
  system: {
    damage: 7,
    range: "medium",
    includescale: true,       // boolean
    qualities: {
      area: false, spread: false, highyield: false, devastating: false,
      dampening: false, calibration: false,
      hiddenx: 0, persistentx: 0, piercingx: 0, viciousx: 0, versatilex: 0,
    }
  }
}
```

### starshipweapon2e (2e starship weapon)

```js
{
  name: "Phaser Arrays",
  type: "starshipweapon2e",
  system: {
    damage: 4,
    range: "medium",
    includescale: "energy",   // "energy" | "kinetic" | false
    qualities: {
      area: false, calibration: false, cumbersome: false, dampening: false,
      depleting: false, devastating: false, highyield: false, intense: false,
      jamming: false, slowing: false, spread: false,
      hiddenx: 0, persistent: 0, piercing: 0, versatilex: 0,
    }
  }
}
```

**2e differences from 1e**: `includescale` is `"energy"`/`"kinetic"`/`false` instead of boolean; adds `depleting`, `intense`, `jamming`, `slowing`, `cumbersome`.

## Compendium Pack IDs

| Pack ID | Type | Count |
|---------|------|-------|
| `sta-compendia.general-talents-core` | Item (talent) | 25 |
| `sta-compendia.discipline-talents-core` | Item (talent) | 29 |
| `sta-compendia.species-talents-core` | Item (talent) | 17 |
| `sta-compendia.starship-talents-core` | Item (talent) | 35 |
| `sta-compendia.roles-core` | Item (talent) | 10 |
| `sta-compendia.focuses-core` | Item (focus) | 103 |
| `sta-compendia.values-core` | Item (value) | 55 |
| `sta-compendia.personal-weapons-core` | Item (characterweapon) | 20 |
| `sta-compendia.personal-weapons-2e-core` | Item (characterweapon2e) | 18 |
| `sta-compendia.starship-weapons-core` | Item (starshipweapon) | 51 |
| `sta-compendia.starship-weapons-2e-core` | Item (starshipweapon2e) | 15 |
| `sta-compendia.personal-equipment-core` | Item (item/armor) | 30 |
| `sta-compendia.damage-core` | Item (injury) | 24 |
| `sta-compendia.starfleet-starships-core` | Actor (starship) | 16 |
| `sta-compendia.alien-starships-core` | Actor (starship) | 14 |
| `sta-compendia.npc-starship-crew-core` | Actor (character) | 5 |
| `sta-compendia.playable-species-core` | JournalEntry | 8 |
| `sta-compendia.roll-tables-core` | RollTable | 8 |
| `sta-compendia.manual-tutorials-core` | JournalEntry | 1 |
| `sta-compendia.default-maps` | Scene | 2 |
