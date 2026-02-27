# The Silent Cartographer — Image Asset Prompts

**Upload destination:** `worlds/star-trek-far-voyages/adventure-assets/silent-cartographer/`
**Format:** `.webp`
**Generator:** ChatGPT / Nano Banana 2

---

## Scene & Journal Images

### 1. arcturus-exterior.webp
**Used for:** Journal header (Session 1), Scene background
**Aspect ratio:** 16:9

> A Miranda-class Federation starship drifting in deep space, running lights glowing faintly against total darkness. No stars nearby — just the ship alone in the void. The hull is intact but something feels wrong — the deflector dish has an unusual blue-violet shimmer. Cinematic wide shot, dark and moody lighting, Star Trek TOS aesthetic with modern rendering. 16:9 aspect ratio.

### 2. arcturus-bridge.webp
**Used for:** Journal (Act 2 — Boarding)

> The bridge of an abandoned Federation starship, TOS era. Consoles are powered and lit but every seat is empty. PADDs are arranged in a strange geometric pattern on the captain's chair. Overhead lights flicker between normal warm tone and an unsettling blue-violet. No people. Eerie stillness. Slightly wide-angle to emphasize the emptiness. Cinematic lighting.

### 3. arcturus-crew-quarters.webp
**Used for:** Journal (Act 2 — Investigation)

> A crew quarters aboard a TOS-era Federation starship. The bed is neatly made, personal effects carefully arranged on the desk — but everything is positioned in an unnaturally precise grid pattern. A PADD on the desk displays a strange waveform. The room is lit but feels cold and sterile. Subtle wrongness. Close-medium shot.

### 4. subspace-scan.webp
**Used for:** Player Handout (scan data)

> Abstract scientific visualization: a vast, geometrically impossible structure rendered in blue-violet wireframe against black. It suggests a living network — organic and crystalline at once, extending in directions that shouldn't exist. Like a 4D being projected into 3D. Scientific readout aesthetic with Federation LCARS-style borders. Data overlay text optional.

### 5. personal-log-final.webp
**Used for:** Player Handout (crew logs)

> A Federation PADD (tablet device, TOS era) displaying a crew personal log. The text on screen is garbled — starting as normal English but dissolving into repeated symbols and overlapping sentences. The screen has a faint blue-violet tint bleeding in from the edges. Close-up shot of the PADD lying on a desk.

### 6. entity-manifestation.webp
**Used for:** Journal (Act 4-5), Roll Table reference

> Abstract horror: tendrils of blue-violet energy phasing through the corridors of a Federation starship. The energy has a pattern to it — almost like neural pathways or a nervous system made of light. A silhouette of a crew member stands in the corridor, their outline blurring where the energy passes through them. Dark, atmospheric, unsettling but not gory.

### 7. kirk-briefing.webp
**Used for:** Kirk actor portrait / Journal

> Captain James T. Kirk (TOS era, golden command tunic) standing at the head of a briefing table, looking troubled and determined. Other officers are seated around the table but out of focus. Dramatic lighting from overhead. Portrait composition, shoulders up. Star Trek TOS aesthetic.

### 8. enterprise-subspace.webp
**Used for:** Journal header (Session 2), possible Scene
**Aspect ratio:** 16:9

> The USS Enterprise (Constitution-class, TOS era) in space, but the space around it is wrong — reality is distorting, with blue-violet fractures in the starfield like cracks in glass. The ship appears normal but the space is warping. Cinematic wide shot, dramatic and ominous. 16:9 aspect ratio.

### 9. extended-challenge.webp
**Used for:** Journal (Act 6 — The Choice)
**Aspect ratio:** 16:9

> Split-composition image: on one side, the Enterprise's deflector dish charging with golden energy (communication option); on the other side, the USS Arcturus exploding in a subspace shockwave of blue-violet light (shockwave option). The two halves divided by a sharp diagonal line. Dramatic, cinematic, choice-focused. 16:9 aspect ratio.

### 10. arcturus-crew-return.webp
**Used for:** Journal (Resolution — communication path)

> 78 people materializing on a Federation transporter pad simultaneously — far too many for the pad, they're overlapping and crowded. Their expressions are dazed, confused, some crying, some staring blankly. Blue-violet energy dissipates around them. The transporter chief at the console looks stunned. Emotional, dramatic lighting.

---

## Actor Portraits (square, 1:1 aspect ratio)

### 11. kirk-portrait.webp
**Used for:** Kirk actor sheet `img`

> Captain Kirk (TOS era), head and shoulders portrait, gold command tunic, confident but with a hint of concern in his eyes. Neutral background. Star Trek TOS aesthetic, painterly style. Square format.

### 12. vasari-portrait.webp
**Used for:** Lt. Cmdr. Vasari actor sheet `img`

> A human woman in her 40s, Starfleet sciences blue tunic (TOS era), short dark hair, strong features. But something is wrong — her eyes have a faint blue-violet luminescence, and her expression is vacant, like she's listening to something far away. Portrait, square format.

### 13. chen-portrait.webp
**Used for:** Ensign Chen actor sheet `img`

> A young human man in Starfleet operations red tunic (TOS era), early 20s, East Asian features, looking frightened and confused. Slight blue-violet tint to the lighting on one side of his face. Portrait, square format.

### 14. arcturus-token.webp
**Used for:** USS Arcturus token `prototypeToken.texture.src`

> Top-down view of a Miranda-class starship (Star Trek), clean white hull with blue-violet energy faintly visible around the sensor array. Black background. Token style — circular framing, high contrast. Square format.

---

## Integration Notes

After generating and uploading all images, update Foundry assets:

```
# Actor portraits
Kirk:    Actor.zHPT5ewWSW4ZCIJb → img: kirk-portrait.webp
Vasari:  Actor.dUcddHa39JEhAChx → img: vasari-portrait.webp
Chen:    Actor.bUA3pLZnsNIyygDj → img: chen-portrait.webp
Arcturus: Actor.Y3zdu0qx8e9TPDbd → img: arcturus-exterior.webp
Arcturus token: prototypeToken.texture.src → arcturus-token.webp

# Journal pages — add <img> tags to relevant sections
```
