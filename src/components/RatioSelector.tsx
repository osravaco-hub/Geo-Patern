interface RatioSelectorProps {
  ratio: '1:1' | '16:9' | '4:3' | '9:16';
  onChange: (ratio: '1:1' | '16:9' | '4:3' | '9:16') => void;
}

export default function RatioSelector({ ratio, onChange }: RatioSelectorProps) {
  const ratios: Array<{ value: '1:1' | '16:9' | '4:3' | '9:16'; label: string }> = [
    { value: '1:1', label: '1:1' },
    { value: '16:9', label: '16:9' },
    { value: '4:3', label: '4:3' },
    { value: '9:16', label: '9:16' },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider mr-2">
        Ratio
      </span>
      {ratios.map((r) => {
        const isActive = ratio === r.value;
        return (
          <button
            key={r.value}
            onClick={() => onChange(r.value)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
              ${isActive
                ? 'bg-text text-background'
                : 'bg-transparent border border-border text-text hover:border-text-secondary'
              }
            `}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}
