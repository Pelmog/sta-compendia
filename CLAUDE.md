# sta-compendia

Foundry VTT module providing compendium packs for the Star Trek Adventures (STA) system.

## Project Structure

```
module.json              # Module manifest (compatibility, pack definitions)
module/sta-compendia.js  # Startup script (legal popup dialog)
module/credits.html      # Legal/credits HTML shown in popup
packs/_source/           # Source JSON files for each compendium pack
packs/<pack-name>/       # Compiled LevelDB packs (do not edit directly)
assets/                  # Icons, maps, ship tokens
scripts/                 # Build/conversion utilities
```

## Development Workflow

### Prerequisites
- Node.js
- `@foundryvtt/foundryvtt-cli` (`npm install -g @foundryvtt/foundryvtt-cli`)

### Editing Pack Data
1. Edit JSON files in `packs/_source/<pack-name>/`
2. Each file is one compendium entry, named by document name
3. Every entry needs a `_key` field (format: `!<collection>!<id>`)
4. Recompile after editing:
   ```bash
   fvtt package pack "<pack-name>" --type Module \
     --in packs/_source/<pack-name>/ \
     --out packs/<pack-name>/
   ```

### Adding New Pack Entries
- Generate a 16-character alphanumeric `_id`
- Set `_key` to `!<collection>!<id>` (e.g., `!items!abc123`)
- Match the `system` field structure to the STA system data model for that item type

### Key Prefixes by Pack Type
| Pack type    | `_key` prefix |
|-------------|---------------|
| Item        | `!items!`     |
| Actor       | `!actors!`    |
| JournalEntry| `!journal!`   |
| RollTable   | `!tables!`    |
| Scene       | `!scenes!`    |

### Recompiling All Packs
```bash
for pack in packs/_source/*/; do
  name=$(basename "$pack")
  fvtt package pack "$name" --type Module \
    --in "packs/_source/$name/" --out "packs/$name/"
done
```

## Foundry MCP Server (Primary)

Managed by the `foundry-mcp` Claude Code skill (`.claude/skills/foundry-mcp/`). Direct socket connection to a live Foundry VTT world via 15 MCP tools (`mcp__foundry__*`).

```bash
# Quick operations via MCP tools
foundry_status                          # Check connection
foundry_list type: "Actor"              # List actors
foundry_exec_js script: "return ..."    # Run JS in Foundry browser
```

See also: `sta-dice` skill (`.claude/skills/sta-dice/`) for STA dice rolling recipes via `STARoll`.
See also: `character-import` skill (`.claude/skills/character-import/`) for importing player characters from JSON, bcholmes.org URLs, or plain-text specs.
See also: `lazy-session-prep` skill (`.claude/skills/lazy-session-prep/`) for structured session preparation using the Lazy Dungeon Master checklist, adapted for STA 2e.
See also: `foundry-audio` skill (`.claude/skills/foundry-audio/`) for generating voice audio with ElevenLabs TTS and deploying to Foundry VTT playlists.
See also: `session-narrative` skill (`.claude/skills/session-narrative/`) for converting session transcripts into fictional narrative chapters using an agent team.

## Foundry REST API (Legacy)

Managed by the `foundry-api` Claude Code skill (`.claude/skills/foundry-api/`). Uses the foundryvtt-rest-api relay (external dependency). Superseded by the MCP server above.

- **Client library**: `scripts/foundry-api.mjs` — `FoundryAPI` class covering all 45 endpoints
- **CLI wrapper**: `scripts/foundry-cli.mjs` — command-line access to all operations
- **Config**: `.env` file in project root with `FOUNDRY_API` key (gitignored)
- **Relay URL**: `https://foundryvtt-rest-api-relay.fly.dev/`

```bash
# Quick test
node scripts/foundry-cli.mjs status
node scripts/foundry-cli.mjs clients
node scripts/foundry-cli.mjs exec-js "return game.actors.contents.map(a => a.name)"
```

### Code Intelligence

Prefer LSP over Grep/Glob/Read for code navigation:
- `goToDefinition` / `goToImplementation` to jump to source
- `findReferences` to see all usages across the codebase
- `workspaceSymbol` to find where something is defined
- `documentSymbol` to list all symbols in a file
- `hover` for type info without reading the file
- `incomingCalls` / `outgoingCalls` for call hierarchy

Before renaming or changing a function signature, use
`findReferences` to find all call sites first.

Use Grep/Glob only for text/pattern searches (comments,
strings, config values) where LSP doesn't help.

After writing or editing code, check LSP diagnostics before
moving on. Fix any type errors or missing imports immediately.

## Campaign Content

### The Silent Cartographer (Adventure)
- **Design doc**: `docs/plans/2026-02-27-silent-cartographer-design.md` — full adventure centered on the USS Arcturus
- **Image notes**: `docs/plans/2026-02-27-silent-cartographer-images.md`
- **Session 1**: `sessions/session01-transcript.md`, `session01-narrative.md`, `session01-summary.md`
- **Session 2 prep**: `sessions/session02-prep.md` (Lazy DM format) with assets in `sessions/session02-assets/`

### Player Characters
- **Reference**: `players/CHARACTERS.md` — all PC stats, values, talents
- **Foundry exports**: `players/*.json` — importable via `character-import` skill

## Compatibility
- Foundry VTT: v13+
- STA System: v2.0.0+
- Pack data includes both 1e and 2e weapon types

## Item Types
- `talent`, `focus`, `value`, `item`, `injury` — shared between 1e/2e
- `characterweapon` — 1e personal weapons
- `characterweapon2e` — 2e personal weapons (adds `severity`, `stun`, removes `knockdown`/`viciousx`)
- `starshipweapon` — 1e starship weapons (per-scale variants)
- `starshipweapon2e` — 2e starship weapons (`includescale` replaces per-scale variants)
