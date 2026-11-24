import type { CSSProperties } from "react";

/**
 * The Observatory's purple nebula, ported 1:1 — same layered gradients, same seeded
 * star field (LCG seed 4242), same slow drift. Server-rendered, so it is painted with
 * the very first byte of HTML: there is never a blank or white frame before the content.
 */

function lcg(seed: number) {
  let e = seed;
  return () => ((e = (e * 16807) % 2147483647), (e - 1) / 2147483646);
}

const TINTS = ["#ff6b8b", "#ffb36b", "#ffe36b", "#7be0a2", "#6bc6ff", "#9a86ff", "#d78bff"];

const rnd = lcg(4242);

function stars(count: number, rMin: number, rMax: number, warm: number) {
  return Array.from({ length: count }, () => {
    const x = rnd() * 100;
    const y = rnd() * 100;
    const r = rMin + rnd() * (rMax - rMin);
    const o = 0.35 + rnd() * 0.65;
    const c = rnd() < warm ? "#fff0cf" : rnd() < 0.5 ? "#dfe8ff" : "#d6c9ff";
    return { x: x.toFixed(3), y: y.toFixed(3), r: r.toFixed(3), o, c };
  });
}

const NEAR = stars(70, 0.5, 1.3, 0.25);
const FAR = stars(150, 0.25, 0.7, 0.1);
const DOTS = Array.from({ length: 22 }, (_, i) => {
  const left = rnd() * 100;
  const top = rnd() * 100;
  const size = 3 + rnd() * 5;
  const delay = -rnd() * 12;
  const dur = 9 + rnd() * 8;
  const dx = (rnd() - 0.5) * 80;
  const dy = -20 - rnd() * 70;
  return { left, top, size, delay, dur, dx, dy, tint: TINTS[i % TINTS.length] };
});

export default function CosmicAtmosphere() {
  return (
    <div className="cosmic-atmosphere" aria-hidden="true">
      <div className="cosmic-nebula-base" />
      <div className="cosmic-nebula-violet" />
      <div className="cosmic-nebula-wisps" />
      <svg className="cosmic-stars cosmic-stardust">
        {FAR.map((s, i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill={s.c} opacity={(s.o * 0.7).toFixed(3)} />
        ))}
      </svg>
      <svg className="cosmic-stars cosmic-stars-near">
        {NEAR.map((s, i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill={s.c} opacity={s.o.toFixed(3)} />
        ))}
      </svg>
      <div className="cosmic-rainbow-dots">
        {DOTS.map((d, i) => (
          <span
            key={i}
            className="rainbow-dot"
            style={
              {
                left: `${d.left.toFixed(2)}%`,
                top: `${d.top.toFixed(2)}%`,
                width: `${d.size.toFixed(1)}px`,
                height: `${d.size.toFixed(1)}px`,
                animationDelay: `${d.delay.toFixed(2)}s`,
                animationDuration: `${d.dur.toFixed(2)}s`,
                background: `radial-gradient(circle, ${d.tint}, transparent 70%)`,
                "--dx": `${d.dx.toFixed(1)}px`,
                "--dy": `${d.dy.toFixed(1)}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="cosmic-veil" />
    </div>
  );
}
