import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

const characters = [
  {
    name: "T'Karra",
    species: "Vulcan",
    role: "Diplomat",
    color: "#4a9eff",
    keyStats: "Reason 11, Control 10, Insight 10",
    keyAbilities: "Mind-Meld, Walking Encyclopedia, Augmented Reason, Mental Discipline",
    focuses: "Cybernetics, Diplomacy, Espionage, Ancient Technology, Pathfinder",
    values: "Knowledge is the true power · Curiosity is the mother of invention",
  },
  {
    name: "Brex",
    species: "Edosian",
    role: "Chief Engineer",
    color: "#ff6b35",
    keyStats: "Reason 12, Engineering 5, Medicine 4",
    keyAbilities: "Multi-Tasking, Neural Interface, Cyberneticist, Rocks into Replicators, Miracle Worker",
    focuses: "Warp Field Dynamics, Cybernetics, Diagnostic Expertise, Reverse Engineering",
    values: "Information is power · Never leave a stone unturned",
  },
  {
    name: "Malevolant",
    species: "Orion",
    role: "Political Liaison",
    color: "#2dd36f",
    keyStats: "Fitness 10, Presence 10, Science 4",
    keyAbilities: "Technical Expertise, That Wasn't Me, Criminal Understanding, Never at Face Value",
    focuses: "Computers, Hand-to-Hand Combat, Master Assassin, Persuasion, Sensor Ops",
    values: "Always Prepared, Always Vigilant · Most Poisonous Woman in the Quadrant",
  },
  {
    name: "Vex",
    species: "Human",
    role: "Science Officer",
    color: "#ffd534",
    keyStats: "Insight 11, Reason 11, Science 4, Engineering 4",
    keyAbilities: "Technological Savvy, Computer Expertise, Applied Research, Faith of the Heart",
    focuses: "Quantum Mechanics, Warp Field Dynamics, Physics, Power Management",
    values: "Discovery is a process, not an event · The cosmos is a symphony of physics",
  },
  {
    name: "Thon",
    species: "Andorian",
    role: "Chief of Security",
    color: "#eb445a",
    keyStats: "Fitness 11, Command 4, Security 4",
    keyAbilities: "Head on a Swivel, Get Down!, Just a Scratch, Intense",
    focuses: "Athletics, Hand-to-Hand Combat, Infiltration, Intimidation, Saboteur",
    values: "Preserve and protect · There is no substitute for vigilance",
  },
  {
    name: "Healer",
    species: "Kzinti",
    role: "Ship's Doctor",
    color: "#7c4dff",
    keyStats: "Insight 10, Reason 10, Medicine 4",
    keyAbilities: "Telepath, Field Medicine, Combat Medic, Doctor's Orders",
    focuses: "Surgery, Virology, Emergency Medicine, Trauma Surgery, Xenobiology",
    values: "A good mystery is irresistible · Trust, but verify",
  },
];

const adventures = [
  {
    id: "platos-cave",
    title: "Plato's Cave",
    era: "TOS",
    author: "Marco Rafalá",
    images: [
      { src: "/images/p27_1.jpeg", caption: "Explorers in EV suits investigate the frozen outpost on Tanghal IV" },
      { src: "/images/p36_1.jpeg", caption: "The horrifying Level 5 — robot surgeon, dead scientists wired into the quantum computer, and rows of failed stasis pods" },
    ],
    synopsis: "The crew is sent to resupply a remote archaeological outpost on Tanghal IV, an ice-age world. They find the lead archaeologist dead and no life signs. Exploring a 10,000-year-old doomsday bunker beneath the ice, they discover a quantum computer housing the merged consciousness of an entire civilization — driven insane by millennia of isolation. The entity wants to download itself into the crew's bodies. Their only ally: a boy whose mind survived intact inside the machine, willing to sacrifice himself to save them.",
    themes: ["Preservation without choice", "Identity & consciousness", "The ethics of destroying sentient digital life", "Sacrifice for the greater good"],
    deepListenerResonance: "This is the Deep Listener's dark reflection. The quantum consciousness IS what the entity could become — minds merged into one, driven insane by isolation, desperate for corporeal form. The entity reconstructs this scenario and doesn't understand why the merged minds are suffering. The crew must show it that preservation without consent is a form of death.",
    keyMechanics: [
      "Linear Challenge: restoring power to the outpost (Engineering-heavy)",
      "Combat: primitive security drones with machine guns",
      "Extended Task: separating the machine consciousness (Science/Engineering)",
      "Persuasion: negotiating with an insane entity (Difficulty 5)",
      "Moral dilemma: destroy the quantum computer vs. Starfleet Order 2",
    ],
    characterFit: [
      { name: "T'Karra", rating: 5, role: "Central figure — her Mind-Meld could contact the boy directly. Walking Encyclopedia helps with archaeological mysteries. The cybernetics focus is directly relevant to the brain-computer interfaces. Her diplomacy skills are tested against an entity that cannot be reasoned with normally." },
      { name: "Brex", rating: 5, role: "This is HIS adventure. Neural Interface means he could literally jack into the quantum computer. Cyberneticist and Reverse Engineering are perfectly suited to understanding the alien technology. Rocks into Replicators helps with the power restoration. Miracle Worker shines on the extended engineering tasks. His value 'Information is power' directly mirrors the machine consciousness's obsession." },
      { name: "Malevolant", rating: 3, role: "Sensor Operations helps investigate the outpost. Criminal Understanding might help decode the machine consciousness's deceptions. Her combat skills help against the drones. However, she lacks the science/engineering focus that drives the plot. Her 'Never at Face Value' talent is thematically perfect — nothing in this scenario is what it appears." },
      { name: "Vex", rating: 5, role: "Quantum Mechanics is literally the core science of this adventure (quantum computer!). Computer Expertise gives free dice on studying the system. Applied Research chains beautifully — every discovery feeds the next. Physics and Power Management help with the reactor. His value 'Discovery is a process, not an event' perfectly describes the slow unravelling of the mystery." },
      { name: "Thon", rating: 4, role: "Security escort for the away team in a hostile environment. The drone encounters are real combat with lethal projectile weapons — this is where Get Down! and Head on a Swivel protect the science team. Infiltration helps navigate the bunker. His protective instincts create great tension when the crew is taken hostage. 'Preserve and protect' clashes beautifully with the order to destroy sentient life." },
      { name: "Healer", rating: 4, role: "Telepath is crucial — she can sense the machine consciousness's emotions and the boy's fear. Emergency Medicine and Trauma Surgery needed for the hostile environment. Xenobiology helps study the alien mind-transfer tech. Her value 'Trust, but verify' is the exact right approach to the machine consciousness's claims. Doctor's Orders lets her take command in the medical crisis." },
    ],
  },
  {
    id: "footfall",
    title: "Footfall",
    era: "TNG",
    author: "Andrew Peregrine",
    images: [
      { src: "/images/p85_1.jpeg", caption: "The angel manifestation — a blazing golden humanoid with fiery wings appears to awestruck pilgrims" },
      { src: "/images/p93_1.jpeg", caption: "A Klingon warrior with bat'leth faces a massive red demon as civilians cower — the 'apocalypse' the planet-entity manifested" },
    ],
    synopsis: "The crew is sent to Ashgrave IV — 'Footfall' — a colony considered a holy place by dozens of species. They say the creator of the universe once stood here. A militant group called the Voice of Purity is vandalising shops, claiming divine instruction. But the real threat is the planet itself: a powerfully telepathic self-aware entity that has decided it must be 'god.' Confused by the contradictions in the faiths of its inhabitants, it creates angels and demons, and is about to trigger an apocalypse to 'purify' belief. The crew must climb a mountain and convince a god it isn't one.",
    themes: ["What is god? What is faith?", "The confusion of a powerful entity trying to understand mortals", "Identity crisis on a cosmic scale", "Philosophy over firepower"],
    deepListenerResonance: "Pure philosophical gold. The planet-entity is a confused god — EXACTLY what the Deep Listener is becoming. It read minds, created manifestations, and still doesn't understand the beings it studied. The crew debating theology with a confused god-entity is the perfect dress rehearsal for the campaign's climactic confrontation. The entity watching this scene learns: even with unlimited power, understanding comes from dialogue, not observation.",
    keyMechanics: [
      "Preludes: each PC explores their relationship with faith/secularism",
      "Combat: demons (Fitness 12, Daring 12) in wilderness encounter",
      "Diplomacy: extensive roleplay with Voice of Purity leader Annalisa Duval",
      "Storm encounter: protecting colonists from demon maelstrom",
      "Climax: pure conversation with 'god' — no combat solution exists",
      "Ritual pilgrimage: optional spiritual preparation affects disposition",
    ],
    characterFit: [
      { name: "T'Karra", rating: 5, role: "Vulcan spirituality meets secular logic — the adventure's central tension personified. Her Diplomacy focus is critical for Annalisa Duval and the Voice of Purity. Mind-Meld could attempt to contact the planet entity directly (Insight + Command, Diff 2). Vulcans are 'deeply spiritual but not religious' — the adventure text specifically calls out Vulcan faith traditions. Her value 'A logical mind is a focused mind' will be challenged by a planet that makes everyone FEEL things." },
      { name: "Brex", rating: 2, role: "Limited direct role. His engineering skills aren't central to a faith-and-philosophy adventure. However, his 'Resistance is never futile' value creates interesting tension with an entity that seems omnipotent. His scanning abilities help with the technical analysis of the angel/demon energy signatures. Could be the voice of secular rationalism." },
      { name: "Malevolant", rating: 4, role: "Persuasion is key throughout. Criminal Understanding helps decode Annalisa's group and their true motivations. Hand-to-Hand Combat useful against demons. Her 'There Are Always Possibilities' value is the thematic heart of the resolution — showing the entity alternatives to godhood. 'That Wasn't Me' could be fascinating in the context of an entity that reads minds." },
      { name: "Vex", rating: 3, role: "Science scans prove the entity isn't supernatural (Insight + Science, Diff 2 to detect organic energy patterns). Applied Research chains discovery to discovery. But this adventure is fundamentally about philosophy, not physics. His 'Act with confidence, even if you don't feel confident' is tested when facing literal divine manifestations. Raised on Tellar Prime — Tellarites are specifically noted as religious arguers!" },
      { name: "Thon", rating: 4, role: "Andorian military heritage includes blood rituals and combat faith traditions — the adventure calls these out specifically. Security is needed for the demon encounters and protecting colonists during the storm. His Command 4 helps with the Presence + Command tasks throughout. Intimidation works on the Voice of Purity followers. But the real gold: his values are ALL about protection — what happens when the thing threatening people IS god?" },
      { name: "Healer", rating: 5, role: "TELEPATH. This is enormous. She can read the planet's mind (or try — Insight + Command, Diff 2) and discover it's one confused entity, not many gods. Every telepathic character gets free insight into the entity's emotions. Her Kzinti telepathy senses surface thoughts — imagine sensing the confusion of a being that thinks it's god. 'A good mystery is irresistible' drives the investigation. 'Trust, but verify' is the exact philosophy needed when facing divine claims." },
    ],
  },
  {
    id: "cry-from-void",
    title: "A Cry from the Void",
    era: "TNG",
    author: "Ian Lemke & Spring Netto",
    images: [
      { src: "/images/p105_1.jpeg", caption: "Crew in pressure suits explore the crystalline ocean floor of Abassa VII — glowing crystal formations tower above them" },
      { src: "/images/p43_1.jpeg", caption: "The Big Dipper skyhook from 'Drawing Deeply from the Well' — visual reference for the alien megastructure aesthetic of this compendium" },
    ],
    synopsis: "While cataloguing systems at the edge of Federation space, the ship is struck by a tetryon wave carrying an embedded distress call in an unknown language. Tracing it to Abassa VII — a violet-hued world with 95% amethyst ocean — they find an illegal Ferengi deuterium refinery run by Lishka. Workers have gone missing. The ocean itself is a living entity: sentient, existing partly in subspace, with a lifecycle that shifts from liquid to crystal. Harmed by the mining, it cried out in the only way it knew. It captured workers to study, trying to understand the creatures causing it pain. The crew must make first contact with an ocean.",
    themes: ["First contact with something utterly alien", "Unintentional harm by colonizers", "Communication across incomprehensible difference", "The entity as mirror — studying those who cause it pain"],
    deepListenerResonance: "This is the most direct parallel to the Deep Listener. A sentient entity that captured people to study them, trying to understand the creatures in its domain. It cried out for help across subspace. It exists in multiple dimensions. It didn't mean harm — it was trying to understand. The crew making peaceful first contact with something that imprisoned people to study them... and realising that's EXACTLY what the Deep Listener did. This is the mirror trial.",
    keyMechanics: [
      "Ship encounter: Ferengi interceptor standoff (diplomacy or combat)",
      "Investigation: uncovering the latinum smuggling operation",
      "Extended search: locating workers in 30,000m deep ocean trench",
      "Deep dive: modifying shuttlecraft/suits for extreme pressure",
      "First contact: communicating with a planet-sized ocean entity",
      "Time pressure: storms destroying refinery + Lishka planning retaliation",
      "Unusual phenomena: hallucinations, reveries, flashbacks from entity contact",
    ],
    characterFit: [
      { name: "T'Karra", rating: 4, role: "Mind-Meld could be attempted with the ocean entity (unprecedented!). Diplomacy handles Lishka and the political complexity. Espionage focus helps uncover the latinum smuggling. Ancient Technology focus relevant to the entity's alien nature. However, the adventure leans more science/engineering than diplomacy in its middle acts." },
      { name: "Brex", rating: 5, role: "Engineering dominates the middle act — modifying shuttlecraft for 30,000m depth, understanding the refinery equipment, working out what the 'extra machinery' does. Reverse Engineering helps with the alien crystalline tech. Diagnostic Expertise for the cocoon analysis. Imaging Systems for scanning the ocean. His value 'I finish what I start' drives the rescue forward under time pressure." },
      { name: "Malevolant", rating: 5, role: "The Ferengi subplot is HER playground. Criminal Understanding immediately flags the smuggling operation. 'Never at Face Value' sees through Lishka's cover story. Persuasion for negotiating with Lishka (who has +2 Difficulty on persuasion unless offered a trade!). Sensor Operations crucial for the ocean search. Technical Expertise helps with ship's computer/sensor tasks. An Orion dealing with a renegade Ferengi woman is fantastic roleplay — two women who've escaped their society's expectations." },
      { name: "Vex", rating: 5, role: "Quantum Mechanics and Physics directly relevant to tetryon particle analysis. The message deciphering is a Linear Challenge (Control + Engineering, then Insight + Science) built for him. Computer Expertise gives free dice on the signal processing. Applied Research chains each discovery. His 'Discovery is a process, not an event' is the adventure's thesis. The whole deep ocean sequence is pure science fiction wonder." },
      { name: "Thon", rating: 3, role: "The Ferengi interceptor encounter gives Security something to do. Protecting the team during the deep ocean dive. Infiltration could help sneak into the restricted refinery area. But this adventure has less combat than the others — the entity can't be fought, only understood. His protective instincts work well for the worker rescue mission. Saboteur focus could be used to disable the refinery's sensor jammers." },
      { name: "Healer", rating: 5, role: "TELEPATH again — and this time the entity is actively trying to make telepathic contact (hallucinations, reveries). She might be the first to understand the ocean is alive. The rescued workers are in crystal cocoons requiring Medicine + Science (Diff 2) to understand. Biology/Xenobiology is directly relevant to the ocean entity's lifecycle. Emergency Medicine and Trauma Surgery for treating the encased workers. 'A good mystery is irresistible' — an entire ocean that's alive IS the mystery." },
    ],
  },
];

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5" title={`${rating}/5 character fit`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`text-sm ${i <= rating ? "text-amber-400" : "text-zinc-600"}`}>★</span>
      ))}
    </span>
  );
}

function CharacterBadge({ char }: { char: (typeof characters)[0] }) {
  return (
    <Badge variant="outline" className="text-xs border-current" style={{ color: char.color }}>
      {char.name}
    </Badge>
  );
}

function AdventurePanel({ adventure }: { adventure: (typeof adventures)[0] }) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">{adventure.title}</h2>
          <Badge variant="secondary" className="text-xs bg-zinc-800 text-zinc-300">{adventure.era} Era</Badge>
          <span className="text-xs text-zinc-500">by {adventure.author}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adventure.images.map((img, i) => (
            <div key={i} className="space-y-2">
              <div
                className="overflow-hidden rounded-lg border border-zinc-800 cursor-pointer hover:border-zinc-600 transition-colors"
                onClick={() => setExpandedImage(expandedImage === img.src ? null : img.src)}
              >
                <img
                  src={img.src}
                  alt={img.caption}
                  className={`w-full object-cover transition-all duration-300 ${expandedImage === img.src ? "max-h-[600px]" : "max-h-[240px]"}`}
                />
              </div>
              <p className="text-xs text-zinc-500 italic leading-relaxed">{img.caption}</p>
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-zinc-800" />

      <div>
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Synopsis</h3>
        <p className="text-zinc-300 leading-relaxed text-[15px]">{adventure.synopsis}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {adventure.themes.map((theme, i) => (
          <Badge key={i} variant="outline" className="text-xs border-violet-800/50 text-violet-300 bg-violet-950/30">{theme}</Badge>
        ))}
      </div>

      <Separator className="bg-zinc-800" />

      <Card className="bg-violet-950/20 border-violet-800/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-violet-300 uppercase tracking-wider">Deep Listener Resonance</CardTitle>
          <CardDescription className="text-xs text-violet-400/70">How this adventure connects to the Silent Cartographer campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-violet-200/90 text-[15px] leading-relaxed">{adventure.deepListenerResonance}</p>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Key Mechanics</h3>
        <ul className="space-y-1.5">
          {adventure.keyMechanics.map((mechanic, i) => (
            <li key={i} className="text-zinc-400 text-sm flex gap-2">
              <span className="text-zinc-600 select-none">▸</span>
              <span>{mechanic}</span>
            </li>
          ))}
        </ul>
      </div>

      <Separator className="bg-zinc-800" />

      <div>
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Character Fit Analysis</h3>
        <Accordion type="multiple" className="space-y-2">
          {adventure.characterFit.map((cf) => {
            const char = characters.find((c) => c.name === cf.name)!;
            return (
              <AccordionItem key={cf.name} value={cf.name} className="border border-zinc-800 rounded-lg px-4 data-[state=open]:bg-zinc-900/50">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: char.color }} />
                    <span className="font-medium text-zinc-200">{cf.name}</span>
                    <span className="text-xs text-zinc-500">{char.species} {char.role}</span>
                    <RatingStars rating={cf.rating} />
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-zinc-400 text-sm leading-relaxed pb-2">{cf.role}</p>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}

function CharacterSummary() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {characters.map((char) => (
        <Card key={char.name} className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: char.color }} />
              <CardTitle className="text-base">{char.name}</CardTitle>
            </div>
            <CardDescription>{char.species} {char.role}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-zinc-500 text-xs uppercase tracking-wider">Key Stats</span>
              <p className="text-zinc-300">{char.keyStats}</p>
            </div>
            <div>
              <span className="text-zinc-500 text-xs uppercase tracking-wider">Talents</span>
              <p className="text-zinc-400">{char.keyAbilities}</p>
            </div>
            <div>
              <span className="text-zinc-500 text-xs uppercase tracking-wider">Focuses</span>
              <p className="text-zinc-400">{char.focuses}</p>
            </div>
            <div>
              <span className="text-zinc-500 text-xs uppercase tracking-wider">Values</span>
              <p className="text-zinc-400 italic">{char.values}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ComparisonMatrix() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="text-left py-3 px-2 text-zinc-400 font-medium">Character</th>
            {adventures.map((a) => (
              <th key={a.id} className="text-center py-3 px-3 text-zinc-400 font-medium">{a.title}</th>
            ))}
            <th className="text-center py-3 px-3 text-zinc-400 font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {characters.map((char) => {
            const scores = adventures.map((a) => a.characterFit.find((cf) => cf.name === char.name)!.rating);
            const total = scores.reduce((a, b) => a + b, 0);
            return (
              <tr key={char.name} className="border-b border-zinc-800/50 hover:bg-zinc-900/50">
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: char.color }} />
                    <span className="text-zinc-200 font-medium">{char.name}</span>
                    <span className="text-zinc-600 text-xs">{char.species}</span>
                  </div>
                </td>
                {scores.map((score, i) => (
                  <td key={i} className="text-center py-3 px-3"><RatingStars rating={score} /></td>
                ))}
                <td className="text-center py-3 px-3">
                  <span className={`font-bold ${total >= 14 ? "text-amber-400" : total >= 12 ? "text-zinc-200" : "text-zinc-400"}`}>
                    {total}/15
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RecommendationPanel() {
  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-lg">Recommended Trial Order for Session 3</CardTitle>
          <CardDescription>Adapted as Deep Listener trial reconstructions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            {
              num: 1,
              title: "Plato's Cave",
              subtitle: "The Prison of Preservation",
              replaces: "Replaces: Doomsday Machine.",
              desc: "The quantum consciousness is the entity's dark reflection — minds merged, isolated, insane. The entity reconstructs this and asks: \"Why do they suffer? I preserved them perfectly.\" The crew teaches it that preservation without choice is death. Brex, Vex, and T'Karra shine brightest here.",
              chars: ["T'Karra", "Brex", "Vex", "Thon", "Healer"],
            },
            {
              num: 2,
              title: "A Cry from the Void",
              subtitle: "The Mirror",
              replaces: "Replaces: A Taste of Armageddon.",
              desc: "The sentient ocean captured people to study them — exactly what the Deep Listener did. The crew making first contact with a being that imprisoned people out of curiosity and pain is the entity watching itself be forgiven. Or judged. Malevolant, Brex, Vex, and Healer own this scenario.",
              chars: ["Malevolant", "Brex", "Vex", "Healer"],
            },
            {
              num: 3,
              title: "Footfall",
              subtitle: "The Question",
              replaces: "Final trial before the cliffhanger.",
              desc: "A confused god-entity is the Deep Listener's own identity crisis made manifest. The crew climbing the mountain to tell a god it isn't one — that's the entity asking the crew the question it can't ask itself: \"What am I?\" This should end Session 3, with the subspace lattice shuddering as the entity processes the answer. T'Karra, Healer, and Thon carry the climax.",
              chars: ["T'Karra", "Healer", "Thon", "Malevolant"],
            },
          ].map((trial) => (
            <div key={trial.num} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-900/50 border border-violet-700 flex items-center justify-center text-violet-300 font-bold text-sm">
                {trial.num}
              </div>
              <div>
                <h4 className="font-semibold text-zinc-200">
                  {trial.title} <span className="text-zinc-500 font-normal">— "{trial.subtitle}"</span>
                </h4>
                <p className="text-zinc-400 text-sm mt-1">
                  <strong>{trial.replaces}</strong> {trial.desc}
                </p>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {trial.chars.map((name) => {
                    const char = characters.find((c) => c.name === name)!;
                    return <CharacterBadge key={name} char={char} />;
                  })}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-base text-zinc-300">Foundry VTT Setup Considerations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-zinc-400">
          {[
            { label: "Scenes", text: "Each trial needs 2–3 scenes (approach, main location, climax). The entity's violet geometric overlay should bleed through all of them." },
            { label: "NPCs", text: "Machine Consciousness (Major NPC), The Boy, Annalisa Duval (Major NPC), Commander Chahal (Notable NPC), Lishka (Major NPC), demons (Minor NPC)." },
            { label: "Tokens", text: "Security drones (Plato's Cave), demons + angels (Footfall), Ferengi interceptors (Cry from the Void)." },
            { label: "Journal Entries", text: "Captain's Log entries for each act, data files (Ashgrave IV, Tanghal IV, Abassa VII), NPC stat blocks." },
            { label: "Music", text: "Plato's Cave (horror/isolation), Footfall (awe/divine), Cry from the Void (alien wonder/ocean ambience)." },
          ].map((item) => (
            <div key={item.label} className="flex gap-2">
              <span className="text-violet-400 select-none">▸</span>
              <span><strong className="text-zinc-300">{item.label}:</strong> {item.text}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-5xl mx-auto p-4 sm:p-8">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-50">
            Strange New Worlds<span className="text-violet-400"> — Trial Adventures</span>
          </h1>
          <p className="text-zinc-500 mt-2 text-sm">
            Session 3 candidate adventures from the SNW Mission Compendium, analysed for the Silent Cartographer campaign's Deep Listener trials
          </p>
        </header>

        <Tabs defaultValue="platos-cave" className="space-y-6">
          <TabsList className="bg-zinc-900 border border-zinc-800 h-auto flex-wrap">
            {adventures.map((a) => (
              <TabsTrigger key={a.id} value={a.id} className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400">
                {a.title}
              </TabsTrigger>
            ))}
            <TabsTrigger value="characters" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400">Characters</TabsTrigger>
            <TabsTrigger value="comparison" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400">Comparison</TabsTrigger>
            <TabsTrigger value="recommendation" className="data-[state=active]:bg-violet-900/50 data-[state=active]:text-violet-200 text-zinc-400">Recommendation</TabsTrigger>
          </TabsList>

          {adventures.map((a) => (
            <TabsContent key={a.id} value={a.id}><AdventurePanel adventure={a} /></TabsContent>
          ))}
          <TabsContent value="characters"><CharacterSummary /></TabsContent>
          <TabsContent value="comparison">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-zinc-100">Character Fit Matrix</h2>
              <p className="text-zinc-500 text-sm">How well each character's stats, talents, focuses, and values align with each adventure</p>
              <ComparisonMatrix />
            </div>
          </TabsContent>
          <TabsContent value="recommendation"><RecommendationPanel /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
