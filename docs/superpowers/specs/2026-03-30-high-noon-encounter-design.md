# High Noon at Yara's Ranch — Full Tactical Encounter Design

**Date:** 2026-03-30
**Adventure:** Pale Riders of the Lost Frontier, Session 2
**Design Doc:** `docs/plans/2026-03-28-pale-riders-design.md`
**Foundry Scene:** "Battlemap — Yara's Ranch (High Noon)" (`kUynRZA8CNuYNpYF`)
**Map Image:** `images/pale-riders/maps/map-yaras-ranch.png` (2000x2000, 50px grid)
**Local Reference:** `PaleRiders/Yara's Ranch battlemap - scene upload.png`

---

## Overview

A full STA 2e ground combat encounter for Session 2 of Pale Riders. Rek Dalton brings 16 people to take Yara's ranch by force. The crew defends the ranch using Verathi weapons, limited phaser shots, and environmental advantages they discovered during the morning preparation phase.

The encounter has three phases:
1. **Preparation** (morning before noon) — the crew scouts the ranch and rigs defences
2. **The Fight** (High Noon) — 5-zone tactical combat with escalating chaos
3. **Escalation** (Sev Takes Command) — when Rek falls, Sev takes over and the fight gets smarter

### Victory Conditions

- **Combat:** Dalton surrenders or flees. Hired hands break when he's down.
- **Negotiation:** T'Karra talks Dalton down (Presence + Command, Difficulty 3, -1 if water monopoly broken via aquifer valve).
- **Engineering:** Brex finds a new aquifer (Extended Task, 6-box, Difficulty 2). Completes before the fight = Dalton's leverage evaporates.

### Threat Pool

Starting Threat: **4**

---

## 1. The Battlefield — 5 Zones

Map is 2000x2000 pixels, 50px grid (40x40 squares, 5m per square).

### Zone Definitions

| Zone | Region Colour | Approximate Bounds (px) | Cover | Features |
|------|--------------|------------------------|-------|----------|
| **The Farmhouse** | Blue (#2244aa, 0.2 alpha) | x:800-1250, y:600-1050 | Heavy (walls) | Yara + Tomas inside. Tunnel entrance in cellar. Windows provide firing positions. Doors are chokepoints (south porch, east side). |
| **The Water Tanks** | Cyan (#22aacc, 0.2 alpha) | x:350-750, y:250-600 | Partial (metal) | 2 elevated tanks on stilts. Stray shot = breach (Complication). Fuel dump behind tanks. Can be rigged to flood approach road or explode. |
| **The Runner Corrals** | Green (#44aa22, 0.2 alpha) | x:100-600, y:1150-1600 | Partial (wood fencing) | Six-legged lizard-horses. Stampede hazard. Wooden fencing is flammable. Release mechanism can be found during prep. |
| **The Approach Road** | Orange (#cc6622, 0.15 alpha) | x:200-1800, y:1600-2000 | None | Flat desert. Where Dalton's squads advance from the south. Long range from farmhouse. Mining charges can be buried here. |
| **The Canyon Rim** | Red (#aa2222, 0.2 alpha) | x:0-2000, y:0-250 | Partial (rocks/boulders) | High ground across the top of the map. Sev's flanking position. Overlooks all other zones. Pre-war ordnance buried in the cliff face. +1d20 ranged attacks from rim into lower zones. |

### Cover Spots (Rock Clusters)

Scattered rock clusters visible on the map provide partial cover outside the main zones:
- East side: multiple boulder clusters between the farmhouse and approach road (~x:1400-1800, y:800-1400)
- South-west: rocks between corrals and approach road (~x:400-600, y:1000-1200)
- These are marked as "Cover" in the overview image

---

## 2. Scene Configuration

### Walls

#### Farmhouse Exterior (Full Walls — block movement + sight)

The farmhouse is a roughly rectangular structure centred around x:1000, y:825. Approximate wall segments:

- **North wall:** (850, 650) to (1200, 650)
- **East wall:** (1200, 650) to (1200, 1000)
- **South wall (with porch gap):** (850, 1000) to (950, 1000) + (1100, 1000) to (1200, 1000) — gap at (950-1100) for porch/door
- **West wall:** (850, 650) to (850, 1000)
- **East door gap:** Break east wall at (1200, 800) to (1200, 850) — remove this segment for door

#### Farmhouse Windows (Window-type walls — block movement, allow sight)

- **North windows:** Replace segment (950, 650) to (1050, 650) with window-type wall
- **West windows:** Replace segment (850, 750) to (850, 850) with window-type wall

#### Water Tank Supports (Half-height terrain walls)

4 short wall segments around each tank, providing partial cover:
- Tank 1 (centre ~x:500, y:400): 4 segments of ~50px each arranged around the circumference
- Tank 2 (centre ~x:650, y:400): same pattern

#### Corral Fencing (Terrain walls — slow movement, don't block sight)

Square enclosure:
- **North fence:** (200, 1200) to (550, 1200)
- **East fence:** (550, 1200) to (550, 1550)
- **South fence:** (200, 1550) to (550, 1550)
- **West fence:** (200, 1200) to (200, 1550)
- **Gate gap:** Break south fence at (350, 1550) to (400, 1550) for gate

#### Cover Rocks (Short terrain walls — partial cover)

Scattered boulder clusters visible on the map, each represented by 1-2 short wall segments:
- **East cover 1:** ~(1500, 850), ~50px segment — rocks east of farmhouse
- **East cover 2:** ~(1700, 1100), ~50px segment — rocks south-east
- **East cover 3:** ~(1600, 1400), ~50px segment — rocks near approach road
- **South-west cover:** ~(500, 1050), ~50px segment — rocks between corrals and farmhouse
- **North-east cover:** ~(1700, 400), ~50px segment — rocks near canyon rim

These provide partial cover for PCs or NPCs who reach them — important tactical positions during the fight.

#### Canyon Rim Edge (Ethereal walls — mark elevation, don't block)

- Single long wall: (0, 250) to (2000, 250) — marks the cliff edge

**Note:** All coordinates are approximate from the map image and should be refined during implementation by examining the map at full resolution. The farmhouse structure has clear architectural features visible in the image that should guide exact placement.

### Scene Regions (5 zones)

Each region is created as a Foundry v13 Scene Region with:
- `color`: the hex colour listed above
- `visibility`: `LAYER` (visible as a coloured overlay)
- Shape polygons matching the zone bounds listed above

### Global Lighting

- Global light enabled, bright
- Tint: `#ffcc66` (warm golden two-sun light)
- Darkness level: 0 (full daylight — High Noon)
- No fog of war

### Background

- Background colour: `#1a0e00` (already set)
- Background image: `images/pale-riders/maps/map-yaras-ranch.png` (already set)

---

## 3. NPC Forces

### Named Daltons (existing actors — add weapons)

| Actor | ID | NPC Type | Starting Position | Weapons to Add | Combat Role |
|-------|----|----------|-------------------|----------------|-------------|
| **Rek Dalton** | `lqXErkDjCPUEEEYR` | Minor | Approach Road, rear (~x:1000, y:1900) | Verathi Six-Gun (`MalN6DcPoESQCCFW`) | Commands from the back. Doesn't fight. When he goes down or flees, morale breaks. |
| **Sev Dalton** | `0tDQoIj2o5VQNdgX` | Notable | Canyon Rim (~x:1600, y:100) | Verathi Long Rifle (`YZkXbxWt8j2VEd29`), Verathi Bowie Knife (`VB9T32p2SEeEYL72`) | Flanking sniper. When Rek falls, Sev takes command — the fight gets harder. |
| **Little Rek Dalton** | `XkXWtubqfvyB32pQ` | Minor | Approach Road, front (~x:800, y:1700) | 2x Verathi Six-Gun (`MalN6DcPoESQCCFW`) | Charges the farmhouse. Reckless. T'Karra steps into his path. |
| **Pip Dalton** | `qwb6dZvVYJHZmOuI` | Minor | Approach Road, middle (~x:1200, y:1800) | Verathi Six-Gun (`MalN6DcPoESQCCFW`) | Freezes during the fight. Healer talks him down (Presence + Command, Diff 1). |

### New Actors to Create

| Actor | NPC Type | Stress | Starting Position | Weapons | Attributes | Disciplines | Traits |
|-------|----------|--------|-------------------|---------|------------|-------------|--------|
| **Dalton Riders (Squad A)** | Notable | 12 | Approach Road, left (~x:500, y:1850) | Verathi Six-Gun, Verathi Long Rifle | Fit 8, Dar 8, Con 7, Ins 7, Pre 7, Rea 7 | Sec 2, Cmd 1 | Verathi, Hired Guns, Strength in Numbers |
| **Dalton Riders (Squad B)** | Notable | 12 | Approach Road, right (~x:1500, y:1850) | Verathi Six-Gun, Verathi Long Rifle | Same as Squad A | Same | Same |
| **Sev's Flankers** | Notable | 8 | Canyon Rim, near Sev (~x:1700, y:100) | Verathi Long Rifle, Verathi Bowie Knife | Fit 9, Dar 8, Con 8, Ins 7, Pre 7, Rea 7 | Sec 3, Cmd 1 | Verathi, Canyon Trackers, Sev's Best |

Each squad token represents multiple riders (Squad A/B = 6 each, Flankers = 2). When a squad's stress track is emptied, the survivors scatter.

**Total Dalton force: 16** — Rek, Sev, Little Rek, Pip, 2 flankers, 12 riders.

### Allies

| Actor | Starting Position | Weapons | Role |
|-------|-------------------|---------|------|
| **Marshal Cade** (`Fr04XrOo7uzoKlgB`) | Farmhouse exterior, south (~x:1000, y:1050) | Verathi Long Pistol + Long Rifle (already on token) | Active combatant. Fights alongside the crew. |
| **Yara Denn** (`CyVsyhMhEMX9mOf7`) | Farmhouse interior (~x:1000, y:800) | Verathi Shotgun (`cuUh34ylbOTlIPhu`) | Last resort only. Fires if farmhouse is breached. Protecting Tomas and the tunnel. |
| **Tomas Saal** | Farmhouse interior (~x:950, y:850) | None | Non-combatant. The stakes. Check if actor exists; create if not. |

### Phaser Budget

2 working Type-2 Phasers with 3 shots each (6 total). Each shot:
- 5 damage, Charge quality
- Adds 1 Threat ("advanced weapons witnessed")
- After 6th shot total, power cells are dead

### Items to Create

| Item | Type | Damage | Range | Hands | Severity | Qualities | Notes |
|------|------|--------|-------|-------|----------|-----------|-------|
| **Mining Charge (Improvised)** | characterweapon2e | 4 | ranged | 0 | 2 | Area | One-use. Detonated as a Minor Action. Buried during prep. |
| **Phaser Type-2 (Reserve Power)** | characterweapon2e | 5 | ranged | 1 | 1 | Charge | Track shots in item description. 3 shots per phaser. |

---

## 4. The Preparation Phase — "The Morning Before Noon"

The crew has the morning to scout the ranch and prepare defences. Each preparation is a discovery tied to player intent — the GM matches what the player investigates to the closest preparation below.

### Discoverable Preparations

| # | Discovery | Who Finds It | Roll | Difficulty | Combat Effect If Prepared |
|---|-----------|-------------|------|------------|--------------------------|
| 1 | **Mining Charges in the Barn** | Anyone searching outbuildings | Insight + Engineering | 1 (find), 2 (rig) | Buried on approach road. Detonate as Minor Action: 4 damage, Area, to one squad. One use. |
| 2 | **The Aquifer Valve** | Brex / any engineer at water tanks | Reason + Engineering | 2 | Flood the approach road. +1 Difficulty to all movement through that zone. Dalton's water monopoly ends. |
| 3 | **Corral Release Mechanism** | Thon / anyone scouting corrals | Insight + Security | 1 | Release runners as Minor Action. Stampede through one adjacent zone: Fitness + Security Diff 2 or 3 damage + prone. One use. |
| 4 | **Sniper Nest on Farmhouse Roof** | Thon (security sweep) | Daring + Security | 1 | Firing position with heavy cover. +1d20 ranged attacks from roof. But exposed to Sev on canyon rim — line of sight both ways. |
| 5 | **Fuel Dump Behind Water Tanks** | Brex or Vex (investigating pumps) | Reason + Engineering | 2 | Rig as fire trap. Detonation creates Fire Zone in water tank area. Destroys the water tanks — conflicts with Prep #2. |
| 6 | **Pre-War Munitions in Canyon Wall** | Vex (scanning) / anyone climbing rim | Reason + Science | 3 | Trigger collapse on canyon rim. 5 damage, Area, Piercing 1 to anyone on that section. Cascade risk (see Pre-War Ordnance table). |
| 7 | **Yara's Root Cellar Barricade** | Anyone talking to Yara | Presence + Command | 1 | Reinforces cellar entrance. If farmhouse breached, tunnel still protected — attackers need an extra round to reach it. |
| 8 | **Dalton's Approach Route** | Thon or Malevolant (scouting beyond ranch) | Fitness + Security | 2 | Identifies exactly where squads arrive. Crew acts first in Round 1 regardless of initiative. |

### Preparation Pacing

- Each preparation takes ~10-15 minutes table time (one investigation scene)
- Split crew: 4-5 preparations possible
- Together: 2-3 preparations possible
- **Conflict:** Fuel dump (Prep #5) destroys water tanks, so you can't flood the road (Prep #2) AND set a fire trap in the same area

---

## 5. Roll Tables

### Table 1: Chaos of Battle (d10)

Roll at the start of each round after Round 1. GM can also spend 1 Threat to roll as a free action.

| d10 | Event | Mechanical Effect |
|-----|-------|-------------------|
| 1 | **Stray shot hits a fuel line** | Fire breaks out in the zone where the last attack missed. Fire Zone rules apply. |
| 2 | **Runners panic** | If corrals intact, runners kick through fencing. Stampede through a random adjacent zone — Fitness + Security Diff 1 or 3 damage + prone. |
| 3 | **Dust devil** | Whirlwind crosses the approach road. +1 Difficulty to all ranged attacks this round. |
| 4 | **Water tank groans** | A support buckles. Next hit on anything in the water tank zone breaches a tank — Complication "Flooding." |
| 5 | **Pip breaks** | If not already dealt with, Pip throws his gun away and runs toward the farmhouse screaming. Anyone can grab him. If dealt with, reroll. |
| 6 | **Little Rek gets reckless** | Little Rek charges the nearest PC. Fires both pistols (both probably miss — Control 7 + Security 2). Now in melee range. |
| 7 | **Dalton's boys waver** | Lowest-stress squad: morale check (Daring + Command, Diff 2). Failure: hunker down, don't advance this round. |
| 8 | **Sev repositions** | Sev moves to new position on canyon rim. PCs lose line of sight. Fires from new position next round. |
| 9 | **Something shifts underground** | Low rumble, cracks near farmhouse. Pre-war ordnance destabilising. If not stabilised (Reason + Engineering, Diff 2), detonates in 2 rounds — hits canyon rim AND water tank zone. |
| 10 | **Reinforcements on the horizon** | Dust cloud on approach road. 2 more riders in 2 rounds. OR if crew earned Marta's trust: Marta on a runner with a rifle + Doc Lenn with medical bag. GM's choice. |

### Table 2: Sev Takes Command (d6)

Replaces "Chaos of Battle" when Rek is defeated/flees/talked down.

| d6 | Sev's Order | Mechanical Effect |
|----|-------------|-------------------|
| 1 | **"Covering fire!"** | Remaining squad(s) suppress one zone. PCs in that zone: +1 Difficulty to all Tasks this round. |
| 2 | **"Flank left!"** | A squad moves to corral zone, bypassing approach road. If corrals on fire, they go through (take damage but arrive). |
| 3 | **"Breach the farmhouse!"** | All forces focus on farmhouse. Attacks against farmhouse door get +1d20. |
| 4 | **"Take the high ground!"** | If flankers are down, Sev orders a squad to scale canyon rim. Arrive in 1 round. |
| 5 | **"Burn it."** | Sev orders incendiary shots at corrals or farmhouse. A zone catches fire (GM picks). |
| 6 | **"I'll handle this myself."** | Sev moves to engage the most dangerous PC directly. Uses cover, repositions, targets whoever directs the defence. Personal duel. |

### Table 3: Fire Spread (d6)

Roll at end of each round for each active Fire Zone.

| d6 | Fire Behaviour | Effect |
|----|---------------|--------|
| 1-2 | **Contained** | Fire stays in current zone. Anyone in zone: 2 damage at end of round, avoid with Fitness + Security Diff 1. |
| 3-4 | **Spreading** | Fire expands to one adjacent zone (GM picks most dramatic). Both zones now Fire Zones. |
| 5 | **Smoke** | No spread but thick smoke. +1 Difficulty ranged attacks into/out of zone. Stacks. |
| 6 | **Explosion** | Something combustible catches. 4 damage, Area, everyone in zone. Then fire is contained (burned through fuel). |

### Table 4: Pre-War Ordnance Wild Card (d6)

Rolled only when pre-war ordnance is triggered (deliberately or by "something shifts underground").

| d6 | Detonation Result | Effect |
|----|-------------------|--------|
| 1 | **Dud** | Fizzle. Nothing happens. The tension was the point. |
| 2 | **Controlled blast** | Canyon rim collapses in targeted area only. 5 damage, Piercing 1 to anyone on that section. Sev's flanking position destroyed. |
| 3 | **Cascade — canyon slide** | Larger collapse. Canyon rim zone destroyed entirely. Anyone on it: 5 damage + knocked to ground level. Rim no longer accessible. |
| 4 | **Shockwave** | Blast sends shockwave across battlefield. Everyone (all zones) Fitness + Security Diff 1 or prone. Runners stampede automatically. |
| 5 | **Subspace flare** | Ordnance was subspace-charged. Dimensional scar activates. All energy weapons (including phasers) offline for 2 rounds. Verathi chemical weapons unaffected. |
| 6 | **The ground opens** | Fissure between approach road and farmhouse. 3m gap. Squads must find another route (corrals or canyon rim). Buys defenders 1-2 rounds. |

---

## 6. Threat Spend Menu

| Cost | Effect |
|------|--------|
| 1 | Roll on Chaos of Battle / Sev Takes Command table |
| 1 | Runner stampede through one zone (if corrals intact) |
| 2 | Water tank breach — Complication "Flooding" in water tank zone |
| 2 | Sev's flanking shot — bonus d20 from canyon rim |
| 2 | Fire breaks out in a zone (GM picks) |
| 3 | Dalton calls reinforcements — 2 more riders arrive in 2 rounds |
| 3 | Sev detonates pre-war ordnance (roll on Wild Card table — Sev doesn't fully control it either) |
| 4 | Little Rek reaches farmhouse door — Yara must use shotgun or he's inside |

---

## 7. Combat Flow — Round-by-Round Guide

### The Escalation Trigger

The fight has two phases, keyed to Rek Dalton:

- **Phase 1 (Rek in command):** Dalton's boys are frontier bullies. They shoot wild, advance sloppily, break when things go wrong. Roll on **Chaos of Battle** table each round. The danger is numbers and environmental chaos.
- **Phase 2 (Sev takes command):** Triggered when Rek is defeated, flees, or is talked down. Replace Chaos of Battle with **Sev Takes Command** table. Remaining forces fight smart — disciplined suppression, flanking, coordinated breaches.

### Round 1

- If crew prepared Prep #8 (scouted approach route): crew acts first regardless of initiative
- Dalton's squads advance up the approach road
- Sev and flankers are already on the canyon rim
- Little Rek is eager — he's at the front
- Rek shouts from the rear: demands surrender

### Rounds 2+

- Roll on Chaos of Battle (or Sev Takes Command) at start of round
- Roll Fire Spread at end of round for each active fire
- Detonation countdown (if "something shifts underground" triggered): track rounds remaining
- Squad morale: when a squad hits half stress (6), half scatter — Complication "Riders Regrouping"

### Endgame Triggers

- **Rek defeated:** Sev Takes Command begins. Remaining riders rally briefly but fight harder.
- **Both squads broken:** Named Daltons must decide — fight or flee. Sev will fight. Little Rek will charge. Pip will surrender.
- **Sev defeated after Rek:** Remaining forces break completely. Combat over.
- **Farmhouse breached:** Yara fires the shotgun. If attacker survives, Tomas is in danger. This should feel like a crisis, not a foregone conclusion.

---

## 8. Fire Zone Rules

When a zone becomes a Fire Zone (via fuel dump, stray shot, Sev's "Burn it" order, or ordnance):

- Anyone starting or ending their turn in the zone: **2 damage** (avoid with Fitness + Security Diff 1)
- Roll on **Fire Spread** table at end of each round
- Fire destroys terrain walls (corral fencing burns away, removing cover)
- Fire creates smoke: **+1 Difficulty** to ranged attacks through smoke (stacks)
- Fire can be extinguished: Fitness + Engineering, Diff 2, costs a Task action

---

## 9. Foundry Implementation Checklist

### Actors

- [ ] Create "Dalton Riders (Squad A)" — notable, stress 12, weapons: Six-Gun + Long Rifle
- [ ] Create "Dalton Riders (Squad B)" — notable, stress 12, weapons: Six-Gun + Long Rifle
- [ ] Create "Sev's Flankers" — notable, stress 8, weapons: Long Rifle + Bowie Knife
- [ ] Create "Mining Charge (Improvised)" item — characterweapon2e
- [ ] Create "Phaser Type-2 (Reserve Power)" item — characterweapon2e
- [ ] Add Verathi Six-Gun to Rek Dalton
- [ ] Add Verathi Long Rifle + Bowie Knife to Sev Dalton
- [ ] Add 2x Verathi Six-Gun to Little Rek Dalton
- [ ] Add Verathi Six-Gun to Pip Dalton
- [ ] Add Verathi Shotgun to Yara Denn
- [ ] Check if Tomas Saal actor exists; create if not

### Roll Tables

- [ ] Create "Chaos of Battle" (d10, 10 entries)
- [ ] Create "Sev Takes Command" (d6, 6 entries)
- [ ] Create "Fire Spread" (d6, 6 entries)
- [ ] Create "Pre-War Ordnance Wild Card" (d6, 6 entries)

### Scene: "Battlemap — Yara's Ranch (High Noon)"

- [ ] Add farmhouse walls (full walls + door gaps + windows)
- [ ] Add water tank support walls (half-height)
- [ ] Add corral fencing (terrain walls + gate gap)
- [ ] Add cover rock walls (5 partial cover positions)
- [ ] Add canyon rim edge (ethereal wall)
- [ ] Create 5 scene regions (zones with coloured overlays)
- [ ] Update global lighting (warm tint #ffcc66)
- [ ] Place all NPC tokens at starting positions
- [ ] Place ally tokens (Cade, Yara, Tomas)

### Journal Entry

- [ ] Create "High Noon — GM Combat Guide" with pages:
  - Overview & victory conditions
  - Preparation phase (8 discoveries)
  - Round-by-round guide & escalation trigger
  - Threat spend menu
  - Phaser rules
  - Fire zone rules
  - Victory & aftermath

---

## 10. What This Design Does NOT Include

- No new battlemap image — uses existing `map-yaras-ranch.png`
- No token art generation for generic riders (use placeholder or generate separately)
- No modifications to the narrative "Yara's Ranch" scene (`Ub3ywnRhRGeTz5al`)
- No starship combat (that's Encounter 2, Session 3)
- No Warden/bunker content (that follows immediately after this encounter in Session 2)
