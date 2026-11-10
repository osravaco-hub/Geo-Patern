import { PatternConfig } from './patterns';

export type PBRViewMode = 'color' | 'height' | 'normal' | 'alpha';

interface PBRMapConfig {
  bumpStrength: number;
  invertHeight: boolean;
  blurRadius: number;
  alphaThreshold: number;
  outputCanvasSize: number;
}

/**
 * Genera un mapa de altura (grayscale) desde ImageData.
 * @param imageData Pixeles del canvas.
 * @param width Ancho del canvas.
 * @param height Alto del canvas.
 * @param invert Si invertir la lógica (el area oscura = alto).
 * @param blurRadius Radio del desenfoque box.
 */
export function generateHeightMap(
  imageData: ImageData,
  width: number,
  height: number,
  invert = false,
  blurRadius = 0
): ImageData {
  const data = new Uint8ClampedArray(imageData.data);

  // 1. Convertir RGB a escala de grises (luminancia) y aplicar inversión
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    const val = invert ? 255 - luminance : luminance;
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }

  // 2. Aplicar desenfoque box
  if (blurRadius > 0) {
    const radius = blurRadius;
    const radius2 = radius * radius;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        let count = 0;

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = (x + dx + width) % width;
            const ny = (y + dy + height) % height;
            const idx = (ny * width + nx) * 4;
            sum += data[idx];
            count++;
          }
        }

        const avg = sum / count;
        data[y * width * 4 + x * 4] = avg;
        data[y * width * 4 + x * 4 + 1] = avg;
        data[y * width * 4 + x * 4 + 2] = avg;
      }
    }
  }

  return new ImageData(data, width, height);
}

/**
 * Genera un mapa de normales (normal map) desde un mapa de altura.
 * @param heightData Datos del mapa de altura.
 * @param width Ancho del canvas.
 * @param height Alto del canvas.
 * @param strength Intensidad del relieve.
 * @param smooth Desenfoque suavizado (opcional).
 */
export function generateNormalMap(
  heightData: ImageData,
  width: number,
  height: number,
  strength = 1,
  smooth = 1
): ImageData {
  const data = new Uint8ClampedArray(heightData.data);
  const normalData = new Uint8ClampedArray(width * height * 4);

  // Aplicar desenfoque si se solicita
  if (smooth > 1) {
    const radius = smooth;
    const radius2 = radius * radius;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        let count = 0;

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = (x + dx + width) % width;
            const ny = (y + dy + height) % height;
            const idx = (ny * width + nx) * 4;
            sum += data[idx];
            count++;
          }
        }

        const avg = sum / count;
        data[y * width * 4 + x * 4] = avg;
        data[y * width * 4 + x * 4 + 1] = avg;
        data[y * width * 4 + x * 4 + 2] = avg;
      }
    }
  }

  // Sobel con envolvente envolvente (wrap-around) para seamless tileability
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;

      // Gradientes horizontales (Gx)
      const left = ((y * width + ((x - 1 + width) % width)) * 4);
      const right = ((y * width + ((x + 1) % width)) * 4);
      const gx = (data[right] - data[left]) * strength;

      // Gradientes verticales (Gy)
      const up = (((y - 1 + height) % height) * width + x) * 4;
      const down = ((((y + 1) % height) * width) + x) * 4;
      const gy = (data[down] - data[up]) * strength;

      // Calcular normal = (-Gx, -Gy, 1) normalizado
      const len = Math.sqrt(gx * gx + gy * gy + 1);
      const nx = gx / len;
      const ny = gy / len;
      const nz = 1 / len;

      // Mapear a RGB [0..255]
      const r = Math.min(255, Math.max(0, 128 + nx * 128));
      const g = Math.min(255, Math.max(0, 128 + ny * 128));
      const b = Math.min(255, Math.max(0, 128 + nz * 128));

      normalData[idx * 4] = r;
      normalData[idx * 4 + 1] = g;
      normalData[idx * 4 + 2] = b;
      normalData[idx * 4 + 3] = 255;
    }
  }

  return new ImageData(normalData, width, height);
}

/**
 * Genera un mapa alpha desde ImageData.
 * @param imageData Pixeles del canvas.
 * @param width Ancho del canvas.
 * @param height Alto del canvas.
 * @param threshold Umbral de binarización (0-255).
 */
export function generateAlphaMap(
  imageData: ImageData,
  width: number,
  height: number,
  threshold = 128
): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const alphaData = new Uint8ClampedArray(width * height * 4);

  for (let i = 0; i < data.length; i += 4) {
    const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const val = luminance >= threshold ? 255 : 0;
    alphaData[i] = val;
    alphaData[i + 1] = val;
    alphaData[i + 2] = val;
    alphaData[i + 3] = 255;
  }

  return new ImageData(alphaData, width, height);
}

/**
 * Previsualización PBR: Renderiza el patrón en Canvas y genera el mapa de la vista seleccionada.
 */
export async function generatePBRMap(
  canvas: HTMLCanvasElement,
  type: PBRViewMode
): Promise<HTMLCanvasElement> {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('No se pudo obtener el contexto 2D');

  const width = canvas.width;
  const height = canvas.height;

  if (type === 'height') {
    const imageData = ctx.getImageData(0, 0, width, height);
    const heightMap = generateHeightMap(imageData, width, height);
    const newCanvas = document.createElement('canvas');
    newCanvas.width = width;
    newCanvas.height = height;
    newCanvas.getContext('2d')?.putImageData(heightMap, 0, 0);
    return newCanvas;
  } else if (type === 'normal') {
    const imageData = ctx.getImageData(0, 0, width, height);
    const normalMap = generateNormalMap(imageData, width, height, 1, 1);
    const newCanvas = document.createElement('canvas');
    newCanvas.width = width;
    newCanvas.height = height;
    newCanvas.getContext('2d')?.putImageData(normalMap, 0, 0);
    return newCanvas;
  } else if (type === 'alpha') {
    const imageData = ctx.getImageData(0, 0, width, height);
    const alphaMap = generateAlphaMap(imageData, width, height, 128);
    const newCanvas = document.createElement('canvas');
    newCanvas.width = width;
    newCanvas.height = height;
    newCanvas.getContext('2d')?.putImageData(alphaMap, 0, 0);
    return newCanvas;
  }

  return canvas;
}