---
name: foundry-audio
description: Generate voice audio with ElevenLabs and deploy to Foundry VTT playlists. Use when the user wants to "generate audio", "create voice lines", "make TTS", "voice acting", "entity voice", "NPC voice", "upload audio to foundry", "play audio", "create playlist", or manage audio for RPG sessions.
---

# Foundry Audio — ElevenLabs TTS + Foundry VTT Playlists

Generate character voice lines, sound effects, and ambient audio using ElevenLabs, then deploy them as playable tracks in Foundry VTT.

## Prerequisites

- **ElevenLabs MCP server** configured in `~/.claude.json` (transport: stdio, `uvx elevenlabs-mcp`)
- **Foundry MCP server** connected (for playlist creation and file browsing)
- **SSH access** to the Foundry server for file uploads (key: `~/.ssh/id_ed25519`, host: see MEMORY.md)
- **ffmpeg** installed locally (for audio format conversion if needed)

## Saved Voices

| Voice Name | Voice ID | Character | Description |
|-----------|----------|-----------|-------------|
| The Cartographer | `gr22TBs5Eoe6297iS7Zi` | Subspace entity | Androgynous ethereal whisper, breathy, intimate, unsettling tenderness |
| Lt. Cmdr. Vasari | `c2JzWeXvKFw1UEJkIS20` | Elena Vasari (Arcturus XO) | Mid-thirties woman, shifts from terror to eerie serenity |

Update this table when new voices are saved.

## Quick Reference — Common Operations

### Generate a line with a saved voice
```
mcp__elevenlabs__text_to_speech
  text: "The line to speak"
  voice_id: "<voice_id>"        # Use voice_id for saved/cloned voices
  stability: 0.25               # Low = more emotional range
  similarity_boost: 0.5
  speed: 0.7                    # Slow for dramatic effect
  output_directory: "<project>/audio"
```

### Live Entity Voice (session play)
For real-time entity voice during sessions, use unique filenames (Foundry caches audio):
```
mcp__elevenlabs__text_to_speech
  text: "<formatted text — see Text Formatting below>"
  voice_id: "gr22TBs5Eoe6297iS7Zi"
  stability: 0.15
  similarity_boost: 0.5
  style: 0.3
  speed: 0.7
  output_directory: "<project>/audio"
```
Upload to `entity-voice/` on server with a unique name, then play:
```js
AudioHelper.play({ src: "entity-voice/<unique-name>.mp3", volume: 0.8, loop: false }, true);
```

### Generate a line with a stock voice
```
mcp__elevenlabs__text_to_speech
  text: "The line to speak"
  voice_name: "River - Relaxed, Neutral, Informative"  # Use voice_name for stock voices
  output_directory: "<project>/audio"
```

### Upload audio to Foundry server
```bash
# Create directory (once)
ssh -i ~/.ssh/id_ed25519 root@<FOUNDRY_HOST> "mkdir -p /home/foundry/foundrydata/Data/audio/<adventure-name>"

# Upload file
scp -i ~/.ssh/id_ed25519 <local-file>.mp3 root@<FOUNDRY_HOST>:/home/foundry/foundrydata/Data/audio/<adventure-name>/
```

### Add track to existing playlist
```js
// via foundry_exec_js
const playlist = game.playlists.getName("SC: The Cartographer");
await playlist.createEmbeddedDocuments("PlaylistSound", [{
  name: "Track Name",
  path: "audio/silent-cartographer/filename.mp3",
  repeat: false,
  volume: 0.8
}]);
```

### Create a new playlist
```js
await Playlist.create({
  name: "Playlist Name",
  description: "Description",
  mode: CONST.PLAYLIST_MODES.SEQUENTIAL,
  sounds: [{
    name: "Track Name",
    path: "audio/<adventure>/filename.mp3",
    repeat: false,
    volume: 0.8
  }]
});
```

### Play a track during a session
```js
const playlist = game.playlists.getName("SC: The Cartographer");
const sound = playlist.sounds.getName("Entity: I Have Mapped 78 of You");
await playlist.playSound(sound);
```

### Stop playback
```js
const playlist = game.playlists.getName("SC: The Cartographer");
await playlist.stopAll();
```

## Workflow — Full Pipeline

### Step 1: Choose or Design a Voice

**Option A — Search stock voices:**
```
mcp__elevenlabs__search_voices  search: "calm female"
```

**Option B — Search the full community library:**
```
mcp__elevenlabs__search_voice_library  search: "whisper androgynous"  page_size: 10
```

**Option C — Design a custom voice (recommended for unique characters):**
```
mcp__elevenlabs__text_to_voice
  voice_description: "Describe the voice character, tone, age, gender, accent, mood"
  text: "Sample line for the voice to speak"
  output_directory: "<project>/audio"
```
This generates **3 variants**. Play them with `afplay` and pick the best one.

### Step 2: Save the Voice (if custom-designed)

The `text_to_voice` previews are ephemeral. To save permanently, clone from the audio file via the ElevenLabs API:

```bash
curl -s -X POST "https://api.elevenlabs.io/v1/voices/add" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -F "name=Character Name" \
  -F "description=Voice description" \
  -F "files=@/path/to/chosen_preview.mp3" \
  | python3 -m json.tool
```

Returns `{"voice_id": "..."}`. **Update the Saved Voices table above** with the new voice.

> Note: The MCP `voice_clone` tool may reject generated preview files. Use the curl method above as a reliable fallback.

### Step 3: Generate Audio Lines

```
mcp__elevenlabs__text_to_speech
  text: "The dialogue line"
  voice_id: "<saved_voice_id>"
  stability: <0.0-1.0>          # Lower = more expressive/unpredictable
  similarity_boost: <0.0-1.0>   # Higher = closer to original voice
  style: <0.0-1.0>              # Higher = more stylistic exaggeration
  speed: <0.7-1.2>              # Lower = slower, more deliberate
  output_directory: "<project>/audio"
```

**Rename the output file** to something descriptive:
```bash
mv audio/tts_I_hav_20260228_225516.mp3 audio/entity-message-description.mp3
```

### Step 4: Upload to Foundry

```bash
scp -i ~/.ssh/id_ed25519 audio/<filename>.mp3 root@<FOUNDRY_HOST>:/home/foundry/foundrydata/Data/audio/<adventure>/
```

Verify with:
```
mcp__foundry__foundry_files  path: "audio/<adventure>"
```

### Step 5: Add to Playlist

```js
// via foundry_exec_js
const playlist = game.playlists.getName("Playlist Name");
await playlist.createEmbeddedDocuments("PlaylistSound", [{
  name: "Descriptive Track Name",
  path: "audio/<adventure>/<filename>.mp3",
  repeat: false,
  volume: 0.8
}]);
```

### Step 6: Preview / Play

Play locally first:
```bash
afplay /path/to/audio/file.mp3
```

Play in Foundry (streams to all players):
```js
const playlist = game.playlists.getName("Playlist Name");
const sound = playlist.sounds.getName("Track Name");
await playlist.playSound(sound);
```

## Sound Effects

Generate short ambient/atmospheric effects (0.5-5 seconds):

```
mcp__elevenlabs__text_to_sound_effects
  text: "Starship bridge ambient hum with occasional beeps"
  duration_seconds: 5
  loop: true                    # For ambient loops
  output_directory: "<project>/audio"
```

## Voice Parameter Guide

| Parameter | Range | Low Value Effect | High Value Effect | Entity Default |
|-----------|-------|-----------------|-------------------|----------------|
| stability | 0-1 | Expressive, varied, unpredictable | Monotone, consistent | 0.15 |
| similarity_boost | 0-1 | More creative interpretation | Closer to original | 0.5 |
| style | 0-1 | Neutral delivery | Exaggerated style | 0.3 |
| speed | 0.7-1.2 | Slow, deliberate | Fast, urgent | 0.7 |

**Character archetypes:**
- **Entity/alien**: stability 0.15, speed 0.7, style 0.3 — breathy, unstable, unsettling whisper
- **Panicked officer**: stability 0.3, speed 1.1, style 0.5 — emotional, urgent
- **Calm Vulcan**: stability 0.8, speed 0.9, style 0.0 — controlled, precise
- **Ship computer**: stability 0.9, speed 1.0, style 0.0 — flat, mechanical

## Text Formatting for TTS

### The Cartographer Entity Voice
The entity speaks with unnatural pauses and odd emphasis — as if reaching for words across dimensions.

**Formatting rules:**
- **Ellipses after verbs/pronouns** for dimensional pauses: `"I have mapped... seventy-eight of you."`
- **CAPITALISE key words** for odd, alien emphasis: `"Like music... made of... LIGHTNING."`
- **Frequent ellipses** — more pauses than natural speech: `"Your species is... the most beautiful structure... I have encountered"`
- **Spell out numbers**: `"seventy-eight"` not `"78"`, `"four point seven billion"` not `"4.7 billion"`
- **Short fragments** hit harder in the whispered voice

**Example — natural text vs formatted:**
- Natural: `"I am a cartographer. I map what I find beautiful."`
- Formatted: `"I am... a CARTOGRAPHER. I map... what I find... BEAUTIFUL."`

### General Tips
- Use **em dashes** (`—`) for interruptions or breaks in thought
- Short sentences hit harder in whispered voices
- For logs that degrade over time, generate the same voice with progressively lower stability

## File Organization

```
<project>/audio/                     # Local working directory (gitignored)
  entity-message-*.mp3               # Entity voice lines
  vasari-log-*.mp3                   # Vasari personal logs
  chen-possession-*.mp3              # Chen contamination lines
  sfx-*.mp3                          # Sound effects
  voice_design_*.mp3                 # Voice design previews (temporary)
  cartographer_clone_source.wav      # Clone source files (temporary)

Server: /home/foundry/foundrydata/Data/audio/
  silent-cartographer/               # Adventure audio deployed to Foundry
```

## Existing Playlists

| Playlist | Foundry ID | Contents |
|----------|-----------|----------|
| SC: The Cartographer | `9fpzAPJRpdRcDn8g` | Entity voice lines, NPC logs, possession cues |

Update this table when new playlists are created.

## Server Details

Read from project MEMORY.md. Key values:
- SSH: `ssh -i ~/.ssh/id_ed25519 root@<host>` (check MEMORY.md for current host)
- Foundry data path: `/home/foundry/foundrydata/Data/`
- Audio path on server: `/home/foundry/foundrydata/Data/audio/<adventure>/`
