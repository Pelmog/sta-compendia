# STA Roll Recipes

Complete parameter shapes for all STARoll methods. All recipes are exec-js scripts run via `foundry_exec_js`.

## taskData — Full Shape

```js
const taskData = {
  // Required — identity
  speakerName: actor.name,
  speakerId: actor.id,
  speaker: ChatMessage.getSpeaker({actor}),

  // Required — ability scores (character rolls)
  selectedAttribute: "daring",           // control|daring|fitness|insight|presence|reason
  selectedAttributeValue: 9,
  selectedDiscipline: "engineering",      // command|conn|engineering|medicine|science|security
  selectedDisciplineValue: 1,

  // Required — ability scores (starship rolls, use INSTEAD of attribute/discipline)
  selectedSystem: "weapons",             // communications|computers|engines|sensors|structure|weapons
  selectedSystemValue: 8,
  selectedDepartment: "security",        // command|conn|engineering|medicine|science|security
  selectedDepartmentValue: 3,

  // Required — roll config
  rolltype: "character2e",               // see Roll Types table
  dicePool: 2,                           // number of d20s (normally 2)

  // Optional — modifiers
  usingFocus: false,                     // doubles on discipline value or lower
  usingDedicatedFocus: false,            // doubles on discipline×2 or lower
  usingDetermination: false,             // +2 auto successes, -1 die (except 1e)
  complicationRange: 1,                  // complications on 20+ by default; 2 = 19+, etc.

  // Optional — overrides (normally calculated automatically)
  checkTarget: null,                     // defaults to attribute + discipline
  disDepTarget: null,                    // defaults to discipline value
  complicationMinimumValue: null,        // defaults to 21 - complicationRange

  // Optional — reputation
  useReputationInstead: false,
  reputationValue: 10,

  // Optional — flavor
  flavor: "",                            // custom text (used with rolltype='custom')
  skillLevel: 0,                         // NPC skill level (flavor text only)

  // Optional — skip dice (for testing)
  customResults: null,                   // array of numbers to use instead of rolling

  // NPC-specific
  starshipName: "USS Enterprise",        // ship name for NPC rolls

  // Zero-value defaults (include to avoid undefined)
  selectedSystemValue: 0,
  selectedDepartmentValue: 0,
  reputationValue: 0,
};
```

## Task Roll — Character 2e

```js
const actor = game.actors.get("<ACTOR_ID>");
const roll = new STARoll();
await roll.rollTask({
  speakerName: actor.name,
  speakerId: actor.id,
  selectedAttribute: "daring",
  selectedAttributeValue: actor.system.attributes.daring.value,
  selectedDiscipline: "engineering",
  selectedDisciplineValue: actor.system.disciplines.engineering.value,
  rolltype: "character2e",
  dicePool: 2,
  usingFocus: false,
  usingDedicatedFocus: false,
  usingDetermination: false,
  complicationRange: 1,
  skillLevel: 0,
  selectedSystemValue: 0,
  selectedDepartmentValue: 0,
  reputationValue: 0,
  speaker: ChatMessage.getSpeaker({actor})
});
```

### With Focus

Set `usingFocus: true` — rolls <= discipline value count as 2 successes.

### With Determination

Set `usingDetermination: true` — reduces dice pool by 1, adds 2 automatic successes.

### With Extra Dice (Momentum spend)

Set `dicePool: 3` (or up to 5) — each extra die costs 1 Momentum.

## Task Roll — Character 1e

Same as 2e but `rolltype: "character1e"`. Key difference: determination does NOT reduce dice pool in 1e.

## Task Roll — Starship

```js
const ship = game.actors.get("<SHIP_ID>");
const roll = new STARoll();
await roll.rollTask({
  speakerName: ship.name,
  speakerId: ship.id,
  selectedSystem: "weapons",
  selectedSystemValue: ship.system.systems.weapons.value,
  selectedDepartment: "security",
  selectedDepartmentValue: ship.system.departments.security.value,
  rolltype: "starship",
  dicePool: 2,
  usingFocus: false,
  usingDedicatedFocus: false,
  usingDetermination: false,
  complicationRange: 1,
  skillLevel: 0,
  selectedAttributeValue: 0,
  selectedDisciplineValue: 0,
  reputationValue: 0,
  speaker: ChatMessage.getSpeaker({actor: ship})
});
```

## Challenge Roll — Damage Dice

```js
const roll = new STARoll();
await roll.performChallengeRoll({
  dicePool: 3,
  challengeName: "Phaser Array"
});
```

Posts d6 results to chat. Counts successes (1=1, 2=2, 3-4=0, 5-6=1+effect).

## Weapon Roll — Character 2e

2e weapon rolls display damage info as a chat card (no dice rolled):

```js
const actor = game.actors.get("<ACTOR_ID>");
const weapon = actor.items.find(i => i.type === "characterweapon2e" && i.name === "Phaser Type-2");
const roll = new STARoll();
await roll.performWeaponRoll2e(weapon, actor);
```

## Weapon Roll — Starship 2e

```js
const ship = game.actors.get("<SHIP_ID>");
const weapon = ship.items.find(i => i.type === "starshipweapon2e" && i.name === "Phaser Arrays");
const roll = new STARoll();
await roll.performStarshipWeaponRoll2e(weapon, ship);
```

2e starship damage formula:
- Base: `item.system.damage`
- Weapons bonus: `+1` per 2 above 6 in `system.systems.weapons.value` (max +4 at 13+)
- Scale bonus: `+ship.system.scale` if `item.system.includescale === "energy"`

## Weapon Roll — Character 1e (rolls dice)

```js
const actor = game.actors.get("<ACTOR_ID>");
const weapon = actor.items.find(i => i.type === "characterweapon" && i.name === "Phaser Type-2");
const roll = new STARoll();
await roll.performWeaponRoll1e(weapon, actor);
```

1e damage: `item.system.damage + actor.system.disciplines.security.value + (includescale ? actor.system.scale : 0)` → rolls that many d6s.

## Weapon Roll — Starship 1e (rolls dice)

```js
const ship = game.actors.get("<SHIP_ID>");
const weapon = ship.items.find(i => i.type === "starshipweapon");
const roll = new STARoll();
await roll.performStarshipWeaponRoll1e(weapon, ship);
```

## NPC Task Roll

Combines crew + ship in one roll:

```js
const actor = game.actors.get("<NPC_ACTOR_ID>");
const roll = new STARoll();
await roll.rollNPCTask({
  speakerName: actor.name,
  speakerId: actor.id,
  selectedAttribute: "daring",
  selectedAttributeValue: 9,
  selectedDiscipline: "security",
  selectedDisciplineValue: 3,
  selectedSystem: "weapons",
  selectedSystemValue: 8,
  selectedDepartment: "security",
  selectedDepartmentValue: 2,
  starshipName: "IKS Bortas",
  rolltype: "npccrew",
  dicePool: 2,
  usingFocus: false,
  usingDedicatedFocus: false,
  usingDetermination: false,
  complicationRange: 1,
  skillLevel: 0,
  reputationValue: 0,
  speaker: ChatMessage.getSpeaker({actor})
});
```

## Item Display Rolls (no dice — chat cards only)

```js
const actor = game.actors.get("<ACTOR_ID>");
const item = actor.items.find(i => i.name === "Bold: Command");
const roll = new STARoll();

// Each type has its own method:
await roll.performTalentRoll(item, actor);    // talent
await roll.performFocusRoll(item, actor);     // focus
await roll.performValueRoll(item, actor);     // value
await roll.performInjuryRoll(item, actor);    // injury
await roll.performTraitRoll(item, actor);     // trait
await roll.performItemRoll(item, actor);      // generic item
await roll.performArmorRoll(item, actor);     // armor
await roll.performMilestoneRoll(item, actor); // milestone
```

## Finding Actors

```js
// By ID
const actor = game.actors.get("WW37bijK9ETtaNep");

// By name
const actor = game.actors.getName("Captain Vasik");

// List all with type
return game.actors.filter(a => a.type === "character").map(a => ({name: a.name, id: a.id}));
```

## Success Counting — Exact Rules

For each d20 rolled:

1. If `usingFocus && roll <= disciplineValue` OR `roll === 1` → **2 successes** (critical)
2. Else if `usingDedicatedFocus && roll <= disciplineValue * 2` → **2 successes**
3. Else if `roll <= attributeValue + disciplineValue` → **1 success**
4. Else if `roll >= 21 - complicationRange` → **complication** (no success)
5. Else → nothing

After all dice: if `usingDetermination` → add 2 more successes automatically.
