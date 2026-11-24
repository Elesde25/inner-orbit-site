import { Reflection, journalChartSource } from "./Journal";
import { useRef, useState } from "react";
import type { ChartData } from "../lib/astro";
import { ASPECT_MAP, HOUSE_NAMES, SIGNS } from "../lib/astro";
import type { Depth } from "../lib/content";
import { GLOSSARY, aspectReading, houseReading, planetReading, signReading } from "../lib/content";
import type { Selection } from "../lib/model";
import { cn } from "../utils/cn";

/* ---------------- depth toggle ---------------- */

export function DepthToggle({ depth, onChange }: { depth: Depth; onChange: (d: Depth) => void }) {
  return (
    <div className="flex rounded-lg border border-gold-700/30 bg-void-900/60 p-0.5 text-[11px]" role="tablist" aria-label="Reading depth">
      {(["discover", "deep"] as Depth[]).map((d) => (
        <button
          key={d}
          role="tab"
          aria-selected={depth === d}
          onClick={() => onChange(d)}
          className={cn(
            "flex-1 rounded-md px-3 py-1.5 tracking-[0.08em] transition-all",
            depth === d ? "bg-gold-500/90 font-medium text-void-950" : "text-ink-500 hover:text-ink-100"
          )}
        >
          {d === "discover" ? "Discover" : "Explore in Depth"}
        </button>
      ))}
    </div>
  );
}

/* ---------------- glossary ---------------- */

export function G({ term, value }: { term: string; value?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const entry = GLOSSARY[term];
  if (!entry) return <span>{term}</span>;
  return (
    <span className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        onBlur={(e) => { if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) setOpen(false); }}
        className="border-b border-dotted border-gold-400/70 text-gold-300 hover:text-gold-400"
        aria-expanded={open}
        aria-label={`${term}: ${entry.short}`}
      >
        {term}
        <span className="ml-0.5 inline-flex h-3.5 w-3.5 translate-y-[2px] items-center justify-center rounded-full border border-gold-400/50 text-[9px] text-gold-400">?</span>
      </button>
      {open && (
        <span className="absolute bottom-full left-1/2 z-50 mb-2 w-60 -translate-x-1/2 rounded-lg border border-gold-700/40 bg-void-800 p-3 text-left shadow-2xl anim-fade" role="tooltip">
          <span className="block font-display text-[13px] text-ink-100">{term}</span>
          <span className="mt-1 block text-[12px] font-light leading-relaxed text-ink-300">{entry.short}</span>
          <details className="mt-1.5">
            <summary className="cursor-pointer text-[11px] tracking-wide text-gold-400">Go deeper</summary>
            <span className="mt-1 block text-[11.5px] font-light leading-relaxed text-ink-500">{entry.deeper}</span>
          </details>
          {value && <span className="mt-1.5 block border-t border-gold-700/25 pt-1.5 text-[11px] text-gold-300">Here: {value}</span>}
          <button onClick={() => setOpen(false)} className="mt-2 text-[10px] uppercase tracking-[0.14em] text-ink-500 hover:text-ink-100">Close</button>
        </span>
      )}
    </span>
  );
}

/* ---------------- numbered card ---------------- */

export function Card({ n, title, children, accent }: { n: number; title: string; children: React.ReactNode; accent?: string }) {
  return (
    <section className="rounded-lg border border-gold-700/25 bg-void-900/50 p-4">
      <div className="mb-2 flex items-center gap-2.5">
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-display text-[12px]"
          style={{ color: accent ?? "#e5c185", border: `1px solid ${accent ?? "#e5c185"}66`, background: `${accent ?? "#e5c185"}14` }}
        >
          {n}
        </span>
        <h4 className="font-display text-[14px] tracking-wide text-ink-100">{title}</h4>
      </div>
      <div className="text-[13px] font-light leading-relaxed text-ink-300">{children}</div>
    </section>
  );
}

/* ---------------- history ---------------- */

export function HistoryBar({ trail, onBack, onItem }: {
  trail: Selection[];
  onBack: () => void;
  onItem: (s: Selection) => void;
}) {
  if (trail.length === 0) return null;
  const label = (s: Selection): string => {
    if (s.kind === "planet") return `Planet`;
    if (s.kind === "aspect") return `Aspect`;
    if (s.kind === "house") return `House ${s.house}`;
    if (s.kind === "sign") return `Sign`;
    return "Blueprint";
  };
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <button onClick={onBack} className="btn-ghost !px-2 !py-1" aria-label="Back to previous selection">← Back</button>
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto scroll-thin">
        {trail.slice(-4).map((s, i, arr) => (
          <span key={i} className="flex shrink-0 items-center gap-1">
            {i > 0 && <span className="text-ink-500">·</span>}
            <button
              onClick={() => onItem(s)}
              className={cn("rounded px-1 py-0.5 hover:bg-gold-500/10", i === arr.length - 1 ? "text-gold-300" : "text-ink-500")}
            >
              {label(s)}
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- planet reading ---------------- */

export function PlanetReadingView({ chart, index, depth, onAspect, onHouse, onSign }: {
  chart: ChartData; index: number; depth: Depth;
  onAspect: (i: number) => void; onHouse: (h: number) => void; onSign: (s: number) => void;
}) {
  const r = planetReading(chart, index);
  const p = chart.planets[index];
  const h = houseReading(p.house);
  const s = signReading(p.sign);
  const deep = depth === "deep";
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full font-display text-[24px]"
          style={{ color: r.color, border: `1px solid ${r.color}66`, background: `${r.color}16`, textShadow: `0 0 16px ${r.color}` }}>
          {r.glyph}
        </span>
        <div>
          <h3 className="font-display text-[20px] text-ink-100" tabIndex={-1}>{r.planet} in {r.signName}</h3>
          <p className="text-[12px] font-light text-ink-500">
            {r.signGlyph} {r.degree} · House {r.house} · {r.houseTheme}{r.retro && <span className="text-[#ff8a70]"> · <G term="Retrograde" /></span>}
          </p>
        </div>
      </div>

      <Card n={1} title="The Planet" accent={r.color}>
        {deep ? r.deep : <><strong className="font-medium text-ink-100">{r.planet}</strong> — {r.planet === "Sun" ? "the story of who you are becoming" : r.planet === "Moon" ? "your inner weather and what safety requires" : `your ${PLANET_ROLE_SHORT[p.id] ?? "part of the whole"}`}. <G term={planetTerm(p.id)} /> in plain terms: {firstSentence(r.discover)}</>}
      </Card>
      <Card n={2} title={`The Sign — ${r.signName}`} accent={r.color}>
        {deep ? s.deep : s.discover}
        <div className="mt-2">
          <button onClick={() => onSign(p.sign)} className="btn-ghost !text-[10px]">Learn about {r.signName} {r.signGlyph}</button>
        </div>
      </Card>
      <Card n={3} title={`The House — ${r.house} · ${r.houseTheme}`} accent={r.color}>
        {deep ? h.deep : h.discover}{" "}
        <G term="House cusp" value={`${SIGNS[Math.floor(chart.cusps[p.house - 1] / 30)].name} ${chart.cusps[p.house - 1].toFixed(1)}°`} />
        <div className="mt-2">
          <button onClick={() => onHouse(p.house)} className="btn-ghost !text-[10px]">Explore House {p.house}</button>
        </div>
      </Card>
      <Card n={4} title="Putting It Together" accent={r.color}>{deep ? r.togetherDeep : r.togetherDiscover}</Card>
      <Card n={5} title="Your Connections" accent={r.color}>
        {p.aspects.length === 0 ? (
          <span>No major aspects touch {r.planet} in this chart — traditionally read as a planet that acts in its own lane, for better and quieter.</span>
        ) : (
          <span className="space-y-1.5">
            {p.aspects.map((a, i) => {
              const other = chart.planets[a.otherIndex];
              const def = ASPECT_MAP[a.type];
              const ai = chart.aspects.findIndex((x) =>
                (x.a === index && x.b === a.otherIndex) || (x.b === index && x.a === a.otherIndex));
              return (
                <button key={i} onClick={() => onAspect(ai)}
                  className="flex w-full items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-left hover:border-gold-700/40 hover:bg-gold-500/5">
                  <span className="h-[3px] w-5 shrink-0 rounded-full" style={{ background: def.color, boxShadow: `0 0 6px ${def.color}` }} />
                  <span className="font-display text-[14px]" style={{ color: other.color }}>{other.glyph}</span>
                  <span className="flex-1">{other.name} · {def.name}</span>
                  <span className="text-[11px] text-ink-500">{a.orb.toFixed(1)}° <G term="Orb" /></span>
                </button>
              );
            })}
          </span>
        )}
      </Card>
      <Card n={6} title="A Moment of Reflection" accent={r.color}>
        <Reflection key={p.id + chart.utcMs} question={PLANET_REFLECT[p.id]} context={`${journalChartSource(chart)} · ${chart.name} · ${p.name} · ${chart.dateLabel}`} />
      </Card>
    </div>
  );
}

const PLANET_ROLE_SHORT: Record<string, string> = {
  mercury: "way of thinking and exchanging ideas", venus: "way of loving and valuing",
  mars: "way of pursuing and asserting", jupiter: "way of growing and trusting",
  saturn: "way of building and enduring", uranus: "need for freedom and originality",
  neptune: "relationship with dreams and ideals", pluto: "relationship with depth and change",
};

const PLANET_REFLECT: Record<string, string> = {
  sun: "When do you feel most unmistakably yourself — and what were you doing?",
  moon: "What reliably restores you when you are frayed — and do you let yourself have it?",
  mercury: "How do you think best — talking it out, writing it down, or walking it off?",
  venus: "What do you find beautiful even on an ordinary day?",
  mars: "What is worth fighting for right now — and what would fighting well look like?",
  jupiter: "Where is life currently inviting you to think bigger?",
  saturn: "What slow thing in your life deserves more respect?",
  uranus: "Where do you feel most alive when you improvise?",
  neptune: "What are you romanticizing — and what is lovely about it anyway?",
  pluto: "What are you outgrowing, even if letting go feels early?",
};

function planetTerm(id: string): string {
  return id === "sun" || id === "moon" ? "Ecliptic longitude" : "Ecliptic longitude";
}

function firstSentence(t: string): string {
  const i = t.indexOf(". ");
  return i > 0 ? t.slice(0, i + 1) : t;
}

/* ---------------- aspect reading ---------------- */

export function AspectReadingView({ chart, aspectIdx, depth, onPlanet }: {
  chart: ChartData; aspectIdx: number; depth: Depth; onPlanet: (i: number) => void;
}) {
  const r = aspectReading(chart, aspectIdx);
  const deep = depth === "deep";
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full font-display text-[20px]" style={{ color: r.aColor, border: `1px solid ${r.aColor}66`, background: `${r.aColor}14` }}>{r.aGlyph}</span>
        <span className="h-[3px] w-10 rounded-full" style={{ background: r.color, boxShadow: `0 0 8px ${r.color}` }} />
        <span className="flex h-11 w-11 items-center justify-center rounded-full font-display text-[20px]" style={{ color: r.bColor, border: `1px solid ${r.bColor}66`, background: `${r.bColor}14` }}>{r.bGlyph}</span>
        <div>
          <h3 className="font-display text-[19px] leading-tight text-ink-100" tabIndex={-1}>{r.aName} {r.typeName} {r.bName}</h3>
          <p className="text-[12px] font-light text-ink-500">{r.tone} · orb {r.orb.toFixed(1)}°</p>
        </div>
      </div>

      <div className="rounded-lg border border-gold-700/30 bg-void-900/60 p-3">
        <div className="label-caps mb-2">The geometry — measured, not assumed</div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div><div className="label-caps !text-[9px]">Nominal</div><div className="font-display text-[16px] text-ink-100">{r.nominal}°</div></div>
          <div><div className="label-caps !text-[9px]">Actual</div><div className="font-display text-[16px] text-gold-300">{r.actual.toFixed(1)}°</div></div>
          <div><div className="label-caps !text-[9px]"><G term="Orb" /></div><div className="font-display text-[16px] text-ink-100">{r.orb.toFixed(1)}°</div></div>
        </div>
        <p className="mt-2 text-[11.5px] font-light leading-relaxed text-ink-500">
          Two planets form a {r.typeName.toLowerCase()} when they stand about {r.nominal}° apart. Here they stand {r.actual.toFixed(1)}° apart — {r.orb.toFixed(1)}° from exact.
          Smaller <G term="Orb" /> means a louder conversation.
        </p>
      </div>

      <Card n={1} title={`${r.aName} — ${r.aRole.split("—")[0].trim()}`} accent={r.aColor}>{r.aRole}</Card>
      <Card n={2} title={`${r.bName} — ${r.bRole.split("—")[0].trim()}`} accent={r.bColor}>{r.bRole}</Card>
      <Card n={3} title={`The ${r.typeName}`} accent={r.color}>
        {deep ? r.deep : r.discover}{" "}
        <G term={r.typeName === "Conjunction" ? "Conjunction" : r.typeName === "Opposition" ? "Opposition" : r.typeName === "Square" ? "Square" : r.typeName === "Trine" ? "Trine" : "Sextile"} />
      </Card>
      <Card n={4} title="A Moment of Reflection" accent={r.color}><Reflection key={aspectIdx + ":" + chart.utcMs} question={r.reflection} context={`${journalChartSource(chart)} · ${chart.name} · ${r.aName} ${r.typeName} ${r.bName}`} /></Card>

      <div className="flex gap-2">
        <button className="btn-ghost flex-1 justify-center" onClick={() => onPlanet(chart.planets.find((p) => p.name === r.aName)!.index)}>
          <span className="font-display" style={{ color: r.aColor }}>{r.aGlyph}</span> {r.aName}’s reading
        </button>
        <button className="btn-ghost flex-1 justify-center" onClick={() => onPlanet(chart.planets.find((p) => p.name === r.bName)!.index)}>
          <span className="font-display" style={{ color: r.bColor }}>{r.bGlyph}</span> {r.bName}’s reading
        </button>
      </div>
    </div>
  );
}

/* ---------------- house / sign reading ---------------- */

export function HouseReadingView({ chart, house, depth, onPlanet }: {
  chart: ChartData; house: number; depth: Depth; onPlanet: (i: number) => void;
}) {
  const h = houseReading(house);
  const deep = depth === "deep";
  const residents = chart.planets.filter((p) => p.house === house);
  const cuspSign = Math.floor(chart.cusps[house - 1] / 30);
  return (
    <div className="space-y-3">
      <h3 className="font-display text-[20px] text-ink-100" tabIndex={-1}>House {house} · {h.theme}</h3>
      <p className="text-[12px] font-light text-ink-500">
        Cusp in {SIGNS[cuspSign].name} {SIGNS[cuspSign].glyph} · {HOUSE_NAMES[house - 1]} house · <G term="House cusp" />
      </p>
      <Card n={1} title="This area of life" accent="#e5c185">{deep ? h.deep : h.discover}</Card>
      <Card n={2} title="Who lives here" accent="#e5c185">
        {residents.length === 0
          ? "No planets reside here — traditionally read as a quieter room, activated when transiting planets visit, not an empty life-area."
          : residents.map((p) => (
            <button key={p.id} onClick={() => onPlanet(p.index)} className="mr-2 mt-1 inline-flex items-center gap-1.5 rounded-full border border-gold-700/30 px-2.5 py-1 text-[12px] hover:bg-gold-500/10">
              <span className="font-display" style={{ color: p.color }}>{p.glyph}</span> {p.name}
            </button>
          ))}
      </Card>
    </div>
  );
}

export function SignReadingView({ sign, depth, chart, onPlanet }: {
  sign: number; depth: Depth; chart: ChartData; onPlanet: (i: number) => void;
}) {
  const s = signReading(sign);
  const deep = depth === "deep";
  const residents = chart.planets.filter((p) => p.sign === sign);
  return (
    <div className="space-y-3">
      <h3 className="font-display text-[20px] text-ink-100" tabIndex={-1}>{s.glyph} {s.name}</h3>
      <p className="text-[12px] font-light text-ink-500">{s.element} · {s.modality} · ruled by {SIGNS[sign].ruler}</p>
      <Card n={1} title="How this sign colors a planet" accent="#e5c185">{deep ? s.deep : s.discover}</Card>
      <Card n={2} title="Planets speaking here" accent="#e5c185">
        {residents.length === 0 ? "None of the ten bodies stand here in this chart." : residents.map((p) => (
          <button key={p.id} onClick={() => onPlanet(p.index)} className="mr-2 mt-1 inline-flex items-center gap-1.5 rounded-full border border-gold-700/30 px-2.5 py-1 text-[12px] hover:bg-gold-500/10">
            <span className="font-display" style={{ color: p.color }}>{p.glyph}</span> {p.name} · H{p.house}
          </button>
        ))}
      </Card>
    </div>
  );
}
