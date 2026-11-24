import { clamp, makeRng, mixRGB, rgb, type RGB } from "./util";

export type StageMotion = {
  /** swirl, jitter, breath, wave */
  mo: [number, number, number, number];
  /** ambient rise speed (signed), ambient span */
  amb: [number, number];
  size: number;
  spin: number;
  tilt: number;
  glow: string;
};

/** Index 0–6 = the seven operations. Index 7 = prima materia (the unformed beginning). */
export const MOTION: StageMotion[] = [
  { mo: [0.06, 0.03, 0.02, 0.0], amb: [0.22, 2.8], size: 0.05, spin: 0.12, tilt: 0.12, glow: "#ff5a1f" },
  { mo: [0.14, 0.004, 0.035, 0.055], amb: [-0.07, 2.4], size: 0.046, spin: 0.1, tilt: 0.2, glow: "#3f7bff" },
  { mo: [0.2, 0.005, 0.02, 0.0], amb: [0.14, 1.7], size: 0.046, spin: 0.12, tilt: 0.22, glow: "#f2dfa0" },
  { mo: [0.0, 0.004, 0.03, 0.0], amb: [0.03, 0.6], size: 0.046, spin: 0.32, tilt: 0.34, glow: "#6fd69a" },
  { mo: [0.2, 0.006, 0.045, 0.02], amb: [0.05, 1.3], size: 0.048, spin: 0.14, tilt: 0.14, glow: "#a35cff" },
  { mo: [0.5, 0.004, 0.015, 0.0], amb: [-0.16, 2.6], size: 0.044, spin: 0.06, tilt: 0.2, glow: "#c4c9ff" },
  { mo: [0.0, 0.002, 0.02, 0.0], amb: [0.04, 0.5], size: 0.046, spin: 0.28, tilt: 0.16, glow: "#ffc45c" },
  { mo: [0.35, 0.012, 0.05, 0.04], amb: [0.03, 0.8], size: 0.05, spin: 0.08, tilt: 0.2, glow: "#8a6ad8" },
];

export const PRIMA = 7;

const TAU = Math.PI * 2;
const GOLDEN = 2.399963229728653;

export type Formation = { pos: Float32Array; col: Float32Array };

export function buildFormation(stage: number, N: number, tint?: string): Formation {
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const rnd = makeRng(9001 + stage * 131);
  const K = Math.floor(N * 0.82); // structured particles; the rest are ambient

  const put = (i: number, x: number, y: number, z: number, c: RGB, gain = 1) => {
    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;
    col[i * 3] = c[0] * gain;
    col[i * 3 + 1] = c[1] * gain;
    col[i * 3 + 2] = c[2] * gain;
  };
  const dir = (): [number, number, number] => {
    const u = rnd() * 2 - 1;
    const ph = rnd() * TAU;
    const s = Math.sqrt(1 - u * u);
    return [s * Math.cos(ph), u, s * Math.sin(ph)];
  };
  const fib = (i: number, n: number): [number, number, number] => {
    const y = 1 - (2 * (i + 0.5)) / n;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const ph = i * GOLDEN;
    return [Math.cos(ph) * r, y, Math.sin(ph) * r];
  };
  const gauss = () => (rnd() + rnd() + rnd() + rnd() - 2) / 2;

  switch (stage) {
    /* 1 · Calcination — a jagged ore, burning from within, embers rising */
    case 0: {
      const deep = rgb("#8a1a08");
      const mid = rgb("#ff6a1c");
      const hot = rgb("#ffd88a");
      for (let i = 0; i < K; i++) {
        const [dx, dy, dz] = dir();
        let n = 0.5 + 0.28 * Math.sin(dx * 5.1 + 1.3) * Math.sin(dy * 4.3 + 0.7) + 0.22 * Math.sin(dz * 6.2 + dx * 3.1);
        n = Math.round(n * 5) / 5;
        const shell = rnd() < 0.72 ? 1 : Math.cbrt(rnd());
        const r = 0.98 * (0.62 + 0.42 * n) * shell;
        const t = clamp(0.32 + dy * 0.45 + (rnd() - 0.5) * 0.5 + (1 - shell) * 0.5);
        const c = t < 0.5 ? mixRGB(deep, mid, t * 2) : mixRGB(mid, hot, (t - 0.5) * 2);
        put(i, dx * r, dy * r * 0.92 - 0.25, dz * r, c);
      }
      for (let i = K; i < N; i++) {
        const a = rnd() * TAU;
        const rr = 0.85 * Math.sqrt(rnd());
        put(i, Math.cos(a) * rr, 1.0 + (rnd() - 0.5) * 0.3, Math.sin(a) * rr, mixRGB(mid, hot, rnd()), 1.1);
      }
      break;
    }

    /* 2 · Dissolution — a sphere of water above spreading rings */
    case 1: {
      const deep = rgb("#2648d9");
      const aqua = rgb("#74e4ff");
      const foam = rgb("#e9fbff");
      const A = Math.floor(K * 0.64);
      for (let i = 0; i < A; i++) {
        const [dx, dy, dz] = fib(i, A);
        const c = rnd() < 0.08 ? foam : mixRGB(deep, aqua, (dy + 1) / 2);
        put(i, dx, dy - 0.02, dz, c);
      }
      for (let i = A; i < K; i++) {
        const ring = 1 + Math.floor(rnd() * 6);
        const rr = 0.42 + ring * 0.3 + (rnd() - 0.5) * 0.03;
        const a = rnd() * TAU;
        put(i, Math.cos(a) * rr, -1.3, Math.sin(a) * rr, mixRGB(aqua, deep, ring / 6), 1 - ring * 0.1);
      }
      for (let i = K; i < N; i++) {
        const [dx, dy, dz] = dir();
        const r = 1.35 + rnd() * 0.55;
        put(i, dx * r, dy * r, dz * r, foam, 0.8);
      }
      break;
    }

    /* 3 · Separation — essence rises bright, dross settles dark */
    case 2: {
      const e1 = rgb("#fff6d6");
      const e2 = rgb("#ffd978");
      const d1 = rgb("#6a57a0");
      const d2 = rgb("#3a2f66");
      const A = Math.floor(K * 0.46);
      for (let i = 0; i < A; i++) {
        const [dx, dy, dz] = fib(i, A);
        const rr = 0.52 * (rnd() < 0.7 ? 1 : Math.cbrt(rnd()));
        put(i, dx * rr, 0.9 + dy * rr, dz * rr, mixRGB(e2, e1, rnd() * 0.7), 0.82);
      }
      for (let i = A; i < K; i++) {
        const a = rnd() * TAU;
        const rr = 1.55 * Math.sqrt(rnd());
        const y = -1.15 + 0.22 * (rr / 1.55) ** 2 + (rnd() - 0.5) * 0.06;
        put(i, Math.cos(a) * rr, y, Math.sin(a) * rr, mixRGB(d2, d1, rnd()), 0.85);
      }
      for (let i = K; i < N; i++) {
        const a = rnd() * TAU;
        const rr = 0.14 * Math.sqrt(rnd());
        put(i, Math.cos(a) * rr, -0.1, Math.sin(a) * rr, e2);
      }
      break;
    }

    /* 4 · Conjunction — Sol and Luna, two rings linked, a new heart between */
    case 3: {
      const g1 = rgb("#ffc45a");
      const g2 = rgb("#fff0bd");
      const s1 = rgb("#9db8ff");
      const s2 = rgb("#f1f5ff");
      const h1 = rgb("#9af0b8");
      const h2 = rgb("#ffffff");
      const A = Math.floor(K * 0.44);
      const B = A * 2;
      const torus = (): [number, number, number] => {
        const u = rnd() * TAU;
        const v = rnd() * TAU;
        const rr = 0.07 * Math.sqrt(rnd());
        const R = 0.92 + rr * Math.cos(v);
        return [R * Math.cos(u), R * Math.sin(u), rr * Math.sin(v)];
      };
      for (let i = 0; i < A; i++) {
        const [x, y, z] = torus();
        put(i, x - 0.42, y, z, mixRGB(g1, g2, rnd() * 0.6), 0.74);
      }
      for (let i = A; i < B; i++) {
        const [x, y, z] = torus();
        put(i, x + 0.42, z, y, mixRGB(s1, s2, rnd() * 0.6), 0.74);
      }
      for (let i = B; i < K; i++) {
        put(i, gauss() * 0.17, gauss() * 0.17, gauss() * 0.17, mixRGB(h1, h2, rnd() * 0.6), 0.85);
      }
      for (let i = K; i < N; i++) {
        const [dx, dy, dz] = dir();
        const r = 1.5 + rnd() * 0.45;
        put(i, dx * r, dy * r, dz * r, h1, 0.7);
      }
      break;
    }

    /* 5 · Fermentation — the egg, the sprout of light, the peacock's tail */
    case 4: {
      const pal = ["#19d3c5", "#3b6eff", "#9a5cff", "#ff5fb8", "#ffd36b"].map(rgb);
      const sample = (h: number): RGB => {
        const f = (((h % 1) + 1) % 1) * pal.length;
        const i0 = Math.floor(f) % pal.length;
        return mixRGB(pal[i0], pal[(i0 + 1) % pal.length], f - Math.floor(f));
      };
      const A = Math.floor(K * 0.56);
      for (let i = 0; i < A; i++) {
        const [dx, dy, dz] = fib(i, A);
        const taper = 1 - 0.2 * (dy * 0.5 + 0.5);
        const hue = Math.atan2(dz, dx) / TAU + dy * 0.35 + 0.5;
        put(i, dx * 0.86 * taper, dy * 1.15, dz * 0.86 * taper, sample(hue), 0.9);
      }
      const warm = rgb("#ffe9a6");
      const white = rgb("#ffffff");
      for (let i = A; i < K; i++) {
        const h = (i - A) / (K - A);
        const ang = (i - A) * GOLDEN;
        const rr = 0.42 * Math.pow(Math.sin(Math.PI * h), 0.8) * (1 - 0.3 * h);
        put(i, Math.cos(ang) * rr, -0.75 + 1.5 * h, Math.sin(ang) * rr, mixRGB(warm, white, 1 - h), 1.1);
      }
      for (let i = K; i < N; i++) {
        const [dx, dy, dz] = dir();
        const r = 1.7 * Math.cbrt(rnd());
        put(i, dx * r, dy * r, dz * r, sample(rnd()), 0.8);
      }
      break;
    }

    /* 6 · Distillation — a rising vortex condensing to a single bright drop */
    case 5: {
      const lil = rgb("#8f7dff");
      const white = rgb("#ffffff");
      const pale = rgb("#cfd8ff");
      const pool = rgb("#5c50c0");
      const A = Math.floor(K * 0.7);
      const B = A + Math.floor(K * 0.16);
      for (let i = 0; i < A; i++) {
        const t = rnd();
        const ang = t * 4.5 * TAU + ((i % 3) * TAU) / 3 + (rnd() - 0.5) * 0.25;
        const rr = Math.pow(1 - t, 1.25) + 0.05 + (rnd() - 0.5) * 0.04;
        put(i, Math.cos(ang) * rr, -1.25 + 2.5 * t, Math.sin(ang) * rr, mixRGB(lil, white, t), 0.85 + 0.3 * t);
      }
      for (let i = A; i < B; i++) {
        put(i, gauss() * 0.15, 1.42 + gauss() * 0.15, gauss() * 0.15, mixRGB(pale, white, rnd()), 0.9);
      }
      for (let i = B; i < K; i++) {
        const a = rnd() * TAU;
        const rr = 1.15 * Math.sqrt(rnd());
        put(i, Math.cos(a) * rr, -1.3, Math.sin(a) * rr, pool);
      }
      for (let i = K; i < N; i++) {
        const a = rnd() * TAU;
        const rr = 1.3 + rnd() * 0.35;
        put(i, Math.cos(a) * rr, 0, Math.sin(a) * rr, pale);
      }
      break;
    }

    /* 7 · Coagulation — the Stone: a hexagonal bipyramid of gold light */
    case 6: {
      const t = tint ? rgb(tint) : rgb("#ffcf70");
      const gold = rgb("#ffd98a");
      const amber = rgb("#ff9a3c");
      const edgeC = mixRGB(rgb("#ffe2a0"), t, tint ? 0.5 : 0.2);
      const top: RGB = [0, 1.3, 0];
      const bot: RGB = [0, -1.3, 0];
      const eq: RGB[] = [];
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * TAU + Math.PI / 6;
        eq.push([0.76 * Math.cos(a), 0, 0.76 * Math.sin(a)]);
      }
      const edges: [RGB, RGB][] = [];
      const faces: [RGB, RGB, RGB][] = [];
      for (let k = 0; k < 6; k++) {
        const a = eq[k];
        const b = eq[(k + 1) % 6];
        edges.push([top, a], [bot, a], [a, b]);
        faces.push([top, a, b], [bot, a, b]);
      }
      const A = Math.floor(K * 0.34);
      const B = A + Math.floor(K * 0.5);
      for (let i = 0; i < A; i++) {
        const [a, b] = edges[i % edges.length];
        const s = rnd();
        const j = 0.008;
        put(
          i,
          a[0] + (b[0] - a[0]) * s + (rnd() - 0.5) * j,
          a[1] + (b[1] - a[1]) * s + (rnd() - 0.5) * j,
          a[2] + (b[2] - a[2]) * s + (rnd() - 0.5) * j,
          edgeC,
          0.68,
        );
      }
      for (let i = A; i < B; i++) {
        const fi = i % faces.length;
        const [a, b, c] = faces[fi];
        const su = Math.sqrt(rnd());
        const v = rnd();
        const w0 = 1 - su;
        const w1 = su * (1 - v);
        const w2 = su * v;
        const facet = mixRGB(mixRGB(amber, gold, (fi % 3) / 2), t, tint ? 0.55 : 0.2);
        put(
          i,
          a[0] * w0 + b[0] * w1 + c[0] * w2,
          a[1] * w0 + b[1] * w1 + c[1] * w2,
          a[2] * w0 + b[2] * w1 + c[2] * w2,
          facet,
          0.82,
        );
      }
      for (let i = B; i < K; i++) {
        put(i, gauss() * 0.26, gauss() * 0.4, gauss() * 0.26, mixRGB(rgb("#fff4d6"), mixRGB(gold, t, 0.35), rnd()), 0.72);
      }
      for (let i = K; i < N; i++) {
        const a = rnd() * TAU;
        const rr = 1.75 + (rnd() - 0.5) * 0.08;
        put(i, Math.cos(a) * rr, (rnd() - 0.5) * 0.04, Math.sin(a) * rr, mixRGB(gold, t, 0.45), 0.8);
      }
      break;
    }

    /* 0 · Prima materia — unformed, heavy, waiting */
    default: {
      const dim = rgb("#4a3a86");
      const t = tint ? rgb(tint) : rgb("#bba2dc");
      const gold = rgb("#f0cb8d");
      for (let i = 0; i < K; i++) {
        const [dx, dy, dz] = dir();
        const r = 1.25 * Math.pow(rnd(), 0.6);
        const bright = rnd() < 0.05;
        put(i, dx * r, dy * r * 0.82, dz * r, bright ? gold : mixRGB(dim, t, rnd() * rnd()), bright ? 1.1 : 0.78);
      }
      for (let i = K; i < N; i++) {
        const [dx, dy, dz] = dir();
        const r = 1.8 * Math.cbrt(rnd());
        put(i, dx * r, dy * r, dz * r, t, 0.6);
      }
    }
  }

  return { pos, col };
}
