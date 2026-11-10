// Exportación del editor: PNG/SVG, ratios, resoluciones y código CSS
import { PatternConfig, generatePattern, generateSVG } from './patterns';
import { UserTier } from './userTier';

export type ExportFormat = 'png' | 'svg';
export type ExportResolution = '1x' | '2x' | '3x' | '4k';

export const RATIOS: Record<CanvasRatio, [number, number]> = {
  '1:1': [1, 1],
  '16:9': [16, 9],
  '4:3': [4, 3],
  '9:16': [9, 16],
  '3:4': [3, 4],
};

/** Medidas de un ratio según su lado más largo. 16:9 y 4:3 son horizontales; 9:16 y 3:4 son verticales. */
export function ratioDims(ratio: CanvasRatio, longSide: number) {
  const [a, b] = RATIOS[ratio];
  return a >= b
    ? { width: longSide, height: Math.round((longSide * b) / a) }
    : { width: Math.round((longSide * a) / b), height: longSide };
}

const LONG_SIDE: Record<ExportResolution, number> = { '1x': 1000, '2x': 2000, '3x': 3000, '4k': 4096 };
export const RESOLUTIONS: ExportResolution[] = ['1x', '2x', '3x', '4k'];
export const RESOLUTION_LABELS: Record<ExportResolution, string> = { '1x': '1x', '2x': '2x', '3x': '3x', '4k': '4K' };

export function getResolutionSize(resolution: ExportResolution): number {
  return LONG_SIDE[resolution];
}

/** Todas las resoluciones están disponibles salvo 4K, que es solo para Pro. */
export function isResolutionAvailable(tier: UserTier, resolution: ExportResolution): boolean {
  return resolution !== '4k' || tier === 'pro';
}

export interface ExportParams {
  config: PatternConfig;
  format: ExportFormat;
  resolution: ExportResolution;
  ratio: CanvasRatio;
  seed: number;
  tier: UserTier;
}

export interface ExportResult {
  success: boolean;
  error?: string;
  dataUrl?: string;
  filename?: string;
}

export async function exportPattern(params: ExportParams): Promise<ExportResult> {
  const { config, format, resolution, ratio, seed, tier } = params;
  if (!isResolutionAvailable(tier, resolution)) {
    return { success: false, error: 'Esta resolución es solo para el plan Pro' };
  }
  const { width, height } = ratioDims(ratio, getResolutionSize(resolution));
  const name = `geopattern-${config.type}-${ratio.replace(':', 'x')}-${resolution}-${seed}`;

  try {
    if (format === 'svg') {
      const svg = generateSVG(width, height, config, seed);
      const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
      return { success: true, dataUrl: url, filename: `${name}.svg` };
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { success: false, error: 'No se pudo crear el lienzo' };
    generatePattern(ctx, width, height, config, seed);
    return { success: true, dataUrl: canvas.toDataURL('image/png'), filename: `${name}.png` };
  } catch {
    return { success: false, error: 'Error al generar el patrón' };
  }
}

export function triggerDownload(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (dataUrl.startsWith('blob:')) setTimeout(() => URL.revokeObjectURL(dataUrl), 1000);
}

/** Convierte un SVG en una regla CSS `background-image` lista para pegar. */
export function svgToCss(svg: string): string {
  const compact = svg
    .replace(/<\?xml[^>]*\?>\s*/, '')
    .replace(/\s+/g, ' ')
    .replace(/> </g, '><')
    .replace(/"/g, "'");
  const encoded = compact
    .replace(/%/g, '%25')
    .replace(/#/g, '%23')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
    .replace(/\{/g, '%7B')
    .replace(/\}/g, '%7D');
  return `background-image: url("data:image/svg+xml,${encoded}");\nbackground-size: cover;\nbackground-repeat: no-repeat;`;
}

/** Copia texto al portapapeles (con alternativa para navegadores antiguos). */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // seguimos con la alternativa
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
