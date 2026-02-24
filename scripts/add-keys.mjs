#!/usr/bin/env node
/**
 * Add _key fields to all source JSON files that are missing them.
 * Also adds _key to embedded items within actors.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const sourceDir = '/Users/gordonmclennan/repos/sta-compendia/packs/_source';

// Map pack types to LevelDB key prefixes based on module.json pack type
const packTypeMap = {
  // Items
  'personal-weapons-core': 'items',
  'personal-weapons-2e-core': 'items',
  'values-core': 'items',
  'species-talents-core': 'items',
  'general-talents-core': 'items',
  'discipline-talents-core': 'items',
  'starship-talents-core': 'items',
  'focuses-core': 'items',
  'roles-core': 'items',
  'damage-core': 'items',
  'personal-equipment-core': 'items',
  'starship-weapons-core': 'items',
  'starship-weapons-2e-core': 'items',
  // Actors
  'starfleet-starships-core': 'actors',
  'alien-starships-core': 'actors',
  'npc-starship-crew-core': 'actors',
  // JournalEntry
  'playable-species-core': 'journal',
  'manual-tutorials-core': 'journal',
  // RollTable
  'roll-tables-core': 'tables',
  // Scene
  'default-maps-core': 'scenes',
};

const packDirs = readdirSync(sourceDir).filter(d => {
  return statSync(join(sourceDir, d)).isDirectory();
});

let totalUpdated = 0;

for (const packName of packDirs) {
  const prefix = packTypeMap[packName];
  if (!prefix) {
    console.warn(`  Unknown pack: ${packName}, skipping`);
    continue;
  }

  const packDir = join(sourceDir, packName);
  const files = readdirSync(packDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = join(packDir, file);
    const entry = JSON.parse(readFileSync(filePath, 'utf-8'));
    let modified = false;

    // Add top-level _key
    const expectedKey = `!${prefix}!${entry._id}`;
    if (entry._key !== expectedKey) {
      entry._key = expectedKey;
      modified = true;
    }

    // Add _key to embedded items (for actors)
    if (Array.isArray(entry.items)) {
      for (const item of entry.items) {
        if (item._id) {
          const itemKey = `!${prefix}.items!${entry._id}.${item._id}`;
          if (item._key !== itemKey) {
            item._key = itemKey;
            modified = true;
          }
        }
      }
    }

    // Add _key to journal pages
    if (Array.isArray(entry.pages)) {
      for (const page of entry.pages) {
        if (page._id) {
          const pageKey = `!${prefix}.pages!${entry._id}.${page._id}`;
          if (page._key !== pageKey) {
            page._key = pageKey;
            modified = true;
          }
        }
      }
    }

    // Add _key to roll table results
    if (Array.isArray(entry.results)) {
      for (const result of entry.results) {
        if (result._id) {
          const resultKey = `!${prefix}.results!${entry._id}.${result._id}`;
          if (result._key !== resultKey) {
            result._key = resultKey;
            modified = true;
          }
        }
      }
    }

    // Add _key to scene embedded collections
    const sceneCollections = ['tokens', 'drawings', 'lights', 'notes', 'sounds', 'templates', 'tiles', 'walls'];
    for (const collName of sceneCollections) {
      if (Array.isArray(entry[collName])) {
        for (const item of entry[collName]) {
          if (item._id) {
            const itemKey = `!${prefix}.${collName}!${entry._id}.${item._id}`;
            if (item._key !== itemKey) {
              item._key = itemKey;
              modified = true;
            }
          }
        }
      }
    }

    if (modified) {
      writeFileSync(filePath, JSON.stringify(entry, null, 2) + '\n');
      totalUpdated++;
    }
  }
}

console.log(`Updated ${totalUpdated} files with _key fields.`);
