import { setJournalChartSource } from "./components/Journal";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Chart2D from "./components/Chart2D";
import CosmicBackdrop from "./components/CosmicBackdrop";
import {
  AspectExplorer, Blueprint, DataBadge, GuideFive, Patterns, TourPanel,
} from "./components/explore";
import {
  AspectReadingView, DepthToggle, G, HistoryBar, HouseReadingView, PlanetReadingView, SignReadingView,
} from "./components/reading";
import PortraitView, { type PortraitProgress } from "./components/portrait";
import { NatalScene, type AtmosphereMode, type ConnectionMode, type LabelDetail } from "./lib/scene";
import { buildCosmicPortrait } from "./lib/portrait/engine";
import type { WhyRef } from "./lib/portrait/types";
import {
  computeChart, validateChartInput, SIGNS, ASPECT_MAP, HOUSE_NAMES, fmtDegMin, degMinOf,
  type ChartData, type ChartInput, type City,
} from "./lib/astro";
import { searchCities, CITIES } from "./lib/cities";
import type { Depth } from "./lib/content";
import { TOUR_STEPS } from "./lib/content";
import {
  MAJOR_FIVE, pushHistory, type Selection,
} from "./lib/model";
import { loadSamples } from "./lib/samples";
import { cn } from "./utils/cn";

type Stage = "form" | "casting" | "chart";
type PanelTab = "blueprint" | "reading" | "aspects" | "patterns";

const CAST_STEPS = [
  "Aligning to the local meridian",
  "Computing planetary longitudes",
  "Casting the twelve houses · Placidus",
  "Drawing the aspects",
  "Illuminating the wheel",
];

const PREFS_KEY = "inner-orbit:prefs:v2";
const TOUR_KEY = "inner-orbit:tour:v2";

interface Prefs {
  depth: Depth; atmosphere: AtmosphereMode; connection: ConnectionMode;
  lowQ: boolean; motion: boolean; orbit: boolean;
  labelDetail: LabelDetail;
  /** index into READ_SIZES for the Cosmic Portrait text size (a UI preference only) */
  readSize: number;
}

function loadPrefs(): Prefs {
  const fallback: Prefs = { depth: "discover", atmosphere: "full", connection: "routed", lowQ: false, motion: true, orbit: true, labelDetail: "glyph", readSize: 2 };
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) {
      try {
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) fallback.motion = false;
      } catch { /* noop */ }
      return fallback;
    }
    return { ...fallback, ...(JSON.parse(raw) as Partial<Prefs>) };
  } catch { return fallback; }
}

/* --------------------------------- icons --------------------------------- */

const I = {
  orbit: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.9" />
      <ellipse cx="12" cy="12" rx="10" ry="4.6" stroke="currentColor" strokeWidth="1.2" transform="rotate(-24 12 12)" />
      <circle cx="20.6" cy="8.4" r="1.6" fill="currentColor" />
    </svg>
  ),
  lines: (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 20L20 4M4 4l16 16M4 12h16" opacity="0.9" /></svg>),
  tag: (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 4h10M5 4v10M19 12l-5 8 5-2 4-3-4-3z" strokeLinejoin="round" /></svg>),
  spin: (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M20 12a8 8 0 1 1-2.34-5.66" /><path d="M20 3v4h-4" strokeLinejoin="round" /></svg>),
  cross: (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="6" /><path d="M12 2v5M12 17v5M2 12h5M17 12h5" /></svg>),
  close: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 5l14 14M19 5L5 19" /></svg>),
  refresh: (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 3v5h5" strokeLinejoin="round" /></svg>),
  grid: (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 12h18M12 3v18" /></svg>),
  play: (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M7 4l13 8-13 8z" strokeLinejoin="round" /></svg>),
  eye: (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z" /><circle cx="12" cy="12" r="2.6" /></svg>),
  layers: (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3l9 5-9 5-9-5 9-5z" strokeLinejoin="round" /><path d="M3 13l9 5 9-5" /></svg>),
};

function Brand() {
  return (
    <div className="flex items-center gap-3 select-none">
      <div className="text-gold-400">{I.orbit}</div>
      <div>
        <div className="font-display text-[15px] tracking-[0.34em] text-ink-100 leading-none">INNER ORBIT</div>
        <div className="label-caps mt-1 text-[9px]!">Journey Atlas · Natal Chart</div>
      </div>
    </div>
  );
}

/* --------------------------------- form --------------------------------- */

interface FormState {
  name: string; date: string; time: string; timeKnown: boolean;
  lat: string; lon: string; tzOffset: string;
}

/* Type-ahead birthplace search over the offline gazetteer. Coordinates and
   timezone are derived from the chosen city; manual entry is a second,
   optional path — never a fallback for a missing city. */
function PlaceField({ city, onPick }: { city: City | null; onPick: (c: City | null) => void }) {
  const [query, setQuery] = useState(city ? city.country ? `${city.name}, ${city.country}` : city.name : "");
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const [results,setResults] = useState<City[]>(() => searchCities(query));
  useEffect(()=>{let live=true;setResults(searchCities(query));const lookup=(window as Window & {searchBirthCities?: (q:string)=>Promise<{id:string;label:string;lat:number;lon:number;zone:string}[]>}).searchBirthCities;if(lookup && query.trim().length>=2){const timer=setTimeout(()=>{lookup(query).then(rows=>{if(live && rows.length)setResults(rows.map(r=>({id:"geonames-"+r.id,name:r.label,country:"",lat:r.lat,lon:r.lon,tz:r.zone}))) }).catch(()=>{});},180);return()=>{live=false;clearTimeout(timer)}}return()=>{live=false}},[query]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pick = (c: City) => {
    if(!CITIES.some(p=>p.id===c.id)) CITIES.push(c);
    onPick(c);
    setQuery(c.country ? `${c.name}, ${c.country}` : c.name);
    setOpen(false);
  };

  return (
    <div ref={boxRef} className="relative">
      <input
        className="field"
        value={query}
        placeholder="Start typing a city — e.g. Colorado Springs"
        autoComplete="off"
        spellCheck={false}
        role="combobox"
        aria-expanded={open}
        aria-label="Place of birth"
        aria-activedescendant={open && results[hi] ? `place-option-${hi}` : undefined}
        aria-controls="birthplace-list"
        aria-autocomplete="list"
        onChange={(e) => { setQuery(e.target.value); onPick(null); setOpen(true); setHi(0); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && results.length) { e.preventDefault(); setHi((h) => (h + 1) % results.length); }
          else if (e.key === "ArrowUp" && results.length) { e.preventDefault(); setHi((h) => (h - 1 + results.length) % results.length); }
          else if (e.key === "Enter" && open && results[hi]) { e.preventDefault(); pick(results[hi]); }
          else if (e.key === "Escape") setOpen(false);
        }}
      />
      {city && (
        <div className="mt-1.5 flex items-center gap-2 text-[11.5px] font-light text-ink-500">
          <span className="rounded border border-gold-400/40 bg-gold-500/10 px-1.5 py-0.5 text-gold-300">
            {city.lat.toFixed(2)}°, {city.lon.toFixed(2)}° · {city.tz.replace("_", " ")}
          </span>
          <span>coordinates + timezone derived automatically · Place data: GeoNames (CC BY 4.0)</span>
        </div>
      )}
      {open && (
        <div id="birthplace-list" role="listbox" className="absolute inset-x-0 top-full z-30 mt-1 max-h-[228px] overflow-y-auto scroll-thin rounded-lg border border-gold-700/40 bg-void-800 p-1 shadow-2xl anim-fade">
          {query.trim() === "" && (
            <div className="label-caps px-2.5 pb-1 pt-2">Popular places</div>
          )}
          {results.length === 0 && (
            <div className="px-3 py-3 text-[12.5px] font-light text-ink-500">
              No matching city found — try adding a region or country, or enter coordinates below.
            </div>
          )}
          {results.map((c, i) => (
            <button
              key={c.id}
              id={`place-option-${i}`}
              role="option"
              aria-selected={i === hi}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(c)}
              onMouseEnter={() => setHi(i)}
              className={cn("flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left",
                i === hi ? "bg-gold-500/15" : "hover:bg-gold-500/8")}
            >
              <span className="flex-1 truncate text-[13.5px] text-ink-100">{c.name}</span>
              <span className="shrink-0 text-[11px] font-light text-ink-500">{c.country}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FormStage({ onCast, onDemo }: { onCast: (input: ChartInput) => void; onDemo: (id: string) => void }) {
  const [f, setF] = useState<FormState>({
    name: "", date: "1994-06-21", time: "14:32", timeKnown: true,
    lat: "", lon: "", tzOffset: "0",
  });
  const set = (k: keyof FormState, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));
  const [city, setCity] = useState<City | null>(() => searchCities("london")[0] ?? null);
  const [manual, setManual] = useState(false);
  const coordsOk = !Number.isNaN(parseFloat(f.lat)) && !Number.isNaN(parseFloat(f.lon));
  const buildInput = (): ChartInput => ({
    name: f.name, date: f.date, time: f.time || "12:00", timeKnown: f.timeKnown,
    placeId: manual ? "custom" : city?.id ?? "custom",
    lat: manual ? parseFloat(f.lat) : city?.lat ?? NaN,
    lon: manual ? parseFloat(f.lon) : city?.lon ?? NaN,
    tz: manual ? null : city?.tz ?? null,
    tzOffset: manual ? parseFloat(f.tzOffset || "0") : 0,
  });
  const ready = f.date.length === 10 && (!f.timeKnown || f.time.length === 5) && (manual ? coordsOk : city !== null);
  const problem = ready ? validateChartInput(buildInput()) : null;
  const valid = ready && !problem;
  const submit = () => {
    if (!valid) return;
    onCast(buildInput());
  };
  const demos = loadSamples();

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center overflow-y-auto p-4">
      <div className="anim-rise my-auto w-full max-w-[580px]">
        <div className="plate tick-frame px-7 py-8 md:px-10 md:py-9">
          <div className="mb-7 flex items-center gap-3">
            <div className="scale-125 text-gold-400">{I.orbit}</div>
            <div>
              <div className="font-display text-[17px] leading-none tracking-[0.34em]">INNER ORBIT</div>
              <div className="label-caps mt-1 text-[9px]!">Journey Atlas · Natal Chart</div>
            </div>
          </div>
          <h1 className="font-display text-[34px] leading-[1.08] text-ink-100 md:text-[40px]">
            Cast your sky,<br /><span className="text-gold-300">exactly as it stood.</span>
          </h1>
          <p className="mt-3 text-[14px] font-light leading-relaxed text-ink-300">
            Enter the moment and place of your birth. We reconstruct the heavens above you —
            every planet, house and aspect — then open a guided observatory for exploring what they may mean.
          </p>
          <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="birth-name" className="label-caps mb-1.5 block">Name <span className="normal-case tracking-normal opacity-50">· optional</span></label>
              <input id="birth-name" name="name" autoComplete="name" className="field" value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Who is this chart for?" maxLength={40} />
            </div>
            <div>
              <label htmlFor="birth-date" className="label-caps mb-1.5 block">Date of birth</label>
              <input id="birth-date" name="birth-date" type="date" className="field" value={f.date} min="1800-01-01" max="2050-12-31" onChange={(e) => set("date", e.target.value)} />
            </div>
            <div>
              <label htmlFor="birth-time" className="label-caps mb-1.5 block">Time of birth</label>
              <input id="birth-time" name="birth-time" type="time" className="field" value={f.time} disabled={!f.timeKnown} onChange={(e) => set("time", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="label-caps mb-1.5 block">Place of birth</label>
              {!manual && <PlaceField city={city} onPick={setCity} />}
              {manual && (
                <p className="rounded-lg border border-gold-700/25 bg-void-900/50 px-3 py-2 text-[12px] font-light text-ink-500">
                  Manual coordinates — only needed for places far off the map.
                </p>
              )}
              <button
                type="button"
                onClick={() => setManual((m) => !m)}
                className="mt-2 text-[12px] font-light text-gold-400 hover:text-gold-300"
                aria-expanded={manual}
              >
                {manual ? "← Back to city search" : "Or enter coordinates manually"}
              </button>
            </div>
            {manual && (
              <>
                <div><label className="label-caps mb-1.5 block">Latitude</label>
                  <input className="field" inputMode="decimal" value={f.lat} placeholder="38.83" onChange={(e) => set("lat", e.target.value)} /></div>
                <div><label className="label-caps mb-1.5 block">Longitude</label>
                  <input className="field" inputMode="decimal" value={f.lon} placeholder="-104.82" onChange={(e) => set("lon", e.target.value)} /></div>
                <div className="md:col-span-2"><label className="label-caps mb-1.5 block">Timezone offset from UTC (hours, e.g. -7 or 5.5)</label>
                  <input className="field" inputMode="decimal" value={f.tzOffset} onChange={(e) => set("tzOffset", e.target.value)} /></div>
              </>
            )}
          </div>
          <label className="group mt-4 flex cursor-pointer select-none items-center gap-2.5">
            <span className={cn("relative h-[18px] w-[32px] rounded-full border transition-colors",
              f.timeKnown ? "border-gold-400 bg-gold-500/80" : "border-gold-700/60 bg-void-700")}>
              <span className={cn("absolute top-[2px] h-[12px] w-[12px] rounded-full transition-all",
                f.timeKnown ? "left-[17px] bg-void-900" : "left-[2px] bg-ink-500")} />
            </span>
            <button type="button" onClick={() => set("timeKnown", !f.timeKnown)} className="text-left text-[13px] text-ink-300 transition-colors group-hover:text-ink-100">
              {f.timeKnown ? "I know my exact birth time" : "I don't know my exact time — houses will be approximate"}
            </button>
          </label>
          {problem && <p role="alert" className="mt-4 rounded-lg border border-square/40 bg-square/10 px-3 py-2 text-[12.5px] text-square">{problem}</p>}
          <button className="btn-gold mt-5 w-full" disabled={!valid} onClick={submit}>Begin the casting</button>

          <div className="hair-t mt-6 pt-5">
            <div className="label-caps mb-2.5 text-center">Or open a demonstration chart</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {demos.map((d) => (
                <button key={d.meta.id} onClick={() => onDemo(d.meta.id)}
                  className="plate-hair rounded-lg p-3 text-left transition-all hover:border-gold-400/50 hover:bg-gold-500/5">
                  <div className="font-display text-[15px] text-gold-300">{d.meta.name}</div>
                  <div className="mt-0.5 text-[11px] font-light leading-snug text-ink-500">{d.meta.tagline}</div>
                  <div className="mt-1.5 font-display text-[13px]" style={{ color: d.chart.planets[0].color }}>
                    {d.chart.planets[0].glyph} {SIGNS[d.chart.planets[0].sign].glyph} · {d.chart.planets[1].glyph} {SIGNS[d.chart.planets[1].sign].glyph} · ASC {SIGNS[degMinOf(d.chart.ascLon).sign].glyph}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <p className="mt-4 text-center text-[11px] font-light leading-relaxed text-ink-500">
            Astronomy Engine calculations · Placidus houses (Equal at high latitudes) · DST-aware local time. Birth inputs are remembered on this browser.
          </p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- casting -------------------------------- */

function CastingOverlay({ chart, progress }: { chart: ChartData; progress: number }) {
  const step = Math.min(CAST_STEPS.length - 1, Math.floor(progress * CAST_STEPS.length));
  const fade = progress > 0.78 ? Math.max(0, 1 - (progress - 0.78) / 0.22) : 1;
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-void-950/70 backdrop-blur-[3px]"
      style={{ opacity: fade, pointerEvents: fade < 0.4 ? "none" : "auto" }}>
      <div className="anim-fade flex w-[320px] flex-col items-center">
        <div className="relative h-36 w-36">
          <svg viewBox="0 0 100 100" className="absolute inset-0" style={{ animation: "spin-slow 9s linear infinite" }}>
            <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(229,193,133,0.55)" strokeWidth="0.7" strokeDasharray="1.5 4.4" />
          </svg>
          <svg viewBox="0 0 100 100" className="absolute inset-0" style={{ animation: "spin-slower 14s linear infinite" }}>
            <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(143,216,212,0.5)" strokeWidth="0.7" strokeDasharray="8 6" />
            <circle cx="50" cy="14" r="2.6" fill="#8fd8d4" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-[26px] text-gold-300" style={{ animation: "breathe 2.4s ease-in-out infinite" }}>☉</span>
          </div>
        </div>
        <div className="mt-7 font-display text-[19px] tracking-wide text-ink-100">
          Casting the chart of <span className="text-gold-300">{chart.name}</span>
        </div>
        <div className="mt-2 h-5 text-[12.5px] font-light tracking-[0.08em] text-ink-500">{CAST_STEPS[step]}…</div>
        <div className="mt-5 h-[3px] w-full overflow-hidden rounded-full bg-void-700">
          <div className="progress-shimmer h-full rounded-full" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        <div className="mt-2 text-[10.5px] uppercase tracking-[0.18em] text-ink-500">{chart.placeLabel} · {chart.dateLabel}</div>
      </div>
    </div>
  );
}

/* ---------------------------------- app ---------------------------------- */

export default function App() {
  const chartHeaderRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>("form");
  const [chart, setChart] = useState<ChartData | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [demoNote, setDemoNote] = useState<string | undefined>(undefined);
  const [progress, setProgress] = useState(0);
  const [tab, setTab] = useState<PanelTab>("blueprint");
  const [sel, setSel] = useState<Selection>({ kind: "none" });
  const [trail, setTrail] = useState<Selection[]>([]);
  const [aspectFilter, setAspectFilter] = useState<string | null>(null);
  const [view2d, setView2d] = useState(false);
  const [webglAvailable, setWebglAvailable] = useState(true);
  const [showDisplay, setShowDisplay] = useState(false);
  /* mobile bottom sheet: collapsed peek by default so the chart stays visible */
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showAspects, setShowAspects] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [hover, setHover] = useState<{ p: { glyph: string; color: string; name: string; sign: number; degText: string; retro: boolean; house: number }; x: number; y: number } | null>(null);

  const [prefs, setPrefs] = useState<Prefs>(() => { const p = loadPrefs(); if(new URLSearchParams(location.search).get("mode") === "deep") p.depth="deep"; return p; });
  const [tourStep, setTourStep] = useState(-1);
  const [tourDone, setTourDone] = useState(() => {
    try { return localStorage.getItem(TOUR_KEY) === "done"; } catch { return false; }
  });

  /* Cosmic Portrait: reading mode, per-chart progress, and Show Me Why highlights */
  const [portraitOpen, setPortraitOpen] = useState(false);
  const [portraitClosing, setPortraitClosing] = useState(false);
  const [portraitHi, setPortraitHi] = useState<{ planets: number[]; aspects: number[] } | null>(null);
  const [portraitPct, setPortraitPct] = useState<number | null>(null);
  const progressRef = useRef<PortraitProgress | null>(null);
  /* recalculated immediately whenever a new chart is created — nothing is carried between people */
  const portrait = useMemo(() => (chart ? buildCosmicPortrait(chart, { isDemo }) : null), [chart, isDemo]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<NatalScene | null>(null);
  const chartRef = useRef<ChartData | null>(null);
  const stageRef = useRef<Stage>("form");
  stageRef.current = stage;
  const panelHeadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch { /* private mode */ }
  }, [prefs]);

  /* scene lifecycle */
  useEffect(() => {
    let live = true;
    (async () => {
      try { await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1400))]); }
      catch { /* fonts API unavailable */ }
      if (!live || !canvasRef.current || sceneRef.current) return;
      const motion = loadPrefs().motion;
      try { sceneRef.current = new NatalScene(canvasRef.current, {
        onHover: (p, x, y) => {
          if (stageRef.current !== "chart" || !p) { setHover(null); return; }
          setHover({ p: { glyph: p.glyph, color: p.color, name: p.name, sign: p.sign, degText: p.degText, retro: p.retro, house: p.house }, x, y });
        },
        onSelect: (i) => {
          if (i === null) return;
          applySelection({ kind: "planet", index: i }, "reading");
        },
        onAspect: (i) => {
          if (i === null) return;
          applySelection({ kind: "aspect", index: i }, "aspects");
        },
        /* adaptive monitor stepped the atmosphere down — stay in sync */
        onPerfNote: (mode) => {
          setPrefs((p) => (p.atmosphere === mode ? p : { ...p, atmosphere: mode }));
        },
      });
      } catch { setWebglAvailable(false); setView2d(true); return; }
      const sc = sceneRef.current;
      const pr = loadPrefs();
      sc.setAtmosphere(pr.atmosphere);
      sc.setConnectionMode(pr.connection);
      sc.setQuality(pr.lowQ);
      sc.setMotionEnabled(pr.motion && motion);
      sc.setOptions({ aspects: true, labels: true, orbit: pr.orbit, labelDetail: pr.labelDetail });
      if (chartRef.current) sc.setChart(chartRef.current);
    })();
    return () => {
      live = false;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* apply prefs to scene */
  useEffect(() => {
    const sc = sceneRef.current;
    if (!sc) return;
    sc.setAtmosphere(prefs.atmosphere);
    sc.setConnectionMode(prefs.connection);
    sc.setQuality(prefs.lowQ);
    sc.setMotionEnabled(prefs.motion);
    sc.setOptions({ orbit: prefs.orbit, aspects: showAspects, labels: showLabels, labelDetail: prefs.labelDetail });
  }, [prefs, showAspects, showLabels]);

  /* responsive framing: keep the wheel inside the visible central region
     between the side panels (critical at ~1024px iPad landscape).
     Must run BEFORE setChart so the intro camera lands pre-framed. */
  const frameScene = useCallback(() => {
    const sc = sceneRef.current;
    if (!sc) return;
    const w = window.innerWidth, h = window.innerHeight;
    if (w < 1024) {
      /* collapsed peek needs little lift; open sheet needs much more */
      sc.notifyLayout(0, 0, Math.round(h * (sheetOpen ? 0.17 : 0.06)));
      return;
    }
    const leftW = !view2d && w >= 768 ? (w >= 1024 ? 212 + 24 : 184 + 16) : 0;
    const rightW = w >= 1024 ? 372 + 24 : 320 + 16;
    sc.notifyLayout(leftW, rightW, 0);
  }, [view2d, sheetOpen]);

  useEffect(() => {
    if (stage !== "chart") return;
    frameScene();
    window.addEventListener("resize", frameScene);
    return () => window.removeEventListener("resize", frameScene);
  }, [stage, frameScene]);

  /* ------- selection: single source of truth, everything syncs ------- */

  const applySelection = useCallback((s: Selection, forceTab?: PanelTab, quiet = false) => {
    setSel(s);
    if (!quiet && window.innerWidth < 1024) setSheetOpen(true);
    setTrail((t) => pushHistory(t, s));
    const sc = sceneRef.current;
    if (!sc || !chartRef.current) {
      if (forceTab) setTab(forceTab);
      return;
    }
    const chart = chartRef.current;
    if (s.kind === "planet") {
      sc.selectIndex(s.index);
      sc.selectAspect(null);
      sc.setSpotlight(null, null);
      if (forceTab) setTab(forceTab);
    } else if (s.kind === "aspect") {
      sc.selectIndex(null);
      sc.selectAspect(s.index);
      const a = chart.aspects[s.index];
      sc.setSpotlight([a.a, a.b], [s.index]);
      if (forceTab) setTab(forceTab);
    } else if (s.kind === "house") {
      sc.selectIndex(null);
      sc.selectAspect(null);
      const members = chart.planets.filter((p) => p.house === s.house).map((p) => p.index);
      sc.setSpotlight(members.length ? members : null, null);
      if (forceTab) setTab(forceTab);
    } else if (s.kind === "sign") {
      sc.selectIndex(null);
      sc.selectAspect(null);
      const members = chart.planets.filter((p) => p.sign === s.sign).map((p) => p.index);
      sc.setSpotlight(members.length ? members : null, null);
      if (forceTab) setTab(forceTab);
    } else {
      sc.selectIndex(null);
      sc.selectAspect(null);
      sc.setSpotlight(null, null);
      if (forceTab) setTab(forceTab);
    }
    /* accessible focus: move to panel heading (not while the reading surface owns focus) */
    if (!quiet) requestAnimationFrame(() => panelHeadRef.current?.focus({ preventScroll: true }));
  }, []);

  const clearSelection = useCallback(() => {
    setSel({ kind: "none" });
    sceneRef.current?.selectIndex(null);
    sceneRef.current?.selectAspect(null);
    sceneRef.current?.setSpotlight(null, null);
  }, []);

  const goBack = useCallback(() => {
    setTrail((t) => {
      if (t.length === 0) { clearSelection(); return t; }
      const prev = t[t.length - 2];
      const next = t.slice(0, -1);
      if (!prev) { clearSelection(); return next; }
      /* apply without re-pushing */
      setSel(prev);
      const sc = sceneRef.current;
      const chart = chartRef.current;
      if (sc && chart) {
        if (prev.kind === "planet") { sc.selectIndex(prev.index); sc.selectAspect(null); sc.setSpotlight(null, null); setTab("reading"); }
        else if (prev.kind === "aspect") {
          sc.selectIndex(null); sc.selectAspect(prev.index);
          const a = chart.aspects[prev.index];
          sc.setSpotlight([a.a, a.b], [prev.index]); setTab("aspects");
        }
        else if (prev.kind === "house" || prev.kind === "sign") { sc.selectIndex(null); sc.selectAspect(null); setTab("reading"); }
        else { sc.selectIndex(null); sc.selectAspect(null); sc.setSpotlight(null, null); setTab("blueprint"); }
      }
      return next;
    });
  }, [clearSelection]);

  /* ------- tour ------- */

  const startTour = useCallback(() => {
    setTourStep(0);
    setTab("blueprint");
    if (window.innerWidth < 1024) setSheetOpen(true);
  }, []);

  useEffect(() => {
    if (tourStep < 0 || !chartRef.current) return;
    if (window.innerWidth < 1024) setSheetOpen(true);
    const chart = chartRef.current;
    const target = TOUR_STEPS[tourStep].target;
    const sc = sceneRef.current;
    if (target === "blueprint") {
      clearSelection(); setTab("blueprint"); sc?.setSpotlight(null, null);
    } else if (target === "sun") {
      setSel({ kind: "planet", index: 0 }); setTab("reading");
      sc?.selectIndex(0); sc?.selectAspect(null); sc?.setSpotlight([0], null);
    } else if (target === "moon") {
      setSel({ kind: "planet", index: 1 }); setTab("reading");
      sc?.selectIndex(1); sc?.selectAspect(null); sc?.setSpotlight([1], null);
    } else if (target === "asc") {
      const s = { kind: "house", house: 1 } as Selection;
      setSel(s); setTab("reading");
      const members = chart.planets.filter((p) => p.house === 1).map((p) => p.index);
      sc?.selectIndex(null); sc?.selectAspect(null); sc?.setSpotlight(members.length ? members : null, null);
    } else if (target === "houses") {
      const counts: Record<number, number> = {};
      chart.planets.forEach((p) => { counts[p.house] = (counts[p.house] ?? 0) + 1; });
      let best = chart.planets[0].house, bn = -1;
      for (const [h, n] of Object.entries(counts)) { if (n > bn) { bn = n; best = Number(h); } }
      const s = { kind: "house", house: best } as Selection;
      setSel(s); setTab("reading");
      const members = chart.planets.filter((p) => p.house === best).map((p) => p.index);
      sc?.selectIndex(null); sc?.selectAspect(null); sc?.setSpotlight(members, null);
    } else if (target === "aspects") {
      clearSelection(); setTab("aspects"); sc?.setSpotlight(null, null);
    } else if (target === "aspect") {
      const t = [...chart.aspects].map((a, idx) => ({ a, idx }))
        .filter((x) => (MAJOR_FIVE as readonly string[]).includes(x.a.type))
        .sort((a, b) => a.a.orb - b.a.orb)[0];
      if (t) {
        setSel({ kind: "aspect", index: t.idx }); setTab("aspects");
        sc?.selectIndex(null); sc?.selectAspect(t.idx);
        sc?.setSpotlight([t.a.a, t.a.b], [t.idx]);
      } else { clearSelection(); setTab("aspects"); }
    }
    requestAnimationFrame(() => panelHeadRef.current?.focus({ preventScroll: true }));
  }, [tourStep, clearSelection]);

  const endTour = useCallback((completed: boolean) => {
    setTourStep(-1);
    if (completed) {
      setTourDone(true);
      try { localStorage.setItem(TOUR_KEY, "done"); } catch { /* noop */ }
    }
    clearSelection();
    setTab("blueprint");
  }, [clearSelection]);

  /* ------- casting ------- */

  const runCast = useCallback((data: ChartData, demo: boolean, note?: string) => {
    chartRef.current = data;
    /* a new person: drop every trace of the previous reading, progress and highlight */
    progressRef.current = null;
    setPortraitPct(null);
    setPortraitHi(null);
    setPortraitOpen(false);
    setPortraitClosing(false);
    sceneRef.current?.setSuspended(false);
    if(data.placeLabel.endsWith(", ")) data={...data,placeLabel:data.placeLabel.slice(0,-2)};
    setJournalChartSource(data,demo);
    setChart(data);
    if (!demo && window.parent !== window) window.parent.postMessage({type:"inner-orbit-chart",chart:data}, location.origin);
    setIsDemo(demo);
    setDemoNote(note);
    setSel({ kind: "none" });
    setTrail([]);
    setAspectFilter(null);
    setTab("blueprint");
    setTourStep(-1);
    setView2d(!sceneRef.current);
    setProgress(0);
    setStage("casting");
    frameScene();
    sceneRef.current?.setChart(data);
    const t0 = performance.now();
    const tick = () => {
      const k = (performance.now() - t0) / 3600;
      setProgress(Math.min(1, k));
      if (k < 1) requestAnimationFrame(tick);
      else setTimeout(() => setStage("chart"), 450);
    };
    requestAnimationFrame(tick);
  }, [frameScene]);

  const cast = useCallback((input: ChartInput) => {
    try {
      const computed = computeChart(input);
      const savedInput = {...input, resolvedCity:CITIES.find(c=>c.id===input.placeId)};
      try { localStorage.setItem("inner-orbit:imported-birth:v1", JSON.stringify(savedInput)); } catch {}
      if (window.parent !== window) window.parent.postMessage({type:"inner-orbit-birth-input",input:savedInput}, location.origin);
      runCast(computed, false, undefined);
    }
    catch (e) { window.alert(e instanceof Error ? e.message : "That birth data could not be used."); }
  }, [runCast]);

  useEffect(() => {
    try { const saved = localStorage.getItem("inner-orbit:imported-birth:v1"); const prior = JSON.parse(localStorage.getItem("inner-orbit-natal-input") || "null"); if (saved || (prior && prior.occurrence !== "later")) { const input = saved ? JSON.parse(saved) : {name:prior.name || "You",date:prior.date,time:prior.time || "12:00",timeKnown:!prior.unknown,placeId:"custom",lat:Number(prior.lat),lon:Number(prior.lon),tz:prior.zone,tzOffset:0}; if (input.resolvedCity && !CITIES.some(c=>c.id===input.resolvedCity.id)) CITIES.push(input.resolvedCity); if (!validateChartInput(input)) runCast(computeChart(input), false, undefined); } } catch { /* Keep form available if saved input is invalid. */ }
  }, []);

  useEffect(() => {
    const header=chartHeaderRef.current;
    if(!header) return;
    const measure=()=>header.parentElement?.style.setProperty("--chart-reading-top", `${header.offsetTop+header.offsetHeight+12}px`);
    measure(); const observer=new ResizeObserver(measure);observer.observe(header);
    return()=>observer.disconnect();
  }, [stage]);

  const castDemo = useCallback((id: string) => {
    const found = loadSamples().find((s) => s.meta.id === id);
    if (found) runCast(found.chart, true, found.meta.note);
  }, [runCast]);

  const reset = useCallback(() => {
    progressRef.current = null;
    setPortraitPct(null);
    setPortraitHi(null);
    setPortraitOpen(false);
    setPortraitClosing(false);
    sceneRef.current?.setSuspended(false);
    setStage("form");
    setChart(null);
    chartRef.current = null;
    setSel({ kind: "none" });
    setTrail([]);
    setTourStep(-1);
    setView2d(!sceneRef.current);
    sceneRef.current?.hideChart();
  }, []);

  /* ------- Cosmic Portrait: expanded reading mode ------- */

  const openPortrait = useCallback(() => {
    setTourStep(-1);
    setPortraitClosing(false);
    setPortraitOpen(true);
    /* the chart is fully covered: stop rendering it to save battery */
    window.setTimeout(() => sceneRef.current?.setSuspended(true), 380);
  }, []);

  const closePortrait = useCallback(() => {
    sceneRef.current?.setSuspended(false);
    setPortraitPct(progressRef.current?.pct ?? null);
    setPortraitClosing(true);
    window.setTimeout(() => { setPortraitOpen(false); setPortraitClosing(false); }, 520);
  }, []);

  const highlightWhy = useCallback((w: WhyRef) => {
    setPortraitHi(w.spotlight);
    if (w.selection) applySelection(w.selection, undefined, true);
    else {
      clearSelection();
      sceneRef.current?.setSpotlight(w.spotlight?.planets.length ? w.spotlight.planets : null, w.spotlight?.aspects.length ? w.spotlight.aspects : null);
    }
  }, [applySelection, clearSelection]);

  const openWhyInChart = useCallback((w: WhyRef) => {
    closePortrait();
    if (w.selection) applySelection(w.selection, w.selection.kind === "aspect" ? "aspects" : "reading");
    else {
      clearSelection();
      setTab("patterns");
      sceneRef.current?.setSpotlight(w.spotlight?.planets.length ? w.spotlight.planets : null, w.spotlight?.aspects.length ? w.spotlight.aspects : null);
    }
  }, [closePortrait, applySelection, clearSelection]);

  /* ------- keyboard ------- */

  useEffect(() => {
    if (stage !== "chart" || !chart || portraitOpen) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (e.key === "Escape") {
        if (tourStep >= 0) endTour(false);
        else if (sel.kind !== "none") goBack();
      } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const dir = e.key === "ArrowRight" ? 1 : -1;
        const cur = sel.kind === "planet" ? sel.index : dir === 1 ? -1 : 0;
        const next = (cur + dir + chart.planets.length) % chart.planets.length;
        applySelection({ kind: "planet", index: next }, "reading");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage, chart, sel, tourStep, portraitOpen, applySelection, goBack, endTour]);

  const selectedAspectIdx = sel.kind === "aspect" ? sel.index : null;
  const tabs: { id: PanelTab; label: string }[] = useMemo(() => [
    { id: "blueprint", label: "Blueprint" },
    { id: "reading", label: "Reading" },
    { id: "aspects", label: "Aspects" },
    { id: "patterns", label: "Patterns" },
  ], []);

  return (
    <div className={cn("space-bg relative h-full w-full overflow-hidden font-body", portraitOpen && "reading-mode")}>
      <CosmicBackdrop mode={prefs.atmosphere} />
      <canvas ref={canvasRef} className="chart-restore absolute inset-0 h-full w-full" style={{ opacity: portraitOpen && !portraitClosing ? 0 : 1 }} aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 90% at 50% 42%, transparent 55%, rgba(4,5,10,0.55) 100%)" }} />

      {stage === "form" && <FormStage onCast={cast} onDemo={castDemo} />}
      {stage === "casting" && chart && <CastingOverlay chart={chart} progress={progress} />}

      {stage === "chart" && chart && (
        <>
          {/* top bar */}
          <div ref={chartHeaderRef} className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-wrap items-start justify-between gap-3 p-4 md:p-5">
            <div className="chart-brand anim-rise pointer-events-auto plate rounded-lg px-4 py-3" style={{ animationDelay: "0.15s" }}>
              <Brand />
            </div>
            <div className="anim-rise pointer-events-auto plate tick-frame max-w-[calc(100vw-2rem)] rounded-lg px-4 py-3 text-right" style={{ animationDelay: "0.3s" }}>
              <div className="font-display text-[16px] leading-none text-ink-100">
                {chart.name} {isDemo && <span className="ml-1 rounded border border-gold-400/50 bg-gold-500/10 px-1.5 py-0.5 align-middle text-[9px] tracking-[0.14em] text-gold-300">DEMO</span>}
              </div>
              <div className="mt-1.5 text-[10.5px] uppercase tracking-[0.14em] text-ink-500">
                {chart.dateLabel} · {chart.timeLabel} · {chart.placeLabel}
              </div>
              <div className="mt-2.5 flex flex-wrap justify-end gap-1.5">
                {!tourDone || tourStep >= 0 ? null : null}
                <button className="btn-ghost active" onClick={openPortrait}>✦ Cosmic Portrait</button>
                <button className="btn-ghost" onClick={startTour}>{I.play} {tourDone ? "Replay tour" : "Guided tour"}</button>
                <button className="btn-ghost" onClick={reset}>{I.refresh} New chart</button><button className="btn-ghost" onClick={() => { try { localStorage.removeItem("inner-orbit:imported-birth:v1"); localStorage.removeItem("inner-orbit-natal-input"); } catch {} reset(); }}>Forget birth inputs</button>
              </div>
            </div>
          </div>

          {/* 2D overlay */}
          {view2d && (
            <div className="chart2d-stage absolute inset-0 z-[5] flex items-center justify-center p-4 pt-24 md:p-8 md:pl-[216px] md:pr-[352px] md:pt-24 lg:pl-[280px] lg:pr-[412px]">
              <div className="anim-fade h-full max-h-[68vh] w-full max-w-[600px]">
                <Chart2D
                  chart={chart}
                  selection={sel}
                  onPlanet={(i) => applySelection({ kind: "planet", index: i }, "reading")}
                  onAspect={(i) => applySelection({ kind: "aspect", index: i }, "aspects")}
                />
              </div>
            </div>
          )}

          {/* left: planet rail (desktop) */}
          {!view2d && (
            <div className="chart-planet-rail anim-rise absolute left-4 top-28 z-10 hidden max-h-[calc(100vh-300px)] w-[184px] flex-col overflow-hidden rounded-lg plate md:flex lg:left-6 lg:w-[212px]" style={{ animationDelay: "0.45s" }}>
              <div className="flex items-baseline justify-between px-4 pb-2 pt-3.5">
                <span className="label-caps">Planets</span>
                <span className="text-[10px] font-light text-ink-500">← → keys</span>
              </div>
              <div className="hair-t mx-4" />
              <div className="scroll-thin space-y-0.5 overflow-y-auto px-2 py-2" role="listbox" aria-label="Planets">
                {chart.planets.map((p) => (
                  <button
                    key={p.id}
                    role="option"
                    aria-selected={sel.kind === "planet" && sel.index === p.index}
                    onClick={() => applySelection({ kind: "planet", index: p.index }, "reading")}
                    onMouseEnter={() => sceneRef.current?.hoverIndex(p.index)}
                    onMouseLeave={() => sceneRef.current?.hoverIndex(null)}
                    className={cn("p-row flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left",
                      sel.kind === "planet" && sel.index === p.index && "sel")}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-display text-[13px]"
                      style={{ color: p.color, background: `${p.color}14`, border: `1px solid ${p.color}45` }}>{p.glyph}</span>
                    <span className="flex-1 truncate text-[12px] tracking-[0.04em] text-ink-100">{p.name}</span>
                    {p.retro && <span className="rounded border border-[#ff8a70]/40 bg-[#ff8a70]/10 px-1 text-[9px] font-medium text-[#ff8a70]">R</span>}
                    <span className="w-[52px] text-right font-display text-[12px] text-gold-300/90">{SIGNS[p.sign].glyph} {Math.floor(p.signDeg)}°</span>
                  </button>
                ))}
              </div>
              <div className="hair-t mx-4" />
              <div className="space-y-1 px-4 py-2.5 text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="w-8 text-[10px] tracking-[0.14em] text-ink-500"><G term="Ascendant" /></span>
                  <button onClick={() => applySelection({ kind: "house", house: 1 }, "reading")} className="font-display text-gold-300 hover:text-gold-400">
                    {SIGNS[degMinOf(chart.ascLon).sign].glyph} {fmtDegMin(chart.ascLon)}
                  </button>
                  {!chart.timeKnown && <span className="text-[9px] uppercase tracking-[0.12em] text-square" title="Birth time unknown — placeholder noon chart">assumed</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-8 text-[10px] tracking-[0.14em] text-ink-500"><G term="Midheaven" /></span>
                  <span className="font-display text-gold-300">{SIGNS[degMinOf(chart.mcLon).sign].glyph} {fmtDegMin(chart.mcLon)}</span>
                  {!chart.timeKnown && <span className="text-[9px] uppercase tracking-[0.12em] text-square">assumed</span>}
                </div>
              </div>
            </div>
          )}

          {/* right: the reading panel */}
          <aside
            aria-label="Chart reading panel" data-expanded={sheetOpen}
            className={cn(
              "chart-reading absolute inset-x-2 bottom-2 top-auto z-10 flex flex-col overflow-hidden rounded-lg plate sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-28 sm:max-h-[calc(100vh-220px)] sm:w-[320px] md:right-6 lg:w-[372px]",
              sheetOpen ? "max-h-[72vh]" : "max-h-14"
            )}
          >
            <div ref={panelHeadRef} tabIndex={-1} className="outline-none" />
            {/* mobile sheet handle: collapsed peek keeps the chart visible */}
            <div
              role="button"
              tabIndex={0}
              className="flex shrink-0 cursor-pointer items-center gap-2 px-4 pb-1 pt-2.5 sm:hidden"
              onClick={() => setSheetOpen((o) => !o)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSheetOpen((o) => !o); } }}
              aria-expanded={sheetOpen}
              aria-label={sheetOpen ? "Collapse chart guide" : "Expand chart guide"}
            >
              <span className="mx-auto h-1 w-10 rounded-full bg-gold-700/60" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-left text-[12px] tracking-[0.06em] text-ink-300">
                {tourStep >= 0 ? `Guided tour · ${tourStep + 1} of ${TOUR_STEPS.length}`
                  : sel.kind === "planet" ? `${chart.planets[sel.index].glyph} ${chart.planets[sel.index].name} in ${SIGNS[chart.planets[sel.index].sign].name}`
                  : sel.kind === "aspect" ? `${chart.planets[chart.aspects[sel.index].a].name} ${ASPECT_MAP[chart.aspects[sel.index].type].name} ${chart.planets[chart.aspects[sel.index].b].name}`
                  : sel.kind === "house" ? `House ${sel.house} · ${HOUSE_NAMES[sel.house - 1]}`
                  : sel.kind === "sign" ? `${SIGNS[sel.sign].glyph} ${SIGNS[sel.sign].name}`
                  : "Your Cosmic Blueprint"}
              </span>
              <span className={cn("shrink-0 text-gold-400 transition-transform", sheetOpen && "rotate-180")} aria-hidden="true">▾</span>
              <span className="flex shrink-0 gap-1">
                <button
                  className={cn("btn-ghost !px-2 !py-1 !text-[10px]", view2d && "active")}
                  onClick={(e) => { e.stopPropagation(); setView2d((v) => !v); }}
                  disabled={!webglAvailable}
                  aria-label={!webglAvailable ? "Interactive 2D chart · WebGL unavailable" : view2d ? "Switch to 3D chart" : "Switch to 2D chart"}
                >
                  {I.grid} {!webglAvailable ? "2D mode" : view2d ? "3D" : "2D"}
                </button>
                <button
                  className={cn("btn-ghost !px-2 !py-1 !text-[10px]", showDisplay && "active")}
                  onClick={(e) => { e.stopPropagation(); setShowDisplay((s) => !s); }}
                  aria-label="Display settings"
                >
                  {I.layers}
                </button>
              </span>
            </div>
            {/* tabs */}
            <div className="flex shrink-0 items-center gap-1 border-b border-gold-700/20 px-2 pt-2" role="tablist" aria-label="Panel sections">
              {tabs.map((t) => (
                <button key={t.id} role="tab" aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={cn("rounded-t-md px-2.5 py-2 text-[11px] uppercase tracking-[0.12em] transition-colors sm:px-3",
                    tab === t.id ? "bg-gold-500/12 text-gold-300" : "text-ink-500 hover:text-ink-100")}>
                  {t.label}
                </button>
              ))}
              <span className="flex-1" />
              {sel.kind !== "none" && (
                <button onClick={() => { clearSelection(); setTab("blueprint"); }} className="mb-1 text-[10px] uppercase tracking-[0.12em] text-ink-500 hover:text-gold-300" title="Return to Cosmic Blueprint">
                  ⌂ Blueprint
                </button>
              )}
            </div>
            {/* tour */}
            {tourStep >= 0 && (
              <div className="shrink-0 border-b border-gold-400/30 p-2.5">
                <TourPanel
                  chart={chart} step={tourStep} done={tourDone}
                  onNext={() => { tourStep >= TOUR_STEPS.length - 1 ? endTour(true) : setTourStep((s) => s + 1); }}
                  onBack={() => setTourStep((s) => Math.max(0, s - 1))}
                  onSkip={() => endTour(false)}
                  onExit={() => endTour(false)}
                />
              </div>
            )}
            {/* body */}
            <div className="scroll-thin min-h-0 flex-1 overflow-y-auto p-3.5 sm:p-4">
              {tab === "blueprint" && (
                <div className="space-y-3">
                  <Blueprint chart={chart} onSelect={(s) => applySelection(s, s.kind === "aspect" ? "aspects" : "reading")} onBegin={startTour}
                    onReadPortrait={openPortrait} portraitProgress={portraitPct} />
                  <DataBadge isDemo={isDemo} note={demoNote} />
                </div>
              )}
              {tab === "reading" && (
                <div className="space-y-3">
                  <HistoryBar trail={trail} onBack={goBack} onItem={(s) => applySelection(s, s.kind === "aspect" ? "aspects" : "reading")} />
                  {sel.kind === "planet" && (
                    <PlanetReadingView chart={chart} index={sel.index} depth={prefs.depth}
                      onAspect={(i) => applySelection({ kind: "aspect", index: i }, "aspects")}
                      onHouse={(h) => applySelection({ kind: "house", house: h }, "reading")}
                      onSign={(s) => applySelection({ kind: "sign", sign: s }, "reading")} />
                  )}
                  {sel.kind === "house" && (
                    <HouseReadingView chart={chart} house={sel.house} depth={prefs.depth}
                      onPlanet={(i) => applySelection({ kind: "planet", index: i }, "reading")} />
                  )}
                  {sel.kind === "sign" && (
                    <SignReadingView sign={sel.sign} depth={prefs.depth} chart={chart}
                      onPlanet={(i) => applySelection({ kind: "planet", index: i }, "reading")} />
                  )}
                  {sel.kind === "aspect" && (
                    <AspectReadingView chart={chart} aspectIdx={sel.index} depth={prefs.depth}
                      onPlanet={(i) => applySelection({ kind: "planet", index: i }, "reading")} />
                  )}
                  {(sel.kind === "none" || sel.kind === "blueprint") && (
                    <div className="rounded-lg border border-gold-700/25 bg-void-900/50 p-4 text-center">
                      <p className="font-display text-[16px] text-ink-100">Choose something in the sky</p>
                      <p className="mt-1 text-[12.5px] font-light text-ink-500">Click a planet, a glowing connection, or use the planet list. Keyboard: ← → to wander, Esc to step back.</p>
                      <button className="btn-ghost mx-auto mt-3" onClick={() => setTab("blueprint")}>{I.eye} Return to Cosmic Blueprint</button>
                    </div>
                  )}
                </div>
              )}
              {tab === "aspects" && (
                <div className="space-y-3">
                  <HistoryBar trail={trail} onBack={goBack} onItem={(s) => applySelection(s, s.kind === "aspect" ? "aspects" : "reading")} />
                  <AspectExplorer chart={chart} selected={selectedAspectIdx} filter={aspectFilter}
                    onFilter={setAspectFilter}
                    onSelect={(i) => { i === null ? clearSelection() : applySelection({ kind: "aspect", index: i }, "aspects"); }} />
                  {selectedAspectIdx !== null && (
                    <AspectReadingView chart={chart} aspectIdx={selectedAspectIdx} depth={prefs.depth}
                      onPlanet={(i) => applySelection({ kind: "planet", index: i }, "reading")} />
                  )}
                  <GuideFive chart={chart} onOpenAspect={(i) => applySelection({ kind: "aspect", index: i }, "aspects")} />
                </div>
              )}
              {tab === "patterns" && (
                <div className="space-y-3">
                  <Patterns chart={chart} onOpenAspect={(i) => applySelection({ kind: "aspect", index: i }, "aspects")} />
                  <DataBadge isDemo={isDemo} />
                </div>
              )}
            </div>
            {/* footer: depth + house note */}
            <div className="shrink-0 border-t border-gold-700/20 px-3.5 py-2.5">
              <DepthToggle depth={prefs.depth} onChange={(d) => setPrefs((p) => ({ ...p, depth: d }))} />
              <p className="mt-1.5 text-[10px] font-light leading-snug text-ink-500">
                Houses · Placidus <G term="House cusp" /> · Discover keeps it plain, Depth adds the traditional terms.
              </p>
            </div>
          </aside>

          {/* mobile chips */}
          {!view2d && (
            <div className={cn("anim-rise absolute inset-x-2 bottom-[118px] z-10 flex gap-1.5 overflow-x-auto scroll-thin py-1 sm:hidden", sheetOpen && "hidden")}>
              {chart.planets.map((p) => (
                <button key={p.id} onClick={() => applySelection({ kind: "planet", index: p.index }, "reading")}
                  className={cn("plate-hair flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px]",
                    sel.kind === "planet" && sel.index === p.index && "border-gold-400/70! bg-gold-500/15!")}>
                  <span className="font-display text-[13px]" style={{ color: p.color }}>{p.glyph}</span>
                  <span className="text-ink-300">{SIGNS[p.sign].glyph} {Math.floor(p.signDeg)}°</span>
                </button>
              ))}
            </div>
          )}

          {/* bottom-left: aspect key */}
          <div className="chart-angle-legend anim-rise absolute bottom-4 left-4 z-10 hidden rounded-lg px-4 py-3 plate sm:block md:left-6" style={{ animationDelay: "0.6s" }}>
            <div className="flex gap-5">
              <div>
                <div className="label-caps mb-1.5">Angles</div>
                <div className="space-y-1 text-[12px]">
                  <div className="flex items-center gap-2">
                    <span className="w-8 text-[10px] tracking-[0.14em] text-ink-500">ASC</span>
                    <span className="font-display text-gold-300">{SIGNS[degMinOf(chart.ascLon).sign].glyph} {fmtDegMin(chart.ascLon)}</span>
                    {!chart.timeKnown && <span className="text-[9px] uppercase tracking-[0.12em] text-square">assumed</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-8 text-[10px] tracking-[0.14em] text-ink-500">MC</span>
                    <span className="font-display text-gold-300">{SIGNS[degMinOf(chart.mcLon).sign].glyph} {fmtDegMin(chart.mcLon)}</span>
                    {!chart.timeKnown && <span className="text-[9px] uppercase tracking-[0.12em] text-square">assumed</span>}
                  </div>
                </div>
              </div>
              <div className="w-px self-stretch bg-gold-700/25" />
              <div>
                <div className="label-caps mb-1.5">Aspect key</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {(["conj", "sextile", "square", "trine", "opp"] as const).map((t) => (
                    <button key={t} onClick={() => { setAspectFilter(t); setTab("aspects"); }}
                      className="flex items-center gap-2 text-[11px] text-ink-300 hover:text-ink-100" title={`Explore ${ASPECT_MAP[t].name}s`}>
                      <span className="h-[2px] w-4 rounded-full" style={{ background: ASPECT_MAP[t].color, boxShadow: `0 0 6px ${ASPECT_MAP[t].color}` }} />
                      {ASPECT_MAP[t].name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* bottom-right: controls */}
          <div className="chart-bottom-controls anim-rise absolute bottom-4 right-4 z-10 hidden flex-wrap justify-end gap-2 sm:flex md:right-6" style={{ animationDelay: "0.7s" }}>
            <button className={cn("btn-ghost", view2d && "active")} disabled={!webglAvailable} onClick={() => setView2d((v) => !v)} title={webglAvailable ? "Toggle conventional 2D wheel" : "Interactive 2D chart · WebGL unavailable"}>
              {I.grid} {!webglAvailable ? "2D mode" : view2d ? "3D" : "2D"}
            </button>
            <button className="btn-ghost" onClick={() => sceneRef.current?.resetView()}>{I.cross} Re-center</button>
            <button className={cn("btn-ghost", showDisplay && "active")} onClick={() => setShowDisplay((s) => !s)}>{I.layers} Display</button>
          </div>

          {/* display popover */}
          {showDisplay && (
            <div className="anim-rise absolute bottom-40 right-2 z-20 max-h-[52vh] w-[248px] overflow-y-auto scroll-thin rounded-lg p-3.5 plate sm:bottom-16 sm:right-4 md:right-6" role="dialog" aria-label="Display settings">
              <div className="mb-2 flex items-center justify-between">
                <span className="label-caps">Atmosphere</span>
                <button onClick={() => setShowDisplay(false)} className="text-ink-500 hover:text-ink-100" aria-label="Close display settings">{I.close}</button>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {(["full", "subtle", "minimal"] as const).map((m) => (
                  <button key={m} onClick={() => setPrefs((p) => ({ ...p, atmosphere: m }))}
                    className={cn("btn-ghost justify-center !text-[10px] capitalize", prefs.atmosphere === m && "active")}>{m}</button>
                ))}
              </div>
              <div className="label-caps mb-2 mt-3">Connections</div>
              <div className="grid grid-cols-2 gap-1">
                {(["routed", "exact"] as const).map((m) => (
                  <button key={m} onClick={() => setPrefs((p) => ({ ...p, connection: m }))}
                    className={cn("btn-ghost justify-center !text-[10px] capitalize", prefs.connection === m && "active")}
                    title={m === "routed" ? "Gently curved paths that stay readable where many cross" : "Straight planet-to-planet geometry"}>
                    {m}</button>
                ))}
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-[12px] text-ink-300">
                  Aspect beams
                  <button onClick={() => setShowAspects((v) => !v)} className={cn("btn-ghost !px-2 !py-0.5 !text-[10px]", showAspects && "active")}>{showAspects ? "On" : "Off"}</button>
                </div>
                <div className="flex items-center justify-between text-[12px] text-ink-300">
                  Glyph labels
                  <button onClick={() => setShowLabels((v) => !v)} className={cn("btn-ghost !px-2 !py-0.5 !text-[10px]", showLabels && "active")}>{showLabels ? "On" : "Off"}</button>
                </div>
                <div className="flex items-center justify-between text-[12px] text-ink-300" title="Glyph: planet symbol + sign symbol. Detailed adds the planet name, sign and degree.">
                  Label detail
                  <span className="flex gap-1">
                    {(["glyph", "detailed"] as const).map((m) => (
                      <button key={m} onClick={() => setPrefs((p) => ({ ...p, labelDetail: m }))} className={cn("btn-ghost !px-2 !py-0.5 !text-[10px] capitalize", prefs.labelDetail === m && "active")}>{m}</button>
                    ))}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12px] text-ink-300">
                  Slow orbit
                  <button onClick={() => setPrefs((p) => ({ ...p, orbit: !p.orbit }))} className={cn("btn-ghost !px-2 !py-0.5 !text-[10px]", prefs.orbit && "active")}>{prefs.orbit ? "On" : "Off"}</button>
                </div>
                <div className="flex items-center justify-between text-[12px] text-ink-300" title="Calms bobbing, drift, pulse travel and auto-orbit">
                  Motion
                  <button onClick={() => setPrefs((p) => ({ ...p, motion: !p.motion }))} className={cn("btn-ghost !px-2 !py-0.5 !text-[10px]", prefs.motion && "active")}>{prefs.motion ? "Full" : "Calm"}</button>
                </div>
                <div className="flex items-center justify-between text-[12px] text-ink-300" title="Lowers render resolution on weaker devices">
                  Performance
                  <button onClick={() => setPrefs((p) => ({ ...p, lowQ: !p.lowQ }))} className={cn("btn-ghost !px-2 !py-0.5 !text-[10px]", prefs.lowQ && "active")}>{prefs.lowQ ? "Saver" : "Auto"}</button>
                </div>
                <div className="flex items-center justify-between text-[12px] text-ink-300">
                  Camera
                  <button onClick={() => { sceneRef.current?.resetView(); setShowDisplay(false); }} className="btn-ghost !px-2 !py-0.5 !text-[10px]">Re-center</button>
                </div>
              </div>
              <p className="mt-2.5 text-[10.5px] font-light leading-relaxed text-ink-500">
                Motion → Calm stills the sky for sensitive viewers. Glow stays restrained by design.
              </p>
            </div>
          )}

          {/* hint */}
          <div className="anim-fade pointer-events-none absolute bottom-[84px] left-1/2 z-10 hidden -translate-x-1/2 text-[10px] uppercase tracking-[0.22em] text-ink-500/70 lg:block" style={{ animationDelay: "1.6s" }}>
            Drag to turn the heavens · Scroll to approach · Click a planet or a beam
          </div>

          {/* Cosmic Portrait: dedicated reading mode */}
          {portraitOpen && portrait && (
            <div className="chart-restore absolute inset-0 z-40" style={{ opacity: portraitClosing ? 0 : 1, pointerEvents: portraitClosing ? "none" : "auto" }}>
              <PortraitView
                chart={chart} portrait={portrait} isDemo={isDemo}
                selection={sel} highlight={portraitHi}
                textSize={prefs.readSize} onTextSize={(n) => setPrefs((p) => ({ ...p, readSize: n }))}
                initial={progressRef.current?.fingerprint === portrait.fingerprint ? progressRef.current : null}
                onProgress={(pr) => { progressRef.current = pr; }}
                onClose={closePortrait}
                onNewChart={() => { closePortrait(); window.setTimeout(reset, 540); }}
                onPlanet={(i) => { setPortraitHi(null); applySelection({ kind: "planet", index: i }, undefined, true); }}
                onAspect={(i) => { setPortraitHi(null); applySelection({ kind: "aspect", index: i }, undefined, true); }}
                onHighlight={highlightWhy} onOpenInChart={openWhyInChart}
                onClearHighlight={() => { setPortraitHi(null); clearSelection(); }}
              />
            </div>
          )}

          {/* tooltip */}
          {hover && !view2d && (
            <div className="tip plate px-3 py-2" style={{ left: hover.x, top: hover.y }}>
              <div className="flex items-center gap-2">
                <span className="font-display text-[16px]" style={{ color: hover.p.color }}>{hover.p.glyph}</span>
                <span className="text-[12.5px] text-ink-100">{hover.p.name} in {SIGNS[hover.p.sign].name} · {hover.p.degText}
                  {hover.p.retro && <span className="text-[#ff8a70]"> R</span>}</span>
              </div>
              <div className="mt-0.5 text-[10.5px] font-light text-ink-500">House {hover.p.house} · {HOUSE_NAMES[hover.p.house - 1]}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

