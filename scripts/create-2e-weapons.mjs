#!/usr/bin/env node
/**
 * Create 2e weapon source files from 1e weapon data.
 *
 * Uses the official STA v2 data model schemas based on the mkscho63/sta repo.
 * Where possible, weapon stats are taken from the official 2e STA system data.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const sourceDir = join(__dirname, '..', 'packs', '_source');

function generateId() {
  // Foundry-style 16-char alphanumeric ID
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const bytes = randomBytes(16);
  for (let i = 0; i < 16; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

const STATS = {
  systemId: 'sta',
  systemVersion: '2.5.1',
  coreVersion: '13.351',
  compendiumSource: null,
  duplicateSource: null,
  exportSource: null,
};

// ─── Personal Weapons 2e ───
// Based on official STA v2 weapon data from mkscho63/sta repo
const personalWeapons2e = [
  {
    name: 'Unarmed Strike',
    img: 'modules/sta-compendia/assets/icons/weapons-core/unarmed-strike.webp',
    damage: 2, range: 'melee', hands: 1, severity: 0,
    opportunity: 0, escalation: 0,
    qualities: { stun: true },
  },
  {
    name: 'Bludgeon',
    img: 'modules/sta-compendia/assets/icons/weapons-core/bludgeon.webp',
    damage: 3, range: 'melee', hands: 1, severity: 0,
    opportunity: 1, escalation: 0,
    qualities: { deadly: true, stun: true },
  },
  {
    name: 'Knife/Dagger',
    img: 'modules/sta-compendia/assets/icons/weapons-core/romulan-knife.webp',
    damage: 2, range: 'melee', hands: 1, severity: 0,
    opportunity: 1, escalation: 0,
    qualities: { deadly: true, hiddenx: 1 },
  },
  {
    name: 'Blade',
    img: 'modules/sta-compendia/assets/icons/weapons-core/blade.webp',
    damage: 3, range: 'melee', hands: 1, severity: 0,
    opportunity: 0, escalation: 0,
    qualities: { deadly: true },
  },
  {
    name: 'Heavy Blade',
    img: 'modules/sta-compendia/assets/icons/weapons-core/heavy-blade.webp',
    damage: 4, range: 'melee', hands: 2, severity: 0,
    opportunity: 0, escalation: 0,
    qualities: { deadly: true },
  },
  {
    name: 'Ushaan-tor',
    img: 'modules/sta-compendia/assets/icons/weapons-core/ushaan-tor.webp',
    damage: 2, range: 'melee', hands: 1, severity: 0,
    opportunity: 1, escalation: 0,
    qualities: { deadly: true, hiddenx: 1 },
  },
  {
    name: 'Nerve Pinch',
    img: 'modules/sta-compendia/assets/icons/weapons-core/nerve-pinch.webp',
    damage: 2, range: 'melee', hands: 1, severity: 0,
    opportunity: 0, escalation: 0,
    qualities: { stun: true, intense: true },
  },
  {
    name: 'Phase Pistol',
    img: 'modules/sta-compendia/assets/icons/weapons-core/phase-pistol.webp',
    damage: 3, range: 'ranged', hands: 1, severity: 0,
    opportunity: 0, escalation: 0,
    qualities: { stun: true },
  },
  {
    name: 'Phaser Type-1',
    img: 'modules/sta-compendia/assets/icons/weapons-core/phaser-type-1.webp',
    damage: 3, range: 'ranged', hands: 1, severity: 0,
    opportunity: 0, escalation: 0,
    qualities: { stun: true, hiddenx: 1 },
  },
  {
    name: 'Phaser Type-2',
    img: 'modules/sta-compendia/assets/icons/weapons-core/phaser-type-2.webp',
    damage: 4, range: 'ranged', hands: 1, severity: 0,
    opportunity: 0, escalation: 0,
    qualities: { deadly: true, stun: true, charge: true },
  },
  {
    name: 'Phaser Type-3 (Phaser Rifle)',
    img: 'modules/sta-compendia/assets/icons/weapons-core/phaser-type-3.webp',
    damage: 5, range: 'ranged', hands: 2, severity: 0,
    opportunity: 0, escalation: 0,
    qualities: { deadly: true, stun: true, accurate: true },
  },
  {
    name: 'Particle Rifle',
    img: 'modules/sta-compendia/assets/icons/weapons-core/particle-rifle.webp',
    damage: 4, range: 'ranged', hands: 2, severity: 0,
    opportunity: 0, escalation: 0,
    qualities: { accurate: true },
  },
  {
    name: 'Disruptor Pistol',
    img: 'modules/sta-compendia/assets/icons/weapons-core/disruptor-pistol.webp',
    damage: 4, range: 'ranged', hands: 1, severity: 0,
    opportunity: 0, escalation: 0,
    qualities: { deadly: true },
  },
  {
    name: 'Disruptor Rifle',
    img: 'modules/sta-compendia/assets/icons/weapons-core/disruptor-rifle.webp',
    damage: 5, range: 'ranged', hands: 2, severity: 0,
    opportunity: 0, escalation: 0,
    qualities: { deadly: true, accurate: true },
  },
  {
    name: 'Andorian Plasma Rifle',
    img: 'modules/sta-compendia/assets/icons/weapons-core/andorian-plasma-rifle.webp',
    damage: 4, range: 'ranged', hands: 2, severity: 0,
    opportunity: 0, escalation: 0,
    qualities: { deadly: true, accurate: true },
  },
  {
    name: "Jem'Hadar Plasma Pistol",
    img: "modules/sta-compendia/assets/icons/weapons-core/jem'hadar-plasma-pistol.webp",
    damage: 4, range: 'ranged', hands: 1, severity: 0,
    opportunity: 0, escalation: 0,
    qualities: { deadly: true },
  },
  {
    name: "Jem'Hadar Plasma Rifle",
    img: "modules/sta-compendia/assets/icons/weapons-core/jem'hadar-plasma-rifle.webp",
    damage: 5, range: 'ranged', hands: 2, severity: 0,
    opportunity: 0, escalation: 0,
    qualities: { deadly: true, accurate: true },
  },
  {
    name: 'Pulse Grenade',
    img: 'modules/sta-compendia/assets/icons/weapons-core/pulse-grenade.webp',
    damage: 4, range: 'ranged', hands: 1, severity: 0,
    opportunity: 0, escalation: 0,
    qualities: { area: true, grenade: true, charge: true },
  },
];

// Default qualities template for characterweapon2e
const defaultPersonalQualities = {
  deadly: false,
  stun: false,
  accurate: false,
  area: false,
  charge: false,
  cumbersome: false,
  debilitating: false,
  grenade: false,
  inaccurate: false,
  intense: false,
  piercingx: false,
  hiddenx: 0,
};

// ─── Starship Weapons 2e ───
// 2e removes per-scale variants; uses includescale instead
// Based on official STA v2 data

const starshipWeapons2e = [
  // Energy weapons
  {
    name: 'Phaser Arrays',
    img: 'modules/sta-compendia/assets/icons/starshipweapons-core/weapon-phaser-array.svg',
    damage: 0, range: 'medium', includescale: 'energy',
    qualities: { area: true, spread: true },
    description: '<p>Common to Starfleet vessels, phasers are a precise and adaptable weapon.</p><p>Long linked strips of emitters allow the weapon to discharge at any point along the strip. This versatility allows a vessel to fire at multiple targets from any direction.</p>',
  },
  {
    name: 'Phaser Banks',
    img: 'modules/sta-compendia/assets/icons/starshipweapons-core/weapon-phaser-bank.svg',
    damage: 1, range: 'medium', includescale: 'energy',
    qualities: { intense: true },
    description: '<p>Common to Starfleet vessels, phasers are a precise and adaptable weapon.</p><p>An energy weapon bank consists of multiple emitters packed together, producing a focused beam, inflicting damage to enemies.</p>',
  },
  {
    name: 'Phaser Cannon',
    img: 'modules/sta-compendia/assets/icons/starshipweapons-core/weapon-phaser-cannon.svg',
    damage: 2, range: 'close', includescale: 'energy',
    qualities: { devastating: true },
    description: '<p>Common to Starfleet vessels, phasers are a precise and adaptable weapon.</p><p>Cannons are close range, rapid-firing weapons that project pulses or bolts of energy rather than consistent beams. These are inaccurate at longer ranges, but devastating up close.</p>',
  },
  {
    name: 'Disruptor Arrays',
    img: 'modules/sta-compendia/assets/icons/starshipweapons-core/weapon-disruptor-array.svg',
    damage: 0, range: 'medium', includescale: 'energy',
    qualities: { area: true, spread: true },
    description: '<p>Disruptors are potent, damaging weapons favored by Klingons, Romulans, and other civilizations.</p><p>Long linked strips of emitters allow the weapon to discharge at any point along the strip, providing versatility against multiple targets.</p>',
  },
  {
    name: 'Disruptor Banks',
    img: 'modules/sta-compendia/assets/icons/starshipweapons-core/weapon-disruptor-bank.svg',
    damage: 1, range: 'medium', includescale: 'energy',
    qualities: { intense: true },
    description: '<p>Disruptors are potent, damaging weapons favored by Klingons, Romulans, and other civilizations.</p><p>An energy weapon bank consists of multiple emitters packed together, producing a focused beam or several longer pulses, inflicting damage to enemies.</p>',
  },
  {
    name: 'Disruptor Cannon',
    img: 'modules/sta-compendia/assets/icons/starshipweapons-core/weapon-disruptor-cannon.svg',
    damage: 2, range: 'close', includescale: 'energy',
    qualities: { devastating: true },
    description: '<p>Disruptors are potent, damaging weapons favored by Klingons, Romulans, and other civilizations.</p><p>Cannons are close range, rapid-firing weapons that project pulses or bolts of energy. Devastating up close but inaccurate at range.</p>',
  },
  {
    name: 'Phased Polaron Beam Arrays',
    img: 'modules/sta-compendia/assets/icons/starshipweapons-core/weapon-polaron-beam-array.svg',
    damage: 0, range: 'medium', includescale: 'energy',
    qualities: { area: true, dampening: true, spread: true },
    description: '<p>Phased polaron beams are used by the Dominion, capable of bypassing conventional shield systems.</p><p>Arrays provide wide-angle coverage from linked emitter strips.</p>',
  },
  {
    name: 'Phased Polaron Beam Banks',
    img: 'modules/sta-compendia/assets/icons/starshipweapons-core/weapon-polaron-beam-bank.svg',
    damage: 1, range: 'medium', includescale: 'energy',
    qualities: { dampening: true, intense: true },
    description: '<p>Phased polaron beams are used by the Dominion, capable of bypassing conventional shield systems.</p><p>Banks focus multiple emitters together for concentrated fire.</p>',
  },
  // Torpedoes
  {
    name: 'Photon Torpedo',
    img: 'modules/sta-compendia/assets/icons/starshipweapons-core/weapon-photon-torpedo.svg',
    damage: 3, range: 'long', includescale: 'torpedo',
    qualities: { highyield: true },
    description: '<p>Photon torpedoes use a payload of matter and anti-matter to create a devastating explosion. Commonly used by many cultures including the Federation, Klingons, and Cardassians.</p>',
  },
  {
    name: 'Photon Torpedo Salvo',
    img: 'modules/sta-compendia/assets/icons/starshipweapons-core/weapon-photon-torpedo-salvo.svg',
    damage: 3, range: 'long', includescale: 'torpedo',
    qualities: { highyield: true, spread: true },
    escalation: 3,
    description: '<p>A volley of photon torpedoes, intended to have a much greater effect. Firing a salvo adds 3 Threat.</p>',
  },
  {
    name: 'Quantum Torpedo',
    img: 'modules/sta-compendia/assets/icons/starshipweapons-core/weapon-quantum-torpedo.svg',
    damage: 4, range: 'long', includescale: 'torpedo',
    qualities: { highyield: true, devastating: true },
    description: '<p>Quantum torpedoes use a zero-point energy warhead, making them considerably more destructive than photon torpedoes.</p>',
  },
  {
    name: 'Quantum Torpedo Salvo',
    img: 'modules/sta-compendia/assets/icons/starshipweapons-core/weapon-quantum-torpedo-salvo.svg',
    damage: 4, range: 'long', includescale: 'torpedo',
    qualities: { highyield: true, devastating: true, spread: true },
    escalation: 3,
    description: '<p>A volley of quantum torpedoes. Firing a salvo adds 3 Threat.</p>',
  },
  {
    name: 'Micro-Torpedo',
    img: 'modules/sta-compendia/assets/icons/starshipweapons-core/weapon-photon-torpedo.svg',
    damage: 2, range: 'long', includescale: 'torpedo',
    qualities: { highyield: true },
    description: '<p>Smaller torpedo warheads designed for use on smaller vessels like runabouts and shuttles.</p>',
  },
  {
    name: 'Micro-Torpedo Salvo',
    img: 'modules/sta-compendia/assets/icons/starshipweapons-core/weapon-photon-torpedo-salvo.svg',
    damage: 3, range: 'long', includescale: 'torpedo',
    qualities: { highyield: true },
    escalation: 3,
    description: '<p>A volley of micro-torpedoes. Firing a salvo adds 3 Threat.</p>',
  },
  // Tractor beam
  {
    name: 'Tractor Beam',
    img: 'modules/sta-compendia/assets/icons/starshipweapons-core/weapon-tractor-beam.svg',
    damage: 0, range: 'close', includescale: 'energy',
    qualities: { slowing: true },
    description: '<p>Tractor beams use focused graviton beams to hold or slow other vessels.</p>',
  },
];

// Default qualities template for starshipweapon2e
const defaultStarshipQualities = {
  energy: false,
  torpedo: false,
  area: false,
  calibration: false,
  cumbersome: false,
  dampening: false,
  depleting: false,
  devastating: false,
  highyield: false,
  intense: false,
  jamming: false,
  persistent: false,
  piercing: false,
  slowing: false,
  spread: false,
  hiddenx: 0,
  versatilex: 0,
};

// ─── Generate personal weapons 2e ───
const personalOutDir = join(sourceDir, 'personal-weapons-2e-core');
mkdirSync(personalOutDir, { recursive: true });

for (const weapon of personalWeapons2e) {
  const id = generateId();
  const qualities = { ...defaultPersonalQualities };
  for (const [k, v] of Object.entries(weapon.qualities || {})) {
    qualities[k] = v;
  }

  const entry = {
    _id: id,
    name: weapon.name,
    type: 'characterweapon2e',
    img: weapon.img,
    system: {
      description: weapon.description || '',
      damage: weapon.damage,
      range: weapon.range,
      hands: weapon.hands,
      severity: weapon.severity || 0,
      opportunity: weapon.opportunity || 0,
      escalation: weapon.escalation || 0,
      qualities,
    },
    effects: [],
    folder: null,
    sort: 0,
    flags: {},
    ownership: { default: 0 },
    _stats: { ...STATS },
    _key: `!items!${id}`,
  };

  const fileName = weapon.name.replace(/[\/\\:*?"<>|]/g, '_') + '.json';
  writeFileSync(join(personalOutDir, fileName), JSON.stringify(entry, null, 2) + '\n');
}

console.log(`Created ${personalWeapons2e.length} personal weapons 2e → ${personalOutDir}`);

// ─── Generate starship weapons 2e ───
const starshipOutDir = join(sourceDir, 'starship-weapons-2e-core');
mkdirSync(starshipOutDir, { recursive: true });

for (const weapon of starshipWeapons2e) {
  const id = generateId();
  const qualities = { ...defaultStarshipQualities };
  for (const [k, v] of Object.entries(weapon.qualities || {})) {
    qualities[k] = v;
  }

  const entry = {
    _id: id,
    name: weapon.name,
    type: 'starshipweapon2e',
    img: weapon.img,
    system: {
      description: weapon.description || '',
      damage: weapon.damage,
      range: weapon.range,
      qualities,
      includescale: weapon.includescale,
      opportunity: weapon.opportunity || 0,
      escalation: weapon.escalation || 0,
    },
    effects: [],
    folder: null,
    sort: 0,
    flags: {},
    ownership: { default: 0 },
    _stats: { ...STATS },
    _key: `!items!${id}`,
  };

  const fileName = weapon.name.replace(/[\/\\:*?"<>|]/g, '_') + '.json';
  writeFileSync(join(starshipOutDir, fileName), JSON.stringify(entry, null, 2) + '\n');
}

console.log(`Created ${starshipWeapons2e.length} starship weapons 2e → ${starshipOutDir}`);
console.log('\nDone!');
