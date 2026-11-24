import * as THREE from "three";

export type RGB = [number, number, number];

/** sRGB hex -> 0..1 triplet (display-referred; our custom shaders write straight to the canvas). */
export function rgb(hex: string): RGB {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function srgb(hex: string): THREE.Vector3 {
  const [r, g, b] = rgb(hex);
  return new THREE.Vector3(r, g, b);
}

export function mixRGB(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

export function clamp(v: number, lo = 0, hi = 1): number {
  return Math.min(hi, Math.max(lo, v));
}

/** Small deterministic LCG (same generator the Observatory uses for its star field). */
export function makeRng(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function createRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer | null {
  try {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    return renderer;
  } catch {
    return null;
  }
}

/** Soft radial falloff used for every additive glow. */
export function glowTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.16, "rgba(255,255,255,0.58)");
  grad.addColorStop(0.42, "rgba(255,255,255,0.17)");
  grad.addColorStop(0.72, "rgba(255,255,255,0.04)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * The "squared circle" — circle, triangle, square, circle — the classical
 * glyph of the Philosopher's Stone, ringed by seven stations for the seven metals.
 */
export function sigilTexture(): THREE.CanvasTexture {
  const S = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const cx = S / 2;
  const cy = S / 2;
  g.translate(cx, cy);
  g.lineCap = "round";
  g.lineJoin = "round";
  const gold = (a: number) => `rgba(240,203,141,${a})`;
  const lav = (a: number) => `rgba(200,170,240,${a})`;

  const ring = (r: number, w: number, style: string) => {
    g.beginPath();
    g.arc(0, 0, r, 0, Math.PI * 2);
    g.lineWidth = w;
    g.strokeStyle = style;
    g.stroke();
  };

  ring(492, 3, gold(0.95));
  ring(470, 1.5, gold(0.6));
  ring(404, 1.5, lav(0.5));

  // graduated ticks
  for (let i = 0; i < 84; i++) {
    const a = (i / 84) * Math.PI * 2;
    const long = i % 12 === 0;
    const r0 = long ? 410 : 448;
    g.beginPath();
    g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
    g.lineTo(Math.cos(a) * 468, Math.sin(a) * 468);
    g.lineWidth = long ? 2.5 : 1.3;
    g.strokeStyle = gold(long ? 0.85 : 0.5);
    g.stroke();
  }

  // triangle
  const tri = 396;
  g.beginPath();
  for (let i = 0; i < 3; i++) {
    const a = -Math.PI / 2 + (i / 3) * Math.PI * 2;
    const x = Math.cos(a) * tri;
    const y = Math.sin(a) * tri;
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.closePath();
  g.lineWidth = 2.5;
  g.strokeStyle = gold(0.85);
  g.stroke();

  // square inside the triangle's incircle
  const sq = (tri / 2) * 0.86;
  g.beginPath();
  g.rect(-sq, -sq + 26, sq * 2, sq * 2);
  g.lineWidth = 2.2;
  g.strokeStyle = gold(0.8);
  g.stroke();

  // inner circle
  g.save();
  g.translate(0, 26);
  ring(sq, 2.2, gold(0.85));
  ring(sq * 0.5, 1.4, lav(0.55));
  g.beginPath();
  g.arc(0, 0, 9, 0, Math.PI * 2);
  g.fillStyle = gold(1);
  g.fill();
  g.restore();

  // seven stations
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i / 7) * Math.PI * 2;
    const x = Math.cos(a) * 437;
    const y = Math.sin(a) * 437;
    g.beginPath();
    g.arc(x, y, 19, 0, Math.PI * 2);
    g.fillStyle = "rgba(20,10,36,0.9)";
    g.fill();
    g.lineWidth = 2;
    g.strokeStyle = gold(0.95);
    g.stroke();
    g.beginPath();
    g.arc(x, y, 6.5, 0, Math.PI * 2);
    g.fillStyle = gold(1);
    g.fill();
  }

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/**
 * Procedural noise cloud, in the spirit of the Observatory's 3D nebula sprites:
 * layered value noise, a radial falloff and a two-colour ramp.
 */
export function nebulaTexture(c0: RGB, c1: RGB, seed: number, density = 1): THREE.CanvasTexture {
  const S = 192;
  const rnd = makeRng(seed);
  const octaves = [4, 8, 16, 32, 64].map((g) => {
    const arr = new Float32Array((g + 1) * (g + 1));
    for (let i = 0; i < arr.length; i++) arr[i] = rnd();
    return { g, arr };
  });
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(S, S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      let n = 0;
      let amp = 1;
      let total = 0;
      for (const o of octaves) {
        const fx = (x / S) * o.g;
        const fy = (y / S) * o.g;
        const ix = Math.floor(fx);
        const iy = Math.floor(fy);
        const tx = fx - ix;
        const ty = fy - iy;
        const sx = tx * tx * (3 - 2 * tx);
        const sy = ty * ty * (3 - 2 * ty);
        const w = o.g + 1;
        const a = o.arr[iy * w + ix];
        const b = o.arr[iy * w + ix + 1];
        const d = o.arr[(iy + 1) * w + ix];
        const e = o.arr[(iy + 1) * w + ix + 1];
        n += (a + (b - a) * sx + (d - a) * sy + (a - b - d + e) * sx * sy) * amp;
        total += amp;
        amp *= 0.55;
      }
      n /= total;
      const dx = (x - S / 2) / (S / 2);
      const dy = (y - S / 2) / (S / 2);
      const dist = Math.min(1, Math.sqrt(dx * dx + dy * dy));
      const fall = 1 - dist * dist * (3 - 2 * dist);
      const body = clamp((n - 0.3) * 2.1);
      const alpha = Math.pow(body, 1.35) * fall * density;
      const k = clamp(body * 1.15);
      const p = (y * S + x) * 4;
      img.data[p] = (c0[0] + (c1[0] - c0[0]) * k) * 255;
      img.data[p + 1] = (c0[1] + (c1[1] - c0[1]) * k) * 255;
      img.data[p + 2] = (c0[2] + (c1[2] - c0[2]) * k) * 255;
      img.data[p + 3] = clamp(alpha) * 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Runs `frame` only while the element is on screen and the tab is visible. */
export function createLoop(el: Element, frame: (dt: number) => void): () => void {
  let raf = 0;
  let running = false;
  let visible = false;
  let last = 0;

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    frame(dt);
  };
  const sync = () => {
    const should = visible && document.visibilityState === "visible";
    if (should && !running) {
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    } else if (!should && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
  };
  const io = new IntersectionObserver(
    (entries) => {
      visible = entries.some((e) => e.isIntersecting);
      sync();
    },
    { rootMargin: "120px" },
  );
  io.observe(el);
  document.addEventListener("visibilitychange", sync);

  return () => {
    io.disconnect();
    document.removeEventListener("visibilitychange", sync);
    cancelAnimationFrame(raf);
    running = false;
  };
}
