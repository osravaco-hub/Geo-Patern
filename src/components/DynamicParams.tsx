import { PatternConfig, PatternId } from '../lib/patterns';

interface DynamicParamsProps {
  config: PatternConfig;
  onChange: (config: PatternConfig) => void;
}

// Define which parameters each pattern supports
const PATTERN_PARAMS: Record<PatternId, string[]> = {
  concentricCircles: ['density', 'rotation', 'scale', 'strokeWidth'],
  diagonalLines: ['density', 'rotation', 'strokeWidth'],
  dotGrid: ['density', 'quantity'],
  wavyLines: ['density', 'rotation', 'strokeWidth'],
  triangleGrid: ['density', 'strokeWidth'],
  squareSpiral: ['density', 'rotation', 'scale', 'strokeWidth'],
  scandinavianCross: ['density', 'strokeWidth', 'quantity'],
  verticalStripes: ['density', 'quantity'],
  voronoi: ['density', 'scale', 'strokeWidth'],
  artDeco: ['density', 'scale', 'strokeWidth'],
  tessellation: ['density', 'scale', 'strokeWidth'],
  fractalTree: ['density', 'scale', 'strokeWidth'],
  flowLines: ['density', 'scale', 'strokeWidth'],
  waveField: ['density', 'scale', 'strokeWidth', 'quantity'],
  joyDivision: ['density', 'scale', 'strokeWidth'],
  quarterArcTruchet: ['density', 'scale', 'strokeWidth'],
  nodeGarden: ['density', 'scale', 'strokeWidth'],
  halftoneDots: ['density', 'scale', 'quantity'],
  concentricNoiseRings: ['density', 'scale', 'strokeWidth'],
  chevronPattern: ['density', 'rotation', 'strokeWidth'],
  triangularMosaic: ['density', 'scale', 'quantity'],
};

const PARAM_LABELS: Record<string, string> = {
  density: 'Densidad',
  rotation: 'Rotación',
  scale: 'Escala',
  strokeWidth: 'Grosor',
  quantity: 'Cantidad',
};

const PARAM_CONFIG: Record<string, { min: number; max: number; step: number; suffix?: string }> = {
  density: { min: 0, max: 100, step: 1 },
  rotation: { min: 0, max: 360, step: 5, suffix: '°' },
  scale: { min: 0.5, max: 2.0, step: 0.1 },
  strokeWidth: { min: 0.5, max: 20, step: 0.5, suffix: 'px' },
  quantity: { min: 0, max: 100, step: 5, suffix: '%' },
};

export default function DynamicParams({ config, onChange }: DynamicParamsProps) {
  const params = PATTERN_PARAMS[config.type] || ['density', 'rotation', 'scale'];

  const update = (key: string, value: number) => {
    onChange({ ...config, [key]: value });
  };

  const getValue = (key: string): number => {
    if (key === 'strokeWidth') return config.strokeWidth ?? 2;
    if (key === 'quantity') return config.quantity ?? 100;
    return (config as any)[key] ?? 50;
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
        Parámetros
      </h3>
      <div className="space-y-3">
        {params.map((param) => {
          const paramConfig = PARAM_CONFIG[param];
          if (!paramConfig) return null;

          const value = getValue(param);

          return (
            <div key={param} className="flex items-center gap-3">
              <label className="text-sm text-text-secondary w-20 shrink-0">
                {PARAM_LABELS[param]}
              </label>
              <input
                type="range"
                min={paramConfig.min}
                max={paramConfig.max}
                step={paramConfig.step}
                value={value}
                onChange={(e) => update(param, parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-mono text-text-secondary w-12 text-right">
                {value % 1 !== 0 ? value.toFixed(1) : value}{paramConfig.suffix || ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
