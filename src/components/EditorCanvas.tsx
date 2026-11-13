import { useEffect, useRef } from 'react';
import { generatePattern, PatternConfig } from '../lib/patterns';
import { CanvasRatio, RATIOS, ratioDims } from '../lib/export';
import { PBRViewMode, generateHeightMap, generateNormalMap, generateAlphaMap } from '../lib/pbrMaps';

// Tamaño de un ratio dentro del escenario cuadrado, en %
function frame(ratio: CanvasRatio) {
  const [a, b] = RATIOS[ratio];
  return a >= b ? { w: 100, h: (b / a) * 100 } : { w: (a / b) * 100, h: 100 };
}

interface Props {
  config: PatternConfig;
  seed: number;
  ratio: CanvasRatio;
  viewMode?: PBRViewMode;
}

export default function EditorCanvas({ config, seed, ratio, viewMode = 'color' }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { width, height } = ratioDims(ratio, 800);
  const transparent = config.backgroundColor === 'transparent';

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;

    const t = setTimeout(() => {
      // 1. Dibujar patrón base
      generatePattern(ctx, width, height, config, seed);

      // 2. Aplicar transformaciones PBR si viewMode no es color
      if (viewMode !== 'color') {
        const imageData = ctx.getImageData(0, 0, width, height);
        let processedData: ImageData;

        if (viewMode === 'height') {
          processedData = generateHeightMap(imageData, width, height);
        } else if (viewMode === 'normal') {
          const heightMap = generateHeightMap(imageData, width, height);
          processedData = generateNormalMap(heightMap, width, height, 1, 1);
        } else if (viewMode === 'alpha') {
          processedData = generateAlphaMap(imageData, width, height, 128);
        } else {
          processedData = imageData;
        }

        ctx.putImageData(processedData, 0, 0);
      }
    }, 25);

    return () => clearTimeout(t);
  }, [config, seed, width, height, viewMode]);

  const active = frame(ratio);

  return (
    <div className="relative w-full max-w-[640px] mx-auto aspect-square">
      {/* Lienzo real, con el tamaño del ratio elegido */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden shadow-lg"
        style={{
          width: `${active.w}%`,
          height: `${active.h}%`,
          backgroundColor: 'var(--color-background-secondary)',
          backgroundImage: transparent
            ? 'conic-gradient(#8884 25%, transparent 0 50%, #8884 0 75%, transparent 0)'
            : undefined,
          backgroundSize: '20px 20px',
        }}
      >
        <canvas ref={ref} width={width} height={height} className="w-full h-full block" />
      </div>

      {/* Silueta del ratio seleccionado en color blanco */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: `${active.w}%`,
          height: `${active.h}%`,
          border: '2px solid #FFFFFF',
        }}
      />
    </div>
  );
}
