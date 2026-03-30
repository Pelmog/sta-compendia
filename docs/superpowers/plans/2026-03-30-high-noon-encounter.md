# High Noon Encounter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full tactical High Noon encounter in the live Foundry VTT world — armed NPCs, roll tables, scene walls/regions/tokens/lighting, and GM journal.

**Architecture:** All operations use the Foundry MCP server tools (`mcp__foundry__foundry_create`, `mcp__foundry__foundry_update`, `mcp__foundry__foundry_exec_js`). Actors and items are created via `foundry_create`. Scene configuration (walls, regions, tokens) uses `foundry_exec_js` to call Foundry's `createEmbeddedDocuments` API. Roll tables and journal entries use `foundry_create` + `foundry_exec_js` for embedded documents.

**Tech Stack:** Foundry VTT v13.351, STA system v2.5.1, Foundry MCP server (socket connection)

**Spec:** `docs/superpowers/specs/2026-03-30-high-noon-encounter-design.md`

**Key IDs:**
- Scene: `kUynRZA8CNuYNpYF` ("Battlemap — Yara's Ranch (High Noon)")
- Actor folder: `0NIuTNWOyprVm4pK` (Pale Riders actors)
- Item folder: `U6hWgQIQofcSPqO9` (Pale Riders items)
- Scene folder: `BGWwF2Nm9kTBrOcK` (Pale Riders scenes)
- Journal folder: `UfOVXnBgH7wW7MYJ` (Pale Riders journals)
- Existing scene tokens: Rek Dalton `UjrERMPx5rFOd4tg`, Marshal Cade `hZpSBbTb6gXE9vUS`

**Existing Actor IDs:**
- Rek Dalton: `lqXErkDjCPUEEEYR`
- Sev Dalton: `0tDQoIj2o5VQNdgX`
- Little Rek Dalton: `XkXWtubqfvyB32pQ`
- Pip Dalton: `qwb6dZvVYJHZmOuI`
- Marshal Cade: `Fr04XrOo7uzoKlgB`
- Yara Denn: `CyVsyhMhEMX9mOf7`
- Tomas Saal: `ZRArNZ4swx32OirC`

**Existing Weapon Item IDs:**
- Verathi Six-Gun: `MalN6DcPoESQCCFW`
- Verathi Long Pistol: `uOiRxvXJGKrTgQNC`
- Verathi Long Rifle: `YZkXbxWt8j2VEd29`
- Verathi Shotgun: `cuUh34ylbOTlIPhu`
- Verathi Bowie Knife: `VB9T32p2SEeEYL72`
- Verathi Derringer: `wIeqSPlDNghXqxSD`

**Map Coordinates:** Image is 1024x1024, scene is 2000x2000. Scale factor: 1.953. All coordinates below are in Foundry scene space (2000x2000), snapped to the 50px grid.

---

### Task 1: Create New Weapon Items

**Files:** None (Foundry world data only)

Create the Mining Charge and Phaser Type-2 items in the Pale Riders item folder.

- [ ] **Step 1: Create Mining Charge item**

```
Tool: mcp__foundry__foundry_create
type: "Item"
data: {
  "name": "Mining Charge (Improvised)",
  "type": "characterweapon2e",
  "folder": "U6hWgQIQofcSPqO9",
  "system": {
    "description": "Verathi mining explosive repurposed as a defensive charge. Buried on the approach road and detonated remotely as a Minor Action. Single use — once detonated, the charge is spent. Area effect hits everyone in the blast zone.",
    "damage": 4,
    "range": "ranged",
    "hands": 0,
    "severity": 2,
    "opportunity": 0,
    "escalation": 0,
    "qualities": {
      "deadly": false,
      "stun": false,
      "accurate": false,
      "area": true,
      "charge": false,
      "cumbersome": false,
      "debilitating": false,
      "grenade": false,
      "inaccurate": false,
      "intense": false,
      "piercingx": false,
      "hiddenx": 0
    }
  }
}
```

Save the returned `_id` as `MINING_CHARGE_ID`.

- [ ] **Step 2: Create Phaser Type-2 (Reserve Power) item**

```
Tool: mcp__foundry__foundry_create
type: "Item"
data: {
  "name": "Phaser Type-2 (Reserve Power)",
  "type": "characterweapon2e",
  "folder": "U6hWgQIQofcSPqO9",
  "system": {
    "description": "Standard Starfleet Type-2 phaser running on reserve power after subspace distortion damage. 3 shots remaining per unit. Each shot adds 1 Threat (advanced weapons witnessed). Massively overpowered against chemical-propellant-era opponents. Track shots manually — after 3 shots, the power cell is dead.",
    "damage": 5,
    "range": "ranged",
    "hands": 1,
    "severity": 1,
    "opportunity": 0,
    "escalation": 0,
    "qualities": {
      "deadly": false,
      "stun": false,
      "accurate": false,
      "area": false,
      "charge": true,
      "cumbersome": false,
      "debilitating": false,
      "grenade": false,
      "inaccurate": false,
      "intense": false,
      "piercingx": false,
      "hiddenx": 0
    }
  }
}
```

Save the returned `_id` as `PHASER_RESERVE_ID`.

- [ ] **Step 3: Verify both items exist**

```
Tool: mcp__foundry__foundry_exec_js
script: return game.items.filter(i => i.folder?.id === "U6hWgQIQofcSPqO9").map(i => ({ id: i.id, name: i.name }));
```

Expected: list includes "Mining Charge (Improvised)" and "Phaser Type-2 (Reserve Power)" alongside the existing Verathi weapons.

---

### Task 2: Create Squad Actors

**Files:** None (Foundry world data only)

Create the three new NPC actors: Dalton Riders Squad A, Squad B, and Sev's Flankers. Each gets armed with weapons copied from world items.

- [ ] **Step 1: Create Dalton Riders (Squad A)**

```
Tool: mcp__foundry__foundry_create
type: "Actor"
data: {
  "name": "Dalton Riders (Squad A)",
  "type": "character",
  "folder": "0NIuTNWOyprVm4pK",
  "prototypeToken": {
    "name": "Dalton Riders A",
    "displayName": 30,
    "disposition": -1
  },
  "system": {
    "species": "Verathi",
    "assignment": "Dalton's hired guns",
    "traits": "Verathi, Hired Guns, Strength in Numbers",
    "notes": "Represents 6 mounted riders fighting as a unit. At half stress (6), half scatter — apply Complication 'Riders Regrouping'. When stress track emptied, survivors flee.",
    "npcType": "notable",
    "attributes": {
      "control": { "value": 7 },
      "daring": { "value": 8 },
      "fitness": { "value": 8 },
      "insight": { "value": 7 },
      "presence": { "value": 7 },
      "reason": { "value": 7 }
    },
    "disciplines": {
      "command": { "value": 1 },
      "conn": { "value": 1 },
      "engineering": { "value": 0 },
      "medicine": { "value": 0 },
      "science": { "value": 0 },
      "security": { "value": 2 }
    },
    "stress": { "value": 0, "max": 12 },
    "determination": { "value": 0, "max": 0 }
  }
}
```

Save returned `_id` as `SQUAD_A_ID`.

- [ ] **Step 2: Add weapons to Squad A**

```
Tool: mcp__foundry__foundry_exec_js
script:
const actor = game.actors.get("SQUAD_A_ID");
const sixGun = game.items.get("MalN6DcPoESQCCFW").toObject();
const longRifle = game.items.get("YZkXbxWt8j2VEd29").toObject();
delete sixGun._id;
delete longRifle._id;
await actor.createEmbeddedDocuments("Item", [sixGun, longRifle]);
return actor.items.map(i => i.name);
```

Replace `SQUAD_A_ID` with the actual ID from Step 1.

Expected: `["Unarmed Strike", "Unarmed Strike", "Verathi Six-Gun (Colt .45 equivalent)", "Verathi Long Rifle"]`

- [ ] **Step 3: Create Dalton Riders (Squad B)**

Same as Step 1 but with name "Dalton Riders (Squad B)" and prototype token name "Dalton Riders B". Save returned `_id` as `SQUAD_B_ID`.

```
Tool: mcp__foundry__foundry_create
type: "Actor"
data: {
  "name": "Dalton Riders (Squad B)",
  "type": "character",
  "folder": "0NIuTNWOyprVm4pK",
  "prototypeToken": {
    "name": "Dalton Riders B",
    "displayName": 30,
    "disposition": -1
  },
  "system": {
    "species": "Verathi",
    "assignment": "Dalton's hired guns",
    "traits": "Verathi, Hired Guns, Strength in Numbers",
    "notes": "Represents 6 mounted riders fighting as a unit. At half stress (6), half scatter — apply Complication 'Riders Regrouping'. When stress track emptied, survivors flee.",
    "npcType": "notable",
    "attributes": {
      "control": { "value": 7 },
      "daring": { "value": 8 },
      "fitness": { "value": 8 },
      "insight": { "value": 7 },
      "presence": { "value": 7 },
      "reason": { "value": 7 }
    },
    "disciplines": {
      "command": { "value": 1 },
      "conn": { "value": 1 },
      "engineering": { "value": 0 },
      "medicine": { "value": 0 },
      "science": { "value": 0 },
      "security": { "value": 2 }
    },
    "stress": { "value": 0, "max": 12 },
    "determination": { "value": 0, "max": 0 }
  }
}
```

- [ ] **Step 4: Add weapons to Squad B**

```
Tool: mcp__foundry__foundry_exec_js
script:
const actor = game.actors.get("SQUAD_B_ID");
const sixGun = game.items.get("MalN6DcPoESQCCFW").toObject();
const longRifle = game.items.get("YZkXbxWt8j2VEd29").toObject();
delete sixGun._id;
delete longRifle._id;
await actor.createEmbeddedDocuments("Item", [sixGun, longRifle]);
return actor.items.map(i => i.name);
```

Replace `SQUAD_B_ID` with the actual ID from Step 3.

- [ ] **Step 5: Create Sev's Flankers**

```
Tool: mcp__foundry__foundry_create
type: "Actor"
data: {
  "name": "Sev's Flankers",
  "type": "character",
  "folder": "0NIuTNWOyprVm4pK",
  "prototypeToken": {
    "name": "Sev's Flankers",
    "displayName": 30,
    "disposition": -1
  },
  "system": {
    "species": "Verathi",
    "assignment": "Sev Dalton's fire team",
    "traits": "Verathi, Canyon Trackers, Sev's Best",
    "notes": "Represents 2 experienced riders who operate as Sev's personal flanking team. Better trained than the regular hired guns. They hold the canyon rim with Sev and provide covering fire.",
    "npcType": "notable",
    "attributes": {
      "control": { "value": 8 },
      "daring": { "value": 8 },
      "fitness": { "value": 9 },
      "insight": { "value": 7 },
      "presence": { "value": 7 },
      "reason": { "value": 7 }
    },
    "disciplines": {
      "command": { "value": 1 },
      "conn": { "value": 1 },
      "engineering": { "value": 0 },
      "medicine": { "value": 0 },
      "science": { "value": 0 },
      "security": { "value": 3 }
    },
    "stress": { "value": 0, "max": 8 },
    "determination": { "value": 0, "max": 0 }
  }
}
```

Save returned `_id` as `FLANKERS_ID`.

- [ ] **Step 6: Add weapons to Flankers**

```
Tool: mcp__foundry__foundry_exec_js
script:
const actor = game.actors.get("FLANKERS_ID");
const longRifle = game.items.get("YZkXbxWt8j2VEd29").toObject();
const knife = game.items.get("VB9T32p2SEeEYL72").toObject();
delete longRifle._id;
delete knife._id;
await actor.createEmbeddedDocuments("Item", [longRifle, knife]);
return actor.items.map(i => i.name);
```

Replace `FLANKERS_ID` with the actual ID from Step 5.

- [ ] **Step 7: Verify all three actors**

```
Tool: mcp__foundry__foundry_exec_js
script:
return game.actors.filter(a => ["Dalton Riders (Squad A)", "Dalton Riders (Squad B)", "Sev's Flankers"].includes(a.name)).map(a => ({ id: a.id, name: a.name, stress: a.system.stress.max, items: a.items.map(i => i.name) }));
```

Expected: 3 actors, Squad A/B with stress 12 and Six-Gun + Long Rifle, Flankers with stress 8 and Long Rifle + Bowie Knife.

---

### Task 3: Arm Existing Dalton Actors

**Files:** None (Foundry world data only)

Add Verathi weapons to the four named Dalton actors. Currently they all only have Unarmed Strike.

- [ ] **Step 1: Arm all four Daltons in one exec-js call**

```
Tool: mcp__foundry__foundry_exec_js
script:
const sixGun = game.items.get("MalN6DcPoESQCCFW").toObject();
const longRifle = game.items.get("YZkXbxWt8j2VEd29").toObject();
const knife = game.items.get("VB9T32p2SEeEYL72").toObject();

// Rek Dalton — Verathi Six-Gun
const rek = game.actors.get("lqXErkDjCPUEEEYR");
const rekGun = {...sixGun}; delete rekGun._id;
await rek.createEmbeddedDocuments("Item", [rekGun]);

// Sev Dalton — Long Rifle + Bowie Knife
const sev = game.actors.get("0tDQoIj2o5VQNdgX");
const sevRifle = {...longRifle}; delete sevRifle._id;
const sevKnife = {...knife}; delete sevKnife._id;
await sev.createEmbeddedDocuments("Item", [sevRifle, sevKnife]);

// Little Rek — 2x Six-Gun
const littleRek = game.actors.get("XkXWtubqfvyB32pQ");
const lr1 = {...sixGun}; delete lr1._id;
const lr2 = {...sixGun}; delete lr2._id;
await littleRek.createEmbeddedDocuments("Item", [lr1, lr2]);

// Pip Dalton — Six-Gun
const pip = game.actors.get("qwb6dZvVYJHZmOuI");
const pipGun = {...sixGun}; delete pipGun._id;
await pip.createEmbeddedDocuments("Item", [pipGun]);

return {
  rek: rek.items.map(i => i.name),
  sev: sev.items.map(i => i.name),
  littleRek: littleRek.items.map(i => i.name),
  pip: pip.items.map(i => i.name)
};
```

Expected: Each actor now has their Unarmed Strikes plus the new weapons.

- [ ] **Step 2: Arm Yara Denn with Shotgun**

```
Tool: mcp__foundry__foundry_exec_js
script:
const shotgun = game.items.get("cuUh34ylbOTlIPhu").toObject();
delete shotgun._id;
const yara = game.actors.get("CyVsyhMhEMX9mOf7");
await yara.createEmbeddedDocuments("Item", [shotgun]);
return yara.items.map(i => i.name);
```

Expected: Yara's items include "Verathi Shotgun".

---

### Task 4: Create Roll Tables

**Files:** None (Foundry world data only)

Create a RollTable folder for Pale Riders, then create all 4 roll tables with their entries.

- [ ] **Step 1: Create RollTable folder**

```
Tool: mcp__foundry__foundry_create
type: "Folder"
data: {
  "name": "Pale Riders of the Lost Frontier",
  "type": "RollTable"
}
```

Save the returned `_id` as `TABLE_FOLDER_ID`.

- [ ] **Step 2: Create "Chaos of Battle" table (d10)**

```
Tool: mcp__foundry__foundry_exec_js
script:
const folder = "TABLE_FOLDER_ID";
const table = await RollTable.create({
  name: "Chaos of Battle",
  description: "<p>Roll at the start of each round after Round 1. GM can also spend 1 Threat to roll as a free action. Represents the chaotic, unpredictable nature of a frontier gunfight.</p>",
  formula: "1d10",
  replacement: true,
  displayRoll: true,
  folder: folder
});
await table.createEmbeddedDocuments("TableResult", [
  { type: "text", range: [1, 1], name: "Stray shot hits a fuel line", description: "<p><strong>Fire breaks out</strong> in the zone where the last attack missed. Fire Zone rules apply — 2 damage to anyone in the zone at end of round (Fitness + Security Diff 1 to avoid). Roll on Fire Spread table each subsequent round.</p>" },
  { type: "text", range: [2, 2], name: "Runners panic", description: "<p>If the corrals haven't been opened, the runners <strong>kick through the fencing</strong>. Stampede through a random adjacent zone — everyone in that zone rolls <strong>Fitness + Security Diff 1</strong> or takes <strong>3 damage and is knocked prone</strong>.</p>" },
  { type: "text", range: [3, 3], name: "Dust devil", description: "<p>A whirlwind crosses the approach road. <strong>+1 Difficulty to all ranged attacks this round.</strong> Applies to both sides.</p>" },
  { type: "text", range: [4, 4], name: "Water tank groans", description: "<p>A tank support buckles ominously. The <strong>next hit on anything in the water tank zone</strong> breaches a tank — apply Complication <em>'Flooding'</em> to that zone.</p>" },
  { type: "text", range: [5, 5], name: "Pip breaks", description: "<p>If Pip hasn't been dealt with yet, he <strong>throws his gun away and runs toward the farmhouse screaming</strong>. Any PC can grab him as a Minor Action. Healer can talk him down (Presence + Command, Diff 1). <em>If already dealt with, reroll.</em></p>" },
  { type: "text", range: [6, 6], name: "Little Rek gets reckless", description: "<p>Little Rek <strong>charges the nearest PC</strong> regardless of tactical sense. Fires both pistols (Control 7 + Security 2 — both probably miss). He is now in <strong>melee range</strong> of that PC.</p>" },
  { type: "text", range: [7, 7], name: "Dalton's boys waver", description: "<p>The lowest-stress squad must make a <strong>morale check: Daring + Command, Diff 2</strong>. On failure, they hunker down behind cover and <strong>don't advance this round</strong>.</p>" },
  { type: "text", range: [8, 8], name: "Sev repositions", description: "<p>Sev moves to a <strong>new position on the canyon rim</strong>. Any PC who had line of sight on him loses it. He fires from the new position next round. Move his token.</p>" },
  { type: "text", range: [9, 9], name: "Something shifts underground", description: "<p>Low rumble. Cracks appear near the farmhouse. <strong>Pre-war ordnance is destabilising.</strong> If nobody stabilises it (<strong>Reason + Engineering, Diff 2</strong> as a Task action), it <strong>detonates in 2 rounds</strong> — roll on Pre-War Ordnance Wild Card table, hitting canyon rim AND water tank zone.</p>" },
  { type: "text", range: [10, 10], name: "Reinforcements on the horizon", description: "<p>Dust cloud on the approach road. <strong>2 more riders arriving in 2 rounds.</strong> OR — if the crew earned Marta's trust in Session 1 — it's <strong>Marta on a runner with a rifle and Doc Lenn with a medical bag</strong>. GM's choice based on the fiction.</p>" }
]);
return { id: table.id, name: table.name, results: table.results.size };
```

Replace `TABLE_FOLDER_ID` with actual ID from Step 1.

Expected: `{ id: "...", name: "Chaos of Battle", results: 10 }`

- [ ] **Step 3: Create "Sev Takes Command" table (d6)**

```
Tool: mcp__foundry__foundry_exec_js
script:
const folder = "TABLE_FOLDER_ID";
const table = await RollTable.create({
  name: "Sev Takes Command",
  description: "<p>Replaces 'Chaos of Battle' when Rek Dalton is defeated, flees, or is talked down. Sev takes command and the remaining forces fight smart.</p>",
  formula: "1d6",
  replacement: true,
  displayRoll: true,
  folder: folder
});
await table.createEmbeddedDocuments("TableResult", [
  { type: "text", range: [1, 1], name: "\"Covering fire!\"", description: "<p>Remaining squad(s) <strong>suppress one zone</strong>. Any PC acting in that zone this round: <strong>+1 Difficulty to all Tasks</strong>.</p>" },
  { type: "text", range: [2, 2], name: "\"Flank left!\"", description: "<p>A squad moves to the <strong>corral zone, bypassing the approach road</strong> entirely. If the corrals are on fire, they go through the fire (take damage but arrive).</p>" },
  { type: "text", range: [3, 3], name: "\"Breach the farmhouse!\"", description: "<p>All remaining forces <strong>focus on the farmhouse</strong>. Any attack against the farmhouse door this round gets <strong>+1d20</strong>.</p>" },
  { type: "text", range: [4, 4], name: "\"Take the high ground!\"", description: "<p>If Sev's flankers are down, Sev orders a squad to <strong>scale the canyon rim</strong>. They arrive in 1 round. If they succeed, Dalton's side holds both the rim and the road.</p>" },
  { type: "text", range: [5, 5], name: "\"Burn it.\"", description: "<p>Sev orders <strong>incendiary shots</strong> at the corrals or farmhouse. A zone catches fire (GM picks whichever is more dramatic). Apply Fire Zone rules.</p>" },
  { type: "text", range: [6, 6], name: "\"I'll handle this myself.\"", description: "<p>Sev moves to <strong>engage the most dangerous PC directly</strong>. He fights smart — uses cover, repositions, targets whoever is directing the defence. This is a personal duel.</p>" }
]);
return { id: table.id, name: table.name, results: table.results.size };
```

Expected: `{ id: "...", name: "Sev Takes Command", results: 6 }`

- [ ] **Step 4: Create "Fire Spread" table (d6)**

```
Tool: mcp__foundry__foundry_exec_js
script:
const folder = "TABLE_FOLDER_ID";
const table = await RollTable.create({
  name: "Fire Spread",
  description: "<p>Roll at the end of each round for each active Fire Zone. Fire Zone rules: anyone starting/ending turn in zone takes 2 damage (Fitness + Security Diff 1 to avoid). Fire destroys terrain walls (fencing burns away). Fire creates smoke (+1 Diff ranged attacks through smoke, stacks). Fire can be extinguished: Fitness + Engineering, Diff 2, costs a Task action.</p>",
  formula: "1d6",
  replacement: true,
  displayRoll: true,
  folder: folder
});
await table.createEmbeddedDocuments("TableResult", [
  { type: "text", range: [1, 2], name: "Contained", description: "<p>Fire stays in current zone. Anyone in the zone: <strong>2 damage</strong> at end of round (avoid with <strong>Fitness + Security Diff 1</strong>).</p>", weight: 2 },
  { type: "text", range: [3, 4], name: "Spreading", description: "<p>Fire expands to <strong>one adjacent zone</strong> (GM picks most dramatic). Both zones are now Fire Zones.</p>", weight: 2 },
  { type: "text", range: [5, 5], name: "Smoke", description: "<p>Fire doesn't spread but produces <strong>thick smoke</strong>. <strong>+1 Difficulty</strong> to ranged attacks into or out of the zone. Stacks with existing smoke.</p>" },
  { type: "text", range: [6, 6], name: "Explosion", description: "<p>Something combustible catches. <strong>4 damage, Area</strong>, to everyone in the zone. Then fire is <strong>contained</strong> (burned through its fuel).</p>" }
]);
return { id: table.id, name: table.name, results: table.results.size };
```

Expected: `{ id: "...", name: "Fire Spread", results: 4 }` (4 entries, weighted ranges covering 1-6)

- [ ] **Step 5: Create "Pre-War Ordnance Wild Card" table (d6)**

```
Tool: mcp__foundry__foundry_exec_js
script:
const folder = "TABLE_FOLDER_ID";
const table = await RollTable.create({
  name: "Pre-War Ordnance Wild Card",
  description: "<p>Rolled only when pre-war ordnance is triggered — either deliberately by the crew (Prep #6) or by the 'Something shifts underground' event on the Chaos of Battle table. Nobody fully controls this.</p>",
  formula: "1d6",
  replacement: true,
  displayRoll: true,
  folder: folder
});
await table.createEmbeddedDocuments("TableResult", [
  { type: "text", range: [1, 1], name: "Dud", description: "<p><strong>Fizzle.</strong> Nothing happens. The tension was the point.</p>" },
  { type: "text", range: [2, 2], name: "Controlled blast", description: "<p>Canyon rim collapses in the <strong>targeted area only</strong>. <strong>5 damage, Piercing 1</strong>, to anyone on that section of the rim. Sev's flanking position is destroyed.</p>" },
  { type: "text", range: [3, 3], name: "Cascade — canyon slide", description: "<p>Larger collapse. The <strong>canyon rim zone is destroyed entirely</strong>. Anyone on it: <strong>5 damage + knocked to ground level</strong>. The rim is no longer accessible for the rest of the fight.</p>" },
  { type: "text", range: [4, 4], name: "Shockwave", description: "<p>Blast sends a shockwave across the <strong>entire battlefield</strong>. Everyone (all zones) rolls <strong>Fitness + Security Diff 1 or is knocked prone</strong>. Runners stampede automatically if corrals are intact.</p>" },
  { type: "text", range: [5, 5], name: "Subspace flare", description: "<p>The ordnance was subspace-charged. A <strong>dimensional scar activates</strong>. All energy weapons (including phasers) are <strong>offline for 2 rounds</strong>. Verathi chemical weapons are unaffected.</p>" },
  { type: "text", range: [6, 6], name: "The ground opens", description: "<p>A <strong>fissure opens</strong> between the approach road and the farmhouse. 3-metre gap. Squads must find another route (corrals or canyon rim). <strong>Buys defenders 1-2 rounds.</strong></p>" }
]);
return { id: table.id, name: table.name, results: table.results.size };
```

Expected: `{ id: "...", name: "Pre-War Ordnance Wild Card", results: 6 }`

- [ ] **Step 6: Verify all roll tables**

```
Tool: mcp__foundry__foundry_exec_js
script:
return game.tables.filter(t => t.folder?.id === "TABLE_FOLDER_ID").map(t => ({ id: t.id, name: t.name, formula: t.formula, results: t.results.size }));
```

Expected: 4 tables — Chaos of Battle (10 results), Sev Takes Command (6), Fire Spread (4), Pre-War Ordnance Wild Card (6).

---

### Task 5: Configure Scene — Walls

**Files:** None (Foundry world data only)

Add all wall segments to the battlemap scene. Walls use the `c` field: `[x1, y1, x2, y2]`.

Wall property reference:
- Full wall (blocks everything): `move: 20, sight: 20, light: 20, sound: 20`
- Window (blocks movement, allows sight): `move: 20, sight: 0, light: 0, sound: 0`
- Door: add `door: 1, ds: 0` (closed door)
- Fence/cover: `move: 20, sight: 0, light: 0, sound: 0`

- [ ] **Step 1: Add farmhouse walls**

```
Tool: mcp__foundry__foundry_exec_js
script:
const scene = game.scenes.get("kUynRZA8CNuYNpYF");
const full = { move: 20, sight: 20, light: 20, sound: 20 };
const window = { move: 20, sight: 0, light: 0, sound: 0 };
const door = { move: 20, sight: 20, light: 20, sound: 20, door: 1, ds: 0 };

await scene.createEmbeddedDocuments("Wall", [
  // North wall — west section
  { c: [850, 650, 950, 650], ...full },
  // North wall — window
  { c: [950, 650, 1050, 650], ...window },
  // North wall — east section
  { c: [1050, 650, 1200, 650], ...full },

  // East wall — north section
  { c: [1200, 650, 1200, 800], ...full },
  // East wall — door
  { c: [1200, 800, 1200, 850], ...door },
  // East wall — south section
  { c: [1200, 850, 1200, 1000], ...full },

  // South wall — west section
  { c: [850, 1000, 950, 1000], ...full },
  // South wall — porch door
  { c: [950, 1000, 1100, 1000], ...door },
  // South wall — east section
  { c: [1100, 1000, 1200, 1000], ...full },

  // West wall — north section
  { c: [850, 650, 850, 750], ...full },
  // West wall — window
  { c: [850, 750, 850, 850], ...window },
  // West wall — south section
  { c: [850, 850, 850, 1000], ...full }
]);

return scene.walls.size;
```

Expected: 12 wall segments created.

- [ ] **Step 2: Add corral fencing**

```
Tool: mcp__foundry__foundry_exec_js
script:
const scene = game.scenes.get("kUynRZA8CNuYNpYF");
const fence = { move: 20, sight: 0, light: 0, sound: 0 };
const gate = { move: 20, sight: 0, light: 0, sound: 0, door: 1, ds: 0 };

await scene.createEmbeddedDocuments("Wall", [
  // North fence
  { c: [200, 1200, 550, 1200], ...fence },
  // East fence
  { c: [550, 1200, 550, 1550], ...fence },
  // South fence — west section
  { c: [200, 1550, 350, 1550], ...fence },
  // South fence — gate
  { c: [350, 1550, 400, 1550], ...gate },
  // South fence — east section
  { c: [400, 1550, 550, 1550], ...fence },
  // West fence
  { c: [200, 1200, 200, 1550], ...fence }
]);

return scene.walls.size;
```

Expected: 18 total walls (12 farmhouse + 6 corral).

- [ ] **Step 3: Add water tank supports and cover rocks**

```
Tool: mcp__foundry__foundry_exec_js
script:
const scene = game.scenes.get("kUynRZA8CNuYNpYF");
const cover = { move: 20, sight: 0, light: 0, sound: 0 };

await scene.createEmbeddedDocuments("Wall", [
  // Water tank 1 supports (centre ~500, 400)
  { c: [475, 375, 525, 375], ...cover },
  { c: [475, 425, 525, 425], ...cover },
  { c: [475, 375, 475, 425], ...cover },
  { c: [525, 375, 525, 425], ...cover },

  // Water tank 2 supports (centre ~700, 400)
  { c: [675, 375, 725, 375], ...cover },
  { c: [675, 425, 725, 425], ...cover },
  { c: [675, 375, 675, 425], ...cover },
  { c: [725, 375, 725, 425], ...cover },

  // Cover rocks — east side
  { c: [1475, 825, 1525, 875], ...cover },
  { c: [1675, 1075, 1725, 1125], ...cover },
  { c: [1575, 1375, 1625, 1425], ...cover },

  // Cover rocks — south-west
  { c: [475, 1025, 525, 1075], ...cover },

  // Cover rocks — north-east
  { c: [1675, 375, 1725, 425], ...cover },

  // Canyon rim edge (ethereal — marks elevation, blocks nothing)
  { c: [0, 250, 2000, 250], move: 0, sight: 0, light: 0, sound: 0 }
]);

return scene.walls.size;
```

Expected: 32 total walls.

- [ ] **Step 4: Verify all walls**

```
Tool: mcp__foundry__foundry_exec_js
script:
const scene = game.scenes.get("kUynRZA8CNuYNpYF");
return { totalWalls: scene.walls.size, walls: scene.walls.map(w => ({ c: w.c, door: w.door, move: w.move, sight: w.sight })) };
```

Expected: 32 walls total — 12 farmhouse (including 2 doors, 2 windows), 6 corral (including 1 gate), 8 tank supports, 5 cover rocks, 1 canyon rim edge.

---

### Task 6: Configure Scene — Regions

**Files:** None (Foundry world data only)

Create 5 scene regions for the combat zones. Each region uses a rectangular polygon shape with a coloured overlay.

- [ ] **Step 1: Determine the correct region shape format**

```
Tool: mcp__foundry__foundry_exec_js
script:
// Check what shape types are available in v13
const cls = foundry.documents.BaseRegion;
const shapesField = cls.schema.fields.shapes;
return {
  shapesType: shapesField.constructor.name,
  elementType: shapesField.element?.constructor?.name,
  // Check for shape document types
  shapeTypes: CONFIG.Region?.shapeTypes || "not found"
};
```

Use this result to confirm the shape format before creating regions.

- [ ] **Step 2: Create all 5 zone regions**

Based on the shape format discovered in Step 1, create regions. The expected format for a rectangular region uses polygon points as a flat array `[x1,y1, x2,y2, x3,y3, x4,y4]`.

```
Tool: mcp__foundry__foundry_exec_js
script:
const scene = game.scenes.get("kUynRZA8CNuYNpYF");

// Try creating a test region to confirm the data format
const regions = await scene.createEmbeddedDocuments("Region", [
  {
    name: "The Farmhouse",
    color: "#2244aa",
    visibility: 0,
    shapes: [{ type: "rectangle", x: 800, y: 600, width: 450, height: 450, rotation: 0 }]
  },
  {
    name: "The Water Tanks",
    color: "#22aacc",
    visibility: 0,
    shapes: [{ type: "rectangle", x: 350, y: 250, width: 400, height: 350, rotation: 0 }]
  },
  {
    name: "The Runner Corrals",
    color: "#44aa22",
    visibility: 0,
    shapes: [{ type: "rectangle", x: 100, y: 1150, width: 500, height: 450, rotation: 0 }]
  },
  {
    name: "The Approach Road",
    color: "#cc6622",
    visibility: 0,
    shapes: [{ type: "rectangle", x: 200, y: 1600, width: 1600, height: 400, rotation: 0 }]
  },
  {
    name: "The Canyon Rim",
    color: "#aa2222",
    visibility: 0,
    shapes: [{ type: "rectangle", x: 0, y: 0, width: 2000, height: 250, rotation: 0 }]
  }
]);

return regions.map(r => ({ name: r.name, color: r.color }));
```

If the `rectangle` shape type doesn't work, fall back to polygon format:
```js
shapes: [{ type: "polygon", points: [x1,y1, x2,y1, x2,y2, x1,y2] }]
```

For example, The Farmhouse as polygon: `points: [800,600, 1250,600, 1250,1050, 800,1050]`

- [ ] **Step 3: Verify regions**

```
Tool: mcp__foundry__foundry_exec_js
script:
const scene = game.scenes.get("kUynRZA8CNuYNpYF");
return scene.regions.map(r => ({ name: r.name, color: r.color, shapes: r.shapes.size }));
```

Expected: 5 regions — The Farmhouse (blue), The Water Tanks (cyan), The Runner Corrals (green), The Approach Road (orange), The Canyon Rim (red).

---

### Task 7: Configure Scene — Lighting

**Files:** None (Foundry world data only)

Update the scene's global lighting for the warm golden two-sun High Noon feel.

- [ ] **Step 1: Update global light settings**

```
Tool: mcp__foundry__foundry_update
type: "Scene"
id: "kUynRZA8CNuYNpYF"
data: {
  "environment": {
    "globalLight": {
      "enabled": true,
      "bright": true,
      "alpha": 1,
      "luminosity": 0.6,
      "color": "#ffcc66",
      "coloration": 1,
      "saturation": 0.15,
      "contrast": 0.1,
      "shadows": 0.2
    },
    "darknessLevel": 0,
    "darknessLock": true
  },
  "fog": {
    "exploration": false
  },
  "tokenVision": false
}
```

- [ ] **Step 2: Verify lighting**

```
Tool: mcp__foundry__foundry_exec_js
script:
const scene = game.scenes.get("kUynRZA8CNuYNpYF");
return {
  globalLight: scene.environment.globalLight,
  darkness: scene.environment.darknessLevel,
  fog: scene.fog.exploration,
  tokenVision: scene.tokenVision
};
```

Expected: Global light enabled with warm tint `#ffcc66`, darkness 0, fog exploration false, token vision false.

---

### Task 8: Configure Scene — Tokens

**Files:** None (Foundry world data only)

Place all NPC and ally tokens at their starting positions. The scene already has Rek Dalton and Marshal Cade tokens — update their positions, then add the rest.

- [ ] **Step 1: Update existing token positions**

```
Tool: mcp__foundry__foundry_exec_js
script:
const scene = game.scenes.get("kUynRZA8CNuYNpYF");
await scene.updateEmbeddedDocuments("Token", [
  { _id: "UjrERMPx5rFOd4tg", x: 1000, y: 1900 },
  { _id: "hZpSBbTb6gXE9vUS", x: 1000, y: 1050 }
]);
return scene.tokens.map(t => ({ name: t.name, x: t.x, y: t.y }));
```

Expected: Rek Dalton at (1000, 1900), Marshal Cade at (1000, 1050).

- [ ] **Step 2: Add Sev Dalton token**

```
Tool: mcp__foundry__foundry_exec_js
script:
const scene = game.scenes.get("kUynRZA8CNuYNpYF");
const actor = game.actors.get("0tDQoIj2o5VQNdgX");
const tokenData = await actor.getTokenDocument();
await scene.createEmbeddedDocuments("Token", [{
  ...tokenData.toObject(),
  x: 1600, y: 100,
  actorId: actor.id
}]);
return "Sev placed";
```

- [ ] **Step 3: Add Little Rek, Pip, Squad A, Squad B, Flankers tokens**

```
Tool: mcp__foundry__foundry_exec_js
script:
const scene = game.scenes.get("kUynRZA8CNuYNpYF");
const placements = [
  { actorId: "XkXWtubqfvyB32pQ", x: 800, y: 1700 },
  { actorId: "qwb6dZvVYJHZmOuI", x: 1200, y: 1800 }
];

const tokenDocs = [];
for (const p of placements) {
  const actor = game.actors.get(p.actorId);
  const td = await actor.getTokenDocument();
  const obj = td.toObject();
  obj.x = p.x;
  obj.y = p.y;
  obj.actorId = p.actorId;
  tokenDocs.push(obj);
}
await scene.createEmbeddedDocuments("Token", tokenDocs);
return "Little Rek and Pip placed";
```

- [ ] **Step 4: Add squad and flanker tokens**

The squad actors were created in Task 2. Use their saved IDs.

```
Tool: mcp__foundry__foundry_exec_js
script:
const scene = game.scenes.get("kUynRZA8CNuYNpYF");
const placements = [
  { actorId: "SQUAD_A_ID", x: 500, y: 1850 },
  { actorId: "SQUAD_B_ID", x: 1500, y: 1850 },
  { actorId: "FLANKERS_ID", x: 1700, y: 100 }
];

const tokenDocs = [];
for (const p of placements) {
  const actor = game.actors.get(p.actorId);
  const td = await actor.getTokenDocument();
  const obj = td.toObject();
  obj.x = p.x;
  obj.y = p.y;
  obj.actorId = p.actorId;
  tokenDocs.push(obj);
}
await scene.createEmbeddedDocuments("Token", tokenDocs);
return "Squads and flankers placed";
```

Replace `SQUAD_A_ID`, `SQUAD_B_ID`, `FLANKERS_ID` with actual IDs from Task 2.

- [ ] **Step 5: Add Yara and Tomas tokens inside the farmhouse**

```
Tool: mcp__foundry__foundry_exec_js
script:
const scene = game.scenes.get("kUynRZA8CNuYNpYF");
const placements = [
  { actorId: "CyVsyhMhEMX9mOf7", x: 1000, y: 800 },
  { actorId: "ZRArNZ4swx32OirC", x: 950, y: 850 }
];

const tokenDocs = [];
for (const p of placements) {
  const actor = game.actors.get(p.actorId);
  const td = await actor.getTokenDocument();
  const obj = td.toObject();
  obj.x = p.x;
  obj.y = p.y;
  obj.actorId = p.actorId;
  tokenDocs.push(obj);
}
await scene.createEmbeddedDocuments("Token", tokenDocs);
return "Yara and Tomas placed";
```

- [ ] **Step 6: Verify all tokens**

```
Tool: mcp__foundry__foundry_exec_js
script:
const scene = game.scenes.get("kUynRZA8CNuYNpYF");
return scene.tokens.map(t => ({ name: t.name, x: t.x, y: t.y, actorId: t.actorId }));
```

Expected: 10 tokens total:
- Rek Dalton (1000, 1900)
- Sev Dalton (1600, 100)
- Little Rek Dalton (800, 1700)
- Pip Dalton (1200, 1800)
- Dalton Riders A (500, 1850)
- Dalton Riders B (1500, 1850)
- Sev's Flankers (1700, 100)
- Marshal Cade (1000, 1050)
- Yara Denn (1000, 800)
- Tomas Saal (950, 850)

---

### Task 9: Create GM Combat Guide Journal

**Files:** None (Foundry world data only)

Create a multi-page journal entry with the complete GM combat guide.

- [ ] **Step 1: Create the journal entry**

```
Tool: mcp__foundry__foundry_create
type: "JournalEntry"
data: {
  "name": "High Noon — GM Combat Guide",
  "folder": "UfOVXnBgH7wW7MYJ"
}
```

Save the returned `_id` as `JOURNAL_ID`.

- [ ] **Step 2: Add Page 1 — Overview & Victory Conditions**

```
Tool: mcp__foundry__foundry_exec_js
script:
const journal = game.journal.get("JOURNAL_ID");
await journal.createEmbeddedDocuments("JournalEntryPage", [{
  name: "Overview & Victory Conditions",
  type: "text",
  sort: 100000,
  text: {
    content: `<div style="font-family: Georgia, serif; padding: 1em; line-height: 1.7;">

<h2>High Noon at Yara's Ranch</h2>

<p><strong>Session 2 — Ground Combat Encounter</strong></p>

<p>Rek Dalton brings 16 people to take Yara's ranch by force at noon. The crew defends the ranch using Verathi weapons, limited phaser shots, and whatever defences they prepared during the morning.</p>

<h3>Forces</h3>
<ul>
<li><strong>Rek Dalton</strong> (Minor) — commands from the rear, doesn't fight</li>
<li><strong>Sev Dalton</strong> (Notable) — flanking sniper on canyon rim</li>
<li><strong>Little Rek Dalton</strong> (Minor) — reckless charger, two pistols</li>
<li><strong>Pip Dalton</strong> (Minor) — scared kid, can be talked down</li>
<li><strong>Dalton Riders Squad A</strong> (Notable, Stress 12) — 6 riders</li>
<li><strong>Dalton Riders Squad B</strong> (Notable, Stress 12) — 6 riders</li>
<li><strong>Sev's Flankers</strong> (Notable, Stress 8) — 2 riders on canyon rim</li>
</ul>

<h3>Allies</h3>
<ul>
<li><strong>Marshal Cade</strong> — active combatant, Long Pistol + Long Rifle</li>
<li><strong>Yara Denn</strong> — inside farmhouse, shotgun as last resort</li>
<li><strong>Tomas Saal</strong> — inside farmhouse, non-combatant (the stakes)</li>
</ul>

<h3>Starting Threat: 4</h3>

<h3>Victory Conditions</h3>
<ul>
<li><strong>Combat:</strong> Dalton surrenders or flees. Hired hands break when he's down.</li>
<li><strong>Negotiation:</strong> T'Karra talks Dalton down — Presence + Command, Diff 3 (-1 if water monopoly broken).</li>
<li><strong>Engineering:</strong> Brex finds a new aquifer — Extended Task, 6-box, Diff 2. Complete before the fight = Dalton's leverage evaporates.</li>
</ul>

<h3>Phaser Budget</h3>
<p>2 working Type-2 Phasers, <strong>3 shots each</strong> (6 total). Each shot: 5 damage, Charge. <strong>+1 Threat per shot</strong> ("advanced weapons witnessed"). After 6th shot total, power cells are dead.</p>

</div>`
  }
}]);
return "Page 1 created";
```

Replace `JOURNAL_ID` with actual ID from Step 1.

- [ ] **Step 3: Add Page 2 — Preparation Phase**

```
Tool: mcp__foundry__foundry_exec_js
script:
const journal = game.journal.get("JOURNAL_ID");
await journal.createEmbeddedDocuments("JournalEntryPage", [{
  name: "Preparation Phase",
  type: "text",
  sort: 200000,
  text: {
    content: `<div style="font-family: Georgia, serif; padding: 1em; line-height: 1.7;">

<h2>The Morning Before Noon</h2>

<p>The crew has the morning to scout the ranch. Match player intent to the closest discovery below. Split crew = 4-5 preps possible. Together = 2-3. <strong>Conflict:</strong> Fuel dump (#5) destroys water tanks, so you can't flood the road (#2) AND set a fire trap.</p>

<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
<tr style="background: #333; color: #fff;"><th>#</th><th>Discovery</th><th>Who Finds It</th><th>Roll</th><th>Diff</th><th>Combat Effect</th></tr>
<tr><td>1</td><td><strong>Mining Charges in the Barn</strong></td><td>Anyone searching outbuildings</td><td>Insight + Engineering</td><td>1 (find), 2 (rig)</td><td>Buried on approach road. Detonate as Minor Action: 4 dmg, Area, to one squad. One use.</td></tr>
<tr><td>2</td><td><strong>The Aquifer Valve</strong></td><td>Brex / any engineer</td><td>Reason + Engineering</td><td>2</td><td>Flood approach road. +1 Diff to all movement in that zone. Dalton's water monopoly ends.</td></tr>
<tr><td>3</td><td><strong>Corral Release Mechanism</strong></td><td>Thon / anyone scouting</td><td>Insight + Security</td><td>1</td><td>Release runners as Minor Action. Stampede: Fitness + Security Diff 2 or 3 dmg + prone. One use.</td></tr>
<tr><td>4</td><td><strong>Sniper Nest on Roof</strong></td><td>Thon (security sweep)</td><td>Daring + Security</td><td>1</td><td>Roof firing position, heavy cover. +1d20 ranged from roof. Exposed to Sev on canyon rim.</td></tr>
<tr><td>5</td><td><strong>Fuel Dump Behind Tanks</strong></td><td>Brex or Vex</td><td>Reason + Engineering</td><td>2</td><td>Rig fire trap. Creates Fire Zone in water tank area. Destroys tanks — conflicts with #2.</td></tr>
<tr><td>6</td><td><strong>Pre-War Munitions</strong></td><td>Vex (scanning) / climbers</td><td>Reason + Science</td><td>3</td><td>Canyon rim collapse: 5 dmg, Area, Piercing 1. Cascade risk — roll on Wild Card table.</td></tr>
<tr><td>7</td><td><strong>Cellar Barricade</strong></td><td>Anyone talking to Yara</td><td>Presence + Command</td><td>1</td><td>Reinforces cellar. If farmhouse breached, tunnel still protected — extra round to reach it.</td></tr>
<tr><td>8</td><td><strong>Dalton's Approach Route</strong></td><td>Thon or Malevolant</td><td>Fitness + Security</td><td>2</td><td>Crew acts first in Round 1 regardless of initiative.</td></tr>
</table>

</div>`
  }
}]);
return "Page 2 created";
```

- [ ] **Step 4: Add Page 3 — Round-by-Round Guide**

```
Tool: mcp__foundry__foundry_exec_js
script:
const journal = game.journal.get("JOURNAL_ID");
await journal.createEmbeddedDocuments("JournalEntryPage", [{
  name: "Round-by-Round Guide",
  type: "text",
  sort: 300000,
  text: {
    content: `<div style="font-family: Georgia, serif; padding: 1em; line-height: 1.7;">

<h2>Combat Flow</h2>

<h3>The Escalation Trigger</h3>
<p>The fight has <strong>two phases</strong>, keyed to Rek Dalton:</p>
<ul>
<li><strong>Phase 1 (Rek in command):</strong> Dalton's boys are frontier bullies. They shoot wild, advance sloppily, break when things go wrong. Roll on <strong>Chaos of Battle</strong> table each round. The danger is numbers and environmental chaos.</li>
<li><strong>Phase 2 (Sev takes command):</strong> Triggered when Rek is defeated, flees, or is talked down. Replace Chaos of Battle with <strong>Sev Takes Command</strong> table. Remaining forces fight smart — disciplined suppression, flanking, coordinated breaches.</li>
</ul>

<h3>Round 1</h3>
<ul>
<li>If crew prepared #8 (scouted approach route): <strong>crew acts first</strong> regardless of initiative</li>
<li>Dalton's squads advance up the approach road</li>
<li>Sev and flankers are already on the canyon rim</li>
<li>Little Rek is at the front — eager</li>
<li>Rek shouts from the rear: demands surrender</li>
</ul>

<h3>Each Subsequent Round</h3>
<ol>
<li><strong>Start of round:</strong> Roll on Chaos of Battle (or Sev Takes Command)</li>
<li><strong>Actions:</strong> Normal STA 2e combat round</li>
<li><strong>End of round:</strong> Roll Fire Spread for each active Fire Zone</li>
<li><strong>Track:</strong> Detonation countdowns, squad morale (half stress = half scatter)</li>
</ol>

<h3>Endgame Triggers</h3>
<ul>
<li><strong>Rek defeated:</strong> Sev Takes Command begins. Fight gets harder.</li>
<li><strong>Both squads broken:</strong> Named Daltons decide — Sev fights, Little Rek charges, Pip surrenders.</li>
<li><strong>Sev defeated after Rek:</strong> Remaining forces break completely. Combat over.</li>
<li><strong>Farmhouse breached:</strong> Yara fires the shotgun. If attacker survives, Tomas is in danger.</li>
</ul>

</div>`
  }
}]);
return "Page 3 created";
```

- [ ] **Step 5: Add Page 4 — Threat Spend Menu**

```
Tool: mcp__foundry__foundry_exec_js
script:
const journal = game.journal.get("JOURNAL_ID");
await journal.createEmbeddedDocuments("JournalEntryPage", [{
  name: "Threat Spend Menu",
  type: "text",
  sort: 400000,
  text: {
    content: `<div style="font-family: Georgia, serif; padding: 1em; line-height: 1.7;">

<h2>Threat Spends</h2>

<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
<tr style="background: #333; color: #fff;"><th>Cost</th><th>Effect</th></tr>
<tr><td><strong>1</strong></td><td>Roll on Chaos of Battle / Sev Takes Command table</td></tr>
<tr><td><strong>1</strong></td><td>Runner stampede through one zone (if corrals intact)</td></tr>
<tr><td><strong>2</strong></td><td>Water tank breach — Complication "Flooding" in water tank zone</td></tr>
<tr><td><strong>2</strong></td><td>Sev's flanking shot — bonus d20 from canyon rim</td></tr>
<tr><td><strong>2</strong></td><td>Fire breaks out in a zone (GM picks)</td></tr>
<tr><td><strong>3</strong></td><td>Dalton calls reinforcements — 2 more riders arrive in 2 rounds</td></tr>
<tr><td><strong>3</strong></td><td>Sev detonates pre-war ordnance (roll on Wild Card table — he doesn't control it either)</td></tr>
<tr><td><strong>4</strong></td><td>Little Rek reaches farmhouse door — Yara must use shotgun or he's inside</td></tr>
</table>

</div>`
  }
}]);
return "Page 4 created";
```

- [ ] **Step 6: Add Page 5 — Fire Zone Rules**

```
Tool: mcp__foundry__foundry_exec_js
script:
const journal = game.journal.get("JOURNAL_ID");
await journal.createEmbeddedDocuments("JournalEntryPage", [{
  name: "Fire Zone Rules",
  type: "text",
  sort: 500000,
  text: {
    content: `<div style="font-family: Georgia, serif; padding: 1em; line-height: 1.7;">

<h2>Fire Zone Rules</h2>

<p>When a zone becomes a Fire Zone (via fuel dump, stray shot, Sev's "Burn it" order, or ordnance):</p>

<ul>
<li>Anyone starting or ending their turn in the zone: <strong>2 damage</strong> (avoid with Fitness + Security Diff 1)</li>
<li>Roll on <strong>Fire Spread</strong> table at end of each round</li>
<li>Fire <strong>destroys terrain walls</strong> (corral fencing burns away, removing cover)</li>
<li>Fire creates <strong>smoke: +1 Difficulty</strong> to ranged attacks through smoke (stacks)</li>
<li>Fire can be <strong>extinguished:</strong> Fitness + Engineering, Diff 2, costs a Task action</li>
</ul>

<h3>Fire Sources</h3>
<ul>
<li>Chaos of Battle table result 1 (stray shot)</li>
<li>Fuel dump preparation (#5) — detonated deliberately</li>
<li>Sev Takes Command table result 5 ("Burn it")</li>
<li>Pre-war ordnance detonation (secondary fires)</li>
<li>Threat spend (2 Threat)</li>
</ul>

</div>`
  }
}]);
return "Page 5 created";
```

- [ ] **Step 7: Add Page 6 — Victory & Aftermath**

```
Tool: mcp__foundry__foundry_exec_js
script:
const journal = game.journal.get("JOURNAL_ID");
await journal.createEmbeddedDocuments("JournalEntryPage", [{
  name: "Victory & Aftermath",
  type: "text",
  sort: 600000,
  text: {
    content: `<div style="font-family: Georgia, serif; padding: 1em; line-height: 1.7;">

<h2>Victory & Aftermath</h2>

<h3>When Dalton Falls</h3>
<p>However the fight ends — Dalton defeated, fled, or talked down — the immediate aftermath:</p>
<ul>
<li>Remaining hired hands scatter. They were in it for pay, not loyalty.</li>
<li>Sev, if still standing, either fights to the bitter end or retreats tactically (GM choice based on how the fight went).</li>
<li>Little Rek is captured, fled, or unconscious.</li>
<li>Pip has either been talked down (and is now an asset) or fled.</li>
</ul>

<h3>The Transition</h3>
<p>After the fight, Yara shows the crew the tunnel in the cellar. This connects to the bunkers beneath the surface — the transition to the second half of Session 2.</p>

<p><strong>In orbit:</strong> IRW <em>Nightwing</em> decloaks. The clock is ticking. The crew now has two fronts — underground and in space.</p>

<h3>Record</h3>
<ul>
<li>Threat pool at end of combat: ___</li>
<li>Momentum pool: ___</li>
<li>Phaser shots used: ___ / 6</li>
<li>Preparations that fired: ___</li>
<li>Pip's fate: ___</li>
<li>Fire zones active at end: ___</li>
</ul>

</div>`
  }
}]);
return "Page 6 created";
```

- [ ] **Step 8: Verify journal**

```
Tool: mcp__foundry__foundry_exec_js
script:
const journal = game.journal.get("JOURNAL_ID");
return { name: journal.name, pages: journal.pages.map(p => p.name) };
```

Expected: "High Noon — GM Combat Guide" with 6 pages: Overview, Preparation Phase, Round-by-Round Guide, Threat Spend Menu, Fire Zone Rules, Victory & Aftermath.

---

### Task 10: Final Verification

- [ ] **Step 1: Full scene status check**

```
Tool: mcp__foundry__foundry_exec_js
script:
const scene = game.scenes.get("kUynRZA8CNuYNpYF");
return {
  name: scene.name,
  walls: scene.walls.size,
  regions: scene.regions.size,
  tokens: scene.tokens.size,
  tokenNames: scene.tokens.map(t => t.name),
  lighting: {
    globalLight: scene.environment.globalLight.enabled,
    color: scene.environment.globalLight.color,
    darkness: scene.environment.darknessLevel
  }
};
```

Expected:
- 32 walls
- 5 regions
- 10 tokens
- Global light with warm tint
- Darkness 0

- [ ] **Step 2: Verify all Dalton actors are armed**

```
Tool: mcp__foundry__foundry_exec_js
script:
const ids = ["lqXErkDjCPUEEEYR", "0tDQoIj2o5VQNdgX", "XkXWtubqfvyB32pQ", "qwb6dZvVYJHZmOuI"];
return ids.map(id => {
  const a = game.actors.get(id);
  return { name: a.name, weapons: a.items.filter(i => i.type === "characterweapon2e").map(i => i.name) };
});
```

Expected: Each Dalton has their assigned Verathi weapons in addition to Unarmed Strike.

- [ ] **Step 3: Verify roll tables work**

```
Tool: mcp__foundry__foundry_exec_js
script:
const tables = game.tables.contents.filter(t => ["Chaos of Battle", "Sev Takes Command", "Fire Spread", "Pre-War Ordnance Wild Card"].includes(t.name));
const results = [];
for (const t of tables) {
  const roll = await t.roll();
  results.push({ table: t.name, rolled: roll.results[0]?.name || "no result" });
}
return results;
```

Expected: 4 rolls, each returning a valid result name from the table.
