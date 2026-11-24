import * as Astro from "astronomy-engine";
import { CITIES, type City } from "./cities";

export type { City };
export { CITIES };

/* ============================== constants ============================== */

export type AspectType = "conj" | "opp" | "square" | "trine" | "sextile" | "quincunx";

export interface SignInfo {
  name: string;
  glyph: string;
  element: "Fire" | "Earth" | "Air" | "Water";
  ruler: string;
}

export const SIGNS: SignInfo[] = [
  { name: "Aries", glyph: "♈", element: "Fire", ruler: "Mars" },
  { name: "Taurus", glyph: "♉", element: "Earth", ruler: "Venus" },
  { name: "Gemini", glyph: "♊", element: "Air", ruler: "Mercury" },
  { name: "Cancer", glyph: "♋", element: "Water", ruler: "Moon" },
  { name: "Leo", glyph: "♌", element: "Fire", ruler: "Sun" },
  { name: "Virgo", glyph: "♍", element: "Earth", ruler: "Mercury" },
  { name: "Libra", glyph: "♎", element: "Air", ruler: "Venus" },
  { name: "Scorpio", glyph: "♏", element: "Water", ruler: "Pluto" },
  { name: "Sagittarius", glyph: "♐", element: "Fire", ruler: "Jupiter" },
  { name: "Capricorn", glyph: "♑", element: "Earth", ruler: "Saturn" },
  { name: "Aquarius", glyph: "♒", element: "Air", ruler: "Uranus" },
  { name: "Pisces", glyph: "♓", element: "Water", ruler: "Neptune" },
];

export interface PlanetMeta {
  id: string;
  name: string;
  glyph: string;
  color: string;
  blurb: string;
  size: number; // relative 3d size
}

export const PLANETS: PlanetMeta[] = [
  { id: "sun", name: "Sun", glyph: "☉", color: "#ffc46f", size: 0.2, blurb: "Your core identity — the flame the rest of your chart orbits, and what it costs the world to let it dim." },
  { id: "moon", name: "Moon", glyph: "☽", color: "#dde5f0", size: 0.17, blurb: "Your inner weather — how you receive, soothe, and build shelter inside yourself." },
  { id: "mercury", name: "Mercury", glyph: "☿", color: "#cbb287", size: 0.13, blurb: "The shape of your thinking — how ideas are born, spoken, traded, and remembered." },
  { id: "venus", name: "Venus", glyph: "♀", color: "#f2a3b5", size: 0.15, blurb: "Where the heart leans — your values, pleasures, and private art of being loved." },
  { id: "mars", name: "Mars", glyph: "♂", color: "#ff7a5c", size: 0.14, blurb: "The engine of will — where you charge in, and what you refuse to let go of." },
  { id: "jupiter", name: "Jupiter", glyph: "♃", color: "#f0b45e", size: 0.18, blurb: "Your compass of expansion — the beliefs that carry you farther than the map allows." },
  { id: "saturn", name: "Saturn", glyph: "♄", color: "#d9c08a", size: 0.17, blurb: "The architect of limits — what must be built slowly, endured, and mastered." },
  { id: "uranus", name: "Uranus", glyph: "♅", color: "#8fd8d4", size: 0.13, blurb: "The spark of liberation — where you break the pattern you were handed." },
  { id: "neptune", name: "Neptune", glyph: "♆", color: "#82a8ff", size: 0.14, blurb: "The dissolving line between self and dream — where you see too much, or not at all." },
  { id: "pluto", name: "Pluto", glyph: "♇", color: "#a9b08a", size: 0.12, blurb: "The buried pressure — what transforms, utterly, when it is finally released." },
];

export interface AspectDef {
  type: AspectType;
  name: string;
  angle: number;
  orb: number;
  color: string;
  meaning: string;
}

export const ASPECTS: AspectDef[] = [
  { type: "conj", name: "Conjunction", angle: 0, orb: 8, color: "#f2d9a2", meaning: "merged forces" },
  { type: "opp", name: "Opposition", angle: 180, orb: 8, color: "#e9cf9f", meaning: "polarity to bridge" },
  { type: "square", name: "Square", angle: 90, orb: 7, color: "#ff8a70", meaning: "creative tension" },
  { type: "trine", name: "Trine", angle: 120, orb: 7, color: "#5fd3b7", meaning: "gifted flow" },
  { type: "sextile", name: "Sextile", angle: 60, orb: 5, color: "#7fd0e8", meaning: "open door" },
  { type: "quincunx", name: "Quincunx", angle: 150, orb: 4, color: "#b79ad1", meaning: "awkward adjustment" },
];

export const ASPECT_MAP: Record<AspectType, AspectDef> = Object.fromEntries(
  ASPECTS.map((a) => [a.type, a])
) as Record<AspectType, AspectDef>;

export const HOUSE_NAMES = [
  "Identity", "Substance", "Exchange", "Roots", "Radiance", "Craft",
  "Union", "Transmutation", "Horizon", "Apex", "Kindred", "Sanctum",
];

/* Legacy 30-city list superseded by the searchable gazetteer in ./cities.ts */
/* (legacy 30-city list removed — gazetteer lives in ./cities.ts) */


/* ============================== helpers ============================== */

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;
export const norm360 = (d: number) => ((d % 360) + 360) % 360;

function obliquity(date: Date): number {
  const t = (date.getTime() / 86400000 - 10957.5) / 36525;
  return 23.43929111 - t * 0.0130041678 - t * t * 0.000000292879 + t * t * t * 0.000000108867;
}

/** Convert a wall-clock time in a timezone to UTC ms. Handles DST via Intl (two-pass). */
export function wallToUtc(
  y: number, mo: number, d: number, hh: number, mi: number,
  tz?: string, offsetHrs?: number
): number {
  const naive = Date.UTC(y, mo - 1, d, hh, mi);
  if (tz) {
    let utc = naive;
    for (let i = 0; i < 2; i++) {
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", hour12: false,
      }).formatToParts(new Date(utc));
      const g = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
      const zonedAsUtc = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour") % 24, g("minute"));
      utc -= zonedAsUtc - naive; // converge on the instant whose zoned wall time equals the input
    }
    return utc;
  }
  return naive - (offsetHrs ?? 0) * 3600000;
}

function lonOfRa(ra: number, eps: number): number {
  return norm360(Math.atan2(Math.sin(ra * D2R) / Math.cos(eps * D2R), Math.cos(ra * D2R)) * R2D);
}

/**
 * Ascendant from the sidereal time and latitude (standard spherical formula).
 * Defined at every latitude short of the poles themselves, so the angles stay
 * honest even where Placidus houses cannot be computed.
 */
function ascendantOf(ramc: number, phiDeg: number, eps: number): number {
  const r = ramc * D2R;
  const y = Math.cos(r);
  const x = -(Math.sin(r) * Math.cos(eps * D2R) + Math.tan(phiDeg * D2R) * Math.sin(eps * D2R));
  return norm360(Math.atan2(y, x) * R2D);
}

function declOfRa(ra: number, eps: number): number {
  const sr = Math.sin(ra * D2R);
  const cr = Math.cos(ra * D2R);
  const denom = Math.hypot(sr, cr * Math.cos(eps * D2R));
  return Math.asin(Math.max(-1, Math.min(1, (sr * Math.sin(eps * D2R)) / denom))) * R2D;
}

function ascensionalDiff(ra: number, phiDeg: number, eps: number): number {
  const d = declOfRa(ra, eps);
  const x = Math.tan(phiDeg * D2R) * Math.tan(d * D2R);
  return Math.asin(Math.max(-1, Math.min(1, x))) * R2D;
}

/**
 * Placidus intermediate cusp RA via the classic iterative semi-arc scheme
 * (mirrors Swiss Ephemeris `swe_houses` "P"):
 *   RA11 = ARMC + DSA·k      RA12 = ARMC + DSA·2k   (diurnal,  k = 1/3)
 *   RA2  = ARMC + 180 − NSA·2k   RA3 = ARMC + 180 − NSA·k  (nocturnal)
 * DSA = 90 + AD, NSA = 90 − AD, AD = asin(tan φ · tan δ(RA)).
 */
function placidusRa(armc: number, phiDeg: number, eps: number, k: number, nocturnal: boolean): number {
  let ra = armc + (nocturnal ? 180 - 60 * k : 30 * k);
  for (let i = 0; i < 60; i++) {
    const ad = ascensionalDiff(ra, phiDeg, eps);
    const next = nocturnal ? armc + 180 - (90 - ad) * k : armc + (90 + ad) * k;
    const d = Math.abs(norm360(next + 180 - ra) - 180);
    ra = next;
    if (d < 1e-7) break;
  }
  return ra;
}

/**
 * Degrees and minutes inside a sign. Minutes are TRUNCATED (the astrological
 * convention), never rounded up, so 29°59.7′ can never print as an impossible
 * 30°00′. Always returns 0–29° and 0–59′.
 */
export function degMinOf(lon: number): { sign: number; deg: number; min: number } {
  const l = norm360(lon);
  const sign = Math.min(11, Math.floor(l / 30));
  const totalMin = Math.min(1799, Math.max(0, Math.floor((l - sign * 30) * 60 + 1e-7)));
  return { sign, deg: Math.floor(totalMin / 60), min: totalMin % 60 };
}

export function fmtDegMin(lon: number): string {
  const { deg, min } = degMinOf(lon);
  return `${deg}°${String(min).padStart(2, "0")}′`;
}

/* ============================== chart data ============================== */

export interface PlanetView {
  index: number;
  id: string;
  name: string;
  glyph: string;
  color: string;
  blurb: string;
  size: number;
  lon: number;
  sign: number;
  signDeg: number;
  degText: string;
  retro: boolean;
  house: number;
  /** birth time unknown AND the body crosses a sign boundary within the uncertain day */
  signUncertain: boolean;
  /** the other sign the body occupied during the uncertain day, if any */
  altSign: number | null;
  aspects: { otherIndex: number; type: AspectType; orb: number }[];
}

export interface AspectLine {
  a: number;
  b: number;
  type: AspectType;
  orb: number;
}

export interface ChartData {
  name: string;
  dateLabel: string;
  timeLabel: string;
  placeLabel: string;
  timeKnown: boolean;
  utcMs: number;
  planets: PlanetView[];
  ascLon: number;
  mcLon: number;
  /** cusp longitudes in house-number order (index 0 = cusp of house 1) */
  cusps: number[];
  /** cusp longitudes ordered by sky position (RA increasing); index i opens house skyOrder[i]+1 */
  cuspSky: number[];
  aspects: AspectLine[];
  /** which house system actually produced the cusps */
  houseSystem: "placidus" | "equal";
  /** why a fallback was used (high latitude etc.), if it was */
  houseNote?: string;
  /** DST / timezone observations made while converting local time to UTC */
  timeNotes: string[];
  latitude: number;
  longitude: number;
  /** which calculation layer produced the numbers (replaceable) */
  ephemeris: { name: string; verified: boolean };
}

export interface ChartInput {
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  timeKnown: boolean;
  placeId: string; // city id or "custom"
  lat: number;
  lon: number;
  tz: string | null;
  tzOffset: number;
}

const BODY_OF: Record<string, Astro.Body> = {
  sun: Astro.Body.Sun,
  moon: Astro.Body.Moon,
  mercury: Astro.Body.Mercury,
  venus: Astro.Body.Venus,
  mars: Astro.Body.Mars,
  jupiter: Astro.Body.Jupiter,
  saturn: Astro.Body.Saturn,
  uranus: Astro.Body.Uranus,
  neptune: Astro.Body.Neptune,
  pluto: Astro.Body.Pluto,
};

const geoEcliptic = (id: string, date: Date) =>
  Astro.Ecliptic(Astro.GeoVector(BODY_OF[id], date, false));

/** Wall-clock parts of a UTC instant in an IANA zone (used to sanity-check DST conversions). */
function wallParts(utc: number, tz: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date(utc));
  const g = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return Date.UTC(g("year"), g("month") - 1, g("day"), g("hour") % 24, g("minute"));
}

/** Returns a human-readable problem with the birth data, or null if it is usable. */
export function validateChartInput(input: ChartInput): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.date);
  if (!m) return "Enter a complete date of birth.";
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const probe = new Date(Date.UTC(y, mo - 1, d));
  if (probe.getUTCFullYear() !== y || probe.getUTCMonth() !== mo - 1 || probe.getUTCDate() !== d) return "That date does not exist.";
  if (y < 1800 || y > 2050) return "The demonstration ephemeris covers 1800–2050.";
  if (input.timeKnown && !/^\d{2}:\d{2}$/.test(input.time)) return "Enter a time of birth, or mark it as unknown.";
  if (!Number.isFinite(input.lat) || Math.abs(input.lat) > 89.9) return "Latitude must be between −89.9° and 89.9°.";
  if (!Number.isFinite(input.lon) || Math.abs(input.lon) > 180) return "Longitude must be between −180° and 180°.";
  if (!Number.isFinite(input.tzOffset) || Math.abs(input.tzOffset) > 14) return "UTC offset must be between −14 and +14 hours.";
  return null;
}

/**
 * Resolve a civil clock time in an IANA zone to UTC, reporting daylight-saving
 * edge cases honestly: a skipped time ("gap") or a repeated one ("overlap",
 * where the earlier occurrence is used).
 */
function resolveLocal(y: number, mo: number, d: number, hh: number, mi: number, tz: string): { utc: number; status: "ok" | "gap" | "overlap" } {
  const intended = Date.UTC(y, mo - 1, d, hh, mi);
  const guess = wallToUtc(y, mo, d, hh, mi, tz);
  if (wallParts(guess, tz) === intended && wallParts(guess - 3600000, tz) !== intended && wallParts(guess + 3600000, tz) !== intended) return { utc: guess, status: "ok" };
  const hits: number[] = [];
  for (let off = -16 * 4; off <= 16 * 4; off++) {
    const u = intended - off * 900000;
    if (wallParts(u, tz) === intended) hits.push(u);
  }
  if (hits.length === 0) return { utc: guess, status: "gap" };
  hits.sort((a, b) => a - b);
  return { utc: hits[0], status: hits.length > 1 ? "overlap" : "ok" };
}

export const DEMO_EPHEMERIS = { name: "Bundled demonstration ephemeris (astronomy-engine)", verified: false } as const;

export function computeChart(input: ChartInput): ChartData {
  const problem = validateChartInput(input);
  if (problem) throw new Error(problem);
  const [y, mo, d] = input.date.split("-").map(Number);
  let [hh, mi] = input.time.split(":").map(Number);
  if (!input.timeKnown || Number.isNaN(hh) || Number.isNaN(mi)) { hh = 12; mi = 0; }
  const local = input.tz && input.timeKnown ? resolveLocal(y, mo, d, hh, mi, input.tz) : null;
  const utcMs = local ? local.utc : wallToUtc(y, mo, d, hh, mi, input.tz ?? undefined, input.tzOffset);
  const now = new Date(utcMs);
  const later = new Date(utcMs + 86400000);
  const eps = obliquity(now);
  // Greenwich apparent sidereal time (hours) → local RAMC using east-positive longitude
  const ramc = norm360(Astro.SiderealTime(now) * 15 + input.lon);

  /* ---- timezone / DST observations ---- */
  const timeNotes: string[] = [];
  if (input.tz) {
    if (local?.status === "gap") timeNotes.push("That local clock time did not exist on that date (a daylight-saving clock change skipped it). The nearest valid instant was used.");
    else if (local?.status === "overlap") timeNotes.push("That local clock time occurred twice on that date (a daylight-saving clock change repeated it). The first occurrence was used — if you were born in the repeated hour, the Rising sign could differ.");
  } else {
    timeNotes.push("A manual UTC offset was used, so daylight-saving time was not applied automatically.");
  }

  const mcLon = lonOfRa(ramc, eps);
  const icLon = lonOfRa(ramc + 180, eps);
  const polar = Math.abs(input.lat) > 66.5;

  const ascLon = ascendantOf(ramc, input.lat, eps);
  const dscLon = norm360(ascLon + 180);
  let houseNote: string | undefined;
  if (polar) houseNote = `At ${Math.abs(input.lat).toFixed(1)}° latitude Placidus houses cannot be calculated, so equal houses measured from the Ascendant were used instead. Planet signs are unaffected, but house placements are a simplified approximation.`;

  /* cusp longitudes in house-number order; Placidus (equal-houses fallback at the poles) */
  const cusps: number[] = polar
    ? Array.from({ length: 12 }, (_, i) => norm360(ascLon + i * 30))
    : (() => {
        const l11 = lonOfRa(placidusRa(ramc, input.lat, eps, 1 / 3, false), eps);
        const l12 = lonOfRa(placidusRa(ramc, input.lat, eps, 2 / 3, false), eps);
        const l2 = lonOfRa(placidusRa(ramc, input.lat, eps, 2 / 3, true), eps);
        const l3 = lonOfRa(placidusRa(ramc, input.lat, eps, 1 / 3, true), eps);
        const list: number[] = [];
        list[0] = ascLon; list[1] = l2; list[2] = l3; list[3] = icLon;
        list[4] = norm360(l11 + 180); list[5] = norm360(l12 + 180);
        list[6] = dscLon; list[7] = norm360(l2 + 180); list[8] = norm360(l3 + 180);
        list[9] = mcLon; list[10] = l11; list[11] = l12;
        return list;
      })();

  /*
   * Houses are numbered in the order their cusps rise over the eastern horizon,
   * which is the direction of increasing RA — so cusps in house order 1..12 are
   * already in sky order. Cusp k → cusp k+1 spans house k.
   */
  const cuspSky = cusps;

  const houseOf = (lon: number): number => {
    for (let j = 0; j < 12; j++) {
      const start = cuspSky[j];
      const end = cuspSky[(j + 1) % 12];
      const span = norm360(end - start);
      if (span === 0) continue;
      if (norm360(lon - start) < span) return j + 1;
    }
    return 1;
  };

  /* planets */
  const before = new Date(utcMs - 43200000);
  const after = new Date(utcMs + 43200000);
  const planets: PlanetView[] = PLANETS.map((meta, i) => {
    const pos = geoEcliptic(meta.id, now);
    const posNext = geoEcliptic(meta.id, later);
    let dLon = posNext.elon - pos.elon;
    if (dLon > 180) dLon -= 360;
    if (dLon < -180) dLon += 360;
    const lon = norm360(pos.elon);
    const sign = Math.floor(lon / 30);
    let signUncertain = false;
    let altSign: number | null = null;
    if (!input.timeKnown) {
      const a = Math.floor(norm360(geoEcliptic(meta.id, before).elon) / 30);
      const b = Math.floor(norm360(geoEcliptic(meta.id, after).elon) / 30);
      signUncertain = a !== sign || b !== sign;
      if (signUncertain) altSign = a !== sign ? a : b;
    }
    return {
      index: i,
      ...meta,
      lon,
      sign,
      signDeg: Math.min(29.9999, lon - sign * 30),
      degText: fmtDegMin(lon),
      retro: dLon < -0.005,
      house: houseOf(lon),
      signUncertain,
      altSign,
      aspects: [],
    };
  });

  /* aspects */
  const aspects: AspectLine[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      let d = Math.abs(planets[i].lon - planets[j].lon);
      if (d > 180) d = 360 - d;
      let best: AspectDef | null = null;
      let bestOrb = Infinity;
      for (const def of ASPECTS) {
        const orb = Math.abs(d - def.angle);
        if (orb <= def.orb && orb < bestOrb) { best = def; bestOrb = orb; }
      }
      if (best) {
        aspects.push({ a: i, b: j, type: best.type, orb: bestOrb });
        planets[i].aspects.push({ otherIndex: j, type: best.type, orb: bestOrb });
        planets[j].aspects.push({ otherIndex: i, type: best.type, orb: bestOrb });
      }
    }
  }

  /* the label shows the birth date as entered (not the UTC date, which can differ) */
  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "long", year: "numeric", timeZone: "UTC",
  }).format(new Date(Date.UTC(y, mo - 1, d))).toUpperCase();

  return {
    name: input.name.trim() || "You",
    dateLabel,
    timeLabel: input.timeKnown ? input.time : "12:00 (assumed)",
    placeLabel: input.placeId === "custom"
      ? `${input.lat.toFixed(2)}°, ${input.lon.toFixed(2)}°`
      : (() => {
          const c = CITIES.find((c) => c.id === input.placeId);
          return c ? `${c.name}, ${c.country}` : "";
        })(),
    timeKnown: input.timeKnown,
    utcMs,
    planets,
    ascLon,
    mcLon,
    cusps,
    cuspSky,
    aspects,
    houseSystem: polar ? "equal" : "placidus",
    houseNote,
    timeNotes,
    latitude: input.lat,
    longitude: input.lon,
    ephemeris: { ...DEMO_EPHEMERIS },
  };
}
