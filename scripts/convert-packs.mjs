#!/usr/bin/env node
/**
 * Convert NeDB .db pack files to individual JSON source files
 * for use with @foundryvtt/foundryvtt-cli LevelDB compilation.
 *
 * Normalizes legacy Foundry v9 fields:
 *   - data → system
 *   - permission → ownership
 *   - Updates _stats
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packsDir = join(__dirname, '..', 'packs');
const sourceDir = join(packsDir, '_source');

const CORE_VERSION = '13.351';
const SYSTEM_VERSION = '2.5.1';

// Get all .db files
import { readdirSync } from 'fs';
const dbFiles = readdirSync(packsDir).filter(f => f.endsWith('.db'));

console.log(`Found ${dbFiles.length} .db files to convert.\n`);

for (const dbFile of dbFiles) {
  const packName = basename(dbFile, '.db');
  const outDir = join(sourceDir, packName);
  mkdirSync(outDir, { recursive: true });

  const raw = readFileSync(join(packsDir, dbFile), 'utf-8');
  const lines = raw.split('\n').filter(l => l.trim());

  let count = 0;
  const nameCount = {};
  for (const line of lines) {
    let entry;
    try {
      entry = JSON.parse(line);
    } catch (e) {
      console.warn(`  Skipping unparseable line in ${dbFile}`);
      continue;
    }

    // Normalize data → system
    if (entry.data && !entry.system) {
      entry.system = entry.data;
      delete entry.data;
    }

    // Normalize permission → ownership
    if (entry.permission && !entry.ownership) {
      entry.ownership = entry.permission;
      delete entry.permission;
    }

    // Normalize nested items (actors have embedded items)
    if (Array.isArray(entry.items)) {
      for (const item of entry.items) {
        if (item.data && !item.system) {
          item.system = item.data;
          delete item.data;
        }
        if (item.permission && !item.ownership) {
          item.ownership = item.permission;
          delete item.permission;
        }
        // Update item _stats
        if (!item._stats) {
          item._stats = {};
        }
        item._stats.systemId = 'sta';
        item._stats.systemVersion = SYSTEM_VERSION;
        item._stats.coreVersion = CORE_VERSION;
      }
    }

    // Update/add _stats
    if (!entry._stats) {
      entry._stats = {};
    }
    entry._stats.systemId = 'sta';
    entry._stats.systemVersion = SYSTEM_VERSION;
    entry._stats.coreVersion = CORE_VERSION;

    // Reset ownership to default only
    entry.ownership = { default: 0 };

    // Clean up flags
    if (entry.flags?.core?.sourceId) {
      entry.flags = { core: { sourceId: entry.flags.core.sourceId } };
    }

    // Ensure required fields
    if (entry.folder === undefined) entry.folder = null;
    if (entry.sort === undefined) entry.sort = 0;

    // Write individual file named by name (with _id suffix for duplicates)
    const id = entry._id;
    if (!id) {
      console.warn(`  Skipping entry without _id in ${dbFile}: ${entry.name}`);
      continue;
    }

    const safeName = entry.name?.replace(/[\/\\:*?"<>|]/g, '_') || id;
    // Track names to detect duplicates
    if (!nameCount[safeName]) nameCount[safeName] = 0;
    nameCount[safeName]++;
    const suffix = nameCount[safeName] > 1 ? ` (${id})` : '';
    const outPath = join(outDir, `${safeName}${suffix}.json`);
    writeFileSync(outPath, JSON.stringify(entry, null, 2) + '\n');
    count++;
  }

  console.log(`  ${packName}: ${count} entries → ${outDir}`);
}

console.log('\nDone! Source files written to packs/_source/');
