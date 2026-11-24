import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { ChartData, PlanetView } from "./astro";
import { ASPECT_MAP, SIGNS } from "./astro";
import { RainbowCenterpiece } from "./rainbow-centerpiece";
import { CosmosExtras, SkyPlacer } from "./cosmos";

/* ---------------- constants ---------------- */

const WHEEL_R = 6;            // world radius of the outer rim
const PLANET_R = 5.1;         // world radius of the planet ring
const PX = (rp: number) => (rp / 1000) * WHEEL_R; // canvas-px → world

const GOLD = "#e5c185";
const GOLD_DIM = "rgba(229,193,133,";

interface SceneCallbacks {
  onHover: (p: PlanetView | null, x: number, y: number) => void;
  onSelect: (i: number | null) => void;
  onAspect?: (i: number | null) => void;
  /** fired when the adaptive monitor steps the atmosphere down */
  onPerfNote?: (mode: AtmosphereMode) => void;
}

export type LabelDetail = "glyph" | "detailed";

interface Options {
  aspects: boolean;
  labels: boolean;
  orbit: boolean;
  labelDetail: LabelDetail;
}

export type AtmosphereMode = "full" | "subtle" | "minimal";
export type ConnectionMode = "routed" | "exact";

interface Anim {
  start: number;
  dur: number;
  update: (k: number) => void;
  done: boolean;
  tag?: string;
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutBack = (t: number) => {
  const c1 = 1.20158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/* longitude λ → world position (zodiac runs counter-clockwise on screen) */
const lonToWorld = (lonDeg: number, rw: number, y = 0) => {
  const a = (lonDeg * Math.PI) / 180;
  return new THREE.Vector3(-Math.sin(a) * rw, y, -Math.cos(a) * rw);
};

/* ---------------- canvas helpers ---------------- */

function makeGlowTexture(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.55)");
  g.addColorStop(0.6, "rgba(255,255,255,0.12)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeRingTexture(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.strokeStyle = "rgba(255,255,255,0.95)";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(64, 64, 52, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.arc(64, 64, 52, 0, Math.PI * 2);
  ctx.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeDotTexture(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.5, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(c);
}

/* Procedural miniature surface: bands + speckle per world. Decorative only. */
function makePlanetTexture(id: string, tint: string): THREE.Texture {
  const W = 128, H = 64;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  const base = new THREE.Color(tint);
  ctx.fillStyle = `#${base.getHexString()}`;
  ctx.fillRect(0, 0, W, H);
  let seed = 7;
  for (let k = 0; k < id.length; k++) seed = (seed * 31 + id.charCodeAt(k)) >>> 0;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const bands: Record<string, string[]> = {
    jupiter: ["#e8d3ac", "#c98d5f", "#f2e4c4", "#b87a4e", "#e3c193"],
    saturn: ["#e9d9ae", "#d9c08a", "#f4e8c6", "#cbb287"],
    venus: ["#f2c9c0", "#e8a8a4", "#f7dcd4"],
    neptune: ["#5f86e8", "#3f62c8", "#7ba0f2"],
    uranus: ["#9fd8d4", "#86c4c4", "#b5e4e0"],
  };
  const palette = bands[id];
  if (palette) {
    let y = 0;
    while (y < H) {
      const h = 3 + rand() * 9;
      ctx.fillStyle = palette[Math.floor(rand() * palette.length)];
      ctx.globalAlpha = 0.35 + rand() * 0.4;
      /* wavy band edge */
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= W; x += 8) ctx.lineTo(x, y + Math.sin(x * 0.15 + y) * 1.6);
      ctx.lineTo(W, y + h); ctx.lineTo(0, y + h);
      ctx.closePath(); ctx.fill();
      y += h;
    }
    ctx.globalAlpha = 1;
  }
  /* speckle / mottle */
  const dots = id === "sun" ? 900 : 700;
  for (let i = 0; i < dots; i++) {
    const x = rand() * W, y = rand() * H;
    const r = 0.5 + rand() * (id === "moon" || id === "mercury" ? 3.2 : 1.8);
    const dark = rand() < 0.6;
    ctx.fillStyle = dark ? "rgba(20,12,8,0.25)" : "rgba(255,246,230,0.22)";
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  if (id === "moon" || id === "mercury") {
    /* maria blotches */
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = "rgba(30,30,44,0.28)";
      ctx.beginPath();
      ctx.ellipse(rand() * W, H * 0.25 + rand() * H * 0.5, 6 + rand() * 12, 4 + rand() * 8, rand() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (id === "mars") {
    ctx.fillStyle = "rgba(245,235,220,0.75)";
    ctx.fillRect(0, 0, W, 5);
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = "rgba(90,40,25,0.3)";
      ctx.beginPath();
      ctx.ellipse(rand() * W, H * 0.3 + rand() * H * 0.4, 5 + rand() * 10, 3 + rand() * 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (id === "neptune") {
    ctx.fillStyle = "rgba(20,30,90,0.5)";
    ctx.beginPath(); ctx.ellipse(W * 0.62, H * 0.6, 9, 5, 0, 0, Math.PI * 2); ctx.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* Planet label: the PLANET glyph is the large mark; the zodiac SIGN the planet
   occupies is a smaller companion glyph beside it, in gold, so the two are never
   confused. The detailed variant adds "Name · Sign degree" above. The variation
   selector forces text (not emoji) presentation on Apple devices. */
const TEXT_VS = "\uFE0E";
function makeLabelTextures(view: PlanetView): { glyph: THREE.CanvasTexture; detailed: THREE.CanvasTexture } {
  const make = (detailed: boolean) => {
    const c = document.createElement("canvas");
    c.width = 384; c.height = 192;
    const ctx = c.getContext("2d")!;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const rowY = detailed ? 142 : 132;
    // Transparent glyphs: no dark halo or black shadow.
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.fillStyle = view.color;
    ctx.font = '88px Marcellus, "Segoe UI Symbol", "Noto Sans Symbols", Georgia, serif';
    ctx.fillText(view.glyph + TEXT_VS, 178, rowY);
    ctx.fillStyle = "#e5c185";
    ctx.font = '46px Marcellus, "Segoe UI Symbol", "Noto Sans Symbols", Georgia, serif';
    ctx.fillText(SIGNS[view.sign].glyph + TEXT_VS, 252, rowY + 14);
    if (view.retro) {
      ctx.fillStyle = "#ff8a70";
      ctx.font = '26px Jost, sans-serif';
      ctx.fillText("℞", 292, rowY - 22);
    }
    if (detailed) {
      ctx.shadowBlur = 0;
      ctx.font = '30px Jost, "Segoe UI", sans-serif';
      ctx.fillStyle = "#ece5d3";
      ctx.fillText(`${view.name} · ${SIGNS[view.sign].name} ${view.degText.split("°")[0]}°`, 192, 46);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };
  return { glyph: make(false), detailed: make(true) };
}

/* ---------------- the wheel face texture ---------------- */

function drawWheel(ctx: CanvasRenderingContext2D, C: number, chart: ChartData | null) {
  ctx.clearRect(0, 0, C * 2, C * 2);

  const pt = (lon: number, rp: number): [number, number] => {
    const a = (lon * Math.PI) / 180;
    return [C - rp * Math.sin(a), C - rp * Math.cos(a)];
  };
  const circle = (rp: number, style: string, w: number) => {
    ctx.strokeStyle = style;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.arc(C, C, rp, 0, Math.PI * 2);
    ctx.stroke();
  };
  const spoke = (lon: number, r0: number, r1: number, style: string, w: number) => {
    const [x0, y0] = pt(lon, r0);
    const [x1, y1] = pt(lon, r1);
    ctx.strokeStyle = style;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  };

  /* glass disc base */
  let g = ctx.createRadialGradient(C, C, 0, C, C, 1000);
  g.addColorStop(0, "rgba(14,19,34,0.50)");
  g.addColorStop(0.62, "rgba(12,16,30,0.34)");
  g.addColorStop(0.85, "rgba(12,16,30,0.16)");
  g.addColorStop(1, "rgba(10,13,24,0.05)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(C, C, 999, 0, Math.PI * 2);
  ctx.fill();

  /* central ornament */
  g = ctx.createRadialGradient(C, C, 0, C, C, 300);
  g.addColorStop(0, "rgba(30,40,68,0.5)");
  g.addColorStop(1, "rgba(16,22,40,0.0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(C, C, 300, 0, Math.PI * 2);
  ctx.fill();
  circle(300, GOLD_DIM + "0.30)", 1);
  circle(180, GOLD_DIM + "0.16)", 1);
  for (let i = 0; i < 4; i++) {
    spoke(i * 90, 180, 300, GOLD_DIM + "0.16)", 1);
  }
  ctx.fillStyle = GOLD_DIM + "0.5)";
  ctx.beginPath();
  ctx.arc(C, C, 4, 0, Math.PI * 2);
  ctx.fill();

  /* degree ticks */
  for (let d = 0; d < 360; d++) {
    if (d % 30 === 0) spoke(d, 998, 852, GOLD_DIM + "0.55)", 2.5);
    else if (d % 10 === 0) spoke(d, 998, 948, GOLD_DIM + "0.38)", 1.4);
    else if (d % 5 === 0) spoke(d, 998, 962, GOLD_DIM + "0.26)", 1.1);
    else spoke(d, 998, 978, GOLD_DIM + "0.14)", 1);
  }

  /* degree numbers every 10° */
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = '300 24px Jost, sans-serif';
  for (let d = 0; d < 360; d += 10) {
    if (d % 30 === 0) continue;
    const a = (d * Math.PI) / 180;
    const rp = 916;
    ctx.save();
    ctx.translate(C - rp * Math.sin(a), C - rp * Math.cos(a));
    ctx.rotate(-a);
    ctx.fillStyle = GOLD_DIM + "0.42)";
    ctx.fillText(String(d % 30), 0, 0);
    ctx.restore();
  }

  /* zodiac glyphs */
  const glyphs = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
  ctx.font = '84px Marcellus, Georgia, serif';
  for (let s = 0; s < 12; s++) {
    const a = ((s + 0.5) * 30 * Math.PI) / 180;
    const rp = 888;
    ctx.save();
    ctx.translate(C - rp * Math.sin(a), C - rp * Math.cos(a));
    ctx.rotate(-a);
    ctx.shadowColor = "rgba(229,193,133,0.45)";
    ctx.shadowBlur = 14;
    ctx.fillStyle = "rgba(240,217,166,0.94)";
    ctx.fillText(glyphs[s], 0, 6);
    ctx.restore();
  }
  ctx.shadowBlur = 0;

  /* rim circles */
  circle(998, GOLD_DIM + "0.85)", 3);
  circle(994, GOLD_DIM + "0.18)", 1);
  circle(945, GOLD_DIM + "0.30)", 1.2);
  circle(852, GOLD_DIM + "0.42)", 1.6);
  circle(820, GOLD_DIM + "0.28)", 1);
  circle(690, GOLD_DIM + "0.55)", 1.6);
  circle(660, GOLD_DIM + "0.22)", 1);

  /* engraved guilloche: fine concentric turns between the bands */
  for (let r = 700; r <= 812; r += 8) {
    circle(r, GOLD_DIM + (r % 24 === 4 ? "0.10)" : "0.05)"), 0.8);
  }
  for (let r = 310; r <= 560; r += 14) {
    circle(r, GOLD_DIM + "0.05)", 0.8);
  }
  /* brushed-metal outer band: layered arcs of varying weight */
  circle(989, "rgba(255,240,200,0.28)", 1.4);
  circle(981, GOLD_DIM + "0.14)", 2.2);
  circle(972, "rgba(120,90,40,0.20)", 1.6);
  /* radial hairlines across the house band */
  for (let d = 0; d < 360; d += 5) {
    spoke(d, 818, 692, GOLD_DIM + "0.05)", 0.8);
  }
  /* faint star-dust etched into the glass */
  for (let i = 0; i < 110; i++) {
    const a = Math.random() * Math.PI * 2;
    const rp = 120 + Math.random() * 860;
    const x = C - rp * Math.sin(a), y = C - rp * Math.cos(a);
    ctx.fillStyle = `rgba(240,220,180,${0.04 + Math.random() * 0.1})`;
    ctx.beginPath();
    ctx.arc(x, y, 0.8 + Math.random() * 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

  if (chart) {
    /* house cusp spokes */
    for (let i = 0; i < 12; i++) {
      if (i === 0) continue; // ASC drawn separately, brighter
      spoke(chart.cusps[i], 820, 690, GOLD_DIM + "0.40)", 1.6);
    }
    /* house numbers */
    ctx.font = '36px Marcellus, Georgia, serif';
    for (let i = 0; i < 12; i++) {
      const start = chart.cusps[i];
      const end = chart.cusps[(i + 1) % 12];
      const mid = start + ((end - start + 360) % 360) / 2;
      const a = (mid * Math.PI) / 180;
      const rp = 756;
      ctx.save();
      ctx.translate(C - rp * Math.sin(a), C - rp * Math.cos(a));
      ctx.rotate(-a);
      ctx.fillStyle = GOLD_DIM + "0.62)";
      ctx.fillText(String(i + 1), 0, 0);
      ctx.restore();
    }
    /* MC spoke + label */
    spoke(chart.mcLon, 660, 560, GOLD_DIM + "0.75)", 2);
    {
      const a = (chart.mcLon * Math.PI) / 180;
      const rp = 618;
      ctx.save();
      ctx.translate(C - rp * Math.sin(a), C - rp * Math.cos(a));
      ctx.rotate(-a);
      ctx.font = '600 26px Jost, sans-serif';
      ctx.fillStyle = GOLD_DIM + "0.75)";
      ctx.fillText("M C", 0, 0);
      ctx.restore();
    }
    /* ASC spoke + label */
    spoke(chart.ascLon, 820, 690, "rgba(255,231,180,0.95)", 4);
    spoke(chart.ascLon, 820, 690, "rgba(255,231,180,0.35)", 9);
    {
      const a = (chart.ascLon * Math.PI) / 180;
      const rp = 756;
      ctx.save();
      ctx.translate(C - rp * Math.sin(a), C - rp * Math.cos(a));
      ctx.rotate(-a);
      ctx.font = '600 27px Jost, sans-serif';
      ctx.fillStyle = "rgba(255,231,180,0.95)";
      ctx.fillText("ASC", 0, 0);
      ctx.restore();
    }
  }
}

/* ---------------- the scene ---------------- */

export class NatalScene {
  private canvas: HTMLCanvasElement;
  private cb: SceneCallbacks;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private raf = 0;
  private clock = new THREE.Clock();
  private time = 0;

  private chartGroup = new THREE.Group();
  private wheelGroup = new THREE.Group();
  private wheelMesh: THREE.Mesh | null = null;
  private wheelTex: THREE.CanvasTexture | null = null;
  private wheelCanvas: HTMLCanvasElement;
  private rimMats: THREE.Material[] = [];
  private ascLine: THREE.Line | null = null;
  private ascSprite: THREE.Sprite | null = null;

  private planetGroup = new THREE.Group();
  private planets: {
    root: THREE.Group;
    core: THREE.Mesh;
    glow: THREE.Sprite;
    label: THREE.Sprite;
    labelTex: { glyph: THREE.CanvasTexture; detailed: THREE.CanvasTexture };
    leader: THREE.Line;
    /** smoothed screen-space offset of the label from its ideal spot, and the slot it chose */
    lbl: { ox: number; oy: number; t: number; l: number; init: boolean; pendingT: number; pendingL: number; stableFor: number };
    ring: THREE.Sprite;
    hit: THREE.Mesh;
    baseY: number;
    view: PlanetView;
  }[] = [];
  private labelGroup = new THREE.Group();

  private aspectGroup = new THREE.Group();
  private aspectLines: {
    group: THREE.Group; core: THREE.Mesh; halo: THREE.Mesh;
    curve: THREE.Curve<THREE.Vector3>; a: THREE.Vector3; b: THREE.Vector3;
    start: number; dur: number; mats: THREE.MeshBasicMaterial[];
    aspIndex: number; baseOpacity: number;
  }[] = [];
  private aspectHit: THREE.Mesh[] = [];

  /* atmosphere + centerpiece */
  private nebulaGroup = new THREE.Group();
  private nebMats: THREE.SpriteMaterial[] = [];
  private nebTexs: THREE.Texture[] = [];
  private dust: THREE.Points | null = null;
  private dustMat: THREE.PointsMaterial | null = null;
  private dustNear: THREE.Points | null = null;
  private dustNearMat: THREE.PointsMaterial | null = null;
  private halos: THREE.Sprite[] = [];
  private rainbow: RainbowCenterpiece | null = null;
  private cosmos: CosmosExtras | null = null;
  private aura: THREE.Sprite | null = null;
  private auraMat: THREE.SpriteMaterial | null = null;
  private keyLight: THREE.DirectionalLight | null = null;
  private atmosphere: AtmosphereMode = "full";
  private connection: ConnectionMode = "routed";
  private motionOn = true;

  /* selection pings (expanding focus rings) */
  private pings: { sprite: THREE.Sprite; mat: THREE.SpriteMaterial; t: number }[] = [];

  /* adaptive quality: fps monitor auto-reduces complexity */
  private perfAcc = 0;
  private perfN = 0;
  private perfCalmUntil = 0;

  /* responsive framing: bias + fit distance for the central viewing region */
  private biasXPx = 0;
  private biasYPx = 0;
  private fitDist: number | null = null;

  /* spotlight + pulse */
  private spotPlanets: Set<number> | null = null;
  private spotAspects: Set<number> | null = null;
  private pulseIdx: number | null = null;
  private pulseT = 0;
  private pulseMesh: THREE.Mesh | null = null;
  private selectedAspect: number | null = null;

  private stars: THREE.Points[] = [];
  private anims: Anim[] = [];
  private planetBorn: number[] = [];
  private chart: ChartData | null = null;

  private options: Options = { aspects: true, labels: true, orbit: true, labelDetail: "glyph" };
  private hoverIdx: number | null = null;
  private selectIdx: number | null = null;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;

  private raycaster = new THREE.Raycaster();
  private ndc = new THREE.Vector2();
  private downPos = { x: 0, y: 0 };

  private glowTex = makeGlowTexture();
  private ringTex = makeRingTexture();
  private dotTex = makeDotTexture();

  constructor(canvas: HTMLCanvasElement, cb: SceneCallbacks) {
    this.canvas = canvas;
    this.cb = cb;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);

    this.camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 500);
    this.camera.position.set(0, 17, 30);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.enablePan = false;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 32;
    this.controls.minPolarAngle = 0.12;
    this.controls.maxPolarAngle = 1.52; // a little more reach toward the horizon so the sky above the wheel can be seen
    this.controls.autoRotate = this.options.orbit;
    this.controls.autoRotateSpeed = 0.5;
    this.controls.target.set(0, 0.4, 0);

    /* cinematic lighting: warm key for planets/rims, violet rim, soft fill.
       Decorative only — positions and aspect geometry are never altered. */
    this.scene.add(new THREE.AmbientLight(new THREE.Color("#5a5f7e"), 0.85));
    this.keyLight = new THREE.DirectionalLight(new THREE.Color("#ffe6bd"), 1.6);
    this.keyLight.position.set(9, 12, 8);
    this.scene.add(this.keyLight);
    const rim = new THREE.DirectionalLight(new THREE.Color("#7f86ff"), 0.9);
    rim.position.set(-10, 4, -9);
    this.scene.add(rim);
    const under = new THREE.PointLight(new THREE.Color("#d8a94e"), 12, 30, 1.8);
    under.position.set(0, -3.5, 0);
    this.scene.add(under);

    this.wheelCanvas = document.createElement("canvas");
    this.wheelCanvas.width = this.wheelCanvas.height = 2048;
    this.scene.add(this.chartGroup);
    this.chartGroup.add(this.wheelGroup);
    this.chartGroup.add(this.planetGroup);
    this.chartGroup.add(this.aspectGroup);
    this.chartGroup.add(this.labelGroup);

    this.buildStars();
    this.buildAtmosphere();
    this.cosmos = new CosmosExtras(this.scene, this.dotTex, this.glowTex);
    /* remember base opacities for atmosphere scaling */
    this.stars.forEach((s) => {
      const m = s.material as THREE.PointsMaterial;
      m.userData.baseOp = m.opacity;
    });
    try {
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        this.motionOn = false;
        this.controls.autoRotate = false;
      }
    } catch { /* matchMedia unavailable */ }

    canvas.addEventListener("pointermove", this.onMove);
    canvas.addEventListener("pointerdown", this.onDown);
    canvas.addEventListener("pointerup", this.onUp);
    canvas.addEventListener("pointerleave", this.onLeave);
    this.controls.addEventListener("start", this.onCtrlStart);
    this.controls.addEventListener("end", this.onCtrlEnd);
    window.addEventListener("resize", this.onResize);
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => this.redrawWheel()).catch(() => {});
    }

    this.animate();
  }

  /* ---------- starfield ---------- */
  private buildStars() {
    const mk = (count: number, rMin: number, rMax: number, size: number, opacity: number, additive: boolean, warm: boolean) => {
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      const c = new THREE.Color();
      for (let i = 0; i < count; i++) {
        const r = rMin + Math.random() * (rMax - rMin);
        const th = Math.random() * Math.PI * 2;
        /* the camera looks down at the wheel, so most of the sky it can reach is
           below the horizon: sample sin(elevation) over the reachable sphere */
        const y = -1 + Math.random() * 1.75;
        const sq = Math.sqrt(1 - y * y);
        pos[i * 3] = r * sq * Math.cos(th);
        pos[i * 3 + 1] = r * y;
        pos[i * 3 + 2] = r * sq * Math.sin(th);
        const t = Math.random();
        if (warm) c.setHSL(0.08 + t * 0.05, 0.35, 0.65 + Math.random() * 0.3);
        else c.setHSL(0.58 + t * 0.08, 0.28, 0.6 + Math.random() * 0.35);
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      const mat = new THREE.PointsMaterial({
        size, map: this.dotTex, vertexColors: true, transparent: true, opacity,
        depthWrite: false, sizeAttenuation: true,
        blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      });
      const p = new THREE.Points(geo, mat);
      this.scene.add(p);
      this.stars.push(p);
      return p;
    };
    mk(2400, 60, 150, 0.5, 0.85, false, false);
    mk(700, 40, 130, 1.15, 0.9, true, true);

    /* faint milky way band */
    const count = 1900;
    const pos = new Float32Array(count * 3);
    const n = new THREE.Vector3(0.72, 0.3, 0.62).normalize(); // steeply inclined band: arches overhead and underfoot, never a horizon line
    const up = new THREE.Vector3(0, 1, 0);
    const u = new THREE.Vector3().crossVectors(n, up).normalize();
    const v = new THREE.Vector3().crossVectors(n, u);
    for (let i = 0; i < count; i++) {
      const th = Math.random() * Math.PI * 2;
      const g = (Math.random() + Math.random() + Math.random() - 1.5) * 0.28;
      const dir = u.clone().multiplyScalar(Math.cos(th)).add(v.clone().multiplyScalar(Math.sin(th))).add(n.clone().multiplyScalar(g)).normalize();
      const r = 120 + Math.random() * 30;
      pos[i * 3] = dir.x * r; pos[i * 3 + 1] = dir.y * r; pos[i * 3 + 2] = dir.z * r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.5, map: this.dotTex, color: new THREE.Color("#8fa3cf"),
      transparent: true, opacity: 0.30, depthWrite: false,
      blending: THREE.AdditiveBlending, sizeAttenuation: true,
    });
    const band = new THREE.Points(geo, mat);
    this.scene.add(band);
    this.stars.push(band);
  }

  /* ---------- wheel ---------- */
  private redrawWheel() {
    if (!this.chart) return;
    const ctx = this.wheelCanvas.getContext("2d")!;
    drawWheel(ctx, 1024, this.chart);
    if (this.wheelTex) this.wheelTex.needsUpdate = true;
  }

  private buildWheel(chart: ChartData) {
    /* clear previous */
    if (this.wheelMesh) {
      this.wheelGroup.remove(this.wheelMesh);
      this.wheelMesh.geometry.dispose();
      (this.wheelMesh.material as THREE.Material).dispose();
      this.wheelMesh = null;
    }
    if (this.wheelTex) { this.wheelTex.dispose(); this.wheelTex = null; }
    for (const m of this.rimMats) m.dispose();
    this.rimMats = [];
    if (this.ascLine) { this.wheelGroup.remove(this.ascLine); this.ascLine.geometry.dispose(); (this.ascLine.material as THREE.Material).dispose(); this.ascLine = null; }
    if (this.ascSprite) { this.wheelGroup.remove(this.ascSprite); (this.ascSprite.material as THREE.Material).dispose(); this.ascSprite = null; }

    drawWheel(this.wheelCanvas.getContext("2d")!, 1024, chart);
    this.wheelTex = new THREE.CanvasTexture(this.wheelCanvas);
    this.wheelTex.colorSpace = THREE.SRGBColorSpace;
    this.wheelTex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    const mat = new THREE.MeshBasicMaterial({
      map: this.wheelTex, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false,
    });
    this.wheelMesh = new THREE.Mesh(new THREE.PlaneGeometry(WHEEL_R * 2, WHEEL_R * 2), mat);
    this.wheelMesh.rotation.x = -Math.PI / 2;
    this.wheelMesh.position.y = 0;
    this.wheelGroup.add(this.wheelMesh);

    /* metallic-gold rings: standard material catches key + rim lights */
    const rim = (r: number, tube: number, color: string) => {
      const m = new THREE.MeshStandardMaterial({
        color, metalness: 0.88, roughness: 0.3,
        transparent: true, opacity: 0,
        emissive: new THREE.Color("#6b4d1c"), emissiveIntensity: 0.35,
      });
      const mesh = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 12, 240), m);
      mesh.rotation.x = Math.PI / 2;
      this.wheelGroup.add(mesh);
      this.rimMats.push(m);
      return m;
    };
    rim(WHEEL_R + 0.03, 0.02, "#e5c185");
    rim(WHEEL_R + 0.16, 0.05, "#d8a94e");
    rim(PX(690), 0.012, "#e5c185");

    /* ASC accent line */
    {
      const geo = new THREE.BufferGeometry().setFromPoints([
        lonToWorld(chart.ascLon, PX(690), 0.03),
        lonToWorld(chart.ascLon, PX(998) + 0.28, 0.03),
      ]);
      const m = new THREE.LineBasicMaterial({ color: "#ffe3b4", transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
      this.ascLine = new THREE.Line(geo, m);
      this.wheelGroup.add(this.ascLine);
      const s = new THREE.Sprite(new THREE.SpriteMaterial({
        map: this.glowTex, color: new THREE.Color("#ffe3b4"), transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      s.position.copy(lonToWorld(chart.ascLon, PX(998) + 0.28, 0.05));
      s.scale.setScalar(0.85);
      this.ascSprite = s;
      this.wheelGroup.add(s);
    }
  }

  /* ---------- planets ---------- */
  private buildPlanets(chart: ChartData) {
    for (const p of this.planets) {
      this.planetGroup.remove(p.root);
      p.core.geometry.dispose();
      const cm = p.core.material as THREE.MeshStandardMaterial;
      if (cm.map) cm.map.dispose();
      if (cm.emissiveMap && cm.emissiveMap !== cm.map) cm.emissiveMap.dispose();
      cm.dispose();
      (p.glow.material as THREE.Material).dispose();
      this.labelGroup.remove(p.label);
      this.labelGroup.remove(p.leader);
      (p.label.material as THREE.Material).dispose();
      p.labelTex.glyph.dispose();
      p.labelTex.detailed.dispose();
      p.leader.geometry.dispose();
      (p.leader.material as THREE.Material).dispose();
      (p.ring.material as THREE.Material).dispose();
      p.hit.geometry.dispose();
      (p.hit.material as THREE.Material).dispose();
    }
    this.planets = [];

    chart.planets.forEach((view, i) => {
      const root = new THREE.Group();
      const pos = lonToWorld(view.lon, PLANET_R, 0.02);
      root.position.copy(pos);

      const size = view.size;
      const surfTex = makePlanetTexture(view.id, view.color);
      const isSun = view.id === "sun";
      const coreMat = new THREE.MeshStandardMaterial({
        map: surfTex, roughness: 0.62, metalness: 0.12, transparent: true,
        emissive: isSun ? new THREE.Color("#ff8a30") : new THREE.Color("#000000"),
        emissiveMap: isSun ? surfTex : undefined,
        emissiveIntensity: isSun ? 0.85 : 0,
      });
      const core = new THREE.Mesh(new THREE.SphereGeometry(size, 30, 22), coreMat);
      /* tilt axes for character; gas giants spin visibly */
      core.rotation.z = view.id === "uranus" ? 1.4 : 0.18 + (i % 5) * 0.05;
      root.userData.spin = view.id === "jupiter" || view.id === "saturn" ? 0.35
        : view.id === "neptune" || view.id === "uranus" ? 0.22 : 0.08;
      root.add(core);

      /* Saturn's rings */
      if (view.id === "saturn") {
        const ringMat = new THREE.MeshBasicMaterial({
          color: "#e8d5a3", transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthWrite: false,
        });
        const saturnRing = new THREE.Mesh(new THREE.TorusGeometry(size * 1.9, size * 0.16, 8, 64), ringMat);
        saturnRing.rotation.x = Math.PI / 2 - 0.42;
        saturnRing.rotation.y = 0.25;
        root.add(saturnRing);
        (root as THREE.Group).userData.saturnRing = saturnRing;
      }

      const glow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: this.glowTex, color: new THREE.Color(view.color), transparent: true, opacity: 0.85,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      glow.scale.setScalar(size * 8.5);
      root.add(glow);

      /* labels live beside the planet (not inside it) so they can be anchored in
         SCREEN space above the world and de-collided; see updateLabels() */
      const labelTex = makeLabelTextures(view);
      const label = new THREE.Sprite(new THREE.SpriteMaterial({
        map: this.options.labelDetail === "detailed" ? labelTex.detailed : labelTex.glyph,
        transparent: true, opacity: 0, depthWrite: false, depthTest: false,
      }));
      label.renderOrder = 20;
      label.visible = false;
      this.labelGroup.add(label);
      const leader = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
        new THREE.LineBasicMaterial({ color: view.color, transparent: true, opacity: 0, depthTest: false, depthWrite: false }),
      );
      leader.renderOrder = 19;
      leader.visible = false;
      leader.frustumCulled = false;
      this.labelGroup.add(leader);

      const ring = new THREE.Sprite(new THREE.SpriteMaterial({
        map: this.ringTex, color: new THREE.Color(GOLD), transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      ring.scale.setScalar(1.7);
      root.add(ring);

      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(Math.max(size * 2.6, 0.42), 12, 10),
        new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false })
      );
      root.add(hit);
      hit.userData.index = i;

      root.scale.setScalar(0.0001);
      this.planetGroup.add(root);
      this.planets.push({ root, core, glow, label, labelTex, leader, lbl: { ox: 0, oy: 0, t: 0, l: 0, init: false, pendingT: 0, pendingL: 0, stableFor: 0 }, ring, hit, baseY: pos.y, view });
    });
  }

  /* ---------- atmosphere: organic nebula, gold dust, fibonacci core ---------- */

  /* deterministic value-noise fbm field for wispy, non-uniform clouds */
  private makeNoiseField(size: number, seed: number): Float32Array {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    const rand = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    const cells = [6, 12, 24, 48];
    const grids = cells.map((g) => {
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
          const cc = gr.arr[(y0 + 1) * w + x0], d = gr.arr[(y0 + 1) * w + x0 + 1];
          v += (a + (b - a) * sx + (cc - a) * sy + (a - b - cc + d) * sx * sy) * amp;
          tot += amp;
          amp *= 0.55;
        }
        field[y * size + x] = v / tot;
      }
    }
    return field;
  }

  /**
   * Organic cloud sprite: fbm density tints a deep base hue into a luminous
   * core hue, with soft radial falloff so clouds feel localized, not uniform.
   */
  private makeNebulaTexture(
    base: [number, number, number], core: [number, number, number],
    seed: number, density = 1, peakAlpha = 0.85,
  ): THREE.Texture {
    const S = 256;
    const field = this.makeNoiseField(S, seed);
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
        const a = Math.pow(d, 1.4) * fall * fall * peakAlpha;
        const mix = Math.pow(d, 1.8);
        const px = i * 4;
        img.data[px] = base[0] + (core[0] - base[0]) * mix;
        img.data[px + 1] = base[1] + (core[1] - base[1]) * mix;
        img.data[px + 2] = base[2] + (core[2] - base[2]) * mix;
        img.data[px + 3] = Math.round(a * 255);
      }
    }
    ctx.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  private buildAtmosphere() {
    /*
     * Layered deep-space: far / mid / near nebula shells at different depths
     * (parallax comes free from the perspective camera), dark pockets for
     * contrast, and a few luminous cores. Five shared organic textures keep
     * memory low while scales/rotations/positions vary the read.
     */
    const texViolet = this.makeNebulaTexture([46, 32, 110], [150, 118, 240], 1237, 1.0);
    const texIndigo = this.makeNebulaTexture([24, 34, 104], [96, 140, 250], 7331, 1.1);
    const texCobalt = this.makeNebulaTexture([16, 52, 130], [90, 180, 255], 4159, 0.95);
    const texMagenta = this.makeNebulaTexture([74, 26, 96], [225, 120, 205], 9182, 1.05);
    const texDark = this.makeNebulaTexture([4, 5, 14], [10, 12, 30], 2713, 1.3, 0.9);
    this.nebTexs.push(texViolet, texIndigo, texCobalt, texMagenta, texDark);

    interface Neb { t: THREE.Texture; pos: [number, number, number]; sx: number; sy: number; op: number; dark?: boolean; drift: number; spin: number }
    const nebs: Neb[] = [
      /* far shell — vast, dim, slow */
      { t: texIndigo, pos: [-52, 22, -120], sx: 150, sy: 110, op: 0.5, drift: 0.004, spin: 0.002 },
      { t: texViolet, pos: [58, -18, -130], sx: 170, sy: 120, op: 0.62, drift: -0.003, spin: -0.0016 },
      { t: texCobalt, pos: [6, 44, -140], sx: 190, sy: 130, op: 0.4, drift: 0.002, spin: 0.0012 },
      { t: texMagenta, pos: [-30, -48, -125], sx: 140, sy: 100, op: 0.34, drift: -0.0025, spin: 0.0018 },
      /* dark pockets — depth through contrast (normal blending) */
      { t: texDark, pos: [30, 30, -95], sx: 110, sy: 80, op: 0.55, dark: true, drift: 0.003, spin: -0.001 },
      { t: texDark, pos: [-48, -12, -105], sx: 120, sy: 90, op: 0.5, dark: true, drift: -0.002, spin: 0.0014 },
      /* mid shell — the visible “weather” */
      { t: texViolet, pos: [-30, 12, -60], sx: 66, sy: 52, op: 0.68, drift: 0.008, spin: 0.004 },
      { t: texCobalt, pos: [34, -10, -66], sx: 76, sy: 56, op: 0.46, drift: -0.007, spin: -0.003 },
      { t: texIndigo, pos: [4, -26, -58], sx: 58, sy: 44, op: 0.42, drift: 0.006, spin: 0.0035 },
      { t: texMagenta, pos: [-6, 30, -62], sx: 52, sy: 40, op: 0.36, drift: -0.006, spin: -0.004 },
      { t: texViolet, pos: [52, 26, -70], sx: 60, sy: 46, op: 0.5, drift: 0.005, spin: 0.0025 },
      { t: texCobalt, pos: [-56, -28, -72], sx: 64, sy: 48, op: 0.38, drift: -0.005, spin: -0.002 },
      /* near wisps — large, faint, fastest parallax */
      { t: texIndigo, pos: [-24, -6, -34], sx: 46, sy: 34, op: 0.22, drift: 0.012, spin: 0.006 },
      { t: texMagenta, pos: [26, 10, -36], sx: 42, sy: 32, op: 0.18, drift: -0.011, spin: -0.005 },
      /* luminous cores — brighter regions that feel lit from within */
      { t: texCobalt, pos: [-14, 18, -80], sx: 34, sy: 26, op: 0.5, drift: 0.004, spin: 0.003 },
      { t: texViolet, pos: [20, -22, -85], sx: 30, sy: 24, op: 0.62, drift: -0.004, spin: -0.0025 },
    ];
    /* the shell used to sit entirely behind the chart (z < 0) and vanished when the
       camera orbited to the far side. Re-place every layer on the whole sky,
       keeping each one's distance and angular size. */
    const placer = new SkyPlacer(5151);
    for (const n of nebs) {
      let d = Math.hypot(n.pos[0], n.pos[1], n.pos[2]);
      if (d < 60) { n.sx *= 62 / d; n.sy *= 62 / d; d = 62; } // keep near wisps clear of the orbiting camera
      const ang = (2 * Math.atan(n.sx / 2 / d) * 180) / Math.PI;
      const dir = placer.pick(ang * 0.35, { maxEl: 44 });
      n.pos = [dir.x * d, dir.y * d, dir.z * d];
    }
    for (const n of nebs) {
      const m = new THREE.SpriteMaterial({
        map: n.t, transparent: true, opacity: n.op, depthWrite: false,
        blending: n.dark ? THREE.NormalBlending : THREE.AdditiveBlending,
        rotation: Math.random() * Math.PI * 2,
      });
      const s = new THREE.Sprite(m);
      s.position.set(...n.pos);
      s.scale.set(n.sx, n.sy, 1);
      s.userData.baseOp = n.op;
      s.userData.drift = n.drift;
      s.userData.spin = n.spin;
      s.userData.baseX = n.pos[0];
      this.nebulaGroup.add(s);
      this.nebMats.push(m);
    }
    this.scene.add(this.nebulaGroup);

    /* occasional brighter stars with restrained halos */
    {
      const count = 150;
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      const c = new THREE.Color();
      const spots: { x: number; y: number; z: number; tint: string; s: number }[] = [];
      for (let i = 0; i < count; i++) {
        const r = 55 + Math.random() * 80;
        const th = Math.random() * Math.PI * 2;
        const yy = -1 + Math.random() * 1.75;
        const sq = Math.sqrt(1 - yy * yy);
        const x = r * sq * Math.cos(th);
        const y = r * yy;
        const z = r * sq * Math.sin(th);
        pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
        const pick = Math.random();
        if (pick < 0.55) c.set("#dfe8ff");
        else if (pick < 0.8) c.set("#fff3d9");
        else c.set("#cdd4ff");
        const b = 0.75 + Math.random() * 0.25;
        col[i * 3] = c.r * b; col[i * 3 + 1] = c.g * b; col[i * 3 + 2] = c.b * b;
        if (i % 10 === 0) spots.push({ x, y, z, tint: pick < 0.6 ? "#e8efff" : "#ffedc9", s: 1.6 + Math.random() * 2.2 });
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      const mat = new THREE.PointsMaterial({
        size: 1.05, map: this.dotTex, vertexColors: true, transparent: true, opacity: 0.95,
        depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
      });
      mat.userData.baseOp = 0.95;
      const bright = new THREE.Points(geo, mat);
      this.scene.add(bright);
      this.stars.push(bright);
      /* halo sprites for a handful of the brightest */
      for (const sp of spots.slice(0, 15)) {
        const hm = new THREE.SpriteMaterial({
          map: this.glowTex, color: new THREE.Color(sp.tint), transparent: true,
          opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false,
        });
        const h = new THREE.Sprite(hm);
        h.position.set(sp.x, sp.y, sp.z);
        h.scale.setScalar(sp.s);
        h.userData.baseOp = 0.35;
        h.userData.tw = Math.random() * Math.PI * 2;
        this.scene.add(h);
        this.halos.push(h);
      }
    }

    /* golden atmospheric particles (mid-field) */
    {
      const count = 420;
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const r = 2 + Math.random() * 11;
        const th = Math.random() * Math.PI * 2;
        pos[i * 3] = Math.cos(th) * r;
        pos[i * 3 + 1] = -1 + Math.random() * 5;
        pos[i * 3 + 2] = Math.sin(th) * r;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      this.dustMat = new THREE.PointsMaterial({
        size: 0.075, map: this.dotTex, color: new THREE.Color("#e9c886"),
        transparent: true, opacity: 0.55, depthWrite: false,
        blending: THREE.AdditiveBlending, sizeAttenuation: true,
      });
      this.dust = new THREE.Points(geo, this.dustMat);
      this.dust.userData.baseOp = 0.55;
      this.scene.add(this.dust);
    }

    /* near-field stardust — larger, slower, strongest parallax */
    {
      const count = 260;
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      const c = new THREE.Color();
      for (let i = 0; i < count; i++) {
        const r = 14 + Math.random() * 22;
        const th = Math.random() * Math.PI * 2;
        pos[i * 3] = Math.cos(th) * r;
        pos[i * 3 + 1] = -6 + Math.random() * 14;
        pos[i * 3 + 2] = Math.sin(th) * r - 6;
        c.set(Math.random() < 0.6 ? "#f0d49a" : "#cfd8ff").multiplyScalar(0.55 + Math.random() * 0.45);
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      this.dustNearMat = new THREE.PointsMaterial({
        size: 0.16, map: this.dotTex, vertexColors: true,
        transparent: true, opacity: 0.5, depthWrite: false,
        blending: THREE.AdditiveBlending, sizeAttenuation: true,
      });
      this.dustNear = new THREE.Points(geo, this.dustNearMat);
      this.dustNear.userData.baseOp = 0.5;
      this.scene.add(this.dustNear);
    }

    /* rainbow fibonacci galactic centerpiece (see rainbow-centerpiece.ts) */
    this.rainbow = new RainbowCenterpiece(this.chartGroup, this.dotTex);

    /* restrained pulse bead for aspect travel */
    {
      const m = new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
      this.pulseMesh = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), m);
      this.pulseMesh.visible = false;
      this.chartGroup.add(this.pulseMesh);
    }

    /* faint luminous aura behind the chart — distinct from nebula */
    {
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      const ctx = c.getContext("2d")!;
      const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      g.addColorStop(0, "rgba(255,226,170,0.55)");
      g.addColorStop(0.3, "rgba(216,169,78,0.22)");
      g.addColorStop(0.55, "rgba(139,124,246,0.12)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 256);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      this.auraMat = new THREE.SpriteMaterial({
        map: tex, transparent: true, opacity: 0.5,
        blending: THREE.AdditiveBlending, depthWrite: false,
      });
      this.aura = new THREE.Sprite(this.auraMat);
      this.aura.position.set(0, 0.1, -1.8);
      this.aura.scale.set(21, 21, 1);
      this.aura.userData.baseOp = 0.5;
      this.scene.add(this.aura);
    }
  }

  /* ---------- aspects: solid neon beams, controlled glow ---------- */
  private beamCurve(a: THREE.Vector3, b: THREE.Vector3): THREE.Curve<THREE.Vector3> {
    if (this.connection === "exact") {
      return new THREE.LineCurve3(a.clone(), b.clone());
    }
    /* routed: bow gently via a control point pulled 22% toward center */
    const mid = a.clone().add(b.clone()).multiplyScalar(0.5);
    const inward = mid.clone().multiplyScalar(0.78);
    inward.y = 0.055;
    return new THREE.QuadraticBezierCurve3(a.clone(), inward, b.clone());
  }

  private buildAspects(chart: ChartData, animate = true) {
    for (const a of this.aspectLines) {
      this.aspectGroup.remove(a.group);
      a.core.geometry.dispose();
      a.halo.geometry.dispose();
      a.mats.forEach((m) => m.dispose());
    }
    this.aspectLines = [];
    this.aspectHit = [];
    chart.aspects.forEach((asp, i) => {
      const def = ASPECT_MAP[asp.type];
      const a = lonToWorld(chart.planets[asp.a].lon, PLANET_R, 0.055);
      const b = lonToWorld(chart.planets[asp.b].lon, PLANET_R, 0.055);
      const curve = this.beamCurve(a, b);
      const group = new THREE.Group();
      /* halo: wider, very restrained */
      const haloMat = new THREE.MeshBasicMaterial({
        color: def.color, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false,
      });
      const halo = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.035, 6, false), haloMat);
      /* core: solid, defined */
      const coreMat = new THREE.MeshBasicMaterial({
        color: "#ffffff", transparent: true, opacity: 0, depthWrite: false,
      });
      const core = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.013, 6, false), coreMat);
      const tint = new THREE.MeshBasicMaterial({
        color: def.color, transparent: true, opacity: 0, depthWrite: false,
      });
      const tintMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.02, 6, false), tint);
      group.add(halo, tintMesh, core);
      /* invisible fat tube for easy picking */
      const hit = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 12, 0.22, 6, false),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hit.userData.aspIndex = i;
      group.add(hit);
      this.aspectHit.push(hit);
      this.aspectGroup.add(group);
      this.aspectLines.push({
        group, core, halo: tintMesh, curve, a, b,
        start: animate ? 2.05 + i * 0.06 : -1, dur: 0.7,
        mats: [haloMat, tint, coreMat], aspIndex: i, baseOpacity: 1,
      });
      if (!animate) {
        haloMat.opacity = 0.16; tint.opacity = 0.85; coreMat.opacity = 0.95;
      }
    });
  }

  /* ---------- public API ---------- */
  hideChart() {
    this.chartGroup.visible = false;
  }

  setChart(chart: ChartData) {
    this.chart = chart;
    this.chartGroup.visible = true;
    this.selectIdx = null;
    this.hoverIdx = null;
    this.selectedAspect = null;
    this.pulseIdx = null;
    if (this.pulseMesh) this.pulseMesh.visible = false;
    this.clearSpotlight();
    this.anims = [];
    /* orient the wheel so the ascendant — your first house — faces the viewer */
    this.chartGroup.rotation.y = ((180 - chart.ascLon) * Math.PI) / 180;
    this.buildWheel(chart);
    this.buildPlanets(chart);
    this.buildAspects(chart);
    this.aspectGroup.visible = this.options.aspects;

    const t0 = this.time;
    this.planetBorn = this.planets.map((_, i) => t0 + 0.75 + i * 0.12 + 0.55);
    this.aspectLines.forEach((a) => { a.start = t0 + a.start; });
    const camFrom = this.camera.position.clone();
    const camBase = new THREE.Vector3(0, 8.6, 15.2);
    const camTo = this.fitDist ? camBase.setLength(this.fitDist) : camBase;
    this.anims.push({
      start: t0, dur: 3.0, done: false, tag: "cam",
      update: (k) => {
        const e = easeInOut(k);
        this.camera.position.lerpVectors(camFrom, camTo, e);
      },
    });
    const disc = this.wheelMesh!;
    const discMat = disc.material as THREE.MeshBasicMaterial;
    this.anims.push({
      start: t0 + 0.25, dur: 1.7, done: false,
      update: (k) => {
        discMat.opacity = k;
        this.wheelGroup.scale.setScalar(0.62 + 0.38 * easeOutBack(Math.min(1, k)));
        this.rimMats.forEach((m, i) => {
          (m as THREE.MeshBasicMaterial).opacity = (i === 0 ? 0.9 : i === 1 ? 0.16 : 0.35) * k;
        });
        if (this.ascLine) (this.ascLine.material as THREE.LineBasicMaterial).opacity = 0.9 * k;
        if (this.ascSprite) (this.ascSprite.material as THREE.SpriteMaterial).opacity = 0.9 * k;
      },
    });
    this.planets.forEach((p, i) => {
      this.anims.push({
        start: t0 + 0.75 + i * 0.12, dur: 0.55, done: false,
        update: (k) => {
          const s = Math.max(0.0001, easeOutBack(k));
          p.root.scale.setScalar(s);
          (p.glow.material as THREE.SpriteMaterial).opacity = 0.85 + 0.6 * (1 - k);
        },
      });
    });
    this.aspectLines.forEach((a) => {
      this.anims.push({
        start: a.start, dur: a.dur, done: false,
        update: (k) => {
          const e = easeInOut(k);
          /* draw-on: reveal beam along its length */
          const total = 24;
          const show = Math.max(2, Math.floor(total * e));
          const frac = show / total;
          a.core.scale.setScalar(1);
          (a.core.material as THREE.MeshBasicMaterial).opacity = 0.95 * e;
          (a.halo.material as THREE.MeshBasicMaterial).opacity = 0.85 * e;
          (a.mats[0] as THREE.MeshBasicMaterial).opacity = 0.16 * e;
          a.group.visible = k > 0.01;
          void frac;
        },
      });
    });
  }

  /* ---------- public: focus, pulse, atmosphere, quality ---------- */

  /** Spotlight real chart elements; everything else dims but stays visible. */
  setSpotlight(planets: number[] | null, aspects: number[] | null) {
    this.spotPlanets = planets ? new Set(planets) : null;
    this.spotAspects = aspects ? new Set(aspects) : null;
  }

  clearSpotlight() {
    this.spotPlanets = null;
    this.spotAspects = null;
  }

  /** Restrained illuminated pulse travelling along one connection. */
  pulseAspect(chartIdx: number | null) {
    this.pulseIdx = chartIdx;
    this.pulseT = 0;
    if (this.pulseMesh) {
      this.pulseMesh.visible = chartIdx !== null && this.motionOn;
      if (chartIdx !== null) {
        const line = this.aspectLines.find((l) => l.aspIndex === chartIdx);
        if (line) (this.pulseMesh.material as THREE.MeshBasicMaterial).color.set(ASPECT_MAP[this.chart!.aspects[chartIdx].type].color);
      }
    }
  }

  selectAspect(chartIdx: number | null) {
    this.selectedAspect = chartIdx;
    this.pulseAspect(chartIdx);
  }

  setAtmosphere(mode: AtmosphereMode) {
    this.atmosphere = mode;
    /* manual choice calms the adaptive monitor for a while */
    this.perfAcc = 0; this.perfN = 0;
    this.perfCalmUntil = this.time + 6;
    const neb = mode === "full" ? 1 : mode === "subtle" ? 0.4 : 0;
    this.nebulaGroup.visible = neb > 0;
    this.nebMats.forEach((m) => { m.opacity = (m as THREE.SpriteMaterial).userData.baseOp ?? m.opacity; });
    this.nebulaGroup.children.forEach((s) => {
      const base = (s as THREE.Sprite).userData.baseOp ?? 0.14;
      ((s as THREE.Sprite).material as THREE.SpriteMaterial).opacity = base * neb;
    });
    if (this.dust) {
      this.dust.visible = mode !== "minimal";
      if (this.dustMat) this.dustMat.opacity = (this.dust.userData.baseOp ?? 0.55) * (mode === "full" ? 1 : 0.45);
    }
    if (this.dustNear) {
      this.dustNear.visible = mode === "full";
      if (this.dustNearMat) this.dustNearMat.opacity = this.dustNear.userData.baseOp ?? 0.5;
    }
    for (const h of this.halos) {
      h.visible = mode !== "minimal";
    }
    if (this.aura && this.auraMat) {
      this.aura.visible = true;
      this.auraMat.opacity = (this.aura.userData.baseOp ?? 0.5) * (mode === "minimal" ? 0.55 : 1);
    }
    this.rainbow?.setMode(mode);
    this.cosmos?.setMode(mode);
    this.stars.forEach((s) => {
      const m = s.material as THREE.PointsMaterial;
      m.opacity = Math.min(1, (m.userData.baseOp ?? m.opacity) * (mode === "minimal" ? 0.55 : 1));
    });
  }

  setQuality(low: boolean) {
    this.renderer.setPixelRatio(low ? 1 : Math.min(window.devicePixelRatio, 2));
    if (this.stars[0]) this.stars[0].visible = !low;
    if (this.dust) this.dust.visible = !low && this.atmosphere !== "minimal";
  }

  setMotionEnabled(on: boolean) {
    this.motionOn = on;
    this.controls.autoRotate = on && this.options.orbit && !this.interacting;
    if (!on && this.pulseMesh) { this.pulseMesh.visible = false; }
    else if (on && this.pulseIdx !== null && this.pulseMesh) this.pulseMesh.visible = true;
  }

  setConnectionMode(mode: ConnectionMode) {
    if (mode === this.connection) return;
    this.connection = mode;
    if (this.chart) {
      const keepAspect = this.selectedAspect;
      this.buildAspects(this.chart, false);
      this.aspectGroup.visible = this.options.aspects;
      this.selectAspect(keepAspect);
      /* re-apply spotlight dimming instantly */
      this.applyDim(true);
    }
  }

  private applyDim(instant = false) {
    void instant;
    /* evaluated per-frame in animate(); kept as explicit pass for mode switches */
  }

  setOptions(o: Partial<Options>) {
    Object.assign(this.options, o);
    this.aspectGroup.visible = this.options.aspects;
    this.controls.autoRotate = this.options.orbit && this.interacting === false && this.motionOn;
    for (const p of this.planets) {
      const m = p.label.material as THREE.SpriteMaterial;
      const want = this.options.labelDetail === "detailed" ? p.labelTex.detailed : p.labelTex.glyph;
      if (m.map !== want) { m.map = want; m.needsUpdate = true; }
    }
  }

  selectIndex(i: number | null) {
    this.selectIdx = i;
    for (let k = 0; k < this.planets.length; k++) {
      const ring = (this.planets[k].ring.material as THREE.SpriteMaterial);
      if (k === i) ring.opacity = 0.9;
    }
    /* focus ping: expanding gold ring at the chosen world */
    if (i !== null && this.planets[i] && this.pings.length < 4) {
      const mat = new THREE.SpriteMaterial({
        map: this.ringTex, color: new THREE.Color("#ffe9bd"), transparent: true,
        opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.position.copy(this.planets[i].root.position);
      sprite.scale.setScalar(1.2);
      this.chartGroup.add(sprite);
      this.pings.push({ sprite, mat, t: 0 });
    }
  }

  hoverIndex(i: number | null) {
    this.hoverIdx = i;
    if (i !== null) this.canvas.style.cursor = "pointer";
  }

  resetView() {
    const from = this.camera.position.clone();
    const base = new THREE.Vector3(0, 8.6, 15.2);
    const to = this.fitDist ? base.setLength(this.fitDist) : base;
    this.anims.push({
      start: this.time, dur: 1.1, done: false, tag: "cam",
      update: (k) => this.camera.position.lerpVectors(from, to, easeInOut(k)),
    });
    this.controls.target.set(0, 0.4, 0);
  }

  /**
   * Responsive framing for the dedicated central viewing region.
   * Shifts the principal point so the wheel rests in the visible gap between
   * side panels, and dollies out just enough that the rim stays fully
   * visible on narrower gaps (e.g. iPad landscape). Decorative camera work
   * only — chart data, positions, and aspect geometry are never altered.
   */
  notifyLayout(leftW: number, rightW: number, liftPx = 0) {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.biasXPx = (rightW - leftW) / 2;
    this.biasYPx = liftPx;
    this.camera.setViewOffset(w, h, this.biasXPx, this.biasYPx, w, h);
    const gap = Math.max(320, w - leftW - rightW);
    const halfFovTan = Math.tan((this.camera.fov * Math.PI) / 360);
    this.fitDist = Math.min(30, Math.max(17.5, (12.6 * h) / (gap * 2 * halfFovTan)));
  }

  clearLayoutBias() {
    this.biasXPx = 0; this.biasYPx = 0; this.fitDist = null;
    this.camera.clearViewOffset();
  }

  /* ---------- interaction ---------- */
  private interacting = false;
  private onCtrlStart = () => {
    this.interacting = true;
    this.controls.autoRotate = false;
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.anims.forEach((a) => { if (a.tag === "cam") a.done = true; });
    this.cb.onHover(null, 0, 0);
    this.hoverIdx = null;
    this.canvas.style.cursor = "";
  };
  private onCtrlEnd = () => {
    this.interacting = false;
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      if (this.options.orbit && !this.interacting) this.controls.autoRotate = true;
    }, 3800);
  };

  private pick(e: PointerEvent): number | null {
    const rect = this.canvas.getBoundingClientRect();
    this.ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.ndc, this.camera);
    const hits = this.raycaster.intersectObjects(this.planets.map((p) => p.hit), false);
    return hits.length ? (hits[0].object.userData.index as number) : null;
  }

  private pickAspect(e: PointerEvent): number | null {
    if (!this.options.aspects || this.aspectHit.length === 0) return null;
    const rect = this.canvas.getBoundingClientRect();
    this.ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.ndc, this.camera);
    const hits = this.raycaster.intersectObjects(this.aspectHit, false);
    return hits.length ? (hits[0].object.userData.aspIndex as number) : null;
  }

  private onMove = (e: PointerEvent) => {
    if (this.interacting || !this.chart) return;
    const i = this.pick(e);
    this.hoverIdx = i;
    this.canvas.style.cursor = i !== null ? "pointer" : "";
    if (i !== null) this.cb.onHover(this.chart.planets[i], e.clientX, e.clientY);
    else this.cb.onHover(null, 0, 0);
  };
  private onDown = (e: PointerEvent) => { this.downPos = { x: e.clientX, y: e.clientY }; };
  private onUp = (e: PointerEvent) => {
    const dx = e.clientX - this.downPos.x, dy = e.clientY - this.downPos.y;
    if (Math.hypot(dx, dy) > 6) return;
    const i = this.pick(e);
    if (i !== null) {
      this.selectIdx = i;
      this.cb.onSelect(i);
      return;
    }
    const ai = this.pickAspect(e);
    if (ai !== null) {
      this.selectedAspect = ai;
      this.pulseAspect(ai);
      this.cb.onAspect?.(ai);
    } else {
      this.cb.onSelect(null);
      this.cb.onAspect?.(null);
    }
  };
  private onLeave = () => {
    this.hoverIdx = null;
    this.canvas.style.cursor = "";
    this.cb.onHover(null, 0, 0);
  };

  private onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    if (this.biasXPx || this.biasYPx || this.fitDist !== null) {
      const w = this.canvas.clientWidth || window.innerWidth;
      const h = this.canvas.clientHeight || window.innerHeight;
      this.camera.setViewOffset(w, h, this.biasXPx, this.biasYPx, w, h);
    }
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
  };

  /* ---------- loop ---------- */
  private animate = () => {
    if (this.suspended) return;
    this.raf = requestAnimationFrame(this.animate);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.time += dt;
    const t = this.time;

    /* anims */
    for (const a of this.anims) {
      if (a.done) continue;
      if (t < a.start) continue;
      const k = Math.min(1, (t - a.start) / a.dur);
      a.update(k);
      if (k >= 1) a.done = true;
    }

    /* living wheel */
    if (this.wheelGroup) {
      this.wheelGroup.position.y = this.motionOn ? Math.sin(t * 0.55) * 0.06 : 0;
    }
    /* minimal atmosphere is near-static by design; calm motion too */
    const alive = this.motionOn && this.atmosphere !== "minimal";
    if (alive) {
      this.stars.forEach((s, i) => {
        s.rotation.y = t * (0.0022 + i * 0.0011);
      });
      this.rainbow?.update(t, dt);
      this.cosmos?.update(t, dt);
      if (this.dust) {
        this.dust.rotation.y = t * 0.008;
        this.dust.position.y = Math.sin(t * 0.3) * 0.15;
      }
      if (this.dustNear) {
        this.dustNear.rotation.y = -t * 0.006;
        this.dustNear.position.y = Math.sin(t * 0.22 + 1.3) * 0.3;
      }
      /* individual nebula drift + slow swirl: alive, never distracting */
      for (const s of this.nebulaGroup.children) {
        const sp = s as THREE.Sprite;
        sp.position.x = (sp.userData.baseX ?? sp.position.x) + Math.sin(t * (sp.userData.drift ?? 0.005) * 10) * 1.6;
        (sp.material as THREE.SpriteMaterial).rotation += (sp.userData.spin ?? 0.002) * dt;
      }
      /* halo twinkle on the brightest stars */
      for (const h of this.halos) {
        const m = h.material as THREE.SpriteMaterial;
        m.opacity = (h.userData.baseOp ?? 0.35) * (0.72 + 0.28 * Math.sin(t * 1.4 + (h.userData.tw ?? 0)));
      }
      /* gas giants turn; all worlds breathe light almost imperceptibly */
      for (const p of this.planets) {
        p.core.rotation.y += dt * (p.root.userData.spin ?? 0.08);
      }
      /* chart aura breathes */
      if (this.auraMat) {
        this.auraMat.opacity = (this.aura?.userData.baseOp ?? 0.5) * (0.9 + 0.1 * Math.sin(t * 0.5));
      }
    }
    /* selection pings: expanding focus rings, disposed on completion */
    for (let i = this.pings.length - 1; i >= 0; i--) {
      const pg = this.pings[i];
      pg.t += dt;
      const k = Math.min(1, pg.t / 0.9);
      pg.sprite.scale.setScalar(1.2 + easeInOut(k) * 2.4);
      pg.mat.opacity = 0.75 * (1 - k);
      if (k >= 1) {
        this.chartGroup.remove(pg.sprite);
        pg.sprite.geometry.dispose();
        pg.mat.dispose();
        this.pings.splice(i, 1);
      }
    }

    /* adaptive quality: sustained low fps steps atmosphere down, never
       touching chart geometry, positions, or interactions */
    if (this.time > this.perfCalmUntil) {
      this.perfAcc += dt;
      this.perfN += 1;
      if (this.perfAcc >= 2.5) {
        const fps = this.perfN / Math.max(0.001, this.perfAcc);
        this.perfAcc = 0; this.perfN = 0;
        if (fps < 36 && this.atmosphere === "full") {
          this.setAtmosphere("subtle");
          this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
          this.cb.onPerfNote?.("subtle");
        } else if (fps < 30 && this.atmosphere === "subtle") {
          this.setAtmosphere("minimal");
          this.renderer.setPixelRatio(1);
          this.cb.onPerfNote?.("minimal");
        }
      }
    }

    /* spotlight dimming targets */
    const dimP = (i: number) => (this.spotPlanets && !this.spotPlanets.has(i) ? 0.22 : 1);

    /* planet bob + hover/select feedback */
    this.planets.forEach((p, i) => {
      const bob = this.motionOn ? Math.sin(t * 0.9 + i * 1.7) * 0.05 : 0;
      p.root.position.y = p.baseY + bob + (i === this.hoverIdx ? 0.1 : 0);
      if (this.planetBorn[i] !== undefined && t < this.planetBorn[i]) return; // intro owns scale
      /* the current selection grows clearly larger to stand out */
      const target = i === this.selectIdx ? 1.9 : i === this.hoverIdx ? 1.35 : 1;
      const cur = p.root.scale.x;
      const next = cur + (target - cur) * Math.min(1, dt * 10);
      p.root.scale.setScalar(Math.max(0.0001, next));
      const ringMat = p.ring.material as THREE.SpriteMaterial;
      if (i === this.selectIdx) {
        ringMat.opacity = 0.65 + 0.3 * Math.sin(t * 2.6);
        p.ring.scale.setScalar(1.7 + 0.16 * Math.sin(t * 2.6));
      } else if (ringMat.opacity > 0.01) {
        ringMat.opacity = Math.max(0, ringMat.opacity - dt * 3);
      }
      /* guided dimming: fade glow/core/label, never hide context */
      const d = dimP(i);
      const glowMat = p.glow.material as THREE.SpriteMaterial;
      const coreMat = p.core.material as THREE.MeshBasicMaterial;
      const gTarget = 0.85 * d * (i === this.selectIdx ? 1.25 : 1);
      glowMat.opacity += (gTarget - glowMat.opacity) * Math.min(1, dt * 5);
      coreMat.opacity += (d - coreMat.opacity) * Math.min(1, dt * 5);
    });

    /* aspect dimming: selected/spotlight stay bright, rest recede */
    this.aspectLines.forEach((a) => {
      const lit = this.spotAspects ? this.spotAspects.has(a.aspIndex) : true;
      const sel = this.selectedAspect === a.aspIndex;
      const target = sel ? 1 : lit ? 1 : 0.12;
      const cur0 = (a.mats[1] as THREE.MeshBasicMaterial).opacity;
      /* don't fight the intro draw-on anims */
      const introRunning = this.anims.some((x) => !x.done);
      if (introRunning && cur0 < 0.05) return;
      const k = Math.min(1, dt * 5);
      (a.mats[0] as THREE.MeshBasicMaterial).opacity += ((sel ? 0.3 : lit ? 0.16 : 0.02) - (a.mats[0] as THREE.MeshBasicMaterial).opacity) * k;
      (a.mats[1] as THREE.MeshBasicMaterial).opacity += ((sel ? 1 : lit ? 0.85 : 0.85 * target) - cur0) * k;
      (a.core.material as THREE.MeshBasicMaterial).opacity += ((sel ? 1 : lit ? 0.95 : 0.95 * target) - (a.core.material as THREE.MeshBasicMaterial).opacity) * k;
    });

    /* restrained pulse travelling the selected connection */
    if (this.pulseMesh && this.pulseIdx !== null && this.motionOn) {
      const line = this.aspectLines.find((l) => l.aspIndex === this.pulseIdx);
      if (line) {
        this.pulseT += dt * 0.35;
        const tt = this.pulseT % 1;
        const pos = line.curve.getPoint(tt);
        this.pulseMesh.position.copy(pos);
        this.pulseMesh.visible = this.aspectGroup.visible;
        const pm = this.pulseMesh.material as THREE.MeshBasicMaterial;
        pm.opacity = 0.75 * Math.sin(tt * Math.PI) + 0.15;
        const s = 1 + 0.4 * Math.sin(tt * Math.PI);
        this.pulseMesh.scale.setScalar(s);
      } else if (this.pulseMesh) {
        this.pulseMesh.visible = false;
      }
    } else if (this.pulseMesh && (this.pulseIdx === null || !this.motionOn)) {
      this.pulseMesh.visible = false;
    }

    this.controls.update();
    this.updateLabels(dt);
    this.renderer.render(this.scene, this.camera);
  };

  /* ---------- planet labels: above the planet, facing the camera, de-collided ---------- */

  /**
   * Each label is anchored in SCREEN space directly above its planet (so "above"
   * stays above at every camera inclination, including top-down), sized with
   * perspective, and nudged — never the planet — to avoid other labels, other
   * planet bodies, rings and aspect beams. A thin leader line ties any displaced
   * label back to its world. Planet coordinates are never touched.
   */
  private updateLabels(dt: number) {
    const pls = this.planets;
    if (!pls.length || !this.chart || !this.chartGroup.visible) return;
    const W = this.canvas.clientWidth || window.innerWidth;
    const H = this.canvas.clientHeight || window.innerHeight;
    const cam = this.camera;
    cam.updateMatrixWorld();
    this.chartGroup.updateMatrixWorld(true);
    const fwd = new THREE.Vector3();
    cam.getWorldDirection(fwd);
    const tanHalf = Math.tan((cam.fov * Math.PI) / 360);
    const detailed = this.options.labelDetail === "detailed";
    const box = detailed ? { w: 2.5, h: 1.3, cy: 0.47 } : { w: 1.25, h: 0.86, cy: 0.31 };
    const tmp = new THREE.Vector3();

    interface It { i: number; x: number; y: number; depth: number; ppw: number; r: number; ls: number; w: number; h: number }
    const its: It[] = [];
    pls.forEach((p, i) => {
      p.root.getWorldPosition(tmp);
      const depth = tmp.clone().sub(cam.position).dot(fwd);
      if (depth < 0.5) return;
      const q = tmp.clone().project(cam);
      const ppw = H / 2 / (depth * tanHalf);
      const sc = p.root.scale.x;
      const r = p.view.size * (p.view.id === "saturn" ? 2.15 : 1.05) * sc * ppw;
      const ls = Math.min(1.3, 1 + (sc - 1) * 0.3);
      its.push({ i, x: (q.x * 0.5 + 0.5) * W, y: (-q.y * 0.5 + 0.5) * H, depth, ppw, r, ls, w: box.w * ppw * ls, h: box.h * ppw * ls });
    });

    /* screen-space beam segments the labels should avoid */
    const segs: { x1: number; y1: number; x2: number; y2: number; wgt: number }[] = [];
    if (this.options.aspects && this.aspectGroup.visible) {
      for (const a of this.aspectLines) {
        const dimmed = this.spotAspects && !this.spotAspects.has(a.aspIndex);
        const wgt = this.selectedAspect === a.aspIndex ? 6 : dimmed ? 0.3 : this.spotAspects ? 3 : 1.5;
        let prev: { x: number; y: number } | null = null;
        for (let k = 0; k <= 8; k++) {
          const v = this.chartGroup.localToWorld(a.curve.getPoint(k / 8)).project(cam);
          const pt = { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H };
          if (prev) segs.push({ x1: prev.x, y1: prev.y, x2: pt.x, y2: pt.y, wgt });
          prev = pt;
        }
      }
    }

    const segHits = (s: { x1: number; y1: number; x2: number; y2: number }, x0: number, y0: number, x1: number, y1: number) => {
      let t0 = 0, t1 = 1;
      const dx = s.x2 - s.x1, dy = s.y2 - s.y1;
      const clip = (p: number, q: number) => {
        if (p === 0) return q >= 0;
        const r = q / p;
        if (p < 0) { if (r > t1) return false; if (r > t0) t0 = r; }
        else { if (r < t0) return false; if (r < t1) t1 = r; }
        return true;
      };
      return clip(-dx, s.x1 - x0) && clip(dx, x1 - s.x1) && clip(-dy, s.y1 - y0) && clip(dy, y1 - s.y1);
    };

    // Stable planet order prevents hover/selection from reshuffling every label.
    const order = [...its].sort((a, b) => a.i - b.i);
    const placed: { x0: number; y0: number; x1: number; y1: number }[] = [];
    const k = this.motionOn ? 1 - Math.exp(-Math.min(dt, 0.05) * 1.6) : 1;
    const dimP = (i: number) => (this.spotPlanets && !this.spotPlanets.has(i) ? 0.22 : 1);

    for (const it of order) {
      const p = pls[it.i];
      const gap = Math.max(5, 0.1 * it.ppw);
      const baseX = it.x, baseY = it.y - it.r - gap - it.h / 2;
      let best = { cost: Infinity, dx: 0, dy: 0, t: 0, l: 0 };
      for (let t = 0; t < 4; t++) {
        for (const l of [0, 1, -1, 2, -2]) {
          const dx = l * it.w * 0.62, dy = -t * it.h * 0.92;
          const cx = baseX + dx, cy = baseY + dy;
          const x0 = cx - it.w / 2, x1 = cx + it.w / 2, y0 = cy - it.h / 2, y1 = cy + it.h / 2;
          let cost = t * 1.0 + Math.abs(l) * 0.75;
          for (const q of placed) if (x0 < q.x1 + 3 && x1 > q.x0 - 3 && y0 < q.y1 + 3 && y1 > q.y0 - 3) cost += 100;
          for (const o of its) {
            const nx = Math.max(x0, Math.min(o.x, x1)), ny = Math.max(y0, Math.min(o.y, y1));
            const rr = o.r * 1.18 + 2;
            if ((nx - o.x) ** 2 + (ny - o.y) ** 2 < rr * rr) cost += o === it ? 100 : 60;
          }
          for (const sg of segs) if (segHits(sg, x0 - 2, y0 - 2, x1 + 2, y1 + 2)) cost += sg.wgt;
          if (x0 < 4 || x1 > W - 4 || y0 < 4 || y1 > H - 4) cost += 40;
          if (t === p.lbl.t && l === p.lbl.l) cost -= 6;
          if (cost < best.cost) best = { cost, dx, dy, t, l };
        }
      }
      const lb = p.lbl;
      if (!lb.init) { lb.t=best.t; lb.l=best.l; lb.ox=best.dx; lb.oy=best.dy; lb.init=true; }
      else {
        if (best.t!==lb.pendingT || best.l!==lb.pendingL) { lb.pendingT=best.t; lb.pendingL=best.l; lb.stableFor=0; }
        else lb.stableFor+=Math.min(dt,0.05);
        // A new slot must remain preferable for a full second, not a single frame.
        if (lb.stableFor>=1) { lb.t=best.t; lb.l=best.l; }
        const dx=lb.l*it.w*0.62-lb.ox, dy=-lb.t*it.h*0.92-lb.oy;
        const distance=Math.hypot(dx,dy);
        const amount=this.motionOn ? Math.min(k, 36*Math.min(dt,0.05)/Math.max(1,distance)) : 1;
        lb.ox+=dx*amount; lb.oy+=dy*amount;
      }
      const cx = baseX + lb.ox, cy = baseY + lb.oy;
      placed.push({x0:cx-it.w/2,x1:cx+it.w/2,y0:cy-it.h/2,y1:cy+it.h/2});

      /* px → a point at the planet's depth, then into the chart group's space */
      const toLocal = (px: number, py: number) => {
        tmp.set((px / W) * 2 - 1, -(py / H) * 2 + 1, 0.5).unproject(cam).sub(cam.position).normalize();
        const kk = it.depth / tmp.dot(fwd);
        return this.chartGroup.worldToLocal(cam.position.clone().addScaledVector(tmp, kk));
      };
      p.label.position.copy(toLocal(cx, cy));
      p.label.scale.set(3.0 * it.ls, 1.5 * it.ls, 1);
      p.label.center.set(0.5, box.cy);

      /* leader line for displaced labels */
      const x0 = cx - it.w / 2, x1 = cx + it.w / 2, y0 = cy - it.h / 2, y1 = cy + it.h / 2;
      const ex = Math.max(x0, Math.min(it.x, x1)), ey = Math.max(y0, Math.min(it.y, y1));
      const vx = ex - it.x, vy = ey - it.y, vl = Math.hypot(vx, vy) || 1;
      const sx = it.x + (vx / vl) * (it.r + 1), sy = it.y + (vy / vl) * (it.r + 1);
      const showLeader = Math.hypot(ex - sx, ey - sy) > 10 && (lb.t > 0 || lb.l !== 0);
      const pos = p.leader.geometry.attributes.position as THREE.BufferAttribute;
      const a0 = toLocal(sx, sy), a1 = toLocal(ex, ey);
      pos.setXYZ(0, a0.x, a0.y, a0.z);
      pos.setXYZ(1, a1.x, a1.y, a1.z);
      pos.needsUpdate = true;

      /* visibility: after the planet's arrival, honoring the label setting + spotlight dimming */
      const born = this.planetBorn[it.i] === undefined || this.time >= this.planetBorn[it.i] + 0.15;
      const want = this.options.labels && born ? dimP(it.i) : 0;
      const lm = p.label.material as THREE.SpriteMaterial;
      lm.opacity += (want - lm.opacity) * Math.min(1, dt * 6);
      const vis = lm.opacity > 0.01;
      p.label.visible = vis;
      p.leader.visible = vis && showLeader;
      (p.leader.material as THREE.LineBasicMaterial).opacity = lm.opacity * 0.5;
    }
    /* planets that were skipped (behind the camera) stay hidden */
    for (const p of pls) if (!its.some((x) => pls[x.i] === p)) { p.label.visible = false; p.leader.visible = false; }
  }

  /* ---------- suspend / resume: stop rendering while a full-screen reading covers the chart ---------- */
  private suspended = false;
  isSuspended() { return this.suspended; }
  setSuspended(on: boolean) {
    if (on === this.suspended) return;
    this.suspended = on;
    if (on) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    } else {
      /* resume without a time jump, and re-fit the renderer in case the window changed */
      this.clock.getDelta();
      this.onResize();
      if (!this.raf) this.animate();
    }
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    if (this.idleTimer) clearTimeout(this.idleTimer);
    window.removeEventListener("resize", this.onResize);
    this.canvas.removeEventListener("pointermove", this.onMove);
    this.canvas.removeEventListener("pointerdown", this.onDown);
    this.canvas.removeEventListener("pointerup", this.onUp);
    this.canvas.removeEventListener("pointerleave", this.onLeave);
    this.controls.dispose();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = (m as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else if (mat) mat.dispose();
    });
    this.rainbow?.dispose();
    this.cosmos?.dispose();
    this.glowTex.dispose();
    this.ringTex.dispose();
    this.dotTex.dispose();
    this.renderer.dispose();
  }
}
