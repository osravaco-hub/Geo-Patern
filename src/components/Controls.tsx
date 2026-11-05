import { PatternConfig, PATTERN_DEFINITIONS, isPatternAvailable } from '../lib/patterns';
import PatternSelector from './PatternSelector';
import { UserTier } from '../lib/userTier';
import { Shuffle, RotateCcw, Palette, Eye, Grid } from 'lucide-react';

interface ControlsProps {
  config: PatternConfig;
  onChange: (config: PatternConfig) => void;
  onRandomize: () => void;
  onReset: () => void;
  tier: UserTier;
  onPremiumClick: () => void;
}

const PRESET_COLORS = [
  { name: 'Azul', color: '#2563EB' },
  { name: 'Púrpura', color: '#8B5CF6' },
  { name: 'Rosa', color: '#EC4899' },
  { name: 'Verde', color: '#10B981' },
  { name: 'Ámbar', color: '#F59E0B' },
  { name: 'Rojo', color: '#EF4444' },
  { name: 'Cian', color: '#06B6D4' },
  { name: 'Negro', color: '#1A1A1A' },
];

const PRESET_BG = [
  { name: 'Blanco', color: '#FAFAFA' },
  { name: 'Crema', color: '#FEF3C7' },
  { name: 'Lavanda', color: '#EDE9FE' },
  { name: 'Menta', color: '#D1FAE5' },
  { name: 'Rosa claro', color: '#FCE7F3' },
  { name: 'Oscuro', color: '#1A1A1A' },
];

// Curated color palettes for premium users
const COLOR_PALETTES = [
  { name: 'Océano', colors: ['#2563EB', '#06B6D4', '#0EA5E9'] },
  { name: 'Bosque', colors: ['#10B981', '#059669', '#34D399'] },
  { name: 'Atardecer', colors: ['#F59E0B', '#EF4444', '#EC4899'] },
  { name: 'Noche', colors: ['#8B5CF6', '#6366F1', '#A78BFA'] },
  { name: 'Pastel', colors: ['#FCA5A5', '#FCD34D', '#86EFAC'] },
  { name: 'Neón', colors: ['#FF006E', '#FB5607', '#3A86FF'] },
];

export default function Controls({ config, onChange, onRandomize, onReset, tier, onPremiumClick }: ControlsProps) {
  const update = (partial: Partial<PatternConfig>) => {
    onChange({ ...config, ...partial });
  };

  const randomizeColors = () => {
    const palette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
    const randomColor = palette.colors[Math.floor(Math.random() * palette.colors.length)];
    update({ color: randomColor });
  };

  const randomizeFillColor = () => {
    // Generate completely random color
    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    update({ color: randomColor });
  };

  const toggleTransparentBg = () => {
    const isTransparent = config.backgroundColor === 'transparent';
    update({ backgroundColor: isTransparent ? '#FAFAFA' : 'transparent' });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Pattern Selector */}
      <PatternSelector
        selected={config.type}
        onSelect={(type) => update({ type })}
        tier={tier}
        onPremiumClick={onPremiumClick}
      />

      {/* Pattern Color */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-text/70 uppercase tracking-wider font-[family-name:var(--font-body)]">
          Color del Patrón
        </h3>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((preset) => {
            const isActive = config.color === preset.color;
            return (
              <button
                key={preset.color}
                onClick={() => update({ color: preset.color })}
                className={`w-9 h-9 rounded-full border-2 transition-all duration-200 ${
                  isActive ? 'border-accent scale-110 shadow-md' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: preset.color }}
                title={preset.name}
              />
            );
          })}
          <div className="relative">
            <input
              type="color"
              value={config.color === 'transparent' ? '#000000' : config.color}
              onChange={(e) => update({ color: e.target.value })}
              className="w-9 h-9 rounded-full cursor-pointer border-2 border-border overflow-hidden"
              title="Color personalizado"
            />
          </div>
        </div>
      </div>

      {/* Background Color */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-text/70 uppercase tracking-wider font-[family-name:var(--font-body)]">
          Color de Fondo
        </h3>
        <div className="flex flex-wrap gap-2">
          {PRESET_BG.map((preset) => {
            const isActive = config.backgroundColor === preset.color;
            return (
              <button
                key={preset.color}
                onClick={() => update({ backgroundColor: preset.color })}
                className={`w-9 h-9 rounded-full border-2 transition-all duration-200 ${
                  isActive ? 'border-accent scale-110 shadow-md' : 'border-border hover:scale-105'
                }`}
                style={{ backgroundColor: preset.color }}
                title={preset.name}
              />
            );
          })}
          <div className="relative">
            <input
              type="color"
              value={config.backgroundColor === 'transparent' ? '#ffffff' : config.backgroundColor}
              onChange={(e) => update({ backgroundColor: e.target.value })}
              className="w-9 h-9 rounded-full cursor-pointer border-2 border-border overflow-hidden"
              title="Fondo personalizado"
            />
          </div>
        </div>
      </div>

      {/* Sliders - Different by tier */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-text/70 uppercase tracking-wider font-[family-name:var(--font-body)]">
          Parámetros
        </h3>

        <div className="space-y-3">
          {/* Density - All tiers */}
          <SliderControl
            label="Densidad"
            value={config.density}
            min={0}
            max={100}
            step={1}
            onChange={(v) => update({ density: v })}
          />

          {/* Rotation - All tiers */}
          <SliderControl
            label="Rotación"
            value={config.rotation}
            min={0}
            max={360}
            step={5}
            onChange={(v) => update({ rotation: v })}
            suffix="°"
          />

          {/* Scale - Free and Premium only */}
          {tier !== 'guest' && (
            <SliderControl
              label="Escala"
              value={config.scale}
              min={0.5}
              max={2.0}
              step={0.1}
              onChange={(v) => update({ scale: v })}
            />
          )}
        </div>
      </div>

      {/* Pattern Tiling Toggle - All tiers */}
      <div className="flex items-center justify-between p-3 bg-background rounded-xl border border-border">
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-text/60" />
          <span className="text-sm font-medium text-text/80">Repetir Patrón</span>
        </div>
        <button
          onClick={() => update({ tilePattern: !config.tilePattern })}
          className={`w-12 h-6 rounded-full transition-all duration-200 ${
            config.tilePattern ? 'bg-accent' : 'bg-border'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
              config.tilePattern ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Premium Features */}
      {tier === 'premium' && (
        <div className="space-y-3 pt-4 border-t border-border">
          <h3 className="text-sm font-semibold text-premium uppercase tracking-wider font-[family-name:var(--font-body)] flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Funciones Premium
          </h3>

          {/* Randomize Colors Button */}
          <button
            onClick={randomizeColors}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-premium to-accent text-white rounded-xl font-medium hover:opacity-90 transition-all duration-200 shadow-md shadow-premium/20"
          >
            <Shuffle className="w-4 h-4" />
            Aleatorizar Colores
          </button>

          {/* Randomize Fill Color Button */}
          <button
            onClick={randomizeFillColor}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-all duration-200 shadow-md shadow-pink-500/20"
          >
            <Palette className="w-4 h-4" />
            Aleatorizar Color de Relleno
          </button>

          {/* Transparent Background Toggle */}
          <div className="flex items-center justify-between p-3 bg-background rounded-xl">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-text/60" />
              <span className="text-sm font-medium text-text/80">Fondo Transparente</span>
            </div>
            <button
              onClick={toggleTransparentBg}
              className={`w-12 h-6 rounded-full transition-all duration-200 ${
                config.backgroundColor === 'transparent' ? 'bg-premium' : 'bg-border'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  config.backgroundColor === 'transparent' ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onRandomize}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-all duration-200 shadow-md shadow-accent/20"
        >
          <Shuffle className="w-4 h-4" />
          Aleatorizar
        </button>
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-text/70 rounded-xl font-medium border border-border hover:border-accent/30 hover:text-accent transition-all duration-200"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  );
}

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  suffix?: string;
}

function SliderControl({ label, value, min, max, step, onChange, suffix = '' }: SliderControlProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-text/60 w-20 shrink-0 font-[family-name:var(--font-body)]">
        {label}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-2 bg-border rounded-full appearance-none cursor-pointer accent-accent transition-all duration-200"
        style={{
          background: `linear-gradient(to right, #2563EB 0%, #2563EB ${((value - min) / (max - min)) * 100}%, #E5E7EB ${((value - min) / (max - min)) * 100}%, #E5E7EB 100%)`,
        }}
      />
      <span className="text-sm font-mono text-text/50 w-14 text-right">
        {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value}{suffix}
      </span>
    </div>
  );
}
