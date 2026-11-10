import { useEffect, useRef } from 'react';
import { generatePattern, PatternConfig } from '../lib/patterns';
import { CanvasRatio, RATIOS, ratioDims } from '../lib/export';

// Tamaño de un ratio dentro del escenario cuadrado, en %
function frame(ratio: CanvasRatio) {
  const [a, b] = RATIOS[ratio];
  return a >= b ? { w: 100, h: (b / a) * 100 } : { w: (a / b) * 100, h: 100 };
}

interface Props {
  config: PatternConfig;
  seed: number;
  ratio: CanvasRatio;
}

export default function EditorCanvas({ config, seed, ratio }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { width, height } = ratioDims(ratio, 800);
  const transparent = config.backgroundColor === 'transparent';

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    // Pequeña espera para no redibujar en cada paso al mover un slider
    const t = setTimeout(() => generatePattern(ctx, width, height, config, seed), 25);
    return () => clearTimeout(t);
  }, [config, seed, width, height]);

  const active = frame(ratio);

  return (
    <div className="relative w-full max-w-[640px] mx-auto aspect-square">
      {/* Lienzo real, con el tamaño del ratio elegido */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
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

      {/* Guías de referencia de cada ratio */}
      {GUIDES.map(({ ratio: r, color }) => {
        const f = frame(r);
        const on = r === ratio;
        return (
          <div
            key={r}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              width: `${f.w}%`,
              height: `${f.h}%`,
              border: `${on ? 2 : 1}px solid ${color}`,
              opacity: on ? 1 : 0.55,
            }}
          >
            <span className="absolute left-1.5 top-1 text-sm leading-none" style={{ color }}>{r}</span>
          </div>
        );
      })}
    </div>
  );
}
