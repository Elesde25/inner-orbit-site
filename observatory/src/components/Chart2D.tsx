import { useMemo } from "react";
import type { ChartData } from "../lib/astro";
import { ASPECT_MAP, SIGNS } from "../lib/astro";
import type { Selection } from "../lib/model";
import { cn } from "../utils/cn";

const TAU = Math.PI * 2;
/* conventional: 0° Aries at left (9 o'clock), counter-clockwise */
const pol = (lon: number, r: number, cx = 200, cy = 200): [number, number] => {
  const a = Math.PI - (lon * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};

export default function Chart2D({ chart, selection, onPlanet, onAspect, compact = false, highlight = null }: {
  chart: ChartData;
  selection: Selection;
  onPlanet: (i: number) => void;
  onAspect: (i: number) => void;
  /** reading-mode companion: no caption, tighter padding */
  compact?: boolean;
  /** planets / aspects emphasized by a Show Me Why reference */
  highlight?: { planets: number[]; aspects: number[] } | null;
}) {
  const glyphs = useMemo(() => {
    const placed: {lon:number;r:number}[] = [];
    return chart.planets.map(p => {
      const r = [118,145,91,65].find(r => placed.every(q => { const [x,y]=pol(p.lon,r); const [a,b]=pol(q.lon,q.r); return Math.hypot(x-a,y-b)>27; })) ?? 118;
      placed.push({lon:p.lon,r}); return {...p,r};
    });
  }, [chart]);

  return (
    <div className={cn("plate flex h-full w-full flex-col items-center justify-center", compact ? "p-2" : "p-4")}>
      <svg viewBox="0 0 400 400" className={cn("h-full w-full", compact ? "max-h-[46vh] max-w-[420px]" : "max-h-[62vh] max-w-[560px]")} role="group" aria-label={`Two-dimensional natal chart wheel for ${chart.name}`}>
        <circle cx="200" cy="200" r="188" fill="rgba(10,13,24,0.6)" stroke="rgba(229,193,133,0.7)" strokeWidth="1.6" />
        <circle cx="200" cy="200" r="150" fill="none" stroke="rgba(229,193,133,0.35)" strokeWidth="1" />
        <circle cx="200" cy="200" r="92" fill="rgba(12,16,30,0.5)" stroke="rgba(229,193,133,0.3)" strokeWidth="1" />
        {/* sign segments */}
        {Array.from({ length: 12 }, (_, s) => {
          const a0 = Math.PI - (s * 30 * Math.PI) / 180;
          const a1 = Math.PI - ((s + 1) * 30 * Math.PI) / 180;
          const x0 = 200 + 188 * Math.cos(a0), y0 = 200 + 188 * Math.sin(a0);
          const x1 = 200 + 188 * Math.cos(a1), y1 = 200 + 188 * Math.sin(a1);
          const xi0 = 200 + 150 * Math.cos(a0), yi0 = 200 + 150 * Math.sin(a0);
          const xi1 = 200 + 150 * Math.cos(a1), yi1 = 200 + 150 * Math.sin(a1);
          const [gx, gy] = pol(s * 30 + 15, 169);
          return (
            <g key={s}>
              <path d={`M${x0},${y0} A188,188 0 0 0 ${x1},${y1} L${xi1},${yi1} A150,150 0 0 1 ${xi0},${yi0} Z`}
                fill={s % 2 ? "rgba(229,193,133,0.05)" : "rgba(139,124,246,0.05)"}
                stroke="rgba(229,193,133,0.3)" strokeWidth="0.8" />
              <text x={gx} y={gy} textAnchor="middle" dominantBaseline="middle" fontSize="17" fill="rgba(240,217,166,0.9)" fontFamily="Marcellus, serif">{SIGNS[s].glyph}</text>
            </g>
          );
        })}
        {/* house cusps */}
        {chart.cusps.map((c, i) => {
          const [x0, y0] = pol(c, 150);
          const [x1, y1] = pol(c, 92);
          const major = i === 0 || i === 9;
          return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={major ? "#ffe3b4" : "rgba(229,193,133,0.5)"} strokeWidth={major ? 2 : 1} />;
        })}
        {/* house numbers */}
        {chart.cusps.map((c, i) => {
          const end = chart.cusps[(i + 1) % 12];
          const mid = c + ((((end - c) % 360) + 360) % 360) / 2;
          const [x, y] = pol(mid, 108);
          return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="rgba(229,193,133,0.6)" fontFamily="Marcellus, serif">{i + 1}</text>;
        })}
        {/* ASC / MC markers */}
        {(() => {
          const [ax, ay] = pol(chart.ascLon, 150);
          const [mx, my] = pol(chart.mcLon, 150);
          return (
            <g fontSize="10" fontFamily="Jost, sans-serif" fill="#ffe3b4">
              <text x={ax} y={ay - 8} textAnchor="middle">ASC</text>
              <text x={mx} y={my - 8} textAnchor="middle">MC</text>
            </g>
          );
        })()}
        {/* aspect lines */}
        {chart.aspects.map((a, i) => {
          const A = chart.planets[a.a], B = chart.planets[a.b];
          const [x1, y1] = pol(A.lon, 92);
          const [x2, y2] = pol(B.lon, 92);
          const sel = (selection.kind === "aspect" && selection.index === i) || !!highlight?.aspects.includes(i);
          return (
            <g key={i} role="button" tabIndex={0} aria-label={`${A.name} ${ASPECT_MAP[a.type].name} ${B.name}`} aria-pressed={sel} onKeyDown={e=>{if(e.key === "Enter" || e.key === " "){e.preventDefault();onAspect(i)}}} onClick={() => onAspect(i)} className="cursor-pointer">
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth="12" />
              <line x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={ASPECT_MAP[a.type].color} strokeWidth={sel ? 3 : 1.4}
                opacity={sel ? 1 : 0.7} />
            </g>
          );
        })}
        {/* planet glyphs */}
        {glyphs.map((p) => {
          const [x, y] = pol(p.lon, p.r);
          const [lx, ly] = pol(p.lon, 92);
          const sel = (selection.kind === "planet" && selection.index === p.index) || !!highlight?.planets.includes(p.index);
          return (
            <g key={p.id} role="button" tabIndex={0} aria-label={`${p.name} in ${SIGNS[p.sign].name}`} aria-pressed={sel} onKeyDown={e=>{if(e.key === "Enter" || e.key === " "){e.preventDefault();onPlanet(p.index)}}} onClick={() => onPlanet(p.index)} className="cursor-pointer"><circle cx={x} cy={y} r="20" fill="transparent" />
              <line x1={lx} y1={ly} x2={x} y2={y} stroke={p.color} strokeWidth="0.7" opacity="0.6" />
              {sel && <circle cx={x} cy={y} r="20" fill="none" stroke="#e5c185" strokeWidth="1.6" />}
              <circle cx={x} cy={y} r={sel ? 15 : 11} fill="rgba(8,11,20,0.85)" stroke={p.color} strokeWidth={sel ? 1.6 : 1} opacity="0.95" />
              <text x={x} y={y + 0.5} textAnchor="middle" dominantBaseline="middle" fontSize={sel ? 15 : 12} fill={p.color} fontFamily="Marcellus, serif">
                {p.glyph}{p.retro ? "℞" : ""}
              </text>
            </g>
          );
        })}
        {/* center */}
        <text x="200" y="196" textAnchor="middle" fontSize="13" fill="rgba(236,229,211,0.85)" fontFamily="Marcellus, serif">{chart.name}</text>
        <text x="200" y="211" textAnchor="middle" fontSize="8.5" fill="rgba(143,150,168,0.9)" fontFamily="Jost, sans-serif" letterSpacing="1">{chart.dateLabel}</text>
      </svg>
      {!compact && <p className="mt-2 max-w-[440px] text-center text-[11px] font-light leading-relaxed text-ink-500">
        Conventional wheel: Aries begins at the left and the signs run counter-clockwise. Select any glyph or line — the 3D sky, the reading, and the explorer follow.
      </p>}
    </div>
  );
}

export function AspectSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn("inline-block h-[3px] w-7 rounded-full")} style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      <span className="text-[11px] text-ink-300">{label}</span>
    </span>
  );
}
void TAU;
