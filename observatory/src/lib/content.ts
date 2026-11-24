import type { AspectType, ChartData } from "./astro";
import { ASPECT_MAP, HOUSE_NAMES, SIGNS } from "./astro";
import { MODALITY_OF_SIGN, separation } from "./model";

export type Depth = "discover" | "deep";

/* ================= planets ================= */

export interface PlanetEntry {
  role: string;
  discover: string;
  deep: string;
  reflection: string;
}

export const PLANET_INFO: Record<string, PlanetEntry> = {
  sun: {
    role: "Identity and self-expression — the through-line of who you are becoming.",
    discover: "The Sun is the story you tell about yourself when no one is grading it. Its sign colors how you naturally shine — what makes you feel most like you.",
    deep: "Traditional ruler of Leo and the diurnal luminary. The Sun signifies vitality, vocation, and conscious purpose; by sign it shows the mode of self-actualization, by house the department of life where that purpose seeks a stage. It is the chart's integrative center, not a personality verdict.",
    reflection: "When do you feel most unmistakably yourself — and what were you doing?",
  },
  moon: {
    role: "Emotions and inner needs — what soothes you and what safety requires.",
    discover: "The Moon is your inner weather: how feelings arrive, what comfort looks like, and what you need to feel safe. Its sign describes your emotional first language.",
    deep: "Traditional ruler of Cancer and the nocturnal luminary. The Moon signifies receptivity, habit, memory, and care — the pre-verbal substrate. By sign: the style of emotional processing; by house: where you seek shelter and belonging. Its speed makes it the chart's most personal timing hand.",
    reflection: "What reliably restores you when you are frayed — and do you let yourself have it?",
  },
  mercury: {
    role: "Thinking and exchange — how you learn, speak, and connect ideas.",
    discover: "Mercury is your messenger: how you think out loud, learn fastest, and explain things. Its sign shapes the style — quick and playful, careful and precise, dreamy and associative.",
    deep: "Traditional ruler of Gemini and Virgo. Mercury signifies cognition, language, commerce, and mediation between realms. By sign: perceptual style and rhetorical mode; by house: the life-area where information work happens. Retrograde at birth is traditionally read as an inward-turned review function, not a malfunction.",
    reflection: "How do you think best — talking it out, writing it down, or walking it off?",
  },
  venus: {
    role: "Values and affection — what you love, how you bond, what beauty means.",
    discover: "Venus is your heart's taste: what draws you, how you show care, and what makes something feel worthwhile. Its sign colors both romance and pleasures like art, food, and ease.",
    deep: "Traditional ruler of Taurus and Libra. Venus signifies attraction, valuation, diplomacy, and aesthetic judgment — the principle of harmony and choice. By sign: the mode of relating and desiring; by house: where you cultivate pleasure, alliance, and worth. Aspects to Venus traditionally modify ease or complexity in bonding.",
    reflection: "What do you find beautiful even on an ordinary day?",
  },
  mars: {
    role: "Drive and assertion — how you pursue, protect, and push forward.",
    discover: "Mars is your engine: how you go after what you want, handle conflict, and spend energy. Its sign shows whether you charge, strategize, charm, or endure.",
    deep: "Traditional ruler of Aries (and, classically, Scorpio). Mars signifies conation — desire made kinetic: courage, competition, boundaries, and work. By sign: the style of assertion; by house: where you must act to feel alive. Hard aspects to Mars traditionally describe friction around anger or initiative, not a flaw of character.",
    reflection: "What is worth fighting for right now — and what would fighting well look like?",
  },
  jupiter: {
    role: "Growth and meaning — where you expand, trust, and look for the bigger picture.",
    discover: "Jupiter is your compass for 'more': what you believe in, where luck seems to find you, and how you grow. Its sign colors your faith — in people, ideas, or adventure.",
    deep: "Traditional ruler of Sagittarius (and, classically, Pisces). Jupiter signifies abundance, philosophy, law, and the benefic principle of expansion. By sign: the mode of meaning-making; by house: the arena of opportunity and generosity. Tradition warns it enlarges whatever it touches — wisdom and excess alike.",
    reflection: "Where is life currently inviting you to think bigger?",
  },
  saturn: {
    role: "Structure and mastery — where effort, limits, and time become teachers.",
    discover: "Saturn is your builder: where things take longer, matter more, and reward patience. Its sign and house point to the lessons you master slowly — and keep.",
    deep: "Traditional ruler of Capricorn (and, classically, Aquarius). Saturn signifies boundary, duration, responsibility, and the reality principle. By sign: the style of discipline; by house: where maturation is non-negotiable. Its position is traditionally read as the site of greatest long-term competence, earned — never a curse.",
    reflection: "What slow thing in your life deserves more respect?",
  },
  uranus: {
    role: "Liberation and originality — where you break patterns and need room.",
    discover: "Uranus is your rebel spark: where you need freedom, surprise yourself, and refuse the script. Its sign is generational; its house is personal.",
    deep: "Modern ruler of Aquarius. Uranus signifies disruption, individuation, and sudden insight — the principle that breaks crystallized forms. The sign marks a generational cohort (slow-moving); the house marks where you personally electrify, experiment, or detach. Aspects show where change arrives abruptly.",
    reflection: "Where do you feel most alive when you improvise?",
  },
  neptune: {
    role: "Dream and dissolution — where boundaries soften into imagination or fog.",
    discover: "Neptune is your dreamer: where you imagine, idealize, and merge. Its sign is generational; its house shows where you see the infinite — or need clearer edges.",
    deep: "Modern ruler of Pisces. Neptune signifies transcendence, image, compassion, and the oceanic — also illusion and escapism in traditional caution. Sign: generational dreamscape; house: where you dissolve boundaries, for art or for evasion. Hard aspects traditionally ask for discernment without killing wonder.",
    reflection: "What are you romanticizing — and what is lovely about it anyway?",
  },
  pluto: {
    role: "Depth and transformation — where pressure remakes things over time.",
    discover: "Pluto is your undertow: where change runs deep, control gets tested, and rebirth happens. Its sign is generational; its house shows your personal zone of intensity.",
    deep: "Modern ruler of Scorpio. Pluto signifies power, elimination, and regeneration — the principle that what is buried returns transformed. Sign: generational undercurrent; house: where you encounter control, loss, and renewal most directly. Its aspects traditionally mark the chart's pressure points and greatest metamorphic potential.",
    reflection: "What are you outgrowing, even if letting go feels early?",
  },
};

/* ================= signs ================= */

export interface SignEntry { discoverMod: string; deepMod: string; vibe: string }

export const SIGN_INFO: SignEntry[] = [
  { vibe: "Direct, brave, first to begin.", discoverMod: "Here the planet acts fast and plainly — trying, daring, starting before all doubts are answered.", deepMod: "Cardinal fire under Mars: initiative is the native idiom. Planets here operate in a forthright, competitive, pioneering register; the traditional caution is haste outrunning stamina." },
  { vibe: "Steady, sensual, built to last.", discoverMod: "Here the planet slows down and savors — choosing what endures, enjoying what is real, holding what matters.", deepMod: "Fixed earth under Venus: persistence is the native idiom. Planets here work through loyalty, sensuality, and material craft; the traditional caution is possessiveness or inertia." },
  { vibe: "Quick, curious, always connecting.", discoverMod: "Here the planet talks, asks, and links — juggling ideas, loving variety, learning by conversation.", deepMod: "Mutable air under Mercury: versatility is the native idiom. Planets here operate through wit, duality, and exchange; the traditional caution is scattering attention across too many threads." },
  { vibe: "Tender, protective, deeply feeling.", discoverMod: "Here the planet feels first — seeking safety, tending home and heart, remembering everything.", deepMod: "Cardinal water under the Moon: nurturance is the native idiom. Planets here work through care, memory, and emotional intelligence; the traditional caution is defensiveness mistaken for safety." },
  { vibe: "Warm, radiant, made to create.", discoverMod: "Here the planet wants a stage — expressing, celebrating, and warming the room by being fully itself.", deepMod: "Fixed fire under the Sun: magnanimity is the native idiom. Planets here operate through creativity, loyalty, and generous display; the traditional caution is pride when applause becomes fuel." },
  { vibe: "Precise, helpful, quietly excellent.", discoverMod: "Here the planet notices everything — refining, organizing, and improving what others overlook.", deepMod: "Mutable earth under Mercury: discernment is the native idiom. Planets here work through analysis, service, and craft; the traditional caution is worry — critique turned inward." },
  { vibe: "Fair, graceful, seeking harmony.", discoverMod: "Here the planet weighs and relates — listening well, smoothing edges, choosing together over alone.", deepMod: "Cardinal air under Venus: diplomacy is the native idiom. Planets here operate through partnership, aesthetics, and justice; the traditional caution is indecision when harmony costs honesty." },
  { vibe: "Intense, loyal, unafraid of depth.", discoverMod: "Here the planet goes all in — feeling strongly, bonding tightly, transforming through trust.", deepMod: "Fixed water under Pluto (Mars classically): depth is the native idiom. Planets here work through intensity, loyalty, and regeneration; the traditional caution is control where surrender is needed." },
  { vibe: "Expansive, honest, aimed at meaning.", discoverMod: "Here the planet looks farther — exploring, believing, laughing, and finding the bigger why.", deepMod: "Mutable fire under Jupiter: aspiration is the native idiom. Planets here operate through philosophy, travel, and straight talk; the traditional caution is overreach — promising beyond the map." },
  { vibe: "Patient, ambitious, built for the long climb.", discoverMod: "Here the planet commits — working steadily, respecting limits, and earning the summit step by step.", deepMod: "Cardinal earth under Saturn: mastery is the native idiom. Planets here work through discipline, structure, and earned authority; the traditional caution is severity — mistaking hardness for strength." },
  { vibe: "Original, humane, wired for the future.", discoverMod: "Here the planet questions and invents — befriending the strange, freeing the stuck, thinking in systems.", deepMod: "Fixed air under Uranus (Saturn classically): independence is the native idiom. Planets here operate through innovation, community, and principle; the traditional caution is detachment that forgets warmth." },
  { vibe: "Gentle, imaginative, attuned to everything.", discoverMod: "Here the planet dreams and dissolves — imagining, forgiving, sensing what cannot be said.", deepMod: "Mutable water under Neptune (Jupiter classically): compassion is the native idiom. Planets here work through intuition, art, and surrender; the traditional caution is fog — unclear edges around self and other." },
];

/* ================= houses ================= */

export interface HouseEntry { theme: string; discover: string; deep: string }

export const HOUSE_INFO: HouseEntry[] = [
  { theme: "Self & presence", discover: "How you meet the world — first impressions, instincts, the way you start things.", deep: "The Ascendant's house: the vehicle of incarnation. Planets here color the persona directly and act with immediacy; tradition reads them as highly visible, for better and louder." },
  { theme: "Resources & worth", discover: "What you have and what you value — money, skills, and self-worth.", deep: "Substance: earned income, possessions, and embodied values. Planets here describe how you generate and guard resources, and where worth must be proven to yourself first." },
  { theme: "Learning & exchange", discover: "How you communicate daily — siblings, neighbors, short trips, everyday curiosity.", deep: "The house of the goddess (Joy of the Moon, classically): mind in motion. Planets here animate writing, study, trade, and the immediate environment." },
  { theme: "Home & roots", discover: "Where you come from and where you land — family, home, inner foundations.", deep: "The angle of midnight (Imum Coeli): ancestry, dwelling, and the private self. Planets here work beneath the surface, shaping security and what 'home' must provide." },
  { theme: "Joy & creation", discover: "Where you play and shine — romance, art, children, delight.", deep: "The house of Good Fortune (Joy of Venus, classically): pleasure and creative risk. Planets here seek expression, play, and applause; tradition links them to romance and works of the heart." },
  { theme: "Work & care", discover: "How you serve and stay well — routines, craft, health, helpfulness.", deep: "The house of Bad Fortune turned practical (Joy of Mars, classically): labor, service, and the body. Planets here ask for useful rhythms; tradition reads them as the craft of maintenance." },
  { theme: "Partnership", discover: "How you meet others one-to-one — love, friendship, rivals, agreements.", deep: "The Descendant's house: the significant other as mirror. Planets here describe what you seek — and project — in close bonds; tradition reads them as relationship curriculum." },
  { theme: "Depth & sharing", discover: "Where things get serious — shared resources, trust, endings and beginnings.", deep: "The house of death-and-rebirth (Joy of Saturn, classically): joint assets, intimacy, and the occult. Planets here handle what is taboo, pooled, or transformative." },
  { theme: "Meaning & distance", discover: "How you widen your world — study, travel, beliefs, big questions.", deep: "The house of God (Joy of the Sun, classically): philosophy, higher learning, and far horizons. Planets here seek wisdom through distance — literal or intellectual." },
  { theme: "Calling & visibility", discover: "How you show up publicly — work, reputation, direction.", deep: "The Midheaven's house: career, honors, and the visible summit. Planets here strive toward contribution and recognition; tradition reads them as the public record of the chart." },
  { theme: "Allies & hopes", discover: "Who walks with you — friends, groups, wishes for the future.", deep: "The house of the Good Spirit (Joy of Jupiter, classically): friendship, networks, and aspiration. Planets here gather allies and orient toward what is possible together." },
  { theme: "Rest & release", discover: "Where you retreat and renew — solitude, dreams, letting go.", deep: "The house of Bad Spirit (Joy of Saturn in some traditions): seclusion, the unconscious, and hidden work. Planets here operate backstage — in dreams, service behind the scenes, or quiet repair." },
];

/* ================= aspects ================= */

export interface AspectEntry {
  discover: string;
  deep: string;
  dynamic: string;
  reflection: string;
}

export const ASPECT_INFO: Record<string, AspectEntry> = {
  conj: {
    discover: "Two planets in the same neighborhood, speaking at once. Their themes blend into one voice — hard to separate, powerful when aimed well.",
    deep: "0° nominal. Fusion: two principles occupy the same sign-space and act as a compound. Traditional reading stresses mutual intensification — strengths compound and blind spots merge. Orb discipline matters most here; tighter means more inseparable.",
    dynamic: "their energies merge into a single instrument",
    reflection: "Where do these two drives already act as one — and is that teamwork or static?",
  },
  sextile: {
    discover: "A friendly opening between planets — like an unlocked door. The connection works when you walk through it; nothing is forced.",
    deep: "60° nominal, traditionally a minor harmonious aspect linking compatible elements. It signifies opportunity requiring cultivation — dexterity rather than gift. Many delineators weight it below the trine: usable, not automatic.",
    dynamic: "they offer each other usable openings",
    reflection: "What small step would let these two parts of you collaborate?",
  },
  square: {
    discover: "Two planets wanting different things at the same time. It feels like friction — but friction is also how skills and character get built.",
    deep: "90° nominal. Dynamic tension between incompatible elements/modalities: both principles demand expression and obstruct each other. Traditional reading: the aspect of effort, crisis, and achievement — constructive when worked, corrosive when avoided. Distinguish applying from separating only with timed precision; here, note the orb.",
    dynamic: "they challenge each other into growth",
    reflection: "What would it look like to honor both sides instead of picking one?",
  },
  trine: {
    discover: "Two planets in easy rhythm, like breathing. Things flow here — talents feel natural, sometimes so natural you forget they are talents.",
    deep: "120° nominal linking same-element signs: gifted flow with minimal resistance. Traditional reading: the great benefic pattern — talent, ease, protection. The caution is inertia; trines show where life helps, not where it pushes.",
    dynamic: "they support each other with unusual ease",
    reflection: "What comes easily to you here that others seem to struggle with?",
  },
  opp: {
    discover: "Two planets across from each other, pulling in opposite directions. The work is balance — seeing the other side without losing your own.",
    deep: "180° nominal. Polarity made conscious: the axis demands integration through relationship and perspective-taking. Traditional reading stresses projection — the far planet often appears first in other people. Awareness converts tug-of-war into stereoscopic vision.",
    dynamic: "they balance each other across an axis",
    reflection: "Who in your life carries the other end of this axis well?",
  },
  quincunx: {
    discover: "Two planets slightly out of sync — an awkward angle that asks for small, ongoing adjustments rather than one big fix.",
    deep: "150° nominal linking incompatible element and modality. The traditional reading is adjustment without resolution: health-like maintenance, scheduling, and humility. Minor aspect; weight it below the five majors.",
    dynamic: "they ask each other for patient adjustment",
    reflection: "What tiny recurring adjustment would make life smoother here?",
  },
};

/* ================= glossary ================= */

export interface GlossaryTerm { short: string; deeper: string }

export const GLOSSARY: Record<string, GlossaryTerm> = {
  Ascendant: { short: "The sign rising on the eastern horizon at birth — your outward approach.", deeper: "The Ascendant (cusp of the 1st house) sets the whole house framework. It describes first impressions and instinctive style rather than inner identity. Shown on the wheel as ASC." },
  Midheaven: { short: "The highest point of the chart — public direction and calling.", deeper: "The Midheaven (MC, cusp of the 10th) marks the southernmost culmination of the ecliptic. Traditionally: career, reputation, visible contribution. Marked M C on the wheel." },
  "House cusp": { short: "The line where a house begins — its doorway degree.", deeper: "A planet just inside a cusp belongs to that house. Cusps here use Placidus, so houses vary in size with latitude." },
  Retrograde: { short: "A planet appearing to move backward from Earth's view.", deeper: "An optical effect of relative orbital speed. Traditionally read as an inward-turned, reviewing expression of that planet — reflection before action. Flagged with R." },
  Orb: { short: "How far an angle differs from exact — the aspect's slack.", deeper: "Smaller orb = louder conversation. This chart allows up to 8° for conjunctions/oppositions, 7° for squares/trines, 5° for sextiles, 4° for quincunxes. Each aspect card shows its actual orb." },
  "Ecliptic longitude": { short: "A planet's position measured along the Sun's apparent path.", deeper: "The zodiac is this 360° circle divided into twelve 30° signs. All displayed degrees (e.g. 14°32′ Gemini) are ecliptic longitudes from the bundled calculator." },
  Conjunction: { short: "Two planets joined at ~0° — merged forces.", deeper: "The most blending aspect: themes fuse. See the aspect guide for the chart's real examples." },
  Sextile: { short: "Two planets at ~60° — an open door.", deeper: "Harmonious but participatory: opportunity that rewards use." },
  Square: { short: "Two planets at ~90° — creative tension.", deeper: "Friction that builds skill when worked consciously." },
  Trine: { short: "Two planets at ~120° — gifted flow.", deeper: "Ease and talent; the caution is taking it for granted." },
  Opposition: { short: "Two planets at ~180° — polarity to bridge.", deeper: "Balance across an axis, often first met through other people." },
  "Cardinal, fixed, mutable": { short: "Three modes: begin, sustain, adapt.", deeper: "Cardinal starts seasons, fixed carries them, mutable translates between them. Your modality mix hints at preferred rhythm." },
  "Fire, earth, air, water": { short: "Four elements: spark, form, exchange, feeling.", deeper: "Fire acts, earth builds, air connects, water bonds. Your elemental mix hints at native languages — not worth." },
};

/* ================= tour ================= */

export interface TourStep {
  title: string;
  body: string;
  target: "sun" | "moon" | "asc" | "houses" | "aspects" | "aspect" | "blueprint";
  cta: string;
}

export const TOUR_STEPS: TourStep[] = [
  { title: "Welcome to your Inner Orbit", body: "A natal chart is a sky-map of one moment: where each planet stood along the zodiac when you were born. Think of it as ten characters on twelve stages, in conversation. Nothing here dictates who you are — it offers a symbolic language for noticing yourself.", target: "blueprint", cta: "Meet your Sun" },
  { title: "Meet your Sun", body: "The Sun is your through-line — identity and self-expression. Find its glowing orb on the wheel: its sign colors how you naturally shine, its house shows where that light wants a stage.", target: "sun", cta: "Discover your Moon" },
  { title: "Discover your Moon", body: "The Moon is your inner weather — feelings, needs, and what safety requires. It moves fastest, so it is the most personal timing-hand in the chart.", target: "moon", cta: "Find your Rising sign" },
  { title: "Find your Rising sign", body: "The bright ASC marker is the eastern horizon at your birth — your outward approach, the doorway to the whole chart. It moves the fastest of all, which is why birth time matters.", target: "asc", cta: "What are houses?" },
  { title: "What are houses?", body: "Twelve numbered segments, twelve areas of life — self, resources, learning, home, joy, work, partnership, depth, meaning, calling, allies, rest. A planet's house says where its story tends to happen.", target: "houses", cta: "Why are planets connected?" },
  { title: "Why are planets connected?", body: "Those glowing chords are aspects — geometric relationships between planets. Same-element ease (trines), friendly openings (sextiles), productive friction (squares), fusions (conjunctions), polarities (oppositions). Color tells you the kind; tightness tells you the volume.", target: "aspects", cta: "Explore a relationship" },
  { title: "Explore a relationship", body: "Every chart has a closest conversation — its tightest aspect. Open it: you will see the exact geometry, what each planet wants, and how tradition reads their dynamic. Try jumping to either planet from there.", target: "aspect", cta: "See your blueprint" },
  { title: "Your cosmic blueprint", body: "Zoom back out: Big Three, elements, modalities, concentrations. This summary is computed from your actual data. From here, wander — every click answers a question, every connection tells a story.", target: "blueprint", cta: "Finish tour" },
];

/* ================= builders ================= */

export interface PlanetReading {
  planet: string; glyph: string; color: string;
  signName: string; signGlyph: string; degree: string;
  house: number; houseTheme: string; retro: boolean;
  discover: string; deep: string;
  togetherDiscover: string; togetherDeep: string;
}

export function planetReading(chart: ChartData, index: number): PlanetReading {
  const p = chart.planets[index];
  const sign = SIGNS[p.sign];
  const smod = SIGN_INFO[p.sign];
  const house = HOUSE_INFO[p.house - 1];
  const info = PLANET_INFO[p.id];
  const retroNote = p.retro ? " It was retrograde — appearing to move backward — traditionally read as a more inward, reviewing expression." : "";
  return {
    planet: p.name, glyph: p.glyph, color: p.color,
    signName: sign.name, signGlyph: sign.glyph, degree: p.degText,
    house: p.house, houseTheme: house.theme, retro: p.retro,
    discover: info.discover, deep: info.deep,
    togetherDiscover: `${p.name} in ${sign.name}, in House ${p.house} (${house.theme}): ${smod.discoverMod} And it plays out where ${house.discover.charAt(0).toLowerCase() + house.discover.slice(1)}${retroNote} In plain terms — ${info.role.charAt(0).toLowerCase() + info.role.slice(1)} expressed the ${sign.name} way (${smod.vibe.toLowerCase()}), in the ${house.theme.toLowerCase()} part of life.`,
    togetherDeep: `${p.name} ${p.retro ? "(retrograde) " : ""}at ${p.degText} ${sign.name} (${sign.element}, ${MODALITY_OF_SIGN[p.sign]}), House ${p.house} (${HOUSE_NAMES[p.house - 1]}). ${smod.deepMod} ${house.deep} Synthesis: the ${info.role.split("—")[0].trim().toLowerCase()} principle operates in a ${sign.name} register within the ${house.theme.toLowerCase()} department — neither placement alone decides the story; the sign sets the instrument, the house chooses the room, and aspects (below) set the volume.`,
  };
}

export interface AspectReading {
  aName: string; bName: string; aGlyph: string; bGlyph: string;
  aColor: string; bColor: string; typeName: string;
  nominal: number; actual: number; orb: number; color: string;
  aRole: string; bRole: string;
  discover: string; deep: string; reflection: string;
  tone: string;
}

export function aspectReading(chart: ChartData, aspectIdx: number): AspectReading {
  const asp = chart.aspects[aspectIdx];
  const A = chart.planets[asp.a], B = chart.planets[asp.b];
  const def = ASPECT_MAP[asp.type as AspectType];
  const info = ASPECT_INFO[asp.type] ?? ASPECT_INFO.conj;
  const actual = separation(A.lon, B.lon);
  const tone = asp.type === "trine" || asp.type === "sextile" ? "traditionally supportive"
    : asp.type === "square" || asp.type === "opp" ? "traditionally challenging"
    : asp.type === "conj" ? "traditionally intensifying" : "traditionally adjusting";
  return {
    aName: A.name, bName: B.name, aGlyph: A.glyph, bGlyph: B.glyph,
    aColor: A.color, bColor: B.color, typeName: def.name,
    nominal: def.angle, actual, orb: asp.orb, color: def.color,
    aRole: PLANET_INFO[A.id].role, bRole: PLANET_INFO[B.id].role,
    discover: `${A.name} (${PLANET_INFO[A.id].role.split("—")[0].trim().toLowerCase()}) and ${B.name} (${PLANET_INFO[B.id].role.split("—")[0].trim().toLowerCase()}) stand ${actual.toFixed(1)}° apart — a ${def.name.toLowerCase()}, ${tone}. ${info.discover} Here, ${A.name.toLowerCase()} and ${B.name.toLowerCase()} ${info.dynamic}.`,
    deep: `${def.name}, nominal ${def.angle}°, measured ${actual.toFixed(1)}°, orb ${asp.orb.toFixed(1)}° (allowed ≤ ${def.orb}°). ${info.deep} As geometry it links ${SIGNS[A.sign].name} (${SIGNS[A.sign].element}) with ${SIGNS[B.sign].name} (${SIGNS[B.sign].element}) — ${SIGNS[A.sign].element === SIGNS[B.sign].element ? "a same-element dialogue, fluent by construction" : "a cross-element dialogue, interesting precisely because the languages differ"}.`,
    reflection: info.reflection, tone,
  };
}

export function houseReading(house: number): { theme: string; discover: string; deep: string } {
  const h = HOUSE_INFO[house - 1];
  return { theme: h.theme, discover: h.discover, deep: h.deep };
}

export function signReading(sign: number): { name: string; glyph: string; element: string; modality: string; discover: string; deep: string } {
  const s = SIGNS[sign];
  return {
    name: s.name, glyph: s.glyph, element: s.element, modality: MODALITY_OF_SIGN[sign],
    discover: `${s.name}: ${SIGN_INFO[sign].vibe} ${SIGN_INFO[sign].discoverMod}`,
    deep: `${s.name} — ${s.element}, ${MODALITY_OF_SIGN[sign]}, ruled by ${s.ruler}. ${SIGN_INFO[sign].deepMod}`,
  };
}

/* ================= Cosmic Portrait library =================
   Long-form symbolic language lives beside the existing entries and is
   consumed by src/lib/portrait/engine.ts (which decides what applies to a
   given chart). Re-exported here so content.ts stays the single index of
   interpretation text. */
export * from "./portrait/lexicon-signs";
export * from "./portrait/lexicon-synthesis";
