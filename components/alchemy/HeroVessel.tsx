"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { STAGES } from "./data";
import {
  clamp,
  createLoop,
  createRenderer,
  glowTexture,
  nebulaTexture,
  prefersReducedMotion,
  sigilTexture,
  srgb,
} from "./three/util";

const R = 1.25; // glass body radius
const RL = 1.165; // liquid radius
const LEVEL = 0.27; // liquid surface height, relative to the body centre

/** Florence flask: round body, filleted shoulder, long neck, flared lip, inner neck wall. */
function flaskProfile(): THREE.Vector2[] {
  const pts: THREE.Vector2[] = [];
  const th1 = Math.acos(0.42 / R);
  const seg = 60;
  for (let i = 0; i <= seg; i++) {
    const th = -Math.PI / 2 + (th1 + Math.PI / 2) * (i / seg);
    pts.push(new THREE.Vector2(Math.max(0.0001, Math.cos(th) * R), Math.sin(th) * R));
  }
  const p0 = pts[pts.length - 1].clone();
  const shoulder = new THREE.CubicBezierCurve(
    p0,
    new THREE.Vector2(0.335, p0.y + 0.03),
    new THREE.Vector2(0.3, 1.38),
    new THREE.Vector2(0.3, 1.56),
  );
  shoulder.getPoints(16).slice(1).forEach((p) => pts.push(p));
  pts.push(new THREE.Vector2(0.3, 2.0));
  pts.push(new THREE.Vector2(0.3, 2.42));
  const lip = new THREE.CubicBezierCurve(
    new THREE.Vector2(0.3, 2.42),
    new THREE.Vector2(0.3, 2.57),
    new THREE.Vector2(0.33, 2.63),
    new THREE.Vector2(0.435, 2.665),
  );
  lip.getPoints(12).slice(1).forEach((p) => pts.push(p));
  pts.push(new THREE.Vector2(0.452, 2.69));
  pts.push(new THREE.Vector2(0.44, 2.715));
  pts.push(new THREE.Vector2(0.4, 2.722));
  pts.push(new THREE.Vector2(0.34, 2.7));
  pts.push(new THREE.Vector2(0.275, 2.6));
  pts.push(new THREE.Vector2(0.258, 2.42));
  pts.push(new THREE.Vector2(0.258, 1.62));
  return pts;
}

const WORLD_VERT = /* glsl */ `
varying vec3 vN;
varying vec3 vWorld;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const GLASS_BACK_FRAG = /* glsl */ `
varying vec3 vN;
varying vec3 vWorld;
void main() {
  vec3 N = -normalize(vN);
  vec3 V = normalize(cameraPosition - vWorld);
  float ndv = abs(dot(N, V));
  float fres = pow(1.0 - ndv, 2.0);
  vec3 col = mix(vec3(0.045, 0.025, 0.12), vec3(0.46, 0.34, 0.82), fres);
  gl_FragColor = vec4(col, 0.09 + fres * 0.42);
}`;

const GLASS_FRONT_FRAG = /* glsl */ `
uniform float uTime;
uniform float uGlow;
uniform vec3 uRim;
varying vec3 vN;
varying vec3 vWorld;

float strip(vec3 r, float cx, float wx, float cy, float wy) {
  float dx = (r.x - cx) / wx;
  float dy = (r.y - cy) / wy;
  return exp(-dx * dx - dy * dy) * smoothstep(-0.15, 0.35, r.z);
}

void main() {
  vec3 N = normalize(vN);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(cameraPosition - vWorld);
  float ndv = clamp(dot(N, V), 0.0, 1.0);
  float fres = pow(1.0 - ndv, 2.6);
  vec3 r = reflect(-V, N);

  vec3 col = vec3(0.0);
  // studio "windows": a tall warm key, its thin twin, a violet fill
  col += vec3(1.0, 0.95, 0.86) * strip(r, -0.52, 0.10, 0.30, 0.42) * 1.05;
  col += vec3(1.0, 0.95, 0.86) * strip(r, -0.30, 0.032, 0.34, 0.36) * 0.5;
  col += vec3(0.80, 0.70, 1.0) * strip(r, 0.66, 0.07, 0.05, 0.5) * 0.6;
  // warm bounce from the glowing liquid
  col += vec3(1.0, 0.80, 0.52) * strip(r, 0.1, 0.55, -0.8, 0.14) * 0.24 * (1.0 + uGlow);
  // a single hard spark
  col += vec3(1.0, 0.97, 0.9) * pow(max(dot(r, normalize(vec3(-0.45, 0.62, 0.64))), 0.0), 240.0) * 1.7;

  // rim + thin-film shimmer
  vec3 film = 0.5 + 0.5 * cos(6.2831 * (fres * 0.9 + vec3(0.0, 0.33, 0.67)) + uTime * 0.15);
  col += mix(uRim, film, 0.26) * fres * 0.9;
  col += uRim * 0.03;

  float a = clamp(max(col.r, max(col.g, col.b)) * 0.5, 0.0, 1.0);
  gl_FragColor = vec4(col, a);
}`;

const LIQUID_FRAG = /* glsl */ `
uniform float uTime;
uniform float uLevel;
uniform float uStir;
uniform float uRadius;
uniform vec3 uPlaneN;
uniform vec3 uCenter;
uniform vec3 uDeep;
uniform vec3 uMid;
uniform vec3 uAmber;
uniform vec3 uGold;
uniform vec3 uHot;
varying vec3 vN;
varying vec3 vWorld;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}
float fbm(vec3 p) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 4; i++) {
    s += a * noise(p);
    p = p * 2.03 + vec3(1.7, 9.2, 3.1);
    a *= 0.5;
  }
  return s;
}

void main() {
  vec3 rel = vWorld - uCenter;
  vec3 n = normalize(uPlaneN);
  float wave = sin(rel.x * 5.0 + uTime * 1.6) * 0.012 + sin(rel.z * 6.0 - uTime * 1.3) * 0.010;
  float lvl = uLevel + wave * (1.0 + uStir * 2.5);
  float hgt = dot(rel, n);
  float aa = max(fwidth(hgt) * 1.5, 0.0015);
  float alpha = 1.0 - smoothstep(lvl - aa, lvl, hgt);
  if (alpha <= 0.001) discard;

  vec3 V = normalize(cameraPosition - vWorld);
  vec3 col;

  if (gl_FrontFacing) {
    vec3 N = normalize(vN);
    float ndv = max(dot(N, V), 0.0);
    float h = clamp((hgt + uRadius) / (lvl + uRadius), 0.0, 1.0);

    // slow vortex
    float ang = uTime * (0.12 + uStir * 0.7) + h * 1.9;
    float ca = cos(ang);
    float sa = sin(ang);
    vec3 q = vec3(rel.x * ca - rel.z * sa, rel.y * 1.3 - uTime * 0.07, rel.x * sa + rel.z * ca);
    float f1 = fbm(q * 1.9);
    float f2 = fbm(q * 3.6 + f1 * 1.6);
    float veins = smoothstep(0.52, 0.80, f2);

    float hh = h + (f1 - 0.5) * 0.46;
    col = mix(uDeep, uMid, smoothstep(0.04, 0.54, hh));
    col = mix(col, uAmber, smoothstep(0.42, 0.84, hh));
    col = mix(col, uGold, smoothstep(0.76, 1.03, hh));
    col = mix(col, uGold, veins * (0.16 + 0.44 * h));
    col += uMid * smoothstep(0.62, 0.9, f1) * (1.0 - h) * 0.22;

    // the light that lives inside it
    vec3 oc = uCenter + vec3(0.0, -0.22, 0.0) - cameraPosition;
    float tt = dot(oc, -V);
    float d2 = max(dot(oc, oc) - tt * tt, 0.0);
    col += uHot * exp(-d2 * 11.0) * (0.5 + uStir * 0.4);
    col += uAmber * exp(-d2 * 2.4) * (0.10 + uStir * 0.12);

    // body shading + luminous edge
    col *= 0.6 + 0.4 * pow(ndv, 0.7);
    col += uMid * pow(1.0 - ndv, 2.4) * 0.4;

    // meniscus
    float m = smoothstep(lvl - 0.05, lvl - 0.004, hgt);
    col += uHot * m * 0.42;
  } else {
    // back faces seen through the cut become the liquid's surface
    vec3 dir = normalize(vWorld - cameraPosition);
    float denom = dot(dir, n);
    float t = (lvl - dot(cameraPosition - uCenter, n)) / (abs(denom) < 0.0001 ? -0.0001 : denom);
    vec3 s = cameraPosition + dir * t - uCenter;
    float rad = length(s.xz);
    float rimR = sqrt(max(uRadius * uRadius - lvl * lvl, 0.0001));
    float rim = smoothstep(rimR * 0.72, rimR, rad);
    float rip = 0.5 + 0.5 * sin(rad * 24.0 - uTime * 2.6);
    float sw = fbm(vec3(s.xz * 2.6, uTime * 0.22));
    col = mix(uAmber, uGold, 0.42 + sw * 0.6);
    col = mix(col, uHot, sw * 0.2 + rip * 0.07 * (1.0 + uStir * 2.0));
    col += uGold * rim * 0.12;
    col += uHot * smoothstep(rimR * 0.9, rimR, rad) * 0.42;
  }
  gl_FragColor = vec4(col, alpha);
}`;

const GOLD_VERT = /* glsl */ `
varying vec3 vNv;
void main() {
  vNv = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const GOLD_FRAG = /* glsl */ `
varying vec3 vNv;
void main() {
  vec3 N = normalize(vNv);
  float up = N.y * 0.5 + 0.5;
  vec3 base = mix(vec3(0.20, 0.10, 0.05), vec3(0.93, 0.70, 0.36), smoothstep(0.05, 0.95, up));
  float s1 = pow(max(dot(N, normalize(vec3(-0.45, 0.62, 0.64))), 0.0), 26.0);
  float s2 = pow(max(dot(N, normalize(vec3(0.7, -0.1, 0.7))), 0.0), 9.0);
  float fr = pow(1.0 - max(N.z, 0.0), 3.0);
  vec3 col = base + vec3(1.0, 0.94, 0.78) * s1 * 0.9 + vec3(0.62, 0.45, 0.95) * s2 * 0.28 + vec3(0.85, 0.65, 1.0) * fr * 0.3;
  gl_FragColor = vec4(col, 1.0);
}`;

const BUBBLE_VERT = /* glsl */ `
uniform float uTime;
uniform float uPx;
uniform float uStir;
uniform float uLevel;
attribute vec4 aSeed;
varying float vAlpha;
void main() {
  float speed = 0.045 + aSeed.y * 0.07;
  float t = fract(aSeed.x + uTime * speed * (1.0 + uStir * 2.2));
  float y = mix(-0.92, uLevel - 0.04, t);
  float maxr = sqrt(max(1.165 * 1.165 * 0.84 - y * y, 0.0));
  float ang = aSeed.z * 6.2832 + uTime * 0.35 * (aSeed.y - 0.5) + sin(uTime * 1.3 + aSeed.x * 30.0) * 0.25;
  float rr = maxr * (0.12 + 0.8 * sqrt(aSeed.w));
  vec3 p = vec3(cos(ang) * rr, y, sin(ang) * rr);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float size = (0.035 + aSeed.w * 0.06) * (0.6 + 0.4 * t);
  gl_PointSize = max(1.5, size * uPx / -mv.z);
  vAlpha = smoothstep(0.0, 0.12, t) * (1.0 - smoothstep(0.9, 1.0, t));
}`;

const BUBBLE_FRAG = /* glsl */ `
varying float vAlpha;
void main() {
  vec2 q = gl_PointCoord * 2.0 - 1.0;
  float d = length(q);
  if (d > 1.0) discard;
  float ring = smoothstep(0.5, 0.9, d) * (1.0 - smoothstep(0.9, 1.0, d));
  float body = (1.0 - d) * 0.10;
  float spec = smoothstep(0.34, 0.0, length(q - vec2(-0.36, -0.36)));
  vec3 col = vec3(1.0, 0.93, 0.78) * (ring * 0.7 + body) + vec3(1.0) * spec * 0.75;
  col *= vAlpha;
  gl_FragColor = vec4(col, max(col.r, col.g) * 0.3);
}`;

const VAPOUR_VERT = /* glsl */ `
uniform float uTime;
uniform float uPx;
uniform float uStir;
uniform float uSize;
attribute vec4 aSeed;
varying float vAlpha;
varying float vT;
void main() {
  float speed = 0.035 + aSeed.y * 0.045;
  float t = fract(aSeed.x + uTime * speed * (1.0 + uStir * 1.6));
  float y = mix(0.35, 4.3, t);
  float inside = 1.0 - smoothstep(2.6, 2.9, y);
  float envIn = mix(0.55, 0.16, smoothstep(0.35, 1.45, y));
  float sway = max(y - 2.72, 0.0);
  float envOut = 0.16 + sway * 0.5;
  float env = mix(envOut, envIn, inside);
  float ang = aSeed.z * 6.2832 + uTime * (0.5 + aSeed.y) + y * 1.4;
  float rr = env * sqrt(aSeed.w);
  vec3 p = vec3(cos(ang) * rr, y, sin(ang) * rr);
  p.x += sin(uTime * 0.6 + aSeed.x * 20.0 + y * 1.1) * 0.16 * sway;
  p.z += cos(uTime * 0.5 + aSeed.z * 20.0) * 0.12 * sway;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float size = (0.03 + aSeed.w * 0.05) * (1.0 + sway * 0.35) * uSize;
  gl_PointSize = max(1.0, size * uPx / -mv.z);
  float tw = 0.6 + 0.4 * sin(uTime * 5.0 * (0.5 + aSeed.y) + aSeed.x * 50.0);
  vAlpha = smoothstep(0.0, 0.06, t) * (1.0 - smoothstep(0.6, 1.0, t)) * mix(tw, 1.0, step(2.0, uSize));
  vT = t;
}`;

const VAPOUR_FRAG = /* glsl */ `
uniform float uGain;
varying float vAlpha;
varying float vT;
void main() {
  vec2 q = gl_PointCoord * 2.0 - 1.0;
  float d = length(q);
  float a = smoothstep(1.0, 0.0, d);
  a *= a;
  vec3 col = mix(vec3(1.0, 0.86, 0.55), vec3(0.78, 0.62, 1.0), smoothstep(0.3, 0.95, vT)) * a * vAlpha * uGain;
  gl_FragColor = vec4(col, a * vAlpha * uGain * 0.25);
}`;

function seedGeometry(count: number): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  const seeds = new Float32Array(count * 4);
  for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  return g;
}

export default function HeroVessel() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const renderer = createRenderer(canvas);
    if (!renderer) {
      setFailed(true);
      return;
    }

    const reduce = prefersReducedMotion();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    const rig = new THREE.Group();
    const flask = new THREE.Group();
    scene.add(rig);
    rig.add(flask);

    const glowTex = glowTexture();
    const disposables: { dispose(): void }[] = [glowTex];
    const additive = { blending: THREE.AdditiveBlending, premultipliedAlpha: true, transparent: true, depthWrite: false };

    const time = { value: 0 };
    const stir = { value: 0 };
    const px = { value: 600 };

    /* ---------- deep-field nebula sprites (Observatory palette) ---------- */
    const clouds: THREE.Sprite[] = [];
    const cloudSpec: { c0: [number, number, number]; c1: [number, number, number]; seed: number; pos: [number, number, number]; s: number; o: number }[] = [
      { c0: [46 / 255, 32 / 255, 110 / 255], c1: [150 / 255, 118 / 255, 240 / 255], seed: 1237, pos: [-1.3, 1.5, -7], s: 8.6, o: 0.6 },
      { c0: [74 / 255, 26 / 255, 96 / 255], c1: [225 / 255, 120 / 255, 205 / 255], seed: 9182, pos: [1.7, -0.5, -8], s: 8.2, o: 0.46 },
      { c0: [24 / 255, 34 / 255, 104 / 255], c1: [96 / 255, 140 / 255, 250 / 255], seed: 7331, pos: [0.3, 2.5, -9], s: 7.6, o: 0.34 },
    ];
    for (const spec of cloudSpec) {
      const tex = nebulaTexture(spec.c0, spec.c1, spec.seed);
      disposables.push(tex);
      const mat = new THREE.SpriteMaterial({
        map: tex,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        opacity: spec.o,
        rotation: Math.random() * Math.PI * 2,
      });
      const sp = new THREE.Sprite(mat);
      sp.position.set(...spec.pos);
      sp.scale.set(spec.s, spec.s, 1);
      sp.renderOrder = -3;
      scene.add(sp);
      clouds.push(sp);
    }

    const sprite = (color: string, scale: number, opacity: number, order: number) => {
      const mat = new THREE.SpriteMaterial({
        map: glowTex,
        color: new THREE.Color(color),
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        opacity,
      });
      const sp = new THREE.Sprite(mat);
      sp.scale.set(scale, scale, 1);
      sp.renderOrder = order;
      return sp;
    };

    const halo = sprite("#7c52e8", 9.5, 0.34, -2);
    halo.position.set(0, 0.5, -1.6);
    rig.add(halo);
    const aura = sprite("#ffb45e", 4.6, 0.3, -1);
    aura.position.set(0, -0.2, -0.8);
    rig.add(aura);

    /* ---------- sigil beneath ---------- */
    const sigilTex = sigilTexture();
    disposables.push(sigilTex);
    const sigil = new THREE.Mesh(
      new THREE.PlaneGeometry(4.0, 4.0),
      new THREE.MeshBasicMaterial({
        map: sigilTex,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    sigil.rotation.x = -Math.PI / 2;
    sigil.position.y = -1.74;
    sigil.renderOrder = 0;
    rig.add(sigil);
    const floorGlow = sprite("#b98cff", 5.2, 0.2, 0);
    floorGlow.position.set(0, -1.7, 0);
    floorGlow.scale.set(5.6, 1.9, 1);
    rig.add(floorGlow);

    /* ---------- glass ---------- */
    const flaskGeo = new THREE.LatheGeometry(flaskProfile(), 128);
    const glassBack = new THREE.Mesh(
      flaskGeo,
      new THREE.ShaderMaterial({
        vertexShader: WORLD_VERT,
        fragmentShader: GLASS_BACK_FRAG,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
      }),
    );
    glassBack.renderOrder = 1;
    flask.add(glassBack);

    const glassUniforms = { uTime: time, uGlow: stir, uRim: { value: srgb("#c9b2ff") } };
    const glassFront = new THREE.Mesh(
      flaskGeo,
      new THREE.ShaderMaterial({
        vertexShader: WORLD_VERT,
        fragmentShader: GLASS_FRONT_FRAG,
        uniforms: glassUniforms,
        side: THREE.FrontSide,
        ...additive,
      }),
    );
    glassFront.renderOrder = 5;
    flask.add(glassFront);

    /* ---------- liquid ---------- */
    const liquidUniforms = {
      uTime: time,
      uStir: stir,
      uLevel: { value: LEVEL },
      uRadius: { value: RL },
      uPlaneN: { value: new THREE.Vector3(0, 1, 0) },
      uCenter: { value: new THREE.Vector3() },
      uDeep: { value: srgb("#170640") },
      uMid: { value: srgb("#9a2c95") },
      uAmber: { value: srgb("#ff8c3c") },
      uGold: { value: srgb("#ffcc70") },
      uHot: { value: srgb("#fff0c4") },
    };
    const liquid = new THREE.Mesh(
      new THREE.SphereGeometry(RL, 96, 64),
      new THREE.ShaderMaterial({
        vertexShader: WORLD_VERT,
        fragmentShader: LIQUID_FRAG,
        uniforms: liquidUniforms,
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: true,
      }),
    );
    liquid.renderOrder = 2;
    flask.add(liquid);

    /* ---------- bubbles ---------- */
    const pointUniforms = { uTime: time, uPx: px, uStir: stir, uLevel: { value: LEVEL } };
    const bubbles = new THREE.Points(
      seedGeometry(64),
      new THREE.ShaderMaterial({
        vertexShader: BUBBLE_VERT,
        fragmentShader: BUBBLE_FRAG,
        uniforms: pointUniforms,
        depthTest: false,
        ...additive,
      }),
    );
    bubbles.frustumCulled = false;
    bubbles.renderOrder = 3;
    flask.add(bubbles);

    const core = sprite("#ffd590", 1.0, 0.5, 4);
    core.position.set(0, -0.22, 0);
    flask.add(core);
    const coreHot = sprite("#fff4d6", 0.3, 0.75, 4);
    coreHot.position.copy(core.position);
    flask.add(coreHot);

    /* ---------- vapour + mist ---------- */
    const makeVapour = (count: number, size: number, gain: number, order: number) => {
      const pts = new THREE.Points(
        seedGeometry(count),
        new THREE.ShaderMaterial({
          vertexShader: VAPOUR_VERT,
          fragmentShader: VAPOUR_FRAG,
          uniforms: { uTime: time, uPx: px, uStir: stir, uSize: { value: size }, uGain: { value: gain } },
          depthTest: false,
          ...additive,
        }),
      );
      pts.frustumCulled = false;
      pts.renderOrder = order;
      flask.add(pts);
      return pts;
    };
    makeVapour(170, 1, 0.95, 7);
    makeVapour(30, 9, 0.085, 6);
    const mouth = sprite("#ffd9a0", 1.3, 0.4, 6);
    mouth.position.set(0, 2.78, 0);
    flask.add(mouth);

    /* ---------- gilded collars ---------- */
    const goldMat = new THREE.ShaderMaterial({ vertexShader: GOLD_VERT, fragmentShader: GOLD_FRAG });
    const collarA = new THREE.Mesh(new THREE.TorusGeometry(0.318, 0.034, 16, 96), goldMat);
    collarA.rotation.x = Math.PI / 2;
    collarA.position.y = 1.6;
    flask.add(collarA);
    const collarB = new THREE.Mesh(new THREE.TorusGeometry(0.312, 0.022, 14, 96), goldMat);
    collarB.rotation.x = Math.PI / 2;
    collarB.position.y = 2.36;
    flask.add(collarB);
    const collarC = new THREE.Mesh(new THREE.TorusGeometry(0.312, 0.012, 10, 96), goldMat);
    collarC.rotation.x = Math.PI / 2;
    collarC.position.y = 1.68;
    flask.add(collarC);

    /* ---------- the orbit (brand mark, in three dimensions) ---------- */
    const lineMat = (opacity: number) =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#f0cb8d"),
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
    const orbit = new THREE.Group();
    orbit.quaternion
      .setFromEuler(new THREE.Euler(THREE.MathUtils.degToRad(72), 0, 0))
      .premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(24)));
    const ORBIT_R = 2.52;
    const orbitRing = new THREE.Mesh(new THREE.TorusGeometry(ORBIT_R, 0.0075, 6, 220), lineMat(0.62));
    orbitRing.renderOrder = 6;
    orbit.add(orbitRing);
    const orbitRing2 = new THREE.Mesh(new THREE.TorusGeometry(ORBIT_R * 1.035, 0.004, 6, 220), lineMat(0.25));
    orbitRing2.renderOrder = 6;
    orbit.add(orbitRing2);
    rig.add(orbit);

    const orbGeo = new THREE.SphereGeometry(0.062, 20, 16);
    const orbs = STAGES.map((s) => {
      const g = new THREE.Group();
      const m = new THREE.Mesh(orbGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(s.color) }));
      m.renderOrder = 6;
      g.add(m);
      const sp = sprite(s.color, 0.62, 0.7, 6);
      sp.material.depthTest = true;
      g.add(sp);
      orbit.add(g);
      return g;
    });

    const brandCircle = new THREE.Mesh(new THREE.TorusGeometry(1.74, 0.0045, 6, 200), lineMat(0.22));
    brandCircle.renderOrder = 6;
    rig.add(brandCircle);

    /* ---------- sizing ---------- */
    const size = new THREE.Vector2();
    const fit = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (!w || !h) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const d = Math.max(6.7 / (2 * tan), 6.2 / (2 * tan * camera.aspect));
      camera.position.set(0, 0.75 + d * 0.135, d);
      camera.lookAt(0, 0.75, 0);
      camera.updateProjectionMatrix();
      renderer.getDrawingBufferSize(size);
      px.value = size.y / (2 * tan);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    fit();

    /* ---------- interaction ---------- */
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, px: 0 };
    const slosh = { x: 0, z: 0, vx: 0, vz: 0 };
    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      pointer.tx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1.5, 1.5);
      pointer.ty = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1.5, 1.5);
    };
    const onDown = () => {
      stir.value = Math.min(1.4, stir.value + 1);
      const a = Math.random() * Math.PI * 2;
      slosh.vx += Math.cos(a) * 1.5;
      slosh.vz += Math.sin(a) * 1.5;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    wrap.addEventListener("pointerdown", onDown);

    /* ---------- loop ---------- */
    const speed = reduce ? 0.3 : 1;
    const centre = new THREE.Vector3();
    let first = true;
    const stopLoop = createLoop(wrap, (dt) => {
      const t = (time.value += dt * speed);
      pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 3.5);
      pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 3.5);
      const pvx = (pointer.x - pointer.px) / Math.max(dt, 0.001);
      pointer.px = pointer.x;

      slosh.vx += (-34 * slosh.x - 3.2 * slosh.vx - pvx * 1.1) * dt;
      slosh.vz += (-34 * slosh.z - 3.2 * slosh.vz) * dt;
      slosh.x = clamp(slosh.x + slosh.vx * dt, -0.3, 0.3);
      slosh.z = clamp(slosh.z + slosh.vz * dt, -0.3, 0.3);
      stir.value *= Math.exp(-dt * 0.8);

      flask.position.y = Math.sin(t * 0.8) * 0.05;
      flask.rotation.z = -pointer.x * 0.09 + slosh.x * 0.12;
      flask.rotation.x = pointer.y * 0.05;
      rig.rotation.y = pointer.x * 0.2;
      rig.rotation.x = pointer.y * 0.04;

      flask.getWorldPosition(centre);
      liquidUniforms.uCenter.value.copy(centre);
      liquidUniforms.uPlaneN.value.set(slosh.x + Math.sin(t * 0.7) * 0.016, 1, slosh.z + Math.cos(t * 0.6) * 0.012);

      const pulse = 1 + Math.sin(t * 1.7) * 0.07 + stir.value * 0.45;
      core.scale.setScalar(1.0 * pulse);
      coreHot.scale.setScalar(0.3 * pulse);
      aura.material.opacity = 0.3 + stir.value * 0.16;
      mouth.material.opacity = 0.36 + Math.sin(t * 2.3) * 0.06 + stir.value * 0.3;

      orbs.forEach((o, i) => {
        const a = t * 0.16 + (i / orbs.length) * Math.PI * 2;
        o.position.set(Math.cos(a) * ORBIT_R, Math.sin(a) * ORBIT_R, 0);
      });
      sigil.rotation.z = t * 0.045;
      clouds.forEach((c, i) => {
        c.material.rotation += dt * speed * 0.006 * (i % 2 ? -1 : 1);
      });

      renderer.render(scene, camera);
      if (first) {
        first = false;
        setReady(true);
      }
    });

    return () => {
      stopLoop();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerdown", onDown);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={wrapRef} className="al-vessel-stage" data-ready={ready} data-failed={failed}>
      <VesselPoster />
      <canvas ref={canvasRef} className="al-vessel-canvas" aria-hidden="true" />
    </div>
  );
}

/** Static illustration: shown while WebGL warms up, and kept if WebGL is unavailable. */
export function VesselPoster() {
  return (
    <svg className="al-vessel-poster" viewBox="0 0 400 520" aria-hidden="true">
      <defs>
        <radialGradient id="vp-halo" cx="50%" cy="62%" r="50%">
          <stop offset="0" stopColor="#ffc56e" stopOpacity=".5" />
          <stop offset=".45" stopColor="#8a5cf0" stopOpacity=".22" />
          <stop offset="1" stopColor="#8a5cf0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="vp-liq" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd486" />
          <stop offset=".35" stopColor="#f09a4c" />
          <stop offset=".7" stopColor="#8d2c8a" />
          <stop offset="1" stopColor="#1f0c4d" />
        </linearGradient>
        <clipPath id="vp-clip">
          <circle cx="200" cy="330" r="104" />
        </clipPath>
      </defs>
      <rect width="400" height="520" fill="url(#vp-halo)" />
      <g clipPath="url(#vp-clip)">
        <rect x="90" y="306" width="220" height="140" fill="url(#vp-liq)" />
        <ellipse cx="200" cy="306" rx="101" ry="11" fill="#ffe6ae" />
      </g>
      <path
        d="M176 96h48M180 100v124c-52 12-92 56-92 110 0 62 50 112 112 112s112-50 112-112c0-54-40-98-92-110V100"
        fill="none"
        stroke="#d9c4ff"
        strokeOpacity=".75"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M118 300c6-30 26-52 52-62" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="200" cy="330" rx="188" ry="52" fill="none" stroke="#f0cb8d" strokeOpacity=".5" transform="rotate(-24 200 330)" />
    </svg>
  );
}
