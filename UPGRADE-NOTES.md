# Foundry VTT Module Upgrade Notes

Lessons learned upgrading `sta-compendia` from Foundry v10/v11 → v13, STA system v1 → v2.

## Pack Format: NeDB → LevelDB

Foundry v12+ replaced NeDB (JSON-lines `.db` files) with LevelDB (binary directory-based packs).

### Source File Workflow

The modern workflow uses a `packs/_source/` directory containing individual JSON files per document, which are compiled to LevelDB:

```
packs/_source/<pack-name>/<Document Name>.json   ← editable source
packs/<pack-name>/                                ← compiled LevelDB (do not edit)
```

### The `_key` Field

Every document in a LevelDB pack **must** have a `_key` field. Format: `!<collection>!<document-id>`.

| Pack type     | `_key` prefix | Embedded collections |
|---------------|---------------|----------------------|
| Item          | `!items!`     | — |
| Actor         | `!actors!`    | `!actors.items!<actorId>.<itemId>` |
| JournalEntry  | `!journal!`   | `!journal.pages!<journalId>.<pageId>` |
| RollTable     | `!tables!`    | `!tables.results!<tableId>.<resultId>` |
| Scene         | `!scenes!`    | `!scenes.tokens!`, `!scenes.tiles!`, `!scenes.drawings!`, `!scenes.lights!`, `!scenes.notes!`, `!scenes.sounds!`, `!scenes.templates!`, `!scenes.walls!` |

**Forgetting `_key` on embedded documents** (tokens in scenes, items in actors, pages in journals, results in roll tables) causes the fvtt CLI to throw `Key cannot be null or undefined`.

### module.json Pack Paths

Pack `path` values changed from file references to directory references:

```json
// Old (v10/v11)
"path": "packs/focuses-core.db"

// New (v12+)
"path": "packs/focuses-core"
```

Also remove `"private": false` and `"flags": {}` from pack entries — these are no longer valid fields.

## Critical: LevelDB Binary Compatibility

### The `classic-level` Version Problem

**This is the single biggest gotcha.** The `@foundryvtt/foundryvtt-cli` (v3.0.3 as of this writing) bundles `classic-level@1.4.1`, but Foundry v13.351 uses `classic-level@2.0.0`. These are **binary incompatible** — packs compiled with the CLI will look correct (valid `.ldb` files, correct `MANIFEST`, `CURRENT`, etc.) but Foundry will fail to open them with:

```
LEVEL_DATABASE_NOT_OPEN: Database failed to open
```

### Solution: Compile Using Foundry's Own classic-level

Instead of using the `fvtt` CLI, write a small script that imports `classic-level` from Foundry's `node_modules` and run it from Foundry's installation directory:

```js
import { ClassicLevel } from 'classic-level';
// ... open DB, batch.put(entry._key, JSON.stringify(entry)), batch.write()
```

Run from the Foundry installation directory so the import resolves correctly:

```bash
cp compile-packs.mjs /path/to/foundryvtt/
cd /path/to/foundryvtt/
node compile-packs.mjs
```

See `scripts/compile-with-foundry-level.mjs` (or the inline script used during this upgrade) for a complete working example.

### Cross-Platform Compilation

Even with matching `classic-level` versions, LevelDB databases compiled on macOS ARM will not open on Linux x86_64. **Always compile packs on the target platform**, or use Foundry's own installation to compile.

## Data Field Migration (v9 → v10+)

Foundry v10 renamed two core fields. Some documents may have the old names:

| Old field    | New field    |
|-------------|-------------|
| `data`      | `system`    |
| `permission`| `ownership` |

Check for both and normalize during conversion. This applies to top-level documents **and** embedded items within actors.

## Duplicate Entry Names

NeDB files can contain multiple entries with the same `name` field (e.g., two "Disruptor Pistol" variants). When extracting to individual JSON files named by document name, these will silently overwrite each other.

**Solution:** Track seen names during extraction and append the `_id` as a suffix for duplicates:

```
Disruptor Pistol.json
Disruptor Pistol (N4qypkr0tPzI2BhW).json
```

## macOS AppleDouble Files

When creating tarballs on macOS and extracting on Linux, macOS includes `._filename` resource fork files (AppleDouble format). The `fvtt` CLI and custom scripts will try to parse these as JSON and fail.

**Solution:** Either:
- Use `COPYFILE_DISABLE=1 tar czf ...` on macOS
- Or `find . -name '._*' -delete` after extracting on Linux

## STA System v1 → v2 Changes

### Shared Types (Unchanged)

`talent`, `focus`, `value`, `item`, `injury` — data models are identical between 1e and 2e.

### Personal Weapons: `characterweapon` → `characterweapon2e`

| Change | Details |
|--------|---------|
| `knockdown` quality | Removed |
| `nonlethal` quality | Renamed to `stun` |
| `viciousx` (Number) | Removed |
| `piercingx` (Number) | Changed to Boolean |
| New `severity` field | Number, default 0 |
| New `deadly` quality | Boolean |
| Damage values | Rebalanced (generally +1) |

### Starship Weapons: `starshipweapon` → `starshipweapon2e`

| Change | Details |
|--------|---------|
| Per-scale variants removed | No more "Phaser Bank (Scale 3/4/5/6)" |
| `includescale` field | String: `"energy"` or `"torpedo"` — adds ship's scale to damage |
| `persistentx` (Number) | Changed to `persistent` (Boolean) |
| `piercingx` (Number) | Changed to `piercing` (Boolean) |
| `viciousx` (Number) | Removed |
| New qualities | `depleting`, `jamming`, `slowing`, `cumbersome`, `energy`, `torpedo` |

### Reference Data

The official STA v2 system repo (`mkscho63/sta`, `main` branch) contains YAML source files for all 2e items at `packs/items-2e/`. These are the authoritative reference for field structures and values.

## JavaScript API Changes (v13)

### Dialog → DialogV2

```js
// Old (v10/v11)
let dialog = new Dialog({ title, content, buttons: { ok: { label, callback } } });
dialog.position.width = 500;
dialog.render(true);

// New (v13)
const dialog = new foundry.applications.api.DialogV2({
  window: { title },
  content,
  buttons: [
    { action: "ok", label: "OK", default: true },
    { action: "other", label: "Other", callback: () => { /* ... */ } }
  ],
  position: { width: 500 }
});
dialog.render({ force: true });
```

Key differences:
- Buttons are an **array** (not an object)
- Window title goes in `window: { title }`
- Position is set in the **constructor** (not after instantiation)
- `render()` takes an options object `{ force: true }` instead of a boolean
- No need to call `dialog.close()` in button callbacks — DialogV2 closes automatically

### Removed APIs

- `canvas.dimensions` — no longer accessible in the same way; avoid referencing in startup scripts

## Deployment

### Server Structure

Foundry expects:
```
Data/modules/sta-compendia/
├── module.json
├── module/sta-compendia.js
├── assets/...
└── packs/
    ├── focuses-core/       ← LevelDB files directly here
    │   ├── 000005.ldb
    │   ├── CURRENT
    │   ├── LOCK
    │   ├── LOG
    │   └── MANIFEST-000002
    └── ...
```

### fvtt CLI `--out` Nesting Gotcha

`fvtt package pack "name" --out packs/name/` creates `packs/name/name/` (nested). Use `--out packs/` instead, which creates `packs/name/` correctly.

### Restarting Foundry

If Foundry runs as a different user (e.g., `foundry`) via PM2:
```bash
su - foundry -c "pm2 restart foundry"
```

Running `pm2 restart` as root starts a separate PM2 daemon and won't affect the actual Foundry process.

### File Ownership

After deploying pack files as root, fix ownership:
```bash
chown -R foundry:foundry /path/to/foundrydata/Data/modules/sta-compendia/
```

## Recommended Upgrade Checklist

1. [ ] Extract NeDB `.db` files to `packs/_source/` as individual JSON
2. [ ] Normalize `data` → `system`, `permission` → `ownership`
3. [ ] Handle duplicate entry names in filenames
4. [ ] Add `_key` fields to all documents and embedded collections
5. [ ] Update `_stats.coreVersion` and `_stats.systemVersion`
6. [ ] Create new edition item types if needed (e.g., 2e weapons)
7. [ ] Update `module.json` (compatibility, paths, new packs, remove deprecated fields)
8. [ ] Update JavaScript (Dialog → DialogV2, remove deprecated APIs)
9. [ ] **Compile packs on the target server using Foundry's own `classic-level`**
10. [ ] Verify every compendium opens and shows entries in Foundry
11. [ ] Test drag-and-drop of items onto character sheets
