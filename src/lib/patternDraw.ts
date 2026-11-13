// Dibujo de los 21 patrones. Cada patrón lee sus parámetros propios (PATTERN_EXTRAS).
// Todo el azar usa semilla, así la vista previa, el PNG y el SVG coinciden siempre.
import type { PatternId } from './patterns';

export interface ParamDef {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  def: number;
  unit?: string; // '%', 'º', 'px'
  labels?: string[]; // etiquetas para valores discretos (0, 1, 2…)
}

const D = (key: string, label: string, min: number, max: number, step: number, def: number, unit = '', labels?: string[]): ParamDef =>
  ({ key, label, min, max, step, def, unit, labels });
const CX = D('cx', 'Centro X', -50, 50, 1, 0, '%');
const CY = D('cy', 'Centro Y', -50, 50, 1, 0, '%');
const YN = ['No', 'Sí'];

export const PATTERN_EXTRAS: Record<PatternId, ParamDef[]> = {
  concentricCircles: [D('rings', 'Anillos', 5, 120, 1, 42), D('curve', 'Compresión', -40, 100, 1, 0, '%'), CX, CY],
  concentricNoiseRings: [D('rings', 'Anillos', 5, 80, 1, 30), D('noise', 'Ruido', 0, 100, 1, 30, '%'), D('seg', 'Suavidad', 12, 180, 1, 60), CX, CY],
  quarterArcTruchet: [D('tile', 'Tamaño de baldosa', 20, 160, 1, 55, 'px'), D('mix', 'Mezcla de arcos', 0, 100, 1, 50, '%')],
  diagonalLines: [D('spacing', 'Separación', 6, 80, 1, 35, 'px'), D('angle', 'Ángulo', 0, 180, 1, 135, 'º'), D('alt', 'Grosor alterno', 0, 100, 1, 0, '%')],
  verticalStripes: [D('sw', 'Ancho de raya', 2, 60, 1, 18, 'px'), D('gap', 'Ancho de hueco', 2, 50, 1, 13, 'px'), D('angle', 'Ángulo', 0, 180, 1, 0, 'º')],
  chevronPattern: [D('size', 'Tamaño', 15, 120, 1, 40, 'px'), D('height', 'Altura del vértice', 20, 120, 1, 60, '%')],
  artDeco: [D('rays', 'Rayos', 4, 60, 1, 20), D('arcs', 'Arcos', 2, 30, 1, 8), D('fanY', 'Posición del abanico', 20, 100, 1, 80, '%')],
  wavyLines: [D('lines', 'Líneas', 3, 40, 1, 8), D('amp', 'Amplitud', 5, 120, 1, 30, 'px'), D('freq', 'Frecuencia', 5, 80, 1, 25), D('phase', 'Desfase', 0, 300, 5, 80, '%')],
  flowLines: [D('lines', 'Líneas', 10, 120, 1, 28), D('amp', 'Amplitud', 5, 150, 1, 40, 'px'), D('freq', 'Frecuencia', 5, 60, 1, 20), D('shift', 'Desfase', 0, 100, 1, 100, '%')],
  waveField: [D('grid', 'Tamaño de cuadrícula', 12, 100, 1, 40, 'px'), D('len', 'Longitud del trazo', 10, 120, 1, 40, '%'), D('var', 'Variación de ángulo', 0, 100, 1, 100, '%')],
  joyDivision: [D('lines', 'Líneas', 10, 80, 1, 30), D('peak', 'Altura de picos', 5, 60, 1, 18, '%'), D('jitter', 'Irregularidad', 0, 100, 1, 100, '%'), D('soft', 'Suavidad', 0, 100, 1, 50, '%')],
  dotGrid: [D('spacing', 'Separación', 8, 100, 1, 30, 'px'), D('radius', 'Radio', 1, 30, 1, 5, 'px'), D('shape', 'Forma', 0, 2, 1, 0, '', ['Círculo', 'Cuadrado', 'Rombo'])],
  halftoneDots: [D('grid', 'Tamaño de cuadrícula', 8, 80, 1, 28, 'px'), D('dot', 'Tamaño máx. de punto', 10, 80, 1, 40, '%'), D('falloff', 'Contraste', 0, 150, 1, 100, '%'), D('noise', 'Ruido', 0, 100, 1, 30, '%'), D('pinReach', 'Alcance de pines', 10, 150, 1, 45, '%'), CX, CY],
  nodeGarden: [D('nodes', 'Nodos', 10, 200, 1, 40), D('reach', 'Distancia de conexión', 50, 400, 5, 150, '%'), D('size', 'Tamaño de nodo', 1, 12, 1, 3, 'px')],
  triangleGrid: [D('size', 'Tamaño', 10, 120, 1, 38, 'px'), D('fill', 'Relleno', 0, 100, 1, 0, '%')],
  squareSpiral: [D('steps', 'Segmentos', 20, 400, 1, 110), D('step', 'Paso', 4, 40, 1, 12, 'px')],
  scandinavianCross: [D('spacing', 'Separación', 20, 140, 1, 52, 'px'), D('arm', 'Largo del brazo', 10, 80, 1, 35, '%'), D('tilt', 'Inclinación', 0, 45, 1, 0, 'º')],
  triangularMosaic: [D('cell', 'Tamaño de celda', 12, 100, 1, 50, 'px'), D('chaos', 'Caos', 0, 100, 1, 50, '%'), D('outline', 'Solo contorno', 0, 1, 1, 0, '', YN)],
  tessellation: [D('size', 'Tamaño', 12, 100, 1, 40, 'px'), D('inner', 'Hexágono interior', 0, 1, 1, 1, '', YN), D('cross', 'Cruz interior', 0, 1, 1, 1, '', YN)],
  voronoi: [D('points', 'Puntos', 5, 150, 1, 36), D('reach', 'Alcance de conexión', 50, 300, 5, 180, '%'), D('len', 'Largo de segmento', 20, 120, 1, 60, '%'), D('dot', 'Tamaño de punto', 1, 12, 1, 3, 'px')],
  fractalTree: [D('depth', 'Profundidad', 3, 12, 1, 7), D('angle', 'Ángulo de ramas', 10, 60, 1, 45, 'º'), D('shrink', 'Acortamiento', 50, 90, 1, 72, '%'), D('length', 'Largo del tronco', 40, 300, 1, 150, 'px'), D('mid', 'Rama central', 0, 1, 1, 0, '', YN)],
};

export function resolveParams(type: PatternId, params?: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const d of PATTERN_EXTRAS[type] ?? []) out[d.key] = params?.[d.key] ?? d.def;
  return out;
}

export interface DrawOpts {
  color: string;
  scale: number;
  strokeWidth: number;
  quantity: number; // 0-100
  randomFill: boolean;
  seed: number;
  cap: CanvasLineCap;
  opacity: number; // 0-1
  bg: string; // color de fondo ('transparent' si no hay)
  pins: { x: number; y: number; w: number }[]; // pines de densidad (% del lienzo visible)
  rotation: number; // rotación del patrón en grados
  tile: boolean; // true cuando se dibuja una baldosa repetida
  p: Record<string, number>;
}

// ─── Azar con semilla ─────────────────────────────────────
export function seededRandom(seed: number): () => number {
  let s = (Math.abs(Math.floor(seed)) * 48271 + 12345) % 2147483646 + 1;
  const next = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  next(); next(); next();
  return next;
}

type Ctx = CanvasRenderingContext2D;
type Fn = (ctx: Ctx, w: number, h: number, o: DrawOpts, r: Rng) => void;

// Tres flujos independientes: diseño, cantidad (qué elementos se omiten) y color aleatorio.
// Así mover "Cantidad" no reordena el patrón.
interface Rng { rand: () => number; skip: () => boolean; color: () => string }
function makeRng(o: DrawOpts): Rng {
  const rand = seededRandom(o.seed);
  const q = seededRandom(o.seed + 101);
  const c = seededRandom(o.seed + 202);
  return {
    rand,
    skip: () => q() * 100 > o.quantity,
    color: () => `#${Math.floor(c() * 16777215).toString(16).padStart(6, '0')}`,
  };
}

const stroke = (ctx: Ctx, o: DrawOpts, lw = o.strokeWidth) => {
  ctx.strokeStyle = o.color; ctx.lineWidth = lw; ctx.lineCap = o.cap; ctx.lineJoin = 'round';
};
const fillc = (ctx: Ctx, o: DrawOpts) => { ctx.fillStyle = o.color; };
const ctr = (w: number, h: number, p: Record<string, number>): [number, number] =>
  [w / 2 + ((p.cx ?? 0) / 100) * (w / 2), h / 2 + ((p.cy ?? 0) / 100) * (h / 2)];

// Zona visible: en modo normal el patrón se dibuja al doble de tamaño y se ve la mitad central
const vis = (w: number, h: number, o: DrawOpts, margin = 0.12) =>
  o.tile ? { x0: 0, y0: 0, x1: w, y1: h } : { x0: w * (0.25 - margin), y0: h * (0.25 - margin), x1: w * (0.75 + margin), y1: h * (0.75 + margin) };

// ─── Patrones ─────────────────────────────────────────────
const concentricCircles: Fn = (ctx, w, h, o) => {
  const { p } = o; const [cx, cy] = ctr(w, h, p);
  const maxR = Math.max(w, h) * 0.8 * o.scale; const n = Math.round(p.rings); const e = 1 + p.curve / 50;
  stroke(ctx, o);
  for (let i = 1; i <= n; i++) { ctx.beginPath(); ctx.arc(cx, cy, maxR * Math.pow(i / n, e), 0, Math.PI * 2); ctx.stroke(); }
};

const concentricNoiseRings: Fn = (ctx, w, h, o, r) => {
  const { p } = o; const [cx, cy] = ctr(w, h, p);
  const n = Math.round(p.rings); const maxR = Math.max(w, h) * 0.8 * o.scale; const spacing = maxR / n; const seg = Math.round(p.seg);
  stroke(ctx, o);
  for (let i = 1; i <= n; i++) {
    const base = i * spacing; const amount = spacing * (p.noise / 100) * (1 + r.rand() * 0.5);
    ctx.beginPath();
    for (let s = 0; s <= seg; s++) {
      const a = (s / seg) * Math.PI * 2; const rr = base + (r.rand() - 0.5) * amount;
      const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
      if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.stroke();
  }
};

const quarterArcTruchet: Fn = (ctx, w, h, o, r) => {
  const t = o.p.tile * o.scale; stroke(ctx, o);
  for (let y = 0; y < h; y += t) for (let x = 0; x < w; x += t) {
    const rot = r.rand() < o.p.mix / 100 ? Math.PI / 2 : 0;
    ctx.save(); ctx.translate(x + t / 2, y + t / 2); ctx.rotate(rot); ctx.translate(-t / 2, -t / 2);
    ctx.beginPath(); ctx.arc(0, 0, t / 2, 0, Math.PI / 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(t, t, t / 2, Math.PI, Math.PI * 1.5); ctx.stroke();
    ctx.restore();
  }
};

const diagonalLines: Fn = (ctx, w, h, o) => {
  const sp = Math.max(4, o.p.spacing / o.scale); const D = Math.hypot(w, h);
  const a = (o.p.angle * Math.PI) / 180; const dx = Math.cos(a), dy = Math.sin(a); const nx = -dy, ny = dx;
  stroke(ctx, o);
  for (let k = -D, i = 0; k <= D; k += sp, i++) {
    ctx.lineWidth = i % 2 ? o.strokeWidth * (1 + o.p.alt / 50) : o.strokeWidth;
    ctx.beginPath();
    ctx.moveTo(w / 2 + nx * k - dx * D, h / 2 + ny * k - dy * D);
    ctx.lineTo(w / 2 + nx * k + dx * D, h / 2 + ny * k + dy * D);
    ctx.stroke();
  }
};

const verticalStripes: Fn = (ctx, w, h, o, r) => {
  const sw = o.p.sw * o.scale, gap = o.p.gap * o.scale; const D = Math.hypot(w, h);
  ctx.save(); ctx.translate(w / 2, h / 2); ctx.rotate((o.p.angle * Math.PI) / 180);
  for (let x = -D; x < D; x += sw + gap) {
    if (r.skip()) continue;
    ctx.fillStyle = o.randomFill ? r.color() : o.color;
    ctx.fillRect(x, -D, sw, D * 2);
  }
  ctx.restore();
};

const chevronPattern: Fn = (ctx, w, h, o) => {
  const size = o.p.size * o.scale; const ch = size * (o.p.height / 100); stroke(ctx, o);
  for (let y = -ch; y < h + ch; y += ch) for (let x = 0; x < w + size; x += size) {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + size / 2, y + ch); ctx.lineTo(x + size, y); ctx.stroke();
  }
};

const artDeco: Fn = (ctx, w, h, o) => {
  const rays = Math.round(o.p.rays), arcs = Math.round(o.p.arcs);
  const cx = w / 2, oy = h * (o.p.fanY / 100); const maxR = Math.max(w, h) * 0.7; stroke(ctx, o);
  for (let i = 0; i <= rays; i++) {
    const a = Math.PI + (i / rays) * Math.PI;
    ctx.beginPath(); ctx.moveTo(cx, oy); ctx.lineTo(cx + Math.cos(a) * maxR, oy + Math.sin(a) * maxR); ctx.stroke();
  }
  for (let i = 1; i <= arcs; i++) { ctx.beginPath(); ctx.arc(cx, oy, (i / arcs) * maxR * 0.8 * o.scale, Math.PI, Math.PI * 2); ctx.stroke(); }
  const ds = 30 * o.scale; ctx.beginPath(); ctx.moveTo(cx, h / 2 - h * 0.3 - ds); ctx.lineTo(cx + ds, h / 2 - h * 0.3); ctx.lineTo(cx, h / 2 - h * 0.3 + ds); ctx.lineTo(cx - ds, h / 2 - h * 0.3); ctx.closePath(); ctx.stroke();
};

const wavyLines: Fn = (ctx, w, h, o) => {
  const n = Math.round(o.p.lines); const v = vis(w, h, o, 0.2); const sp = (v.y1 - v.y0) / n; const amp = o.p.amp * o.scale; const f = o.p.freq / 1000 / o.scale; stroke(ctx, o);
  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    for (let x = 0; x <= w; x += 2) { const y = v.y0 + sp * (i + 0.5) + Math.sin(x * f + (i * o.p.phase) / 100) * amp; if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
    ctx.stroke();
  }
};

const flowLines: Fn = (ctx, w, h, o, r) => {
  const n = Math.round(o.p.lines); const v = vis(w, h, o, 0.2); const sp = (v.y1 - v.y0) / n; const amp = o.p.amp * o.scale; const f = o.p.freq / 1000; stroke(ctx, o);
  for (let i = 0; i < n; i++) {
    const phase = r.rand() * Math.PI * 2 * (o.p.shift / 100); const y0 = v.y0 + sp * (i + 0.5);
    ctx.beginPath();
    for (let x = 0; x <= w; x += 3) {
      const y = y0 + Math.sin(x * f + phase) * amp + Math.cos(x * f * 1.5 + phase * 2) * amp * 0.5;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
};

const waveField: Fn = (ctx, w, h, o, r) => {
  const g = o.p.grid; const len = g * (o.p.len / 100) * o.scale; stroke(ctx, o);
  for (let y = g / 2; y < h; y += g) for (let x = g / 2; x < w; x += g) {
    const a = r.rand() * Math.PI * 2 * (o.p.var / 100);
    if (r.skip()) continue;
    if (o.randomFill) ctx.strokeStyle = r.color();
    ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * len / 2, y - Math.sin(a) * len / 2); ctx.lineTo(x + Math.cos(a) * len / 2, y + Math.sin(a) * len / 2); ctx.stroke();
  }
};

// Líneas apiladas con picos en el centro, como la portada de Unknown Pleasures
const joyDivision: Fn = (ctx, w, h, o, r) => {
  const n = Math.round(o.p.lines); const v = vis(w, h, o, 0.18); const sp = (v.y1 - v.y0) / n;
  const amp = (v.y1 - v.y0) * (o.p.peak / 100) * o.scale; const j = o.p.jitter / 100;
  const cell = 5 + o.p.soft * 0.25; const m = Math.ceil(w / cell) + 2; const sigma = (w / 2) * 0.2;
  const hasBg = o.bg && o.bg !== 'transparent';
  stroke(ctx, o);
  for (let i = 0; i < n; i++) {
    const base = v.y0 + sp * (i + 1);
    const vals: number[] = []; for (let k = 0; k < m; k++) vals.push(r.rand() * j + (1 - j) * 0.5);
    const pts: [number, number][] = [];
    for (let x = 0; x <= w; x += 3) {
      const kf = x / cell; const k0 = Math.floor(kf); const t = (1 - Math.cos((kf - k0) * Math.PI)) / 2;
      const nn = vals[k0] * (1 - t) + vals[k0 + 1] * t; const env = Math.exp(-Math.pow((x - w / 2) / sigma, 2));
      pts.push([x, base - amp * env * nn]);
    }
    if (hasBg) { // tapa las líneas de atrás
      ctx.beginPath(); ctx.moveTo(0, base + sp * 3);
      for (const [x, y] of pts) ctx.lineTo(x, y);
      ctx.lineTo(w, base + sp * 3); ctx.closePath(); ctx.fillStyle = o.bg; ctx.fill();
    }
    ctx.beginPath(); pts.forEach(([x, y], k) => (k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y))); ctx.stroke();
  }
  fillc(ctx, o);
};

const dotGrid: Fn = (ctx, w, h, o, r) => {
  const sp = o.p.spacing / o.scale; const rad = Math.max(1, o.p.radius * o.scale); const shape = Math.round(o.p.shape);
  for (let y = sp / 2; y < h; y += sp) for (let x = sp / 2; x < w; x += sp) {
    if (r.skip()) continue;
    ctx.fillStyle = o.randomFill ? r.color() : o.color; ctx.beginPath();
    if (shape === 0) { ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill(); }
    else if (shape === 1) { ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
    else { ctx.moveTo(x, y - rad); ctx.lineTo(x + rad, y); ctx.lineTo(x, y + rad); ctx.lineTo(x - rad, y); ctx.closePath(); ctx.fill(); }
  }
};

// Con pines, los puntos son más grandes cerca de cada pin; sin pines, cerca del centro elegido
const halftoneDots: Fn = (ctx, w, h, o, r) => {
  const g = o.p.grid * o.scale; const [cx, cy] = ctr(w, h, o.p);
  const maxD = Math.hypot(w / 2 + Math.abs(cx - w / 2), h / 2 + Math.abs(cy - h / 2));

  // Los pines se guardan como posición en pantalla; se deshace la rotación para ubicarlos en el patrón
  const t = -(o.rotation * Math.PI) / 180, cs = Math.cos(t), sn = Math.sin(t);
  const pins = o.pins.map(p => {
    const sx = o.tile ? (p.x / 100) * w : w / 4 + (p.x / 100) * (w / 2);
    const sy = o.tile ? (p.y / 100) * h : h / 4 + (p.y / 100) * (h / 2);
    if (o.tile || !o.rotation) return { x: sx, y: sy, w: p.w };
    const dx = sx - w / 2, dy = sy - h / 2;
    return { x: w / 2 + dx * cs - dy * sn, y: h / 2 + dx * sn + dy * cs, w: p.w };
  });
  const diag = o.tile ? Math.hypot(w, h) : Math.hypot(w, h) / 2;
  const sigma = Math.max(1, (o.p.pinReach / 100) * diag * 0.5);

  for (let y = g / 2; y < h; y += g) for (let x = g / 2; x < w; x += g) {
    let nd: number;
    if (pins.length) {
      let infl = 0;
      for (const p of pins) { const d2 = (x - p.x) ** 2 + (y - p.y) ** 2; infl += p.w * Math.exp(-d2 / (2 * sigma * sigma)); }
      nd = 1 - Math.min(1, infl);
    } else nd = Math.hypot(x - cx, y - cy) / maxD;
    const noise = r.rand() * (o.p.noise / 100);
    if (r.skip()) continue;
    const rad = Math.max(0.8, g * (o.p.dot / 100) * (1 - nd * (o.p.falloff / 100) + noise));
    ctx.fillStyle = o.randomFill ? r.color() : o.color; ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
  }
};

const nodeGarden: Fn = (ctx, w, h, o, r) => {
  const n = Math.round(o.p.nodes); const pts: [number, number][] = [];
  const v = vis(w, h, o, 0.1);
  for (let i = 0; i < n; i++) pts.push([v.x0 + r.rand() * (v.x1 - v.x0), v.y0 + r.rand() * (v.y1 - v.y0)]);
  const maxD = (Math.max(v.x1 - v.x0, v.y1 - v.y0) / Math.sqrt(n)) * (o.p.reach / 100); stroke(ctx, o); fillc(ctx, o);
  for (let i = 0; i < n; i++) for (let k = i + 1; k < n; k++) {
    const d = Math.hypot(pts[i][0] - pts[k][0], pts[i][1] - pts[k][1]);
    if (d < maxD) { ctx.globalAlpha = o.opacity * (1 - d / maxD); ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[k][0], pts[k][1]); ctx.stroke(); }
  }
  ctx.globalAlpha = o.opacity;
  const rad = o.p.size * o.scale;
  for (const [x, y] of pts) { ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill(); }
};

const triangleGrid: Fn = (ctx, w, h, o, r) => {
  const s = o.p.size / o.scale; const th = (s * Math.sqrt(3)) / 2; stroke(ctx, o); fillc(ctx, o);
  for (let y = 0, row = 0; y < h + th; y += th, row++) for (let x = (row % 2) * (s / 2) - s; x < w + s; x += s) {
    ctx.beginPath(); ctx.moveTo(x, y + th); ctx.lineTo(x + s / 2, y); ctx.lineTo(x + s, y + th); ctx.closePath();
    if (r.rand() * 100 < o.p.fill) ctx.fill();
    ctx.stroke();
  }
};

const squareSpiral: Fn = (ctx, w, h, o) => {
  const steps = Math.round(o.p.steps); const step = Math.max(4, o.p.step * o.scale); stroke(ctx, o);
  let x = w / 2, y = h / 2, len = step, dir = 0; ctx.beginPath(); ctx.moveTo(x, y);
  for (let i = 0; i < steps; i++) {
    if (dir === 0) x += len; else if (dir === 1) y += len; else if (dir === 2) x -= len; else y -= len;
    ctx.lineTo(x, y); dir = (dir + 1) % 4; if (i % 2 === 1) len += step;
  }
  ctx.stroke();
};

const scandinavianCross: Fn = (ctx, w, h, o, r) => {
  const sp = o.p.spacing / o.scale; const arm = sp * (o.p.arm / 100) * o.scale; const aw = o.strokeWidth; const tilt = (o.p.tilt * Math.PI) / 180;
  for (let y = sp / 2; y < h; y += sp) for (let x = sp / 2; x < w; x += sp) {
    if (r.skip()) continue;
    ctx.fillStyle = o.randomFill ? r.color() : o.color;
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
    ctx.fillRect(-aw / 2, -arm, aw, arm * 2); ctx.fillRect(-arm, -aw / 2, arm * 2, aw);
    ctx.restore();
  }
};

const triangularMosaic: Fn = (ctx, w, h, o, r) => {
  const c = o.p.cell * o.scale; const chaos = o.p.chaos / 100; const outline = o.p.outline > 0; stroke(ctx, o);
  for (let y = 0; y < h; y += c) for (let x = 0; x < w; x += c) {
    const random = Math.floor(r.rand() * 4);
    const orient = r.rand() < chaos ? random : (x / c + y / c) % 2 === 0 ? 0 : 2;
    if (r.skip()) continue;
    ctx.fillStyle = o.randomFill ? r.color() : o.color; ctx.beginPath();
    if (orient === 0) { ctx.moveTo(x, y); ctx.lineTo(x + c, y); ctx.lineTo(x, y + c); }
    else if (orient === 1) { ctx.moveTo(x + c, y); ctx.lineTo(x + c, y + c); ctx.lineTo(x, y); }
    else if (orient === 2) { ctx.moveTo(x + c, y + c); ctx.lineTo(x, y + c); ctx.lineTo(x + c, y); }
    else { ctx.moveTo(x, y + c); ctx.lineTo(x, y); ctx.lineTo(x + c, y + c); }
    ctx.closePath(); if (outline) { if (o.randomFill) ctx.strokeStyle = ctx.fillStyle as string; ctx.stroke(); } else ctx.fill();
  }
};

const hexPath = (ctx: Ctx, cx: number, cy: number, r: number) => {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) { const a = (Math.PI / 3) * i - Math.PI / 6; const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
  ctx.closePath(); ctx.stroke();
};

const tessellation: Fn = (ctx, w, h, o) => {
  const s = o.p.size / o.scale; const hh = s * Math.sqrt(3); stroke(ctx, o);
  for (let row = -1, y = 0; y < h + hh; row++, y = row * hh * 0.5) for (let x = (row % 2 ? s * 0.75 : 0) - s; x < w + s; x += s * 1.5) {
    hexPath(ctx, x, y, s / 2);
    if (o.p.inner > 0) hexPath(ctx, x, y, s / 4);
    if (o.p.cross > 0) { ctx.beginPath(); ctx.moveTo(x - s / 4, y); ctx.lineTo(x + s / 4, y); ctx.moveTo(x, y - s / 4); ctx.lineTo(x, y + s / 4); ctx.stroke(); }
  }
};

const voronoi: Fn = (ctx, w, h, o, r) => {
  const n = Math.round(o.p.points); const pts: [number, number][] = [];
  const v = vis(w, h, o, 0.1);
  for (let i = 0; i < n; i++) pts.push([v.x0 + r.rand() * (v.x1 - v.x0), v.y0 + r.rand() * (v.y1 - v.y0)]);
  const maxD = (Math.max(v.x1 - v.x0, v.y1 - v.y0) / Math.sqrt(n)) * (o.p.reach / 100); stroke(ctx, o); fillc(ctx, o);
  for (let i = 0; i < n; i++) for (let k = i + 1; k < n; k++) {
    const dx = pts[k][0] - pts[i][0], dy = pts[k][1] - pts[i][1]; const d = Math.hypot(dx, dy);
    if (d < maxD && d > 0) {
      const mx = (pts[i][0] + pts[k][0]) / 2, my = (pts[i][1] + pts[k][1]) / 2; const nx = -dy / d, ny = dx / d; const len = d * (o.p.len / 100) / 2;
      ctx.beginPath(); ctx.moveTo(mx - nx * len, my - ny * len); ctx.lineTo(mx + nx * len, my + ny * len); ctx.stroke();
    }
  }
  const rad = o.p.dot * o.scale;
  for (const [x, y] of pts) { ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill(); }
};

const fractalTree: Fn = (ctx, w, h, o) => {
  const maxDepth = Math.round(o.p.depth); const ang = (o.p.angle * Math.PI) / 180; const shrink = o.p.shrink / 100; ctx.strokeStyle = o.color; ctx.lineCap = o.cap; ctx.lineJoin = 'round';
  const branch = (x: number, y: number, len: number, a: number, depth: number) => {
    if (depth > maxDepth || len < 2) return;
    const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
    ctx.lineWidth = Math.max(0.4, o.strokeWidth * (1.6 - (1.4 * depth) / maxDepth));
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
    branch(x2, y2, len * shrink, a - ang, depth + 1); branch(x2, y2, len * shrink, a + ang, depth + 1);
    if (o.p.mid > 0) branch(x2, y2, len * shrink * 0.85, a, depth + 1);
  };
  branch(w / 2, o.tile ? h * 0.95 : h * 0.72, o.p.length * o.scale * (o.tile ? Math.min(1, h / 600) : 1), -Math.PI / 2, 1);
};

const DRAWERS: Record<PatternId, Fn> = {
  concentricCircles, diagonalLines, dotGrid, wavyLines, triangleGrid, squareSpiral, scandinavianCross, verticalStripes,
  voronoi, artDeco, tessellation, fractalTree, flowLines, waveField, joyDivision, quarterArcTruchet, nodeGarden,
  halftoneDots, concentricNoiseRings, chevronPattern, triangularMosaic,
};

export function drawPattern(ctx: Ctx, type: PatternId, w: number, h: number, o: DrawOpts) {
  ctx.globalAlpha = o.opacity;
  ctx.strokeStyle = o.color; ctx.fillStyle = o.color;
  DRAWERS[type](ctx, w, h, o, makeRng(o));
  ctx.globalAlpha = 1;
}
