---
name: lazy-session-prep
description: Use when designing RPG session content, preparing adventures, creating Foundry VTT session materials, or when user says "prep a session", "design a session", "session prep", "lazy DM". Adapts the Lazy Dungeon Master checklist for STA 2e adventures in Foundry VTT.
---

# Lazy Session Prep — STA 2e Edition

Structured session preparation based on *Return of the Lazy Dungeon Master* by Michael E. Shea, adapted for Star Trek Adventures 2nd Edition and Foundry VTT.

**Core principle:** Prepare what benefits your game, and omit what does not. 15-30 minutes of focused prep produces better sessions than hours of over-preparation.

## The Checklist

Run these 8 steps in order. Each step builds on the previous. Skip steps you don't need.

### 1. Review the Characters

Before anything else, review the PCs:
- Names, backgrounds, values, and motivations
- What each player enjoys at the table
- Current character arcs and unresolved threads

**Test:** Can you name every PC from memory? If not, spend more time here.

**STA 2e:** Review PC Values — these are the primary driver of Determination and roleplaying hooks. Check which Milestone triggers might be approaching.

### 2. Create a Strong Start

The single most important piece of prep. How does the session begin?

Write **one sentence** answering three questions:
- **What's happening?** (an event framing the scene)
- **What's the point?** (the hook pulling characters forward)
- **Where's the action?** (start as close to action as possible)

**When in doubt, start with combat** (or in STA: a crisis that demands immediate action).

**STA 2e:** Strong starts often involve the captain issuing orders, a ship-wide alert, or an away team beaming into a situation already in progress. Use the ship's sensors detecting something as a reliable opener.

### 3. Outline Potential Scenes

Write a short bullet list of scenes that **might** occur. Expect 1-2 scenes per hour of play.

- Keep each entry to a few words
- Accept that most scenes will be discarded or reordered
- These exist to make you feel prepared, not to script the game

**Be prepared to throw them away** when players go in unexpected directions.

**STA 2e scenes typically fall into:**
- Bridge scenes (sensor analysis, command decisions, ship operations)
- Away team scenes (exploration, investigation, first contact)
- Personal scenes (character moments, Value challenges, crew interactions)
- Crisis scenes (combat, environmental hazards, ticking clocks)

### 4. Define Secrets and Clues

Write **10 secrets or clues** the characters might discover. Each is a single sentence revealing a piece of the story.

**Critical rule: Keep secrets abstract from their place of discovery.** Don't tie a secret to a specific NPC or location — improvise *how* it's discovered during play.

Secrets become quests when players discuss them. Unrevealed secrets can carry to the next session or be discarded.

**STA 2e examples:**
- "The subspace anomaly matches a classified Starfleet experiment from 2245."
- "The colony's distress signal was sent *before* the ion storm hit."
- "The Romulan commander's personal log reveals she's acting without Senate authority."

### 5. Develop Fantastic Locations

Create **1-2 locations per hour of play**. Each location has:
- **Evocative name** (e.g., "The Shattered Arboretum", "Cargo Bay Zero")
- **Three aspects** — interactive, notable features characters can engage with

Aspects should offer something to investigate, interact with, or be threatened by.

**STA 2e locations:** Ship interiors (bridge, engineering, sickbay, cargo bays), alien worlds (settlements, ruins, natural formations), space phenomena (nebulae, anomalies, derelict vessels), starbases and outposts.

### 6. Outline Important NPCs

Prepare only the **most critical NPCs**. For each:
- Name
- Connection to the adventure
- Archetype from popular fiction (gives instant personality)

Most NPCs can be improvised at the table. Have a random name list ready.

**STA 2e NPC tiers:**
| Tier | Personal Threat | Values | Focuses | Talents |
|------|----------------|--------|---------|---------|
| Minor | Defeated instantly | 0 | 0 | 0 |
| Notable | 3 | 1 | 2-3 | 0 |
| Major | 6 + 1/value | up to 4 | up to 6 | up to 4 |

### 7. Choose Relevant Enemies

What opposition makes sense for the story and location? List enemies without worrying about encounter balance.

**STA 2e:** Opposition often isn't combat — it's environmental hazards, diplomatic standoffs, ethical dilemmas, and ticking clocks. When combat does occur, use the Threat pool to scale difficulty dynamically.

### 8. Select Rewards

What might characters find or earn? Tie rewards to secrets and clues when possible.

**STA 2e rewards:**
- Equipment and items (specialized gear, alien technology)
- Information (sensor data, personal logs, decoded transmissions)
- Reputation and commendations
- Character development triggers (Value challenges, Milestone progress)

## Campaign-Level Prep

### The Lazy Campaign

Build outward from the characters' immediate situation:

**Campaign Hook:** One sentence describing the campaign's central tension.

**Six Truths:** 6 bullet points that make this campaign unique. Use these to help players build fitting characters.

**Three Fronts:** Major forces driving the campaign. Each front has:
- **Who/What** is it?
- **What** do they want?
- **Three Grim Portents** — visible steps showing their progress

Fronts evolve as the campaign progresses. They represent what's happening *now*, not what might happen.

### Session Zero

1. Describe the campaign world and its truths
2. Ask about boundaries (themes to avoid)
3. Tie characters together (shared history, faction bonds)
4. Run a quick introductory scene

## Running the Game

### Pacing: Hope and Fear Beats

Alternate between upward (hope) and downward (fear) beats:

**Hope beats:** Discover secrets, gain allies, defeat foes, find rewards, clever plans succeed
**Fear beats:** Mysterious threats, complications, grim revelations, enemy escalation

Too much fear feels hopeless. Too much hope feels boring. Alternate.

### Group Storytelling Prompts

Move players from mechanics to narrative:
- "Describe your killing blow" (or in STA: "Describe how you reroute power / land the critical hit / crack the code")
- "What's an interesting detail about this location?"
- "What happened during the journey?" (travel montage)

### Improvising Scenes

Think like a living world:
- NPCs pursue their own goals, don't wait for PCs
- Villains react to PC actions based on available information
- Events happen off-screen and create consequences

### The Core Loop

**You describe the situation → Ask "What do you do?" → Players act → You adjudicate → Repeat**

If you're talking for long stretches without asking "What do you do?", the players are observers, not actors.

## Foundry VTT Output

When creating session materials in Foundry, produce:

| Asset | Format | Notes |
|-------|--------|-------|
| Adventure Journal | JournalEntry (multi-page, HTML) | GM Overview, per-session pages, handouts, mechanics reference |
| Player Handouts | Individual JournalEntries | One per player role with role-specific prompts |
| NPCs | Actor (character) | Use NPC 2e sheet, set correct tier |
| Starships | Actor (starship) | Canonical spaceframe stats from Game Toolkit |
| Extended Tasks | Actor (extendedtask) | Progress Track + breakthroughs (max 2) |
| Roll Tables | RollTable | For random effects, encounters, complications |
| Items | Item (various types) | Equipment, injuries, weapons as needed |
| Scenes | Scene | With background image, lighting, grid |

**STA 2e Foundry specifics:**
- NPC sheets: `sta.STANPCSheet2e` — set via `flags.core.sheetClass`
- Personal Threat stored in `system.stress.max` field
- Extended Tasks: exactly 2 breakthroughs (at halfway and 3/4 marks)
- All journal HTML must use inline styles (Foundry strips `<style>` blocks)
- Cross-reference with `@UUID[Type.id]{Display Name}` links

## Quick Reference: Prep in 15 Minutes

```
[ ] Review PCs — names, values, arcs (2 min)
[ ] Strong start — one evocative sentence (2 min)
[ ] Potential scenes — 4-6 bullet points (3 min)
[ ] Secrets and clues — 10 single sentences (5 min)
[ ] Fantastic locations — 2-3 with 3 aspects each (3 min)
[ ] Important NPCs — name + archetype (2 min)
[ ] Enemies — short list (1 min)
[ ] Rewards — 1-2 items or discoveries (1 min)
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Over-preparing scenes that never happen | Keep scenes to a few words. Be ready to discard. |
| Tying secrets to specific NPCs/locations | Keep secrets abstract. Improvise discovery method. |
| Starting sessions with exposition dumps | Start in medias res. Get to action immediately. |
| Scripting NPC dialogue in advance | Know the NPC's archetype and goal. Improvise the words. |
| Building locations players won't visit | Focus on the characters' immediate situation. Build outward. |
| Preparing too many NPCs | Prep 2-3 key NPCs. Improvise the rest with a name list. |
| Using 1e terminology in 2e content | No Stress/Determination for NPCs — use Personal Threat. No Magnitude/Work — use Progress Track. |

## Reference

Full methodology: `markdown/return_of_the_lazy_dungeon_master/return_of_the_lazy_dungeon_master.md`
STA 2e Core Rulebook: `markdown/STA2e_Core Rulebook_DIGITAL_v1.1/`
STA 2e Game Toolkit: `markdown/STA2e Game Toolkit Booklet v1.1/`
Published adventure reference: `markdown/STA_TOS_Adventure_Kobyashi_Maru_Final_v1.0_(1)/`
