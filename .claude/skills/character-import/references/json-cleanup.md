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

The cleaned JSON must be serialized inline in the exec-js script:

```js
const data = <PASTE_CLEANED_JSON_HERE>;
// Strip residual _id from items
if (data.items) data.items.forEach(i => { delete i._id; delete i._stats; delete i.ownership; });
delete data._id; delete data._stats; delete data.ownership;
// Coerce string values to numbers
for (const [k, a] of Object.entries(data.system?.attributes || {})) {
  if (typeof a.value === 'string') a.value = parseInt(a.value, 10);
}
for (const [k, d] of Object.entries(data.system?.disciplines || {})) {
  if (typeof d.value === 'string') d.value = parseInt(d.value, 10);
}
const actor = await Actor.create(data);
return { id: actor.id, name: actor.name, itemCount: actor.items.size, items: actor.items.contents.map(i => ({ name: i.name, type: i.type })) };
```
