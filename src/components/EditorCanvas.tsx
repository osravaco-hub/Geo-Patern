import { useEffect, useRef } from 'react';
import { generatePattern, PatternConfig, Pin } from '../lib/patterns';
import { CanvasRatio, RATIOS, ratioDims } from '../lib/export';
import { PBRViewMode, generateHeightMap, generateNormalMap, generateAlphaMap } from '../lib/pbrMaps';

export const MAX_PINS = 12;

// Tamaño de un ratio dentro del escenario cuadrado, en %
function frame(ratio: CanvasRatio) {
  const [a, b] = RATIOS[ratio];
  return a >= b ? { w: 100, h: (b / a) * 100 } : { w: (a / b) * 100, h: 100 };
}
const clamp = (v: number) => Math.min(100, Math.max(0, v));

interface Props {
  config: PatternConfig;
  seed: number;
  ratio: CanvasRatio;
  viewMode?: PBRViewMode;
  pinMode?: boolean;
  selectedPin?: number | null;
  onPinsChange?: (pins: Pin[]) => void;
  onSelectPin?: (i: number | null) => void;
}

export default function EditorCanvas({
  config, seed, ratio, viewMode = 'color', pinMode = false, selectedPin = null, onPinsChange, onSelectPin,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const drag = useRef<number | null>(null);
  const lastTap = useRef<{ i: number; t: number; x: number; y: number } | null>(null);
  const { width, height } = ratioDims(ratio, 800);
  const transparent = config.backgroundColor === 'transparent';
  const pins = config.pins ?? [];
  // Los pines solo se editan en la vista de color; en los mapas su efecto ya está incluido
  const showPins = pinMode && viewMode === 'color';

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;

    const t = setTimeout(() => {
      // 1. Dibujar el patrón base
      generatePattern(ctx, width, height, config, seed);

      // 2. Convertir a mapa PBR si la vista no es color
      if (viewMode !== 'color') {
        const imageData = ctx.getImageData(0, 0, width, height);
        let out: ImageData;
        if (viewMode === 'height') {
          out = generateHeightMap(imageData, width, height);
        } else if (viewMode === 'normal') {
          out = generateNormalMap(generateHeightMap(imageData, width, height), width, height, 1, 1);
        } else {
          out = generateAlphaMap(imageData, width, height, 128);
        }
        ctx.putImageData(out, 0, 0);
      }
    }, 25);

    return () => clearTimeout(t);
  }, [config, seed, width, height, viewMode]);

  const toPct = (e: React.PointerEvent) => {
    const r = overlay.current!.getBoundingClientRect();
    return { x: clamp(((e.clientX - r.left) / r.width) * 100), y: clamp(((e.clientY - r.top) / r.height) * 100) };
  };

  // Toda la interacción pasa por la capa: el dedo mueve el pin mientras sigue presionado
  const startDrag = (e: React.PointerEvent, index: number) => {
    drag.current = index;
    onSelectPin?.(index);
    try { overlay.current?.setPointerCapture(e.pointerId); } catch { /* algunos navegadores no lo permiten */ }
  };

  // Toque en una zona vacía: añade un pin y lo deja arrastrable
  const addPin = (e: React.PointerEvent) => {
    if (!onPinsChange || pins.length >= MAX_PINS) return;
    e.preventDefault();
    const { x, y } = toPct(e);
    onPinsChange([...pins, { x, y, w: 1 }]);
    startDrag(e, pins.length);
  };

  const movePin = (e: React.PointerEvent) => {
    const i = drag.current;
    if (i === null || !onPinsChange || !pins[i]) return;
    const { x, y } = toPct(e);
    onPinsChange(pins.map((q, k) => (k === i ? { ...q, x, y } : q)));
  };
  const endDrag = () => { drag.current = null; };

  const removePin = (i: number) => {
    onPinsChange?.(pins.filter((_, k) => k !== i));
    onSelectPin?.(null);
    drag.current = null;
    lastTap.current = null;
  };

  // Doble clic o doble toque sobre un pin lo borra. Se detecta aquí porque, con el puntero
  // capturado por la capa, el navegador ya no envía el evento dblclick al pin.
  const pressPin = (e: React.PointerEvent, i: number) => {
    const now = Date.now();
    const prev = lastTap.current;
    const pin = pins[i];
    if (prev && prev.i === i && now - prev.t < 400 && pin && prev.x === pin.x && prev.y === pin.y) {
      removePin(i);
      return;
    }
    lastTap.current = pin ? { i, t: now, x: pin.x, y: pin.y } : null;
    startDrag(e, i);
  };

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
          backgroundImage: transparent && viewMode === 'color'
            ? 'conic-gradient(#8884 25%, transparent 0 50%, #8884 0 75%, transparent 0)'
            : undefined,
          backgroundSize: '20px 20px',
        }}
      >
        <canvas ref={ref} width={width} height={height} className="w-full h-full block" />

        {/* Pines de densidad (solo en modo pines) */}
        {showPins && (
          <div
            ref={overlay}
            className="absolute inset-0 cursor-crosshair select-none"
            style={{ touchAction: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none', userSelect: 'none' }}
            onPointerDown={addPin}
            onPointerMove={movePin}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onContextMenu={e => e.preventDefault()}
          >
            {pins.map((p, i) => (
              // Zona táctil de 44 px; el círculo visible mide 24 px
              <div
                key={i}
                role="button"
                tabIndex={0}
                aria-label={`Pin ${i + 1}`}
                className="absolute w-11 h-11 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
                style={{ left: `${p.x}%`, top: `${p.y}%`, touchAction: 'none' }}
                onPointerDown={e => { e.stopPropagation(); e.preventDefault(); pressPin(e, i); }}
                onKeyDown={e => {
                  if (e.key === 'Delete' || e.key === 'Backspace') removePin(i);
                }}
              >
                <span className={`pointer-events-none w-6 h-6 rounded-full border-2 flex items-center justify-center text-[11px] font-semibold ${selectedPin === i ? 'bg-accent border-white text-accent-text' : 'bg-black/40 border-accent text-white'}`}>
                  {i + 1}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Silueta del ratio seleccionado en color blanco */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ width: `${active.w}%`, height: `${active.h}%`, border: '2px solid #FFFFFF' }}
      />
    </div>
  );
}
