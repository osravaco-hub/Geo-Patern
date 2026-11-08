import { PatternId, PATTERN_DEFINITIONS, isPatternAvailable } from '../lib/patterns';
import { UserTier } from '../lib/userTier';
import { Lock } from 'lucide-react';

interface PatternSelectorProps {
  selected: PatternId;
  onSelect: (type: PatternId) => void;
  tier: UserTier;
  onPremiumClick: () => void;
}

const TIER_LABELS: Record<string, string> = {
  'ultra-basic': 'Gratis',
  'basic': 'Free',
  'advanced': 'Premium',
};

const TIER_COLORS: Record<string, string> = {
  'ultra-basic': 'text-green-600 bg-green-50',
  'basic': 'text-accent bg-accent-light',
  'advanced': 'text-premium bg-premium-light',
};

export default function PatternSelector({ selected, onSelect, tier, onPremiumClick }: PatternSelectorProps) {
  const groups = [
    { label: 'Ultra-Básicos', tier: 'ultra-basic' as const, patterns: PATTERN_DEFINITIONS.filter(p => p.tier === 'ultra-basic') },
    { label: 'Básicos', tier: 'basic' as const, patterns: PATTERN_DEFINITIONS.filter(p => p.tier === 'basic') },
    { label: 'Avanzados', tier: 'advanced' as const, patterns: PATTERN_DEFINITIONS.filter(p => p.tier === 'advanced') },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-text/70 uppercase tracking-wider">Tipo de Patrón</h3>

      {groups.map((group) => (
        <div key={group.tier} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TIER_COLORS[group.tier]}`}>
              {TIER_LABELS[group.tier]}
            </span>
            <span className="text-xs text-text/40">{group.label}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {group.patterns.map((pattern) => {
              const isSelected = selected === pattern.id;
              const isLocked = !isPatternAvailable(pattern.id, tier);

              return (
                <button
                  key={pattern.id}
                  onClick={() => {
                    if (isLocked) {
                      onPremiumClick();
                    } else {
                      onSelect(pattern.id);
                    }
                  }}
                  className={`
                    relative px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left
                    ${isSelected
                      ? 'bg-accent text-white shadow-md shadow-accent/20 scale-[1.02]'
                      : isLocked
                        ? 'bg-gray-50 text-text/40 border border-border hover:border-premium/30'
                        : 'bg-white text-text/70 border border-border hover:border-accent/40 hover:text-accent'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{pattern.emoji}</span>
                    <span className="truncate text-xs">{pattern.label}</span>
                  </div>
                  {isLocked && (
                    <Lock className="absolute top-1.5 right-1.5 w-3 h-3 text-text/30" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
