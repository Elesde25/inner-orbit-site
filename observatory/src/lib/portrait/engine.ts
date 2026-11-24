/**
 * Cosmic Portrait engine — deterministic, data-driven, no network.
 *
 *   astro.ts  → calculation (positions, houses, aspects)
 *   model.ts  → normalized placements, aspects, patterns, reliability
 *   content.ts / lexicon-*.ts → symbolic language
 *   engine.ts (this file) → conditional synthesis: decides WHICH language to
 *                           use from the calculated chart, and how to join it.
 *
 * The engine never recalculates astronomy and never invents patterns: every
 * claim traces back to a Show Me Why reference built from the model.
 */
import { ASPECT_MAP, SIGNS, HOUSE_NAMES, type ChartData } from "../astro";
import { ASPECT_INFO, HOUSE_INFO, PLANET_INFO } from "../content";
import {
  MODALITY_BLURB, ELEMENT_BLURB, normalizeChart,
  type ChartModel, type Element, type ModelAspect, type Selection,
} from "../model";
import {
  ASC_BY_SIGN, JUPITER_BY_SIGN, MARS_BY_SIGN, MERCURY_BY_SIGN, MOON_BY_SIGN, NEPTUNE_BY_SIGN,
  PLUTO_BY_SIGN, SATURN_BY_SIGN, SIGN_MICRO, SUN_BY_SIGN, URANUS_BY_SIGN, VENUS_BY_SIGN,
} from "./lexicon-signs";
import {
  DIGNITY_LINE, ELEMENT_PRACTICE, ELEMENT_QUALITY, ELEMENT_SPARK, HOUSE_ARENA, HOUSE_FRAME, HOUSE_SHORT,
  MODALITY_LINE, MOON_BY_HOUSE, MOON_PHASES, ORDINAL, PAIR_FLAVOR, PLANET_NOUN, PLANET_PRACTICE, PLANET_PULL,
  REFLECTION_BANK, RETRO_LINE, SUN_ASC_RELATION, SUN_BY_HOUSE, TRANSITION,
} from "./lexicon-synthesis";
import type {
  CosmicPortrait, NarrativeProvider, PortraitAccuracy, PortraitBlock, PortraitChapter, WhyFact, WhyRef,
} from "./types";

export const ENGINE_ID = "inner-orbit.deterministic";
export const ENGINE_VERSION = "1.0";

/* ------------------------------ small helpers ------------------------------ */

const fmt = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));
const lc = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const list = (a: string[]) => (a.length <= 1 ? a.join("") : a.length === 2 ? `${a[0]} and ${a[1]}` : `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`);
const wordCount = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);
const orbText = (o: number) => `${o.toFixed(1)}°`;
const closeness = (o: number) => (o < 1 ? "very close" : o < 3 ? "close" : o < 5 ? "moderate" : "wide");

function hash(str: string): string {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36);
}

const PERSONAL = ["sun", "moon", "mercury", "venus", "mars"];

/* ------------------------------ build context ------------------------------ */

class Ctx {
  m: ChartModel;
  chart: ChartData;
  isDemo: boolean;
  whys: Record<string, WhyRef> = {};
  narrated = new Map<number, number>(); // aspect idx → chapter number it was told in
  once = new Set<string>();
  themes: string[] = [];
  chapter = 0;
  leadN = 0;
  constructor(chart: ChartData, isDemo: boolean) {
    this.chart = chart; this.isDemo = isDemo; this.m = normalizeChart(chart);
  }
  get timeKnown() { return this.m.reliability.timeKnown; }
  get housesFirm() { return this.m.reliability.houses; }
  p(id: string) { return this.m.byId[id]; }
  seen(key: string) { if (this.once.has(key)) return true; this.once.add(key); return false; }
}

let bid = 0;
const block = (type: PortraitBlock["type"], text: string, why?: string[]): PortraitBlock => ({ id: `b${++bid}`, type, text, why: why?.length ? [...new Set(why)] : undefined });

/* ------------------------------ Show Me Why refs ------------------------------ */

function houseTheme(n: number) { return `House ${n} · ${HOUSE_NAMES[n - 1]} (${HOUSE_SHORT[n - 1]})`; }

function whyPlanet(c: Ctx, id: string): string {
  const key = `p:${id}`;
  if (c.whys[key]) return key;
  const p = c.p(id);
  const firm = !p.signUncertain && (id !== "moon" || c.timeKnown);
  const facts: WhyFact[] = [
    { label: "Planet", value: `${p.glyph} ${p.name}` },
    { label: "Zodiac sign", value: `${SIGNS[p.sign].glyph} ${p.signName} · ${p.element}, ${p.modality}` },
    { label: "Degree", value: `${p.degText} of ${p.signName}${c.timeKnown ? "" : id === "moon" ? " (at the assumed noon)" : ""}` },
    { label: "House", value: c.housesFirm ? houseTheme(p.house) : c.timeKnown ? `${houseTheme(p.house)} — approximate (equal-house fallback)` : "Unknown — needs a birth time" },
  ];
  if (p.retro) facts.push({ label: "Motion", value: "Retrograde — appearing to move backward from Earth" });
  if (p.dignity) facts.push({ label: "Traditional dignity", value: cap(p.dignity) });
  const caveat = p.signUncertain
    ? `Birth time unknown: ${p.name} changed sign during the day, so it may have been in ${SIGNS[p.altSign ?? p.sign].name} instead.`
    : id === "moon" && !c.timeKnown ? "Birth time unknown: the Moon moves about 13° a day, so its exact degree is approximate (the sign is firm only if it stayed in one sign all day)." : undefined;
  c.whys[key] = {
    id: key, kind: "planet", title: `${p.name} in ${p.signName}`, glyph: p.glyph, color: p.color, facts,
    tradition: `${PLANET_INFO[id].role} ${c.housesFirm ? `In the ${ORDINAL[p.house - 1]} house: ${lc(HOUSE_INFO[p.house - 1].discover)}` : ""}`.trim(),
    caveat, firmness: firm ? "firm" : "approximate",
    selection: { kind: "planet", index: p.index }, spotlight: { planets: [p.index], aspects: [] },
  };
  return key;
}

function whyAspect(c: Ctx, a: ModelAspect): string {
  const key = `a:${a.idx}`;
  if (c.whys[key]) return key;
  const A = c.m.placements[a.a], B = c.m.placements[a.b];
  const def = ASPECT_MAP[a.type];
  c.whys[key] = {
    id: key, kind: "aspect", title: `${A.name} ${def.name.toLowerCase()} ${B.name}`, glyph: `${A.glyph} ${B.glyph}`, color: def.color,
    facts: [
      { label: "Aspect", value: `${def.name} (${def.angle}°)` },
      { label: "Measured angle", value: `${a.separation.toFixed(1)}°` },
      { label: "Orb", value: `${orbText(a.orb)} from exact · allowed up to ${def.orb}°` },
      { label: "Between", value: `${A.name} in ${A.signName} · ${B.name} in ${B.signName}` },
    ],
    tradition: `${ASPECT_INFO[a.type].discover} Tradition reads it as ${def.meaning}.`,
    caveat: a.provisional ? "Birth time unknown: aspects to the Moon shift by up to about 6° across the day, so this angle is provisional." : undefined,
    firmness: a.provisional ? "approximate" : "firm",
    selection: { kind: "aspect", index: a.idx }, spotlight: { planets: [a.a, a.b], aspects: [a.idx] },
  };
  return key;
}

function whyHouse(c: Ctx, n: number): string {
  const key = `h:${n}`;
  if (c.whys[key]) return key;
  const inHouse = c.m.houses[n];
  c.whys[key] = {
    id: key, kind: "house", title: `House ${n} · ${HOUSE_NAMES[n - 1]}`,
    facts: [
      { label: "House", value: houseTheme(n) },
      { label: "Cusp", value: `${SIGNS[Math.floor(c.chart.cusps[n - 1] / 30) % 12].glyph} ${SIGNS[Math.floor(c.chart.cusps[n - 1] / 30) % 12].name}` },
      { label: "Bodies inside", value: inHouse.length ? inHouse.join(", ") : "none" },
      { label: "House system", value: c.chart.houseSystem === "placidus" ? "Placidus" : "Equal houses (high-latitude fallback)" },
    ],
    tradition: HOUSE_INFO[n - 1].discover,
    caveat: c.housesFirm ? undefined : "House placements are approximate here (unknown time or a high-latitude fallback).",
    firmness: c.housesFirm ? "firm" : "approximate",
    selection: { kind: "house", house: n },
    spotlight: { planets: c.m.placements.filter((p) => p.house === n).map((p) => p.index), aspects: [] },
  };
  return key;
}

function whyAngle(c: Ctx, which: "asc" | "mc"): string {
  const key = `n:${which}`;
  if (c.whys[key]) return key;
  const isAsc = which === "asc";
  const lon = isAsc ? c.m.asc.lon : c.m.mc.lon;
  const sign = Math.floor(lon / 30) % 12;
  c.whys[key] = {
    id: key, kind: "angle", title: isAsc ? `Rising sign · ${SIGNS[sign].name}` : `Midheaven · ${SIGNS[sign].name}`,
    glyph: SIGNS[sign].glyph, color: "#ffe3b4",
    facts: [
      { label: isAsc ? "Ascendant" : "Midheaven", value: `${SIGNS[sign].glyph} ${isAsc ? c.m.asc.text : c.m.mc.text} ${SIGNS[sign].name}` },
      { label: "Element · modality", value: `${SIGNS[sign].element}, ${["Cardinal", "Fixed", "Mutable"][sign % 3]}` },
      { label: "Ruling planet", value: SIGNS[sign].ruler },
    ],
    tradition: isAsc
      ? "The Ascendant is the sign rising on the eastern horizon at birth — traditionally your outward approach and first impression."
      : "The Midheaven is the highest point of the chart — traditionally public direction and calling.",
    caveat: c.timeKnown ? undefined : "Needs a birth time. The chart shown uses a noon placeholder, so this is not a finding about you.",
    firmness: c.timeKnown ? "firm" : "unknown",
    selection: { kind: "house", house: isAsc ? 1 : 10 },
    spotlight: { planets: c.m.placements.filter((p) => p.house === (isAsc ? 1 : 10)).map((p) => p.index), aspects: [] },
  };
  return key;
}

function whyRuler(c: Ctx): string | null {
  if (!c.m.ruler) return null;
  const key = "r:chart";
  if (c.whys[key]) return key;
  const r = c.m.ruler.placement;
  c.whys[key] = {
    id: key, kind: "ruler", title: `Chart ruler · ${r.name}`, glyph: r.glyph, color: r.color,
    facts: [
      { label: "Rising sign", value: `${SIGNS[c.m.asc.sign].glyph} ${SIGNS[c.m.asc.sign].name}` },
      { label: "Ruler of that sign", value: `${r.glyph} ${r.name}` },
      { label: "Ruler’s placement", value: `${r.signName} ${r.degText}${c.housesFirm ? ` · House ${r.house}` : ""}` },
    ],
    tradition: "The planet that rules the Rising sign is called the chart ruler — traditionally a steward for the whole chart and a thread connecting your outward approach to the rest of your life.",
    caveat: c.chart.houseSystem === "equal" ? "House placement is approximate (high-latitude fallback)." : undefined,
    firmness: "firm",
    selection: { kind: "planet", index: r.index }, spotlight: { planets: [r.index], aspects: [] },
  };
  return key;
}

function whyElement(c: Ctx, el: Element): string {
  const key = `e:${el}`;
  if (c.whys[key]) return key;
  const b = c.m.elements[el];
  c.whys[key] = {
    id: key, kind: "element", title: `${el} · ${b.count} of 10 bodies`,
    facts: [
      { label: "Count", value: `${b.count} of 10 bodies in ${el} signs` },
      { label: "Bodies", value: b.members.length ? b.members.join(", ") : "none" },
      { label: "Counted from", value: "the zodiac sign of each of the ten bodies" },
    ],
    tradition: ELEMENT_BLURB[el],
    caveat: !c.timeKnown && c.m.reliability.uncertainBodies.length ? "A body that changed sign during the unknown-time day may shift this count by one." : undefined,
    firmness: c.m.reliability.uncertainBodies.length ? "approximate" : "firm",
    selection: null, spotlight: { planets: c.m.placements.filter((p) => p.element === el).map((p) => p.index), aspects: [] },
  };
  return key;
}

function whyModality(c: Ctx, mod: "Cardinal" | "Fixed" | "Mutable"): string {
  const key = `m:${mod}`;
  if (c.whys[key]) return key;
  const b = c.m.modalities[mod];
  c.whys[key] = {
    id: key, kind: "element", title: `${mod} · ${b.count} of 10 bodies`,
    facts: [{ label: "Count", value: `${b.count} of 10 bodies in ${mod.toLowerCase()} signs` }, { label: "Bodies", value: b.members.length ? b.members.join(", ") : "none" }],
    tradition: MODALITY_BLURB[mod], firmness: "firm", selection: null,
    spotlight: { planets: c.m.placements.filter((p) => p.modality === mod).map((p) => p.index), aspects: [] },
  };
  return key;
}

function whyPattern(c: Ctx, id: string, title: string, rule: string, members: number[], aspects: number[], tradition: string, selection?: Selection | null, caveat?: string): string {
  const key = `x:${id}`;
  if (!c.whys[key]) {
    c.whys[key] = {
      id: key, kind: "pattern", title, glyph: "✧", color: "#e5c185",
      facts: [{ label: "Rule", value: rule }, { label: "Bodies", value: members.map((i) => c.m.placements[i].name).join(", ") }],
      tradition, caveat, firmness: caveat ? "approximate" : "firm",
      selection: selection === undefined ? (members.length ? { kind: "planet", index: members[0] } : null) : selection,
      spotlight: { planets: members, aspects },
    };
  }
  return key;
}

/* ------------------------------ aspect narration ------------------------------ */

const LEADS = [
  "The picture is modified by a {d}. ",
  "A {d} adds another layer. ",
  "One connection worth noting is a {d}. ",
  "There is also a {d} here. ",
  "Another thread: a {d}. ",
];

function describeAspect(a: ModelAspect): string {
  return `${closeness(a.orb)} ${ASPECT_MAP[a.type].name.toLowerCase()} (${orbText(a.orb)} from exact)`;
}

function pairKey(a: string, b: string) {
  const order = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
  return order.indexOf(a) < order.indexOf(b) ? `${a}-${b}` : `${b}-${a}`;
}

/** The one sentence that says what this aspect means for this pair. */
function pairSentence(c: Ctx, a: ModelAspect): string {
  const A = c.p(a.aId), B = c.p(a.bId);
  const f = PAIR_FLAVOR[pairKey(a.aId, a.bId)];
  if (f && a.nature !== "adjust") return f[a.nature];
  const n1 = PLANET_NOUN[A.id], n2 = PLANET_NOUN[B.id];
  const t = ASPECT_MAP[a.type].name.toLowerCase();
  if (a.nature === "ease") return `${A.name} and ${B.name} are in a ${t}: ${n1} and ${n2} tend to support each other without much effort.`;
  if (a.nature === "tension") return `${A.name} and ${B.name} are in a ${t}: ${n1} and ${n2} pull in different directions, which can feel like friction and also like motivation.`;
  if (a.nature === "blend") return `${A.name} and ${B.name} are conjunct: ${n1} and ${n2} tend to work as a single unit, each coloring the other.`;
  return `${A.name} and ${B.name} sit in a quincunx — an awkward angle — asking for ongoing, small adjustments between ${n1} and ${n2}.`;
}

/** pick the most relevant not-yet-narrated aspects for a body */
function pickAspects(c: Ctx, id: string, max: number, opts: { skip?: string[]; allowProvisional?: boolean } = {}): ModelAspect[] {
  const out = c.m.aspectsOf(id)
    .filter((a) => !c.narrated.has(a.idx))
    .filter((a) => opts.allowProvisional || !a.provisional)
    .filter((a) => !(opts.skip ?? []).includes(a.aId === id ? a.bId : a.aId))
    .filter((a) => a.major || a.orb <= 2)
    .sort((x, y) => x.orb - y.orb);
  return out.slice(0, max);
}

function narrateAspects(c: Ctx, id: string, asps: ModelAspect[]): { text: string; why: string[] } {
  const why: string[] = [];
  const parts = asps.map((a, i) => {
    c.narrated.set(a.idx, c.chapter);
    why.push(whyAspect(c, a));
    const lead = fmt(LEADS[(i + c.leadN++) % LEADS.length], { d: describeAspect(a) });
    const partner = c.p(a.aId === id ? a.bId : a.aId);
    const flav = pairSentence(c, a);
    return `${lead}${flav}${partner.id === "sun" || partner.id === "moon" ? "" : ""}`;
  });
  return { text: parts.join(" "), why };
}

/** cross-reference aspects that were already told in an earlier chapter */
function crossRef(c: Ctx, id: string): string | null {
  const earlier = c.m.aspectsOf(id).filter((a) => c.narrated.has(a.idx) && (c.narrated.get(a.idx) ?? 0) < c.chapter);
  if (!earlier.length) return null;
  const bits = earlier.slice(0, 2).map((a) => {
    const other = c.p(a.aId === id ? a.bId : a.aId);
    return `its ${ASPECT_MAP[a.type].name.toLowerCase()} to your ${other.name} (Chapter ${c.narrated.get(a.idx)})`;
  });
  return `Keep in mind, too, ${bits.length === 2 ? "both" : ""} ${list(bits)} — ${bits.length === 2 ? "they are" : "it is"} part of how ${c.p(id).name} behaves in practice.`.replace("  ", " ");
}

/* ------------------------------ shared builders ------------------------------ */

function houseSentence(c: Ctx, id: string): { text: string; why: string[] } | null {
  const p = c.p(id);
  if (!c.timeKnown) return null;
  const h = p.house;
  let t: string;
  if (id === "sun") t = SUN_BY_HOUSE[h - 1];
  else if (id === "moon") t = MOON_BY_HOUSE[h - 1];
  else {
    const frames = HOUSE_FRAME[id];
    if (!frames) return null;
    t = fmt(frames[h % 2], { ord: ORDINAL[h - 1], arena: HOUSE_ARENA[h - 1] });
  }
  if (c.chart.houseSystem === "equal") t += " (Houses here use a simplified equal-house fallback because of your birthplace’s latitude, so treat this placement as approximate.)";
  return { text: t, why: [whyPlanet(c, id), whyHouse(c, h)] };
}

function noHouseNote(c: Ctx, id: string): string {
  const p = c.p(id);
  return `Which part of life ${p.name} lights up — its house — depends on the exact time you were born, so it is left open here rather than guessed.`;
}

function dignityLine(c: Ctx, id: string): string | null {
  const p = c.p(id);
  if (!p.dignity || p.signUncertain) return null;
  return fmt(DIGNITY_LINE[p.dignity], { P: p.name, S: p.signName });
}

function altSignNote(c: Ctx, id: string, facet: (sign: number) => string): string | null {
  const p = c.p(id);
  if (!p.signUncertain || p.altSign === null) return null;
  const alt = SIGNS[p.altSign].name;
  return `Because your birth time is unknown, ${p.name} changed sign during your birth day: it was in ${p.signName} for part of it and ${alt} for the rest, and we cannot tell which applied at the moment you were born. The portrait follows ${p.signName}; if ${alt} feels closer to home, here is how that version reads — ${lc(facet(p.altSign))}`;
}

const relation = (a: string, b: string): "same" | "harmonious" | "friction" =>
  a === b ? "same" : (a === "Fire" && b === "Air") || (a === "Air" && b === "Fire") || (a === "Earth" && b === "Water") || (a === "Water" && b === "Earth") ? "harmonious" : "friction";

/* ------------------------------ themes (opening) ------------------------------ */

interface Theme { id: string; weight: number; teaser: string; kind: string }

function collectThemes(c: Ctx): Theme[] {
  const m = c.m, out: Theme[] = [];
  for (const a of m.aspects) {
    if (!a.major || a.provisional) continue;
    const personalA = PERSONAL.includes(a.aId) || a.aId === "jupiter" || a.aId === "saturn";
    const personalB = PERSONAL.includes(a.bId) || a.bId === "jupiter" || a.bId === "saturn";
    if (!(personalA && personalB) && a.orb > 2.5) continue;
    if (a.orb > 3) continue;
    const A = c.p(a.aId), B = c.p(a.bId);
    const boost = (a.aId === "sun" || a.aId === "moon" || a.bId === "sun" || a.bId === "moon" ? 3 : 0) + (personalA && personalB ? 2 : 0);
    out.push({
      id: `asp-${a.idx}`, kind: "aspect", weight: 10 - a.orb * 2 + boost,
      teaser: `a ${closeness(a.orb)} ${ASPECT_MAP[a.type].name.toLowerCase()} between your ${A.name} and ${B.name}`,
    });
  }
  for (const k of m.concentrations) {
    if (k.kind === "sign") {
      const si = SIGNS.findIndex((s) => s.name === k.label);
      out.push({ id: `conc-${k.label}`, kind: "conc-sign", weight: 6 + (k.members.length - 3) * 2, teaser: `${k.members.length} bodies gathered in ${k.label} (${list(k.members)}), which makes ${k.label}’s ${SIGN_MICRO[si].adj} themes a recurring refrain` });
    } else if (c.housesFirm) {
      const h = Number(k.label.replace("House ", ""));
      out.push({ id: `conc-h${h}`, kind: "conc-house", weight: 5 + (k.members.length - 3) * 2, teaser: `${k.members.length} bodies sharing your ${ORDINAL[h - 1]} house, which puts ${HOUSE_ARENA[h - 1]} at the center of the story` });
    }
  }
  for (const el of ["Fire", "Earth", "Air", "Water"] as Element[]) {
    const n = m.elements[el].count;
    if (n >= 4) out.push({ id: `el-${el}`, kind: "element", weight: 4 + (n - 4) * 2, teaser: `a strong lean toward ${el.toLowerCase()} — ${n} of ten bodies in ${el.toLowerCase()} signs — which emphasizes ${ELEMENT_SPARK[el]}` });
  }
  for (const g of m.angular) {
    const p = c.p(g.id);
    out.push({ id: `ang-${g.id}`, kind: "angular", weight: 7 - g.orb * 0.3, teaser: `${p.name} sitting right on your ${g.angle === "ASC" ? "Ascendant" : "Midheaven"}, which puts ${PLANET_NOUN[g.id]} at center stage` });
  }
  for (const gp of m.geometry) {
    out.push({ id: gp.id, kind: "geometry", weight: gp.kind === "grand-cross" ? 8 : gp.kind === "yod" ? 5 : 6, teaser: `a ${gp.kind.replace("-", " ")} linking ${list(gp.members.map((i) => c.m.placements[i].name))}` });
  }
  if (m.hemispheres) {
    const h = m.hemispheres;
    const lean = h.above >= 8 ? "above" : h.below >= 8 ? "below" : null;
    if (lean) out.push({ id: "hemi", kind: "hemisphere", weight: 4, teaser: `${Math.max(h.above, h.below)} of ten bodies ${lean === "above" ? "above" : "below"} the horizon, tilting the chart toward the ${lean === "above" ? "outer, public" : "inner, personal"} side of life` });
  }
  const sm = relation(c.p("sun").element, c.p("moon").element);
  if (sm === "friction") out.push({ id: "sun-moon-friction", kind: "sunmoon", weight: 4, teaser: `a ${c.p("sun").element.toLowerCase()} Sun with a ${c.p("moon").element.toLowerCase()} Moon — what you want and what you need speak different elemental languages` });
  return out.sort((x, y) => y.weight - x.weight);
}

/* ------------------------------ chapters ------------------------------ */

function bigThreeAdj(c: Ctx) {
  const s = SIGN_MICRO[c.p("sun").sign], mo = SIGN_MICRO[c.p("moon").sign];
  const a = c.timeKnown ? SIGN_MICRO[c.m.asc.sign] : null;
  return { s, mo, a };
}

function chOpening(c: Ctx): PortraitChapter {
  const sun = c.p("sun"), moon = c.p("moon");
  const { s, mo, a } = bigThreeAdj(c);
  const blocks: PortraitBlock[] = [];
  const you = c.chart.name !== "You" ? `${c.chart.name}, this` : "This";
  blocks.push(block("lead",
    `${you} portrait is built from the sky as it actually stood at your birth: where each planet was, which signs they occupied, how they related to one another. It is not a Sun-sign horoscope, and it is not a script — think of it as a thoughtful, slightly poetic conversation about the patterns astrology associates with a chart like yours.`));

  const sunMoonRel = relation(sun.element, moon.element);
  const sunUnc = sun.signUncertain ? ` (with a caveat about a sign boundary that we will come to)` : "";
  let big = `Your Sun is in ${sun.signName}${sunUnc} and your Moon in ${moon.signName}${moon.signUncertain ? " (possibly)" : ""}`;
  if (a) {
    big += `, with ${SIGNS[c.m.asc.sign].name} rising. In the language of astrology, that suggests someone who is ${s.adj} at the core, ${mo.adj} when it comes to emotional needs, and ${a.adj} in the way they arrive in a room.`;
  } else {
    big += `. In the language of astrology, that suggests someone who is ${s.adj} at the core and ${mo.adj} when it comes to emotional needs — with a third piece, the Rising sign, waiting for a birth time.`;
  }
  const whyBig = [whyPlanet(c, "sun"), whyPlanet(c, "moon"), ...(c.timeKnown ? [whyAngle(c, "asc")] : [])];
  blocks.push(block("p", `${big} ${sunMoonRel === "same" ? `Because Sun and Moon share the ${sun.element.toLowerCase()} element, these two sides of you tend to pull in the same direction.` : sunMoonRel === "harmonious" ? `Sun and Moon sit in different but cooperative elements, so there is a natural give-and-take between your drives and your needs.` : `Sun and Moon speak different elemental languages, which is less a problem than a source of depth — and of a few interesting inner conversations.`}`, whyBig));

  const themes = collectThemes(c);
  const chosen: Theme[] = [];
  const kinds: Record<string, number> = {};
  for (const t of themes) {
    if ((kinds[t.kind] ?? 0) >= 2) continue;
    chosen.push(t); kinds[t.kind] = (kinds[t.kind] ?? 0) + 1;
    if (chosen.length === 3) break;
  }
  c.themes = chosen.map((t) => t.id);
  if (chosen.length >= 2) {
    blocks.push(block("p", `Three themes stand out when the whole chart is laid side by side: ${list(chosen.map((t) => t.teaser))}. None of these is a verdict; each is a place where the sky at your birth speaks a little more loudly — tight angles in particular give a pairing an unusually clear voice — and the chapters ahead will return to them.`));
  } else if (chosen.length === 1) {
    blocks.push(block("p", `One theme stands out when the whole chart is laid side by side: ${chosen[0].teaser}. Much of the rest of your chart is more evenly weighted, which gives it a flexible, many-sided quality rather than a single loud note.`));
  } else {
    blocks.push(block("p", `What is notable about your chart is how evenly it is weighted: no element dominates, no cluster of planets crowds one sign, and no single connection overpowers the others. Charts like this tend to read as many-sided — you may be hard to sum up in a sentence, which is itself a kind of signature.`));
  }
  if (!c.timeKnown) {
    const lost = c.m.reliability.uncertainBodies.length ? " and, because of a sign boundary, possibly the sign of one planet" : "";
    blocks.push(block("note", `A note on your birth time. Without it, the Rising sign, the twelve houses and your chart ruler cannot be determined, so this portrait leaves them out rather than guessing — you will see where each would have entered. Your Sun, Mercury, Venus, Mars and the slower planets are unaffected. The Moon moves quickly, so its exact degree is approximate${lost}.`));
  } else {
    blocks.push(block("p", `A few words on how to read it. Astrology is a symbolic language, not a measurement of personality: the sentences below describe tendencies that tradition associates with your placements, offered as prompts for recognition rather than facts about you. Where a paragraph rests on a specific placement, look for the small “Show me why” link — it opens the calculation behind the sentence and can point you to the matching spot on your chart.`));
  }
  return mkChapter(c, "opening", null, "Opening", "The essence of your chart", "✦", "#e5c185", "How the sky at your birth fits together", blocks);
}

function chSun(c: Ctx): PortraitChapter {
  const sun = c.p("sun"), i = sun.sign;
  const f = SUN_BY_SIGN[i];
  const B: PortraitBlock[] = [];
  const wp = whyPlanet(c, "sun");
  B.push(block("p", `Your Sun sign is the one you probably already know, but it is only the first line of a longer sentence. ${f[0]} ${f[1]}`, [wp]));
  const dig = dignityLine(c, "sun");
  B.push(block("p", `${f[2]} ${f[3]} ${f[4]}${dig ? ` ${dig}` : ""}`, [wp]));
  const alt = altSignNote(c, "sun", (s) => SUN_BY_SIGN[s][0]);
  if (alt) B.push(block("note", alt, [wp]));

  const hs = houseSentence(c, "sun");
  if (hs) {
    const h = sun.house;
    B.push(block("p", `${hs.text} This is how a Sun sign gets modified in a real chart: the sign supplies the style — ${SIGN_MICRO[i].adj} — while the house supplies the stage, which here is ${HOUSE_ARENA[h - 1]}. Two people with the same Sun sign but different houses can look quite different from one another for exactly this reason.`, hs.why));
  } else {
    B.push(block("p", `${noHouseNote(c, "sun")} Until then, think of the sign as the style of your light and leave the stage open: the same ${sun.signName} qualities can show up at work, at home or in friendship, and only your birth time can say which of those is the main theater.`, [wp]));
  }

  const asp = pickAspects(c, "sun", 3, { skip: ["moon"] });
  if (asp.length) {
    const n = narrateAspects(c, "sun", asp);
    B.push(block("p", `${n.text} Aspects like these are the other great modifier of a Sun sign: they show which of your other drives your sense of self is most closely wired to.`, [wp, ...n.why]));
  } else if (c.m.aspectsOf("sun").length === 0) {
    B.push(block("p", `Your Sun forms no aspects within the usual orbs, which tends to make its qualities read in a relatively pure form: ${lc(SIGN_MICRO[i].noun)} is expressed without much interference from the rest of the chart.`, [wp]));
  }
  const ang = c.m.angular.find((g) => g.id === "sun");
  if (ang) B.push(block("p", `Your Sun sits within ${orbText(ang.orb)} of the ${ang.angle === "ASC" ? "Ascendant" : "Midheaven"}, one of the chart’s four sensitive points, which tends to make Sun themes impossible to miss — in how you come across and in how others describe you.`, [wp, whyAngle(c, ang.angle === "ASC" ? "asc" : "mc")]));
  return mkChapter(c, "sun", 1, "Chapter 1", "Your Sun: Who you are at your core", "☉", "#ffc46f", `${sun.signName} Sun${c.housesFirm ? ` · House ${sun.house}` : ""}`, B);
}

function chRising(c: Ctx): PortraitChapter {
  const B: PortraitBlock[] = [];
  if (!c.timeKnown) {
    B.push(block("p", `Your Rising sign, or Ascendant, is the zodiac sign that was climbing over the eastern horizon at the moment you were born. It changes roughly every two hours, which makes it the most time-sensitive part of a chart — and, without a birth time, the one part that cannot be worked out. It could have been any of the twelve signs, so this chapter does not assign you one.`, [whyAngle(c, "asc")]));
    B.push(block("p", `The chart on your screen is drawn for a placeholder of 12:00 noon, so the Ascendant, house lines and chart ruler it shows are stand-ins, not findings. If you can find your time of birth — a birth certificate, hospital record or a family member’s memory are the usual sources — casting the chart again will unlock this chapter, along with the house placements and chart ruler that depend on it.`));
    B.push(block("p", `In the meantime, the question this chapter answers is one you can explore directly. How do people describe you after meeting you once? What do you do in the first ten minutes of an unfamiliar situation — hang back, jump in, joke, observe? The Rising sign is traditionally the lens for exactly that, and your own pattern of answers is a perfectly good place to begin. Notice, too, whether the person people meet first matches the person you know yourself to be; astrology’s point in this chapter is that those two often differ, and that the difference is natural.`));
    return mkChapter(c, "rising", 2, "Chapter 2", "Your Rising Sign: What a birth time would reveal", "↑", "#ffe3b4", "Unavailable without a birth time", B);
  }
  const si = c.m.asc.sign, f = ASC_BY_SIGN[si], sun = c.p("sun");
  const wa = whyAngle(c, "asc");
  B.push(block("p", `Your Rising sign, or Ascendant, is the sign that was rising over the eastern horizon at the moment you were born — ${c.m.asc.text} ${SIGNS[si].name}, in your case. If the Sun is the center of your chart, the Rising sign is its doorway: the way you tend to arrive. ${f[0]} ${f[2]}`, [wa]));
  B.push(block("p", `${f[1]} ${f[3]}`, [wa]));

  const sRel = relation(sun.element, SIGNS[si].element);
  const same = sun.sign === si;
  const opposite = (sun.sign + 6) % 12 === si;
  const q = (el: string) => ELEMENT_QUALITY[el];
  const key = same ? "same" : opposite ? "opposite" : sRel === "same" ? "element" : sRel === "harmonious" ? "harmonious" : "friction";
  const rel = fmt(SUN_ASC_RELATION[key as keyof typeof SUN_ASC_RELATION], {
    sun: sun.signName, asc: SIGNS[si].name, sunLower: sun.signName, el: sun.element.toLowerCase(),
    sunQ: q(sun.element), ascQ: q(SIGNS[si].element),
  });
  B.push(block("p", `${rel}`, [whyPlanet(c, "sun"), wa]));

  const A = SIGN_MICRO[si], S = SIGN_MICRO[sun.sign];
  B.push(block("p", `It helps to remember why outward presentation can differ from inner identity. The Sun describes who you are when you are being most yourself; the Ascendant describes the interface you built, mostly without noticing, for dealing with a world that did not know you yet. A colleague meeting you at a work event may describe someone ${A.adj}; a close friend, seeing further in, may describe someone more ${S.adj}. Neither is wrong — they are meeting different layers of you.`, [wa, whyPlanet(c, "sun")]));

  const r = c.m.ruler;
  if (r) {
    const rp = r.placement, wr = whyRuler(c)!;
    const trad = r.traditionalId ? ` (older astrology gave ${SIGNS[si].name} a traditional ruler too: ${cap(r.traditionalId)}, which is worth keeping in the background)` : "";
    let t = `Astrology also gives every sign a ruling planet, and the ruler of your Rising sign is called your chart ruler — a kind of steward for the whole chart. For ${SIGNS[si].name} that is ${rp.name}${trad}, and yours sits in ${rp.signName}`;
    t += c.housesFirm ? `, in your ${ORDINAL[rp.house - 1]} house. Because the steward lives in the house of ${HOUSE_ARENA[rp.house - 1]}, the story of your life tends to keep returning there: it is where your approach to the world finds something to do.` : `. ${c.chart.houseSystem === "equal" ? "Its house is approximate because of the equal-house fallback at your latitude." : ""}`;
    t += ` ${rp.name} in ${rp.signName} also colors the style — ${SIGN_MICRO[rp.sign].adj} — in which that approach tends to be carried out.`;
    if (rp.id === "sun") t += " Since your chart ruler is the Sun itself, your identity and your outward approach are unusually closely linked.";
    else if (rp.id === "moon") t += " Since your chart ruler is the Moon, your emotional life is tied closely to how you meet the world: your mood travels with you more visibly than you might think.";
    B.push(block("p", t, [wr, wa]));
  }
  for (const g of c.m.angular.filter((x) => x.angle === "ASC")) {
    const p = c.p(g.id);
    if (g.id === "sun") continue;
    B.push(block("p", `${p.name} lies within ${orbText(g.orb)} of your Ascendant, which means ${PLANET_NOUN[g.id]} is part of what people meet first — it tends to be visible in your manner before you have said a word.`, [whyPlanet(c, g.id), wa]));
  }
  return mkChapter(c, "rising", 2, "Chapter 2", "Your Rising Sign: How you meet the world", SIGNS[si].glyph, "#ffe3b4", `${SIGNS[si].name} rising`, B);
}

function moonPhase(c: Ctx) {
  const e = c.m.elongation, bin = Math.floor(e / 45) % 8;
  const lo = Math.floor(((e - 6.2 + 360) % 360) / 45) % 8, hi = Math.floor(((e + 6.2) % 360) / 45) % 8;
  return { bin, border: !c.timeKnown && (lo !== bin || hi !== bin), other: lo !== bin ? lo : hi };
}

function chMoon(c: Ctx): PortraitChapter {
  const moon = c.p("moon"), i = moon.sign, f = MOON_BY_SIGN[i], B: PortraitBlock[] = [];
  const wp = whyPlanet(c, "moon");
  B.push(block("p", `If the Sun is what you do in the light, the Moon is what you need when the lights are low. It describes your emotional world — what soothes you, how you react before you have time to think, what “home” has to feel like. ${f[0]} ${f[1]}`, [wp]));
  B.push(block("p", `${f[2]} ${f[3]} ${f[4]}`, [wp]));

  if (!c.timeKnown) {
    if (moon.signUncertain) {
      const alt = altSignNote(c, "moon", (s) => MOON_BY_SIGN[s][0]);
      if (alt) B.push(block("note", alt, [wp]));
    } else {
      B.push(block("note", `Because the birth time is unknown, the Moon’s exact degree is approximate — it moves roughly 13° in a day. Happily, it stayed in ${moon.signName} for the entire day you were born, so the sign reading above holds regardless of the hour.`, [wp]));
    }
  }
  const dig = dignityLine(c, "moon");
  const hs = houseSentence(c, "moon");
  if (hs) B.push(block("p", `${hs.text}${dig ? ` ${dig}` : ""} Put together, your ${moon.signName} Moon supplies the emotional style — ${SIGN_MICRO[i].adj} — and the ${ORDINAL[moon.house - 1]} house names the part of life where that style most wants to be at home: ${HOUSE_ARENA[moon.house - 1]}.`, hs.why));
  else B.push(block("p", `${dig ? `${dig} ` : ""}${noHouseNote(c, "moon")}`, [wp]));

  const ph = moonPhase(c);
  const phaseWhy = `ph:moon`;
  c.whys[phaseWhy] = {
    id: phaseWhy, kind: "phase", title: `Birth lunar phase · ${MOON_PHASES[ph.bin].name}`, glyph: "☽", color: "#dde5f0",
    facts: [
      { label: "Sun → Moon angle", value: `${c.m.elongation.toFixed(0)}° ahead of the Sun` },
      { label: "Phase", value: MOON_PHASES[ph.bin].name },
    ],
    tradition: "The angle between Sun and Moon at birth places you in one of eight stages of the lunar cycle, each with its own traditional flavor.",
    caveat: !c.timeKnown ? "Birth time unknown: the Moon’s position — and so the phase — is approximate." : undefined,
    firmness: c.timeKnown ? "firm" : "approximate", selection: { kind: "planet", index: 1 }, spotlight: { planets: [0, 1], aspects: [] },
  };
  B.push(block("p", `${MOON_PHASES[ph.bin].text}${ph.border ? ` Your birth sits close to the boundary with the ${MOON_PHASES[ph.other].name} phase, which the unknown time makes impossible to settle — read the two as neighbors.` : ""}`, [wp, phaseWhy]));

  if (c.timeKnown) {
    const asp = pickAspects(c, "moon", 3, { skip: ["sun"] });
    if (asp.length) {
      const n = narrateAspects(c, "moon", asp);
      B.push(block("p", `${n.text}`, [wp, ...n.why]));
    }
  } else {
    const sm = c.m.aspectBetween("sun", "moon");
    if (sm) { c.narrated.set(sm.idx, c.chapter); }
    B.push(block("p", `One more honest limit: aspects to the Moon are left out of this reading, because the Moon’s angle to other planets shifts by up to about six degrees across the day and the exact figure cannot be pinned down without a birth time.`));
  }
  return mkChapter(c, "moon", 3, "Chapter 3", "Your Moon: Your emotional world", "☽", "#dde5f0", `${moon.signName} Moon${c.housesFirm ? ` · House ${moon.house}` : ""}`, B);
}

function chBigThree(c: Ctx): PortraitChapter {
  const sun = c.p("sun"), moon = c.p("moon"), B: PortraitBlock[] = [];
  const ws = whyPlanet(c, "sun"), wm = whyPlanet(c, "moon");
  const asc = c.timeKnown ? { sign: c.m.asc.sign, el: SIGNS[c.m.asc.sign].element as string, name: SIGNS[c.m.asc.sign].name } : null;
  const wa = c.timeKnown ? [whyAngle(c, "asc")] : [];
  const sm = relation(sun.element, moon.element);

  const els = [sun.element as string, moon.element as string, ...(asc ? [asc.el] : [])];
  const uniq = [...new Set(els)];
  let shape: string;
  if (asc && uniq.length === 1) shape = `All three of your key placements are in ${uniq[0].toLowerCase()} signs, which is unusual: ${ELEMENT_QUALITY[uniq[0]]} is not just a trait of one part of you but the common thread of your whole temperament.`;
  else if (asc && uniq.length === 3) shape = `Your Sun, Moon and Rising each sit in a different element, which tends to feel like having several fluent languages: you can meet situations ${ELEMENT_QUALITY[els[2]]}, understand yourself ${ELEMENT_QUALITY[els[0]]}, and recover ${ELEMENT_QUALITY[els[1]]} — and you may sometimes wonder which of them is you.`;
  else if (asc) {
    const pairWord = els[0] === els[1] ? `Sun and Moon` : els[0] === els[2] ? `Sun and Rising` : `Moon and Rising`;
    const shared = els[0] === els[1] ? els[0] : els[0] === els[2] ? els[0] : els[1];
    const odd = els.find((e) => e !== shared)!;
    const oddName = els[0] === odd ? "Sun" : els[1] === odd ? "Moon" : "Rising sign";
    shape = `Your ${pairWord} share the ${shared.toLowerCase()} element, while your ${oddName} brings in ${odd.toLowerCase()}. In practice that often feels like a dominant temperament — ${ELEMENT_QUALITY[shared]} — with one side of you that approaches things differently — ${ELEMENT_QUALITY[odd]}.`;
  } else shape = "";

  B.push(block("p", `The last three chapters described each placement separately, but you do not experience them one at a time. They are in constant conversation, and the way they reinforce, complement or challenge one another is much of what makes a person feel like a person rather than a list of traits. ${shape}`.trim(), [ws, wm, ...wa]));

  /* Sun–Moon, element-based, then any real aspect */
  const sq = ELEMENT_QUALITY[sun.element], mq = ELEMENT_QUALITY[moon.element];
  let smText: string;
  if (sm === "same") smText = `Your Sun and Moon are both in ${sun.element.toLowerCase()} signs, so what you want and what you need tend to speak the same language. There is less internal translation to do — though the strengths and blind spots of ${sun.element.toLowerCase()} can arrive doubled.`;
  else if (sm === "harmonious") smText = `Your ${sun.element.toLowerCase()} Sun and ${moon.element.toLowerCase()} Moon are different elements that traditionally support one another: ${sq} meets ${mq}, and each tends to give the other something it lacks.`;
  else smText = `Your ${sun.element.toLowerCase()} Sun and ${moon.element.toLowerCase()} Moon speak different elemental languages: your identity is ${sq}, while your emotional needs run ${mq}. That is not a flaw, only a reason you may sometimes feel pulled between what you want to be doing and what you need in order to feel all right.`;
  const smAsp = c.m.aspectBetween("sun", "moon");
  if (smAsp && !smAsp.provisional) {
    c.narrated.set(smAsp.idx, c.chapter);
    smText += ` The ${ASPECT_MAP[smAsp.type].name.toLowerCase()} between them (${orbText(smAsp.orb)} from exact) turns that general impression into something measurable. ${pairSentence(c, smAsp)}`;
  }
  B.push(block("p", smText, [ws, wm, ...(smAsp && !smAsp.provisional ? [whyAspect(c, smAsp)] : [])]));

  /* conditional synthesis: public self-expression vs private emotional security */
  const sunOut = sun.element === "Fire" || sun.element === "Air";
  const moonIn = moon.element === "Earth" || moon.element === "Water";
  const sunIn = sun.element === "Earth" || sun.element === "Water";
  const moonOut = moon.element === "Fire" || moon.element === "Air";
  const saturnHard = c.m.aspectsOf("saturn").find((a) => (a.aId === "sun" || a.bId === "sun" || ((a.aId === "moon" || a.bId === "moon") && c.timeKnown)) && (a.nature === "tension" || a.nature === "blend") && a.orb <= 6);
  const moonPrivate = c.housesFirm && [4, 8, 12].includes(moon.house);
  if (sunOut && moonIn && (saturnHard || moonPrivate)) {
    const reason = saturnHard
      ? `Saturn adds a note of restraint through its ${ASPECT_MAP[saturnHard.type].name.toLowerCase()} to your ${saturnHard.aId === "saturn" ? c.p(saturnHard.bId).name : c.p(saturnHard.aId).name}`
      : `your Moon’s placement in the ${ORDINAL[moon.house - 1]} house adds a taste for privacy`;
    B.push(block("p", `There is a distinction worth drawing in your chart, between public self-expression and private emotional security. Your ${sun.signName} Sun is outward-moving and expressive, while your ${moon.signName} Moon is more reserved, and ${reason}. In everyday life that might look like being relaxed in a meeting or on a stage, then needing a closed door and some quiet to recover — not because the confident version is a mask, but because the two sides of you run on different fuel. Neither is the “real” you; the work is letting each have its own time.`, [ws, wm, ...(saturnHard ? [whyAspect(c, saturnHard)] : [whyHouse(c, moon.house)])]));
  } else if (sunIn && moonOut) {
    B.push(block("p", `An interesting reversal sits in your chart: your ${sun.signName} Sun is self-contained and measured, while your ${moon.signName} Moon is expressive and quick to react. People who know you a little may take you for the reserved one, while those closest to you see how readily your feelings show. If you sometimes surprise yourself with how openly you react, this contrast is a likely source.`, [ws, wm]));
  }

  if (asc) {
    const mr = relation(moon.element, asc.el);
    const mrText = mr === "same" ? `Your Moon and Rising sign share an element, so the way you protect yourself and the way you present yourself work from the same instincts — people tend to see your mood quite directly.`
      : mr === "harmonious" ? `Your Moon and Rising sign are in cooperative elements, so the way you meet the world and the way you recover from it support each other rather than compete.`
      : `Your Moon and Rising sign are in contrasting elements, so the face you show the world and the comfort you secretly need can look quite different — a friend may find you composed at the party and need reassurance in the car afterward.`;
    B.push(block("p", mrText, [wm, ...wa]));
  }

  /* relatable scene built from the chart's own signs */
  const S = SIGN_MICRO[sun.sign], M = SIGN_MICRO[moon.sign];
  if (asc) {
    const A = SIGN_MICRO[asc.sign];
    B.push(block("p", `Imagine walking into a room of strangers. Your ${asc.name} Rising tends to ${A.lead}. A few hours later, if the evening has been draining, your ${moon.signName} Moon would ${M.settle}. And what makes the whole thing feel worthwhile — the reason you went at all — is probably your ${sun.signName} Sun’s appetite for ${S.seek}. Same person, three different layers, each one active at a different moment.`, [ws, wm, ...wa]));
    B.push(block("p", `Or picture a stressful week. The Rising sign handles the outer demands, the Moon quietly keeps score of what it cost, and the Sun asks whether any of it was yours to begin with. If you notice which one is speaking, you can often give the right part of yourself what it needs — rest for the Moon, a clean beginning for the Rising sign, a sense of purpose for the Sun.`));
  } else {
    B.push(block("p", `Imagine a draining week. Your ${sun.signName} Sun wants ${S.seek}, while your ${moon.signName} Moon would ${M.settle}. Noticing which one is asking — the part of you that wants to do something, or the part that needs to be looked after — is often the quickest way to know what to do next. A third voice, the Rising sign, would join this conversation once a birth time is known.`, [ws, wm]));
  }
  return mkChapter(c, "bigthree", 4, "Chapter 4", asc ? "Understanding your Big Three together" : "Your Sun and Moon together", "☉☽", "#e5c185", asc ? "Sun · Moon · Rising in conversation" : "Sun and Moon in conversation", B);
}

/** shared template for Mercury / Venus / Mars */
function chPersonal(c: Ctx, id: "mercury" | "venus" | "mars", num: number): PortraitChapter {
  const p = c.p(id), i = p.sign, B: PortraitBlock[] = [];
  const wp = whyPlanet(c, id);
  const data = { mercury: MERCURY_BY_SIGN, venus: VENUS_BY_SIGN, mars: MARS_BY_SIGN }[id][i];
  const sun = c.p("sun");
  const intro = {
    mercury: `${TRANSITION.toMercury} ${data[0]} ${data[1]}`,
    venus: `${TRANSITION.toVenus} Venus governs affection, attraction, taste and what you consider worth your care. ${data[0]} ${data[1]}`,
    mars: `${TRANSITION.toMars} Mars is energy with a direction: how you start, how you push, how you handle being blocked. ${data[0]} ${data[1]}`,
  }[id];
  B.push(block("p", intro, [wp]));

  let second = data[2];
  const dig = dignityLine(c, id);
  if (dig) second += ` ${dig}`;
  if (p.retro) second += ` ${RETRO_LINE[id]}`;
  /* distance from the Sun is real geometry, not a template */
  if (id !== "mars") {
    const d = (p.sign - sun.sign + 12) % 12;
    if (id === "mercury") {
      second += d === 0 ? ` Mercury shares your Sun’s sign, so how you think and who you are travel closely together.` : d === 1 ? ` Mercury sits one sign ahead of your Sun, which often reads as a mind that moves a step ahead of the self it serves.` : d === 11 ? ` Mercury sits one sign behind your Sun, which often reads as a reflective mind that digests an experience before speaking about it.` : "";
    } else {
      second += d === 0 ? ` Venus shares your Sun’s sign, so what you value and who you are are unusually well aligned.` : d === 1 || d === 11 ? ` Venus sits in the neighboring sign to your Sun, so your values and your identity are close companions with distinct accents.` : "";
    }
  }
  B.push(block("p", second, [wp]));

  const hs = houseSentence(c, id);
  const asp = pickAspects(c, id, 2);
  let third = hs ? `${hs.text}` : noHouseNote(c, id);
  const whys = hs ? hs.why : [wp];
  if (asp.length) {
    const n = narrateAspects(c, id, asp);
    third += ` ${n.text}`;
    whys.push(...n.why);
  }
  const x = crossRef(c, id);
  if (x) third += ` ${x}`;
  if (c.m.ruler?.id === id) third += ` As your chart ruler (Chapter 2), ${p.name} also carries extra weight: its condition colors how you meet the world overall, not only ${PLANET_NOUN[id]}.`;
  if (id === "mars") {
    const v = c.m.aspectBetween("venus", "mars");
    const vm = relation(c.p("venus").element, p.element);
    if (!v || c.narrated.has(v.idx)) third += ` Set beside your Venus in ${c.p("venus").signName}, this suggests ${vm === "same" ? "desire and drive that run on the same fuel" : vm === "harmonious" ? "affection and ambition that tend to cooperate" : "affection and ambition that sometimes want different things — one wanting closeness, the other momentum"}.`;
  }
  if (id === "mercury") {
    const m = c.p("moon");
    if (c.timeKnown || !m.signUncertain) {
      const r = relation(p.element, m.element);
      third += ` Compared with your Moon in ${m.signName}, your thinking and feeling ${r === "same" ? "share an element, so you probably find it easy to say what you feel" : r === "harmonious" ? "work in cooperative elements, so understanding and feeling tend to help each other" : "work in contrasting elements, so you may think one way and feel another — a useful tension when you notice it"}.`;
    }
  }
  B.push(block("p", third, [...new Set(whys)]));
  const meta = { mercury: ["Mercury: How you think and communicate", "☿", "How you think, learn and speak"], venus: ["Venus: How you connect, value, and love", "♀", "How you love, value and enjoy"], mars: ["Mars: Your drive and determination", "♂", "How you act, assert and persist"] }[id];
  return mkChapter(c, id, num, `Chapter ${num}`, `Your ${meta[0]}`, meta[1], p.color, `${p.signName}${c.housesFirm ? ` · House ${p.house}` : ""}${p.retro ? " · retrograde" : ""}`, B);
}

function chJupSat(c: Ctx): PortraitChapter {
  const j = c.p("jupiter"), s = c.p("saturn"), B: PortraitBlock[] = [];
  const wj = whyPlanet(c, "jupiter"), ws = whyPlanet(c, "saturn");
  const jf = JUPITER_BY_SIGN[j.sign], sf = SATURN_BY_SIGN[s.sign];
  const jd = dignityLine(c, "jupiter");
  let jt = `${TRANSITION.toSocial} Jupiter is the planet of growth, optimism and meaning — where life tends to feel generous. ${jf[0]} ${jf[1]}${jd ? ` ${jd}` : ""}${j.retro ? ` ${RETRO_LINE.jupiter}` : ""}`;
  const jh = houseSentence(c, "jupiter");
  if (jh) jt += ` ${jh.text}`;
  B.push(block("p", jt, [wj, ...(jh?.why ?? [])]));
  const ja = pickAspects(c, "jupiter", 1, { skip: ["saturn"] });
  if (ja.length) { const n = narrateAspects(c, "jupiter", ja); B.push(block("p", n.text, [wj, ...n.why])); }

  const sd = dignityLine(c, "saturn");
  let st = `Saturn is the planet of structure, patience and limits — the part of the chart that asks what you are willing to build slowly. ${sf[0]} ${sf[1]}${sd ? ` ${sd}` : ""}${s.retro ? ` ${RETRO_LINE.saturn}` : ""}`;
  const sh = houseSentence(c, "saturn");
  if (sh) st += ` ${sh.text}`;
  B.push(block("p", st, [ws, ...(sh?.why ?? [])]));
  const sa = pickAspects(c, "saturn", 2, { skip: ["jupiter"] });
  if (sa.length) { const n = narrateAspects(c, "saturn", sa); B.push(block("p", n.text, [ws, ...n.why])); }

  /* the pair: aspect if one exists, otherwise sign + house geometry */
  const js = c.m.aspectBetween("jupiter", "saturn");
  let pair = "";
  const whys = [wj, ws];
  if (js) {
    c.narrated.set(js.idx, c.chapter); whys.push(whyAspect(c, js));
    pair = `Jupiter and Saturn are often described as the chart’s accelerator and brake, and in your chart they are in direct contact: ${lc(describeAspect(js))}. ${pairSentence(c, js)} `;
  } else {
    const r = relation(j.element, s.element);
    pair = `Jupiter and Saturn are often described as the chart’s accelerator and brake. In your chart they do not form a direct aspect, so they work more like colleagues in different departments than like partners: Jupiter in ${j.signName} (${j.element.toLowerCase()}) and Saturn in ${s.signName} (${s.element.toLowerCase()}) ${r === "same" ? "share an element, which at least gives them a common vocabulary" : r === "harmonious" ? "are in cooperative elements, so they tend to complement each other" : "speak different elemental languages, so the dialogue between optimism and caution may need some deliberate translation"}. `;
  }
  if (c.housesFirm && j.house === s.house) pair += `Both sit in your ${ORDINAL[j.house - 1]} house, so growth and structure are asked of the same part of life — ${HOUSE_ARENA[j.house - 1]} — which can feel like pressure but also like focus. `;
  else if (c.housesFirm) pair += `Jupiter works in your ${ORDINAL[j.house - 1]} house (${HOUSE_SHORT[j.house - 1]}) while Saturn works in your ${ORDINAL[s.house - 1]} (${HOUSE_SHORT[s.house - 1]}), so you may find the part of life where you expand and the part where you must be careful are different rooms — useful to know before taking Jupiter’s generosity into Saturn’s territory. `;
  if (c.m.ruler && (c.m.ruler.id === "jupiter" || c.m.ruler.id === "saturn")) pair += `Your chart ruler is ${cap(c.m.ruler.id)} (Chapter 2), so this half of the story weighs more heavily than usual in how you meet the world. `;
  pair += `Over the long term, the two describe a rhythm: Jupiter opens a door, Saturn asks what it will take to walk through it, and real development tends to come from honoring both — dreaming in ${j.signName} terms, committing in ${s.signName} terms, and giving each time to do its part.`;
  B.push(block("p", pair, whys));
  return mkChapter(c, "jupsat", 8, "Chapter 8", "Jupiter and Saturn: Expansion and structure", "♃♄", j.color, `${j.signName} Jupiter · ${s.signName} Saturn`, B);
}

function chOuter(c: Ctx): PortraitChapter {
  const B: PortraitBlock[] = [];
  const ids = ["uranus", "neptune", "pluto"] as const;
  const gen = { uranus: URANUS_BY_SIGN, neptune: NEPTUNE_BY_SIGN, pluto: PLUTO_BY_SIGN };
  const role = {
    uranus: "Uranus is the planet of individuality and awakening — the part of the sky associated with breaking from convention.",
    neptune: "Neptune is the planet of imagination and dissolving boundaries — associated with dreams, compassion and idealism.",
    pluto: "Pluto is the planet of depth and transformation — associated with what is buried, what is outgrown and what is renewed.",
  };
  B.push(block("p", `${TRANSITION.toOuter} They are best read as the weather of an era, which you share with everyone born in the same few years — so we will avoid pretending they say more about you personally than they do, and look only for the places where your own chart gives them a personal voice.`));
  const personalTargets = ["sun", "moon", "mercury", "venus", "mars"];
  for (const id of ids) {
    const p = c.p(id), wp = whyPlanet(c, id);
    let t = `${role[id]} ${gen[id][p.sign]}.`.replace("..", ".");
    const whys = [wp];
    const personal: string[] = [];
    const asps = c.m.aspectsOf(id).filter((a) => {
      const other = a.aId === id ? a.bId : a.aId;
      return personalTargets.includes(other) && a.orb <= (a.type === "conj" ? 4 : 3) && a.major && !a.provisional && !c.narrated.has(a.idx);
    }).sort((x, y) => x.orb - y.orb).slice(0, 2);
    const angular = c.m.angular.find((g) => g.id === id);
    const hs = c.housesFirm && [1, 4, 7, 10].includes(p.house) ? houseSentence(c, id) : null;
    if (hs) { personal.push(hs.text); whys.push(...hs.why); }
    if (angular) { personal.push(`${p.name} also lies within ${orbText(angular.orb)} of your ${angular.angle === "ASC" ? "Ascendant" : "Midheaven"}, which gives this generational energy a personal, visible outlet.`); whys.push(whyAngle(c, angular.angle === "ASC" ? "asc" : "mc")); }
    if (asps.length) { const n = narrateAspects(c, id, asps); personal.push(n.text); whys.push(...n.why); }
    if (personal.length) t += ` What makes it personal for you: ${personal.join(" ")}`;
    else {
      const hh = c.housesFirm ? ` Its ${ORDINAL[p.house - 1]}-house setting hints at where these themes may quietly surface for you: ${HOUSE_ARENA[p.house - 1]}.` : "";
      const variants = [
        ` It makes no close aspect to your personal planets, so treat it as a backdrop rather than a headline.${hh}`,
        ` Nothing in your chart ties it tightly to your Sun, Moon or inner planets, which keeps its influence broad and impersonal.${hh}`,
        ` No tight angle connects it to your personal planets, so its story is mostly the story of your era, with only a faint personal accent.${hh}`,
      ];
      t += variants[ids.indexOf(id) % 3];
    }
    B.push(block("p", t, whys));
  }
  const pairs: [string, string][] = [["uranus", "neptune"], ["uranus", "pluto"], ["neptune", "pluto"]];
  const among = pairs.map(([x, y]) => c.m.aspectBetween(x, y)).filter((a): a is ModelAspect => !!a && !c.narrated.has(a.idx));
  if (among.length) {
    among.forEach((a) => c.narrated.set(a.idx, c.chapter));
    const bits = among.map((a) => `${cap(a.aId)} ${ASPECT_MAP[a.type].name.toLowerCase()} ${cap(a.bId)}`);
    B.push(block("p", `The outer planets also relate to one another: ${list(bits)}. Angles between planets this slow recur only rarely and are shared by an entire generation, so they are worth knowing as themes of your era — ${among.map((a) => `the pull toward ${PLANET_PULL[a.aId]} meeting the pull toward ${PLANET_PULL[a.bId]}`).slice(0, 2).join(", and ")} — but they are not a personal signature in the way a Sun–Moon aspect would be.`, among.map((a) => whyAspect(c, a))));
  }
  return mkChapter(c, "outer", 9, "Chapter 9", "Your outer planets", "♅♆♇", "#8fd8d4", "Generational forces, personal where they touch you", B);
}

function chPatterns(c: Ctx): PortraitChapter {
  const m = c.m, B: PortraitBlock[] = [];
  B.push(block("p", TRANSITION.toPatterns));

  /* elements */
  const els = (["Fire", "Earth", "Air", "Water"] as Element[]).map((e) => ({ e, n: m.elements[e].count }));
  const top = [...els].sort((a, b) => b.n - a.n)[0];
  const empty = els.filter((x) => x.n === 0);
  const tally = els.map((x) => `${x.n} ${x.e.toLowerCase()}`).join(", ");
  let et = `Start with the elements, the four temperaments of the zodiac. Counting all ten bodies, your chart holds ${tally}. `;
  if (top.n >= 4) et += `${top.e} leads, and it is a real lean rather than a technicality: ${cap(top.e.toLowerCase())} signs speak to ${ELEMENT_SPARK[top.e]}, and with ${list(m.elements[top.e].members)} all there, that language shows up repeatedly in how you think, feel and act. `;
  else et += `No element dominates, which tends to read as versatility: you can usually find a way into a situation through feeling, thought, action or practicality, and no single approach is your only one. `;
  if (empty.length) et += `${list(empty.map((x) => cap(x.e.toLowerCase())))} ${empty.length > 1 ? "have" : "has"} no planets at all. Tradition reads that not as a gap but as a quieter register: ${list(empty.map((x) => ELEMENT_SPARK[x.e]))} may be things you cultivate deliberately rather than things that arrive unbidden.`;
  const sunMoonEl = c.p("sun").element === c.p("moon").element ? "" : "";
  B.push(block("p", et + sunMoonEl, [whyElement(c, top.n >= 4 ? top.e : els[0].e), ...empty.map((x) => whyElement(c, x.e))]));

  /* modalities */
  const mods = (["Cardinal", "Fixed", "Mutable"] as const).map((k) => ({ k, n: m.modalities[k].count }));
  const mTop = [...mods].sort((a, b) => b.n - a.n)[0], mLow = [...mods].sort((a, b) => a.n - b.n)[0];
  if (mTop.n >= 5) B.push(block("p", `Modalities describe tempo rather than temperament. ${fmt(MODALITY_LINE[mTop.k].lots, { n: mTop.n, members: list(m.modalities[mTop.k].members.slice(0, 5)) })}`, [whyModality(c, mTop.k)]));
  else if (mLow.n <= 1) B.push(block("p", `Modalities describe tempo rather than temperament. ${fmt(MODALITY_LINE[mLow.k].few, { n: mLow.n })}`, [whyModality(c, mLow.k)]));
  else B.push(block("p", `Modalities describe tempo rather than temperament, and yours are mixed — ${mods.map((x) => `${x.n} ${x.k.toLowerCase()}`).join(", ")} — so you can usually begin, sustain and adapt as the situation requires, with no one rhythm taking over.`, [whyModality(c, mTop.k)]));

  /* concentrations + hemispheres + angles */
  const conc = m.concentrations.filter((k) => k.kind === "sign" || c.housesFirm);
  if (conc.length) {
    const parts = conc.slice(0, 2).map((k) => {
      if (k.kind === "sign") {
        const si = SIGNS.findIndex((s) => s.name === k.label);
        return { t: `${k.members.length} bodies — ${list(k.members)} — are gathered in ${k.label}. Astrologers call a crowd like this a concentration (or stellium), and read it as repetition for emphasis: ${SIGN_MICRO[si].noun} colors not one part of your life but several, and the themes of ${k.label} are likely to feel familiar from many directions.`, w: whyPattern(c, `conc-${k.label}`, `Concentration in ${k.label}`, `3+ of 10 bodies share one sign (${list(k.members)}).`, m.placements.filter((p) => p.signName === k.label).map((p) => p.index), [], "A crowded sign is read as emphasis, not destiny.", { kind: "sign", sign: si }) };
      }
      const h = Number(k.label.replace("House ", ""));
      return { t: `${k.members.length} bodies — ${list(k.members)} — share your ${ORDINAL[h - 1]} house. That puts a great deal of your inner traffic through one part of life, ${HOUSE_ARENA[h - 1]}, and it is likely to be a recurring stage on which different sides of you take turns.`, w: whyPattern(c, `conc-h${h}`, `Concentration in House ${h}`, `3+ of 10 bodies share one house (${list(k.members)}).`, m.placements.filter((p) => p.house === h).map((p) => p.index), [], "A busy house is read as a room where many things happen.", { kind: "house", house: h }) };
    });
    B.push(block("p", parts.map((x) => x.t).join(" "), parts.map((x) => x.w)));
  }
  if (m.hemispheres) {
    const h = m.hemispheres;
    const lean = h.above >= 7 ? `${h.above} of your ten bodies sit above the horizon (houses 7–12), the half of the chart traditionally linked with the outer, interpersonal side of life. Meaning may arrive for you through other people, events and public engagement more than through solitary reflection.`
      : h.below >= 7 ? `${h.below} of your ten bodies sit below the horizon (houses 1–6), the half traditionally linked with the personal and private side of life. You may be more self-contained and inwardly driven than you look from the outside.`
      : h.east >= 7 ? `${h.east} of your ten bodies sit in the eastern half of the chart (houses 10–3), which tradition links with self-starting — a sense that you shape events more than you wait for them.`
      : h.west >= 7 ? `${h.west} of your ten bodies sit in the western half of the chart (houses 4–9), which tradition links with a relational orientation: other people’s needs and circumstances play a large part in how things unfold for you.` : "";
    if (lean) B.push(block("p", lean, [whyPattern(c, "hemisphere", "Hemisphere emphasis", "7+ of 10 bodies in one half of the chart (counted by house).", [], [], "Halves of the chart are read as broad orientation, not fate.", null, c.chart.houseSystem === "equal" ? "Approximate: equal-house fallback." : undefined)]));
  }
  if (m.angular.length) {
    const t = m.angular.map((g) => `${c.p(g.id).name} (${orbText(g.orb)} from your ${g.angle === "ASC" ? "Ascendant" : "Midheaven"})`);
    B.push(block("p", `Planets close to the chart’s angles — the Ascendant and Midheaven — tend to carry extra weight, because they sit at the points where the chart meets the horizon and the sky’s summit. Yours: ${list(t)}. Their themes are likely to be easier for other people to see in you.`, m.angular.map((g) => whyPlanet(c, g.id))));
  }

  /* geometry */
  let geoSeen = 0;
  for (const g of m.geometry.slice(0, 2)) {
    const second = geoSeen++ > 0;
    const names = g.members.map((i) => c.m.placements[i].name);
    const w = whyPattern(c, g.id, g.title, g.rule, g.members, g.aspects, "A geometric figure formed by several aspects at once.");
    if (g.kind === "grand-trine") B.push(block("p", `A grand trine links ${list(names)} in a closed triangle of ease. It is a circuit of natural talent, and the caution tradition offers is that something this easy can go unused, since nothing forces you to develop it. Worth asking where in your life these three could be deliberately switched on.`, [w]));
    else if (g.kind === "t-square") B.push(block("p", second
      ? `${g.title.replace("T-square: ", "A second T-square forms between ")}, which reinforces the first: the same sort of pressure, applied from a slightly different direction.`
      : `${g.title.replace("T-square: ", "A T-square forms between ")}. Two planets pull against each other while a third sits at the point of pressure — traditionally read as the place where the tension is invited to become action. T-squares are often described as restless, driving patterns that produce real achievement when worked with consciously.`, [w]));
    else if (g.kind === "yod") B.push(block("p", `A yod connects ${list(names)}: two planets in an easy sextile that both look awkwardly toward a third. Older astrology gave this the dramatic name “finger of fate,” a phrase we find too fatalistic; a gentler reading is that your chart contains a specific, recurring task that keeps asking for small adjustments until a role for the apex planet emerges.`, [w]));
    else B.push(block("p", `A grand cross — ${list(names)} — locks two oppositions together through four squares. It is a demanding configuration, often described as a lot of pressure from every side, and also as a capacity for endurance and very hard work once the energy is organized.`, [w]));
  }

  /* closest aspects + hub + unaspected */
  const tight = m.aspects.filter((a) => a.major && !a.provisional).sort((a, b) => a.orb - b.orb).slice(0, 3);
  if (tight.length) {
    const bits = tight.map((a) => `${c.p(a.aId).name} ${ASPECT_MAP[a.type].name.toLowerCase()} ${c.p(a.bId).name} (${orbText(a.orb)})`);
    const first = tight[0];
    const ch = c.narrated.get(first.idx);
    B.push(block("p", `The closest aspects in the whole chart — the conversations that tend to be hardest to miss, because the angle is nearly exact — are ${list(bits)}. ${ch ? `The first of these was already told in Chapter ${ch}; its role here is structural: ` : "Its role here is structural: "}the tighter the angle, the more consistently the two themes show up together, so these pairings are good places to look when you want to understand a recurring pattern.`, tight.map((a) => whyAspect(c, a))));
    tight.forEach((a) => { if (!c.narrated.has(a.idx)) c.narrated.set(a.idx, c.chapter); });
  }
  const hub = [...m.placements].sort((a, b) => b.aspectCount - a.aspectCount)[0];
  const quiet = m.unaspected.filter((id) => ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"].includes(id) && (c.timeKnown || id !== "moon"));
  let hubText = "";
  if (hub.aspectCount >= 4) hubText += `${hub.name} is the most connected planet in your chart, with ${hub.aspectCount} aspects; whatever ${PLANET_NOUN[hub.id]} touches tends to ripple outward into several other parts of you. `;
  if (quiet.length) hubText += `${list(quiet.map((id) => c.p(id).name))} ${quiet.length > 1 ? "form" : "forms"} no aspects within the usual orbs, so ${quiet.length > 1 ? "those themes" : "that theme"} may operate more independently — less colored by the rest of the chart, and sometimes more singular in expression.`;
  if (hubText) B.push(block("p", hubText.trim(), [...(hub.aspectCount >= 4 ? [whyPlanet(c, hub.id)] : []), ...quiet.slice(0, 2).map((id) => whyPlanet(c, id))]));
  const rr = m.retrogrades.filter((id) => ["mercury", "venus", "mars", "jupiter", "saturn"].includes(id));
  if (rr.length >= 3) B.push(block("p", `${list(rr.map((id) => c.p(id).name))} were retrograde at your birth — an uncommon number for these five planets. Retrograde planets are traditionally read as turning their energy inward first, so this chart may have a reflective streak — a preference for thinking things through privately before showing the result.`, rr.slice(0, 3).map((id) => whyPlanet(c, id))));
  return mkChapter(c, "patterns", 10, "Chapter 10", "The patterns that connect your chart", "✧", "#b79ad1", "Elements, modalities, concentrations and aspects", B);
}

function chGrowth(c: Ctx): PortraitChapter {
  const m = c.m, B: PortraitBlock[] = [];
  const sun = c.p("sun"), moon = c.p("moon");
  const S = SIGN_MICRO[sun.sign], M = SIGN_MICRO[moon.sign];
  const A = c.timeKnown ? SIGN_MICRO[m.asc.sign] : null;
  const dom = (["Fire", "Earth", "Air", "Water"] as Element[]).sort((a, b) => m.elements[b].count - m.elements[a].count)[0];
  B.push(block("p", `${TRANSITION.toGrowth} Your chart draws on ${S.noun} from the Sun, ${M.noun} from the Moon${A ? ` and ${A.noun} from the Rising sign` : ""}, and when these work together they give you a recognizable set of strengths: ${S.adj} drive, ${M.adj} instincts${A ? `, ${A.adj} manner` : ""}${m.elements[dom].count >= 4 ? `, all steeped in ${dom.toLowerCase()}’s gift for ${ELEMENT_SPARK[dom]}` : ""}. Because they come from different parts of the chart, they are also available in different situations — you tend to use one set at work, another at home, another when you are alone.`, [whyPlanet(c, "sun"), whyPlanet(c, "moon"), ...(A ? [whyAngle(c, "asc")] : [])]));

  /* recurring tensions: only real ones */
  const tens = m.aspects.filter((a) => a.nature === "tension" && !a.provisional && (PERSONAL.includes(a.aId) || a.aId === "jupiter" || a.aId === "saturn") && (PERSONAL.includes(a.bId) || a.bId === "jupiter" || a.bId === "saturn")).sort((x, y) => x.orb - y.orb).slice(0, 2);
  const pairs: [string, string][] = [["venus", "mars"], ["mercury", "moon"], ["sun", "moon"]];
  const fric = pairs.find(([x, y]) => (x !== "moon" && y !== "moon" || c.timeKnown || !c.p("moon").signUncertain) && relation(c.p(x).element, c.p(y).element) === "friction");
  let tt = "";
  const whys: string[] = [];
  if (tens.length) {
    const bits = tens.map((a) => {
      const ch = c.narrated.get(a.idx);
      whys.push(whyAspect(c, a));
      return `${c.p(a.aId).name}–${c.p(a.bId).name} ${ASPECT_MAP[a.type].name.toLowerCase()}${ch ? ` (Chapter ${ch})` : ""}`;
    });
    const a0 = tens[0];
    tt += `The recurring tensions in your chart are not defects; they are the places where two things you care about want different outcomes. The clearest ${bits.length > 1 ? "are" : "is"} your ${list(bits)}. In daily life a week might arrive in which the pull toward ${PLANET_PULL[a0.aId]} competes with the pull toward ${PLANET_PULL[a0.bId]} — say, a decision about how to spend an evening, or how to answer a difficult message. A useful practice is simply to name both pulls before choosing. For ${cap(a0.aId)} that can mean ${PLANET_PRACTICE[a0.aId]}; for ${cap(a0.bId)}, ${PLANET_PRACTICE[a0.bId]}.`;
  } else {
    tt += `Your chart has few hard-angled aspects among its core planets, which tends to feel like an absence of obvious inner conflict. The honest caution is the flip side: where life flows easily, there may be less pressure to develop — so growth tends to come from choosing challenges deliberately rather than waiting for them.`;
  }
  B.push(block("p", tt, whys));

  /* contradictions don't invalidate */
  let contra = `It is worth saying plainly that seemingly contradictory placements do not cancel each other out or make a reading wrong. `;
  if (fric) {
    const [x, y] = fric;
    contra += `Your ${c.p(x).name} in ${c.p(x).signName} and ${c.p(y).name} in ${c.p(y).signName} speak different elemental languages, which on paper might suggest you are two different people. More accurately, you are one person with different tendencies in different contexts and different values at different moments — the way someone can be generous with time and careful with money, or gregarious at work and private at home.`;
  } else {
    contra += `Even in a chart whose main placements agree, there are different tendencies for different contexts: the way you handle work is rarely the way you handle grief, and astrology can only suggest where those differences may lie. When a sentence in this portrait does not fit you, treat that as information, not as an error to be explained away.`;
  }
  B.push(block("p", contra, fric ? [whyPlanet(c, fric[0]), whyPlanet(c, fric[1])] : []));

  /* ease vs tension balance */
  const eas = m.aspects.filter((a) => a.nature === "ease" && a.major && !a.provisional).length;
  const ten = m.aspects.filter((a) => a.nature === "tension" && a.major && !a.provisional).length;
  const ratio = eas + ten === 0 ? "" : eas > ten + 2 ? `Your aspects lean toward ease (${eas} flowing against ${ten} challenging), which suggests natural talent — and the particular growth edge of using it on purpose, since comfort rarely asks for effort.` : ten > eas + 2 ? `Your aspects lean toward challenge (${ten} tense against ${eas} flowing), which tradition associates with a life that develops through friction: you may often feel pushed, and often be rewarded for pushing back constructively.` : `Your aspects are fairly balanced (${eas} flowing, ${ten} challenging), a mix that suggests both talents to lean on and tensions that keep you growing.`;
  if (ratio) B.push(block("p", ratio));

  /* practical reflection examples */
  const el = dom;
  B.push(block("p", `A few practical ways to test this against your life, none of which require believing any of it. If your ${sun.signName} Sun is asking for ${S.seek}, notice how many weeks include any of it. If your ${moon.signName} Moon needs you to ${M.settle}, notice what happens when you let that happen before — rather than after — you are exhausted. And since ${m.elements[el].count >= 4 ? `your chart leans toward ${el.toLowerCase()}` : `no element dominates your chart`}, you might ${m.elements[el].count >= 4 ? ELEMENT_PRACTICE[el] : "experiment with whichever element feels least familiar and see what it offers"}. These are experiments, not prescriptions — the chart suggests where to look, and only your own experience can say what is true.`));
  return mkChapter(c, "growth", 11, "Chapter 11", "Your strengths and opportunities for growth", "☼", "#5fd3b7", "Strengths, tensions and what they ask of you", B);
}

function chLife(c: Ctx): PortraitChapter {
  const m = c.m, B: PortraitBlock[] = [];
  const sun = c.p("sun"), moon = c.p("moon"), ven = c.p("venus"), sat = c.p("saturn");
  const S = SIGN_MICRO[sun.sign], M = SIGN_MICRO[moon.sign];
  const A = c.timeKnown ? SIGN_MICRO[m.asc.sign] : null;
  B.push(block("p", `${TRANSITION.toLife} If you carried only one sentence from this portrait into your week, it might be this: you are ${S.adj} at the core, ${M.adj} in what you need${A ? `, and ${A.adj} in how you arrive` : ""}, and the interesting part of your life is the conversation between those three — which one gets to speak, when, and whether the others are allowed their turn. Everything else in the chart, from the way you think to the way you love, adds detail to that conversation rather than replacing it.`, [whyPlanet(c, "sun"), whyPlanet(c, "moon")]));

  /* questions chosen from what is actually in the chart */
  const Q: string[] = [];
  Q.push(fmt(REFLECTION_BANK.sun, { seek: S.seek }));
  Q.push(fmt(REFLECTION_BANK.moon, { sign: moon.signName }));
  if (c.housesFirm) Q.push(fmt(REFLECTION_BANK.sunHouse, { arena: HOUSE_ARENA[sun.house - 1] }));
  const tn = m.aspects.filter((a) => a.nature === "tension" && !a.provisional).sort((x, y) => x.orb - y.orb)[0];
  if (tn) Q.push(fmt(REFLECTION_BANK.tension, { a: `your ${c.p(tn.aId).name}`, b: `your ${c.p(tn.bId).name}` }));
  Q.push(c.housesFirm ? fmt(REFLECTION_BANK.saturn, { arena: HOUSE_ARENA[sat.house - 1] }) : fmt(REFLECTION_BANK.saturnSign, { sign: sat.signName }));
  Q.push(fmt(REFLECTION_BANK.venus, { valuing: lc(VENUS_BY_SIGN[ven.sign][1].replace(/^You value /, "").replace(/\.$/, "")) }));
  const lacking = (["Fire", "Earth", "Air", "Water"] as Element[]).find((e) => m.elements[e].count === 0);
  const strong = (["Fire", "Earth", "Air", "Water"] as Element[]).find((e) => m.elements[e].count >= 4);
  if (lacking) Q.push(fmt(REFLECTION_BANK.lacking, { el: lacking.toLowerCase(), spark: ELEMENT_SPARK[lacking] }));
  else if (strong) Q.push(fmt(REFLECTION_BANK.element, { el: strong.toLowerCase() }));
  if (!c.timeKnown) Q.push(REFLECTION_BANK.noTime);
  B.push(block("questions", "Questions worth sitting with", []));
  B[B.length - 1].items = Q.slice(0, 6);

  /* practical suggestions drawn from real themes */
  const tips: string[] = [];
  tips.push(`Give your ${moon.signName} Moon a standing appointment: ${lc(MOON_BY_SIGN[moon.sign][2].replace(/^Comfort (often )?(comes|arrives) (through |from )?/, "something like "))}`.replace(/\.$/, "") + ".");
  if (strong) tips.push(`Since your chart leans toward ${strong.toLowerCase()}, ${ELEMENT_PRACTICE[strong]}.`);
  else if (lacking) tips.push(`To invite in some of the ${lacking.toLowerCase()} your chart lacks, ${ELEMENT_PRACTICE[lacking]}.`);
  tips.push(`Once this week, try ${PLANET_PRACTICE[tn ? tn.aId : "mercury"]} — and notice what changes.`);
  const lst = block("list", "Optional, small, and entirely yours to ignore");
  lst.items = tips.slice(0, 3);
  B.push(lst);

  const closing = !c.timeKnown
    ? `When you have your birth time, come back and cast the chart again: your Rising sign, houses and chart ruler will fill in the picture, and several of the paragraphs above will deepen. Until then, there is already plenty here to test against your own experience.`
    : `Astrology cannot tell you who you are, and nothing in this portrait is a prediction. What it can do is offer a vocabulary — a way of noticing patterns you might otherwise have lived without naming. Keep what rings true, set down what does not, and let the rest stay open as a question. The sky at your birth is a fixed moment, but what you do with it is not.`;
  B.push(block("p", closing));
  B.push(block("pull", `You are not a fixed result of this sky; you are someone who can read it, and decide what to make of it.`));
  return mkChapter(c, "life", 12, "Chapter 12", "Bringing your cosmic portrait into your life", "✦", "#e5c185", "Reflection, questions and a few experiments", B);
}

/* ------------------------------ assembly ------------------------------ */

function mkChapter(c: Ctx, id: string, number: number | null, kicker: string, title: string, glyph: string, color: string, blurb: string, blocks: PortraitBlock[]): PortraitChapter {
  const words = blocks.reduce((n, b) => n + wordCount(b.text ?? "") + (b.items ?? []).reduce((k, i) => k + wordCount(i), 0), 0);
  void c;
  return { id, number, kicker, title, glyph, color, blurb, blocks, words };
}

function buildAccuracy(c: Ctx): PortraitAccuracy {
  const r = c.m.reliability;
  const lines: string[] = [];
  const unavailable: string[] = [];
  lines.push(`Positions were calculated with ${r.ephemerisName}${r.ephemerisVerified ? "" : ". It has not been independently verified against a production ephemeris, so treat degrees as approximate — signs and aspects are reliable to well within the orbs used here"}.`);
  if (c.isDemo) lines.push("This is a demonstration chart for a sample person, not a real individual’s birth data.");
  if (!r.timeKnown) {
    lines.push("Birth time unknown: the chart is drawn for a placeholder of 12:00 noon in the birthplace’s local time.");
    unavailable.push("Rising sign (Ascendant)", "House placements", "Chart ruler", "Exact Moon degree and aspects to the Moon");
    if (r.uncertainBodies.length) unavailable.push(`Confirmed sign for ${r.uncertainBodies.map((i) => c.m.placements[i].name).join(", ")} (it changed sign during the birth day)`);
  } else {
    lines.push(`Houses use the ${r.houseSystem === "placidus" ? "Placidus" : "equal-house"} system.`);
  }
  if (r.houseNote) lines.push(r.houseNote);
  r.timeNotes.forEach((n) => lines.push(n));
  lines.push("Everything beyond the calculations — every sentence of interpretation — is traditional symbolic language offered for reflection, not scientific measurement or prediction.");
  return { demoChart: c.isDemo, timeKnown: r.timeKnown, ephemerisName: r.ephemerisName, ephemerisVerified: r.ephemerisVerified, houseSystem: r.houseSystem, lines, unavailable };
}

export interface PortraitOptions { isDemo?: boolean }

export function buildCosmicPortrait(chart: ChartData, opts: PortraitOptions = {}): CosmicPortrait {
  bid = 0;
  const c = new Ctx(chart, !!opts.isDemo);
  const chapters: PortraitChapter[] = [];
  const add = (n: number, f: () => PortraitChapter) => { c.chapter = n; chapters.push(f()); };
  add(0, () => chOpening(c));
  add(1, () => chSun(c));
  add(2, () => chRising(c));
  add(3, () => chMoon(c));
  add(4, () => chBigThree(c));
  add(5, () => chPersonal(c, "mercury", 5));
  add(6, () => chPersonal(c, "venus", 6));
  add(7, () => chPersonal(c, "mars", 7));
  add(8, () => chJupSat(c));
  add(9, () => chOuter(c));
  add(10, () => chPatterns(c));
  add(11, () => chGrowth(c));
  add(12, () => chLife(c));
  const words = chapters.reduce((n, ch) => n + ch.words, 0);
  const fingerprint = hash(`${chart.utcMs}|${chart.latitude.toFixed(3)}|${chart.longitude.toFixed(3)}|${chart.timeKnown}|${chart.name}`);
  return {
    title: "Your Cosmic Portrait", subtitle: "A deeper understanding of the sky at your birth.",
    name: chart.name, fingerprint, chapters, whys: c.whys, words, minutes: Math.max(1, Math.round(words / 210)),
    accuracy: buildAccuracy(c), engine: { id: ENGINE_ID, version: ENGINE_VERSION }, themes: c.themes,
  };
}

/** Optional: let an external narrator rewrite chapters from the same facts. Never required. */
export async function enhancePortrait(portrait: CosmicPortrait, provider: NarrativeProvider): Promise<CosmicPortrait> {
  const facts = Object.values(portrait.whys);
  const chapters: PortraitChapter[] = [];
  for (const ch of portrait.chapters) {
    try { chapters.push((await provider.enhanceChapter(ch, { facts, portrait })) ?? ch); } catch { chapters.push(ch); }
  }
  return { ...portrait, chapters, words: chapters.reduce((n, ch) => n + ch.words, 0) };
}
