// Motor de patrones: configuración, render en canvas y exportación SVG
import { UserTier } from './userTier';
import { drawPattern, resolveParams, DrawOpts } from './patternDraw';
import { SvgContext } from './svgContext';

export type PatternId =
  // Ultra-básicos (guest, free, premium)
  | 'concentricCircles'
  | 'diagonalLines'
  | 'dotGrid'
  // Básicos (free, premium — bloqueados para guest)
  | 'wavyLines'
  | 'triangleGrid'
  | 'squareSpiral'
  | 'scandinavianCross'
  | 'verticalStripes'
  // Avanzados (solo premium)
  | 'voronoi'
  | 'artDeco'
  | 'tessellation'
  | 'fractalTree'
  // Patrones Book of Shapes (solo premium)
  | 'flowLines'
  | 'waveField'
  | 'joyDivision'
  | 'quarterArcTruchet'
  | 'nodeGarden'
  | 'halftoneDots'
  | 'concentricNoiseRings'
  | 'chevronPattern'
  | 'triangularMosaic';

export type PatternTier = 'ultra-basic' | 'basic' | 'advanced';

export interface PatternConfig {
  type: PatternId;
  color: string; // Color del borde/línea
  fillColor?: string; // Color del relleno (opcional, si no se usa, se usa color)
  backgroundColor: string;
  density: number; // 0-100
  rotation: number; // 0-360
  scale: number; // 0.5-2.0
  strokeWidth?: number; // Grosor de línea
  tilePattern: boolean; // Repetir patrón en cuadrícula
  randomFillPerElement?: boolean; // Colores aleatorios por elemento individual
  quantity?: number; // Porcentaje de elementos visibles (0-100)
  colors?: string[]; // Paleta de colores (el primero es igual a `color`)
  distortion?: number; // Distorsión 0-100 (solo en patrones de DISTORTABLE_PATTERNS)
  opacity?: number; // Opacidad 10-100 (%)
  lineCap?: number; // Punta de línea: 0 redonda, 1 recta, 2 cuadrada
  pins?: Pin[]; // Pines de densidad del semitono (posición en % del lienzo visible)
  params?: Record<string, number>; // Parámetros propios de cada patrón (ver PATTERN_EXTRAS)
}

export interface Pin {
  x: number; // 0-100 (% del ancho visible)
  y: number; // 0-100 (% del alto visible)
  w: number; // intensidad 0.2-1.5
}

// Patrones donde la distorsión (ruido/ondas) tiene sentido
export const DISTORTABLE_PATTERNS: PatternId[] = [
  'concentricCircles', 'diagonalLines', 'verticalStripes', 'wavyLines', 'flowLines', 'waveField',
  'joyDivision', 'concentricNoiseRings', 'voronoi', 'nodeGarden', 'halftoneDots', 'dotGrid',
];

export interface PatternDefinition {
  id: PatternId;
  label: string;
  description: string;
  tier: PatternTier;
  emoji: string;
}

export const PATTERN_DEFINITIONS: PatternDefinition[] = [
  // Ultra-básicos
  { id: 'concentricCircles', label: 'Círculos Concéntricos', description: 'Anillos repetitivos', tier: 'ultra-basic', emoji: '◎' },
  { id: 'diagonalLines', label: 'Líneas Diagonales', description: 'Rayas en ángulo', tier: 'ultra-basic', emoji: '╱' },
  { id: 'dotGrid', label: 'Cuadrícula de Puntos', description: 'Puntos en rejilla', tier: 'ultra-basic', emoji: '⠿' },
  // Básicos
  { id: 'wavyLines', label: 'Líneas Onduladas', description: 'Ondas suaves', tier: 'basic', emoji: '∿' },
  { id: 'triangleGrid', label: 'Triángulos en Grid', description: 'Triángulos repetidos', tier: 'basic', emoji: '△' },
  { id: 'squareSpiral', label: 'Espiral Cuadrada', description: 'Espiral geométrica', tier: 'basic', emoji: '⌘' },
  { id: 'scandinavianCross', label: 'Cruz Escandinava', description: 'Cruces nórdicas', tier: 'basic', emoji: '✚' },
  { id: 'verticalStripes', label: 'Rayas Verticales', description: 'Bandas verticales', tier: 'basic', emoji: '▐' },
  // Avanzados
  { id: 'voronoi', label: 'Voronoi', description: 'Células orgánicas', tier: 'advanced', emoji: '⬡' },
  { id: 'artDeco', label: 'Art Deco', description: 'Líneas geométricas doradas', tier: 'advanced', emoji: '◈' },
  { id: 'tessellation', label: 'Tessellation', description: 'Teselado complejo', tier: 'advanced', emoji: '⬢' },
  { id: 'fractalTree', label: 'Fractal Tree', description: 'Árbol fractal', tier: 'advanced', emoji: '⚘' },
  // Patrones Book of Shapes
  { id: 'flowLines', label: 'Flow Lines', description: 'Líneas de flujo ondulantes', tier: 'advanced', emoji: '〰' },
  { id: 'waveField', label: 'Wave Field', description: 'Campo de ondas', tier: 'advanced', emoji: '🌊' },
  { id: 'joyDivision', label: 'Joy Division', description: 'Ondas verticales estilo Joy Division', tier: 'advanced', emoji: '📊' },
  { id: 'quarterArcTruchet', label: 'Arc Truchet', description: 'Arcos Truchet de cuarto', tier: 'advanced', emoji: '◠' },
  { id: 'nodeGarden', label: 'Node Garden', description: 'Jardín de nodos conectados', tier: 'advanced', emoji: '🕸' },
  { id: 'halftoneDots', label: 'Halftone Dots', description: 'Puntos de semitono', tier: 'advanced', emoji: '⚫' },
  { id: 'concentricNoiseRings', label: 'Noise Rings', description: 'Anillos concéntricos con ruido', tier: 'ultra-basic', emoji: '🌀' },
  { id: 'chevronPattern', label: 'Chevron', description: 'Patrón de chevron', tier: 'ultra-basic', emoji: '⟩' },
  { id: 'triangularMosaic', label: 'Triangular Mosaic', description: 'Mosaico de triángulos aleatorios', tier: 'advanced', emoji: '◢' },
];

export const defaultConfig: PatternConfig = {
  type: 'concentricCircles',
  color: '#FFFFFF',
  fillColor: undefined, // Si no se define, se usa el mismo que color
  backgroundColor: '#282828',
  density: 50,
  rotation: 0,
  scale: 1.0,
  strokeWidth: 2, // Grosor de línea por defecto (como en Illustrator)
  tilePattern: false,
  quantity: 100, // 100% de elementos visibles por defecto
};

/**
 * Returns whether a pattern is accessible for a given tier.
 */
// Por ahora todos los patrones están disponibles. Para bloquear los avanzados en Free,
// cambiar LOCK_ADVANCED_PATTERNS a true.
const LOCK_ADVANCED_PATTERNS = false;

export function isPatternAvailable(patternId: PatternId, tier: UserTier): boolean {
  const def = PATTERN_DEFINITIONS.find((p) => p.id === patternId);
  if (!def) return false;
  if (LOCK_ADVANCED_PATTERNS && def.tier === 'advanced') return tier === 'pro';
  return true;
}

export function getLockMessage(patternId: PatternId, tier: UserTier): string {
  return isPatternAvailable(patternId, tier) ? '' : 'Desbloquea este patrón con Pro';
}



// ─── Render en canvas ─────────────────────────────────────
// Las medidas están pensadas para un lado largo de 800 px y se escalan al tamaño real,
// así la vista previa, el PNG de cualquier resolución y el SVG muestran la misma composición.
const REF_SIZE = 800;
const CAPS: CanvasLineCap[] = ['round', 'butt', 'square'];

function buildOpts(config: PatternConfig, seed: number, tile = false): DrawOpts {
  return {
    color: config.color,
    scale: config.scale,
    strokeWidth: config.strokeWidth ?? 2,
    quantity: config.quantity ?? 100,
    randomFill: !!config.randomFillPerElement,
    seed,
    cap: CAPS[config.lineCap ?? 0] ?? 'round',
    opacity: Math.min(1, Math.max(0.1, (config.opacity ?? 100) / 100)),
    bg: config.backgroundColor,
    pins: config.pins ?? [],
    rotation: config.rotation ?? 0,
    tile,
    p: resolveParams(config.type, config.params),
  };
}

function renderPatternCore(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: PatternConfig,
  seed: number = 42,
  skipBackground = false
) {
  const { type, color, backgroundColor, density, rotation, scale, tilePattern } = config;

  ctx.clearRect(0, 0, width, height);
  if (!skipBackground && backgroundColor && backgroundColor !== 'transparent') {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  const k = Math.max(width, height) / REF_SIZE;
  const W = width / k, H = height / k;
  const opts = buildOpts(config, seed, tilePattern);

  ctx.save();
  ctx.scale(k, k);
  ctx.translate(W / 2, H / 2);
  ctx.rotate((rotation * Math.PI) / 180);

  if (tilePattern) {
    const tileSize = calculateTileSize(type, density, scale);
    const cols = Math.ceil(W / tileSize) + 2;
    const rows = Math.ceil(H / tileSize) + 2;
    ctx.translate(-(cols * tileSize) / 2, -(rows * tileSize) / 2);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        ctx.save();
        ctx.translate(col * tileSize, row * tileSize);
        drawPattern(ctx, type, tileSize, tileSize, opts);
        ctx.restore();
      }
    }
  } else {
    // Se dibuja al doble de tamaño para que la rotación no deje bordes vacíos
    ctx.translate(-W, -H);
    drawPattern(ctx, type, W * 2, H * 2, opts);
  }
  ctx.restore();
}

// ─── Distorsión (ruido suave) ─────────────────────────────
function hash2(ix: number, iy: number, s: number): number {
  let n = (Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(s, 982451653)) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  n ^= n >>> 16;
  return (n >>> 0) / 4294967295;
}

function valueNoise(x: number, y: number, s: number): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy, s), b = hash2(ix + 1, iy, s), c = hash2(ix, iy + 1, s), d = hash2(ix + 1, iy + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x: number, y: number, s: number): number {
  return (valueNoise(x, y, s) * 0.65 + valueNoise(x * 2.3, y * 2.3, s + 11) * 0.35 - 0.5) * 2;
}

/** Desplaza los píxeles con ruido suave (interpolación bilineal con alfa). amount: 0-100. */
export function warpPixels(src: Uint8ClampedArray, w: number, h: number, amount: number, seed: number): Uint8ClampedArray {
  const dst = new Uint8ClampedArray(src.length);
  const m = Math.min(w, h);
  const amp = (amount / 100) * 0.05 * m;
  const f = 3.5 / m;
  const s = Math.abs(Math.floor(seed)) % 100000;
  const maxX = w - 1, maxY = h - 1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let fx = x + fbm(x * f, y * f, s) * amp;
      let fy = y + fbm(x * f + 37.1, y * f + 11.7, s + 5) * amp;
      if (fx < 0) fx = 0; else if (fx > maxX) fx = maxX;
      if (fy < 0) fy = 0; else if (fy > maxY) fy = maxY;
      const x0 = fx | 0, y0 = fy | 0;
      const x1 = x0 < maxX ? x0 + 1 : x0, y1 = y0 < maxY ? y0 + 1 : y0;
      const tx = fx - x0, ty = fy - y0;
      const w00 = (1 - tx) * (1 - ty), w10 = tx * (1 - ty), w01 = (1 - tx) * ty, w11 = tx * ty;
      const i00 = (y0 * w + x0) * 4, i10 = (y0 * w + x1) * 4, i01 = (y1 * w + x0) * 4, i11 = (y1 * w + x1) * 4;
      const a00 = w00 * src[i00 + 3], a10 = w10 * src[i10 + 3], a01 = w01 * src[i01 + 3], a11 = w11 * src[i11 + 3];
      const A = a00 + a10 + a01 + a11;
      const o = (y * w + x) * 4;
      if (A > 0) {
        dst[o] = (a00 * src[i00] + a10 * src[i10] + a01 * src[i01] + a11 * src[i11]) / A;
        dst[o + 1] = (a00 * src[i00 + 1] + a10 * src[i10 + 1] + a01 * src[i01 + 1] + a11 * src[i11 + 1]) / A;
        dst[o + 2] = (a00 * src[i00 + 2] + a10 * src[i10 + 2] + a01 * src[i01 + 2] + a11 * src[i11 + 2]) / A;
        dst[o + 3] = A;
      }
    }
  }
  return dst;
}

// ─── Render principal (paleta + distorsión) ───────────────
// Cada trazo o relleno que use el color principal toma el siguiente color de la paleta
function withPalette(ctx: any, config: PatternConfig, run: () => void) {
  const palette = config.colors && config.colors.length > 1 ? config.colors : null;
  if (!palette) return run();
  ctx.strokeStyle = config.color;
  const baseStroke = ctx.strokeStyle;
  ctx.fillStyle = config.color;
  const baseFill = ctx.fillStyle;
  const origStroke = ctx.stroke.bind(ctx);
  const origFill = ctx.fill.bind(ctx);
  let i = 0;
  const next = () => palette[i++ % palette.length];
  ctx.stroke = (...args: any[]) => {
    if (ctx.strokeStyle === baseStroke) { ctx.strokeStyle = next(); origStroke(...args); ctx.strokeStyle = baseStroke; }
    else origStroke(...args);
  };
  ctx.fill = (...args: any[]) => {
    if (ctx.fillStyle === baseFill) { ctx.fillStyle = next(); origFill(...args); ctx.fillStyle = baseFill; }
    else origFill(...args);
  };
  try { run(); } finally { delete ctx.stroke; delete ctx.fill; }
}

export function generatePattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: PatternConfig,
  seed: number = 42
) {
  withPalette(ctx, config, () => renderPatternCore(ctx, width, height, config, seed));

  const distortion = config.distortion ?? 0;
  if (distortion > 0 && DISTORTABLE_PATTERNS.includes(config.type)) {
    const img = ctx.getImageData(0, 0, width, height);
    img.data.set(warpPixels(img.data, width, height, distortion, seed));
    ctx.putImageData(img, 0, 0);
  }
}

// Calculate tile size based on pattern type and parameters
function calculateTileSize(type: PatternId, density: number, scale: number): number {
  const baseSizes: Record<PatternId, number> = {
    concentricCircles: 150,
    diagonalLines: 100,
    dotGrid: 80,
    wavyLines: 120,
    triangleGrid: 100,
    squareSpiral: 120,
    scandinavianCross: 100,
    verticalStripes: 80,
    voronoi: 200,
    artDeco: 180,
    tessellation: 100,
    fractalTree: 200,
    flowLines: 120,
    waveField: 150,
    joyDivision: 100,
    quarterArcTruchet: 80,
    nodeGarden: 200,
    halftoneDots: 100,
    concentricNoiseRings: 180,
    chevronPattern: 100,
    triangularMosaic: 80,
  };

  const baseSize = baseSizes[type] || 100;
  const densityFactor = 1 - (density / 200); // Less density = larger tiles
  return baseSize * scale * densityFactor;
}

// ─── Exportación SVG ──────────────────────────────────────
// El SVG se genera grabando el mismo dibujo del canvas (ver svgContext.ts).
export function generateSVG(
  width: number,
  height: number,
  config: PatternConfig,
  seed: number = 42,
  transparentBackground: boolean = false
): string {
  const rec = new SvgContext();
  const transparent = transparentBackground || config.backgroundColor === 'transparent' || !config.backgroundColor;
  const k = Math.max(width, height) / REF_SIZE;
  let defs = '';
  let body: string;

  if (config.tilePattern) {
    const t = calculateTileSize(config.type, config.density, config.scale);
    const T = t * k;
    const cols = Math.ceil(width / T) + 2, rows = Math.ceil(height / T) + 2;
    withPalette(rec, config, () => {
      rec.save(); rec.scale(k, k);
      drawPattern(rec as any, config.type, t, t, buildOpts(config, seed, true));
      rec.restore();
    });
    const tf = `translate(${width / 2} ${height / 2}) rotate(${config.rotation}) translate(${-(cols * T) / 2} ${-(rows * T) / 2})`;
    defs = `<pattern id="gp-tile" width="${T}" height="${T}" patternUnits="userSpaceOnUse" patternTransform="${tf}">\n${rec.out.join('\n')}\n</pattern>`;
    body = `<rect width="${width}" height="${height}" fill="url(#gp-tile)"/>`;
  } else {
    withPalette(rec, config, () => renderPatternCore(rec as any, width, height, config, seed, true));
    body = rec.out.join('\n');
  }

  const distortion = config.distortion ?? 0;
  if (distortion > 0 && DISTORTABLE_PATTERNS.includes(config.type)) {
    const m = Math.min(width, height);
    const scaleAmt = ((distortion / 100) * 0.05 * m * 2).toFixed(2);
    const freq = (3.5 / m).toFixed(5);
    defs += `<filter id="gp-warp" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="${Math.abs(seed) % 1000}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${scaleAmt}" xChannelSelector="R" yChannelSelector="G"/></filter>`;
    body = `<g filter="url(#gp-warp)">\n${body}\n</g>`;
  }

  const bg = transparent ? '' : `<rect width="${width}" height="${height}" fill="${config.backgroundColor}"/>\n`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n${defs ? `<defs>${defs}</defs>\n` : ''}${bg}${body}\n</svg>`;
}
