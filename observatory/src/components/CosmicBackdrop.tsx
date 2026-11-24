import { useMemo } from "react";
import type { AtmosphereMode } from "../lib/scene";

/** tiny deterministic PRNG so the backdrop is stable between renders */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const RAINBOW = ["#ff6b8b", "#ffb36b", "#ffe36b", "#7be0a2", "#6bc6ff", "#9a86ff", "#d78bff"];

/**
 * CSS atmosphere layer that sits behind the WebGL canvas: layered nebula
 * veils (extra violet), two parallax star fields, and drifting rainbow dots.
 */
export default function CosmicBackdrop({ mode }: { mode: AtmosphereMode }) {
  const { near, far, dots } = useMemo(() => {
    const r = rng(4242);
    const mk = (n: number, rMin: number, rMax: number, warm: number) =>
      Array.from({ length: n }, () => ({
        x: r() * 100,
        y: r() * 100,
        r: rMin + r() * (rMax - rMin),
        o: 0.35 + r() * 0.65,
        c: r() < warm ? "#fff0cf" : r() < 0.5 ? "#dfe8ff" : "#d6c9ff",
      }));
    return {
      near: mk(70, 0.5, 1.3, 0.25),
      far: mk(150, 0.25, 0.7, 0.1),
      dots: Array.from({ length: 22 }, (_, i) => ({
        left: r() * 100,
        top: r() * 100,
        size: 3 + r() * 5,
        delay: -r() * 12,
        dur: 9 + r() * 8,
        dx: (r() - 0.5) * 80,
        dy: -20 - r() * 70,
        tint: RAINBOW[i % RAINBOW.length],
      })),
    };
  }, []);

  const full = mode === "full";
  const minimal = mode === "minimal";

  return (
    <div className="cosmic-atmosphere" aria-hidden="true">
      <div className="cosmic-nebula-base" style={{ opacity: minimal ? 0.55 : undefined }} />
      {!minimal && <div className="cosmic-nebula-violet" style={{ opacity: full ? undefined : 0.45 }} />}
      {!minimal && <div className="cosmic-nebula-wisps" />}

      <svg className="cosmic-stars cosmic-stardust" >
        {far.map((s, i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill={s.c} opacity={s.o * 0.7} />
        ))}
      </svg>
      <svg className="cosmic-stars cosmic-stars-near" >
        {near.map((s, i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill={s.c} opacity={s.o} />
        ))}
      </svg>

      {full && (
        <div className="cosmic-rainbow-dots">
          {dots.map((d, i) => (
            <span
              key={i}
              className="rainbow-dot"
              style={
                {
                  left: `${d.left}%`,
                  top: `${d.top}%`,
                  width: d.size,
                  height: d.size,
                  animationDelay: `${d.delay}s`,
                  animationDuration: `${d.dur}s`,
                  background: `radial-gradient(circle, ${d.tint}, transparent 70%)`,
                  "--dx": `${d.dx}px`,
                  "--dy": `${d.dy}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
