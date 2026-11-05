// Export logic — simulates /app/api/export/route.ts
// Handles pattern generation, format conversion, resolution scaling, and download limits.
import { PatternConfig, generatePattern, generateSVG } from './patterns';
import { UserTier } from './userTier';
import { addDownloadRecord, canDownload } from './limits';

export type ExportFormat = 'png' | 'svg';
export type ExportResolution = '1x' | '2x' | '3x';

export interface ExportParams {
  patternType: string;
  config: PatternConfig;
  format: ExportFormat;
  resolution: ExportResolution;
  transparentBackground: boolean;
  userId?: string;
  seed: number;
}

export interface ExportResult {
  success: boolean;
  error?: string;
  errorCode?: 'LIMIT_REACHED' | 'UNAUTHORIZED' | 'GENERATION_FAILED';
  dataUrl?: string;
  filename?: string;
  mimeType?: string;
}

// Base resolution is 1000x1000
const BASE_RESOLUTION = 1000;

const RESOLUTION_MULTIPLIERS: Record<ExportResolution, number> = {
  '1x': 1,
  '2x': 2,
  '3x': 3,
};

// Which resolutions are available per tier
const AVAILABLE_RESOLUTIONS: Record<UserTier, ExportResolution[]> = {
  guest: ['1x'],
  free: ['1x'],
  premium: ['1x', '2x', '3x'],
};

export function getAvailableResolutions(tier: UserTier): ExportResolution[] {
  return AVAILABLE_RESOLUTIONS[tier];
}

export function getResolutionSize(resolution: ExportResolution): number {
  return BASE_RESOLUTION * RESOLUTION_MULTIPLIERS[resolution];
}

export function isResolutionAvailable(tier: UserTier, resolution: ExportResolution): boolean {
  return AVAILABLE_RESOLUTIONS[tier].includes(resolution);
}

/**
 * Main export function — simulates the API route logic.
 * 1. Validates limits if userId exists
 * 2. Generates pattern at requested resolution
 * 3. Returns file as data URL with correct metadata
 */
export async function exportPattern(params: ExportParams): Promise<ExportResult> {
  const { config, format, resolution, transparentBackground, userId, seed } = params;

  // Step 1: Check download limits if userId exists
  if (userId) {
    // We need to get the user's tier from localStorage
    const stored = localStorage.getItem('geopattern_user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        const { allowed } = canDownload(userId, user.tier);
        if (!allowed) {
          return {
            success: false,
            error: 'Has alcanzado el límite de descargas de esta semana',
            errorCode: 'LIMIT_REACHED',
          };
        }
      } catch {
        // Ignore parse errors
      }
    }
  }

  // Step 2: Validate resolution
  const stored = localStorage.getItem('geopattern_user');
  let userTier: UserTier = 'guest';
  if (stored) {
    try {
      const user = JSON.parse(stored);
      userTier = user.tier || 'guest';
    } catch {
      // ignore
    }
  }

  if (!isResolutionAvailable(userTier, resolution)) {
    return {
      success: false,
      error: 'Esta resolución no está disponible para tu plan',
      errorCode: 'UNAUTHORIZED',
    };
  }

  // Step 3: Generate the pattern
  const size = getResolutionSize(resolution);

  try {
    if (format === 'svg') {
      // Generate SVG programmatically (not rasterized from canvas)
      const svgString = generateSVG(size, size, config, seed, transparentBackground);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
      const dataUrl = URL.createObjectURL(svgBlob);

      const filename = `geopattern-${config.type}-${resolution}-${seed}.svg`;

      // Record download for free users
      if (userId && userTier === 'free') {
        addDownloadRecord(config.type, `svg-${resolution}`);
      }

      return {
        success: true,
        dataUrl,
        filename,
        mimeType: 'image/svg+xml',
      };
    } else {
      // Generate PNG via Canvas
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return {
          success: false,
          error: 'No se pudo crear el contexto del canvas',
          errorCode: 'GENERATION_FAILED',
        };
      }

      // If transparent background, override the config's background
      const exportConfig = transparentBackground
        ? { ...config, backgroundColor: 'transparent' }
        : config;

      // Handle transparent background manually
      if (transparentBackground) {
        ctx.clearRect(0, 0, size, size);
      }

      generatePattern(ctx, size, size, exportConfig, seed);

      // For transparent bg, we need to clear the background that generatePattern fills
      if (transparentBackground) {
        // Re-generate with transparent handling
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = size;
        tempCanvas.height = size;
        const tempCtx = tempCanvas.getContext('2d')!;

        // Draw pattern without background
        tempCtx.clearRect(0, 0, size, size);

        // We need to temporarily modify the pattern to skip background
        // Since generatePattern fills background, we'll use a workaround:
        // Generate normally, then make the background transparent
        generatePattern(tempCtx, size, size, config, seed);

        // Get image data and make background color transparent
        const imageData = tempCtx.getImageData(0, 0, size, size);
        const bgColor = hexToRgb(config.backgroundColor);

        if (bgColor) {
          const tolerance = 10;
          for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];

            if (
              Math.abs(r - bgColor.r) <= tolerance &&
              Math.abs(g - bgColor.g) <= tolerance &&
              Math.abs(b - bgColor.b) <= tolerance
            ) {
              imageData.data[i + 3] = 0; // Make transparent
            }
          }
          tempCtx.putImageData(imageData, 0, 0);
        }

        const dataUrl = tempCanvas.toDataURL('image/png');
        const filename = `geopattern-${config.type}-${resolution}-${seed}.png`;

        if (userId && userTier === 'free') {
          addDownloadRecord(config.type, `png-${resolution}`);
        }

        return {
          success: true,
          dataUrl,
          filename,
          mimeType: 'image/png',
        };
      }

      const dataUrl = canvas.toDataURL('image/png');
      const filename = `geopattern-${config.type}-${resolution}-${seed}.png`;

      // Record download for free users
      if (userId && userTier === 'free') {
        addDownloadRecord(config.type, `png-${resolution}`);
      }

      return {
        success: true,
        dataUrl,
        filename,
        mimeType: 'image/png',
      };
    }
  } catch (err) {
    return {
      success: false,
      error: 'Error al generar el patrón',
      errorCode: 'GENERATION_FAILED',
    };
  }
}

/**
 * Triggers a file download in the browser.
 */
export function triggerDownload(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up blob URLs
  if (dataUrl.startsWith('blob:')) {
    setTimeout(() => URL.revokeObjectURL(dataUrl), 1000);
  }
}

// Helper: convert hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!hex || hex === 'transparent' || hex === 'none') return null;

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}
