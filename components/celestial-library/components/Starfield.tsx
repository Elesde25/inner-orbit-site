import { useEffect, useRef } from 'react';
import type { Atmosphere } from '../data/types';

interface Props {
  atmosphere: Atmosphere;
  density?: number;
  className?: string;
  goldRatio?: number;
}

export default function Starfield({ atmosphere, density = 1, className = '', goldRatio = 0.25 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let w = 0, h = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const N = Math.round(((w * h) / 9000) * density * (atmosphere === 'full' ? 1 : atmosphere === 'subtle' ? 0.55 : 0.25));
    const stars = Array.from({ length: N }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.6 + 0.3,
      gold: Math.random() < goldRatio,
      tw: Math.random() * Math.PI * 2,
      sp: 0.2 + Math.random() * 0.8,
      drift: Math.random() * 0.00012 + 0.00002,
    }));
    const motes = atmosphere === 'full'
      ? Array.from({ length: Math.round(N / 6) }, () => ({
          x: Math.random(), y: Math.random(), r: 1.5 + Math.random() * 3,
          a: Math.random() * Math.PI * 2, sp: 0.0004 + Math.random() * 0.0012,
        }))
      : [];

    let t = 0;
    const reduced = atmosphere === 'minimal' || !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const draw = () => {
      t += 1;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        if (!reduced) {
          s.tw += 0.02 * s.sp;
          s.y -= s.drift;
          if (s.y < -0.02) { s.y = 1.02; s.x = Math.random(); }
        }
        const tw = reduced ? 0.7 : 0.45 + 0.55 * Math.abs(Math.sin(s.tw));
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.gold ? `rgba(247,221,154,${0.85 * tw})` : `rgba(214,208,255,${0.8 * tw})`;
        ctx.fill();
        if (s.r > 1.4 && !reduced) {
          ctx.beginPath();
          ctx.arc(s.x * w, s.y * h, s.r * 3.2, 0, Math.PI * 2);
          ctx.fillStyle = s.gold ? `rgba(232,196,118,${0.08 * tw})` : `rgba(150,140,255,${0.08 * tw})`;
          ctx.fill();
        }
      }
      for (const m of motes) {
        m.a += m.sp * 4; m.y -= m.sp; m.x += Math.sin(m.a) * 0.0004;
        if (m.y < -0.05) { m.y = 1.05; m.x = Math.random(); }
        const g = ctx.createRadialGradient(m.x * w, m.y * h, 0, m.x * w, m.y * h, m.r * 4);
        g.addColorStop(0, 'rgba(247,221,154,.5)');
        g.addColorStop(1, 'rgba(247,221,154,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(m.x * w, m.y * h, m.r * 4, 0, Math.PI * 2); ctx.fill();
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [atmosphere, density, goldRatio]);

  return <canvas ref={ref} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden />;
}
