import { PatternId } from './patterns';

export type CategoryId = 'circulos' | 'lineas' | 'ondas' | 'puntos' | 'cuadriculas' | 'organicos';

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'circulos', label: 'Círculos y radiales' },
  { id: 'lineas', label: 'Líneas y rayas' },
  { id: 'ondas', label: 'Ondas y flujo' },
  { id: 'puntos', label: 'Puntos y semitono' },
  { id: 'cuadriculas', label: 'Cuadrículas y mosaicos' },
  { id: 'organicos', label: 'Orgánicos y fractales' },
];

export const PATTERN_CATEGORY: Record<PatternId, CategoryId> = {
  concentricCircles: 'circulos', concentricNoiseRings: 'circulos', quarterArcTruchet: 'circulos',
  diagonalLines: 'lineas', verticalStripes: 'lineas', chevronPattern: 'lineas', artDeco: 'lineas',
  wavyLines: 'ondas', flowLines: 'ondas', waveField: 'ondas', joyDivision: 'ondas',
  dotGrid: 'puntos', halftoneDots: 'puntos', nodeGarden: 'puntos',
  triangleGrid: 'cuadriculas', squareSpiral: 'cuadriculas', scandinavianCross: 'cuadriculas',
  triangularMosaic: 'cuadriculas', tessellation: 'cuadriculas',
  voronoi: 'organicos', fractalTree: 'organicos',
};
