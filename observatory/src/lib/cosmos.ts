import * as THREE from "three";
import type { AtmosphereMode } from "./scene";

/**
 * Cosmos extras — a richer deep-space layer for the natal-chart scene.
 *
 *  • spiral galaxies (painted textures with arms, dust lanes, HII knots, bars)
 *  • volumetric point-cloud spiral galaxies with real parallax
 *  • many more purple / violet / orchid nebula clouds
 *  • filament emission & reflection nebulae, ring (planetary) nebulae
 *  • globular + open star clusters, diffraction-spike stars
 *  • drifting comet, shooting stars, rocky asteroid belt
 *  • deep-space nebula shells (from the shared atmosphere code)
 *
 * Everything is decorative: it lives in its own group, is far from (or
 * far outside) the chart geometry, and never reads or writes chart data.
 */

type RGB = [number, number, number];

/* ---------------- helpers ---------------- */

function lcg(seed: number) {
  let s = Math.abs(Math.floor(seed)) % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const gauss = (r: () => number) => r() + r() + r() - 1.5; // ~N(0, 0.5)

/** direction on a sphere from azimuth/elevation (degrees) */
function skyPos(azDeg: number, elDeg: number, dist: number): THREE.Vector3 {
  const az = (azDeg * Math.PI) / 180;
  const el = (elDeg * Math.PI) / 180;
  return new THREE.Vector3(
    dist * Math.cos(el) * Math.sin(az),
    dist * Math.sin(el),
    dist * Math.cos(el) * Math.cos(az),
  );
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mix3 = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const css = (c: RGB, a: number) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;

function canvasTex(c: HTMLCanvasElement, srgb = true): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ---------------- noise ---------------- */

function makeNoiseField(size: number, seed: number): Float32Array {
  const rand = lcg(seed);
  const grids = [6, 12, 24, 48].map((g) => {
    const arr = new Float32Array((g + 1) * (g + 1));
    for (let i = 0; i < arr.length; i++) arr[i] = rand();
    return { g, arr };
  });
  const field = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size, ny = y / size;
      let v = 0, amp = 0.5, tot = 0;
      for (const gr of grids) {
        const gx = nx * gr.g, gy = ny * gr.g;
        const x0 = Math.min(Math.floor(gx), gr.g - 1), y0 = Math.min(Math.floor(gy), gr.g - 1);
        const fx = gx - x0, fy = gy - y0;
        const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
        const w = gr.g + 1;
        const a = gr.arr[y0 * w + x0], b = gr.arr[y0 * w + x0 + 1];
        const c = gr.arr[(y0 + 1) * w + x0], d = gr.arr[(y0 + 1) * w + x0 + 1];
        v += (a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy) * amp;
        tot += amp;
        amp *= 0.55;
      }
      field[y * size + x] = v / tot;
    }
  }
  return field;
}

function sampleField(f: Float32Array, size: number, u: number, v: number): number {
  const x = ((u % 1) + 1) % 1 * (size - 1);
  const y = ((v % 1) + 1) % 1 * (size - 1);
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const x1 = Math.min(size - 1, x0 + 1), y1 = Math.min(size - 1, y0 + 1);
  const fx = x - x0, fy = y - y0;
  const a = f[y0 * size + x0], b = f[y0 * size + x1], c = f[y1 * size + x0], d = f[y1 * size + x1];
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

/** soft fbm cloud — same recipe as the scene's nebulae (base → luminous core) */
function makeCloudTexture(base: RGB, core: RGB, seed: number, density = 1, peak = 0.85): THREE.CanvasTexture {
  const S = 256;
  const field = makeNoiseField(S, seed);
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(S, S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const i = y * S + x;
      const dx = (x - S / 2) / (S / 2), dy = (y - S / 2) / (S / 2);
      const r = Math.min(1, Math.sqrt(dx * dx + dy * dy));
      const fall = Math.max(0, 1 - r * r);
      let d = (field[i] - 0.42) * density;
      d = Math.max(0, Math.min(1, d * 2.2));
      const a = Math.pow(d, 1.4) * fall * fall * peak;
      const m = Math.pow(d, 1.8);
      const p = i * 4;
      img.data[p] = base[0] + (core[0] - base[0]) * m;
      img.data[p + 1] = base[1] + (core[1] - base[1]) * m;
      img.data[p + 2] = base[2] + (core[2] - base[2]) * m;
      img.data[p + 3] = Math.round(a * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvasTex(c);
}

/** domain-warped ridged noise → wispy filaments (emission / reflection nebulae) */
function makeFilamentTexture(c0: RGB, c1: RGB, c2: RGB, seed: number, peak = 0.75): THREE.CanvasTexture {
  const S = 256;
  const f1 = makeNoiseField(S, seed);
  const f2 = makeNoiseField(S, seed * 3 + 17);
  const f3 = makeNoiseField(S, seed * 7 + 5);
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(S, S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const u = x / S, v = y / S;
      const wu = u + (sampleField(f2, S, u, v) - 0.5) * 0.45;
      const wv = v + (sampleField(f3, S, u + 0.3, v + 0.6) - 0.5) * 0.45;
      const n = sampleField(f1, S, wu, wv);
      const ridge = 1 - Math.abs(2 * n - 1);
      let d = Math.pow(ridge, 3.2) * 0.9 + (n - 0.45) * 0.55;
      d = Math.max(0, Math.min(1, (d - 0.22) * 1.9));
      const dx = (x - S / 2) / (S / 2), dy = (y - S / 2) / (S / 2);
      const r = Math.min(1, Math.sqrt(dx * dx + dy * dy));
      const fall = Math.pow(Math.max(0, 1 - r * r), 1.4);
      const col = d < 0.5 ? mix3(c0, c1, d * 2) : mix3(c1, c2, (d - 0.5) * 2);
      const p = (y * S + x) * 4;
      img.data[p] = col[0]; img.data[p + 1] = col[1]; img.data[p + 2] = col[2];
      img.data[p + 3] = Math.round(Math.pow(d, 1.9) * fall * peak * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvasTex(c);
}

/** planetary / ring nebula with turbulent shell */
function makeRingNebulaTexture(inner: RGB, outer: RGB, seed: number): THREE.CanvasTexture {
  const S = 256;
  const field = makeNoiseField(S, seed);
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(S, S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = (x - S / 2) / (S / 2), dy = ((y - S / 2) / (S / 2)) * 1.08;
      const r = Math.sqrt(dx * dx + dy * dy);
      const n = field[y * S + x];
      const ringR = 0.5 + (n - 0.5) * 0.22;
      const shell = Math.exp(-Math.pow((r - ringR) / 0.085, 2));
      const haze = Math.max(0, 1 - r / ringR) * 0.3 + Math.max(0, 1 - Math.abs(r - ringR) / 0.34) * 0.14;
      const edge = Math.max(0, 1 - Math.pow(r / 0.98, 4));
      const a = Math.min(1, (shell * (0.5 + n) + haze * (0.6 + n * 0.6))) * edge;
      const col = mix3(inner, outer, Math.min(1, Math.max(0, (r - 0.25) / 0.45)));
      const p = (y * S + x) * 4;
      img.data[p] = col[0]; img.data[p + 1] = col[1]; img.data[p + 2] = col[2];
      img.data[p + 3] = Math.round(Math.min(1, a) * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvasTex(c);
}

/* ---------------- spiral galaxy texture ---------------- */

interface GalaxyOpts {
  arms: number;
  wind: number;
  seed: number;
  core: RGB;
  mid: RGB;
  outer: RGB;
  knots: RGB;
  stars: number;
  bar?: number;
}

function makeGalaxyTexture(o: GalaxyOpts): THREE.CanvasTexture {
  const S = 512;
  const R = S * 0.46;
  const cx = S / 2;
  const rnd = lcg(o.seed);
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  ctx.globalCompositeOperation = "lighter";

  const colAt = (u: number): RGB => (u < 0.32 ? mix3(o.core, o.mid, u / 0.32) : mix3(o.mid, o.outer, Math.min(1, (u - 0.32) / 0.68)));
  const armAngle = (k: number, u: number) => (k * Math.PI * 2) / o.arms + o.wind * Math.log(1 + 7 * u);
  const blob = (x: number, y: number, rad: number, col: RGB, a: number) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, css(col, a));
    g.addColorStop(1, css(col, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  };
  const place = (k: number, u: number, spread: number) => {
    const th = armAngle(k, u);
    const sg = (0.012 + 0.07 * u) * R * spread;
    return {
      x: cx + Math.cos(th) * u * R + gauss(rnd) * sg * 2,
      y: cx + Math.sin(th) * u * R + gauss(rnd) * sg * 2,
    };
  };

  /* diffuse arm light */
  for (let i = 0; i < 1500; i++) {
    const u = Math.pow(rnd(), 0.85);
    const p = place(i % o.arms, u, 2.0);
    blob(p.x, p.y, R * (0.06 + 0.09 * u), colAt(u), 0.018 + rnd() * 0.03);
  }
  /* inter-arm halo so the disc never reads as empty */
  blob(cx, cx, R * 1.0, mix3(o.mid, o.outer, 0.5), 0.07);

  /* star field along the arms */
  for (let i = 0; i < o.stars; i++) {
    const u = Math.pow(rnd(), 0.7);
    const p = place(i % o.arms, u, 1.5);
    const col = rnd() < 0.1 ? mix3(colAt(u), [255, 255, 255], 0.5) : colAt(u);
    const s = 0.45 + rnd() * rnd() * 1.6;
    ctx.fillStyle = css(mix3(col, [255, 255, 255], 0.12), 0.08 + rnd() * 0.4);
    ctx.beginPath();
    ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
    ctx.fill();
  }

  /* HII star-forming knots */
  for (let i = 0; i < 70; i++) {
    const u = 0.35 + rnd() * 0.62;
    const p = place(i % o.arms, u, 0.5);
    blob(p.x, p.y, R * (0.014 + rnd() * 0.022), o.knots, 0.2 + rnd() * 0.25);
  }

  /* bulge + optional bar */
  blob(cx, cx, R * 0.4, o.core, 0.2);
  blob(cx, cx, R * 0.18, mix3(o.core, [255, 250, 235], 0.4), 0.45);
  blob(cx, cx, R * 0.07, [255, 255, 255], 0.9);
  if (o.bar) {
    ctx.save();
    ctx.translate(cx, cx);
    ctx.rotate(o.bar);
    ctx.scale(2.6, 0.55);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 0.3);
    g.addColorStop(0, css(mix3(o.core, [255, 240, 210], 0.5), 0.75));
    g.addColorStop(1, css(o.core, 0));
    ctx.fillStyle = g;
    ctx.fillRect(-R, -R, R * 2, R * 2);
    ctx.restore();
  }

  /* dust lanes on the inner edge of each arm */
  ctx.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 1400; i++) {
    const u = 0.14 + Math.pow(rnd(), 0.9) * 0.78;
    const k = i % o.arms;
    const th = armAngle(k, u) - 0.2 - rnd() * 0.12;
    const x = cx + Math.cos(th) * u * R + gauss(rnd) * R * 0.03;
    const y = cx + Math.sin(th) * u * R + gauss(rnd) * R * 0.03;
    const rad = R * (0.012 + rnd() * 0.02);
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, "rgba(0,0,0,0.16)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }

  /* smooth edge fade */
  ctx.globalCompositeOperation = "destination-in";
  const edge = ctx.createRadialGradient(cx, cx, 0, cx, cx, S / 2);
  edge.addColorStop(0, "rgba(255,255,255,1)");
  edge.addColorStop(0.7, "rgba(255,255,255,1)");
  edge.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, S, S);

  const t = canvasTex(c);
  t.anisotropy = 4;
  return t;
}

/** star with soft diffraction spikes */
function makeSpikeTexture(): THREE.CanvasTexture {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  const m = S / 2;
  ctx.globalCompositeOperation = "lighter";
  const g = ctx.createRadialGradient(m, m, 0, m, m, m * 0.5);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.12, "rgba(255,255,255,0.7)");
  g.addColorStop(0.4, "rgba(255,255,255,0.14)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  const spike = (angle: number, len: number, thick: number, a: number) => {
    ctx.save();
    ctx.translate(m, m);
    ctx.rotate(angle);
    const lg = ctx.createLinearGradient(-len, 0, len, 0);
    lg.addColorStop(0, "rgba(255,255,255,0)");
    lg.addColorStop(0.5, `rgba(255,255,255,${a})`);
    lg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.ellipse(0, 0, len, thick, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  spike(0, m, 1.6, 0.95);
  spike(Math.PI / 2, m, 1.6, 0.95);
  spike(Math.PI / 4, m * 0.5, 1.1, 0.4);
  spike(-Math.PI / 4, m * 0.5, 1.1, 0.4);
  return canvasTex(c);
}

/* ---------------- volumetric point galaxy ---------------- */

function makePointGalaxy(
  count: number, radius: number, arms: number, wind: number, seed: number,
  inner: THREE.Color, outer: THREE.Color,
): THREE.BufferGeometry {
  const rnd = lcg(seed);
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const u = Math.pow(rnd(), 1.5);
    const k = i % arms;
    const th = (k * Math.PI * 2) / arms + wind * Math.log(1 + 7 * u) + gauss(rnd) * (0.35 + 0.9 * u);
    const r = u * radius;
    pos[i * 3] = Math.cos(th) * r + gauss(rnd) * radius * 0.012;
    pos[i * 3 + 1] = gauss(rnd) * radius * 0.07 * (1 - u * 0.75);
    pos[i * 3 + 2] = Math.sin(th) * r + gauss(rnd) * radius * 0.012;
    c.copy(inner).lerp(outer, Math.min(1, u * 1.15));
    const b = (0.25 + rnd() * 0.45) * (1.0 - u * 0.45);
    col[i * 3] = c.r * b; col[i * 3 + 1] = c.g * b; col[i * 3 + 2] = c.b * b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return geo;
}


/* =====================================================================
   FULL-SKY PLACEMENT
   The camera looks DOWN at the chart, so the sky it can reach spans from the
   nadir up to a little above the horizon. Rather than hand-placing objects in
   a lower band, every object is placed by a best-candidate (blue-noise)
   sampler over the whole reachable sphere, weighted by broad random "density
   lobes" so there are natural voids and richer regions — never a grid, a
   band, or a single plane.
   ===================================================================== */

export class SkyPlacer {
  private placed: { v: THREE.Vector3; r: number }[] = [];
  private lobes: { v: THREE.Vector3; k: number; w: number }[] = [];
  private rnd: () => number;
  constructor(seed: number) {
    this.rnd = lcg(seed);
    for (let i = 0; i < 9; i++) {
      const y = -1 + this.rnd() * 1.7;
      const a = this.rnd() * Math.PI * 2;
      const s = Math.sqrt(1 - y * y);
      this.lobes.push({ v: new THREE.Vector3(s * Math.sin(a), y, s * Math.cos(a)), k: 2 + this.rnd() * 5, w: 0.4 + this.rnd() * 0.8 });
    }
  }
  /** 0.3 … 1 — a soft, low-frequency richness field over the sphere */
  density(v: THREE.Vector3): number {
    let d = 0;
    for (const l of this.lobes) d += l.w * Math.exp(l.k * (v.dot(l.v) - 1));
    return 0.3 + 0.7 * Math.min(1, d);
  }
  /** unit direction for an object with angular radius rDeg */
  pick(rDeg: number, o: { minEl?: number; maxEl?: number; tries?: number; weight?: number } = {}): THREE.Vector3 {
    const lo = Math.sin(((o.minEl ?? -90) * Math.PI) / 180), hi = Math.sin(((o.maxEl ?? 40) * Math.PI) / 180);
    const tries = o.tries ?? 40, wgt = o.weight ?? 1;
    let best: THREE.Vector3 | null = null, bestScore = -Infinity;
    for (let t = 0; t < tries; t++) {
      const y = lo + this.rnd() * (hi - lo);
      const az = this.rnd() * Math.PI * 2;
      const s = Math.sqrt(1 - y * y);
      const v = new THREE.Vector3(s * Math.sin(az), y, s * Math.cos(az));
      let gap = 90;
      for (const p of this.placed) {
        const ang = (Math.acos(Math.max(-1, Math.min(1, v.dot(p.v)))) * 180) / Math.PI;
        gap = Math.min(gap, ang - (rDeg + p.r) * 0.55);
      }
      const score = Math.min(gap, 45) * (1 - wgt + wgt * (0.35 + this.density(v)));
      if (score > bestScore) { bestScore = score; best = v; }
    }
    this.placed.push({ v: best!.clone(), r: rDeg });
    return best!;
  }
}

/** world size of an object that should subtend `angDeg` degrees at `dist` */
const sizeAt = (angDeg: number, dist: number) => 2 * dist * Math.tan((angDeg * Math.PI) / 360);

/* ---------------- additional galaxy morphologies ---------------- */

/** a galaxy seen edge-on: thin bright disc, bulge, a dark dust lane */
function makeEdgeOnTexture(core: RGB, mid: RGB, seed: number): THREE.CanvasTexture {
  const S = 512, cx = S / 2, R = S * 0.46;
  const rnd = lcg(seed);
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  ctx.globalCompositeOperation = "lighter";
  const ell = (rx: number, ry: number, col: RGB, a: number, dy = 0) => {
    ctx.save();
    ctx.translate(cx, cx + dy);
    ctx.scale(1, ry / rx);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, css(col, a));
    g.addColorStop(0.5, css(col, a * 0.38));
    g.addColorStop(1, css(col, 0));
    ctx.fillStyle = g;
    ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
    ctx.restore();
  };
  ell(R, R * 0.09, mid, 0.55);
  ell(R * 0.8, R * 0.05, mix3(mid, [255, 255, 255], 0.35), 0.45);
  ell(R * 0.34, R * 0.2, mix3(core, [255, 240, 215], 0.4), 0.85);
  ell(R * 0.14, R * 0.1, [255, 250, 235], 0.95);
  for (let i = 0; i < 900; i++) {
    const u = Math.pow(rnd(), 0.8) * R * (rnd() < 0.5 ? -1 : 1);
    const v = gauss(rnd) * R * 0.05 * (1 - Math.abs(u) / (R * 1.15));
    ctx.fillStyle = css(mix3(mid, [255, 255, 255], 0.3), 0.1 + rnd() * 0.35);
    ctx.beginPath(); ctx.arc(cx + u, cx + v, 0.5 + rnd() * 1.1, 0, Math.PI * 2); ctx.fill();
  }
  /* dust lane */
  ctx.globalCompositeOperation = "destination-out";
  ctx.save();
  ctx.translate(cx, cx + R * 0.006);
  ctx.scale(1, 0.032);
  const dg = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 0.92);
  dg.addColorStop(0, "rgba(0,0,0,0.85)");
  dg.addColorStop(0.7, "rgba(0,0,0,0.5)");
  dg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = dg;
  ctx.fillRect(-R, -R * 3, R * 2, R * 6);
  ctx.restore();
  ctx.globalCompositeOperation = "destination-in";
  const edge = ctx.createRadialGradient(cx, cx, 0, cx, cx, S / 2);
  edge.addColorStop(0, "rgba(255,255,255,1)");
  edge.addColorStop(0.78, "rgba(255,255,255,1)");
  edge.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, S, S);
  return canvasTex(c);
}

/** smooth, featureless elliptical galaxy with a few globular specks */
function makeEllipticalTexture(col: RGB, seed: number, flat = 0.7): THREE.CanvasTexture {
  const S = 256, cx = S / 2;
  const rnd = lcg(seed);
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  ctx.globalCompositeOperation = "lighter";
  ctx.save();
  ctx.translate(cx, cx);
  ctx.rotate(rnd() * Math.PI);
  ctx.scale(1, flat);
  for (const [rad, a] of [[0.46, 0.1], [0.34, 0.14], [0.22, 0.2], [0.12, 0.34], [0.05, 0.7]] as [number, number][]) {
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, S * rad);
    g.addColorStop(0, css(mix3(col, [255, 245, 225], 0.3), a));
    g.addColorStop(1, css(col, 0));
    ctx.fillStyle = g;
    ctx.fillRect(-S, -S, S * 2, S * 2);
  }
  ctx.restore();
  for (let i = 0; i < 40; i++) {
    const a = rnd() * Math.PI * 2, r = Math.pow(rnd(), 0.7) * S * 0.3;
    ctx.fillStyle = css([255, 235, 200], 0.1 + rnd() * 0.25);
    ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, cx + Math.sin(a) * r * flat, 0.6 + rnd() * 0.8, 0, Math.PI * 2); ctx.fill();
  }
  return canvasTex(c);
}

/** irregular dwarf galaxy: clumps of young blue stars and pink star-forming knots */
function makeIrregularTexture(a: RGB, b: RGB, knot: RGB, seed: number): THREE.CanvasTexture {
  const S = 384, cx = S / 2;
  const rnd = lcg(seed);
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  ctx.globalCompositeOperation = "lighter";
  const blob = (x: number, y: number, rad: number, col: RGB, al: number) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, css(col, al));
    g.addColorStop(1, css(col, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  };
  const lumps: [number, number][] = [];
  for (let i = 0; i < 5; i++) lumps.push([cx + gauss(rnd) * S * 0.2, cx + gauss(rnd) * S * 0.16]);
  for (let i = 0; i < 70; i++) {
    const l = lumps[i % lumps.length];
    blob(l[0] + gauss(rnd) * S * 0.12, l[1] + gauss(rnd) * S * 0.1, S * (0.05 + rnd() * 0.09), mix3(a, b, rnd()), 0.05 + rnd() * 0.09);
  }
  for (let i = 0; i < 1400; i++) {
    const l = lumps[i % lumps.length];
    ctx.fillStyle = css(mix3(mix3(a, b, rnd()), [255, 255, 255], 0.3), 0.1 + rnd() * 0.5);
    ctx.beginPath(); ctx.arc(l[0] + gauss(rnd) * S * 0.14, l[1] + gauss(rnd) * S * 0.11, 0.5 + rnd() * 1.2, 0, Math.PI * 2); ctx.fill();
  }
  for (let i = 0; i < 14; i++) blob(cx + gauss(rnd) * S * 0.2, cx + gauss(rnd) * S * 0.15, S * (0.012 + rnd() * 0.02), knot, 0.35 + rnd() * 0.35);
  ctx.globalCompositeOperation = "destination-in";
  const edge = ctx.createRadialGradient(cx, cx, 0, cx, cx, S / 2);
  edge.addColorStop(0, "rgba(255,255,255,1)");
  edge.addColorStop(0.55, "rgba(255,255,255,0.9)");
  edge.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, S, S);
  return canvasTex(c);
}

/* ---------------- distant worlds ---------------- */

type SurfaceKind = "gas" | "ocean" | "rocky" | "ember" | "ice";

function makePlanetSurface(kind: SurfaceKind, pal: RGB[], seed: number): THREE.CanvasTexture {
  const W = 256, H = 128, NS = 128;
  const f1 = makeNoiseField(NS, seed), f2 = makeNoiseField(NS, seed * 5 + 3);
  const rnd = lcg(seed + 11);
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(W, H);
  const ramp = (t: number): RGB => {
    const x = Math.max(0, Math.min(0.9999, t)) * (pal.length - 1);
    const i = Math.floor(x);
    return mix3(pal[i], pal[i + 1], x - i);
  };
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = x / W, v = y / H;
      let col: RGB;
      if (kind === "gas") {
        const warp = (sampleField(f1, NS, u * 4, v * 1.5) - 0.5) * 0.09;
        const band = 0.5 + 0.5 * Math.sin((v + warp) * Math.PI * 13 + sampleField(f2, NS, u * 2, v * 6) * 2.2);
        const fine = 0.5 + 0.5 * Math.sin((v + warp * 1.7) * Math.PI * 41);
        col = ramp(band * 0.8 + fine * 0.2);
        col = mix3(col, ramp(sampleField(f2, NS, u * 6, v * 3)), 0.22);
      } else if (kind === "ocean") {
        const h = sampleField(f1, NS, u * 2.2, v * 1.6) * 0.65 + sampleField(f2, NS, u * 6, v * 4) * 0.35;
        col = h > 0.52 ? mix3(pal[2], pal[3], Math.min(1, (h - 0.52) * 4)) : mix3(pal[0], pal[1], Math.min(1, h * 1.8));
        const cl = Math.max(0, sampleField(f2, NS, u * 3 + 0.2, v * 3) - 0.5) * 3.2;
        col = mix3(col, [245, 248, 255], Math.min(0.85, cl));
        if (Math.abs(v - 0.5) > 0.43) col = mix3(col, [240, 246, 255], 0.85);
      } else if (kind === "rocky") {
        const h = sampleField(f1, NS, u * 4, v * 2) * 0.6 + sampleField(f2, NS, u * 12, v * 6) * 0.4;
        col = ramp(h);
      } else if (kind === "ice") {
        const h = sampleField(f1, NS, u * 3, v * 2);
        col = ramp(0.35 + h * 0.65);
        const streak = 0.5 + 0.5 * Math.sin((v + (sampleField(f2, NS, u * 3, v * 3) - 0.5) * 0.1) * Math.PI * 9);
        col = mix3(col, [255, 255, 255], streak * 0.14);
      } else {
        const h = sampleField(f1, NS, u * 5, v * 3);
        col = mix3(pal[0], pal[1], h);
        const r1 = sampleField(f2, NS, u * 6 + h * 0.3, v * 4);
        const ridge = Math.pow(1 - Math.abs(2 * r1 - 1), 9);
        col = mix3(col, pal[3], Math.min(1, ridge * 1.8));
        col = mix3(col, pal[2], Math.min(1, Math.max(0, ridge - 0.55) * 2.4));
      }
      const p = (y * W + x) * 4;
      img.data[p] = col[0]; img.data[p + 1] = col[1]; img.data[p + 2] = col[2]; img.data[p + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  if (kind === "rocky") {
    for (let i = 0; i < 70; i++) {
      const x = rnd() * W, y = H * 0.12 + rnd() * H * 0.76, r = 1 + rnd() * rnd() * 9;
      ctx.strokeStyle = "rgba(240,235,255,0.18)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "rgba(10,8,20,0.22)";
      ctx.beginPath(); ctx.arc(x + r * 0.15, y + r * 0.15, r * 0.9, 0, Math.PI * 2); ctx.fill();
    }
  }
  if (kind === "gas") {
    for (let i = 0; i < 2; i++) {
      const x = rnd() * W, y = H * (0.3 + rnd() * 0.4), rx = 7 + rnd() * 12;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rx);
      g.addColorStop(0, css(mix3(pal[pal.length - 1], [255, 245, 230], 0.4), 0.7));
      g.addColorStop(1, css(pal[0], 0));
      ctx.fillStyle = g;
      ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.55); ctx.translate(-x, -y);
      ctx.fillRect(x - rx, y - rx, rx * 2, rx * 2);
      ctx.restore();
    }
  }
  const t = canvasTex(c);
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

/** radial ring-system texture (u = radius) with Cassini-like gaps */
function makeRingSystemTexture(a: RGB, b: RGB, seed: number): THREE.CanvasTexture {
  const W = 256, c = document.createElement("canvas");
  c.width = W; c.height = 4;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(W, 4);
  const rnd = lcg(seed);
  const gaps = [0.3 + rnd() * 0.08, 0.58 + rnd() * 0.06, 0.8 + rnd() * 0.05];
  for (let x = 0; x < W; x++) {
    const u = x / (W - 1);
    let al = Math.sin(Math.min(1, u * 1.08) * Math.PI * 0.92 + 0.12) * 0.75 + 0.15;
    al *= 0.55 + 0.45 * Math.sin(u * 61 + seed) * Math.sin(u * 23 + 1);
    for (const g of gaps) al *= 1 - 0.85 * Math.exp(-Math.pow((u - g) / 0.018, 2));
    al *= Math.min(1, u * 10) * Math.min(1, (1 - u) * 10);
    const col = mix3(a, b, u);
    for (let y = 0; y < 4; y++) {
      const p = (y * W + x) * 4;
      img.data[p] = col[0]; img.data[p + 1] = col[1]; img.data[p + 2] = col[2]; img.data[p + 3] = Math.round(Math.max(0, Math.min(1, al)) * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = canvasTex(c);
  return t;
}

const PLANET_VERT = `
varying vec3 vN; varying vec2 vUv; varying vec3 vV;
void main() {
  vUv = uv;
  vN = normalize(mat3(modelMatrix) * normal);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vV = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const PLANET_FRAG = `
uniform sampler2D map; uniform vec3 lightDir; uniform vec3 rimColor; uniform float dim; uniform float ambient;
varying vec3 vN; varying vec2 vUv; varying vec3 vV;
void main() {
  vec3 n = normalize(vN);
  float d = dot(n, normalize(lightDir));
  float lit = smoothstep(-0.14, 0.5, d);
  vec3 tex = texture2D(map, vUv).rgb;
  float fres = pow(1.0 - max(dot(n, normalize(vV)), 0.0), 2.6);
  vec3 col = tex * (ambient + (1.0 - ambient) * lit * 1.12);
  col += rimColor * fres * (0.12 + 0.88 * lit) * 0.85;
  gl_FragColor = linearToOutputTexel(vec4(col * dim, 1.0));
}`;

/* ---------------- cosmic structures ---------------- */

/** a black hole: opaque shadow, photon ring, lensed halo, and a tilted accretion disc */
function makeBlackHoleTexture(): THREE.CanvasTexture {
  const S = 512, c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  const cx = S / 2;
  const glow = (rad: number, col: RGB, a: number) => {
    const g = ctx.createRadialGradient(cx, cx, 0, cx, cx, rad);
    g.addColorStop(0, css(col, a)); g.addColorStop(1, css(col, 0));
    ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
  };
  glow(S * 0.5, [120, 70, 200], 0.1);
  /* lensed far side of the disc, bent over the top and under the bottom */
  ctx.lineCap = "round";
  for (const [r, w, a, col] of [[70, 22, 0.35, [255, 150, 70]], [70, 8, 0.8, [255, 220, 170]], [84, 14, 0.18, [200, 110, 230]]] as [number, number, number, RGB][]) {
    ctx.strokeStyle = css(col, a); ctx.lineWidth = w;
    ctx.beginPath(); ctx.arc(cx, cx, r, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cx, r * 0.97, Math.PI * 0.22, Math.PI * 0.78); ctx.stroke();
  }
  /* main disc: bright approaching side on the left */
  ctx.save();
  ctx.translate(cx, cx); ctx.scale(1, 0.15);
  const disc = ctx.createLinearGradient(-S * 0.48, 0, S * 0.48, 0);
  disc.addColorStop(0, "rgba(255,240,215,0.95)"); disc.addColorStop(0.35, "rgba(255,170,90,0.7)");
  disc.addColorStop(0.7, "rgba(214,90,120,0.38)"); disc.addColorStop(1, "rgba(120,60,200,0)");
  for (const [ro, ri] of [[S * 0.47, S * 0.1], [S * 0.36, S * 0.12]] as [number, number][]) {
    ctx.fillStyle = disc;
    ctx.beginPath(); ctx.arc(0, 0, ro, 0, Math.PI * 2); ctx.arc(0, 0, ri, 0, Math.PI * 2, true); ctx.fill("evenodd");
  }
  ctx.restore();
  /* the shadow itself occludes what is behind it */
  const sh = ctx.createRadialGradient(cx, cx, 0, cx, cx, 46);
  sh.addColorStop(0, "rgba(0,0,0,1)"); sh.addColorStop(0.86, "rgba(0,0,0,1)"); sh.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(cx, cx, 46, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(255,236,200,0.85)"; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.arc(cx, cx, 47, 0, Math.PI * 2); ctx.stroke();
  /* front lip of the disc crossing the shadow */
  ctx.save();
  ctx.translate(cx, cx); ctx.scale(1, 0.15);
  ctx.strokeStyle = disc; ctx.lineWidth = 26;
  ctx.beginPath(); ctx.arc(0, 0, S * 0.2, 0.05, Math.PI - 0.05); ctx.stroke();
  ctx.restore();
  return canvasTex(c);
}

/** twin lighthouse beams of a pulsar */
function makeBeamTexture(): THREE.CanvasTexture {
  const W = 128, H = 512, c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.globalCompositeOperation = "lighter";
  for (const dir of [-1, 1]) {
    for (const [w, a] of [[26, 0.16], [10, 0.4], [3, 0.9]] as [number, number][]) {
      const g = ctx.createLinearGradient(0, H / 2, 0, dir < 0 ? 0 : H);
      g.addColorStop(0, `rgba(190,225,255,${a})`); g.addColorStop(0.55, `rgba(160,190,255,${a * 0.32})`); g.addColorStop(1, "rgba(150,170,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 1, H / 2);
      ctx.lineTo(W / 2 - w, dir < 0 ? 0 : H);
      ctx.lineTo(W / 2 + w, dir < 0 ? 0 : H);
      ctx.lineTo(W / 2 + 1, H / 2);
      ctx.fill();
    }
  }
  return canvasTex(c);
}

/* ---------------- main class ---------------- */

const COMET_OPS = [0.9, 0.95, 0.22];

interface CloudItem { sprite: THREE.Sprite; baseY: number; drift: number; spin: number; tier: 1 | 2; baseOp: number }
interface GalaxyItem { pivot: THREE.Object3D; mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; spin: number; baseOp: number; tier: 1 | 2 }
interface PointGalaxyItem { pts: THREE.Points; mat: THREE.PointsMaterial; spin: number; baseOp: number; glow: THREE.Sprite; tier: 1 | 2 }

export class CosmosExtras {
  readonly group = new THREE.Group();
  private textures: THREE.Texture[] = [];
  private clouds: CloudItem[] = [];
  private galaxies: GalaxyItem[] = [];
  private pointGalaxies: PointGalaxyItem[] = [];
  private spikes: { sprite: THREE.Sprite; baseOp: number; tw: number; tier: 1 | 2 }[] = [];
  private clusters: { obj: THREE.Object3D; mats: THREE.Material[]; baseOps: number[]; spin: number }[] = [];
  private tier2: THREE.Object3D[] = [];

  /* shooting stars */
  private ssN = 7;
  private ssLine!: THREE.LineSegments;
  private ssHeads!: THREE.Points;
  private ssPos = new Float32Array(7 * 2 * 3);
  private ssCol = new Float32Array(7 * 2 * 3);
  private ssHeadPos = new Float32Array(7 * 3);
  private ssHeadCol = new Float32Array(7 * 3);
  private ssVel: THREE.Vector3[] = [];
  private ssHead: THREE.Vector3[] = [];
  private ssLife = new Float32Array(7);
  private ssMax = new Float32Array(7);
  private ssActive: boolean[] = [];

  /* comet */
  private comet = new THREE.Group();
  private cometDir = new THREE.Vector3();
  private cometT = -6;
  private cometMats: THREE.Material[] = [];

  /* asteroid belt */
  private belt: THREE.InstancedMesh | null = null;
  private beltGroup = new THREE.Group();

  private mode: AtmosphereMode = "full";
  private rnd = lcg(90210);
  private sky = new SkyPlacer(77123);
  private slots: Record<string, THREE.Vector3[]> = {};
  private worlds: { group: THREE.Group; mesh: THREE.Mesh; mat: THREE.ShaderMaterial; spin: number; tier: 1 | 2 }[] = [];
  private worldMats: THREE.ShaderMaterial[] = [];
  private fades: { mat: THREE.Material & { opacity: number }; base: number }[] = [];
  private beams: { glow: THREE.SpriteMaterial; beam: THREE.SpriteMaterial; base: number; baseBeam: number }[] = [];
  private queue: (() => void)[] = [];
  private timer = 0;
  private disposed = false;

  private dotTex: THREE.Texture;
  private glowTex: THREE.Texture;

  constructor(parent: THREE.Object3D, dotTex: THREE.Texture, glowTex: THREE.Texture) {
    this.dotTex = dotTex;
    this.glowTex = glowTex;
    this.reserveSky();
    this.buildShootingStars();
    this.buildComet();
    this.buildAsteroidBelt();
    parent.add(this.group);
    this.setMode("full");
    /* heavy procedural textures are built one task at a time so the UI never stalls */
    this.queue = [
      () => this.buildGalaxiesHero(),
      () => this.buildGalaxiesSmall(),
      () => this.buildGalaxyMorphologies(),
      () => this.buildPointGalaxies(),
      () => this.buildPurpleClouds(),
      () => this.buildChromaticClouds(),
      () => this.buildFilamentNebulae(),
      () => this.buildWorlds(),
      () => this.buildStructures(),
      () => this.buildDeepSpace(),
      () => this.buildSpikeStars(),
      () => this.buildClusters(),
    ];
    this.pump();
  }

  private pump = () => {
    if (this.disposed) return;
    const job = this.queue.shift();
    if (!job) return;
    try { job(); } catch { /* a failed decorative layer must never break the chart */ }
    this.setMode(this.mode);
    this.timer = window.setTimeout(this.pump, 30);
  };

  private track<T extends THREE.Texture>(t: T): T {
    this.textures.push(t);
    return t;
  }

  /* ---- reserve every object's place on the whole sky, biggest first ---- */
  private reserveSky() {
    const rs = (name: string, n: number, rDeg: number, o: { maxEl?: number; minEl?: number } = {}) => {
      this.slots[name] = Array.from({ length: n }, () => this.sky.pick(rDeg, o));
    };
    rs("heroGal", 7, 11);
    rs("pointGal", 6, 10);
    rs("world", 8, 3.6);
    rs("structure", 3, 4);
    rs("filament", 12, 9);
    rs("morph", 6, 6);
    rs("smallGal", 8, 5);
    rs("swarm", 2, 5);
    rs("ring", 4, 6);
    rs("core", 7, 6);
    rs("cloud", 26, 13, { maxEl: 44 });
    rs("chroma", 12, 11, { maxEl: 44 });
    rs("dark", 6, 13);
    rs("deep", 24, 11, { maxEl: 44 });
    rs("stream", 2, 22);
    rs("spike", 16, 2);
    rs("cluster", 4, 4);
  }
  private take(name: string): THREE.Vector3 { return this.slots[name].shift()!.clone(); }

  /** sprite cloud with an angular size, anywhere on the sky */
  private addCloud(tex: THREE.Texture, dir: THREE.Vector3, dist: number, angDeg: number, aspect: number, op: number, tier: 1 | 2, opts: { dark?: boolean; drift?: number; spin?: number } = {}) {
    const mat = new THREE.SpriteMaterial({
      map: tex, transparent: true, opacity: op, depthWrite: false,
      blending: opts.dark ? THREE.NormalBlending : THREE.AdditiveBlending,
      rotation: this.rnd() * Math.PI * 2,
    });
    const s = new THREE.Sprite(mat);
    const p = dir.clone().multiplyScalar(dist);
    s.position.copy(p);
    const w = sizeAt(angDeg, dist);
    s.scale.set(w, w * aspect, 1);
    this.group.add(s);
    this.clouds.push({
      sprite: s, baseY: p.y, baseOp: op, tier,
      drift: opts.drift ?? (this.rnd() < 0.5 ? -1 : 1) * (0.002 + this.rnd() * 0.004),
      spin: opts.spin ?? (this.rnd() < 0.5 ? -1 : 1) * (0.001 + this.rnd() * 0.003),
    });
    if (tier === 2) this.tier2.push(s);
    return s;
  }

  /* ---- purple clouds: all the way around, at several depths ---- */
  private buildPurpleClouds() {
    const r = this.rnd;
    const texs = [
      this.track(makeCloudTexture([40, 24, 100], [150, 100, 245], 211, 1.05)),
      this.track(makeCloudTexture([58, 30, 120], [190, 140, 255], 3019, 1.0)),
      this.track(makeCloudTexture([70, 28, 110], [214, 120, 232], 7727, 1.05)),
      this.track(makeCloudTexture([30, 20, 90], [130, 90, 235], 5381, 1.1)),
      this.track(makeCloudTexture([84, 40, 140], [226, 170, 255], 6133, 0.95)),
    ];
    for (let i = 0; i < 26; i++) {
      const dist = 95 + Math.pow(r(), 1.2) * 135;
      const ang = 20 + r() * 26;
      this.addCloud(texs[i % texs.length], this.take("cloud"), dist, ang, 0.62 + r() * 0.22, (0.3 + r() * 0.28) * (dist > 170 ? 0.85 : 1), i % 3 === 0 ? 1 : 2);
    }
    /* bright violet cores, lit from within */
    for (let i = 0; i < 7; i++) this.addCloud(texs[(i + 1) % texs.length], this.take("core"), 100 + r() * 90, 8 + r() * 7, 0.78, 0.5 + r() * 0.14, i < 3 ? 1 : 2);
  }

  /* ---- non-violet nebulae: teal, ember, rose, deep blue, emerald, plus dark dust ---- */
  private buildChromaticClouds() {
    const r = this.rnd;
    const texs = [
      this.track(makeCloudTexture([10, 46, 70], [70, 215, 200], 1801, 1.05, 0.8)),
      this.track(makeCloudTexture([84, 30, 22], [255, 160, 96], 2903, 1.0, 0.78)),
      this.track(makeCloudTexture([84, 28, 66], [255, 150, 190], 4001, 1.0, 0.78)),
      this.track(makeCloudTexture([12, 22, 88], [96, 156, 255], 5209, 1.05, 0.8)),
      this.track(makeCloudTexture([12, 58, 48], [120, 232, 172], 6301, 1.0, 0.72)),
    ];
    for (let i = 0; i < 12; i++) {
      const dist = 110 + r() * 120;
      this.addCloud(texs[i % texs.length], this.take("chroma"), dist, 16 + r() * 20, 0.6 + r() * 0.25, 0.2 + r() * 0.18, i % 2 === 0 ? 1 : 2);
    }
    const dust = this.track(makeCloudTexture([4, 6, 16], [10, 12, 30], 7019, 1.3, 0.9));
    for (let i = 0; i < 6; i++) this.addCloud(dust, this.take("dark"), 120 + r() * 80, 20 + r() * 14, 0.6 + r() * 0.2, 0.42, 2, { dark: true });
  }

  /* ---- emission / reflection / supernova-remnant filaments ---- */
  private buildFilamentNebulae() {
    const r = this.rnd;
    const texs = [
      this.track(makeFilamentTexture([54, 20, 96], [176, 84, 224], [255, 170, 236], 4411)),
      this.track(makeFilamentTexture([36, 22, 110], [140, 106, 255], [214, 196, 255], 8123)),
      this.track(makeFilamentTexture([14, 34, 98], [66, 150, 240], [170, 232, 255], 2203, 0.8)),
      this.track(makeFilamentTexture([70, 24, 88], [60, 190, 190], [250, 150, 220], 9341)),
      this.track(makeFilamentTexture([86, 32, 16], [240, 140, 70], [255, 220, 150], 1117, 0.7)),
      this.track(makeFilamentTexture([10, 54, 52], [60, 200, 160], [190, 255, 220], 3331, 0.7)),
    ];
    for (let i = 0; i < 12; i++) {
      const dist = 105 + r() * 115;
      this.addCloud(texs[i % texs.length], this.take("filament"), dist, 13 + r() * 14, 0.8, 0.4 + r() * 0.2, i % 2 === 0 ? 1 : 2);
    }
    /* planetary / ring nebulae with a central white dwarf; larger dim shells are supernova remnants */
    const ringA = this.track(makeRingNebulaTexture([80, 210, 220], [210, 90, 230], 612));
    const ringB = this.track(makeRingNebulaTexture([150, 130, 255], [230, 120, 210], 903));
    const ringC = this.track(makeRingNebulaTexture([255, 170, 110], [210, 70, 120], 1203));
    const ringD = this.track(makeRingNebulaTexture([110, 230, 190], [60, 120, 230], 1507));
    const specs: [THREE.Texture, number, number, number, boolean][] = [
      [ringA, 8.4, 108, 0.72, true], [ringB, 6.2, 150, 0.7, true], [ringC, 15, 190, 0.4, false], [ringD, 11, 170, 0.38, false],
    ];
    specs.forEach(([t, ang, d, op, star], i) => {
      const dir = this.take("ring");
      this.addCloud(t, dir, d, ang, 1, op, i < 2 ? 1 : 2, { spin: 0.0006, drift: 0.001 });
      if (star) {
        const hm = new THREE.SpriteMaterial({ map: this.glowTex, color: new THREE.Color("#e8f4ff"), transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending });
        const h = new THREE.Sprite(hm);
        h.position.copy(dir.multiplyScalar(d - 0.5));
        h.scale.setScalar(sizeAt(ang, d) * 0.2);
        this.group.add(h);
        this.fades.push({ mat: hm, base: 0.8 });
      }
    });
  }

  /* ---- galaxies ---- */
  private addGalaxyPlane(tex: THREE.Texture, dir: THREE.Vector3, dist: number, ang: number, op: number, tier: 1 | 2, o: { tilt?: number; roll?: number; tint?: string; flip?: boolean; spin?: number } = {}) {
    const r = this.rnd;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
    if (o.tint) mat.color.set(o.tint);
    const size = sizeAt(ang, dist);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
    mesh.rotation.set(o.tilt ?? 0.2 + r() * 1.15, 0, o.roll ?? r() * Math.PI * 2);
    if (o.flip) mesh.scale.x = -1;
    const pivot = new THREE.Object3D();
    pivot.position.copy(dir.multiplyScalar(dist));
    pivot.lookAt(0, 0, 0);
    pivot.add(mesh);
    this.group.add(pivot);
    this.galaxies.push({ pivot, mesh, mat, spin: o.spin ?? (r() < 0.5 ? -1 : 1) * (0.004 + r() * 0.004), baseOp: op, tier });
    if (tier === 2) this.tier2.push(pivot);
  }

  private spiralTex: THREE.Texture[] = [];
  private spiralOpts: GalaxyOpts[] = [
    { arms: 2, wind: 1.5, seed: 31, core: [255, 232, 200], mid: [170, 140, 255], outer: [96, 120, 240], knots: [255, 140, 210], stars: 15000 },
    { arms: 2, wind: 1.3, seed: 77, core: [255, 214, 150], mid: [240, 150, 210], outer: [150, 110, 230], knots: [255, 120, 160], stars: 13000, bar: 0.5 },
    { arms: 4, wind: 1.0, seed: 123, core: [255, 244, 220], mid: [120, 190, 255], outer: [86, 110, 235], knots: [150, 230, 255], stars: 15000 },
    { arms: 3, wind: 1.3, seed: 456, core: [255, 226, 190], mid: [210, 130, 240], outer: [120, 90, 220], knots: [255, 150, 230], stars: 14000 },
    { arms: 6, wind: 0.65, seed: 808, core: [255, 236, 190], mid: [255, 205, 140], outer: [190, 150, 200], knots: [255, 190, 150], stars: 9000 },
    { arms: 2, wind: 2.1, seed: 909, core: [255, 250, 230], mid: [130, 230, 220], outer: [90, 140, 220], knots: [190, 255, 235], stars: 9500 },
    { arms: 2, wind: 1.1, seed: 1010, core: [255, 200, 150], mid: [255, 150, 130], outer: [190, 110, 200], knots: [255, 170, 150], stars: 9000, bar: 0.9 },
  ];
  private spiral(i: number): THREE.Texture {
    return (this.spiralTex[i] ??= this.track(makeGalaxyTexture(this.spiralOpts[i])));
  }

  /* seven "hero" spiral/barred galaxies, each a different morphology and orientation */
  private buildGalaxiesHero() {
    const r = this.rnd;
    for (let i = 0; i < 7; i++) {
      this.addGalaxyPlane(this.spiral(i), this.take("heroGal"), 140 + r() * 80, 17 + r() * 9, 0.7 + r() * 0.12, i < 5 ? 1 : 2, { flip: r() < 0.5 });
    }
  }

  /* smaller, more distant instances of the same textures: different tint, tilt, handedness */
  private buildGalaxiesSmall() {
    const r = this.rnd;
    const tints = ["#ffffff", "#ffd9b8", "#bcd6ff", "#ffc4e4", "#d8ffe9", "#fff0c2"];
    for (let i = 0; i < 8; i++) {
      this.addGalaxyPlane(this.spiral((i * 3 + 1) % 7), this.take("smallGal"), 200 + r() * 70, 6 + r() * 6, 0.5 + r() * 0.15, 2, { tint: tints[i % tints.length], flip: r() < 0.5 });
    }
  }

  /* edge-on, elliptical and irregular galaxies, and distant clusters of galaxies */
  private buildGalaxyMorphologies() {
    const r = this.rnd;
    const edgeA = this.track(makeEdgeOnTexture([255, 226, 180], [190, 170, 255], 17));
    const edgeB = this.track(makeEdgeOnTexture([255, 214, 160], [150, 200, 255], 29));
    const ellA = this.track(makeEllipticalTexture([255, 214, 150], 41, 0.72));
    const ellB = this.track(makeEllipticalTexture([255, 190, 170], 53, 0.55));
    const irrA = this.track(makeIrregularTexture([110, 170, 255], [190, 150, 255], [255, 130, 190], 61));
    const irrB = this.track(makeIrregularTexture([150, 220, 230], [230, 170, 255], [255, 170, 130], 73));
    const list: [THREE.Texture, number, number, number, number, { tilt?: number; spin: number }][] = [
      [edgeA, 160, 14, 0.78, 1, { tilt: 0.1, spin: 0 }], [edgeB, 215, 8, 0.7, 2, { tilt: 0.1, spin: 0 }],
      [ellA, 190, 10, 0.7, 2, { tilt: 0.3, spin: 0 }], [ellB, 240, 6, 0.65, 2, { tilt: 0.3, spin: 0 }],
      [irrA, 170, 8, 0.72, 1, { tilt: 0.25, spin: 0.002 }], [irrB, 230, 6, 0.66, 2, { tilt: 0.25, spin: -0.002 }],
    ];
    for (const [t, d, ang, op, tier, o] of list) this.addGalaxyPlane(t, this.take("morph"), d + r() * 20, ang, op, tier as 1 | 2, { ...o, roll: r() * Math.PI * 2, flip: r() < 0.5 });

    /* clusters of galaxies: many faint smudges around a brighter central elliptical */
    const swarmMats = [
      ["#ffe2b8", 20, 3.2, 215], ["#d9d2ff", 13, 2.3, 245],
    ] as [string, number, number, number][];
    for (const [tint, count, spread, dist] of swarmMats) {
      const dir = this.take("swarm");
      const up = Math.abs(dir.y) > 0.95 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
      const u = new THREE.Vector3().crossVectors(dir, up).normalize();
      const v = new THREE.Vector3().crossVectors(dir, u).normalize();
      for (let i = 0; i < count; i++) {
        const gx = (gauss(r) * spread * Math.PI) / 180, gy = (gauss(r) * spread * 0.8 * Math.PI) / 180;
        const p = dir.clone().add(u.clone().multiplyScalar(gx)).add(v.clone().multiplyScalar(gy)).normalize().multiplyScalar(dist * (0.97 + r() * 0.06));
        const m = new THREE.SpriteMaterial({ map: i === 0 ? ellA : this.glowTex, color: new THREE.Color(r() < 0.25 ? "#c8d8ff" : tint), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, rotation: r() * Math.PI });
        const sp = new THREE.Sprite(m);
        sp.position.copy(p);
        const s = sizeAt(i === 0 ? 1.8 : 0.3 + r() * r() * 1.0, dist);
        sp.scale.set(s * (i === 0 ? 1 : 1 + r() * 0.9), s, 1);
        this.group.add(sp);
        const base = i === 0 ? 0.7 : 0.18 + r() * 0.35;
        m.opacity = base;
        this.fades.push({ mat: m, base });
        this.tier2.push(sp);
      }
    }
  }

  /* ---- volumetric spiral galaxies: real 3D parallax as the camera orbits ---- */
  private buildPointGalaxies() {
    const defs: [number, number, number, string, string, number, number][] = [
      /* dist, radius, arms, inner, outer, tiltX, tiltZ */
      [84, 21, 2, "#fff0d0", "#8a78ff", 0.95, 0.3],
      [96, 24, 3, "#ffe6d2", "#d27cf0", 0.7, -0.5],
      [88, 16, 2, "#e8f0ff", "#6f9bff", 1.1, 0.7],
      [150, 22, 4, "#fff4d8", "#7fe0d0", 0.5, 1.1],
      [175, 20, 2, "#ffe0c0", "#ff8fb0", 1.25, -0.2],
      [135, 17, 3, "#f0f4ff", "#a98cff", 0.35, 2.0],
    ];
    defs.forEach(([d, rad, arms, ci, co, tx, tz], i) => {
      const count = i < 3 ? 7000 : 5000;
      const geo = makePointGalaxy(count, rad, arms, 1.2 + (i % 2) * 0.25, 900 + i * 71, new THREE.Color(ci), new THREE.Color(co));
      const mat = new THREE.PointsMaterial({
        size: 0.5 * (d / 90), map: this.dotTex, vertexColors: true, transparent: true, opacity: 0.55,
        depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
      });
      const pts = new THREE.Points(geo, mat);
      const tilt = new THREE.Group();
      tilt.position.copy(this.take("pointGal").multiplyScalar(d));
      tilt.rotation.set(tx, 0, tz);
      tilt.add(pts);
      const gm = new THREE.SpriteMaterial({ map: this.glowTex, color: new THREE.Color(co), transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending });
      const glow = new THREE.Sprite(gm);
      glow.scale.setScalar(rad * 0.7);
      tilt.add(glow);
      this.group.add(tilt);
      const tier: 1 | 2 = i === 0 || i === 3 ? 1 : 2;
      this.pointGalaxies.push({ pts, mat, spin: (i % 2 ? -1 : 1) * 0.012, baseOp: 0.55, glow, tier });
      if (tier === 2) this.tier2.push(tilt);
    });
  }

  /* ---- distant worlds: lit gas giants, ringed planets, ocean and ember worlds ---- */
  private buildWorlds() {
    const r = this.rnd;
    type Spec = { kind: SurfaceKind; pal: RGB[]; ang: number; dist: number; atm: string; tier: 1 | 2; seed: number; ring?: { a: RGB; b: RGB; open: number; inner: number; outer: number }; moon?: boolean };
    const specs: Spec[] = [
      { kind: "gas", pal: [[236, 214, 170], [201, 146, 98], [245, 232, 200], [176, 118, 78], [226, 190, 140]], ang: 5.2, dist: 150, atm: "#f0c890", tier: 1, seed: 41, ring: { a: [236, 216, 172], b: [180, 150, 118], open: 0.5, inner: 1.35, outer: 2.4 }, moon: true },
      { kind: "ice", pal: [[96, 118, 226], [140, 160, 248], [190, 200, 255]], ang: 3.2, dist: 175, atm: "#8fa8ff", tier: 2, seed: 55, ring: { a: [200, 212, 255], b: [140, 160, 230], open: 0.78, inner: 1.3, outer: 1.85 } },
      { kind: "ocean", pal: [[16, 50, 120], [40, 120, 190], [70, 130, 80], [200, 190, 150]], ang: 2.5, dist: 140, atm: "#7fc4ff", tier: 1, seed: 67, moon: true },
      { kind: "ember", pal: [[26, 18, 24], [54, 32, 36], [255, 160, 76], [255, 96, 34]], ang: 2.2, dist: 190, atm: "#ff7a40", tier: 2, seed: 79 },
      { kind: "rocky", pal: [[70, 64, 84], [130, 120, 140], [190, 180, 196]], ang: 1.7, dist: 125, atm: "#b8b0d8", tier: 2, seed: 91 },
      { kind: "gas", pal: [[40, 130, 130], [90, 200, 190], [24, 90, 110], [150, 230, 215]], ang: 4.0, dist: 205, atm: "#7fe3d4", tier: 1, seed: 103 },
      { kind: "rocky", pal: [[170, 110, 90], [210, 150, 110], [120, 70, 60]], ang: 1.9, dist: 165, atm: "#ffb48a", tier: 2, seed: 115 },
      { kind: "ice", pal: [[200, 225, 240], [170, 200, 230], [230, 240, 250]], ang: 1.4, dist: 220, atm: "#cfe8ff", tier: 2, seed: 127 },
    ];
    const moonTex = this.track(makePlanetSurface("rocky", [[84, 80, 92], [150, 146, 156], [196, 192, 202]], 9001));
    const mkMat = (tex: THREE.Texture, light: THREE.Vector3, rim: string, ambient: number) => new THREE.ShaderMaterial({
      uniforms: { map: { value: tex }, lightDir: { value: light }, rimColor: { value: new THREE.Color(rim) }, dim: { value: 1 }, ambient: { value: ambient } },
      vertexShader: PLANET_VERT, fragmentShader: PLANET_FRAG,
    });
    for (const s of specs) {
      const dir = this.take("world");
      const R = sizeAt(s.ang, s.dist) / 2;
      const tex = this.track(makePlanetSurface(s.kind, s.pal, s.seed));
      /* a lit crescent-to-gibbous phase as seen from the chart */
      const toViewer = dir.clone().negate();
      const perp = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).cross(toViewer).normalize();
      const a = 0.5 + r() * 1.7;
      const light = toViewer.clone().multiplyScalar(Math.cos(a)).add(perp.multiplyScalar(Math.sin(a))).normalize();
      const group = new THREE.Group();
      group.position.copy(dir.clone().multiplyScalar(s.dist));
      group.lookAt(0, 0, 0);
      const tiltGroup = new THREE.Group();
      tiltGroup.rotation.z = r() * Math.PI;
      group.add(tiltGroup);
      const mat = mkMat(tex, light, s.atm, 0.07);
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(R, 56, 40), mat);
      mesh.rotation.z = 0.15 + r() * 0.4;
      tiltGroup.add(mesh);
      if (s.ring) {
        const geo = new THREE.RingGeometry(R * s.ring.inner, R * s.ring.outer, 128, 1);
        const pos = geo.attributes.position, uv = geo.attributes.uv;
        for (let i = 0; i < pos.count; i++) {
          const rr = Math.hypot(pos.getX(i), pos.getY(i));
          uv.setXY(i, (rr - R * s.ring.inner) / (R * (s.ring.outer - s.ring.inner)), 0.5);
        }
        const rmat = new THREE.MeshBasicMaterial({ map: this.track(makeRingSystemTexture(s.ring.a, s.ring.b, s.seed)), transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false });
        const ring = new THREE.Mesh(geo, rmat);
        ring.rotation.x = Math.PI / 2 - s.ring.open;
        tiltGroup.add(ring);
        this.fades.push({ mat: rmat, base: 0.8 });
      }
      if (s.moon) {
        const mr = R * (0.16 + r() * 0.08);
        const moon = new THREE.Mesh(new THREE.SphereGeometry(mr, 28, 20), mkMat(moonTex, light, "#c8c0e0", 0.07));
        const ang = r() * Math.PI * 2;
        moon.position.set(Math.cos(ang) * R * 2.7, Math.sin(ang) * R * 1.3 + R * 0.6, R * 0.8);
        group.add(moon);
        this.worldMats.push((moon.material as THREE.ShaderMaterial));
      }
      const hm = new THREE.SpriteMaterial({ map: this.glowTex, color: new THREE.Color(s.atm), transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending });
      const halo = new THREE.Sprite(hm);
      halo.scale.setScalar(R * 5.4);
      group.add(halo);
      this.fades.push({ mat: hm, base: 0.2 });
      this.group.add(group);
      this.worlds.push({ group, mesh, mat, spin: (r() < 0.5 ? -1 : 1) * (0.02 + r() * 0.03), tier: s.tier });
      if (s.tier === 2) this.tier2.push(group);
    }
  }

  /* ---- cosmic structures: black hole, pulsar, debris disc, stellar streams ---- */
  private buildStructures() {
    const r = this.rnd;
    /* black hole with lensed accretion disc */
    {
      const dir = this.take("structure"), d = 235;
      const m = new THREE.SpriteMaterial({ map: this.track(makeBlackHoleTexture()), transparent: true, opacity: 0.88, depthWrite: false, rotation: (r() - 0.5) * 0.9 });
      const sp = new THREE.Sprite(m);
      sp.position.copy(dir.multiplyScalar(d));
      const s = sizeAt(8.5, d);
      sp.scale.set(s, s, 1);
      this.group.add(sp);
      this.fades.push({ mat: m, base: 0.88 });
    }
    /* pulsar: pinpoint star with two slow lighthouse beams */
    {
      const dir = this.take("structure"), d = 205;
      const pos = dir.multiplyScalar(d);
      const gm = new THREE.SpriteMaterial({ map: this.glowTex, color: new THREE.Color("#d8ecff"), transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending });
      const g = new THREE.Sprite(gm);
      g.position.copy(pos); g.scale.setScalar(sizeAt(1.6, d));
      const bm = new THREE.SpriteMaterial({ map: this.track(makeBeamTexture()), transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, rotation: r() * Math.PI });
      const b = new THREE.Sprite(bm);
      b.position.copy(pos);
      const bs = sizeAt(7, d);
      b.scale.set(bs / 4, bs, 1);
      this.group.add(b, g);
      this.beams.push({ glow: gm, beam: bm, base: 0.9, baseBeam: 0.55 });
      this.fades.push({ mat: gm, base: 0.9 }, { mat: bm, base: 0.55 });
    }
    /* a young star ringed by a tilted debris disc */
    {
      const dir = this.take("structure"), d = 210;
      const pos = dir.multiplyScalar(d);
      const rt = this.track(makeRingNebulaTexture([255, 214, 150], [255, 120, 96], 1999));
      const dm = new THREE.SpriteMaterial({ map: rt, transparent: true, opacity: 0.62, depthWrite: false, blending: THREE.AdditiveBlending, rotation: r() * Math.PI });
      const disc = new THREE.Sprite(dm);
      disc.position.copy(pos);
      const s = sizeAt(7, d);
      disc.scale.set(s, s * 0.26, 1);
      const spike = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.track(makeSpikeTexture()), color: new THREE.Color("#fff0d8"), transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending }));
      spike.position.copy(pos); spike.scale.setScalar(sizeAt(2.2, d));
      this.group.add(disc, spike);
      this.fades.push({ mat: dm, base: 0.62 }, { mat: spike.material as THREE.SpriteMaterial, base: 0.85 });
      /* the disc's orientation is fixed in the sky, so the sprite must not spin with the camera: handled by sprite rotation only */
    }
    /* stellar streams: tidal arcs of stars torn from a small galaxy */
    const streams: [string, string, number][] = [["#bcd2ff", "#ffffff", 260], ["#ffcf9a", "#ffe9cf", 300]];
    streams.forEach(([c0, c1, dist], si) => {
      const n = 1300;
      const dir = this.take("stream");
      const up = Math.abs(dir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
      const t = new THREE.Vector3().crossVectors(dir, up).normalize().applyAxisAngle(dir, r() * Math.PI * 2);
      const b = new THREE.Vector3().crossVectors(dir, t).normalize();
      const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
      const ca = new THREE.Color(c0), cb = new THREE.Color(c1), tmp = new THREE.Color();
      for (let i = 0; i < n; i++) {
        const th = ((r() - 0.5) * 70 * Math.PI) / 180;
        const clump = r() < 0.25 ? Math.round(th / 0.2) * 0.2 : th;
        const off = gauss(r) * 0.045 * (0.5 + r()) + Math.sin(clump * 3 + si) * 0.1;
        const p = dir.clone().multiplyScalar(Math.cos(clump)).add(t.clone().multiplyScalar(Math.sin(clump))).add(b.clone().multiplyScalar(off)).normalize().multiplyScalar(dist + gauss(r) * 6);
        pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z;
        tmp.copy(ca).lerp(cb, r()).multiplyScalar(0.35 + r() * 0.65);
        col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      const pm = new THREE.PointsMaterial({ size: 1.1, map: this.dotTex, vertexColors: true, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
      const pts = new THREE.Points(geo, pm);
      this.group.add(pts);
      this.fades.push({ mat: pm, base: 0.55 });
      this.tier2.push(pts);
    });
  }

  /* ---- deep-space shells ported from the shared atmosphere code ---- */
  private buildDeepSpace() {
    const r = this.rnd;
    for (let a = 0; a < 10; a++) {
      const tex = this.track(makeCloudTexture([20, 24, 40], [120, 100, 220], 1000 + a * 7919, 1.4, 0.45));
      const dist = 90 + r() * 90;
      this.addCloud(tex, this.take("deep"), dist, 11 + r() * 12, 0.55, 0.35, 2);
    }
    for (let a = 0; a < 14; a++) {
      const tex = this.track(makeCloudTexture([8, 10, 20], [60, 70, 120], 5000 + a * 1237, 1.6, 0.4));
      const dist = 130 + r() * 120;
      this.addCloud(tex, this.take("deep"), dist, 20 + r() * 20, 0.45, 0.3, 2);
    }
  }

  /* ---- big stars with diffraction spikes ---- */
  private buildSpikeStars() {
    const tex = this.track(makeSpikeTexture());
    const r = this.rnd;
    const tints = ["#fff4dc", "#dfe8ff", "#ffd9c0", "#e6dcff", "#cfe6ff"];
    for (let i = 0; i < 16; i++) {
      const m = new THREE.SpriteMaterial({ map: tex, color: new THREE.Color(tints[i % tints.length]), transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending });
      const s = new THREE.Sprite(m);
      const d = 105 + r() * 140;
      s.position.copy(this.take("spike").multiplyScalar(d));
      s.scale.setScalar(sizeAt(3 + r() * 3.5, d));
      this.group.add(s);
      const tier: 1 | 2 = i % 2 === 0 ? 1 : 2;
      this.spikes.push({ sprite: s, baseOp: 0.8, tw: r() * Math.PI * 2, tier });
      if (tier === 2) this.tier2.push(s);
    }
  }

  /* ---- globular + open clusters ---- */
  private buildClusters() {
    const r = this.rnd;
    const globular = (dir: THREE.Vector3, dist: number, scale: number) => {
      const count = 900;
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      const c = new THREE.Color();
      for (let i = 0; i < count; i++) {
        const u = Math.max(0.0001, r());
        const rad = 3.4 / Math.sqrt(Math.pow(u, -2 / 3) - 1);
        const th = r() * Math.PI * 2;
        const ph = Math.acos(2 * r() - 1);
        const rr = Math.min(rad, 16);
        pos[i * 3] = rr * Math.sin(ph) * Math.cos(th);
        pos[i * 3 + 1] = rr * Math.cos(ph);
        pos[i * 3 + 2] = rr * Math.sin(ph) * Math.sin(th);
        c.setHSL(0.09 + r() * 0.05, 0.55, 0.62 + r() * 0.3);
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      const pm = new THREE.PointsMaterial({ size: 0.5 * scale, map: this.dotTex, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
      const gm = new THREE.SpriteMaterial({ map: this.glowTex, color: new THREE.Color("#ffd9a0"), transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending });
      const grp = new THREE.Group();
      grp.position.copy(dir.multiplyScalar(dist));
      grp.scale.setScalar(scale);
      grp.add(new THREE.Points(geo, pm));
      const glow = new THREE.Sprite(gm);
      glow.scale.setScalar(18);
      grp.add(glow);
      this.group.add(grp);
      this.clusters.push({ obj: grp, mats: [pm, gm], baseOps: [0.9, 0.5], spin: 0.01 });
    };
    const open = (dir: THREE.Vector3, dist: number, scale: number, tint: string) => {
      const grp = new THREE.Group();
      grp.position.copy(dir.multiplyScalar(dist));
      grp.scale.setScalar(scale);
      const mats: THREE.Material[] = [];
      const baseOps: number[] = [];
      const haze = new THREE.SpriteMaterial({ map: this.glowTex, color: new THREE.Color(tint), transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending });
      const hs = new THREE.Sprite(haze);
      hs.scale.setScalar(26);
      grp.add(hs);
      mats.push(haze); baseOps.push(0.32);
      for (let i = 0; i < 26; i++) {
        const m = new THREE.SpriteMaterial({ map: this.glowTex, color: new THREE.Color(i % 4 === 0 ? "#fff2d6" : "#bcd4ff"), transparent: true, opacity: 0.55 + r() * 0.35, depthWrite: false, blending: THREE.AdditiveBlending });
        const s = new THREE.Sprite(m);
        s.position.set(gauss(r) * 9, gauss(r) * 7, gauss(r) * 5);
        s.scale.setScalar(0.9 + r() * r() * 3.2);
        grp.add(s);
        mats.push(m); baseOps.push(m.opacity);
      }
      this.group.add(grp);
      this.clusters.push({ obj: grp, mats, baseOps, spin: 0 });
    };
    globular(this.take("cluster"), 118, 1);
    globular(this.take("cluster"), 190, 1.6);
    open(this.take("cluster"), 100, 1, "#6f9cff");
    open(this.take("cluster"), 175, 1.7, "#ff9ccf");
  }

  /* ---- shooting stars: bright head + fading streak ---- */
  private buildShootingStars() {
    for (let i = 0; i < this.ssN; i++) {
      this.ssVel.push(new THREE.Vector3());
      this.ssHead.push(new THREE.Vector3());
      this.ssLife[i] = -this.rnd() * 7; // staggered first appearance
      this.ssMax[i] = 1;
      this.ssActive.push(false);
    }
    const lg = new THREE.BufferGeometry();
    lg.setAttribute("position", new THREE.BufferAttribute(this.ssPos, 3));
    lg.setAttribute("color", new THREE.BufferAttribute(this.ssCol, 3));
    this.ssLine = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    this.ssLine.frustumCulled = false;

    const hg = new THREE.BufferGeometry();
    hg.setAttribute("position", new THREE.BufferAttribute(this.ssHeadPos, 3));
    hg.setAttribute("color", new THREE.BufferAttribute(this.ssHeadCol, 3));
    this.ssHeads = new THREE.Points(hg, new THREE.PointsMaterial({
      size: 1.1, map: this.dotTex, vertexColors: true, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    }));
    this.ssHeads.frustumCulled = false;
    this.group.add(this.ssLine, this.ssHeads);
  }

  private spawnShootingStar(i: number) {
    const r = this.rnd;
    const az = r() * Math.PI * 2;
    const el = (-78 + r() * 98) * (Math.PI / 180);
    const dist = 62 + r() * 38;
    this.ssHead[i].set(
      dist * Math.cos(el) * Math.sin(az),
      dist * Math.sin(el),
      dist * Math.cos(el) * Math.cos(az),
    );
    const dir = r() < 0.5 ? 1 : -1;
    const speed = 34 + r() * 30;
    this.ssVel[i].set(-Math.cos(az) * dir, -0.28 - r() * 0.3, Math.sin(az) * dir).normalize().multiplyScalar(speed);
    this.ssLife[i] = 0;
    this.ssMax[i] = 0.9 + r() * 0.9;
  }

  /* ---- a slow, luminous comet ---- */
  private buildComet() {
    const r = this.rnd;
    const count = 140;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const k = Math.pow(i / count, 1.2);
      const len = k * 26;
      const spread = k * 1.9;
      pos[i * 3] = -len + gauss(r) * 0.4; // tail trails toward -x (local)
      pos[i * 3 + 1] = gauss(r) * spread;
      pos[i * 3 + 2] = gauss(r) * spread;
      const f = Math.pow(1 - k, 1.6) * (0.35 + r() * 0.65);
      col[i * 3] = 0.55 * f + 0.2 * f; col[i * 3 + 1] = 0.75 * f; col[i * 3 + 2] = 1.0 * f;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const tm = new THREE.PointsMaterial({
      size: 0.9, map: this.dotTex, vertexColors: true, transparent: true, opacity: 0.9,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
    });
    const head = new THREE.SpriteMaterial({
      map: this.glowTex, color: new THREE.Color("#e6f2ff"), transparent: true, opacity: 0.95,
      depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const hs = new THREE.Sprite(head);
    hs.scale.setScalar(4.2);
    const dust = new THREE.SpriteMaterial({
      map: this.glowTex, color: new THREE.Color("#c9a6ff"), transparent: true, opacity: 0.22,
      depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const ds = new THREE.Sprite(dust);
    ds.scale.set(18, 5, 1);
    ds.position.x = -8;
    const tail = new THREE.Points(geo, tm);
    this.comet.add(tail, hs, ds);
    this.cometMats.push(tm, head, dust);
    this.comet.visible = false;
    this.group.add(this.comet);
  }

  private launchComet() {
    const r = this.rnd;
    const az = r() * 360;
    const start = skyPos(az, -72 + r() * 92, 88 + r() * 20);
    const dir = new THREE.Vector3(-start.z, 0.1 + r() * 0.12, start.x).normalize().multiplyScalar(r() < 0.5 ? 1 : -1);
    this.cometDir.copy(dir);
    this.comet.position.copy(start).addScaledVector(dir, -60);
    this.comet.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir);
    this.cometT = 0;
  }

  /* ---- rocky belt orbiting the chart ---- */
  private buildAsteroidBelt() {
    const r = this.rnd;
    const count = 340;
    const geo = new THREE.DodecahedronGeometry(1, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: "#9a8fb0", roughness: 0.92, metalness: 0.12, flatShading: true,
      emissive: new THREE.Color("#2a1f55"), emissiveIntensity: 0.7, transparent: true, opacity: 0.9,
    });
    const mesh = new THREE.InstancedMesh(geo, mat, count);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const sc = new THREE.Vector3();
    const col = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const ang = r() * Math.PI * 2;
      const rad = 9 + Math.pow(r(), 0.8) * 4.5;
      const s = 0.025 + Math.pow(r(), 3) * 0.12;
      e.set(r() * 6.28, r() * 6.28, r() * 6.28);
      q.setFromEuler(e);
      sc.set(s * (0.7 + r() * 0.6), s * (0.6 + r() * 0.5), s * (0.7 + r() * 0.6));
      m.compose(new THREE.Vector3(Math.cos(ang) * rad, gauss(r) * 0.5 - 0.1, Math.sin(ang) * rad), q, sc);
      mesh.setMatrixAt(i, m);
      col.setHSL(0.72 + r() * 0.08, 0.15 + r() * 0.2, 0.45 + r() * 0.35);
      mesh.setColorAt(i, col);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    this.belt = mesh;
    this.beltGroup.add(mesh);
    this.group.add(this.beltGroup);
    this.tier2.push(this.beltGroup);
  }

  /* ---------------- modes ---------------- */

  setMode(mode: AtmosphereMode) {
    this.mode = mode;
    this.group.visible = mode !== "minimal";
    const k = mode === "full" ? 1 : 0.6;
    for (const o of this.tier2) o.visible = mode === "full";
    for (const c of this.clouds) c.sprite.material.opacity = c.baseOp * k;
    for (const g of this.galaxies) g.mat.opacity = g.baseOp * k;
    for (const g of this.pointGalaxies) { g.mat.opacity = g.baseOp * k; }
    for (const s of this.spikes) s.sprite.material.opacity = s.baseOp * k;
    for (const c of this.clusters) c.mats.forEach((m, i) => { (m as THREE.PointsMaterial).opacity = c.baseOps[i] * k; });
    for (const f of this.fades) f.mat.opacity = f.base * k;
    for (const w of this.worlds) w.mat.uniforms.dim.value = mode === "full" ? 1 : 0.72;
    for (const m of this.worldMats) m.uniforms.dim.value = mode === "full" ? 1 : 0.72;
    this.ssLine.visible = this.ssHeads.visible = mode === "full";
    if (mode !== "full") this.comet.visible = false;
  }

  /* ---------------- per-frame ---------------- */

  update(t: number, dt: number) {
    if (this.mode === "minimal") return;

    for (const c of this.clouds) {
      if (!c.sprite.visible) continue;
      c.sprite.position.y = c.baseY + Math.sin(t * c.drift * 10) * 1.6;
      c.sprite.material.rotation += c.spin * dt;
    }
    for (const g of this.galaxies) g.mesh.rotation.z += g.spin * dt;
    for (const g of this.pointGalaxies) g.pts.rotation.y += g.spin * dt;
    for (const c of this.clusters) if (c.spin) c.obj.rotation.y += c.spin * dt;
    for (const s of this.spikes) {
      s.sprite.material.opacity = s.baseOp * (this.mode === "full" ? 1 : 0.6) * (0.75 + 0.25 * Math.sin(t * 1.1 + s.tw));
    }
    if (this.belt && this.beltGroup.visible) this.beltGroup.rotation.y = t * 0.02;
    for (const w of this.worlds) if (w.group.visible) w.mesh.rotation.y += w.spin * dt;
    for (const b of this.beams) {
      b.beam.rotation += dt * 0.32;
      b.glow.opacity = b.base * (this.mode === "full" ? 1 : 0.6) * (0.78 + 0.22 * Math.sin(t * 4.4));
    }

    if (this.mode !== "full") return;

    /* shooting stars */
    for (let i = 0; i < this.ssN; i++) {
      this.ssLife[i] += dt;
      if (!this.ssActive[i]) {
        if (this.ssLife[i] >= 0) {
          this.spawnShootingStar(i);
          this.ssActive[i] = true;
        } else {
          this.ssHeadCol.fill(0, i * 3, i * 3 + 3);
          this.ssCol.fill(0, i * 6, i * 6 + 6);
          continue;
        }
      } else if (this.ssLife[i] >= this.ssMax[i]) {
        this.ssActive[i] = false;
        this.ssLife[i] = -1.5 - this.rnd() * 6; // rest before the next one
        this.ssHeadCol.fill(0, i * 3, i * 3 + 3);
        this.ssCol.fill(0, i * 6, i * 6 + 6);
        continue;
      }
      const head = this.ssHead[i];
      head.addScaledVector(this.ssVel[i], dt);
      const k = this.ssLife[i] / this.ssMax[i];
      const I = Math.sin(Math.PI * k);
      const tail = head.clone().addScaledVector(this.ssVel[i], -0.16);
      this.ssPos.set([tail.x, tail.y, tail.z, head.x, head.y, head.z], i * 6);
      this.ssCol.set([0, 0, 0, 0.85 * I, 0.9 * I, 1 * I], i * 6);
      this.ssHeadPos.set([head.x, head.y, head.z], i * 3);
      this.ssHeadCol.set([I, I, I], i * 3);
    }
    (this.ssLine.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (this.ssLine.geometry.attributes.color as THREE.BufferAttribute).needsUpdate = true;
    (this.ssHeads.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (this.ssHeads.geometry.attributes.color as THREE.BufferAttribute).needsUpdate = true;

    /* comet: appears every so often and drifts slowly across the sky */
    if (this.cometT < 0) {
      this.cometT += dt;
      if (this.cometT >= 0) {
        this.launchComet();
        this.comet.visible = true;
      }
    } else {
      this.cometT += dt;
      this.comet.position.addScaledVector(this.cometDir, dt * 2.2);
      const k = this.cometT / 70;
      const f = Math.sin(Math.PI * Math.min(1, k));
      const fade = Math.min(1, f * 1.4);
      this.cometMats.forEach((m, i) => { (m as THREE.PointsMaterial).opacity = fade * COMET_OPS[i]; });
      if (k >= 1) {
        this.comet.visible = false;
        this.cometT = -(25 + this.rnd() * 35);
      }
    }
  }

  dispose() {
    this.disposed = true;
    window.clearTimeout(this.timer);
    this.group.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else if (mat) mat.dispose();
    });
    this.textures.forEach((t) => t.dispose());
    this.belt?.dispose();
    this.group.parent?.remove(this.group);
  }
}
