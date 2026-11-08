import { useState, useEffect } from 'react';
import { Shuffle, RotateCcw, Palette, Grid, Lock } from 'lucide-react';
import { PatternConfig } from '../lib/patterns';
import { UserTier } from '../lib/userTier';

interface ActionButtonsProps {
  config: PatternConfig;
  onChange: (config: PatternConfig) => void;
  onRandomize: () => void;
  onReset: () => void;
  tier: UserTier;
  onPremiumClick: () => void;
}

export default function ActionButtons({ config, onChange, onRandomize, onReset, tier, onPremiumClick }: ActionButtonsProps) {
  const [randomFillActive, setRandomFillActive] = useState(config.randomFillPerElement || false);
  const isPremium = tier === 'premium';

  const handleToggleRandomFill = () => {
    if (!isPremium) {
      onPremiumClick();
      return;
    }
    
    const newState = !randomFillActive;
    setRandomFillActive(newState);
    
    // Si se desactiva, limpiar el fillColor y randomFillPerElement
    if (!newState) {
      onChange({ ...config, fillColor: undefined, randomFillPerElement: false });
    } else {
      // Si se activa, activar randomFillPerElement para colores por elemento
      onChange({ ...config, randomFillPerElement: true });
    }
  };

  return (
    <div className="space-y-4">
      {/* Toggles */}
      <div className="space-y-3">
        {/* Tile Pattern Toggle */}
        <div className="flex items-center justify-between p-3 bg-background-secondary rounded-xl border border-border transition-colors duration-300">
          <div className="flex items-center gap-2">
            <Grid className="w-4 h-4 text-text-secondary" />
            <span className="text-sm font-medium text-text">Repetir patrón</span>
          </div>
          <button
            onClick={() => onChange({ ...config, tilePattern: !config.tilePattern })}
            className={`w-12 h-6 rounded-full transition-all duration-200 ${
              config.tilePattern ? 'bg-accent-blue' : 'bg-border'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-background shadow-sm transition-transform duration-200 ${
                config.tilePattern ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Randomize Fill Toggle (Premium only) */}
        <div className="flex items-center justify-between p-3 bg-background-secondary rounded-xl border border-border transition-colors duration-300">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-text-secondary" />
            <span className="text-sm font-medium text-text">Aleatorizar relleno</span>
            {!isPremium && <Lock className="w-3 h-3 text-text-secondary" />}
          </div>
          <button
            onClick={handleToggleRandomFill}
            disabled={!isPremium}
            className={`w-12 h-6 rounded-full transition-all duration-200 ${
              isPremium
                ? randomFillActive ? 'bg-accent-blue' : 'bg-border'
                : 'bg-border opacity-50 cursor-not-allowed'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-background shadow-sm transition-transform duration-200 ${
                isPremium && randomFillActive ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onRandomize}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-text text-background rounded-lg font-medium hover:opacity-90 transition-all duration-200"
        >
          <Shuffle className="w-4 h-4" />
          Aleatorizar
        </button>
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-transparent text-text border border-border rounded-lg font-medium hover:border-text-secondary transition-all duration-200"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  );
}
