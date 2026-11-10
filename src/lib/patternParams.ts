import { PatternId, DISTORTABLE_PATTERNS } from './patterns';

export type ParamKey = 'scale' | 'rotation' | 'quantity' | 'strokeWidth' | 'distortion';

// Parámetros extra por patrón (Escala está en todos)
const EXTRA: Record<PatternId, ParamKey[]> = {
  concentricCircles: ['rotation', 'strokeWidth'],
  diagonalLines: ['rotation', 'strokeWidth'],
  dotGrid: ['quantity'],
  wavyLines: ['rotation', 'strokeWidth'],
  triangleGrid: ['strokeWidth'],
  squareSpiral: ['rotation', 'strokeWidth'],
  scandinavianCross: ['strokeWidth', 'quantity'],
  verticalStripes: ['quantity'],
  voronoi: ['strokeWidth'],
  artDeco: ['strokeWidth'],
  tessellation: ['strokeWidth'],
  fractalTree: ['strokeWidth'],
  flowLines: ['strokeWidth'],
  waveField: ['strokeWidth', 'quantity'],
  joyDivision: ['strokeWidth'],
  quarterArcTruchet: ['strokeWidth'],
  nodeGarden: ['strokeWidth'],
  halftoneDots: ['quantity'],
  concentricNoiseRings: ['strokeWidth'],
  chevronPattern: ['rotation', 'strokeWidth'],
  triangularMosaic: ['quantity'],
};

const ORDER: ParamKey[] = ['scale', 'rotation', 'quantity', 'strokeWidth', 'distortion'];

export function getPatternParams(type: PatternId): ParamKey[] {
  const set = new Set<ParamKey>(['scale', ...(EXTRA[type] ?? [])]);
  if (DISTORTABLE_PATTERNS.includes(type)) set.add('distortion');
  return ORDER.filter(k => set.has(k));
}

// Grosor: el slider va de 0 a 100 % y se traduce a 0.5–20 px
export const strokeToPercent = (px: number) => Math.round(((px - 0.5) / 19.5) * 100);
export const percentToStroke = (pct: number) => Math.round((0.5 + (pct / 100) * 19.5) * 10) / 10;
