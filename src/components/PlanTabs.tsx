import { Lock } from 'lucide-react';
import { UserTier } from '../lib/userTier';

interface PlanTabsProps {
  activePlan: 'free' | 'lite' | 'premium';
  userTier: UserTier;
  onPlanClick: (plan: 'free' | 'lite' | 'premium') => void;
}

export default function PlanTabs({ activePlan, userTier, onPlanClick }: PlanTabsProps) {
  const plans = [
    { id: 'free' as const, label: 'Gratis', locked: false },
    { id: 'lite' as const, label: 'Lite', locked: userTier === 'guest' },
    { id: 'premium' as const, label: 'Premium', locked: userTier !== 'premium' },
  ];

  return (
    <div className="border-b border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-center gap-2 overflow-x-auto">
          {plans.map((plan) => {
            const isActive = activePlan === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => onPlanClick(plan.id)}
                className={`
                  relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
                  ${isActive
                    ? 'bg-text text-background'
                    : 'bg-transparent border border-border text-text hover:border-text-secondary'
                  }
                `}
              >
                {plan.label}
                {plan.locked && !isActive && (
                  <Lock className="w-3 h-3 text-text-secondary" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
