import { useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { PatternConfig } from '../lib/patterns';
import { ParamKey, getPatternParams, getExtraParams, percentToStroke, strokeToPercent } from '../lib/patternParams';

const LABELS: Record<ParamKey, string> = {
  scale: 'Escala', rotation: 'Rotación', quantity: 'Cantidad', strokeWidth: 'Grosor de línea', distortion: 'Distorsión',
};
const RANGES: Record<ParamKey, { min: number; max: number; step: number }> = {
  scale: { min: 0.5, max: 2, step: 0.1 },
  rotation: { min: 0, max: 360, step: 5 },
  quantity: { min: 0, max: 100, step: 5 },
  strokeWidth: { min: 0, max: 100, step: 1 },
  distortion: { min: 0, max: 100, step: 1 },
};
const SUGGESTED = ['#61DAD8', '#E5007D', '#FFED00', '#00A0E4', '#FFFFFF', '#7F7D7D'];

function readValue(c: PatternConfig, k: ParamKey): number {
  switch (k) {
    case 'scale': return c.scale;
    case 'rotation': return c.rotation;
    case 'quantity': return c.quantity ?? 100;
    case 'strokeWidth': return strokeToPercent(c.strokeWidth ?? 2);
    case 'distortion': return c.distortion ?? 0;
  }
}
function showValue(k: ParamKey, v: number): string {
  if (k === 'scale') return String(Number(v.toFixed(1)));
  if (k === 'rotation') return `${v}º`;
  return `${v}%`;
}

function Slider({ label, value, min, max, step, text, onChange }: {
  label: string; value: number; min: number; max: number; step: number; text: string; onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="grid grid-cols-[9.5rem_1fr_4.5rem] items-center gap-4">
      <label className="text-xl text-text">{label}</label>
      <input type="range" className="gp-range" min={min} max={max} step={step} value={value}
        style={{ ['--pct' as string]: `${pct}%` }} onChange={e => onChange(parseFloat(e.target.value))} aria-label={label} />
      <span className="text-lg text-text text-right">{text}</span>
    </div>
  );
}

function Swatch({ color, onChange, onRemove }: { color: string; onChange: (c: string) => void; onRemove?: () => void }) {
  return (
    <div className="relative">
      <label className="block w-[70px] h-[55px] rounded-xl cursor-pointer border border-border/40" style={{ background: color }}>
        <input type="color" value={color} onChange={e => onChange(e.target.value.toUpperCase())} className="sr-only" aria-label="Elegir color" />
      </label>
      {onRemove && (
        <button onClick={onRemove} aria-label="Quitar color"
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-background border border-border text-text flex items-center justify-center hover:border-accent">
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

function Switch({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} role="switch" aria-checked={on}
      className="w-full h-[55px] px-8 rounded-xl border border-text/70 flex items-center justify-between text-xl text-text hover:border-accent transition">
      {label}
      <span className={`relative w-[54px] h-[26px] rounded-full transition ${on ? 'bg-accent' : 'bg-border'}`}>
        <span className={`absolute top-[3px] w-5 h-5 rounded-full bg-white transition-all ${on ? 'left-[31px]' : 'left-[3px]'}`} />
      </span>
    </button>
  );
}

interface Props {
  title: string;
  pinMode: boolean;
  selectedPin: number | null;
  onPinMode: (on: boolean) => void;
  config: PatternConfig;
  maxColors: number;
  saved: boolean;
  onChange: (c: PatternConfig) => void;
  onPalette: (colors: string[]) => void;
  onColorLimit: () => void;
  onRandom: () => void;
  onReset: () => void;
  onSave: () => void;
}

export default function EditorPanel({ title, pinMode, selectedPin, onPinMode, config, maxColors, saved, onChange, onPalette, onColorLimit, onRandom, onReset, onSave }: Props) {
  const params = getPatternParams(config.type);
  const extras = getExtraParams(config.type);
  const pins = config.pins ?? [];
  const pin = selectedPin !== null && selectedPin < pins.length ? pins[selectedPin] : null;
  const setPins = (next: typeof pins) => onChange({ ...config, pins: next });
  const palette = config.colors?.length ? config.colors : [config.color];
  const transparent = config.backgroundColor === 'transparent';
  const lastBg = useRef(config.backgroundColor !== 'transparent' ? config.backgroundColor : '#282828');
  if (!transparent) lastBg.current = config.backgroundColor;
  const [, force] = useState(0);

  const setParam = (k: ParamKey, v: number) => {
    if (k === 'strokeWidth') onChange({ ...config, strokeWidth: percentToStroke(v) });
    else onChange({ ...config, [k]: v });
  };

  const addColor = () => {
    if (palette.length >= maxColors) return onColorLimit();
    const next = SUGGESTED.find(c => !palette.map(p => p.toUpperCase()).includes(c)) ?? '#FFFFFF';
    onPalette([...palette, next]);
  };

  return (
    <div className="space-y-7">
      <h2 className="text-3xl uppercase font-semibold tracking-wide text-text">{title}</h2>

      <div className="space-y-6">
        {params.map(k => (
          <Slider key={k} label={LABELS[k]} value={readValue(config, k)} {...RANGES[k]} text={showValue(k, readValue(config, k))}
            onChange={v => setParam(k, v)} />
        ))}
      </div>

      {(
        <div className="space-y-6 pt-2 border-t border-border/40">
          <h3 className="text-sm uppercase tracking-wider text-text-secondary pt-3">Ajustes de este patrón</h3>
          {extras.map(d => {
            const v = config.params?.[d.key] ?? d.def;
            return (
              <Slider key={d.key} label={d.label} value={v} min={d.min} max={d.max} step={d.step}
                text={d.labels ? d.labels[v] ?? String(v) : `${Number(v.toFixed(2))}${d.unit ?? ''}`}
                onChange={nv => onChange({ ...config, params: { ...config.params, [d.key]: nv } })} />
            );
          })}
          <Slider label="Opacidad" value={config.opacity ?? 100} min={10} max={100} step={1} text={`${config.opacity ?? 100}%`}
            onChange={v => onChange({ ...config, opacity: v })} />
          {params.includes('strokeWidth') && (
            <Slider label="Punta de línea" value={config.lineCap ?? 0} min={0} max={2} step={1}
              text={['Redonda', 'Recta', 'Cuadrada'][config.lineCap ?? 0]} onChange={v => onChange({ ...config, lineCap: v })} />
          )}
        </div>
      )}

      {config.type === 'halftoneDots' && (
        <div className="space-y-4 pt-2 border-t border-border/40">
          <h3 className="text-sm uppercase tracking-wider text-text-secondary pt-3">Pines de densidad</h3>
          <Switch label="Colocar pines" on={pinMode} onToggle={() => onPinMode(!pinMode)} />
          <p className="text-sm text-text-secondary">
            Con la opción activa, toca el lienzo para añadir un pin (hasta 12) y arrástralo para moverlo. Los puntos serán más grandes cerca de cada pin. Doble clic o Supr para quitarlo.
          </p>
          {pin && (
            <>
              <Slider label={`Pin ${selectedPin! + 1}`} value={pin.w} min={0.2} max={1.5} step={0.05} text={`${Math.round(pin.w * 100)}%`}
                onChange={v => setPins(pins.map((q, k) => (k === selectedPin ? { ...q, w: v } : q)))} />
              <button onClick={() => setPins(pins.filter((_, k) => k !== selectedPin))}
                className="w-full h-11 rounded-xl border border-text/70 text-lg text-text hover:border-accent transition">Quitar este pin</button>
            </>
          )}
          {pins.length > 0 && (
            <button onClick={() => setPins([])}
              className="w-full h-11 rounded-xl border border-text/40 text-lg text-text-secondary hover:border-accent transition">Quitar todos los pines ({pins.length})</button>
          )}
        </div>
      )}

      <div>
        <h3 className="text-2xl text-text mb-3">Colores del patron</h3>
        <div className="flex flex-wrap items-center gap-3 pl-2">
          {palette.map((c, i) => (
            <Swatch key={i} color={c} onChange={nc => onPalette(palette.map((p, j) => (j === i ? nc : p)))}
              onRemove={palette.length > 1 ? () => onPalette(palette.filter((_, j) => j !== i)) : undefined} />
          ))}
          <button onClick={addColor} aria-label="Agregar color" title={`Hasta ${maxColors} colores`}
            className="w-[55px] h-[55px] flex items-center justify-center text-border hover:text-accent transition">
            <Plus className="w-9 h-9" strokeWidth={1} />
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-2xl text-text mb-3">Color del fondo</h3>
        <div className="flex items-center gap-3 pl-2">
          <Swatch color={transparent ? lastBg.current : config.backgroundColor}
            onChange={c => { lastBg.current = c; onChange({ ...config, backgroundColor: c }); force(n => n + 1); }} />
          <button onClick={() => onChange({ ...config, backgroundColor: transparent ? lastBg.current : 'transparent' })}
            aria-label="Sin fondo" aria-pressed={transparent} title="Sin fondo (transparente)"
            className={`w-[70px] h-[55px] rounded-xl border flex items-center justify-center transition ${transparent ? 'border-accent' : 'border-text/70 hover:border-accent'}`}>
            <svg width="40" height="30" viewBox="0 0 40 30" fill="none" stroke="currentColor" className="text-text"><line x1="2" y1="28" x2="38" y2="2" strokeWidth="1.5" /></svg>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <Switch label="Repetir Patron" on={config.tilePattern} onToggle={() => onChange({ ...config, tilePattern: !config.tilePattern })} />
        <Switch label="Aleatorizar Relleno" on={!!config.randomFillPerElement} onToggle={() => onChange({ ...config, randomFillPerElement: !config.randomFillPerElement })} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button onClick={onRandom} className="h-[55px] rounded-xl bg-border text-white text-xl hover:brightness-110 transition">Aleatorio</button>
        <button onClick={onReset} className="h-[55px] rounded-xl border border-text/70 text-text text-xl hover:border-accent transition">Reset</button>
        <button onClick={onSave} className="h-[55px] rounded-xl border border-text/70 text-text text-xl hover:border-accent transition">{saved ? 'Guardado ✓' : 'Guardar'}</button>
      </div>
    </div>
  );
}
