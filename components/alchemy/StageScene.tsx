"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { CSSProperties } from "react";
import * as THREE from "three";
import { buildFormation, MOTION, type Formation } from "./three/formations";
import { clamp, createLoop, createRenderer, glowTexture, prefersReducedMotion, sigilTexture } from "./three/util";

export type StageSceneHandle = {
  /** 0–1.6: agitation + brightness (fire being stoked, light let in). */
  setEnergy(v: number): void;
  /** Uniform scale of the matter (breathing). */
  setScale(v: number): void;
  /** Overall luminance, 0–1.2 (the darkness before fermentation). */
  setBright(v: number): void;
  /** One-off radiant burst. */
  pulse(v?: number): void;
};

type Engine = StageSceneHandle & {
  setStage(stage: number, tint?: string): void;
  dispose(): void;
};

const VERT = /* glsl */ `
uniform float uTime;
uniform float uMix;
uniform float uPx;
uniform float uEnergy;
uniform float uPulse;
uniform vec4 uMoA;
uniform vec4 uMoB;
uniform vec2 uAmbA;
uniform vec2 uAmbB;
uniform vec2 uSize;
attribute vec3 aTo;
attribute vec3 aColA;
attribute vec3 aColB;
attribute vec4 aRand;
attribute float aAmb;
varying vec3 vCol;
varying float vAlpha;

vec3 flow(vec3 p, vec4 mo, vec2 amb, out float life) {
  float r = length(p.xz);
  float a = mo.x * uTime * (0.7 + 0.6 * aRand.x) / (0.55 + r);
  float c = cos(a);
  float s = sin(a);
  p.xz = mat2(c, s, -s, c) * p.xz;
  vec3 dir = normalize(p + vec3(0.0001));
  p += dir * mo.w * sin(p.y * 4.5 + uTime * 1.5 + p.x * 3.0 + p.z * 2.0);
  p *= 1.0 + mo.z * sin(uTime * 0.9 + aRand.y * 0.8);
  vec3 j = vec3(
    sin(uTime * 3.1 * (0.5 + aRand.x) + aRand.y * 40.0),
    sin(uTime * 2.7 * (0.5 + aRand.z) + aRand.x * 40.0),
    sin(uTime * 3.7 * (0.5 + aRand.y) + aRand.z * 40.0));
  p += j * (mo.y + uEnergy * 0.035) * (0.4 + aRand.w);
  float cyc = fract(aRand.z * 7.0 + uTime * amb.x * (0.5 + aRand.x));
  float on = aAmb * step(0.0005, abs(amb.x));
  p.y += on * (cyc - 0.5) * amb.y;
  life = mix(1.0, sin(cyc * 3.14159), on);
  return p;
}

void main() {
  float la;
  float lb;
  vec3 pa = flow(position, uMoA, uAmbA, la);
  vec3 pb = flow(aTo, uMoB, uAmbB, lb);
  float m = clamp(uMix * 1.35 - aRand.w * 0.35, 0.0, 1.0);
  m = m * m * (3.0 - 2.0 * m);
  vec3 p = mix(pa, pb, m);
  float mid = sin(m * 3.14159);
  p += (aRand.xyz - 0.5) * mid * 1.1;
  p *= 1.0 + uPulse * 0.2;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float size = mix(uSize.x, uSize.y, m) * (0.55 + aRand.y * 0.9) * (1.0 + uEnergy * 0.45 + mid * 0.6);
  gl_PointSize = max(1.0, size * uPx / -mv.z);
  vCol = mix(aColA, aColB, m) * (1.0 + uEnergy * 0.55 + uPulse * 0.8);
  vAlpha = mix(la, lb, m);
}`;

const FRAG = /* glsl */ `
uniform float uBright;
varying vec3 vCol;
varying float vAlpha;
void main() {
  vec2 q = gl_PointCoord * 2.0 - 1.0;
  float d = length(q);
  float a = smoothstep(1.0, 0.0, d);
  a = a * a * (0.6 + 0.4 * a);
  float k = a * vAlpha * uBright;
  gl_FragColor = vec4(vCol * k, k * 0.32);
}`;

const ease = (m: number) => m * m * (3 - 2 * m);

function createEngine(
  wrap: HTMLDivElement,
  canvas: HTMLCanvasElement,
  initialStage: number,
  initialTint: string | undefined,
  onReady: () => void,
): Engine | null {
  const renderer = createRenderer(canvas);
  if (!renderer) return null;

  const reduce = prefersReducedMotion();
  const small = wrap.clientWidth < 520 || (navigator.hardwareConcurrency ?? 8) <= 4;
  const N = small ? 5600 : 9500;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  const rig = new THREE.Group();
  const group = new THREE.Group();
  scene.add(rig);
  rig.add(group);

  const cache = new Map<string, Formation>();
  const formation = (stage: number, tint?: string) => {
    const key = `${stage}|${tint ?? ""}`;
    let f = cache.get(key);
    if (!f) {
      f = buildFormation(stage, N, tint);
      cache.set(key, f);
    }
    return f;
  };

  const first = formation(initialStage, initialTint);
  const from = new Float32Array(first.pos);
  const to = new Float32Array(first.pos);
  const colA = new Float32Array(first.col);
  const colB = new Float32Array(first.col);
  const rand = new Float32Array(N * 4);
  for (let i = 0; i < rand.length; i++) rand[i] = Math.random();
  const amb = new Float32Array(N);
  const K = Math.floor(N * 0.82);
  for (let i = K; i < N; i++) amb[i] = 1;

  const geo = new THREE.BufferGeometry();
  const aFrom = new THREE.BufferAttribute(from, 3);
  const aTo = new THREE.BufferAttribute(to, 3);
  const aColA = new THREE.BufferAttribute(colA, 3);
  const aColB = new THREE.BufferAttribute(colB, 3);
  geo.setAttribute("position", aFrom);
  geo.setAttribute("aTo", aTo);
  geo.setAttribute("aColA", aColA);
  geo.setAttribute("aColB", aColB);
  geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 4));
  geo.setAttribute("aAmb", new THREE.BufferAttribute(amb, 1));

  const m0 = MOTION[initialStage];
  const uniforms = {
    uTime: { value: 0 },
    uMix: { value: 1 },
    uPx: { value: 600 },
    uEnergy: { value: 0 },
    uPulse: { value: 0 },
    uBright: { value: 1 },
    uMoA: { value: new THREE.Vector4(...m0.mo) },
    uMoB: { value: new THREE.Vector4(...m0.mo) },
    uAmbA: { value: new THREE.Vector2(...m0.amb) },
    uAmbB: { value: new THREE.Vector2(...m0.amb) },
    uSize: { value: new THREE.Vector2(m0.size, m0.size) },
  };
  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms,
    blending: THREE.AdditiveBlending,
    premultipliedAlpha: true,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });
  const points = new THREE.Points(geo, material);
  points.frustumCulled = false;
  group.add(points);

  const glowTex = glowTexture();
  const glowMat = new THREE.SpriteMaterial({
    map: glowTex,
    color: new THREE.Color(m0.glow),
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    opacity: 0.36,
  });
  const glow = new THREE.Sprite(glowMat);
  glow.scale.set(5.4, 5.4, 1);
  glow.renderOrder = -1;
  rig.add(glow);
  const glowFrom = new THREE.Color(m0.glow);
  const glowTo = new THREE.Color(m0.glow);

  const sigilTex = sigilTexture();
  const sigilMat = new THREE.MeshBasicMaterial({
    map: sigilTex,
    transparent: true,
    opacity: 0.46,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    side: THREE.DoubleSide,
  });
  const sigil = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 3.5), sigilMat);
  sigil.rotation.x = -Math.PI / 2;
  sigil.position.y = -1.62;
  sigil.renderOrder = -2;
  rig.add(sigil);

  const bufSize = new THREE.Vector2();
  const fit = () => {
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const d = Math.max(5.1 / (2 * tan), 4.6 / (2 * tan * camera.aspect));
    camera.position.set(0, 0.2 + d * 0.17, d);
    camera.lookAt(0, 0.02, 0);
    camera.updateProjectionMatrix();
    renderer.getDrawingBufferSize(bufSize);
    uniforms.uPx.value = bufSize.y / (2 * tan);
  };
  const ro = new ResizeObserver(fit);
  ro.observe(wrap);
  fit();

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMove = (e: PointerEvent) => {
    const r = wrap.getBoundingClientRect();
    pointer.tx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
    pointer.ty = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
  };
  const onLeave = () => {
    pointer.tx = 0;
    pointer.ty = 0;
  };
  wrap.addEventListener("pointermove", onMove);
  wrap.addEventListener("pointerleave", onLeave);

  let currentKey = `${initialStage}|${initialTint ?? ""}`;
  let spin = m0.spin;
  let spinT = m0.spin;
  let tilt = m0.tilt;
  let tiltT = m0.tilt;
  let energy = 0;
  let energyT = 0;
  let scale = 1;
  let scaleT = 1;
  let bright = 1;
  let brightT = 1;
  let pulse = 0;
  let firstFrame = true;
  const speed = reduce ? 0.35 : 1;

  const stopLoop = createLoop(wrap, (dt) => {
    uniforms.uTime.value += dt * speed;
    if (uniforms.uMix.value < 1) uniforms.uMix.value = Math.min(1, uniforms.uMix.value + dt / (reduce ? 1.2 : 2.3));
    const k = ease(uniforms.uMix.value);

    energy += (energyT - energy) * Math.min(1, dt * 5);
    scale += (scaleT - scale) * Math.min(1, dt * 4);
    bright += (brightT - bright) * Math.min(1, dt * 3);
    pulse *= Math.exp(-dt * 2.2);
    spin += (spinT - spin) * Math.min(1, dt * 1.5);
    tilt += (tiltT - tilt) * Math.min(1, dt * 1.5);
    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 3);
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 3);

    uniforms.uEnergy.value = energy;
    uniforms.uPulse.value = pulse;
    uniforms.uBright.value = bright;

    group.rotation.y += dt * speed * (spin + energy * 0.25);
    group.rotation.x = tilt;
    group.scale.setScalar(scale);
    rig.rotation.y = pointer.x * 0.4;
    rig.rotation.x = pointer.y * 0.14;

    glowMat.color.copy(glowFrom).lerp(glowTo, k);
    glowMat.opacity = (0.34 + energy * 0.22 + pulse * 0.3) * Math.min(1, bright + 0.15);
    const gs = 5.4 * (1 + pulse * 0.25) * (0.85 + scale * 0.15);
    glow.scale.set(gs, gs, 1);
    sigil.rotation.z -= dt * speed * 0.04;
    sigilMat.opacity = 0.4 + pulse * 0.3 + energy * 0.12;

    renderer.render(scene, camera);
    if (firstFrame) {
      firstFrame = false;
      onReady();
    }
  });

  return {
    setStage(stage, tint) {
      const key = `${stage}|${tint ?? ""}`;
      if (key === currentKey) return;
      currentKey = key;
      const m = uniforms.uMix.value;
      for (let i = 0; i < N; i++) {
        const mi = m >= 1 ? 1 : ease(clamp(m * 1.35 - rand[i * 4 + 3] * 0.35));
        for (let c = 0; c < 3; c++) {
          const p = i * 3 + c;
          from[p] += (to[p] - from[p]) * mi;
          colA[p] += (colB[p] - colA[p]) * mi;
        }
      }
      const f = formation(stage, tint);
      to.set(f.pos);
      colB.set(f.col);
      aFrom.needsUpdate = true;
      aTo.needsUpdate = true;
      aColA.needsUpdate = true;
      aColB.needsUpdate = true;

      const mo = MOTION[stage];
      const k = ease(m);
      uniforms.uMoA.value.lerp(uniforms.uMoB.value, k);
      uniforms.uMoB.value.set(...mo.mo);
      uniforms.uAmbA.value.lerp(uniforms.uAmbB.value, k);
      uniforms.uAmbB.value.set(...mo.amb);
      uniforms.uSize.value.set(uniforms.uSize.value.x + (uniforms.uSize.value.y - uniforms.uSize.value.x) * k, mo.size);
      uniforms.uMix.value = 0;
      glowFrom.copy(glowMat.color);
      glowTo.set(mo.glow);
      spinT = mo.spin;
      tiltT = mo.tilt;
    },
    setEnergy(v) {
      energyT = clamp(v, 0, 1.6);
    },
    setScale(v) {
      scaleT = clamp(v, 0.4, 1.6);
    },
    setBright(v) {
      brightT = clamp(v, 0, 1.2);
    },
    pulse(v = 1) {
      pulse = Math.max(pulse, v);
    },
    dispose() {
      stopLoop();
      ro.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      geo.dispose();
      material.dispose();
      glowTex.dispose();
      glowMat.dispose();
      sigilTex.dispose();
      sigilMat.dispose();
      sigil.geometry.dispose();
      renderer.dispose();
    },
  };
}

type Props = { stage: number; tint?: string; className?: string };

const StageScene = forwardRef<StageSceneHandle, Props>(function StageScene({ stage, tint, className }, ref) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const initial = useRef({ stage, tint });
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const engine = createEngine(wrap, canvas, initial.current.stage, initial.current.tint, () => setState("ready"));
    if (!engine) {
      setState("failed");
      return;
    }
    engineRef.current = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setStage(stage, tint);
  }, [stage, tint]);

  useImperativeHandle(
    ref,
    () => ({
      setEnergy: (v) => engineRef.current?.setEnergy(v),
      setScale: (v) => engineRef.current?.setScale(v),
      setBright: (v) => engineRef.current?.setBright(v),
      pulse: (v) => engineRef.current?.pulse(v),
    }),
    [],
  );

  return (
    <div
      ref={wrapRef}
      className={`al-scene ${className ?? ""}`}
      data-state={state}
      style={{ "--scene-glow": MOTION[stage].glow } as CSSProperties}
    >
      <div className="al-scene-fallback" aria-hidden="true" />
      <canvas ref={canvasRef} className="al-scene-canvas" aria-hidden="true" />
    </div>
  );
});

export default StageScene;
