import * as THREE from "three";
import type { AtmosphereMode } from "./scene";

/**
 * Rainbow galactic centerpiece.
 *
 * Layer 1 is the Fibonacci / golden-angle spiral from rainbow-centerpiece.ts
 * (420 points, hue sweeping 0.09 → 0.71), now with a stronger presence:
 *   2. a wider golden-angle spiral that reaches the inner wheel
 *   3. a slowly turning rainbow halo disc (spectral wedges, radial mask)
 *   4. a warm white-gold heart glow and a faint prismatic bloom
 * Everything is decorative and parented to the chart group; it never touches
 * ephemeris-derived geometry.
 */

const GA = Math.PI * (3 - Math.sqrt(5)); // golden angle

function makeRainbowHaloTexture(): THREE.CanvasTexture {
  const S = 512;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  const cx = S / 2;
  /* spectral wedges (manual — avoids conic-gradient support gaps) */
  const steps = 360;
  for (let i = 0; i < steps; i++) {
    const a0 = (i / steps) * Math.PI * 2;
    const a1 = ((i + 1.6) / steps) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cx);
    ctx.arc(cx, cx, cx, a0, a1);
    ctx.closePath();
    ctx.fillStyle = `hsl(${(i / steps) * 360}, 88%, 62%)`;
    ctx.fill();
  }
  /* radial mask: soft ring with a luminous inner glow */
  ctx.globalCompositeOperation = "destination-in";
  const m = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx);
  m.addColorStop(0, "rgba(255,255,255,0.55)");
  m.addColorStop(0.22, "rgba(255,255,255,0.28)");
  m.addColorStop(0.55, "rgba(255,255,255,0.5)");
  m.addColorStop(0.78, "rgba(255,255,255,0.16)");
  m.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = m;
  ctx.fillRect(0, 0, S, S);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeHeartTexture(): THREE.CanvasTexture {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, "rgba(255,250,235,0.95)");
  g.addColorStop(0.12, "rgba(255,226,170,0.7)");
  g.addColorStop(0.32, "rgba(255,168,214,0.28)");
  g.addColorStop(0.55, "rgba(150,170,255,0.14)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function spiralPoints(count: number, radiusK: number, y: number, hueFrom: number, hueSpan: number, light: number) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const r = radiusK * Math.sqrt(i);
    const th = i * GA;
    pos[i * 3] = Math.cos(th) * r;
    pos[i * 3 + 1] = y + (i % 7) * 0.004;
    pos[i * 3 + 2] = Math.sin(th) * r;
    c.setHSL(hueFrom + (i / count) * hueSpan, 0.65, light + (i % 5) * 0.04);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return geo;
}

export class RainbowCenterpiece {
  readonly group = new THREE.Group();
  private core: THREE.Points;
  private coreMat: THREE.PointsMaterial;
  private wide: THREE.Points;
  private wideMat: THREE.PointsMaterial;
  private halo: THREE.Mesh;
  private haloMat: THREE.MeshBasicMaterial;
  private haloTex: THREE.CanvasTexture;
  private halo2: THREE.Mesh;
  private heart: THREE.Sprite;
  private heartMat: THREE.SpriteMaterial;
  private heartTex: THREE.CanvasTexture;
  private level = 1;

  constructor(parent: THREE.Object3D, dotTex: THREE.Texture) {
    /* 1 — the original fibonacci galactic centerpiece (420 points) */
    this.coreMat = new THREE.PointsMaterial({
      size: 0.13, map: dotTex, vertexColors: true, transparent: true, opacity: 0.9,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
    });
    this.core = new THREE.Points(spiralPoints(420, 0.12 * 0.32, 0.06, 0.09, 0.62, 0.55), this.coreMat);
    this.core.userData.baseOp = 0.9;

    /* 2 — wide full-spectrum golden-angle spiral */
    this.wideMat = new THREE.PointsMaterial({
      size: 0.075, map: dotTex, vertexColors: true, transparent: true, opacity: 0.55,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
    });
    this.wide = new THREE.Points(spiralPoints(520, 0.085, 0.05, 0.0, 1.0, 0.6), this.wideMat);
    this.wide.userData.baseOp = 0.55;

    /* 3 — spectral halo discs (counter-rotating) */
    this.haloTex = makeRainbowHaloTexture();
    this.haloMat = new THREE.MeshBasicMaterial({
      map: this.haloTex, transparent: true, opacity: 0.5, side: THREE.DoubleSide,
      depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const hg = new THREE.PlaneGeometry(1, 1);
    this.halo = new THREE.Mesh(hg, this.haloMat);
    this.halo.rotation.x = -Math.PI / 2;
    this.halo.position.y = 0.03;
    this.halo.scale.setScalar(3.4);
    this.halo.userData.baseOp = 0.5;
    this.halo2 = new THREE.Mesh(hg, this.haloMat);
    this.halo2.rotation.x = -Math.PI / 2;
    this.halo2.position.y = 0.045;
    this.halo2.scale.setScalar(2.1);

    /* 4 — luminous heart */
    this.heartTex = makeHeartTexture();
    this.heartMat = new THREE.SpriteMaterial({
      map: this.heartTex, transparent: true, opacity: 0.85,
      depthWrite: false, blending: THREE.AdditiveBlending,
    });
    this.heart = new THREE.Sprite(this.heartMat);
    this.heart.position.y = 0.12;
    this.heart.scale.setScalar(2.4);
    this.heart.userData.baseOp = 0.85;

    this.group.add(this.halo, this.halo2, this.wide, this.core, this.heart);
    parent.add(this.group);
  }

  setMode(mode: AtmosphereMode) {
    this.level = mode === "full" ? 1 : mode === "subtle" ? 0.55 : 0.25;
    this.coreMat.opacity = this.core.userData.baseOp * this.level;
    this.wideMat.opacity = this.wide.userData.baseOp * this.level;
    this.haloMat.opacity = this.halo.userData.baseOp * this.level;
    this.heartMat.opacity = this.heart.userData.baseOp * (0.5 + 0.5 * this.level);
    this.wide.visible = mode !== "minimal";
    this.halo2.visible = mode === "full";
  }

  update(t: number, dt: number) {
    this.core.rotation.y = t * 0.05;
    this.wide.rotation.y = -t * 0.028;
    this.halo.rotation.z += dt * 0.07;
    this.halo2.rotation.z -= dt * 0.11;
    const b = 0.92 + 0.08 * Math.sin(t * 0.9);
    this.heart.scale.setScalar(2.4 * b);
    this.heartMat.opacity = this.heart.userData.baseOp * (0.5 + 0.5 * this.level) * (0.9 + 0.1 * Math.sin(t * 1.3));
  }

  dispose() {
    this.haloTex.dispose();
    this.heartTex.dispose();
    this.haloMat.dispose();
    this.heartMat.dispose();
    this.coreMat.dispose();
    this.wideMat.dispose();
    this.core.geometry.dispose();
    this.wide.geometry.dispose();
    this.halo.geometry.dispose();
    this.group.parent?.remove(this.group);
  }
}
