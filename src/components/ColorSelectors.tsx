import { Check } from 'lucide-react';

interface ColorSelectorsProps {
  patternColor: string;
  fillColor?: string;
  onPatternColorChange: (color: string) => void;
  onFillColorChange: (color: string | undefined) => void;
}

const PRESET_COLORS = [
  { name: 'Azul', color: '#3B82F6' },
  { name: 'Morado', color: '#8B5CF6' },
  { name: 'Rosa', color: '#EC4899' },
  { name: 'Verde', color: '#10B981' },
  { name: 'Naranja', color: '#F59E0B' },
  { name: 'Rojo', color: '#EF4444' },
  { name: 'Cyan', color: '#06B6D4' },
  { name: 'Negro', color: '#000000' },
];

export default function ColorSelectors({ patternColor, fillColor, onPatternColorChange, onFillColorChange }: ColorSelectorsProps) {
  return (
    <div className="space-y-4">
      {/* Pattern Color (Stroke) */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Color del Patrón
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          {PRESET_COLORS.map((preset) => {
            const isActive = patternColor === preset.color;
            return (
              <button
                key={preset.color}
                onClick={() => onPatternColorChange(preset.color)}
                className={`
                  w-9 h-9 rounded-full transition-all duration-200 relative
                  ${isActive ? 'ring-2 ring-offset-2 ring-offset-background ring-text scale-110' : 'hover:scale-105'}
                `}
                style={{ backgroundColor: preset.color }}
                title={preset.name}
              >
                {isActive && <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />}
              </button>
            );
          })}
          {/* Custom color picker */}
          <div className="relative">
            <input
              type="color"
              value={patternColor}
              onChange={(e) => onPatternColorChange(e.target.value)}
              className="w-12 h-9 rounded-lg cursor-pointer border border-border"
              title="Color personalizado"
            />
          </div>
        </div>
      </div>

      {/* Fill Color */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Color de Forma
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          {PRESET_COLORS.map((preset) => {
            const isActive = fillColor === preset.color;
            return (
              <button
                key={preset.color}
                onClick={() => onFillColorChange(preset.color)}
                className={`
                  w-9 h-9 rounded-full transition-all duration-200 relative
                  ${isActive ? 'ring-2 ring-offset-2 ring-offset-background ring-text scale-110' : 'hover:scale-105'}
                `}
                style={{ backgroundColor: preset.color }}
                title={preset.name}
              >
                {isActive && <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />}
              </button>
            );
          })}
          {/* Custom color picker */}
          <div className="relative">
            <input
              type="color"
              value={fillColor || patternColor}
              onChange={(e) => onFillColorChange(e.target.value)}
              className="w-12 h-9 rounded-lg cursor-pointer border border-border"
              title="Color personalizado"
            />
          </div>
          {/* Clear fill color */}
          {fillColor && (
            <button
              onClick={() => onFillColorChange(undefined)}
              className="px-3 py-2 text-xs text-text-secondary hover:text-text border border-border rounded-lg transition-colors"
            >
              Sin relleno
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
