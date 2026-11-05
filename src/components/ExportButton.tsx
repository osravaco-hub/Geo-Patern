import { useState, useRef } from 'react';
import { Download, Check, Loader2 } from 'lucide-react';
import { PatternConfig } from '../lib/patterns';
import { UserTier } from '../lib/userTier';
import {
  exportPattern,
  triggerDownload,
  ExportFormat,
  ExportResolution,
  getAvailableResolutions,
  isResolutionAvailable,
  getResolutionSize,
} from '../lib/export';

interface ExportButtonProps {
  config: PatternConfig;
  seed: number;
  tier: UserTier;
  transparentBackground?: boolean;
  downloadsToday?: number;
  onDownload: () => void;
  onPremiumClick: () => void;
}

export default function ExportButton({
  config,
  seed,
  tier,
  transparentBackground = false,
  downloadsToday = 0,
  onDownload,
  onPremiumClick,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('png');
  const [selectedResolution, setSelectedResolution] = useState<ExportResolution>('1x');
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const availableResolutions = getAvailableResolutions(tier);

  const handleExport = async () => {
    setShowOptions(false);
    setIsExporting(true);

    try {
      const result = await exportPattern({
        patternType: config.type,
        config,
        format: selectedFormat,
        resolution: selectedResolution,
        transparentBackground,
        userId: 'current-user',
        seed,
      });

      if (!result.success) {
        setIsExporting(false);
        if (result.errorCode === 'LIMIT_REACHED' || result.errorCode === 'UNAUTHORIZED') {
          onPremiumClick();
        }
        return;
      }

      if (result.dataUrl && result.filename) {
        triggerDownload(result.dataUrl, result.filename);
        onDownload();

        setSuccess(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={isExporting}
        className={`
          w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold transition-all duration-200
          ${success
            ? 'bg-green-500 text-white shadow-md shadow-green-500/20'
            : 'bg-accent text-accent-text hover:opacity-90'
          }
          disabled:opacity-70 disabled:cursor-not-allowed
        `}
      >
        {isExporting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : success ? (
          <Check className="w-5 h-5" />
        ) : (
          <Download className="w-5 h-5" />
        )}
        {isExporting ? 'Exportando...' : success ? '¡Descargado!' : 'Exportar Patrón'}
      </button>

      {showOptions && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl border border-border shadow-xl p-4 space-y-4 z-50">
          {/* Format Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text/50 uppercase tracking-wider">
              Formato
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedFormat('png')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedFormat === 'png'
                    ? 'bg-accent text-white'
                    : 'bg-background text-text/70 hover:bg-accent-light'
                }`}
              >
                PNG
              </button>
              <button
                onClick={() => setSelectedFormat('svg')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedFormat === 'svg'
                    ? 'bg-accent text-white'
                    : 'bg-background text-text/70 hover:bg-accent-light'
                }`}
              >
                SVG
              </button>
            </div>
          </div>

          {/* Resolution Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text/50 uppercase tracking-wider">
              Resolución
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['1x', '2x', '3x'] as ExportResolution[]).map((res) => {
                const available = isResolutionAvailable(tier, res);
                const size = getResolutionSize(res);
                const isSelected = selectedResolution === res;

                return (
                  <button
                    key={res}
                    onClick={() => {
                      if (available) {
                        setSelectedResolution(res);
                      } else {
                        onPremiumClick();
                      }
                    }}
                    className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                      !available
                        ? 'bg-premium-light/50 text-premium/60 border border-premium/20'
                        : isSelected
                          ? 'bg-accent text-white'
                          : 'bg-background text-text/70 hover:bg-accent-light'
                    }`}
                  >
                    <div className="font-bold">{res}</div>
                    <div className="text-[10px] opacity-75">{size}px</div>
                    {!available && <div className="text-[9px] mt-0.5">Premium</div>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-all disabled:opacity-70"
          >
            {isExporting ? 'Generando...' : `Exportar ${selectedFormat.toUpperCase()} ${selectedResolution}`}
          </button>
        </div>
      )}
    </div>
  );
}
