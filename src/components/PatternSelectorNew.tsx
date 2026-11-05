import { PatternId, PATTERN_DEFINITIONS } from '../lib/patterns';

interface PatternSelectorNewProps {
  selected: PatternId;
  onSelect: (id: PatternId) => void;
  activePlanTab: 'free' | 'lite' | 'premium';
}

export default function PatternSelectorNew({ selected, onSelect, activePlanTab }: PatternSelectorNewProps) {
  // Filter patterns based on active plan tab - each plan shows ONLY its own patterns
  const availablePatterns = PATTERN_DEFINITIONS.filter(pattern => {
    if (activePlanTab === 'free') {
      return pattern.tier === 'ultra-basic';
    } else if (activePlanTab === 'lite') {
      return pattern.tier === 'basic';
    } else {
      return pattern.tier === 'advanced';
    }
  });

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
        Tipo de Patrón
      </h3>
      <div className="flex flex-wrap gap-2">
        {availablePatterns.map((pattern) => {
          const isSelected = selected === pattern.id;
          return (
            <button
              key={pattern.id}
              onClick={() => onSelect(pattern.id)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${isSelected
                  ? 'bg-text text-background'
                  : 'bg-transparent border border-border text-text hover:border-text-secondary'
                }
              `}
            >
              <span className="mr-1.5">{pattern.emoji}</span>
              {pattern.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
