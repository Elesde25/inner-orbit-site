import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Play, Pause, Info, RotateCcw, Eye, EyeOff, VolumeX } from 'lucide-react';
import type { LivingPageId } from '../data/types';

const MotionSafeContext = createContext(false);

/* ---------------------------------- shell ---------------------------------- */
function Shell({ title, caption, alt, children, onClose }: { title: string; caption: string; alt: string; children: React.ReactNode; onClose?: () => void }) {
  const [showAlt, setShowAlt] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-[#e8c476]/40 nebula-panel shadow-[0_0_60px_rgba(124,58,237,.35)]">
      <div className="flex items-center justify-between gap-3 border-b border-[#e8c476]/25 bg-gradient-to-r from-[#241645] to-[#120b2e] px-4 py-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#e8c476]">✦ Living Page ✦</div>
          <h4 className="font-display text-xl font-semibold text-[#fdf6e3]">{title}</h4>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAlt(!showAlt)} className="rounded-full border border-[#e8c476]/40 p-2 text-[#e8c476] transition hover:bg-[#e8c476]/15" aria-label="Toggle accessible description" title="Accessible description">
            {showAlt ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          {onClose && <button onClick={onClose} className="rounded-full border border-[#e8c476]/40 px-3 py-1.5 text-xs text-[#e8c476] transition hover:bg-[#e8c476]/15">Close</button>}
        </div>
      </div>
      {showAlt ? (
        <div className="max-h-72 overflow-y-auto p-5 text-sm leading-relaxed text-[#d8cdb4]"><span className="font-semibold text-[#e8c476]">Accessible description: </span>{alt}</div>
      ) : children}
      <div className="border-t border-[#e8c476]/20 px-4 py-2.5 text-xs italic text-[#a89a7c]">{caption}</div>
    </div>
  );
}

function ActivateGate({ onActivate, label, hint }: { onActivate: () => void; label: string; hint: string }) {
  return (
    <button onClick={onActivate} className="group flex w-full flex-col items-center gap-3 px-6 py-10 text-center transition hover:bg-white/[0.03]">
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[#e8c476]/60 bg-[#e8c476]/10 text-[#f7dd9a] transition group-hover:scale-110 group-hover:bg-[#e8c476]/25" style={{ animation: 'portalGlow 3s ease-in-out infinite' }}>
        <Play size={22} className="ml-1" />
      </span>
      <span className="font-display text-lg text-[#fdf6e3]">{label}</span>
      <span className="max-w-md text-xs text-[#a89a7c]">{hint}</span>
    </button>
  );
}

/* -------------------------------- Tao Water -------------------------------- */
function TaoWater() {
  const [active, setActive] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [notes, setNotes] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const preferenceReduced = useContext(MotionSafeContext);
  const reduced = preferenceReduced || (typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    if (!active || !playing) return;
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = wrap.clientWidth; canvas.height = wrap.clientHeight;
    const W = canvas.width, H = canvas.height;
    const drops = Array.from({ length: 90 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      s: 0.6 + Math.random() * 1.8, o: Math.random() * Math.PI * 2,
      lane: Math.random(),
    }));
    // stones (avoid zones) as fractions
    const stones = [{ x: 0.32, y: 0.62, r: 0.09 }, { x: 0.58, y: 0.45, r: 0.07 }, { x: 0.74, y: 0.68, r: 0.11 }];
    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const d of drops) {
        d.y -= d.s; d.x += Math.sin(d.o += 0.01) * 0.6;
        // flow around stones
        for (const st of stones) {
          const sx = st.x * W, sy = st.y * H, sr = st.r * W;
          const dx = d.x - sx, dy = d.y - sy, dist = Math.hypot(dx, dy);
          if (dist < sr + 26 && dist > 1) { d.x += (dx / dist) * 2.2; d.y += (dy / dist) * 0.8; }
        }
        if (d.y < -10) { d.y = H + 10; d.x = Math.random() * W; }
        if (d.x < -10) d.x = W + 10; if (d.x > W + 10) d.x = -10;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.s, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(190,235,255,${0.25 + d.lane * 0.4})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    if (!reduced) draw();
    return () => cancelAnimationFrame(raf);
  }, [active, playing, reduced]);

  const annotations = [
    { x: '32%', y: '62%', t: 'The stones', d: 'Obstacles are not argued with. Water neither resents nor surrenders to stone — it relates to it, and passes.' },
    { x: '58%', y: '38%', t: 'The current', d: 'Wu wei: action without forcing. The stream is extremely active — nourishing everything — yet never contentious.' },
    { x: '76%', y: '24%', t: 'The mist', d: 'The unnamed source. Mountains fade into mystery — the Tao that cannot be told, from which all flowing comes.' },
  ];

  return (
    <Shell title="Water Around Stones" caption="After Tao Te Ching 8 · An interactive meditation on wu wei — action without unnecessary forcing. Illustration is interpretive, not scripture."
      alt="A misty mountain stream flows downward around three smooth dark stones. Animated light particles drift with the current, parting around the stones and rejoining below them. Three annotations mark the stones (obstacles met without contention), the current (wu wei), and the mountain mist (the unnamed source).">
      {!active ? (
        <ActivateGate onActivate={() => { setActive(true); setPlaying(!reduced); }} label="Awaken the stream" hint="Reader-controlled · no autoplay · motion respects your system settings. Activating starts a gentle flowing-water animation." />
      ) : (
        <div>
          <div ref={wrapRef} className="relative h-72 overflow-hidden sm:h-80">
            <img src="/library-assets/images/living-tao.jpg" alt="Mountain stream flowing around stones" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060312]/60 via-transparent to-transparent" />
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
            {notes && annotations.map((a, i) => (
              <div key={i} className="absolute z-10 w-48 -translate-x-1/2 rounded-lg border border-[#e8c476]/50 bg-[#060312]/90 p-2.5 text-left shadow-xl backdrop-blur" style={{ left: a.x, top: a.y }}>
                <div className="text-xs font-semibold text-[#f7dd9a]">{a.t}</div>
                <div className="mt-1 text-[11px] leading-snug text-[#d8cdb4]">{a.d}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 px-4 py-3">
            <button onClick={() => setPlaying(!playing)} className="flex items-center gap-2 rounded-full bg-[#e8c476]/15 px-4 py-2 text-sm text-[#f7dd9a] transition hover:bg-[#e8c476]/30">
              {playing ? <Pause size={15} /> : <Play size={15} />} {playing ? 'Still the water' : 'Set it flowing'}
            </button>
            <button onClick={() => setNotes(!notes)} className="flex items-center gap-2 rounded-full border border-[#e8c476]/40 px-4 py-2 text-sm text-[#e8c476] transition hover:bg-[#e8c476]/10">
              <Info size={15} /> {notes ? 'Hide annotations' : 'Reveal annotations'}
            </button>
            <span className="ml-auto hidden text-[11px] italic text-[#8a7c5c] sm:inline">Wu wei is not passivity — notice how active the water is.</span>
          </div>
        </div>
      )}
    </Shell>
  );
}

/* ------------------------------- Gita scene ------------------------------- */
function GitaChariot() {
  const [active, setActive] = useState(false);
  const [notes, setNotes] = useState(false);
  const [glow, setGlow] = useState(false);
  const preferenceReduced = useContext(MotionSafeContext);
  const reduced = preferenceReduced || (typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

  const annotations = [
    { x: '42%', y: '42%', t: 'Krishna, the charioteer', d: 'The Divine as servant and friend — holding the reins. In later readings: the Self that steadies the mind’s horses.' },
    { x: '60%', y: '46%', t: 'Arjuna', d: 'The warrior in collapse — bow slipped from his hand. The teaching is given to despair, not to triumph.' },
    { x: '50%', y: '72%', t: 'The horses (senses)', d: 'Tradition reads the horses as senses, reins as mind, driver as intellect. Without Krishna, they bolt; with him, they fly straight.' },
    { x: '80%', y: '22%', t: 'Kurukshetra at dawn', d: 'The field of action — literal battlefield in the epic, inner field of duty and conscience for many interpreters.' },
  ];

  return (
    <Shell title="The Chariot at Kurukshetra" caption="After Bhagavad Gita 1–2 · A reverent interactive illumination. All animation is interpretive art; nothing animated here is scripture."
      alt="An illuminated painting of Krishna (blue-skinned, golden robes) holding the reins of four white horses, with Prince Arjuna beside him holding his bow, on a golden chariot at dawn. Armies stretch tiny into the distance. Annotations identify Krishna, Arjuna, the horses as senses, and the dawn field.">
      {!active ? (
        <ActivateGate onActivate={() => setActive(true)} label="Enter the illumination" hint="Reader-controlled · reveals the scene with optional dawn-light animation and contextual annotations." />
      ) : (
        <div>
          <div className="relative h-72 overflow-hidden sm:h-96">
            <img src="/library-assets/images/living-gita.jpg" alt="Krishna and Arjuna on the chariot at Kurukshetra" className="absolute inset-0 h-full w-full object-cover" style={glow && !reduced ? { animation: 'glowPulse 6s ease-in-out infinite' } : undefined} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060312]/70 via-transparent to-[#ff9d45]/10" />
            {glow && !reduced && <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(255,180,100,.25), transparent 60%)' }} />}
            {notes && annotations.map((a, i) => (
              <div key={i} className="absolute z-10 w-44 -translate-x-1/2 rounded-lg border border-[#e8c476]/50 bg-[#060312]/90 p-2.5 text-left shadow-xl backdrop-blur sm:w-52" style={{ left: a.x, top: a.y }}>
                <div className="text-xs font-semibold text-[#f7dd9a]">{a.t}</div>
                <div className="mt-1 text-[11px] leading-snug text-[#d8cdb4]">{a.d}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 px-4 py-3">
            <button onClick={() => setGlow(!glow)} className="flex items-center gap-2 rounded-full bg-[#e8c476]/15 px-4 py-2 text-sm text-[#f7dd9a] transition hover:bg-[#e8c476]/30">
              <Play size={15} /> {glow ? 'Calm the dawn light' : 'Kindle dawn light'}
            </button>
            <button onClick={() => setNotes(!notes)} className="flex items-center gap-2 rounded-full border border-[#e8c476]/40 px-4 py-2 text-sm text-[#e8c476] transition hover:bg-[#e8c476]/10">
              <Info size={15} /> {notes ? 'Hide annotations' : 'Reveal annotations'}
            </button>
          </div>
          <p className="px-4 pb-4 text-[11px] leading-relaxed text-[#8a7c5c]">Treated with reverence: sacred figures are presented in traditional iconography (blue-skinned Krishna, princely Arjuna). No dialogue is invented; annotations offer context only.</p>
        </div>
      )}
    </Shell>
  );
}

/* ----------------------------- Geometry solids ---------------------------- */
type V3 = [number, number, number];
const SOLIDS: Record<string, { name: string; verts: V3[]; edges: [number, number][]; faces: number; element: string; note: string }> = {
  tetra: {
    name: 'Tetrahedron', faces: 4, element: 'Fire (Platonic association — interpretive)',
    note: '4 triangular faces · 4 vertices · 6 edges. Dual: itself.',
    verts: [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]],
    edges: [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]],
  },
  cube: {
    name: 'Cube (Hexahedron)', faces: 6, element: 'Earth (Platonic association — interpretive)',
    note: '6 square faces · 8 vertices · 12 edges. Dual: octahedron.',
    verts: [[1,1,1],[1,1,-1],[1,-1,1],[1,-1,-1],[-1,1,1],[-1,1,-1],[-1,-1,1],[-1,-1,-1]],
    edges: [[0,1],[0,2],[0,4],[1,3],[1,5],[2,3],[2,6],[3,7],[4,5],[4,6],[5,7],[6,7]],
  },
  octa: {
    name: 'Octahedron', faces: 8, element: 'Air (Platonic association — interpretive)',
    note: '8 triangular faces · 6 vertices · 12 edges. Dual: cube.',
    verts: [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],
    edges: [[0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,4],[1,5],[2,4],[2,5],[3,4],[3,5]],
  },
  icosa: {
    name: 'Icosahedron', faces: 20, element: 'Water (Platonic association — interpretive)',
    note: '20 triangular faces · 12 vertices · 30 edges. Dual: dodecahedron.',
    verts: (() => { const t = (1 + Math.sqrt(5)) / 2; return [[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]] as V3[]; })(),
    edges: [[0,1],[0,5],[0,7],[0,10],[0,11],[1,5],[1,7],[1,8],[1,9],[2,3],[2,4],[2,6],[2,10],[2,11],[3,4],[3,6],[3,8],[3,9],[4,5],[4,9],[4,11],[5,9],[5,11],[6,7],[6,8],[6,10],[7,8],[7,10],[8,9],[10,11]],
  },
  dodeca: {
    name: 'Dodecahedron', faces: 12, element: 'Cosmos (Platonic association — interpretive)',
    note: '12 pentagonal faces · 20 vertices · 30 edges. Dual: icosahedron.',
    verts: (() => { const t = (1 + Math.sqrt(5)) / 2, it = 1 / t; return [[-1,-1,-1],[-1,-1,1],[-1,1,-1],[-1,1,1],[1,-1,-1],[1,-1,1],[1,1,-1],[1,1,1],[0,-it,-t],[0,-it,t],[0,it,-t],[0,it,t],[-it,-t,0],[-it,t,0],[it,-t,0],[it,t,0],[-t,0,-it],[t,0,-it],[t,0,it],[-t,0,it]] as V3[]; })(),
    edges: [[0,8],[0,12],[0,16],[1,9],[1,12],[1,19],[2,10],[2,13],[2,16],[3,11],[3,13],[3,19],[4,8],[4,14],[4,17],[5,9],[5,14],[5,18],[6,10],[6,15],[6,17],[7,11],[7,15],[7,18],[8,17],[9,18],[10,16],[11,19],[12,14],[13,15]] as [number, number][],
  },
};

function GeometrySolids() {
  const [solidKey, setSolidKey] = useState('icosa');
  const [spin, setSpin] = useState(false);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const rot = useRef({ x: 0.6, y: 0.8 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const preferenceReduced = useContext(MotionSafeContext);
  const reduced = preferenceReduced || (typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width = canvas.clientWidth * 2, H = canvas.height = 400;
    const solid = SOLIDS[solidKey];
    const { x: rx, y: ry } = rot.current;
    const proj = (v: V3): [number, number, number] => {
      let [x, y, z] = v;
      let y1 = y * Math.cos(rx) - z * Math.sin(rx), z1 = y * Math.sin(rx) + z * Math.cos(rx);
      let x2 = x * Math.cos(ry) + z1 * Math.sin(ry), z2 = -x * Math.sin(ry) + z1 * Math.cos(ry);
      const s = Math.min(W, H) * 0.26;
      const persp = 1 / (3.2 - z2 * 0.28);
      return [W / 2 + x2 * s * persp * 2.2, H / 2 - y1 * s * persp * 2.2, z2];
    };
    ctx.clearRect(0, 0, W, H);
    // backdrop rings
    ctx.strokeStyle = 'rgba(127,184,255,.15)'; ctx.lineWidth = 2;
    [0.32, 0.42].forEach((r) => { ctx.beginPath(); ctx.ellipse(W/2, H/2, Math.min(W,H)*r, Math.min(W,H)*r*0.36, 0, 0, Math.PI*2); ctx.stroke(); });
    const pts = solid.verts.map(proj);
    for (const [a, b] of solid.edges) {
      const [x1, y1, z1] = pts[a], [x2, y2, z2] = pts[b];
      const depth = (z1 + z2) / 2;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.strokeStyle = `rgba(232,196,118,${0.35 + (depth + 2) * 0.14})`;
      ctx.lineWidth = depth > 0 ? 3 : 1.5;
      ctx.stroke();
    }
    pts.forEach(([x, y, z]) => {
      ctx.beginPath(); ctx.arc(x, y, z > 0 ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = z > 0 ? '#f7dd9a' : 'rgba(127,184,255,.8)';
      ctx.shadowColor = '#e8c476'; ctx.shadowBlur = z > 0 ? 14 : 0;
      ctx.fill(); ctx.shadowBlur = 0;
    });
  }, [solidKey]);

  useEffect(() => {
    render();
    if (!spin || reduced) return;
    let raf = 0;
    const loop = () => { rot.current.y += 0.008; rot.current.x += 0.003; render(); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [render, spin, reduced]);

  const solid = SOLIDS[solidKey];

  return (
    <Shell title="The Five Perfect Solids" caption="Established mathematics: exactly five exist (Euclid XIII). Elemental names are Platonic associations — interpretive, not mathematical."
      alt="An interactive wireframe viewer showing one of the five Platonic solids in glowing gold lines on deep blue, rotatable by dragging, with buttons to switch between tetrahedron, cube, octahedron, dodecahedron, and icosahedron.">
      <div className="flex flex-wrap gap-1.5 px-4 pt-4">
        {Object.entries(SOLIDS).map(([k, s]) => (
          <button key={k} onClick={() => setSolidKey(k)} className={`rounded-full px-3 py-1.5 text-xs transition ${k === solidKey ? 'bg-[#e8c476] font-semibold text-[#1a1030]' : 'border border-[#e8c476]/40 text-[#e8c476] hover:bg-[#e8c476]/10'}`}>{s.name}</button>
        ))}
      </div>
      <canvas
        ref={canvasRef} className="h-[200px] w-full cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); setDrag({ x: e.clientX, y: e.clientY }); }}
        onPointerMove={(e) => { if (!drag) return; rot.current.y += (e.clientX - drag.x) * 0.01; rot.current.x += (e.clientY - drag.y) * 0.01; setDrag({ x: e.clientX, y: e.clientY }); render(); }}
        onPointerUp={() => setDrag(null)}
        role="img" aria-label={`${solid.name} wireframe. Drag to rotate.`}
      />
      <div className="flex flex-wrap items-center gap-2 px-4 pb-4">
        <button onClick={() => setSpin(!spin)} className="flex items-center gap-2 rounded-full bg-[#e8c476]/15 px-4 py-2 text-sm text-[#f7dd9a] transition hover:bg-[#e8c476]/30">
          {spin ? <Pause size={15} /> : <RotateCcw size={15} />} {spin ? 'Stop rotation' : 'Rotate'}
        </button>
        <div className="text-xs text-[#d8cdb4]"><span className="font-display text-base text-[#fdf6e3]">{solid.name}</span> · {solid.note}<br /><span className="italic text-[#8a7c5c]">{solid.element}</span></div>
      </div>
    </Shell>
  );
}

/* ---------------------------- Fibonacci spiral ---------------------------- */
function FibonacciSpiral() {
  const [stage, setStage] = useState(6);
  const [compare, setCompare] = useState(false);
  // Verified tiling of an 8×13 rectangle by squares 1,1,2,3,5,8 (areas sum to 104 ✓).
  // Ordered small→large for growth reveal. Grid: x 0..8, y 0..13.
  const squares: { x: number; y: number; s: number; n: number; arc: string }[] = [
    { x: 5, y: 3, s: 1, n: 1, arc: 'M 110 88 Q 119 79 130 86' },
    { x: 5, y: 4, s: 1, n: 1, arc: 'M 132 110 A 22 22 0 0 0 110 88' },
    { x: 6, y: 3, s: 2, n: 2, arc: 'M 176 66 A 44 44 0 0 1 132 110' },
    { x: 5, y: 0, s: 3, n: 3, arc: 'M 110 0 A 66 66 0 0 1 176 66' },
    { x: 0, y: 0, s: 5, n: 5, arc: 'M 0 110 A 110 110 0 0 0 110 0' },
    { x: 0, y: 5, s: 8, n: 8, arc: 'M 176 286 A 176 176 0 0 0 0 110' },
  ];
  const shown = squares.slice(0, Math.min(stage, 6));
  const u = 22;
  const fibs = [1, 1, 2, 3, 5, 8];
  const ratio = stage >= 2 ? (fibs[Math.min(stage, 6) - 1] / fibs[Math.min(stage, 6) - 2]).toFixed(5) : '—';

  return (
    <Shell title="Growing the Spiral" caption="Drag the stages: each square’s side is a Fibonacci number; the quarter-circle arcs approach — but only approach — a true golden spiral."
      alt={`Step-by-step Fibonacci tiling at stage ${stage} of 6. Squares of side 1,1,2,3,5,8 tile an 8 by 13 rectangle; quarter-circle arcs through them form an approximate golden spiral. Current ratio ${ratio}, converging toward phi 1.61803.`}>
      <div className="grid gap-4 p-4 sm:grid-cols-[1fr_220px]">
        <div className="flex items-center justify-center rounded-lg bg-[#060312] p-4">
          <svg viewBox="-8 -8 192 302" className="h-72 w-full max-w-[240px]" role="img" aria-label="Fibonacci squares and spiral">
            {shown.map((sq, i) => (
              <g key={i}>
                <rect x={sq.x * u + 1} y={sq.y * u + 1} width={sq.s * u - 2} height={sq.s * u - 2} fill="rgba(232,196,118,.08)" stroke="#e8c476" strokeWidth="1.5" />
                <text x={sq.x * u + (sq.s * u) / 2} y={sq.y * u + (sq.s * u) / 2} fill="#f7dd9a" fontSize={sq.s >= 3 ? 13 : 9} textAnchor="middle" dominantBaseline="middle">{sq.n}</text>
              </g>
            ))}
            {shown.map((sq, i) => (
              <path key={'a' + i} d={sq.arc} fill="none" stroke="#7fe0ff" strokeWidth="2.5" strokeLinecap="round" />
            ))}
            {compare && <path d="M 176 286 A 150 150 0 0 0 20 130" fill="none" stroke="#ff7fb0" strokeWidth="2" strokeDasharray="6 4" />}
          </svg>
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <label className="text-[#d8cdb4]">Construction stage: <span className="font-display text-2xl text-[#f7dd9a]">{stage}</span> / 6
            <input type="range" min={1} max={6} value={stage} onChange={(e) => setStage(+e.target.value)} className="mt-2 w-full accent-[#e8c476]" aria-label="Construction stage" />
          </label>
          <div className="rounded-lg border border-[#e8c476]/30 bg-[#060312] p-3 text-xs leading-relaxed text-[#d8cdb4]">
            <div>Ratio F<sub>n</sub>/F<sub>n−1</sub>: <span className="font-semibold text-[#f7dd9a]">{ratio}</span></div>
            <div>φ (phi): <span className="text-[#7fe0ff]">1.61803…</span></div>
            <div className="mt-1 italic text-[#8a7c5c]">Watch the ratio converge as stages grow. Next squares (13, 21…) would continue the tiling outward.</div>
          </div>
          <button onClick={() => setCompare(!compare)} className="rounded-full border border-[#ff7fb0]/50 px-4 py-2 text-xs text-[#ffb0cd] transition hover:bg-[#ff7fb0]/10">
            {compare ? 'Hide nautilus comparison' : 'Compare: nautilus-style curve'}
          </button>
          {compare && <p className="text-[11px] leading-relaxed text-[#8a7c5c]">The dashed curve sketches a nautilus-like growth spiral — logarithmic like the golden spiral, but a different growth factor. Cousins, not twins. Honest wonder survives scrutiny.</p>}
        </div>
      </div>
    </Shell>
  );
}

/* ----------------------------- Breath mandala ----------------------------- */
function BreathMandala() {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [count, setCount] = useState(4);
  const [cycles, setCycles] = useState(0);
  const preferenceReduced = useContext(MotionSafeContext);
  const reduced = preferenceReduced || (typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    if (!running) return;
    const lens = { inhale: 4, hold: 4, exhale: 6, rest: 2 };
    setCount(lens[phase]);
    const iv = setInterval(() => {
      setCount((c) => {
        if (c > 1) return c - 1;
        setPhase((p) => {
          if (p === 'inhale') return 'hold';
          if (p === 'hold') return 'exhale';
          if (p === 'exhale') { setCycles((x) => x + 1); return 'rest'; }
          return 'inhale';
        });
        return c;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [running, phase]);

  const scale = phase === 'inhale' ? 0.75 + (0.25 * (4 - count)) / 4 : phase === 'hold' ? 1 : phase === 'exhale' ? 1 - (0.25 * (6 - count)) / 6 : 0.75;
  const label = { inhale: 'Breathe in', hold: 'Hold gently', exhale: 'Release slowly', rest: 'Rest' }[phase];

  return (
    <Shell title="The Breathing Mandala" caption="A contemplative instrument, not a medical device. Breathe comfortably — never strain. Rates: in 4 · hold 4 · out 6."
      alt="A golden geometric mandala that slowly expands as you inhale for four counts, holds, contracts as you exhale for six, and rests. Phase labels and counts guide the breath; completed cycles are tallied.">
      <div className="flex flex-col items-center gap-3 p-5">
        {!running ? (
          <ActivateGate onActivate={() => { setRunning(true); setPhase('inhale'); }} label="Begin breathing with the mandala" hint="Reader-controlled · gentle animation only while running · stops instantly on command." />
        ) : (
          <>
            <div className="relative flex h-56 w-56 items-center justify-center">
              <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" style={reduced ? undefined : { transform: `scale(${scale})`, transition: 'transform 1s linear' }}>
                {[90, 70, 50, 30].map((r) => (<circle key={r} cx="100" cy="100" r={r} fill="none" stroke="#e8c476" strokeWidth="1.2" opacity={r === 90 ? 0.5 : 0.8} />))}
                {Array.from({ length: 12 }).map((_, i) => (
                  <g key={i} transform={`rotate(${i * 30} 100 100)`}>
                    <ellipse cx="100" cy="45" rx="12" ry="26" fill="none" stroke="#c9a8ff" strokeWidth="1.1" opacity=".8" />
                  </g>
                ))}
                <circle cx="100" cy="100" r="8" fill="#f7dd9a" opacity=".9" />
              </svg>
              <div className="z-10 text-center">
                <div className="font-display text-2xl text-[#fdf6e3]">{label}</div>
                <div className="font-display text-5xl text-[#f7dd9a]">{count}</div>
              </div>
            </div>
            <div className="text-xs text-[#a89a7c]">Completed breaths: <span className="font-semibold text-[#f7dd9a]">{cycles}</span></div>
            <button onClick={() => setRunning(false)} className="flex items-center gap-2 rounded-full border border-[#e8c476]/40 px-5 py-2 text-sm text-[#e8c476] transition hover:bg-[#e8c476]/10">
              <VolumeX size={15} /> Rest the mandala
            </button>
          </>
        )}
      </div>
    </Shell>
  );
}

/* ---------------------------- Stoic dichotomy ----------------------------- */
const DICHOTOMY_ITEMS = [
  { t: 'My judgments about events', mine: true },
  { t: 'Other people’s opinions of me', mine: false },
  { t: 'The effort I put in', mine: true },
  { t: 'Whether it rains today', mine: false },
  { t: 'My response to criticism', mine: true },
  { t: 'The outcome of the match', mine: false },
  { t: 'What I attend to now', mine: true },
  { t: 'My reputation', mine: false },
];

function StoicDichotomy() {
  const [placed, setPlaced] = useState<Record<number, 'mine' | 'other'>>({});
  const [checked, setChecked] = useState(false);
  const score = Object.entries(placed).filter(([i, v]) => (v === 'mine') === DICHOTOMY_ITEMS[+i].mine).length;

  return (
    <Shell title="The Two Baskets" caption="After Epictetus, Enchiridion 1 · Sort each item: yours (free) or not yours (to be released). There are no tricks — only honesty."
      alt="An interactive sorting exercise with eight items such as judgments, effort, opinions, weather, outcomes, each assigned by the reader to either the basket of things in our power or the basket of things not in our power, with gentle scoring and explanation.">
      <div className="grid gap-3 p-4 sm:grid-cols-3">
        <div className="rounded-lg border border-dashed border-[#8fd6a0]/50 bg-[#8fd6a0]/5 p-3">
          <div className="mb-2 text-center text-[11px] font-semibold uppercase tracking-widest text-[#8fd6a0]">Mine · free</div>
          {Object.entries(placed).filter(([, v]) => v === 'mine').map(([i]) => (
            <button key={i} onClick={() => { const p = { ...placed }; delete p[+i]; setPlaced(p); setChecked(false); }} className="mb-1.5 w-full rounded-md bg-[#8fd6a0]/15 px-2 py-1.5 text-xs text-[#d9f2e2] transition hover:bg-[#8fd6a0]/25">{DICHOTOMY_ITEMS[+i].t}</button>
          ))}
          {Object.values(placed).filter((v) => v === 'mine').length === 0 && <div className="py-4 text-center text-[11px] italic text-[#5c6b5e]">Tap items below to place them here</div>}
        </div>
        <div className="rounded-lg border border-[#e8c476]/30 bg-[#060312] p-3">
          <div className="mb-2 text-center text-[11px] font-semibold uppercase tracking-widest text-[#e8c476]">To be sorted</div>
          {DICHOTOMY_ITEMS.map((it, i) => placed[i] === undefined && (
            <div key={i} className="mb-1.5 flex gap-1">
              <span className="flex-1 rounded-md border border-white/10 px-2 py-1.5 text-xs text-[#d8cdb4]">{it.t}</span>
              <button onClick={() => { setPlaced({ ...placed, [i]: 'mine' }); setChecked(false); }} className="rounded-md bg-[#8fd6a0]/20 px-2 text-[11px] text-[#8fd6a0]" aria-label={`Place "${it.t}" in Mine`} title="Mine">◀</button>
              <button onClick={() => { setPlaced({ ...placed, [i]: 'other' }); setChecked(false); }} className="rounded-md bg-[#7fb8ff]/20 px-2 text-[11px] text-[#7fb8ff]" aria-label={`Place "${it.t}" in Not mine`} title="Not mine">▶</button>
            </div>
          ))}
          {Object.keys(placed).length === DICHOTOMY_ITEMS.length && <div className="py-2 text-center text-xs text-[#8a7c5c]">All sorted. Check your baskets ↓</div>}
        </div>
        <div className="rounded-lg border border-dashed border-[#7fb8ff]/50 bg-[#7fb8ff]/5 p-3">
          <div className="mb-2 text-center text-[11px] font-semibold uppercase tracking-widest text-[#7fb8ff]">Not mine · release</div>
          {Object.entries(placed).filter(([, v]) => v === 'other').map(([i]) => (
            <button key={i} onClick={() => { const p = { ...placed }; delete p[+i]; setPlaced(p); setChecked(false); }} className="mb-1.5 w-full rounded-md bg-[#7fb8ff]/15 px-2 py-1.5 text-xs text-[#d6e6ff] transition hover:bg-[#7fb8ff]/25">{DICHOTOMY_ITEMS[+i].t}</button>
          ))}
          {Object.values(placed).filter((v) => v === 'other').length === 0 && <div className="py-4 text-center text-[11px] italic text-[#5c6470]">Tap ▶ on items to release them here</div>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 px-4 pb-4">
        <button onClick={() => setChecked(true)} disabled={Object.keys(placed).length < DICHOTOMY_ITEMS.length} className="rounded-full bg-[#e8c476]/15 px-5 py-2 text-sm text-[#f7dd9a] transition hover:bg-[#e8c476]/30 disabled:opacity-40">Examine the baskets</button>
        <button onClick={() => { setPlaced({}); setChecked(false); }} className="flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs text-[#a89a7c]"><RotateCcw size={13} /> Reset</button>
        {checked && <span className="text-sm text-[#d8cdb4]">{score === 8 ? 'Perfect — the line is bright. Now live it: want only from your own basket today.' : `${score} of 8 in their true baskets. Recall: opinions, effort, responses — yours. Bodies, outcomes, reputations — not yours.`}</span>}
      </div>
    </Shell>
  );
}

/* -------------------------------- registry -------------------------------- */
export const LIVING_PAGES: Record<LivingPageId, { title: string; blurb: string; el: () => React.ReactElement }> = {
  'tao-water': { title: 'Water Around Stones', blurb: 'An animated mountain stream on wu wei', el: TaoWater },
  'gita-chariot': { title: 'The Chariot at Kurukshetra', blurb: 'An illuminated scene with annotations', el: GitaChariot },
  'geometry-solids': { title: 'The Five Perfect Solids', blurb: 'Rotate the Platonic solids', el: GeometrySolids },
  'fibonacci-spiral': { title: 'Growing the Spiral', blurb: 'Build Fibonacci growth stage by stage', el: FibonacciSpiral },
  'breath-mandala': { title: 'The Breathing Mandala', blurb: 'A guided contemplative instrument', el: BreathMandala },
  'stoic-dichotomy': { title: 'The Two Baskets', blurb: 'Sort what is yours from what is not', el: StoicDichotomy },
};

export function LivingPage({ id, motionSafe=false }: { id: LivingPageId; motionSafe?:boolean }) {
  const C = LIVING_PAGES[id].el;
  return <MotionSafeContext.Provider value={motionSafe}><C /></MotionSafeContext.Provider>;
}
