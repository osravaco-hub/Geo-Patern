import { useEffect, useRef } from "react";
import { generatePattern, PatternConfig, Pin } from "../lib/patterns";
import { CanvasRatio, RATIOS, ratioDims } from "../lib/export";

export const MAX_PINS = 12;

// Tamaño del ratio dentro del escenario cuadrado, en %
function frame(ratio: CanvasRatio) {
  const [a, b] = RATIOS[ratio];
  return a >= b ? { w: 100, h: (b / a) * 100 } : { w: (a / b) * 100, h: 100 };
}
const clamp = (v: number) => Math.min(100, Math.max(0, v));

// Colores de las guías, como en el mockup
const GUIDES: { ratio: CanvasRatio; color: string }[] = [
  { ratio: "1:1", color: "#FFED00" },
  { ratio: "4:3", color: "#00A0E4" },
  { ratio: "16:9", color: "var(--color-text)" },
  { ratio: "9:16", color: "#E5007D" },
];

interface Props {
  config: PatternConfig;
  seed: number;
  ratio: CanvasRatio;
  pinMode?: boolean;
  selectedPin?: number | null;
  onPinsChange?: (pins: Pin[]) => void;
  onSelectPin?: (i: number | null) => void;
}

export default function EditorCanvas({ config, seed, ratio, pinMode = false, selectedPin = null, onPinsChange, onSelectPin }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const drag = useRef<number | null>(null);
  const { width, height } = ratioDims(ratio, 800);
  const transparent = config.backgroundColor === "transparent";
  const pins = config.pins ?? [];

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    // Pequeña espera para no redibujar en cada paso al mover un slider
    const t = setTimeout(() => generatePattern(ctx, width, height, config, seed), 25);
    return () => clearTimeout(t);
  }, [config, seed, width, height]);

  const toPct = (e: React.PointerEvent) => {
    const r = overlay.current!.getBoundingClientRect();
    return { x: clamp(((e.clientX - r.left) / r.width) * 100), y: clamp(((e.clientY - r.top) / r.height) * 100) };
  };

  // Clic en una zona vacía: añade un pin
  const addPin = (e: React.PointerEvent) => {
    if (!onPinsChange || pins.length >= MAX_PINS) return;
    const { x, y } = toPct(e);
    onPinsChange([...pins, { x, y, w: 1 }]);
    onSelectPin?.(pins.length);
  };

  const f = frame(ratio);

  return (
    <div className="relative w-full max-w-[640px] mx-auto aspect-square">
      {/* Lienzo con el tamaño del ratio activo */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
        style={{
          width: `${f.w}%`,
          height: `${f.h}%`,
          backgroundColor: "var(--color-background-secondary)",
          backgroundImage: transparent
            ? "conic-gradient(#8884 25%, transparent 0 50%, #8884 0 75%, transparent 0)"
            : undefined,
          backgroundSize: "20px 20px",
        }}
      >
        <canvas ref={ref} width={width} height={height} className="w-full h-full block" />

        {/* Pines de densidad (solo en modo pines) */}
        {pinMode && (
          <div ref={overlay} className="absolute inset-0 cursor-crosshair" style={{ touchAction: "none" }} onPointerDown={addPin}>
            {pins.map((p, i) => (
              <div
                key={i}
                role="button"
                tabIndex={0}
                aria-label={`Pin ${i + 1}`}
                className={`absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 flex items-center justify-center text-[11px] font-semibold cursor-grab active:cursor-grabbing select-none ${selectedPin === i ? "bg-accent border-white text-accent-text" : "bg-black/40 border-accent text-white"}`}
                style={{ left: `${p.x}%`, top: `${p.y}%`, touchAction: "none" }}
                onPointerDown={e => { e.stopPropagation(); onSelectPin?.(i); drag.current = i; e.currentTarget.setPointerCapture(e.pointerId); }}
                onPointerMove={e => {
                  if (drag.current !== i || !onPinsChange) return;
                  const { x, y } = toPct(e);
                  onPinsChange(pins.map((q, k) => (k === i ? { ...q, x, y } : q)));
                }}
                onPointerUp={() => { drag.current = null; }}
                onDoubleClick={e => { e.stopPropagation(); onPinsChange?.(pins.filter((_, k) => k !== i)); onSelectPin?.(null); }}
                onKeyDown={e => {
                  if (e.key === "Delete" || e.key === "Backspace") { onPinsChange?.(pins.filter((_, k) => k !== i)); onSelectPin?.(null); }
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Guías de referencia de cada ratio */}
      {GUIDES.map(({ ratio: r, color }) => {
        const g = frame(r);
        const on = r === ratio;
        return (
          <div
            key={r}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ width: `${g.w}%`, height: `${g.h}%`, border: `${on ? 2 : 1}px solid ${color}`, opacity: on ? 1 : 0.55 }}
          >
            <span className="absolute left-1.5 top-1 text-sm leading-none" style={{ color }}>{r}</span>
          </div>
        );
      })}
    </div>
  );
}
