---
name: sta-dice
description: Roll STA dice programmatically via Foundry MCP exec-js. Use when the user wants to "roll dice", "task roll", "challenge roll", "weapon roll", "damage roll", use "STARoll", or "dice as character".
---

# STA Dice Rolling via Foundry MCP

Roll Star Trek Adventures dice programmatically using the `STARoll` global class through `foundry_exec_js`.

**Requires**: GM browser session open in Foundry VTT.

## Quick Start — Task Roll as a Character

```js
// Roll Daring + Engineering for an actor
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

Use `foundry_exec_js` to run the above. It posts the roll result directly to Foundry chat.

## STARoll API

`STARoll` is a **global class** — instantiate with `new STARoll()`.

### Key Methods

| Method | Purpose |
|--------|---------|
| `rollTask(taskData)` | Character/starship task roll (d20s) |
| `rollNPCTask(taskData)` | NPC crew+ship combined roll |
| `performChallengeRoll({dicePool, challengeName})` | Challenge dice (d6s) |
| `performWeaponRoll2e(item, speaker)` | 2e character weapon display |
| `performStarshipWeaponRoll2e(item, speaker)` | 2e starship weapon display |
| `performWeaponRoll1e(item, speaker)` | 1e character weapon (rolls d6s) |
| `performStarshipWeaponRoll1e(item, speaker)` | 1e starship weapon (rolls d6s) |
| `performItemRoll(item, speaker)` | Generic item chat card |
| `performTalentRoll(item, speaker)` | Talent chat card (no dice) |
| `performFocusRoll(item, speaker)` | Focus chat card (no dice) |
| `performValueRoll(item, speaker)` | Value chat card (no dice) |

### Roll Types

| `rolltype` value | Use for |
|------------------|---------|
| `character2e` | 2e character task roll |
| `character1e` | 1e character task roll |
| `starship` | Starship task roll |
| `starshipassist` | Starship assisting character |
| `npccrew` | NPC crew task roll |
| `npcship` | NPC ship assist |

### Success Rules (d20 Task Rolls)

- Roll = 1 → **2 successes** (critical)
- Roll <= discipline AND using focus → **2 successes**
- Roll <= attribute + discipline → **1 success**
- Roll >= (21 - complicationRange) → **complication**
- Determination adds 2 automatic successes

### Challenge Dice Rules (d6)

| Face | Result |
|------|--------|
| 1 | 1 success |
| 2 | 2 successes |
| 3-4 | 0 |
| 5-6 | 1 success + 1 effect |

## Reference Files

For complete recipes including all taskData fields, weapon rolls, NPC rolls, and item display rolls:

- **references/roll-recipes.md** — Full roll recipes with exact parameter shapes
