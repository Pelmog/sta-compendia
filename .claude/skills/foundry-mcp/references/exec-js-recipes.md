# Foundry exec-js Recipes

Common JavaScript patterns for `foundry_exec_js`. All scripts must include a `return` statement to get data back. Requires a GM browser session.

## Introspection

```js
// List all actors
return game.actors.contents.map(a => ({ name: a.name, id: a.id, type: a.type }))

// List actors by type
return game.actors.filter(a => a.type === "character").map(a => ({ name: a.name, id: a.id }))
return game.actors.filter(a => a.type === "starship").map(a => ({ name: a.name, id: a.id, class: a.system.shipclass }))

// Get actor by name
const actor = game.actors.getName("Captain Kirk");
return actor?.toObject();

// Get actor by ID
const actor = game.actors.get("WW37bijK9ETtaNep");
return actor?.toObject();

// List scenes
return game.scenes.contents.map(s => ({ name: s.name, id: s.id, active: s.active }))

// Get active scene
return game.scenes.active?.toObject();

// List all items in world
return game.items.contents.map(i => ({ name: i.name, id: i.id, type: i.type }))
```

## Compendium Browsing

```js
// List all packs for sta-compendia
return game.packs.filter(p => p.metadata.packageName === "sta-compendia")
  .map(p => ({ id: p.collection, label: p.metadata.label, type: p.metadata.type }))

// Browse pack index (fast — metadata only)
const pack = game.packs.get("sta-compendia.general-talents-core");
const index = await pack.getIndex();
return index.contents;

// Get full document from pack
const pack = game.packs.get("sta-compendia.general-talents-core");
const doc = await pack.getDocument("<documentId>");
return doc.toObject();

// Search pack by name
const pack = game.packs.get("sta-compendia.focuses-core");
const index = await pack.getIndex();
return index.filter(i => i.name.toLowerCase().includes("diplomacy"));
```

## Actor Manipulation

```js
// Update stress
const actor = game.actors.get("<ID>");
await actor.update({ "system.stress.value": 5 });
return { name: actor.name, stress: actor.system.stress.value };

// Update shields on a starship
const ship = game.actors.get("<ID>");
await ship.update({ "system.shields.value": 8 });
return { name: ship.name, shields: ship.system.shields.value };

// Read character attributes
const actor = game.actors.get("<ID>");
return {
  attributes: Object.fromEntries(
    Object.entries(actor.system.attributes).map(([k, v]) => [k, v.value])
  ),
  disciplines: Object.fromEntries(
    Object.entries(actor.system.disciplines).map(([k, v]) => [k, v.value])
  ),
};

// Read starship systems
const ship = game.actors.get("<ID>");
return {
  systems: Object.fromEntries(
    Object.entries(ship.system.systems).map(([k, v]) => [k, v.value])
  ),
  departments: Object.fromEntries(
    Object.entries(ship.system.departments).map(([k, v]) => [k, v.value])
  ),
  hull: ship.system.hull,
  shields: ship.system.shields,
};
```

## Embedded Items

```js
// List items on an actor
const actor = game.actors.get("<ID>");
return actor.items.contents.map(i => ({ id: i.id, name: i.name, type: i.type }));

// Add items to an actor (batch)
const actor = game.actors.get("<ID>");
const created = await actor.createEmbeddedDocuments("Item", [
  {
    name: "Diplomacy",
    type: "focus",
    img: "systems/sta/assets/icons/focus.webp",
    system: { description: "Skilled in diplomatic negotiations." }
  },
  {
    name: "Bold: Command",
    type: "talent",
    img: "systems/sta/assets/icons/talent.webp",
    system: { description: "Whenever you attempt a Task with Command..." }
  }
]);
return created.map(i => ({ id: i.id, name: i.name, type: i.type }));

// Remove items from an actor
const actor = game.actors.get("<ID>");
await actor.deleteEmbeddedDocuments("Item", ["<itemId1>", "<itemId2>"]);
return "Deleted";

// Import from compendium to actor
const pack = game.packs.get("sta-compendia.general-talents-core");
const doc = await pack.getDocument("<talentId>");
const actor = game.actors.get("<actorId>");
const [created] = await actor.createEmbeddedDocuments("Item", [doc.toObject()]);
return { id: created.id, name: created.name };
```

## Chat and Rolls

```js
// Simple chat message
await ChatMessage.create({ content: "The ship shudders as it drops out of warp." });

// Chat as a specific actor
const actor = game.actors.get("<ID>");
await ChatMessage.create({
  content: "Hail them.",
  speaker: ChatMessage.getSpeaker({actor})
});

// Task roll via STARoll (see sta-dice skill for full recipes)
const actor = game.actors.get("<ID>");
const roll = new STARoll();
await roll.rollTask({
  speakerName: actor.name,
  speakerId: actor.id,
  selectedAttribute: "presence",
  selectedAttributeValue: actor.system.attributes.presence.value,
  selectedDiscipline: "command",
  selectedDisciplineValue: actor.system.disciplines.command.value,
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

// Challenge roll (damage dice)
await new STARoll().performChallengeRoll({ dicePool: 4, challengeName: "Phaser Banks" });
```

## World Info

```js
// System and world info
return {
  world: game.world.title,
  system: game.system.id,
  systemVersion: game.system.version,
  foundryVersion: game.version,
  users: game.users.contents.map(u => ({ name: u.name, role: u.role, active: u.active })),
};

// List enabled modules
return game.modules.filter(m => m.active).map(m => ({ id: m.id, title: m.title }));

// Game settings
return game.settings.get("core", "rollMode");  // "publicroll" | "gmroll" | "blindroll" | "selfroll"
```

## STA Global Discovery

```js
// Find STA-related globals
return Object.entries(globalThis)
  .filter(([k,v]) => typeof v === 'function' && k.toLowerCase().includes('sta'))
  .map(([k]) => k);
// Returns: ["STARoll"]

// Inspect STARoll methods
return Object.getOwnPropertyNames(STARoll.prototype).sort();

// Get method source code
return new STARoll().rollTask.toString().substring(0, 3000);
```
