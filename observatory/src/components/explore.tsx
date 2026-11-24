import { useMemo, useState } from "react";
import type { ChartData } from "../lib/astro";
import { ASPECT_MAP, HOUSE_NAMES, SIGNS } from "../lib/astro";
import { TOUR_STEPS, type Depth } from "../lib/content";
import { aspectReading } from "../lib/content";
import {
  MAJOR_FIVE, buildPatterns, concentrations, elementCounts, getBigThree,
  modalityCounts, noteworthyAspects, type Selection,
} from "../lib/model";
import { cn } from "../utils/cn";
import { G } from "./reading";

/* ================= data badge (P8) ================= */

export function DataBadge({ isDemo, note }: { isDemo: boolean; note?: string }) {
  return (
    <div className="rounded-lg border border-gold-700/25 bg-void-900/60 px-3 py-2 text-[11px] font-light leading-relaxed text-ink-500">
      {isDemo && <span className="mr-2 rounded border border-gold-400/50 bg-gold-500/10 px-1.5 py-0.5 text-[9px] font-medium tracking-[0.14em] text-gold-300">DEMONSTRATION</span>}
      Calculated positions from supplied birth data via the bundled demonstration ephemeris — not a certified production ephemeris.
      Interpretations are traditional symbolic language for reflection, not scientific measurement.
      {note && <span className="block mt-1 text-ink-500/80">{note}</span>}
    </div>
  );
}

/* ================= blueprint (P1) ================= */

function Bar({ label, count, total, color, sub }: { label: string; count: number; total: number; color: string; sub?: string }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-[11.5px]">
        <span className="tracking-[0.08em] text-ink-300">{label}</span>
        <span className="text-ink-500">{count}/{total}{sub && <span className="ml-1 opacity-70">{sub}</span>}</span>
      </div>
      <div className="h-[6px] overflow-hidden rounded-full bg-void-700">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(count / total) * 100}%`, background: color }} />
      </div>
    </div>
  );
}

export function Blueprint({ chart, onSelect, onBegin, onReadPortrait, portraitProgress }: {
  chart: ChartData;
  onSelect: (s: Selection) => void;
  onBegin: () => void;
  onReadPortrait: () => void;
  /** 0–100 when the visitor has started reading this chart's portrait */
  portraitProgress: number | null;
}) {
  const bt = getBigThree(chart);
  const sun = chart.planets[bt.sunIdx], moon = chart.planets[bt.moonIdx];
  const ascSign = bt.ascSign;
  const els = elementCounts(chart);
  const mods = modalityCounts(chart);
  const conc = concentrations(chart);
  const notable = noteworthyAspects(chart, 3);

  const big = [
    { name: "Sun", sub: "identity · self-expression", p: sun, sign: bt.sunSign, expl: "The story you tell about yourself when no one is grading it — how you naturally shine.", target: { kind: "planet", index: sun.index } as Selection },
    { name: "Moon", sub: "emotions · inner needs", p: moon, sign: bt.moonSign, expl: "Your inner weather — how feelings arrive and what safety requires.", target: { kind: "planet", index: moon.index } as Selection },
    { name: "Rising", sub: "outward approach · first impressions", p: null, sign: ascSign, expl: "The doorway of the chart — the style you lead with and how the world first meets you.", target: { kind: "house", house: 1 } as Selection },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-[20px] text-ink-100" tabIndex={-1}>Your Cosmic Blueprint</h3>
        <p className="mt-1 text-[12.5px] font-light leading-relaxed text-ink-500">
          A first glance at {chart.name}’s sky — computed from the actual chart, in plain language. Choose any card to meet that part of the wheel.
        </p>
      </div>

      <button
        onClick={onReadPortrait}
        className="group relative w-full overflow-hidden rounded-xl border border-gold-400/60 bg-gradient-to-br from-gold-500/20 via-violet-neb/10 to-void-900/60 p-4 text-left shadow-[0_10px_34px_-14px_rgba(216,169,78,0.7)] transition-all hover:border-gold-300 hover:shadow-[0_14px_40px_-12px_rgba(216,169,78,0.85)]"
      >
        <span aria-hidden="true" className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gold-400/15 blur-2xl" />
        <span className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold-400/60 bg-void-900/70 font-display text-[19px] text-gold-300">✦</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] uppercase tracking-[0.22em] text-gold-400">{portraitProgress !== null && portraitProgress > 1 ? `Resume reading · ${Math.round(portraitProgress)}%` : "A personal reading of your chart"}</span>
            <span className="mt-0.5 block font-display text-[19px] leading-tight text-ink-100">Read My Cosmic Portrait</span>
            <span className="mt-1 block text-[12px] font-light leading-relaxed text-ink-300">A deeper understanding of the sky at your birth — about 20 minutes, written from your own placements.</span>
          </span>
          <span className="mt-1 shrink-0 text-gold-300 transition-transform group-hover:translate-x-0.5" aria-hidden="true">→</span>
        </span>
      </button>

      <div className="label-caps">Your Big Three</div>
      <div className="space-y-2">
        {big.map((b) => (
          <button key={b.name} onClick={() => onSelect(b.target)}
            className="group flex w-full items-center gap-3 rounded-lg border border-gold-700/25 bg-void-900/50 p-3 text-left transition-all hover:border-gold-400/50 hover:bg-gold-500/5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-[22px]"
              style={b.p
                ? { color: b.p.color, border: `1px solid ${b.p.color}55`, background: `${b.p.color}12` }
                : { color: "#ffe3b4", border: "1px solid rgba(255,227,180,0.4)", background: "rgba(255,227,180,0.08)" }}>
              {b.p ? b.p.glyph : chart.timeKnown ? SIGNS[ascSign].glyph : "?"}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-ink-500">{b.name} · {b.sub}</span>
              <span className="block font-display text-[16px] text-ink-100">
                {!b.p && !chart.timeKnown ? "Needs your birth time" : <>{SIGNS[b.sign].name} {b.p ? `· ${b.p.degText}` : ""}</>}
              </span>
              <span className="block truncate text-[12px] font-light text-ink-500">{!b.p && !chart.timeKnown ? "The wheel shows a noon placeholder — not a finding." : b.expl}</span>
            </span>
            <span className="shrink-0 text-gold-400 opacity-0 transition-opacity group-hover:opacity-100">→</span>
          </button>
        ))}
      </div>

      <div className="label-caps">Chart at a glance</div>
      <div className="rounded-lg border border-gold-700/25 bg-void-900/50 p-3.5">
        <div className="mb-1 text-[12px] text-ink-300">
          <G term="Fire, earth, air, water" /> — <span className="text-ink-500">which languages the ten bodies speak</span>
        </div>
        <div className="space-y-2">
          {(["Fire", "Earth", "Air", "Water"] as const).map((el) => (
            <Bar key={el} label={el} count={els[el].count} total={10} sub={els[el].members.slice(0, 3).join(", ") + (els[el].members.length > 3 ? "…" : "")}
              color={el === "Fire" ? "#ff9a6a" : el === "Earth" ? "#c9a86a" : el === "Air" ? "#7fd0e8" : "#82a8ff"} />
          ))}
        </div>
        <div className="mb-1 mt-4 text-[12px] text-ink-300">
          <G term="Cardinal, fixed, mutable" /> — <span className="text-ink-500">preferred rhythm: begin, sustain, adapt</span>
        </div>
        <div className="space-y-2">
          {(["Cardinal", "Fixed", "Mutable"] as const).map((m) => (
            <Bar key={m} label={m} count={mods[m].count} total={10} color={m === "Cardinal" ? "#f2d9a2" : m === "Fixed" ? "#b79ad1" : "#5fd3b7"} />
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-gold-700/25 bg-void-900/50 p-3.5">
        <div className="label-caps mb-2">Placements · sign + house</div>
        <div className="max-h-[168px] space-y-1 overflow-y-auto scroll-thin pr-1">
          {chart.planets.map((p) => (
            <button key={p.id} onClick={() => onSelect({ kind: "planet", index: p.index })}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-[12px] hover:bg-gold-500/5">
              <span className="font-display text-[14px]" style={{ color: p.color }}>{p.glyph}</span>
              <span className="w-[62px] text-ink-100">{p.name}</span>
              <span className="flex-1 text-ink-500">{SIGNS[p.sign].name} · H{p.house} {HOUSE_NAMES[p.house - 1]}</span>
              {p.retro && <span className="text-[10px] text-[#ff8a70]">R</span>}
            </button>
          ))}
        </div>
      </div>

      {conc.length > 0 && (
        <div className="rounded-lg border border-gold-400/35 bg-gold-500/5 p-3.5">
          <div className="label-caps mb-1.5 !text-gold-300">Concentrations — rule-checked</div>
          {conc.map((c, i) => (
            <p key={i} className="text-[12.5px] font-light leading-relaxed text-ink-300">
              <span className="text-ink-100">{c.members.length} bodies in {c.label}</span> ({c.members.join(", ")}).
              <span className="text-ink-500"> Rule: 3+ of 10 sharing one {c.kind}.</span>
            </p>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-gold-700/25 bg-void-900/50 p-3.5">
        <div className="label-caps mb-2">Noteworthy aspects — tightest first</div>
        {notable.map(({ idx, asp }) => {
          const A = chart.planets[asp.a], B = chart.planets[asp.b];
          const def = ASPECT_MAP[asp.type];
          return (
            <button key={idx} onClick={() => onSelect({ kind: "aspect", index: idx })}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px] hover:bg-gold-500/5">
              <span className="h-[3px] w-6 shrink-0 rounded-full" style={{ background: def.color, boxShadow: `0 0 6px ${def.color}` }} />
              <span className="flex-1 text-ink-300">{A.name} {def.name} {B.name}</span>
              <span className="text-[11px] text-ink-500">{asp.orb.toFixed(1)}° orb</span>
            </button>
          );
        })}
      </div>

      <button className="btn-gold w-full" onClick={onBegin}>Explore my chart →</button>
      <p className="text-center text-[11px] font-light text-ink-500">A short guided tour, using your real planets — optional, replayable, skippable.</p>
    </div>
  );
}

/* ================= aspect explorer (P4) ================= */

export function AspectExplorer({ chart, selected, filter, onFilter, onSelect }: {
  chart: ChartData;
  selected: number | null;
  filter: string | null;
  onFilter: (f: string | null) => void;
  onSelect: (i: number | null) => void;
}) {
  const list = useMemo(() => chart.aspects
    .map((asp, idx) => ({ asp, idx }))
    .filter((x) => !filter || x.asp.type === filter)
    .sort((a, b) => a.asp.orb - b.asp.orb), [chart, filter]);

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-display text-[20px] text-ink-100" tabIndex={-1}>Aspect Explorer</h3>
        <p className="mt-1 text-[12.5px] font-light text-ink-500">
          Real relationships in this chart, tightest first. Choose from the list or click a beam in the sky — a pulse of light will travel the connection.
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter aspects by type">
        <button onClick={() => onFilter(null)} className={cn("btn-ghost !text-[10px]", filter === null && "active")}>All · {chart.aspects.length}</button>
        {MAJOR_FIVE.map((t) => {
          const def = ASPECT_MAP[t];
          const n = chart.aspects.filter((a) => a.type === t).length;
          return (
            <button key={t} onClick={() => onFilter(filter === t ? null : t)} className={cn("btn-ghost !text-[10px]", filter === t && "active")}>
              <span className="h-[3px] w-4 rounded-full" style={{ background: def.color }} />{def.name} · {n}
            </button>
          );
        })}
      </div>
      <div className="max-h-[300px] space-y-1 overflow-y-auto scroll-thin pr-1">
        {list.length === 0 && <p className="p-3 text-[12.5px] font-light text-ink-500">No {filter ? ASPECT_MAP[filter as keyof typeof ASPECT_MAP].name.toLowerCase() + "s" : "aspects"} in this chart — the guide below still explains the idea.</p>}
        {list.map(({ asp, idx }) => {
          const A = chart.planets[asp.a], B = chart.planets[asp.b];
          const def = ASPECT_MAP[asp.type];
          const sel = selected === idx;
          return (
            <button key={idx} onClick={() => onSelect(sel ? null : idx)}
              className={cn("flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all",
                sel ? "border-gold-400/60 bg-gold-500/10" : "border-gold-700/20 bg-void-900/50 hover:border-gold-700/50")}>
              <span className="h-[3px] w-6 shrink-0 rounded-full" style={{ background: def.color, boxShadow: `0 0 6px ${def.color}` }} />
              <span className="font-display text-[16px]" style={{ color: A.color }}>{A.glyph}</span>
              <span className="font-display text-[16px]" style={{ color: B.color }}>{B.glyph}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] text-ink-100">{A.name} {def.name} {B.name}</span>
                <span className="block text-[11px] font-light text-ink-500">{def.meaning} · orb {asp.orb.toFixed(1)}°</span>
              </span>
              {sel && <span className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-gold-300">reading ↓</span>}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <button onClick={() => onSelect(null)} className="btn-ghost w-full justify-center">Return to the full chart — nothing is lost</button>
      )}
    </div>
  );
}

/* ================= five-aspect guide ================= */

function MiniDiagram({ angle, color }: { angle: number; color: string }) {
  const cx = 34, cy = 34, r = 24;
  const rad = ((360 - angle) * Math.PI) / 180;
  const x = cx + r * Math.cos(rad), y = cy + r * Math.sin(rad);
  return (
    <svg viewBox="0 0 68 68" className="h-14 w-14 shrink-0" aria-hidden="true">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(229,193,133,0.3)" strokeWidth="1" />
      <circle cx={cx + r} cy={cy} r="3.4" fill={color} />
      <circle cx={x} cy={y} r="3.4" fill={color} />
      <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke={color} strokeWidth="1.2" />
      <line x1={cx} y1={cy} x2={x} y2={y} stroke={color} strokeWidth="1.2" />
      <text x={cx} y={cy + 9} textAnchor="middle" fontSize="7.5" fill="#ece5d3" fontFamily="Jost,sans-serif">{angle}°</text>
    </svg>
  );
}

const GUIDE_ORDER = ["conj", "sextile", "square", "trine", "opp"] as const;
const GUIDE_PLAIN: Record<string, string> = {
  conj: "Together as one — two drives fused into a single voice.",
  sextile: "A friendly opening — works when you walk through it.",
  square: "Productive friction — effort that builds skill.",
  trine: "Easy rhythm — talent that flows, sometimes unnoticed.",
  opp: "Across an axis — balance through other perspectives.",
};
const GUIDE_TRAD: Record<string, string> = {
  conj: "Tradition reads fusion as intensification: strengths compound and blind spots merge. The tightest orb in the chart is often a conjunction — weigh it first.",
  sextile: "Tradition calls it opportunity, not gift: dexterity that rewards cultivation. Distinguish it from the trine — the sextile asks for participation.",
  square: "Tradition calls it the aspect of achievement through effort. Distinguish the frustration (real) from the outcome (often competence no other aspect builds).",
  trine: "Tradition calls it the great ease: protection and talent. Distinguish gift from growth — trines show where life helps, squares show where it trains.",
  opp: "Tradition reads polarity as projection first, wisdom later: the far planet often appears in other people before it is owned. Awareness turns tug-of-war into stereoscopy.",
};

export function GuideFive({ chart, onOpenAspect }: { chart: ChartData; onOpenAspect: (i: number) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-gold-700/25 bg-void-900/50">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className="flex w-full items-center gap-2.5 p-3.5 text-left">
        <span className="font-display text-[15px] text-ink-100">Learn the five aspects</span>
        <span className="flex-1" />
        <span className="flex gap-1">{GUIDE_ORDER.map((t) => <span key={t} className="h-[3px] w-4 rounded-full" style={{ background: ASPECT_MAP[t].color }} />)}</span>
        <span className={cn("text-gold-400 transition-transform", open && "rotate-180")}>▾</span>
      </button>
      {open && (
        <div className="space-y-2.5 border-t border-gold-700/20 p-3.5">
          {GUIDE_ORDER.map((t) => {
            const def = ASPECT_MAP[t];
            const ex = chart.aspects
              .map((a, idx) => ({ a, idx }))
              .filter((x) => x.a.type === t)
              .sort((a, b) => a.a.orb - b.a.orb)[0];
            return (
              <article key={t} className="rounded-lg border border-gold-700/20 bg-void-950/50 p-3">
                <div className="flex items-center gap-3">
                  <MiniDiagram angle={def.angle} color={def.color} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-display text-[15px] text-ink-100">{def.name} · {def.angle}°</h5>
                      <span className="h-[3px] w-6 rounded-full" style={{ background: def.color, boxShadow: `0 0 6px ${def.color}` }} />
                    </div>
                    <p className="text-[12.5px] font-light text-ink-300">{GUIDE_PLAIN[t]}</p>
                  </div>
                </div>
                <p className="mt-2 text-[12px] font-light leading-relaxed text-ink-500">{GUIDE_TRAD[t]}</p>
                {ex ? (
                  <button onClick={() => onOpenAspect(ex.idx)} className="mt-2 text-[12px] text-gold-300 hover:text-gold-400">
                    Real example here: {chart.planets[ex.a.a].name} {def.name} {chart.planets[ex.a.b].name} · orb {ex.a.orb.toFixed(1)}° →
                  </button>
                ) : (
                  <p className="mt-2 text-[12px] italic text-ink-500">No {def.name.toLowerCase()} in this chart — nothing missing; the idea still counts.</p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ================= patterns (P6) ================= */

export function Patterns({ chart, onOpenAspect }: { chart: ChartData; onOpenAspect: (i: number) => void }) {
  const patterns = useMemo(() => buildPatterns(chart), [chart]);
  const tight = useMemo(() => {
    const t = [...chart.aspects].map((a, idx) => ({ a, idx }))
      .filter((x) => (MAJOR_FIVE as readonly string[]).includes(x.a.type))
      .sort((a, b) => a.a.orb - b.a.orb)[0];
    return t;
  }, [chart]);
  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-display text-[20px] text-ink-100" tabIndex={-1}>Patterns &amp; Connections</h3>
        <p className="mt-1 text-[12.5px] font-light leading-relaxed text-ink-500">
          How the pieces relate — every pattern below states the rule that produced it. Symbolic frameworks for reflection, not verdicts.
        </p>
      </div>
      {patterns.length === 0 && (
        <p className="rounded-lg border border-gold-700/25 bg-void-900/50 p-3.5 text-[12.5px] font-light text-ink-500">
          No rule met its threshold here — a genuinely even spread. That itself is the pattern: no single register dominates.
        </p>
      )}
      {patterns.map((p) => (
        <article key={p.id} className="rounded-lg border border-gold-700/25 bg-void-900/50 p-3.5">
          <div className="flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full",
              p.tone === "balance" ? "bg-[#7fd0e8]" : p.tone === "focus" ? "bg-gold-400" : "bg-[#f2a3b5]")} />
            <h4 className="font-display text-[15px] text-ink-100">{p.title}</h4>
          </div>
          <p className="mt-1.5 text-[12.5px] font-light leading-relaxed text-ink-300">{p.body}</p>
          <p className="mt-1.5 border-t border-gold-700/20 pt-1.5 text-[10.5px] font-light tracking-wide text-ink-500">RULE · {p.rule}</p>
          {p.id === "tightest" && tight && (
            <button onClick={() => onOpenAspect(tight.idx)} className="mt-1.5 text-[12px] text-gold-300 hover:text-gold-400">
              Open {chart.planets[tight.a.a].name}–{chart.planets[tight.a.b].name} in the explorer →
            </button>
          )}
        </article>
      ))}
    </div>
  );
}

/* ================= tour (P2) ================= */

export function TourPanel({ chart, step, done, onNext, onBack, onSkip, onExit }: {
  chart: ChartData;
  step: number;
  done: boolean;
  onNext: () => void; onBack: () => void; onSkip: () => void; onExit: () => void;
}) {
  const s = TOUR_STEPS[Math.min(step, TOUR_STEPS.length - 1)];
  const bt = getBigThree(chart);
  const hint = s.target === "sun" ? `${chart.planets[0].name} ${SIGNS[bt.sunSign].glyph} ${chart.planets[0].degText} — watch it glow`
    : s.target === "moon" ? `${chart.planets[1].name} ${SIGNS[bt.moonSign].glyph} ${chart.planets[1].degText} — watch it glow`
    : s.target === "asc" ? `ASC in ${SIGNS[bt.ascSign].name} — the bright horizon marker`
    : s.target === "aspect" ? (() => {
        const t = [...chart.aspects].map((a, idx) => ({ a, idx }))
          .filter((x) => (MAJOR_FIVE as readonly string[]).includes(x.a.type))
          .sort((a, b) => a.a.orb - b.a.orb)[0];
        if (!t) return "Your wheel, whole and glowing";
        const r = aspectReading(chart, t.idx);
        return `${r.aName} ${r.typeName} ${r.bName} · orb ${r.orb.toFixed(1)}° — follow the pulse`;
      })()
    : "Your wheel, whole and glowing";
  return (
    <div className="rounded-lg border border-gold-400/45 bg-void-900/85 p-4 shadow-2xl" role="dialog" aria-live="polite" aria-label={`Guided tour step ${step + 1} of ${TOUR_STEPS.length}`}>
      <div className="mb-1 flex items-center justify-between">
        <span className="label-caps !text-gold-300">Guided tour · {step + 1} of {TOUR_STEPS.length}</span>
        <div className="flex gap-0.5" aria-hidden="true">
          {TOUR_STEPS.map((_, i) => (
            <span key={i} className={cn("h-1 w-4 rounded-full", i <= step ? "bg-gold-400" : "bg-void-700")} />
          ))}
        </div>
      </div>
      <h3 className="font-display text-[18px] text-ink-100">{s.title}</h3>
      <p className="mt-1.5 text-[13px] font-light leading-relaxed text-ink-300">{s.body}</p>
      <p className="mt-2 rounded-md border border-gold-700/25 bg-void-950/60 px-2.5 py-1.5 text-[12px] text-gold-300">✦ In your sky: {hint}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button onClick={onBack} disabled={step === 0} className="btn-ghost disabled:opacity-40">← Back</button>
        <button onClick={onNext} className="btn-gold !px-5 !py-2">{step === TOUR_STEPS.length - 1 ? "Finish tour" : s.cta + " →"}</button>
        <span className="flex-1" />
        <button onClick={onSkip} className="text-[11px] uppercase tracking-[0.14em] text-ink-500 hover:text-ink-100">Skip</button>
        <button onClick={onExit} className="text-[11px] uppercase tracking-[0.14em] text-ink-500 hover:text-ink-100" aria-label="Exit tour">Exit ✕</button>
      </div>
      {done && <p className="mt-2 text-[11px] font-light text-ink-500">You have completed this tour before — welcome back. Replay anytime.</p>}
    </div>
  );
}

export type { Depth };
