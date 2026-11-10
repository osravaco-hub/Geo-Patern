// Pattern generation logic — 12 patterns across 3 tiers
import { UserTier } from './userTier';

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

// ─── Seeded random ────────────────────────────────────────
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ─── Main render function ─────────────────────────────────
function renderPatternCore(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: PatternConfig,
  seed: number = 42
) {
  const { type, color, backgroundColor, density, rotation, scale, tilePattern, randomFillPerElement, strokeWidth = 2, quantity = 100 } = config;

  // Clear and fill background
  ctx.clearRect(0, 0, width, height);
  if (backgroundColor && backgroundColor !== 'transparent') {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  if (tilePattern) {
    // Tile mode: repeat pattern in a grid
    const tileSize = calculateTileSize(type, density, scale);
    const cols = Math.ceil(width / tileSize) + 2;
    const rows = Math.ceil(height / tileSize) + 2;

    // Apply rotation around center
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-(cols * tileSize) / 2, -(rows * tileSize) / 2);

    // Draw pattern in each tile
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        ctx.save();
        ctx.translate(col * tileSize, row * tileSize);
        drawSinglePattern(ctx, type, tileSize, tileSize, color, backgroundColor, density, scale, seed, randomFillPerElement, strokeWidth, quantity);
        ctx.restore();
      }
    }

    ctx.restore();
  } else {
    // Single pattern mode: generate at 2x size
    const patternWidth = width * 2;
    const patternHeight = height * 2;

    // Apply rotation around center
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-patternWidth / 2, -patternHeight / 2);

    drawSinglePattern(ctx, type, patternWidth, patternHeight, color, backgroundColor, density, scale, seed, randomFillPerElement, strokeWidth, quantity);

    ctx.restore();
  }
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

/** Desplaza los píxeles con ruido suave. amount: 0-100. Devuelve un nuevo buffer. */
export function warpPixels(src: Uint32Array, w: number, h: number, amount: number, seed: number): Uint32Array {
  const dst = new Uint32Array(src.length);
  const m = Math.min(w, h);
  const amp = (amount / 100) * 0.05 * m;
  const f = 3.5 / m;
  const s = Math.abs(Math.floor(seed)) % 100000;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sx = Math.round(x + fbm(x * f, y * f, s) * amp);
      let sy = Math.round(y + fbm(x * f + 37.1, y * f + 11.7, s + 5) * amp);
      if (sx < 0) sx = 0; else if (sx >= w) sx = w - 1;
      if (sy < 0) sy = 0; else if (sy >= h) sy = h - 1;
      dst[y * w + x] = src[sy * w + sx];
    }
  }
  return dst;
}

// ─── Render principal (paleta + distorsión) ───────────────
export function generatePattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: PatternConfig,
  seed: number = 42
) {
  const palette = config.colors && config.colors.length > 1 ? config.colors : null;
  const c = ctx as any;
  let patched = false;

  try {
    if (palette) {
      // Cada trazo o relleno que use el color principal toma el siguiente color de la paleta
      ctx.strokeStyle = config.color;
      const baseStroke = ctx.strokeStyle;
      ctx.fillStyle = config.color;
      const baseFill = ctx.fillStyle;
      const origStroke = ctx.stroke.bind(ctx);
      const origFill = ctx.fill.bind(ctx);
      let i = 0;
      const next = () => palette[i++ % palette.length];
      c.stroke = (...args: any[]) => {
        if (ctx.strokeStyle === baseStroke) {
          ctx.strokeStyle = next();
          (origStroke as any)(...args);
          ctx.strokeStyle = baseStroke;
        } else (origStroke as any)(...args);
      };
      c.fill = (...args: any[]) => {
        if (ctx.fillStyle === baseFill) {
          ctx.fillStyle = next();
          (origFill as any)(...args);
          ctx.fillStyle = baseFill;
        } else (origFill as any)(...args);
      };
      patched = true;
    }
    renderPatternCore(ctx, width, height, config, seed);
  } finally {
    if (patched) {
      delete c.stroke;
      delete c.fill;
    }
  }

  const distortion = config.distortion ?? 0;
  if (distortion > 0 && DISTORTABLE_PATTERNS.includes(config.type)) {
    const img = ctx.getImageData(0, 0, width, height);
    const out = warpPixels(new Uint32Array(img.data.buffer), width, height, distortion, seed);
    img.data.set(new Uint8ClampedArray(out.buffer));
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

// Draw a single pattern instance
function drawSinglePattern(
  ctx: CanvasRenderingContext2D,
  type: PatternId,
  w: number,
  h: number,
  color: string,
  backgroundColor: string,
  density: number,
  scale: number,
  seed: number,
  randomFillPerElement: boolean = false,
  strokeWidth: number = 2,
  quantity: number = 100
) {
  switch (type) {
    case 'concentricCircles':
      drawConcentricCircles(ctx, w, h, color, density, scale, strokeWidth);
      break;
    case 'diagonalLines':
      drawDiagonalLines(ctx, w, h, color, density, scale, strokeWidth);
      break;
    case 'dotGrid':
      drawDotGrid(ctx, w, h, color, density, scale, randomFillPerElement, quantity);
      break;
    case 'wavyLines':
      drawWavyLines(ctx, w, h, color, density, scale, strokeWidth);
      break;
    case 'triangleGrid':
      drawTriangleGrid(ctx, w, h, color, density, scale, strokeWidth);
      break;
    case 'squareSpiral':
      drawSquareSpiral(ctx, w, h, color, density, scale, strokeWidth);
      break;
    case 'scandinavianCross':
      drawScandinavianCross(ctx, w, h, color, density, scale, randomFillPerElement, strokeWidth, quantity);
      break;
    case 'verticalStripes':
      drawVerticalStripes(ctx, w, h, color, density, scale, randomFillPerElement, quantity);
      break;
    case 'voronoi':
      drawVoronoi(ctx, w, h, color, backgroundColor, density, scale, seed, strokeWidth);
      break;
    case 'artDeco':
      drawArtDeco(ctx, w, h, color, density, scale, strokeWidth);
      break;
    case 'tessellation':
      drawTessellation(ctx, w, h, color, density, scale, strokeWidth);
      break;
    case 'fractalTree':
      drawFractalTree(ctx, w, h, color, density, scale, strokeWidth);
      break;
    case 'flowLines':
      drawFlowLines(ctx, w, h, color, density, scale, seed, strokeWidth);
      break;
    case 'waveField':
      drawWaveField(ctx, w, h, color, density, scale, seed, randomFillPerElement, strokeWidth, quantity);
      break;
    case 'joyDivision':
      drawJoyDivision(ctx, w, h, color, density, scale, seed, strokeWidth);
      break;
    case 'quarterArcTruchet':
      drawQuarterArcTruchet(ctx, w, h, color, density, scale, seed, strokeWidth);
      break;
    case 'nodeGarden':
      drawNodeGarden(ctx, w, h, color, density, scale, seed, strokeWidth);
      break;
    case 'halftoneDots':
      drawHalftoneDots(ctx, w, h, color, density, scale, seed, randomFillPerElement, quantity);
      break;
    case 'concentricNoiseRings':
      drawConcentricNoiseRings(ctx, w, h, color, density, scale, seed, strokeWidth);
      break;
    case 'chevronPattern':
      drawChevronPattern(ctx, w, h, color, density, scale, strokeWidth);
      break;
    case 'triangularMosaic':
      drawTriangularMosaic(ctx, w, h, color, density, scale, seed, randomFillPerElement, quantity);
      break;
  }
}

// ─── ULTRA-BASIC PATTERNS ─────────────────────────────────

function drawConcentricCircles(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  density: number,
  scale: number,
  strokeWidth: number = 2
) {
  const cx = w / 2;
  const cy = h / 2;
  // Make the pattern fill the entire canvas
  const maxRadius = Math.max(w, h) * 0.8 * scale;
  // Mayor rango de densidad: de 5 a 80 círculos
  const numCircles = Math.max(5, Math.floor(5 + (density / 100) * 75));
  const spacing = maxRadius / numCircles;

  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Draw concentric circles filling the canvas
  for (let i = 1; i <= numCircles; i++) {
    ctx.beginPath();
    ctx.arc(cx, cy, i * spacing, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawDiagonalLines(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  density: number,
  scale: number,
  strokeWidth: number = 2
) {
  const spacing = Math.max(8, 60 - (density / 100) * 50) / scale;
  const diagonal = Math.sqrt(w * w + h * h);

  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (let i = -diagonal; i < diagonal * 2; i += spacing) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i - h, h);
    ctx.stroke();
  }
}

function drawDotGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  density: number,
  scale: number,
  randomFillPerElement: boolean = false,
  quantity: number = 100
) {
  const spacing = Math.max(10, 50 - (density / 100) * 40) / scale;
  const radius = Math.max(1.5, (3 + (density / 100) * 4) * scale);

  for (let x = spacing / 2; x < w + spacing; x += spacing) {
    for (let y = spacing / 2; y < h + spacing; y += spacing) {
      // Skip elements based on quantity
      if (Math.random() * 100 > quantity) continue;

      if (randomFillPerElement) {
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        ctx.fillStyle = randomColor;
      } else {
        ctx.fillStyle = color;
      }
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ─── BASIC PATTERNS ───────────────────────────────────────

function drawWavyLines(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  density: number,
  scale: number,
  strokeWidth: number = 2
) {
  const numLines = Math.max(3, Math.floor(4 + (density / 100) * 16));
  const amplitude = (20 + (density / 100) * 30) * scale;
  const frequency = (0.01 + (density / 100) * 0.03) / scale;
  const spacing = h / (numLines + 1);

  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (let i = 1; i <= numLines; i++) {
    const baseY = i * spacing;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const y = baseY + Math.sin(x * frequency + i * 0.8) * amplitude;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function drawTriangleGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  density: number,
  scale: number,
  strokeWidth: number = 2
) {
  const size = Math.max(15, 60 - (density / 100) * 45) / scale;
  const height = size * (Math.sqrt(3) / 2);

  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  let row = 0;
  for (let y = 0; y < h + height * 2; y += height) {
    const offset = row % 2 === 0 ? 0 : size / 2;
    for (let x = -size + offset; x < w + size; x += size) {
      // Upward triangle
      ctx.beginPath();
      ctx.moveTo(x, y + height);
      ctx.lineTo(x + size / 2, y);
      ctx.lineTo(x + size, y + height);
      ctx.closePath();
      ctx.stroke();
    }
    row++;
  }
}

function drawSquareSpiral(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  density: number,
  scale: number,
  strokeWidth: number = 2
) {
  const cx = w / 2;
  const cy = h / 2;
  // Mayor rango de densidad: de 20 a 200 pasos
  const maxSteps = Math.max(20, Math.floor(20 + (density / 100) * 180));
  const stepSize = Math.max(4, 12 * scale);

  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  let x = cx;
  let y = cy;
  let direction = 0; // 0=right, 1=down, 2=left, 3=up
  let stepsInDirection = 1;
  let stepsTaken = 0;
  let directionChanges = 0;

  ctx.beginPath();
  ctx.moveTo(x, y);

  for (let i = 0; i < maxSteps; i++) {
    for (let s = 0; s < stepsInDirection; s++) {
      switch (direction) {
        case 0: x += stepSize; break;
        case 1: y += stepSize; break;
        case 2: x -= stepSize; break;
        case 3: y -= stepSize; break;
      }
      ctx.lineTo(x, y);
      stepsTaken++;
    }
    direction = (direction + 1) % 4;
    directionChanges++;
    if (directionChanges % 2 === 0) {
      stepsInDirection++;
    }
  }
  ctx.stroke();
}

function drawScandinavianCross(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  density: number,
  scale: number,
  randomFillPerElement: boolean = false,
  strokeWidth: number = 2,
  quantity: number = 100
) {
  const spacing = Math.max(25, 80 - (density / 100) * 55) / scale;
  const armLength = spacing * 0.35 * scale;
  const armWidth = strokeWidth;

  for (let x = spacing / 2; x < w + spacing; x += spacing) {
    for (let y = spacing / 2; y < h + spacing; y += spacing) {
      // Skip elements based on quantity (100 = all visible, 0 = none visible)
      if (Math.random() * 100 > quantity) continue;

      if (randomFillPerElement) {
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        ctx.fillStyle = randomColor;
      } else {
        ctx.fillStyle = color;
      }
      // Vertical bar
      ctx.fillRect(x - armWidth / 2, y - armLength, armWidth, armLength * 2);
      // Horizontal bar
      ctx.fillRect(x - armLength, y - armWidth / 2, armLength * 2, armWidth);
    }
  }
}

function drawVerticalStripes(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  density: number,
  scale: number,
  randomFillPerElement: boolean = false,
  quantity: number = 100
) {
  const stripeWidth = Math.max(4, 30 - (density / 100) * 25) * scale;
  const gap = Math.max(4, 20 - (density / 100) * 15) * scale;

  for (let x = 0; x < w + stripeWidth + gap; x += stripeWidth + gap) {
    // Skip elements based on quantity
    if (Math.random() * 100 > quantity) continue;

    if (randomFillPerElement) {
      const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
      ctx.fillStyle = randomColor;
    } else {
      ctx.fillStyle = color;
    }
    ctx.fillRect(x, -10, stripeWidth, h + 20);
  }
}

// ─── ADVANCED PATTERNS ────────────────────────────────────

function drawVoronoi(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  _bgColor: string,
  density: number,
  scale: number,
  seed: number,
  strokeWidth: number = 2
) {
  const numPoints = Math.max(5, Math.floor(8 + (density / 100) * 40));
  const rand = seededRandom(seed);

  // Generate random points
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < numPoints; i++) {
    points.push({
      x: rand() * w,
      y: rand() * h,
    });
  }

  // Draw Voronoi-like cells using nearest-point pixel assignment (simplified)
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Draw edges by finding midpoints between neighboring points
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[j].x - points[i].x;
      const dy = points[j].y - points[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < (Math.max(w, h) / Math.sqrt(numPoints)) * 1.8) {
        // Draw connecting line
        const mx = (points[i].x + points[j].x) / 2;
        const my = (points[i].y + points[j].y) / 2;

        // Perpendicular line at midpoint
        const angle = Math.atan2(dy, dx) + Math.PI / 2;
        const len = dist * 0.6;

        ctx.beginPath();
        ctx.moveTo(mx - Math.cos(angle) * len, my - Math.sin(angle) * len);
        ctx.lineTo(mx + Math.cos(angle) * len, my + Math.sin(angle) * len);
        ctx.stroke();

        // Draw points
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Draw all points
  ctx.fillStyle = color;
  for (const p of points) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3 * scale, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawArtDeco(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  density: number,
  scale: number,
  strokeWidth: number = 2
) {
  const cx = w / 2;
  const cy = h / 2;
  const numRays = Math.max(6, Math.floor(8 + (density / 100) * 24));
  const maxRadius = Math.max(w, h) * 0.7;

  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Fan rays from bottom center
  for (let i = 0; i <= numRays; i++) {
    const angle = -Math.PI + (Math.PI * i) / numRays;
    ctx.beginPath();
    ctx.moveTo(cx, cy + h * 0.3);
    ctx.lineTo(
      cx + Math.cos(angle) * maxRadius,
      cy + h * 0.3 + Math.sin(angle) * maxRadius
    );
    ctx.stroke();
  }

  // Concentric arcs
  const numArcs = Math.max(3, Math.floor(4 + (density / 100) * 8));
  for (let i = 1; i <= numArcs; i++) {
    const radius = (i / numArcs) * maxRadius * 0.8 * scale;
    ctx.beginPath();
    ctx.arc(cx, cy + h * 0.3, radius, -Math.PI, 0);
    ctx.stroke();
  }

  // Decorative diamond at top
  const diamondSize = 20 * scale;
  ctx.beginPath();
  ctx.moveTo(cx, cy - h * 0.3);
  ctx.lineTo(cx + diamondSize, cy - h * 0.3 + diamondSize);
  ctx.lineTo(cx, cy - h * 0.3 + diamondSize * 2);
  ctx.lineTo(cx - diamondSize, cy - h * 0.3 + diamondSize);
  ctx.closePath();
  ctx.stroke();
}

function drawTessellation(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  density: number,
  scale: number,
  strokeWidth: number = 2
) {
  const size = Math.max(20, 60 - (density / 100) * 40) / scale;
  const hexHeight = size * Math.sqrt(3);

  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  let row = 0;
  for (let y = -hexHeight; y < h + hexHeight; y += hexHeight * 0.75) {
    const offset = row % 2 === 0 ? 0 : size * 1.5;
    for (let x = -size * 2 + offset; x < w + size * 2; x += size * 3) {
      // Draw hexagon
      drawHexagonShape(ctx, x, y, size);
      // Inner pattern — smaller rotated hexagon
      drawHexagonShape(ctx, x, y, size * 0.5);
      // Connecting lines
      ctx.beginPath();
      ctx.moveTo(x - size * 0.5, y - size * 0.3);
      ctx.lineTo(x + size * 0.5, y + size * 0.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + size * 0.5, y - size * 0.3);
      ctx.lineTo(x - size * 0.5, y + size * 0.3);
      ctx.stroke();
    }
    row++;
  }
}

function drawHexagonShape(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
}

// ─── SVG GENERATION FUNCTIONS ─────────────────────────────

function generateSVGCore(
  width: number,
  height: number,
  config: PatternConfig,
  seed: number = 42,
  transparentBackground: boolean = false
): string {
  const { type, color, backgroundColor, density, rotation, scale, tilePattern } = config;
  const bgColor = transparentBackground || backgroundColor === 'transparent' ? 'none' : backgroundColor;

  let patternContent = '';
  let transformAttr = '';

  if (tilePattern) {
    // Tile mode: repeat pattern in a grid
    const tileSize = calculateTileSize(type, density, scale);
    const cols = Math.ceil(width / tileSize) + 2;
    const rows = Math.ceil(height / tileSize) + 2;

    // Generate SVG pattern definition for efficient tiling
    const singlePattern = generateSingleSVGPattern(type, tileSize, tileSize, color, density, scale, seed);
    
    patternContent = `
    <defs>
      <pattern id="tilePattern" x="0" y="0" width="${tileSize}" height="${tileSize}" patternUnits="userSpaceOnUse">
        ${singlePattern}
      </pattern>
    </defs>
    <rect width="${cols * tileSize}" height="${rows * tileSize}" fill="url(#tilePattern)"/>
    `;

    // Calculate offset to center the tiled pattern
    const totalWidth = cols * tileSize;
    const totalHeight = rows * tileSize;
    const offsetX = (totalWidth - width) / 2;
    const offsetY = (totalHeight - height) / 2;

    transformAttr = `translate(-${offsetX}, -${offsetY}) rotate(${rotation} ${totalWidth / 2} ${totalHeight / 2})`;
  } else {
    // Single pattern mode: generate at 2x size
    const patternWidth = width * 2;
    const patternHeight = height * 2;

    switch (type) {
      case 'concentricCircles':
        patternContent = svgConcentricCircles(patternWidth, patternHeight, color, density, scale);
        break;
      case 'diagonalLines':
        patternContent = svgDiagonalLines(patternWidth, patternHeight, color, density, scale);
        break;
      case 'dotGrid':
        patternContent = svgDotGrid(patternWidth, patternHeight, color, density, scale);
        break;
      case 'wavyLines':
        patternContent = svgWavyLines(patternWidth, patternHeight, color, density, scale);
        break;
      case 'triangleGrid':
        patternContent = svgTriangleGrid(patternWidth, patternHeight, color, density, scale);
        break;
      case 'squareSpiral':
        patternContent = svgSquareSpiral(patternWidth, patternHeight, color, density, scale);
        break;
      case 'scandinavianCross':
        patternContent = svgScandinavianCross(patternWidth, patternHeight, color, density, scale);
        break;
      case 'verticalStripes':
        patternContent = svgVerticalStripes(patternWidth, patternHeight, color, density, scale);
        break;
      case 'voronoi':
        patternContent = svgVoronoi(patternWidth, patternHeight, color, density, scale, seed);
        break;
      case 'artDeco':
        patternContent = svgArtDeco(patternWidth, patternHeight, color, density, scale);
        break;
      case 'tessellation':
        patternContent = svgTessellation(patternWidth, patternHeight, color, density, scale);
        break;
      case 'fractalTree':
        patternContent = svgFractalTree(width, height, color, density, scale);
        break;
      case 'flowLines':
        patternContent = svgFlowLines(patternWidth, patternHeight, color, density, scale, seed);
        break;
      case 'waveField':
        patternContent = svgWaveField(patternWidth, patternHeight, color, density, scale, seed);
        break;
      case 'joyDivision':
        patternContent = svgJoyDivision(patternWidth, patternHeight, color, density, scale, seed);
        break;
      case 'quarterArcTruchet':
        patternContent = svgQuarterArcTruchet(patternWidth, patternHeight, color, density, scale, seed);
        break;
      case 'nodeGarden':
        patternContent = svgNodeGarden(patternWidth, patternHeight, color, density, scale, seed);
        break;
      case 'halftoneDots':
        patternContent = svgHalftoneDots(patternWidth, patternHeight, color, density, scale, seed);
        break;
      case 'concentricNoiseRings':
        patternContent = svgConcentricNoiseRings(patternWidth, patternHeight, color, density, scale, seed);
        break;
      case 'chevronPattern':
        patternContent = svgChevronPattern(patternWidth, patternHeight, color, density, scale);
        break;
      case 'triangularMosaic':
        patternContent = svgTriangularMosaic(patternWidth, patternHeight, color, density, scale, seed);
        break;
    }

    // Calculate offset to center the larger pattern
    const offsetX = (patternWidth - width) / 2;
    const offsetY = (patternHeight - height) / 2;

    transformAttr = `translate(-${offsetX}, -${offsetY}) rotate(${rotation} ${patternWidth / 2} ${patternHeight / 2})`;
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${bgColor}"/>
  <g transform="${transformAttr}">
    ${patternContent}
  </g>
</svg>`;

  return svg;
}


function applyPaletteToSvg(content: string, color: string, palette: string[]): string {
  let i = 0;
  return content.replace(/(stroke|fill)="([^"]*)"/g, (m, attr, val) =>
    val === color ? `${attr}="${palette[i++ % palette.length]}"` : m
  );
}

export function generateSVG(
  width: number,
  height: number,
  config: PatternConfig,
  seed: number = 42,
  transparentBackground: boolean = false
): string {
  let svg = generateSVGCore(width, height, config, seed, transparentBackground);
  const start = svg.indexOf('<g transform="');
  if (start < 0) return svg;

  if (config.colors && config.colors.length > 1) {
    svg = svg.slice(0, start) + applyPaletteToSvg(svg.slice(start), config.color, config.colors);
  }

  const distortion = config.distortion ?? 0;
  if (distortion > 0 && DISTORTABLE_PATTERNS.includes(config.type)) {
    const m = Math.min(width, height);
    const scaleAmt = ((distortion / 100) * 0.05 * m * 2).toFixed(2);
    const freq = (3.5 / m).toFixed(5);
    const filter = `<defs><filter id="gp-warp" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="${Math.abs(seed) % 1000}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${scaleAmt}" xChannelSelector="R" yChannelSelector="G"/></filter></defs>\n  <g filter="url(#gp-warp)">\n  `;
    svg = svg.slice(0, start) + filter + svg.slice(start);
    const end = svg.lastIndexOf('</svg>');
    svg = svg.slice(0, end) + '</g>\n' + svg.slice(end);
  }
  return svg;
}

// Generate a single SVG pattern instance for tiling
function generateSingleSVGPattern(
  type: PatternId,
  w: number,
  h: number,
  color: string,
  density: number,
  scale: number,
  seed: number
): string {
  switch (type) {
    case 'concentricCircles':
      return svgConcentricCircles(w, h, color, density, scale);
    case 'diagonalLines':
      return svgDiagonalLines(w, h, color, density, scale);
    case 'dotGrid':
      return svgDotGrid(w, h, color, density, scale);
    case 'wavyLines':
      return svgWavyLines(w, h, color, density, scale);
    case 'triangleGrid':
      return svgTriangleGrid(w, h, color, density, scale);
    case 'squareSpiral':
      return svgSquareSpiral(w, h, color, density, scale);
    case 'scandinavianCross':
      return svgScandinavianCross(w, h, color, density, scale);
    case 'verticalStripes':
      return svgVerticalStripes(w, h, color, density, scale);
    case 'voronoi':
      return svgVoronoi(w, h, color, density, scale, seed);
    case 'artDeco':
      return svgArtDeco(w, h, color, density, scale);
    case 'tessellation':
      return svgTessellation(w, h, color, density, scale);
    case 'fractalTree':
      return svgFractalTree(w, h, color, density, scale);
    case 'flowLines':
      return svgFlowLines(w, h, color, density, scale, seed);
    case 'waveField':
      return svgWaveField(w, h, color, density, scale, seed);
    case 'joyDivision':
      return svgJoyDivision(w, h, color, density, scale, seed);
    case 'quarterArcTruchet':
      return svgQuarterArcTruchet(w, h, color, density, scale, seed);
    case 'nodeGarden':
      return svgNodeGarden(w, h, color, density, scale, seed);
    case 'halftoneDots':
      return svgHalftoneDots(w, h, color, density, scale, seed);
    case 'concentricNoiseRings':
      return svgConcentricNoiseRings(w, h, color, density, scale, seed);
    case 'chevronPattern':
      return svgChevronPattern(w, h, color, density, scale);
    case 'triangularMosaic':
      return svgTriangularMosaic(w, h, color, density, scale, seed);
    default:
      return '';
  }
}

function svgConcentricCircles(w: number, h: number, color: string, density: number, scale: number, strokeWidth: number = 2): string {
  const cx = w / 2;
  const cy = h / 2;
  const maxRadius = Math.max(w, h) * 0.8 * scale;
  // Mayor rango de densidad: de 5 a 80 círculos
  const numCircles = Math.max(5, Math.floor(5 + (density / 100) * 75));
  const spacing = maxRadius / numCircles;

  let circles = '';
  for (let i = 1; i <= numCircles; i++) {
    circles += `<circle cx="${cx}" cy="${cy}" r="${i * spacing}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  return circles;
}

function svgDiagonalLines(w: number, h: number, color: string, density: number, scale: number, strokeWidth: number = 2): string {
  const spacing = Math.max(8, 60 - (density / 100) * 50) / scale;
  const diagonal = Math.sqrt(w * w + h * h);

  let lines = '';
  for (let i = -diagonal; i < diagonal * 2; i += spacing) {
    lines += `<line x1="${i}" y1="0" x2="${i - h}" y2="${h}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>`;
  }
  return lines;
}

function svgDotGrid(w: number, h: number, color: string, density: number, scale: number): string {
  const spacing = Math.max(10, 50 - (density / 100) * 40) / scale;
  const radius = Math.max(1.5, (3 + (density / 100) * 4) * scale);

  let dots = '';
  for (let x = spacing / 2; x < w + spacing; x += spacing) {
    for (let y = spacing / 2; y < h + spacing; y += spacing) {
      dots += `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}"/>`;
    }
  }
  return dots;
}

function svgWavyLines(w: number, h: number, color: string, density: number, scale: number, strokeWidth: number = 2): string {
  const numLines = Math.max(3, Math.floor(4 + (density / 100) * 16));
  const amplitude = (20 + (density / 100) * 30) * scale;
  const frequency = (0.01 + (density / 100) * 0.03) / scale;
  const spacing = h / (numLines + 1);

  let waves = '';
  for (let i = 1; i <= numLines; i++) {
    const baseY = i * spacing;
    let path = `M 0 ${baseY}`;
    for (let x = 0; x <= w; x += 2) {
      const y = baseY + Math.sin(x * frequency + i * 0.8) * amplitude;
      path += ` L ${x} ${y}`;
    }
    waves += `<path d="${path}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  return waves;
}

function svgTriangleGrid(w: number, h: number, color: string, density: number, scale: number, strokeWidth: number = 2): string {
  const size = Math.max(15, 60 - (density / 100) * 45) / scale;
  const height = size * (Math.sqrt(3) / 2);

  let triangles = '';
  let row = 0;
  for (let y = 0; y < h + height * 2; y += height) {
    const offset = row % 2 === 0 ? 0 : size / 2;
    for (let x = -size + offset; x < w + size; x += size) {
      const p1 = `${x},${y + height}`;
      const p2 = `${x + size / 2},${y}`;
      const p3 = `${x + size},${y + height}`;
      triangles += `<polygon points="${p1} ${p2} ${p3}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>`;
    }
    row++;
  }
  return triangles;
}

function svgSquareSpiral(w: number, h: number, color: string, density: number, scale: number): string {
  const cx = w / 2;
  const cy = h / 2;
  // Mayor rango de densidad: de 20 a 200 pasos
  const maxSteps = Math.max(20, Math.floor(20 + (density / 100) * 180));
  const stepSize = Math.max(4, 12 * scale);
  const strokeWidth = Math.max(1, 2 * scale);

  let x = cx;
  let y = cy;
  let direction = 0;
  let stepsInDirection = 1;
  let directionChanges = 0;
  let path = `M ${x} ${y}`;

  for (let i = 0; i < maxSteps; i++) {
    for (let s = 0; s < stepsInDirection; s++) {
      switch (direction) {
        case 0: x += stepSize; break;
        case 1: y += stepSize; break;
        case 2: x -= stepSize; break;
        case 3: y -= stepSize; break;
      }
      path += ` L ${x} ${y}`;
    }
    direction = (direction + 1) % 4;
    directionChanges++;
    if (directionChanges % 2 === 0) {
      stepsInDirection++;
    }
  }

  return `<path d="${path}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>`;
}

function svgScandinavianCross(w: number, h: number, color: string, density: number, scale: number): string {
  const spacing = Math.max(25, 80 - (density / 100) * 55) / scale;
  const armLength = spacing * 0.35 * scale;
  const armWidth = Math.max(2, 4 * scale);

  let crosses = '';
  for (let x = spacing / 2; x < w + spacing; x += spacing) {
    for (let y = spacing / 2; y < h + spacing; y += spacing) {
      crosses += `<rect x="${x - armWidth / 2}" y="${y - armLength}" width="${armWidth}" height="${armLength * 2}" fill="${color}"/>`;
      crosses += `<rect x="${x - armLength}" y="${y - armWidth / 2}" width="${armLength * 2}" height="${armWidth}" fill="${color}"/>`;
    }
  }
  return crosses;
}

function svgVerticalStripes(w: number, h: number, color: string, density: number, scale: number): string {
  const stripeWidth = Math.max(4, 30 - (density / 100) * 25) * scale;
  const gap = Math.max(4, 20 - (density / 100) * 15) * scale;

  let stripes = '';
  for (let x = 0; x < w + stripeWidth + gap; x += stripeWidth + gap) {
    stripes += `<rect x="${x}" y="-10" width="${stripeWidth}" height="${h + 20}" fill="${color}"/>`;
  }
  return stripes;
}

function svgVoronoi(w: number, h: number, color: string, density: number, scale: number, seed: number): string {
  const numPoints = Math.max(5, Math.floor(8 + (density / 100) * 40));
  const rand = seededRandom(seed);
  const strokeWidth = Math.max(0.5, 1.5 * scale);

  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < numPoints; i++) {
    points.push({ x: rand() * w, y: rand() * h });
  }

  let voronoi = '';
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[j].x - points[i].x;
      const dy = points[j].y - points[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < (Math.max(w, h) / Math.sqrt(numPoints)) * 1.8) {
        const mx = (points[i].x + points[j].x) / 2;
        const my = (points[i].y + points[j].y) / 2;
        const angle = Math.atan2(dy, dx) + Math.PI / 2;
        const len = dist * 0.6;

        voronoi += `<line x1="${mx - Math.cos(angle) * len}" y1="${my - Math.sin(angle) * len}" x2="${mx + Math.cos(angle) * len}" y2="${my + Math.sin(angle) * len}" stroke="${color}" stroke-width="${strokeWidth}"/>`;
      }
    }
  }

  for (const p of points) {
    voronoi += `<circle cx="${p.x}" cy="${p.y}" r="${3 * scale}" fill="${color}"/>`;
  }

  return voronoi;
}

function svgArtDeco(w: number, h: number, color: string, density: number, scale: number): string {
  const cx = w / 2;
  const cy = h / 2;
  const numRays = Math.max(6, Math.floor(8 + (density / 100) * 24));
  const maxRadius = Math.max(w, h) * 0.7;
  const strokeWidth = Math.max(1, 2.5 * scale);

  let artDeco = '';

  // Fan rays
  for (let i = 0; i <= numRays; i++) {
    const angle = -Math.PI + (Math.PI * i) / numRays;
    const x2 = cx + Math.cos(angle) * maxRadius;
    const y2 = cy + h * 0.3 + Math.sin(angle) * maxRadius;
    artDeco += `<line x1="${cx}" y1="${cy + h * 0.3}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${strokeWidth}"/>`;
  }

  // Concentric arcs
  const numArcs = Math.max(3, Math.floor(4 + (density / 100) * 8));
  for (let i = 1; i <= numArcs; i++) {
    const radius = (i / numArcs) * maxRadius * 0.8 * scale;
    artDeco += `<path d="M ${cx - radius} ${cy + h * 0.3} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy + h * 0.3}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>`;
  }

  // Diamond
  const diamondSize = 20 * scale;
  const dy = cy - h * 0.3;
  artDeco += `<polygon points="${cx},${dy} ${cx + diamondSize},${dy + diamondSize} ${cx},${dy + diamondSize * 2} ${cx - diamondSize},${dy + diamondSize}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>`;

  return artDeco;
}

function svgTessellation(w: number, h: number, color: string, density: number, scale: number): string {
  const size = Math.max(20, 60 - (density / 100) * 40) / scale;
  const hexHeight = size * Math.sqrt(3);
  const strokeWidth = Math.max(0.5, 1.5 * scale);

  let tessellation = '';
  let row = 0;
  for (let y = -hexHeight; y < h + hexHeight; y += hexHeight * 0.75) {
    const offset = row % 2 === 0 ? 0 : size * 1.5;
    for (let x = -size * 2 + offset; x < w + size * 2; x += size * 3) {
      // Outer hexagon
      tessellation += svgHexagonPath(x, y, size, color, strokeWidth);
      // Inner hexagon
      tessellation += svgHexagonPath(x, y, size * 0.5, color, strokeWidth);
      // Connecting lines
      tessellation += `<line x1="${x - size * 0.5}" y1="${y - size * 0.3}" x2="${x + size * 0.5}" y2="${y + size * 0.3}" stroke="${color}" stroke-width="${strokeWidth}"/>`;
      tessellation += `<line x1="${x + size * 0.5}" y1="${y - size * 0.3}" x2="${x - size * 0.5}" y2="${y + size * 0.3}" stroke="${color}" stroke-width="${strokeWidth}"/>`;
    }
    row++;
  }
  return tessellation;
}

function svgHexagonPath(cx: number, cy: number, r: number, color: string, strokeWidth: number): string {
  let points = '';
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    points += `${x},${y} `;
  }
  return `<polygon points="${points.trim()}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>`;
}

function svgFractalTree(w: number, h: number, color: string, density: number, scale: number): string {
  const maxDepth = Math.max(3, Math.floor(4 + (density / 100) * 7));
  const branchLength = (60 + (density / 100) * 40) * scale;
  const branchAngle = Math.PI / 6 + (density / 100) * (Math.PI / 6);

  const startX = w / 2;
  const startY = h * 0.85;

  let tree = '';

  // Trunk
  const trunkWidth = Math.max(2, 4 * scale);
  tree += `<line x1="${startX}" y1="${startY}" x2="${startX}" y2="${startY - branchLength * 0.5}" stroke="${color}" stroke-width="${trunkWidth}"/>`;

  // Branches
  tree += svgBranch(startX, startY - branchLength * 0.5, -Math.PI / 2 - branchAngle, branchLength * 0.7, 1, maxDepth, color, scale, branchAngle, density);
  tree += svgBranch(startX, startY - branchLength * 0.5, -Math.PI / 2 + branchAngle, branchLength * 0.7, 1, maxDepth, color, scale, branchAngle, density);
  tree += svgBranch(startX, startY - branchLength * 0.5, -Math.PI / 2, branchLength * 0.8, 1, maxDepth, color, scale, branchAngle, density);

  return tree;
}

function svgBranch(x: number, y: number, angle: number, length: number, depth: number, maxDepth: number, color: string, scale: number, branchAngle: number, density: number): string {
  if (depth > maxDepth || length < 3) return '';

  const endX = x + Math.cos(angle) * length;
  const endY = y + Math.sin(angle) * length;
  const strokeWidth = Math.max(0.5, (maxDepth - depth + 1) * 0.8 * scale);

  let branch = `<line x1="${x}" y1="${y}" x2="${endX}" y2="${endY}" stroke="${color}" stroke-width="${strokeWidth}"/>`;

  branch += svgBranch(endX, endY, angle - branchAngle, length * 0.72, depth + 1, maxDepth, color, scale, branchAngle, density);
  branch += svgBranch(endX, endY, angle + branchAngle, length * 0.72, depth + 1, maxDepth, color, scale, branchAngle, density);

  if (density > 50 && depth < maxDepth - 1) {
    branch += svgBranch(endX, endY, angle, length * 0.5, depth + 2, maxDepth, color, scale, branchAngle, density);
  }

  return branch;
}

function drawFractalTree(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  density: number,
  scale: number,
  strokeWidth: number = 2
) {
  const maxDepth = Math.max(3, Math.floor(4 + (density / 100) * 7));
  const branchLength = (60 + (density / 100) * 40) * scale;
  const branchAngle = Math.PI / 6 + (density / 100) * (Math.PI / 6);

  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  function drawBranch(x: number, y: number, angle: number, length: number, depth: number) {
    if (depth > maxDepth || length < 3) return;

    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;

    ctx.lineWidth = Math.max(0.5, (maxDepth - depth + 1) * 0.8 * scale);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Branch out
    drawBranch(endX, endY, angle - branchAngle, length * 0.72, depth + 1);
    drawBranch(endX, endY, angle + branchAngle, length * 0.72, depth + 1);

    // Extra branch at higher density
    if (density > 50 && depth < maxDepth - 1) {
      drawBranch(endX, endY, angle, length * 0.5, depth + 2);
    }
  }

  // Draw tree from bottom center
  const startX = w / 2;
  const startY = h * 0.85;

  // Trunk
  ctx.lineWidth = Math.max(2, 4 * scale);
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(startX, startY - branchLength * 0.5);
  ctx.stroke();

  // Branches
  drawBranch(startX, startY - branchLength * 0.5, -Math.PI / 2 - branchAngle, branchLength * 0.7, 1);
  drawBranch(startX, startY - branchLength * 0.5, -Math.PI / 2 + branchAngle, branchLength * 0.7, 1);
  drawBranch(startX, startY - branchLength * 0.5, -Math.PI / 2, branchLength * 0.8, 1);
}

// ─── BOOK OF SHAPES PATTERNS ──────────────────────────────

function drawFlowLines(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  density: number,
  scale: number,
  seed: number,
  strokeWidth: number = 2
) {
  const rand = seededRandom(seed);
  const numLines = Math.max(10, Math.floor(20 + (density / 100) * 60));
  const amplitude = (20 + (density / 100) * 40) * scale;
  const frequency = 0.01 + (density / 100) * 0.02;
  
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  for (let i = 0; i < numLines; i++) {
    const startY = (h / numLines) * i;
    const phase = rand() * Math.PI * 2;
    
    ctx.beginPath();
    ctx.moveTo(0, startY);
    
    for (let x = 0; x <= w; x += 2) {
      const noise = Math.sin(x * frequency + phase) * amplitude;
      const noise2 = Math.cos(x * frequency * 1.5 + phase * 2) * amplitude * 0.5;
      const y = startY + noise + noise2;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function drawWaveField(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  density: number,
  scale: number,
  seed: number,
  randomFillPerElement: boolean = false,
  strokeWidth: number = 2,
  quantity: number = 100
) {
  const rand = seededRandom(seed);
  const gridSize = Math.max(20, 60 - (density / 100) * 40);
  const cols = Math.ceil(w / gridSize) + 1;
  const rows = Math.ceil(h / gridSize) + 1;
  
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Skip elements based on quantity
      if (Math.random() * 100 > quantity) continue;

      const x = col * gridSize;
      const y = row * gridSize;
      const angle = rand() * Math.PI * 2;
      const length = gridSize * 0.4 * scale;
      
      if (randomFillPerElement) {
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        ctx.strokeStyle = randomColor;
      } else {
        ctx.strokeStyle = color;
      }
      
      ctx.beginPath();
      ctx.moveTo(x - Math.cos(angle) * length, y - Math.sin(angle) * length);
      ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
      ctx.stroke();
    }
  }
}

function drawJoyDivision(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  density: number,
  scale: number,
  seed: number,
  strokeWidth: number = 2
) {
  const rand = seededRandom(seed);
  const numLines = Math.max(20, Math.floor(30 + (density / 100) * 70));
  const spacing = w / numLines;
  const amplitude = h * 0.3 * scale;
  
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  for (let i = 0; i < numLines; i++) {
    const x = i * spacing;
    const peakHeight = amplitude * (0.5 + rand() * 0.5);
    const peakX = x + (rand() - 0.5) * spacing * 0.5;
    
    ctx.beginPath();
    ctx.moveTo(x, h);
    ctx.lineTo(x, h - peakHeight * 0.2);
    
    // Create peak
    const cp1x = x + spacing * 0.1;
    const cp1y = h - peakHeight * 0.8;
    const cp2x = peakX;
    const cp2y = h - peakHeight;
    
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, peakX, h - peakHeight);
    
    const cp3x = peakX;
    const cp3y = h - peakHeight;
    const cp4x = x + spacing * 0.9;
    const cp4y = h - peakHeight * 0.8;
    
    ctx.bezierCurveTo(cp3x, cp3y, cp4x, cp4y, x + spacing, h - peakHeight * 0.2);
    ctx.lineTo(x + spacing, h);
    ctx.stroke();
  }
}

function drawQuarterArcTruchet(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  density: number,
  scale: number,
  seed: number,
  strokeWidth: number = 2
) {
  const rand = seededRandom(seed);
  const tileSize = Math.max(30, 80 - (density / 100) * 50) * scale;
  const cols = Math.ceil(w / tileSize) + 1;
  const rows = Math.ceil(h / tileSize) + 1;
  
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * tileSize;
      const y = row * tileSize;
      const rotation = rand() > 0.5 ? 0 : Math.PI / 2;
      
      ctx.save();
      ctx.translate(x + tileSize / 2, y + tileSize / 2);
      ctx.rotate(rotation);
      ctx.translate(-tileSize / 2, -tileSize / 2);
      
      // Draw quarter arc
      ctx.beginPath();
      ctx.arc(0, 0, tileSize, 0, Math.PI / 2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(tileSize, tileSize, tileSize, Math.PI, Math.PI * 1.5);
      ctx.stroke();
      
      ctx.restore();
    }
  }
}

function drawNodeGarden(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  density: number,
  scale: number,
  seed: number,
  strokeWidth: number = 2
) {
  const rand = seededRandom(seed);
  const numNodes = Math.max(20, Math.floor(30 + (density / 100) * 70));
  const maxDist = (Math.max(w, h) / Math.sqrt(numNodes)) * 1.5;
  
  // Generate random nodes
  const nodes: { x: number; y: number }[] = [];
  for (let i = 0; i < numNodes; i++) {
    nodes.push({
      x: rand() * w,
      y: rand() * h,
    });
  }
  
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Draw connections
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[j].x - nodes[i].x;
      const dy = nodes[j].y - nodes[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < maxDist) {
        const opacity = 1 - (dist / maxDist);
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
  }
  
  // Draw nodes
  ctx.globalAlpha = 1;
  for (const node of nodes) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 3 * scale, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHalftoneDots(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  density: number,
  scale: number,
  seed: number,
  randomFillPerElement: boolean = false,
  quantity: number = 100
) {
  const rand = seededRandom(seed);
  const gridSize = Math.max(15, 40 - (density / 100) * 25) * scale;
  const cols = Math.ceil(w / gridSize) + 1;
  const rows = Math.ceil(h / gridSize) + 1;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Skip elements based on quantity
      if (Math.random() * 100 > quantity) continue;

      const x = col * gridSize + gridSize / 2;
      const y = row * gridSize + gridSize / 2;
      
      // Calculate distance from center for size variation
      const centerX = w / 2;
      const centerY = h / 2;
      const distFromCenter = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );
      const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
      const normalizedDist = distFromCenter / maxDist;
      
      // Dot size varies based on distance and noise
      const noise = rand() * 0.3;
      const size = gridSize * 0.4 * (1 - normalizedDist + noise) * scale;
      
      if (randomFillPerElement) {
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        ctx.fillStyle = randomColor;
      } else {
        ctx.fillStyle = color;
      }
      
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1, size), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawConcentricNoiseRings(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  density: number,
  scale: number,
  seed: number,
  strokeWidth: number = 2
) {
  const rand = seededRandom(seed);
  const cx = w / 2;
  const cy = h / 2;
  const maxRadius = Math.max(w, h) * 0.8 * scale;
  const numRings = Math.max(5, Math.floor(10 + (density / 100) * 40));
  const spacing = maxRadius / numRings;
  
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  for (let i = 1; i <= numRings; i++) {
    const baseRadius = i * spacing;
    const segments = 60;
    const noiseAmount = spacing * 0.3 * (1 + rand() * 0.5);
    
    ctx.beginPath();
    for (let j = 0; j <= segments; j++) {
      const angle = (j / segments) * Math.PI * 2;
      const noise = (rand() - 0.5) * noiseAmount;
      const radius = baseRadius + noise;
      
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      
      if (j === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.stroke();
  }
}

function drawChevronPattern(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  density: number,
  scale: number,
  strokeWidth: number = 2
) {
  const chevronSize = Math.max(20, 60 - (density / 100) * 40) * scale;
  const chevronHeight = chevronSize * 0.6;
  const cols = Math.ceil(w / chevronSize) + 2;
  const rows = Math.ceil(h / chevronHeight) + 2;
  
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  for (let row = 0; row < rows; row++) {
    const offset = row % 2 === 0 ? 0 : chevronSize / 2;
    const y = row * chevronHeight;
    
    for (let col = -1; col < cols; col++) {
      const x = col * chevronSize + offset;
      
      ctx.beginPath();
      ctx.moveTo(x, y + chevronHeight);
      ctx.lineTo(x + chevronSize / 2, y);
      ctx.lineTo(x + chevronSize, y + chevronHeight);
      ctx.stroke();
    }
  }
}

// ─── SVG FUNCTIONS FOR BOOK OF SHAPES PATTERNS ────────────

function svgFlowLines(w: number, h: number, color: string, density: number, scale: number, seed: number): string {
  const rand = seededRandom(seed);
  const numLines = Math.max(10, Math.floor(20 + (density / 100) * 60));
  const amplitude = (20 + (density / 100) * 40) * scale;
  const frequency = 0.01 + (density / 100) * 0.02;
  const strokeWidth = Math.max(0.5, 1.5 * scale);
  
  let paths = '';
  for (let i = 0; i < numLines; i++) {
    const startY = (h / numLines) * i;
    const phase = rand() * Math.PI * 2;
    
    let path = `M 0 ${startY}`;
    for (let x = 0; x <= w; x += 2) {
      const noise = Math.sin(x * frequency + phase) * amplitude;
      const noise2 = Math.cos(x * frequency * 1.5 + phase * 2) * amplitude * 0.5;
      const y = startY + noise + noise2;
      path += ` L ${x} ${y}`;
    }
    paths += `<path d="${path}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>`;
  }
  return paths;
}

function svgWaveField(w: number, h: number, color: string, density: number, scale: number, seed: number): string {
  const rand = seededRandom(seed);
  const gridSize = Math.max(20, 60 - (density / 100) * 40);
  const cols = Math.ceil(w / gridSize) + 1;
  const rows = Math.ceil(h / gridSize) + 1;
  const strokeWidth = Math.max(0.5, 1.5 * scale);
  
  let lines = '';
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * gridSize;
      const y = row * gridSize;
      const angle = rand() * Math.PI * 2;
      const length = gridSize * 0.4 * scale;
      
      const x1 = x - Math.cos(angle) * length;
      const y1 = y - Math.sin(angle) * length;
      const x2 = x + Math.cos(angle) * length;
      const y2 = y + Math.sin(angle) * length;
      
      lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${strokeWidth}"/>`;
    }
  }
  return lines;
}

function svgJoyDivision(w: number, h: number, color: string, density: number, scale: number, seed: number): string {
  const rand = seededRandom(seed);
  const numLines = Math.max(20, Math.floor(30 + (density / 100) * 70));
  const spacing = w / numLines;
  const amplitude = h * 0.3 * scale;
  const strokeWidth = Math.max(1, 2 * scale);
  
  let paths = '';
  for (let i = 0; i < numLines; i++) {
    const x = i * spacing;
    const peakHeight = amplitude * (0.5 + rand() * 0.5);
    const peakX = x + (rand() - 0.5) * spacing * 0.5;
    
    const cp1x = x + spacing * 0.1;
    const cp1y = h - peakHeight * 0.8;
    const cp2x = peakX;
    const cp2y = h - peakHeight;
    
    const cp3x = peakX;
    const cp3y = h - peakHeight;
    const cp4x = x + spacing * 0.9;
    const cp4y = h - peakHeight * 0.8;
    
    const path = `M ${x} ${h} L ${x} ${h - peakHeight * 0.2} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${peakX} ${h - peakHeight} C ${cp3x} ${cp3y} ${cp4x} ${cp4y} ${x + spacing} ${h - peakHeight * 0.2} L ${x + spacing} ${h}`;
    paths += `<path d="${path}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>`;
  }
  return paths;
}

function svgQuarterArcTruchet(w: number, h: number, color: string, density: number, scale: number, seed: number): string {
  const rand = seededRandom(seed);
  const tileSize = Math.max(30, 80 - (density / 100) * 50) * scale;
  const cols = Math.ceil(w / tileSize) + 1;
  const rows = Math.ceil(h / tileSize) + 1;
  const strokeWidth = Math.max(1, 2 * scale);
  
  let arcs = '';
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * tileSize;
      const y = row * tileSize;
      const rotation = rand() > 0.5 ? 0 : 90;
      
      arcs += `<g transform="translate(${x + tileSize / 2}, ${y + tileSize / 2}) rotate(${rotation}) translate(${-tileSize / 2}, ${-tileSize / 2})">`;
      arcs += `<path d="M 0 0 A ${tileSize} ${tileSize} 0 0 1 ${tileSize} 0" fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>`;
      arcs += `<path d="M ${tileSize} ${tileSize} A ${tileSize} ${tileSize} 0 0 1 0 ${tileSize}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>`;
      arcs += `</g>`;
    }
  }
  return arcs;
}

function svgNodeGarden(w: number, h: number, color: string, density: number, scale: number, seed: number): string {
  const rand = seededRandom(seed);
  const numNodes = Math.max(20, Math.floor(30 + (density / 100) * 70));
  const maxDist = (Math.max(w, h) / Math.sqrt(numNodes)) * 1.5;
  const strokeWidth = Math.max(0.5, 1 * scale);
  
  const nodes: { x: number; y: number }[] = [];
  for (let i = 0; i < numNodes; i++) {
    nodes.push({
      x: rand() * w,
      y: rand() * h,
    });
  }
  
  let connections = '';
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[j].x - nodes[i].x;
      const dy = nodes[j].y - nodes[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < maxDist) {
        const opacity = 1 - (dist / maxDist);
        connections += `<line x1="${nodes[i].x}" y1="${nodes[i].y}" x2="${nodes[j].x}" y2="${nodes[j].y}" stroke="${color}" stroke-width="${strokeWidth}" opacity="${opacity}"/>`;
      }
    }
  }
  
  let circles = '';
  for (const node of nodes) {
    circles += `<circle cx="${node.x}" cy="${node.y}" r="${3 * scale}" fill="${color}"/>`;
  }
  
  return connections + circles;
}

function svgHalftoneDots(w: number, h: number, color: string, density: number, scale: number, seed: number): string {
  const rand = seededRandom(seed);
  const gridSize = Math.max(15, 40 - (density / 100) * 25) * scale;
  const cols = Math.ceil(w / gridSize) + 1;
  const rows = Math.ceil(h / gridSize) + 1;
  
  let dots = '';
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * gridSize + gridSize / 2;
      const y = row * gridSize + gridSize / 2;
      
      const centerX = w / 2;
      const centerY = h / 2;
      const distFromCenter = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );
      const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
      const normalizedDist = distFromCenter / maxDist;
      
      const noise = rand() * 0.3;
      const size = gridSize * 0.4 * (1 - normalizedDist + noise) * scale;
      
      dots += `<circle cx="${x}" cy="${y}" r="${Math.max(1, size)}" fill="${color}"/>`;
    }
  }
  return dots;
}

function svgConcentricNoiseRings(w: number, h: number, color: string, density: number, scale: number, seed: number): string {
  const rand = seededRandom(seed);
  const cx = w / 2;
  const cy = h / 2;
  const maxRadius = Math.max(w, h) * 0.8 * scale;
  const numRings = Math.max(5, Math.floor(10 + (density / 100) * 40));
  const spacing = maxRadius / numRings;
  const strokeWidth = Math.max(0.5, 1.5 * scale);
  
  let rings = '';
  for (let i = 1; i <= numRings; i++) {
    const baseRadius = i * spacing;
    const segments = 60;
    const noiseAmount = spacing * 0.3 * (1 + rand() * 0.5);
    
    let path = '';
    for (let j = 0; j <= segments; j++) {
      const angle = (j / segments) * Math.PI * 2;
      const noise = (rand() - 0.5) * noiseAmount;
      const radius = baseRadius + noise;
      
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      
      if (j === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    }
    path += ' Z';
    rings += `<path d="${path}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>`;
  }
  return rings;
}

function svgChevronPattern(w: number, h: number, color: string, density: number, scale: number): string {
  const chevronSize = Math.max(20, 60 - (density / 100) * 40) * scale;
  const chevronHeight = chevronSize * 0.6;
  const cols = Math.ceil(w / chevronSize) + 2;
  const rows = Math.ceil(h / chevronHeight) + 2;
  const strokeWidth = Math.max(1, 2 * scale);
  
  let chevrons = '';
  for (let row = 0; row < rows; row++) {
    const offset = row % 2 === 0 ? 0 : chevronSize / 2;
    const y = row * chevronHeight;
    
    for (let col = -1; col < cols; col++) {
      const x = col * chevronSize + offset;
      chevrons += `<path d="M ${x} ${y + chevronHeight} L ${x + chevronSize / 2} ${y} L ${x + chevronSize} ${y + chevronHeight}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>`;
    }
  }
  return chevrons;
}

// ─── TRIANGULAR MOSAIC (Book of Shapes) ───────────────────

function drawTriangularMosaic(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  density: number,
  scale: number,
  seed: number,
  randomFillPerElement: boolean = false,
  quantity: number = 100
) {
  const rand = seededRandom(seed);
  // Cell size based on density (more density = smaller cells)
  const cellSize = Math.max(20, 80 - (density / 100) * 60) * scale;
  const cols = Math.ceil(w / cellSize) + 2;
  const rows = Math.ceil(h / cellSize) + 2;
  
  // Chaos factor: higher density = more chaos
  const chaos = density / 100;
  
  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      // Skip elements based on quantity
      if (Math.random() * 100 > quantity) continue;

      const x = col * cellSize;
      const y = row * cellSize;
      
      // Each cell has 4 possible triangle orientations
      // 0: top-left triangle filled
      // 1: top-right triangle filled
      // 2: bottom-right triangle filled
      // 3: bottom-left triangle filled
      
      // Use chaos to determine orientation
      // Low chaos = more ordered pattern (pinwheel-like)
      // High chaos = more random
      const orderedOrientation = (row + col) % 4;
      const randomOrientation = Math.floor(rand() * 4);
      
      // Mix ordered and random based on chaos
      const orientation = rand() < chaos ? randomOrientation : orderedOrientation;
      
      if (randomFillPerElement) {
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        ctx.fillStyle = randomColor;
      } else {
        ctx.fillStyle = color;
      }
      
      ctx.beginPath();
      
      switch (orientation) {
        case 0: // Top-left triangle
          ctx.moveTo(x, y);
          ctx.lineTo(x + cellSize, y);
          ctx.lineTo(x, y + cellSize);
          break;
        case 1: // Top-right triangle
          ctx.moveTo(x, y);
          ctx.lineTo(x + cellSize, y);
          ctx.lineTo(x + cellSize, y + cellSize);
          break;
        case 2: // Bottom-right triangle
          ctx.moveTo(x + cellSize, y);
          ctx.lineTo(x + cellSize, y + cellSize);
          ctx.lineTo(x, y + cellSize);
          break;
        case 3: // Bottom-left triangle
          ctx.moveTo(x, y);
          ctx.lineTo(x + cellSize, y + cellSize);
          ctx.lineTo(x, y + cellSize);
          break;
      }
      
      ctx.closePath();
      ctx.fill();
    }
  }
}

function svgTriangularMosaic(
  w: number,
  h: number,
  color: string,
  density: number,
  scale: number,
  seed: number
): string {
  const rand = seededRandom(seed);
  const cellSize = Math.max(20, 80 - (density / 100) * 60) * scale;
  const cols = Math.ceil(w / cellSize) + 2;
  const rows = Math.ceil(h / cellSize) + 2;
  
  const chaos = density / 100;
  
  let triangles = '';
  
  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const x = col * cellSize;
      const y = row * cellSize;
      
      const orderedOrientation = (row + col) % 4;
      const randomOrientation = Math.floor(rand() * 4);
      const orientation = rand() < chaos ? randomOrientation : orderedOrientation;
      
      let path = '';
      
      switch (orientation) {
        case 0: // Top-left triangle
          path = `M ${x} ${y} L ${x + cellSize} ${y} L ${x} ${y + cellSize} Z`;
          break;
        case 1: // Top-right triangle
          path = `M ${x} ${y} L ${x + cellSize} ${y} L ${x + cellSize} ${y + cellSize} Z`;
          break;
        case 2: // Bottom-right triangle
          path = `M ${x + cellSize} ${y} L ${x + cellSize} ${y + cellSize} L ${x} ${y + cellSize} Z`;
          break;
        case 3: // Bottom-left triangle
          path = `M ${x} ${y} L ${x + cellSize} ${y + cellSize} L ${x} ${y + cellSize} Z`;
          break;
      }
      
      triangles += `<path d="${path}" fill="${color}"/>`;
    }
  }
  
  return triangles;
}
