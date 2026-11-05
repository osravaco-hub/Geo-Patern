import { useEffect, useRef, useMemo, memo } from 'react';
import { generatePattern, PatternConfig, isPatternAvailable, getLockMessage } from '../lib/patterns';
import { UserTier } from '../lib/userTier';

interface PatternCanvasProps {
  config: PatternConfig;
  seed: number;
  tier: UserTier;
  width?: number;
  height?: number;
  onLockedClick?: () => void;
}

export default memo(function PatternCanvas({ config, seed, tier, width = 600, height = 600, onLockedClick }: PatternCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isAvailable = useMemo(
    () => isPatternAvailable(config.type, tier),
    [config.type, tier]
  );

  const lockMessage = useMemo(
    () => getLockMessage(config.type, tier),
    [config.type, tier]
  );

  // Memoize canvas rendering dependencies
  const canvasDeps = useMemo(() => ({ config, seed, width, height }), [config, seed, width, height]);

  // Render pattern to canvas — memoized to avoid unnecessary re-renders
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    generatePattern(ctx, canvasDeps.width, canvasDeps.height, canvasDeps.config, canvasDeps.seed);
  }, [canvasDeps]);

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg border border-border bg-white">
      {/* Canvas — always rendered, blurred when locked */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-auto block"
        style={{
          maxWidth: '100%',
          filter: isAvailable ? 'none' : 'blur(4px)',
          transition: 'filter 0.3s ease',
        }}
      />

      {/* Lock overlay when pattern is not available */}
      {!isAvailable && (
        <div
          className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center cursor-pointer group"
          onClick={onLockedClick}
        >
          {/* Lock icon (SVG inline) */}
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          {/* Lock message */}
          <p className="text-white text-sm font-medium text-center px-6 max-w-xs leading-relaxed">
            {lockMessage}
          </p>

          {/* CTA button */}
          <button
            className="mt-4 px-5 py-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full border border-white/30 hover:bg-white/30 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              onLockedClick?.();
            }}
          >
            {tier === 'guest' ? 'Registrarse' : 'Ver Premium'}
          </button>
        </div>
      )}

      {/* Size badge */}
      <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-medium text-text/60">
        {width}×{height}px
      </div>
    </div>
  );
});
