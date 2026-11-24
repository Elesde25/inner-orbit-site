import { Reflection } from "./Journal";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ChartData } from "../lib/astro";
import { ASPECT_MAP, HOUSE_NAMES, SIGNS } from "../lib/astro";
import type { Selection } from "../lib/model";
import type { CosmicPortrait, PortraitBlock, PortraitChapter, WhyRef } from "../lib/portrait/types";
import { cn } from "../utils/cn";
import Chart2D from "./Chart2D";

/* ------------------------------------------------------------------ */

export const READ_SIZES = [16, 17.5, 19, 21, 23];

export interface PortraitProgress {
  fingerprint: string;
  scrollTop: number;
  pct: number;
  chapterId: string;
  read: string[];
}

/** which chapter discusses each body (for "where is this in my reading?") */
const CHAPTER_OF: Record<string, string> = {
  sun: "sun", moon: "moon", mercury: "mercury", venus: "venus", mars: "mars",
  jupiter: "jupsat", saturn: "jupsat", uranus: "outer", neptune: "outer", pluto: "outer",
};

function useMedia(q: string) {
  const [m, setM] = useState(() => (typeof window !== "undefined" ? window.matchMedia(q).matches : false));
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, [q]);
  return m;
}

const prefersReduced = () => {
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; }
};

/* ------------------------------ ornaments ------------------------------ */

function Ornament({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 24" className={cn("mx-auto h-5 w-[180px] text-gold-400/70", className)} fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
      <path d="M4 12h78M138 12h78" opacity="0.55" />
      <circle cx="110" cy="12" r="4.2" />
      <ellipse cx="110" cy="12" rx="14" ry="5.4" transform="rotate(-24 110 12)" opacity="0.7" />
      <circle cx="123" cy="7.6" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="94" cy="12" r="1" fill="currentColor" stroke="none" opacity="0.6" />
      <circle cx="86" cy="12" r="0.7" fill="currentColor" stroke="none" opacity="0.5" />
      <circle cx="134" cy="12" r="0.7" fill="currentColor" stroke="none" opacity="0.5" />
    </svg>
  );
}

/* ------------------------------ Show Me Why ------------------------------ */

function FirmBadge({ firmness }: { firmness: WhyRef["firmness"] }) {
  const t = firmness === "firm" ? ["Calculated", "border-trine/40 text-trine bg-trine/10"] : firmness === "approximate" ? ["Approximate", "border-gold-400/50 text-gold-300 bg-gold-500/10"] : ["Needs birth time", "border-square/50 text-square bg-square/10"];
  return <span className={cn("rounded border px-1.5 py-0.5 text-[9.5px] font-medium uppercase tracking-[0.14em]", t[1])}>{t[0]}</span>;
}

function WhyCard({ why, onHighlight, onOpen }: { why: WhyRef; onHighlight: (w: WhyRef) => void; onOpen: (w: WhyRef) => void }) {
  return (
    <div className="why-card">
      <div className="flex flex-wrap items-center gap-2">
        {why.glyph && <span className="font-display text-[17px]" style={{ color: why.color }}>{why.glyph}</span>}
        <span className="font-display text-[15px] text-ink-100">{why.title}</span>
        <FirmBadge firmness={why.firmness} />
      </div>
      <dl className="mt-2.5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        {why.facts.map((f) => (
          <div key={f.label} className="contents">
            <dt className="text-[10.5px] uppercase tracking-[0.14em] text-ink-500">{f.label}</dt>
            <dd className="text-ink-100">{f.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2.5 border-t border-gold-700/25 pt-2.5 font-light text-ink-300">
        <span className="text-gold-400">Traditional association · </span>{why.tradition}
      </p>
      {why.caveat && <p className="mt-2 rounded-md border border-gold-400/30 bg-gold-500/5 px-2.5 py-1.5 text-[12.5px] italic text-gold-300">{why.caveat}</p>}
      {(why.selection || why.spotlight) && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-ghost !min-h-[40px]" onClick={() => onHighlight(why)}>◎ Highlight on chart</button>
          <button className="btn-ghost !min-h-[40px]" onClick={() => onOpen(why)}>↗ Open in 3D chart</button>
        </div>
      )}
    </div>
  );
}

function BlockView({ b, first, whys, open, toggle, onHighlight, onOpen, context }: {
  context: string; b: PortraitBlock; first: boolean; whys: Record<string, WhyRef>; open: boolean; toggle: () => void;
  onHighlight: (w: WhyRef) => void; onOpen: (w: WhyRef) => void;
}) {
  const refs = (b.why ?? []).map((id) => whys[id]).filter(Boolean);
  const WhyBlock = refs.length > 0 && (
    <div>
      <button className="why-btn" onClick={toggle} aria-expanded={open}>
        <span className="why-dot" aria-hidden="true" />
        {open ? "Hide the basis" : "Show me why"}
        <span className="normal-case tracking-normal opacity-60">· {refs.length} {refs.length === 1 ? "source" : "sources"}</span>
      </button>
      {open && (
        <div className="mt-2 space-y-2.5">
          {refs.map((w) => <WhyCard key={w.id} why={w} onHighlight={onHighlight} onOpen={onOpen} />)}
        </div>
      )}
    </div>
  );
  if (b.type === "lead") return <div className="rp-block"><p className="rp-lead rp-drop">{b.text}</p></div>;
  if (b.type === "note") return <div className="rp-block"><p className="rp-note">{b.text}</p>{WhyBlock}</div>;
  if (b.type === "pull") return <p className="rp-pull">“{b.text}”</p>;
  if (b.type === "questions") {
    return (
      <div className="rp-block">
        <h3 className="font-display text-[1.15em] text-gold-300">{b.text}</h3>
        <ol className="mt-3 space-y-3.5 pl-0">
          {(b.items ?? []).map((q, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-[0.28em] flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold-400/50 font-display text-[13px] text-gold-300" aria-hidden="true">{i + 1}</span>
              <div className="min-w-0 flex-1"><Reflection question={q} context={context} /></div>
            </li>
          ))}
        </ol>
      </div>
    );
  }
  if (b.type === "list") {
    return (
      <div className="rp-block">
        <p className="text-[0.82em] uppercase tracking-[0.18em] text-gold-400" style={{ fontFamily: "var(--font-body)" }}>{b.text}</p>
        <ul className="mt-2 space-y-2.5 pl-0">
          {(b.items ?? []).map((q, i) => (
            <li key={i} className="flex gap-3"><span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400/80" aria-hidden="true" /><span>{q}</span></li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div className="rp-block">
      <p className={first ? "rp-drop" : undefined}>{b.text}</p>
      {WhyBlock}
    </div>
  );
}

/* ------------------------------ the reading mode ------------------------------ */

export interface PortraitViewProps {
  chart: ChartData;
  portrait: CosmicPortrait;
  isDemo: boolean;
  selection: Selection;
  highlight: { planets: number[]; aspects: number[] } | null;
  textSize: number;
  onTextSize: (n: number) => void;
  initial: PortraitProgress | null;
  onProgress: (p: PortraitProgress) => void;
  onClose: () => void;
  onNewChart: () => void;
  onPlanet: (i: number) => void;
  onAspect: (i: number) => void;
  onHighlight: (w: WhyRef) => void;
  onOpenInChart: (w: WhyRef) => void;
  onClearHighlight: () => void;
}

export default function PortraitView(p: PortraitViewProps) {
  const { chart, portrait } = p;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(p.initial?.pct ?? 0);
  const [active, setActive] = useState(p.initial?.chapterId ?? "opening");
  const [read, setRead] = useState<string[]>(p.initial?.read ?? []);
  const [tocOpen, setTocOpen] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);
  const [sideChart, setSideChart] = useState(true);
  const [openWhy, setOpenWhy] = useState<Record<string, boolean>>({});
  const [resumed, setResumed] = useState<PortraitProgress | null>(p.initial && p.initial.scrollTop > 80 ? p.initial : null);
  const xl = useMedia("(min-width: 1280px)");
  const lg = useMedia("(min-width: 1024px)");
  const raf = useRef(0);
  const readRef = useRef(read);
  readRef.current = read;

  const chapters = portrait.chapters;
  const activeIdx = Math.max(0, chapters.findIndex((c) => c.id === active));

  /* restore position (resume reading) */
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el && p.initial && p.initial.scrollTop > 0) el.scrollTop = p.initial.scrollTop;
    el?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = Math.max(1, el.scrollHeight - el.clientHeight);
    const np = Math.min(100, Math.max(0, (el.scrollTop / max) * 100));
    const top = el.getBoundingClientRect().top;
    let cur = chapters[0].id;
    const done: string[] = [];
    for (const c of chapters) {
      const sec = el.querySelector<HTMLElement>(`[data-ch="${c.id}"]`);
      if (!sec) continue;
      const r = sec.getBoundingClientRect();
      if (r.top - top <= 120) cur = c.id;
      if (r.bottom - top <= el.clientHeight + 40) done.push(c.id);
    }
    setPct(np);
    setActive(cur);
    const merged = [...new Set([...readRef.current, ...done])];
    if (merged.length !== readRef.current.length) setRead(merged);
    p.onProgress({ fingerprint: portrait.fingerprint, scrollTop: el.scrollTop, pct: np, chapterId: cur, read: merged });
  }, [chapters, portrait.fingerprint, p]);

  const onScroll = () => {
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => { raf.current = 0; measure(); });
  };
  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);
  useEffect(() => { measure(); }, [p.textSize]); // eslint-disable-line react-hooks/exhaustive-deps

  const jump = useCallback((id: string) => {
    const el = scrollRef.current;
    const sec = el?.querySelector<HTMLElement>(`[data-ch="${id}"]`);
    if (!el || !sec) return;
    const y = sec.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop - 12;
    el.scrollTo({ top: y, behavior: prefersReduced() ? "auto" : "smooth" });
    setTocOpen(false);
    setResumed(null);
  }, []);

  /* keyboard: Esc returns to the chart (closes drawers first) */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (tocOpen) setTocOpen(false);
      else if (chartOpen) setChartOpen(false);
      else p.onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tocOpen, chartOpen, p]);

  const highlightWhy = (w: WhyRef) => {
    p.onHighlight(w);
    if (!(xl && sideChart)) setChartOpen(true);
  };

  const sel = p.selection;
  const selInfo = useMemo(() => {
    if (sel.kind === "planet") {
      const pl = chart.planets[sel.index];
      return { title: `${pl.glyph} ${pl.name} in ${SIGNS[pl.sign].name}`, sub: `${pl.degText}${chart.timeKnown ? ` · House ${pl.house} · ${HOUSE_NAMES[pl.house - 1]}` : ""}${pl.retro ? " · retrograde" : ""}`, color: pl.color, chapter: CHAPTER_OF[pl.id] };
    }
    if (sel.kind === "aspect") {
      const a = chart.aspects[sel.index];
      return { title: `${chart.planets[a.a].name} ${ASPECT_MAP[a.type].name.toLowerCase()} ${chart.planets[a.b].name}`, sub: `orb ${a.orb.toFixed(1)}°`, color: ASPECT_MAP[a.type].color, chapter: CHAPTER_OF[chart.planets[a.a].id] };
    }
    if (sel.kind === "house") return { title: `House ${sel.house} · ${HOUSE_NAMES[sel.house - 1]}`, sub: chart.timeKnown ? "" : "approximate — birth time unknown", color: "#e5c185", chapter: sel.house === 1 ? "rising" : undefined };
    return null;
  }, [sel, chart]);

  const size = READ_SIZES[Math.min(READ_SIZES.length - 1, Math.max(0, p.textSize))];
  const showSide = xl && sideChart;

  const Toc = (
    <nav aria-label="Chapters" className="space-y-0.5">
      {chapters.map((c) => {
        const on = c.id === active;
        const done = read.includes(c.id) && !on;
        return (
          <button key={c.id} onClick={() => jump(c.id)} aria-current={on ? "true" : undefined}
            className={cn("group flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors", on ? "bg-gold-500/12" : "hover:bg-gold-500/6")}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-display text-[13px]"
              style={{ color: on ? "#14100a" : c.color, background: on ? c.color : `${c.color}12`, borderColor: `${c.color}66` }}>
              {done ? "✓" : c.number ?? "✦"}
            </span>
            <span className="min-w-0 flex-1">
              <span className={cn("block text-[13px] leading-snug", on ? "text-gold-300" : "text-ink-100")}>{c.title.replace(/^Your /, "").replace(/^./, (ch) => ch.toUpperCase())}</span>
              <span className="block truncate text-[10.5px] font-light text-ink-500">{c.blurb}</span>
            </span>
          </button>
        );
      })}
    </nav>
  );

  const SideChart = (
    <div className="space-y-3">
      <div className="h-[min(46vh,400px)]">
        <Chart2D chart={chart} selection={sel} compact highlight={p.highlight} onPlanet={p.onPlanet} onAspect={p.onAspect} />
      </div>
      {selInfo ? (
        <div className="plate rounded-lg p-3.5">
          <div className="font-display text-[15px]" style={{ color: selInfo.color }}>{selInfo.title}</div>
          {selInfo.sub && <div className="mt-0.5 text-[11.5px] text-ink-500">{selInfo.sub}</div>}
          <div className="mt-2.5 flex flex-wrap gap-2">
            {selInfo.chapter && <button className="btn-ghost !min-h-[38px]" onClick={() => { jump(selInfo.chapter!); setChartOpen(false); }}>↓ Where it’s discussed</button>}
            <button className="btn-ghost !min-h-[38px]" onClick={p.onClearHighlight}>Clear</button>
          </div>
        </div>
      ) : (
        <p className="px-1 text-[11.5px] font-light leading-relaxed text-ink-500">Tap a planet or a line on the wheel to find where your reading discusses it. “Show me why” links in the text light things up here.</p>
      )}
    </div>
  );

  return (
    <div className="portrait-root portrait-fade absolute inset-0 z-40 flex flex-col font-body" role="dialog" aria-label="Your Cosmic Portrait">
      {/* top bar */}
      <header className="relative z-10 flex shrink-0 items-center gap-2 border-b border-gold-700/25 bg-void-950/85 px-3 py-2 backdrop-blur-md sm:gap-3 sm:px-5">
        <button onClick={p.onClose} className="btn-ghost !min-h-[44px] shrink-0" aria-label="Return to chart"><span aria-hidden="true">←</span><span className="hidden sm:inline">Return to chart</span><span className="sm:hidden">Chart</span></button>
        <div className="min-w-0 flex-1 text-center">
          <div className="hidden truncate font-display text-[14px] tracking-[0.12em] text-ink-100 sm:block sm:text-[15px]">YOUR COSMIC PORTRAIT</div>
          <div className="truncate text-[11px] leading-tight tracking-[0.06em] text-ink-300 sm:text-[10.5px] sm:tracking-[0.12em] sm:text-ink-500">
            {activeIdx === 0 ? "Opening" : `Ch. ${chapters[activeIdx].number}/${chapters.length - 1}`} · {Math.round(pct)}%<span className="hidden sm:inline"> read</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="flex items-center rounded-lg border border-gold-700/30 bg-void-900/60" role="group" aria-label="Text size">
            <button className="min-h-[44px] min-w-[40px] rounded-l-lg px-2 font-display text-[13px] text-ink-300 hover:text-gold-300 disabled:opacity-35" disabled={p.textSize <= 0} onClick={() => p.onTextSize(p.textSize - 1)} aria-label="Smaller text">A</button>
            <span className="h-5 w-px bg-gold-700/30" aria-hidden="true" />
            <button className="min-h-[44px] min-w-[40px] rounded-r-lg px-2 font-display text-[18px] text-ink-300 hover:text-gold-300 disabled:opacity-35" disabled={p.textSize >= READ_SIZES.length - 1} onClick={() => p.onTextSize(p.textSize + 1)} aria-label="Larger text">A</button>
          </div>
          {!lg && <button className={cn("btn-ghost !min-h-[44px]", tocOpen && "active")} onClick={() => { setTocOpen((o) => !o); setChartOpen(false); }} aria-expanded={tocOpen} aria-label="Contents">☰<span className="hidden md:inline">Contents</span></button>}
          <button className={cn("btn-ghost !min-h-[44px]", (showSide || chartOpen) && "active")} onClick={() => { if (xl) setSideChart((s) => !s); else { setChartOpen((o) => !o); setTocOpen(false); } }} aria-label="Show the chart" aria-pressed={xl ? sideChart : chartOpen}>◎<span className="hidden md:inline">Chart</span></button>
        </div>
        <div className="absolute inset-x-0 bottom-[-1px] h-[2px] bg-void-700/60" aria-hidden="true">
          <div className="h-full bg-gradient-to-r from-gold-700 via-gold-400 to-gold-300 transition-[width] duration-150" style={{ width: `${pct}%` }} />
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        {/* desktop contents */}
        {lg && (
          <aside className="scroll-thin hidden w-[290px] shrink-0 overflow-y-auto border-r border-gold-700/20 px-3 py-5 lg:block" aria-label="Table of contents">
            <div className="label-caps mb-2 px-3">Contents</div>
            {Toc}
            <div className="mx-3 mt-5 border-t border-gold-700/20 pt-4 text-[11px] font-light leading-relaxed text-ink-500">
              About {portrait.minutes} min · {portrait.words.toLocaleString()} words. Built from your calculated placements, not a template.
            </div>
          </aside>
        )}

        {/* the reading */}
        <div ref={scrollRef} tabIndex={-1} onScroll={onScroll} className="scroll-thin min-w-0 flex-1 overflow-y-auto outline-none" style={{ scrollbarGutter: "stable", overscrollBehavior: "contain" }} data-portrait-scroll>
          <article className="reading-prose mx-auto w-full max-w-[700px] px-5 pb-40 pt-8 sm:px-8 sm:pt-12" style={{ ["--read-size" as string]: `${size}px` }}>
            {resumed && (
              <div className="portrait-fade mb-8 flex flex-wrap items-center gap-3 rounded-xl border border-gold-400/30 bg-gold-500/8 px-4 py-3" style={{ fontFamily: "var(--font-body)", fontSize: 13 }}>
                <span className="text-ink-100">Welcome back — resumed where you left off.</span>
                <button className="btn-ghost !min-h-[40px]" onClick={() => { scrollRef.current?.scrollTo({ top: 0, behavior: "auto" }); setResumed(null); }}>Start from the beginning</button>
              </div>
            )}

            {/* cover */}
            <header className="text-center">
              <Ornament />
              <h1 className="mt-5 font-display text-[clamp(34px,6vw,54px)] leading-[1.05] text-ink-100">Your Cosmic <span className="text-gold-300">Portrait</span></h1>
              <p className="mt-3 text-[1.12em] italic text-ink-300">{portrait.subtitle}</p>
              <div className="mt-5 text-[11px] uppercase tracking-[0.18em] text-ink-500" style={{ fontFamily: "var(--font-body)" }}>
                {chart.name !== "You" ? `For ${chart.name} · ` : ""}{chart.dateLabel} · {chart.timeLabel} · {chart.placeLabel}
                {p.isDemo && <span className="ml-2 rounded border border-gold-400/50 bg-gold-500/10 px-1.5 py-0.5 text-[9px] tracking-[0.14em] text-gold-300">DEMO</span>}
              </div>
              <div className="mt-2 text-[12px] text-ink-500" style={{ fontFamily: "var(--font-body)" }}>{portrait.minutes}-minute read · {portrait.words.toLocaleString()} words</div>
            </header>

            <details className="mt-8 rounded-xl border border-gold-700/30 bg-void-900/55 px-4 py-3" style={{ fontFamily: "var(--font-body)" }} open={!chart.timeKnown}>
              <summary className="cursor-pointer text-[12px] font-medium uppercase tracking-[0.16em] text-gold-400">How this reading was made · accuracy &amp; limits</summary>
              <ul className="mt-3 space-y-2 text-[13px] font-light leading-relaxed text-ink-300">
                {portrait.accuracy.lines.map((l, i) => <li key={i} className="flex gap-2"><span className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-gold-400/70" />{l}</li>)}
              </ul>
              {portrait.accuracy.unavailable.length > 0 && (
                <div className="mt-3 rounded-lg border border-square/30 bg-square/5 p-3 text-[12.5px] text-ink-300">
                  <div className="mb-1 text-[10.5px] uppercase tracking-[0.16em] text-square">Cannot be reliably determined</div>
                  {portrait.accuracy.unavailable.join(" · ")}
                </div>
              )}
            </details>

            {chapters.map((c: PortraitChapter) => (
              <section key={c.id} data-ch={c.id} className="pt-14" aria-labelledby={`h-${c.id}`}>
                <Ornament className="mb-6" />
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border font-display text-[22px]" style={{ color: c.color, borderColor: `${c.color}66`, background: `${c.color}12`, boxShadow: `0 0 28px -8px ${c.color}` }} aria-hidden="true">{c.glyph}</span>
                  <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-gold-400" style={{ fontFamily: "var(--font-body)" }}>{c.kicker}</div>
                    <h2 id={`h-${c.id}`} className="rp-title mt-1 text-[1.65em]">{c.title}</h2>
                  </div>
                </div>
                <p className="mt-3 text-[0.9em] italic text-ink-500">{c.blurb}</p>
                {c.blocks.map((b, i) => (
                  <BlockView key={b.id} context={`${portrait.accuracy.demoChart ? "Demonstration chart" : "Calculated birth chart"} · ${portrait.name} · Cosmic Portrait · ${c.title}`} b={b} first={i === 0 && b.type === "p"} whys={portrait.whys}
                    open={!!openWhy[b.id]} toggle={() => setOpenWhy((o) => ({ ...o, [b.id]: !o[b.id] }))}
                    onHighlight={highlightWhy} onOpen={p.onOpenInChart} />
                ))}
              </section>
            ))}

            <footer className="mt-20 text-center">
              <Ornament />
              <p className="mt-6 text-[1.05em] italic text-ink-300">Thank you for reading. The sky you were born under is a fixed moment; what you do with it is yours.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3" style={{ fontFamily: "var(--font-body)" }}>
                <button className="btn-gold" onClick={p.onClose}>Return to your chart</button>
                <button className="btn-ghost !min-h-[44px]" onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: prefersReduced() ? "auto" : "smooth" })}>↑ Back to the top</button>
                <button className="btn-ghost !min-h-[44px]" onClick={p.onNewChart}>New chart</button>
              </div>
              <p className="mx-auto mt-8 max-w-[520px] text-[11.5px] font-light leading-relaxed text-ink-500" style={{ fontFamily: "var(--font-body)" }}>
                Generated on this device from your calculated chart — nothing about your birth details is sent anywhere or stored. {portrait.engine.id} v{portrait.engine.version}.
              </p>
            </footer>
          </article>
        </div>

        {/* desktop companion chart */}
        {showSide && (
          <aside className="scroll-thin hidden w-[380px] shrink-0 overflow-y-auto border-l border-gold-700/20 px-4 py-5 xl:block" aria-label="Companion chart">
            <div className="label-caps mb-2">Your chart</div>
            {SideChart}
          </aside>
        )}

        {/* tablet / phone: contents drawer */}
        {!lg && tocOpen && (
          <>
            <button className="absolute inset-0 z-20 bg-void-950/60" aria-label="Close contents" onClick={() => setTocOpen(false)} />
            <aside className="portrait-fade scroll-thin absolute inset-y-0 left-0 z-30 w-[min(88vw,360px)] overflow-y-auto border-r border-gold-700/30 bg-void-900 px-3 py-4 shadow-2xl">
              <div className="mb-2 flex items-center justify-between px-3">
                <span className="label-caps">Contents</span>
                <button className="min-h-[40px] min-w-[40px] text-ink-500 hover:text-ink-100" onClick={() => setTocOpen(false)} aria-label="Close contents">✕</button>
              </div>
              {Toc}
            </aside>
          </>
        )}

        {/* tablet / phone: chart on demand */}
        {!showSide && chartOpen && (
          <>
            <button className="absolute inset-0 z-20 bg-void-950/55" aria-label="Close chart" onClick={() => setChartOpen(false)} />
            <aside className="portrait-fade scroll-thin absolute inset-x-0 bottom-0 z-30 max-h-[82%] overflow-y-auto rounded-t-2xl border-t border-gold-400/40 bg-void-900 px-4 pb-6 pt-3 shadow-2xl md:inset-x-auto md:right-4 md:w-[430px] md:rounded-2xl md:border md:bottom-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="label-caps">Your chart</span>
                <button className="min-h-[40px] min-w-[40px] text-ink-500 hover:text-ink-100" onClick={() => setChartOpen(false)} aria-label="Close chart">✕</button>
              </div>
              {SideChart}
            </aside>
          </>
        )}
      </div>
    </div>
  );
}
