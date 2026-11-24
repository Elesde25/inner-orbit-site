export type MetalId = "lead" | "tin" | "iron" | "copper" | "quicksilver" | "silver" | "gold";
export type CatalystId = "awareness" | "challenge" | "discipline" | "creativity";

export type Stage = {
  id: string;
  name: string;
  verb: string;
  rite: string;
  principle: string;
  principleKind: "Element" | "Principle";
  metal: MetalId;
  phase: string;
  phaseNote: string;
  color: string;
  summary: string;
  body: string;
  feels: string[];
  question: string;
};

/* The seven operations, in the order given by the Emerald Tablet tradition. */
export const STAGES: Stage[] = [
  {
    id: "calcination",
    name: "Calcination",
    verb: "Burn",
    rite: "Burn what is false.",
    principle: "Fire",
    principleKind: "Element",
    metal: "lead",
    phase: "Nigredo",
    phaseNote: "the blackening",
    color: "#ff8a4c",
    summary: "Burning away ego, false identities, and outdated habits through intense pressure or honesty.",
    body: "Life turns up the heat — an ending, a failure, a truth you can no longer step around — and whatever was built for show is reduced to ash. What survives the fire was real all along.",
    feels: ["Being humbled", "A role that no longer fits", "Radical honesty with yourself"],
    question: "What in me is asking to be burned away?",
  },
  {
    id: "dissolution",
    name: "Dissolution",
    verb: "Dissolve",
    rite: "Let it soften.",
    principle: "Water",
    principleKind: "Element",
    metal: "tin",
    phase: "Nigredo",
    phaseNote: "the blackening",
    color: "#6fb6ff",
    summary: "Letting rigid structures and emotional defenses break down in water-like fluidity.",
    body: "The ashes are given to water. Control loosens, buried feeling rises, and you stop holding yourself so tightly. Tears, rest and surrender do the work that effort never could.",
    feels: ["Crying without knowing why", "Letting go of the plan", "Relief after resistance"],
    question: "What am I holding rigid that wants to flow?",
  },
  {
    id: "separation",
    name: "Separation",
    verb: "Discern",
    rite: "Keep the essence. Release the dross.",
    principle: "Air",
    principleKind: "Element",
    metal: "iron",
    phase: "Albedo",
    phaseNote: "the whitening",
    color: "#f3e3a6",
    summary: "Sorting through the debris to isolate what is true from what is conditioned or toxic.",
    body: "When the waters still, you can finally see what is in them. You sift: this belief is mine, this one I inherited; this habit serves, this one harms. It is discernment, not judgment.",
    feels: ["Setting a clean boundary", "Questioning a belief you never chose", "Seeing a pattern clearly"],
    question: "What here is truly mine — and what was handed to me?",
  },
  {
    id: "conjunction",
    name: "Conjunction",
    verb: "Unite",
    rite: "Marry your opposites.",
    principle: "Earth",
    principleKind: "Element",
    metal: "copper",
    phase: "Albedo",
    phaseNote: "the whitening",
    color: "#8fe0ae",
    summary: "Uniting opposing traits within yourself — such as logic and intuition, or shadow and light.",
    body: "The purified parts are brought back together. Thinking and feeling, strength and softness, shadow and light stop competing and begin to cooperate. A new centre forms that can hold both.",
    feels: ["Self-acceptance", "Holding two truths at once", "No longer at war with yourself"],
    question: "Which two parts of me are ready to stop fighting?",
  },
  {
    id: "fermentation",
    name: "Fermentation",
    verb: "Be reborn",
    rite: "Die to the old. Be reborn.",
    principle: "Sulfur · spirit",
    principleKind: "Principle",
    metal: "quicksilver",
    phase: "Citrinitas",
    phaseNote: "the yellowing",
    color: "#c08cff",
    summary: "Experiencing a symbolic death of the old self to allow a spiritual rebirth.",
    body: "First a darkness: the old identity finally decays. Then, unbidden, new life — inspiration, meaning, colour. Alchemists named that moment the Peacock’s Tail.",
    feels: ["A dark night of the soul", "Unexpected aliveness", "Meaning returning"],
    question: "Who am I no longer — and who is arriving?",
  },
  {
    id: "distillation",
    name: "Distillation",
    verb: "Refine",
    rite: "Refine until only truth remains.",
    principle: "Mercury · mind",
    principleKind: "Principle",
    metal: "silver",
    phase: "Citrinitas",
    phaseNote: "the yellowing",
    color: "#dfe2ff",
    summary: "Refining your core character through continuous self-reflection and emotional clarity.",
    body: "The new self is raised and condensed, again and again, until only the essential remains. Inflation is skimmed away; clarity, humility and steadiness are concentrated.",
    feels: ["Journaling and stillness", "Choosing the same value twice", "Quiet, earned clarity"],
    question: "If I kept only what is essential, what stays?",
  },
  {
    id: "coagulation",
    name: "Coagulation",
    verb: "Embody",
    rite: "Make it real.",
    principle: "Salt · body",
    principleKind: "Principle",
    metal: "gold",
    phase: "Rubedo",
    phaseNote: "the reddening",
    color: "#ffcf70",
    summary: "Embodying your newly transformed, integrated wisdom into daily life.",
    body: "Spirit becomes solid. Insight turns into how you speak, work, rest and love. The Stone was never an object — it is a self that can transmute whatever life brings next.",
    feels: ["Walking your talk", "Calm, unforced confidence", "Ordinary days, lived differently"],
    question: "How will this be lived — today, in something small?",
  },
];

export type Metal = {
  id: MetalId;
  name: string;
  planet: string;
  color: string;
  stage: number;
  shadow: string;
  gift: string;
  falseSelves: string[];
  conditioned: string[];
  essential: string[];
  rejected: string[];
  practice: string;
};

export const METALS: Record<MetalId, Metal> = {
  lead: {
    id: "lead",
    name: "Lead",
    planet: "Saturn",
    color: "#9aa3c7",
    stage: 0,
    shadow: "heaviness, limitation, the weight of the past",
    gift: "patience, depth and endurance",
    falseSelves: ["The one who is always behind", "The story that it is too late for me", "The critic I mistake for realism"],
    conditioned: ["It is too late for me to change.", "Rest has to be earned."],
    essential: ["I can move slowly and still be moving.", "My depth is a strength."],
    rejected: ["My slowness", "My sadness"],
    practice: "Move my body for ten minutes when I feel heavy.",
  },
  tin: {
    id: "tin",
    name: "Tin",
    planet: "Jupiter",
    color: "#8fb8ff",
    stage: 1,
    shadow: "excess, escape, a ‘more’ that is never enough",
    gift: "generosity, faith and expansion with roots",
    falseSelves: ["The one who can handle everything", "Busyness as proof of my worth", "The one who never needs help"],
    conditioned: ["If I stop, everything falls apart.", "My needs are an inconvenience."],
    essential: ["I am allowed to have limits.", "There is enough — and I am part of it."],
    rejected: ["My neediness", "My appetite"],
    practice: "Leave one thing undone on purpose, and rest.",
  },
  iron: {
    id: "iron",
    name: "Iron",
    planet: "Mars",
    color: "#ff8f7a",
    stage: 2,
    shadow: "anger, armour, a fight that never ends",
    gift: "courage, clean boundaries and drive",
    falseSelves: ["The one who must win", "Armour I call strength", "The one who is never wrong"],
    conditioned: ["Softness will get me hurt.", "If I am not in control, I am in danger."],
    essential: ["My anger points at what I care about.", "I can be strong without being hard."],
    rejected: ["My anger", "My softness"],
    practice: "Take three breaths before I respond in heat.",
  },
  copper: {
    id: "copper",
    name: "Copper",
    planet: "Venus",
    color: "#f2a98c",
    stage: 3,
    shadow: "pleasing, clinging, love as a transaction",
    gift: "warmth, true connection and self-worth",
    falseSelves: ["The agreeable one", "The one who is easy to love", "Whoever they need me to be"],
    conditioned: ["I am loved for what I give.", "Saying no makes me unkind."],
    essential: ["My needs belong in the room.", "I am worthy before I am useful."],
    rejected: ["My selfishness", "My ‘no’"],
    practice: "Ask ‘what do I want?’ before I ask anyone else.",
  },
  quicksilver: {
    id: "quicksilver",
    name: "Quicksilver",
    planet: "Mercury",
    color: "#c9b6ff",
    stage: 4,
    shadow: "restless thought, scattered light, life lived in the head",
    gift: "insight, adaptability and a clear messenger-mind",
    falseSelves: ["The one who must figure it all out first", "Worry disguised as preparation", "The one who starts and never lands"],
    conditioned: ["If I think hard enough, I can avoid pain.", "I cannot begin until I am certain."],
    essential: ["I can act before I am sure.", "My mind is a tool, not my master."],
    rejected: ["My stillness", "My doubt"],
    practice: "Finish one small thing completely before starting another.",
  },
  silver: {
    id: "silver",
    name: "Silver",
    planet: "the Moon",
    color: "#dfe6ff",
    stage: 5,
    shadow: "old wounds, tidal moods, the past replaying",
    gift: "intuition, tenderness and reflective calm",
    falseSelves: ["The wounded one", "The one who feels too much", "The story of what was done to me"],
    conditioned: ["What happened to me is who I am.", "My feelings are too much."],
    essential: ["My sensitivity is a way of knowing.", "I am more than what I survived."],
    rejected: ["My sensitivity", "My anger"],
    practice: "Name the feeling out loud, then let it be weather.",
  },
  gold: {
    id: "gold",
    name: "False Gold",
    planet: "the Sun",
    color: "#ffcf70",
    stage: 6,
    shadow: "perfectionism, performance, a brittle shine",
    gift: "authentic radiance — a self with nothing to prove",
    falseSelves: ["The impressive one", "The one who never fails", "The flawless version I show"],
    conditioned: ["I am only as good as my last achievement.", "If they saw the real me, they would leave."],
    essential: ["I am allowed to be unfinished.", "My worth is not a performance."],
    rejected: ["My ordinariness", "My failures"],
    practice: "Share one thing unfinished and imperfect.",
  },
};

export const METAL_ORDER: MetalId[] = ["lead", "tin", "iron", "copper", "quicksilver", "silver", "gold"];

export type Burden = { id: string; label: string; metal: MetalId; phrase: string };

export const BURDENS: Burden[] = [
  { id: "stuck", label: "Feeling stuck or stagnant", metal: "lead", phrase: "the heaviness of being stuck" },
  { id: "critic", label: "A harsh inner critic", metal: "lead", phrase: "your harsh inner critic" },
  { id: "grief", label: "Grief I haven’t moved through", metal: "lead", phrase: "the grief you have been carrying" },
  { id: "overdo", label: "Overcommitting & burnout", metal: "tin", phrase: "the habit of overcommitting" },
  { id: "escape", label: "Numbing out or escaping", metal: "tin", phrase: "the urge to numb out" },
  { id: "anger", label: "Anger or resentment", metal: "iron", phrase: "the resentment you keep feeding" },
  { id: "control", label: "Needing to control everything", metal: "iron", phrase: "the need to control" },
  { id: "pleasing", label: "People-pleasing", metal: "copper", phrase: "your people-pleasing" },
  { id: "enough", label: "Fear of not being enough", metal: "copper", phrase: "the fear of not being enough" },
  { id: "overthink", label: "Overthinking & anxiety", metal: "quicksilver", phrase: "your anxious overthinking" },
  { id: "scatter", label: "Scattered, no follow-through", metal: "quicksilver", phrase: "your scattered attention" },
  { id: "wound", label: "An old emotional wound", metal: "silver", phrase: "an old wound" },
  { id: "moods", label: "Moods that run my day", metal: "silver", phrase: "the moods that run your day" },
  { id: "perfect", label: "Perfectionism", metal: "gold", phrase: "your perfectionism" },
  { id: "mask", label: "Performing instead of being", metal: "gold", phrase: "the mask you perform behind" },
];

export type Catalyst = { id: CatalystId; name: string; line: string; flavour: string; practice: string };

export const CATALYSTS: Catalyst[] = [
  {
    id: "awareness",
    name: "Active awareness",
    line: "You change by seeing clearly — noticing, naming, witnessing.",
    flavour: "seen clearly, without flinching",
    practice: "Three minutes of noticing: name what I feel without fixing it.",
  },
  {
    id: "challenge",
    name: "Life’s challenges",
    line: "You change under pressure — difficulty is your furnace.",
    flavour: "tested by something real",
    practice: "Do one small uncomfortable thing on purpose.",
  },
  {
    id: "discipline",
    name: "Discipline",
    line: "You change by repetition — small vows, kept.",
    flavour: "practiced daily, in small vows",
    practice: "Keep one tiny promise to myself before noon.",
  },
  {
    id: "creativity",
    name: "Creative energy",
    line: "You change by making — turning feeling into form.",
    flavour: "given form — written, spoken, made",
    practice: "Make something for ten minutes from whatever I feel.",
  },
];

export type Gold = { id: string; name: string; color: string; practice: string };

export const GOLDS: Gold[] = [
  { id: "peace", name: "Inner peace", color: "#8fd0ff", practice: "Five slow breaths before I pick up my phone." },
  { id: "courage", name: "Courage", color: "#ff8a5c", practice: "Say one true thing I would normally swallow." },
  { id: "clarity", name: "Clarity", color: "#e6ecff", practice: "Write one honest page before the day begins." },
  { id: "worth", name: "Self-worth", color: "#ffcf70", practice: "Receive one kindness without deflecting it." },
  { id: "purpose", name: "Purpose", color: "#ffb45c", practice: "Give my first focused hour to what matters most." },
  { id: "connection", name: "Connection", color: "#ff9ac0", practice: "Reach out to one person with nothing to gain." },
  { id: "freedom", name: "Freedom", color: "#9af0d0", practice: "Say one clean ‘no’, without an apology attached." },
  { id: "wholeness", name: "Wholeness", color: "#c9a2ff", practice: "Each night, thank one part of me I usually criticize." },
];

export const FEELINGS = [
  "Sadness", "Relief", "Fear", "Tenderness", "Anger", "Longing",
  "Emptiness", "Peace", "Shame", "Hope", "Exhaustion", "Love",
];

export const VALUES = [
  "Honesty", "Courage", "Tenderness", "Freedom", "Devotion", "Play", "Patience", "Presence",
  "Curiosity", "Integrity", "Compassion", "Discipline", "Wonder", "Trust", "Simplicity", "Creativity",
];

export const POLARITIES: [string, string][] = [
  ["Logic", "Intuition"],
  ["Strength", "Tenderness"],
  ["Doing", "Being"],
];

export const WHEN = ["Morning", "Midday", "Evening"];

/* ---------- The transmutation table (teaching section) ---------- */

export const BASE_METALS = [
  { id: "emotion", name: "Unprocessed emotion", gold: "Emotional wisdom", how: "Feeling that is finally felt becomes guidance" },
  { id: "fear", name: "Fear", gold: "Courage", how: "Fear that is faced becomes a compass" },
  { id: "ego", name: "Ego", gold: "An authentic self", how: "The mask that is set down reveals the face" },
  { id: "trauma", name: "Trauma", gold: "Resilience & compassion", how: "The wound that is tended becomes a way of understanding others" },
  { id: "belief", name: "Limiting beliefs", gold: "Possibility", how: "The story that is questioned stops being a wall" },
];

/* ---------- Journey state ---------- */

export type Journey = {
  v: 1;
  id: string;
  step: number; // 0 = intake, 1–7 = rites, 8 = the Stone
  maxStep: number;
  intake: {
    name: string;
    burdens: string[];
    leadWords: string;
    catalyst: CatalystId | "";
    gold: string;
    goldWords: string;
  };
  rites: {
    burn: string;
    burned: boolean;
    breathed: boolean;
    feelings: string[];
    sorted: { text: string; keep: boolean }[];
    truth: string;
    balance: number[];
    shadow: string;
    shadowGift: string;
    noLonger: string;
    becoming: string;
    reborn: boolean;
    values: string[];
    essence: string;
    practice: string;
    when: string;
  };
  startedAt: string | null;
  completedAt: string | null;
  practiceLog: string[];
  updatedAt: number;
};

export function blankJourney(id = ""): Journey {
  return {
    v: 1,
    id,
    step: 0,
    maxStep: 0,
    intake: { name: "", burdens: [], leadWords: "", catalyst: "", gold: "", goldWords: "" },
    rites: {
      burn: "",
      burned: false,
      breathed: false,
      feelings: [],
      sorted: [],
      truth: "",
      balance: [50, 50, 50],
      shadow: "",
      shadowGift: "",
      noLonger: "",
      becoming: "",
      reborn: false,
      values: [],
      essence: "",
      practice: "",
      when: "Morning",
    },
    startedAt: null,
    completedAt: null,
    practiceLog: [],
    updatedAt: 0,
  };
}

/* ---------- Personalisation ---------- */

export type Profile = {
  metal: Metal;
  catalyst: Catalyst | null;
  gold: Gold | null;
  /** second person: "your people-pleasing" */
  lead: string;
  /** the user's intention, lower case: "inner peace" */
  goldWord: string;
  crucible: number;
};

export function dominantMetal(burdenIds: string[]): MetalId {
  const count = new Map<MetalId, number>();
  let best: MetalId = "lead";
  let bestN = 0;
  for (const id of burdenIds) {
    const b = BURDENS.find((x) => x.id === id);
    if (!b) continue;
    const n = (count.get(b.metal) ?? 0) + 1;
    count.set(b.metal, n);
    if (n > bestN) {
      best = b.metal;
      bestN = n;
    }
  }
  return best;
}

export function profileOf(j: Journey): Profile {
  const metal = METALS[dominantMetal(j.intake.burdens)];
  const catalyst = CATALYSTS.find((c) => c.id === j.intake.catalyst) ?? null;
  const gold = GOLDS.find((g) => g.id === j.intake.gold) ?? null;
  const first = BURDENS.find((b) => b.id === j.intake.burdens[0]);
  const own = j.intake.leadWords.trim();
  const lead = own ? `“${own}”` : first ? first.phrase : "what weighs on you";
  const goldWord = (j.intake.goldWords.trim() || gold?.name || "your gold").replace(/\.$/, "");
  return {
    metal,
    catalyst,
    gold,
    lead,
    goldWord: j.intake.goldWords.trim() ? goldWord : goldWord.toLowerCase(),
    crucible: metal.stage,
  };
}

export function guidance(stage: number, p: Profile): string {
  switch (stage) {
    case 0:
      return `The fire is aimed at ${p.lead}. Let it take what was never really you.`;
    case 1:
      return `Beneath ${p.lead} there is feeling that has been held very still. Let it move.`;
    case 2:
      return `Not everything tangled up with ${p.lead} is yours. Sort it, patiently.`;
    case 3:
      return `The part of you that carries ${p.lead} and the part that longs for ${p.goldWord} are not enemies.`;
    case 4:
      return `The self organized around ${p.lead} is ending. Something that knows ${p.goldWord} is arriving.`;
    case 5:
      return `Reduce everything you have found to its essence — the few drops that are purely you.`;
    default:
      return `${cap(p.goldWord)} becomes real only when it has a body: a time, a place, an action.`;
  }
}

export function beliefsFor(p: Profile): string[] {
  const m = p.metal;
  return [
    m.conditioned[0],
    m.essential[0],
    "I have to do this alone.",
    m.conditioned[1],
    "I am capable of change.",
    m.essential[1],
  ];
}

export function practicesFor(p: Profile): string[] {
  const out: string[] = [];
  if (p.gold) out.push(p.gold.practice);
  if (p.catalyst) out.push(p.catalyst.practice);
  out.push(p.metal.practice);
  return out;
}

export function draftEssence(j: Journey): string {
  const kept = j.rites.truth.trim() || j.rites.sorted.find((s) => s.keep)?.text || "";
  const parts: string[] = [];
  if (j.rites.burn.trim()) parts.push(`I release ${lowerFirst(stripDot(j.rites.burn.trim()))}.`);
  if (kept) parts.push(stripDot(kept) + ".");
  if (j.rites.becoming.trim()) parts.push(`I am becoming ${lowerFirst(stripDot(j.rites.becoming.trim()))}.`);
  return parts.join(" ");
}

export function polarityReading(index: number, value: number): string {
  const [a, b] = POLARITIES[index];
  if (value < 36) return `You lean on ${a.toLowerCase()}. ${b} is waiting to be invited in.`;
  if (value > 64) return `You lean on ${b.toLowerCase()}. ${a} is waiting to be invited in.`;
  return `${a} and ${b.toLowerCase()} already work together in you.`;
}

export function balanceScore(values: number[]): number {
  const avg = values.reduce((s, v) => s + Math.abs(v - 50), 0) / (values.length * 50);
  return 1 - avg;
}

export function todayKey(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function streak(log: string[]): number {
  const set = new Set(log);
  let n = 0;
  const d = new Date();
  if (!set.has(todayKey(d))) d.setDate(d.getDate() - 1);
  while (set.has(todayKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export function opusText(j: Journey): string {
  const p = profileOf(j);
  const kept = j.rites.sorted.filter((s) => s.keep).map((s) => s.text);
  const released = j.rites.sorted.filter((s) => !s.keep).map((s) => s.text);
  const lines = [
    `MY GREAT WORK${j.intake.name.trim() ? ` — ${j.intake.name.trim()}` : ""}`,
    `Inner Orbit · Inner Alchemy`,
    ``,
    `From ${p.lead} toward ${p.goldWord}.`,
    `Base metal: ${p.metal.name} (${p.metal.planet})${p.catalyst ? ` · Catalyst: ${p.catalyst.name}` : ""}`,
    ``,
    `1. Calcination — I burned: ${j.rites.burn || "—"}`,
    `2. Dissolution — I let myself feel: ${j.rites.feelings.join(", ") || "—"}`,
    `3. Separation — I keep: ${[...kept, j.rites.truth].filter(Boolean).join(" / ") || "—"}`,
    `   I release: ${released.join(" / ") || "—"}`,
    `4. Conjunction — I welcome back: ${j.rites.shadow || "—"}${j.rites.shadowGift ? ` (its gift: ${j.rites.shadowGift})` : ""}`,
    `5. Fermentation — I am no longer ${j.rites.noLonger || "—"}. I am becoming ${j.rites.becoming || "—"}.`,
    `6. Distillation — My essence: ${j.rites.values.join(" · ") || "—"}`,
    `   ${j.rites.essence || ""}`,
    `7. Coagulation — Each ${j.rites.when.toLowerCase()}: ${j.rites.practice || "—"}`,
  ];
  return lines.join("\n");
}

export function cap(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}
function lowerFirst(s: string): string {
  if (!s) return s;
  if (s.startsWith("I ") || s === "I" || s.startsWith("I’") || s.startsWith("I'")) return s;
  return s[0].toLowerCase() + s.slice(1);
}
function stripDot(s: string): string {
  return s.replace(/[.\s]+$/, "");
}
