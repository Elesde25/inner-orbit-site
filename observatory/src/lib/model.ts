import type { AspectLine, ChartData, PlanetView } from "./astro";
import { ASPECT_MAP, SIGNS, degMinOf, fmtDegMin } from "./astro";

export type Element = "Fire" | "Earth" | "Air" | "Water";
export type Modality = "Cardinal" | "Fixed" | "Mutable";

/** modality per sign index 0=Aries..11=Pisces */
export const MODALITY_OF_SIGN: Modality[] = [
  "Cardinal", "Fixed", "Mutable",
  "Cardinal", "Fixed", "Mutable",
  "Cardinal", "Fixed", "Mutable",
  "Cardinal", "Fixed", "Mutable",
];

export const ELEMENT_BLURB: Record<Element, string> = {
  Fire: "In tradition, fire speaks to spark and momentum — acting, inspiring, beginning.",
  Earth: "In tradition, earth speaks to form and follow-through — building, tending, grounding.",
  Air: "In tradition, air speaks to exchange — ideas, language, connection, perspective.",
  Water: "In tradition, water speaks to feeling and memory — bonding, sensing, holding.",
};

export const MODALITY_BLURB: Record<Modality, string> = {
  Cardinal: "In tradition, cardinal signs begin — they initiate seasons and start things.",
  Fixed: "In tradition, fixed signs sustain — they stabilize seasons and carry things through.",
  Mutable: "In tradition, mutable signs adapt — they end seasons and translate between them.",
};

/** major five used for explorer filters + guide */
export const MAJOR_FIVE = ["conj", "sextile", "square", "trine", "opp"] as const;
export type MajorFive = (typeof MAJOR_FIVE)[number];

/** minimal angular separation 0..180 */
export function separation(aLon: number, bLon: number): number {
  let d = Math.abs(aLon - bLon) % 360;
  if (d > 180) d = 360 - d;
  return d;
}

export function aspectSeparation(chart: ChartData, aspectIdx: number): number {
  const a = chart.aspects[aspectIdx];
  return separation(chart.planets[a.a].lon, chart.planets[a.b].lon);
}

export interface BigThree {
  sunIdx: number; moonIdx: number;
  sunSign: number; moonSign: number; ascSign: number;
}

export function getBigThree(chart: ChartData): BigThree {
  return {
    sunIdx: 0, moonIdx: 1,
    sunSign: chart.planets[0].sign,
    moonSign: chart.planets[1].sign,
    ascSign: degMinOf(chart.ascLon).sign,
  };
}

export interface Bucket { count: number; members: string[] }

export function elementCounts(chart: ChartData): Record<Element, Bucket> {
  const out: Record<Element, Bucket> = {
    Fire: { count: 0, members: [] }, Earth: { count: 0, members: [] },
    Air: { count: 0, members: [] }, Water: { count: 0, members: [] },
  };
  for (const p of chart.planets) {
    const el = SIGNS[p.sign].element as Element;
    out[el].count += 1;
    out[el].members.push(p.name);
  }
  return out;
}

export function modalityCounts(chart: ChartData): Record<Modality, Bucket> {
  const out: Record<Modality, Bucket> = {
    Cardinal: { count: 0, members: [] }, Fixed: { count: 0, members: [] }, Mutable: { count: 0, members: [] },
  };
  for (const p of chart.planets) {
    const m = MODALITY_OF_SIGN[p.sign];
    out[m].count += 1;
    out[m].members.push(p.name);
  }
  return out;
}

export function houseCounts(chart: ChartData): Record<number, string[]> {
  const out: Record<number, string[]> = {};
  for (let h = 1; h <= 12; h++) out[h] = [];
  for (const p of chart.planets) out[p.house].push(p.name);
  return out;
}

export interface Concentration { kind: "sign" | "house"; label: string; members: string[] }

/** Rule: 3+ of the 10 bodies share one sign or one house. Transparent, no invented stellia. */
export function concentrations(chart: ChartData): Concentration[] {
  const out: Concentration[] = [];
  const bySign: Record<string, string[]> = {};
  for (const p of chart.planets) {
    const k = SIGNS[p.sign].name;
    (bySign[k] ??= []).push(p.name);
  }
  for (const [k, v] of Object.entries(bySign)) {
    if (v.length >= 3) out.push({ kind: "sign", label: k, members: v });
  }
  const byHouse = houseCounts(chart);
  for (let h = 1; h <= 12; h++) {
    if (byHouse[h].length >= 3) out.push({ kind: "house", label: `House ${h}`, members: byHouse[h] });
  }
  return out;
}

/** tightest aspects among the major five — "noteworthy" = smallest orbs, never invented */
export function noteworthyAspects(chart: ChartData, n = 4): { idx: number; asp: AspectLine }[] {
  return chart.aspects
    .map((asp, idx) => ({ idx, asp }))
    .filter((x) => (MAJOR_FIVE as readonly string[]).includes(x.asp.type))
    .sort((a, b) => a.asp.orb - b.asp.orb)
    .slice(0, n);
}

/* ---------------- selection + history ---------------- */

export type Selection =
  | { kind: "none" }
  | { kind: "planet"; index: number }
  | { kind: "aspect"; index: number }
  | { kind: "house"; house: number }
  | { kind: "sign"; sign: number }
  | { kind: "blueprint" };

export const selKey = (s: Selection): string =>
  s.kind === "planet" ? `p${s.index}` : s.kind === "aspect" ? `a${s.index}` :
  s.kind === "house" ? `h${s.house}` : s.kind === "sign" ? `s${s.sign}` :
  s.kind === "blueprint" ? "blue" : "none";

export function pushHistory(hist: Selection[], s: Selection, max = 8): Selection[] {
  if (s.kind === "none") return hist;
  const k = selKey(s);
  const next = hist.filter((h) => selKey(h) !== k);
  next.push(s);
  return next.slice(-max);
}

/* ---------------- patterns (all derived, all transparent) ---------------- */

export interface Pattern {
  id: string;
  title: string;
  rule: string;
  body: string;
  tone: "balance" | "focus" | "bond";
}

const EL_EMPHASIS: Record<Element, string> = {
  Fire: "Four or more of the ten bodies in fire signs — a visible emphasis on initiation and momentum in this symbolic framework.",
  Earth: "Four or more of the ten bodies in earth signs — a visible emphasis on form, craft, and follow-through in this symbolic framework.",
  Air: "Four or more of the ten bodies in air signs — a visible emphasis on exchange of ideas and perspective in this symbolic framework.",
  Water: "Four or more of the ten bodies in water signs — a visible emphasis on feeling, memory, and bonding in this symbolic framework.",
};

export function buildPatterns(chart: ChartData): Pattern[] {
  const out: Pattern[] = [];
  const els = elementCounts(chart);
  const mods = modalityCounts(chart);

  for (const el of ["Fire", "Earth", "Air", "Water"] as Element[]) {
    if (els[el].count >= 4) {
      out.push({
        id: `el-${el}`, title: `${el} emphasis`,
        rule: `Counted ${els[el].count} of 10 bodies in ${el} signs (${els[el].members.join(", ")}). Shown only when 4+ share an element.`,
        body: EL_EMPHASIS[el],
        tone: "balance",
      });
    }
    if (els[el].count === 0) {
      out.push({
        id: `el-no-${el}`, title: `No ${el.toLowerCase()} placements`,
        rule: `Counted 0 of 10 bodies in ${el} signs. Shown only on a true zero.`,
        body: `Tradition sometimes reads an empty element as a quieter register rather than a missing piece — ${el.toLowerCase()} themes (${el === "Fire" ? "spark" : el === "Earth" ? "grounding" : el === "Air" ? "exchange" : "feeling"}) may simply ask for more conscious invitation.`,
        tone: "balance",
      });
    }
  }
  for (const m of ["Cardinal", "Fixed", "Mutable"] as Modality[]) {
    if (mods[m].count >= 5) {
      out.push({
        id: `mo-${m}`, title: `${m} emphasis`,
        rule: `Counted ${mods[m].count} of 10 bodies in ${m} signs. Shown only when 5+ share a modality.`,
        body: m === "Cardinal"
          ? "A visible tilt toward beginning — in this framework, starting things may come more naturally than finishing them."
          : m === "Fixed"
            ? "A visible tilt toward sustaining — in this framework, commitment and follow-through may come more naturally than pivoting."
            : "A visible tilt toward adapting — in this framework, translating and adjusting may come more naturally than settling.",
        tone: "balance",
      });
    }
  }
  for (const c of concentrations(chart)) {
    out.push({
      id: `conc-${c.kind}-${c.label}`, title: `Concentration in ${c.label}`,
      rule: `Rule: 3+ of 10 bodies share one ${c.kind} (${c.members.join(", ")}). No stellium or pattern name is claimed.`,
      body: c.kind === "sign"
        ? `Three or more bodies speak in the same sign-language — ${c.label} coloring shows up repeatedly. Tradition treats repetition as emphasis worth noticing, not a verdict.`
        : `Three or more bodies gather in the same life-area — ${c.label} themes recur across different drives. Tradition treats a crowded house as a busy room, not a destiny.`,
      tone: "focus",
    });
  }
  /* big-three relationship — only from an actual computed aspect or shared element */
  const bt = getBigThree(chart);
  const sunMoon = chart.aspects.find(
    (a) => (a.a === 0 && a.b === 1) || (a.a === 1 && a.b === 0)
  );
  if (sunMoon) {
    const def = ASPECT_MAP[sunMoon.type];
    out.push({
      id: "bigthree-aspect", title: `Sun ${def.name} Moon`,
      rule: `Measured separation ${separation(chart.planets[0].lon, chart.planets[1].lon).toFixed(1)}° vs nominal ${def.angle}° (orb ${sunMoon.orb.toFixed(1)}°). Computed, not assumed.`,
      body: `Identity (Sun) and inner need (Moon) stand in a ${def.name.toLowerCase()} relationship — traditionally read as ${def.meaning}. Two core needs in ongoing dialogue.`,
      tone: "bond",
    });
  } else if (SIGNS[bt.sunSign].element === SIGNS[bt.moonSign].element) {
    out.push({
      id: "bigthree-element", title: "Sun and Moon share an element",
      rule: `Both in ${SIGNS[bt.sunSign].element} signs — read directly from computed signs.`,
      body: `Core drive and inner weather speak the same elemental language (${SIGNS[bt.sunSign].element.toLowerCase()}) — tradition often reads this as an easier inner alliance, though the houses may still ask different things.`,
      tone: "bond",
    });
  }
  const tight = noteworthyAspects(chart, 1)[0];
  if (tight) {
    const def = ASPECT_MAP[tight.asp.type];
    const A = chart.planets[tight.asp.a].name, B = chart.planets[tight.asp.b].name;
    out.push({
      id: "tightest", title: `Tightest bond: ${A}–${B}`,
      rule: `Smallest orb among major aspects: ${tight.asp.orb.toFixed(1)}°.`,
      body: `The ${def.name.toLowerCase()} between ${A} and ${B} is the chart's closest major conversation — traditionally the relationship that colors daily life most audibly. Open it in the Aspect Explorer to trace the geometry.`,
      tone: "bond",
    });
  }
  return out;
}

/* ---------------- validation (same data, same rules) ---------------- */

export function validateChart(chart: ChartData): string[] {
  const issues: string[] = [];
  chart.planets.forEach((p) => {
    const sign = Math.floor((((p.lon % 360) + 360) % 360) / 30);
    if (sign !== p.sign) issues.push(`${p.name}: sign mismatch`);
    p.aspects.forEach((a) => {
      const other = chart.planets[a.otherIndex];
      const sep = separation(p.lon, other.lon);
      const def = ASPECT_MAP[a.type];
      if (Math.abs(sep - def.angle) > def.orb + 0.05) issues.push(`${p.name}–${other.name}: orb mismatch`);
    });
  });
  return issues;
}

export const HOUSE_SYSTEM_NOTE =
  "Houses use the Placidus system: cusps are derived from the division of diurnal and nocturnal arcs, so house sizes vary with latitude. Near the poles an equal-house fallback keeps the wheel readable.";

export const EPHEMERIS_NOTE =
  "Demonstration ephemeris: longitudes, separations, and derived geometry come from the bundled calculator and the birth data supplied. Interpretations are traditional symbolic language for reflection — not scientific measurement or prediction.";

/* =====================================================================
   NORMALIZED CHART MODEL
   One read-only view of the calculated chart for the interpretation layer.
   Nothing here calculates astronomy — it only reorganizes ChartData and
   derives rule-based facts (dignity, rulership, patterns). The renderer and
   the reading engine both consume it; neither writes back.
   ===================================================================== */


export type Dignity = "domicile" | "exaltation" | "detriment" | "fall";

/** classical essential dignities for the seven visible bodies (sign indexes 0=Aries) */
const DOMICILE: Record<string, number[]> = {
  sun: [4], moon: [3], mercury: [2, 5], venus: [1, 6], mars: [0, 7], jupiter: [8, 11], saturn: [9, 10],
};
const EXALT: Record<string, number> = { sun: 0, moon: 1, mercury: 5, venus: 11, mars: 9, jupiter: 3, saturn: 6 };

export function dignityOf(id: string, sign: number): Dignity | null {
  if (DOMICILE[id]?.includes(sign)) return "domicile";
  if (EXALT[id] === sign) return "exaltation";
  if (DOMICILE[id]?.some((s) => (s + 6) % 12 === sign)) return "detriment";
  if (EXALT[id] !== undefined && (EXALT[id] + 6) % 12 === sign) return "fall";
  return null;
}

export interface Placement {
  index: number; id: string; name: string; glyph: string; color: string;
  lon: number; sign: number; signName: string; element: Element; modality: Modality;
  deg: number; min: number; degText: string;
  house: number; retro: boolean; dignity: Dignity | null;
  /** sign could differ on the birth day because the time is unknown */
  signUncertain: boolean; altSign: number | null;
  /** house placement is trustworthy (time known, not a polar fallback) */
  houseFirm: boolean;
  /** orb-weighted count of aspects, for "most connected" */
  aspectCount: number;
}

export interface ModelAspect {
  idx: number; a: number; b: number; aId: string; bId: string;
  type: AspectLine["type"]; name: string; orb: number; separation: number; nominal: number;
  nature: "ease" | "tension" | "blend" | "adjust"; major: boolean;
  /** involves a body whose position is not firm (unknown time → Moon) */
  provisional: boolean;
}

export interface GeoPattern {
  id: string; kind: "grand-trine" | "t-square" | "grand-cross" | "yod";
  title: string; members: number[]; aspects: number[]; rule: string;
}

export interface ChartReliability {
  timeKnown: boolean;
  /** Rising sign + houses + chart ruler are confirmed only with a known birth time */
  angles: boolean;
  houses: boolean;
  houseSystem: "placidus" | "equal";
  houseNote?: string;
  timeNotes: string[];
  uncertainBodies: number[];
  ephemerisVerified: boolean;
  ephemerisName: string;
}

export interface ChartModel {
  chart: ChartData;
  placements: Placement[];
  byId: Record<string, Placement>;
  asc: { sign: number; lon: number; deg: number; min: number; text: string };
  mc: { sign: number; lon: number; text: string };
  /** chart ruler (modern ruler of the Ascendant sign) — null if the Ascendant is not firm */
  ruler: { id: string; placement: Placement; traditionalId?: string } | null;
  aspects: ModelAspect[];
  aspectsOf: (id: string) => ModelAspect[];
  aspectBetween: (aId: string, bId: string) => ModelAspect | null;
  elements: Record<Element, Bucket>;
  modalities: Record<Modality, Bucket>;
  houses: Record<number, string[]>;
  concentrations: Concentration[];
  geometry: GeoPattern[];
  /** bodies within 6° of the ASC or MC (only when the time is known) */
  angular: { id: string; angle: "ASC" | "MC"; orb: number }[];
  hemispheres: { above: number; below: number; east: number; west: number } | null;
  unaspected: string[];
  retrogrades: string[];
  /** lunation phase from Sun→Moon elongation (0–360) */
  elongation: number;
  reliability: ChartReliability;
  /** problems found while normalizing (missing / non-finite bodies) */
  issues: string[];
}

const TRADITIONAL_RULER: Record<number, string> = { 7: "mars", 10: "saturn", 11: "jupiter" };

const natureOf = (t: AspectLine["type"]): ModelAspect["nature"] =>
  t === "trine" || t === "sextile" ? "ease" : t === "square" || t === "opp" ? "tension" : t === "conj" ? "blend" : "adjust";

export function normalizeChart(chart: ChartData): ChartModel {
  const issues: string[] = [];
  const uncertainBodies: number[] = [];
  const houseFirm = chart.timeKnown && chart.houseSystem === "placidus";

  const placements: Placement[] = chart.planets.map((p: PlanetView) => {
    if (!Number.isFinite(p.lon)) issues.push(`${p.name}: position unavailable`);
    const dm = degMinOf(p.lon);
    if (p.signUncertain) uncertainBodies.push(p.index);
    return {
      index: p.index, id: p.id, name: p.name, glyph: p.glyph, color: p.color,
      lon: p.lon, sign: dm.sign, signName: SIGNS[dm.sign].name,
      element: SIGNS[dm.sign].element as Element, modality: MODALITY_OF_SIGN[dm.sign],
      deg: dm.deg, min: dm.min, degText: `${dm.deg}°${String(dm.min).padStart(2, "0")}′`,
      house: p.house, retro: p.retro, dignity: dignityOf(p.id, dm.sign),
      signUncertain: p.signUncertain, altSign: p.altSign, houseFirm,
      aspectCount: p.aspects.length,
    };
  });
  const byId = Object.fromEntries(placements.map((p) => [p.id, p])) as Record<string, Placement>;

  const timeKnown = chart.timeKnown;
  const moonIdx = 1;
  const aspects: ModelAspect[] = chart.aspects.map((a, idx) => {
    const def = ASPECT_MAP[a.type];
    const A = placements[a.a], B = placements[a.b];
    return {
      idx, a: a.a, b: a.b, aId: A.id, bId: B.id, type: a.type, name: def.name, orb: a.orb,
      separation: separation(chart.planets[a.a].lon, chart.planets[a.b].lon), nominal: def.angle,
      nature: natureOf(a.type), major: (MAJOR_FIVE as readonly string[]).includes(a.type),
      provisional: !timeKnown && (a.a === moonIdx || a.b === moonIdx),
    };
  });

  const ascDm = degMinOf(chart.ascLon);
  const ascSign = ascDm.sign;
  const rulerId = SIGNS[ascSign].ruler.toLowerCase();
  const ruler = timeKnown && byId[rulerId]
    ? { id: rulerId, placement: byId[rulerId], traditionalId: TRADITIONAL_RULER[ascSign] }
    : null;

  /* angular bodies: within 6° of the angles (conjunction by longitude) */
  const angular: ChartModel["angular"] = [];
  if (timeKnown) {
    for (const p of placements) {
      const da = separation(p.lon, chart.ascLon), dmc = separation(p.lon, chart.mcLon);
      if (da <= 6) angular.push({ id: p.id, angle: "ASC", orb: da });
      else if (dmc <= 6) angular.push({ id: p.id, angle: "MC", orb: dmc });
    }
  }

  const houses = houseCounts(chart);
  const hemispheres = timeKnown
    ? {
        above: [7, 8, 9, 10, 11, 12].reduce((n, h) => n + houses[h].length, 0),
        below: [1, 2, 3, 4, 5, 6].reduce((n, h) => n + houses[h].length, 0),
        east: [10, 11, 12, 1, 2, 3].reduce((n, h) => n + houses[h].length, 0),
        west: [4, 5, 6, 7, 8, 9].reduce((n, h) => n + houses[h].length, 0),
      }
    : null;

  const aspectsOf = (id: string) => aspects.filter((a) => a.aId === id || a.bId === id);
  const aspectBetween = (x: string, y: string) =>
    aspects.find((a) => (a.aId === x && a.bId === y) || (a.aId === y && a.bId === x)) ?? null;

  return {
    chart, placements, byId,
    asc: { sign: ascSign, lon: chart.ascLon, deg: ascDm.deg, min: ascDm.min, text: `${ascDm.deg}°${String(ascDm.min).padStart(2, "0")}′` },
    mc: { sign: degMinOf(chart.mcLon).sign, lon: chart.mcLon, text: fmtDegMin(chart.mcLon) },
    ruler, aspects, aspectsOf, aspectBetween,
    elements: elementCounts(chart), modalities: modalityCounts(chart), houses,
    concentrations: concentrations(chart),
    geometry: detectGeometry(chart, aspects),
    angular, hemispheres,
    unaspected: placements.filter((p) => p.aspectCount === 0).map((p) => p.id),
    retrogrades: placements.filter((p) => p.retro && p.id !== "sun" && p.id !== "moon").map((p) => p.id),
    elongation: ((chart.planets[1].lon - chart.planets[0].lon) % 360 + 360) % 360,
    reliability: {
      timeKnown, angles: timeKnown, houses: houseFirm,
      houseSystem: chart.houseSystem, houseNote: chart.houseNote, timeNotes: chart.timeNotes,
      uncertainBodies, ephemerisVerified: chart.ephemeris.verified, ephemerisName: chart.ephemeris.name,
    },
    issues,
  };
}

/** Grand trine / T-square / grand cross / yod — only from real aspects within tight orbs. */
function detectGeometry(chart: ChartData, aspects: ModelAspect[]): GeoPattern[] {
  const out: GeoPattern[] = [];
  const LIM: Record<string, number> = { trine: 6, opp: 6, square: 6, sextile: 4, quincunx: 3, conj: 0 };
  const tight = aspects.filter((a) => a.orb <= (LIM[a.type] ?? 0));
  const find = (x: number, y: number, t: string) =>
    tight.find((a) => a.type === t && ((a.a === x && a.b === y) || (a.a === y && a.b === x)));
  const n = chart.planets.length;
  const nm = (i: number) => chart.planets[i].name;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) {
    const t = [find(i, j, "trine"), find(j, k, "trine"), find(i, k, "trine")];
    if (t.every(Boolean)) {
      out.push({ id: `gt-${i}-${j}-${k}`, kind: "grand-trine", title: `Grand trine: ${nm(i)}, ${nm(j)}, ${nm(k)}`, members: [i, j, k], aspects: t.map((a) => a!.idx),
        rule: `Three bodies each in trine (≤6° orb) with the other two — ${SIGNS[chart.planets[i].sign].element} element.` });
    }
    /* T-square: one opposition, third body square to both ends */
    const tri: [number, number, number][] = [[i, j, k], [i, k, j], [j, k, i]];
    for (const [x, y, z] of tri) {
      const o = find(x, y, "opp"), s1 = find(x, z, "square"), s2 = find(y, z, "square");
      if (o && s1 && s2) {
        out.push({ id: `ts-${x}-${y}-${z}`, kind: "t-square", title: `T-square: ${nm(x)} opposite ${nm(y)}, both square ${nm(z)}`, members: [x, y, z], aspects: [o.idx, s1.idx, s2.idx],
          rule: `An opposition (≤6°) with a third body square (≤6°) to both ends; ${nm(z)} is the focal point.` });
      }
    }
    /* Yod: sextile base, apex quincunx to both */
    for (const [x, y, z] of tri) {
      const b = find(x, y, "sextile"), q1 = find(x, z, "quincunx"), q2 = find(y, z, "quincunx");
      if (b && q1 && q2) {
        out.push({ id: `yod-${x}-${y}-${z}`, kind: "yod", title: `Yod: ${nm(x)} sextile ${nm(y)}, both quincunx ${nm(z)}`, members: [x, y, z], aspects: [b.idx, q1.idx, q2.idx],
          rule: `A sextile (≤4°) whose two ends are each quincunx (≤3°) to ${nm(z)}, the apex.` });
      }
    }
  }
  /* grand cross: two oppositions at right angles joined by four squares */
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) for (let l = k + 1; l < n; l++) {
    const q = [i, j, k, l];
    const opps = [[i, j, k, l], [i, k, j, l], [i, l, j, k]];
    for (const [a, b, c, d] of opps) {
      const o1 = find(a, b, "opp"), o2 = find(c, d, "opp");
      const sq = [find(a, c, "square"), find(a, d, "square"), find(b, c, "square"), find(b, d, "square")];
      if (o1 && o2 && sq.every(Boolean)) {
        out.push({ id: `gc-${q.join("-")}`, kind: "grand-cross", title: `Grand cross: ${q.map(nm).join(", ")}`, members: q, aspects: [o1.idx, o2.idx, ...sq.map((s) => s!.idx)],
          rule: "Two oppositions at right angles to each other, joined by four squares (all ≤6°)." });
      }
    }
  }
  /* a grand cross contains T-squares; keep only the larger figure */
  const crosses = out.filter((p) => p.kind === "grand-cross");
  return out.filter((p) => p.kind !== "t-square" || !crosses.some((c) => p.members.every((m) => c.members.includes(m))));
}
