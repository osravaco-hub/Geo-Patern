import { useState, useCallback } from 'react';
import { useTheme } from '../hooks/useTheme';
import { PatternConfig, defaultConfig, PatternId, PATTERN_DEFINITIONS, generateSVG } from '../lib/patterns';
import {
  LOCKING_ENABLED, MAX_PALETTE_COLORS, UserState, getDefaultUser, getUserTier, canDownload,
  getRemainingDownloads, simulateLogin, simulatePremiumUpgrade, recordDownload,
} from '../lib/userTier';
import { CanvasRatio, ExportFormat, ExportResolution, RATIOS, exportPattern, triggerDownload, ratioDims, svgToCss, copyText } from '../lib/export';
import { PBRViewMode } from '../lib/pbrMaps';
import { getPatternParams } from '../lib/patternParams';
import { SavedPattern, savePattern } from '../lib/savedPatterns';
import Header from '../components/Header';
import EditorCanvas from '../components/EditorCanvas';
import EditorPanel from '../components/EditorPanel';
import EditorActions from '../components/EditorActions';
import UpsellModal from '../components/UpsellModal';
import PricingModal from '../components/PricingModal';

interface GeneratorProps {
  initialPattern?: PatternId;
  initialSaved?: SavedPattern | null;
  onHome?: () => void;
  onNavigateDashboard: () => void;
}

const baseConfig = (type: PatternId): PatternConfig => ({ ...defaultConfig, type });
const rand = (min: number, max: number, step = 1) => Math.round((min + Math.random() * (max - min)) / step) * step;

export default function Generator({ initialPattern, initialSaved, onHome, onNavigateDashboard }: GeneratorProps) {
  const { theme, toggleTheme } = useTheme();
  const startType = initialSaved?.config.type ?? initialPattern ?? defaultConfig.type;
  const [config, setConfig] = useState<PatternConfig>(initialSaved?.config ?? baseConfig(startType));
  const [seed, setSeed] = useState(initialSaved?.seed ?? 42);
  const [ratio, setRatio] = useState<CanvasRatio>(initialSaved?.ratio ?? '1:1');
  const [user, setUser] = useState<UserState>(getDefaultUser());
  const [showUpsell, setShowUpsell] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [upsellFeature, setUpsellFeature] = useState('');
  const [justSaved, setJustSaved] = useState(false);

  const tier = LOCKING_ENABLED ? getUserTier(user) : 'pro';
  const maxColors = MAX_PALETTE_COLORS[tier];
  const title = PATTERN_DEFINITIONS.find(p => p.id === config.type)?.label ?? '';
  const askPro = useCallback((feature: string) => { setUpsellFeature(feature); setShowUpsell(true); }, []);
  const [pbrViewMode, setPbrViewMode] = useState<PBRViewMode>('color');

  const setPalette = (colors: string[]) => setConfig(p => ({ ...p, colors, color: colors[0] }));

  const handleRandom = () => {
    const keys = getPatternParams(config.type);
    setSeed(Math.floor(Math.random() * 100000));
    setConfig(p => ({
      ...p,
      density: rand(20, 80),
      ...(keys.includes('scale') && { scale: rand(0.6, 1.8, 0.1) }),
      ...(keys.includes('rotation') && { rotation: rand(0, 355, 5) }),
      ...(keys.includes('quantity') && { quantity: rand(40, 100, 5) }),
      ...(keys.includes('strokeWidth') && { strokeWidth: rand(1, 6, 0.5) }),
      ...(keys.includes('distortion') && { distortion: rand(10, 70) }),
    }));
  };

  const handleReset = () => { setConfig(baseConfig(config.type)); setSeed(42); setRatio('1:1'); };

  const handleSave = () => {
    const n = PATTERN_DEFINITIONS.find(p => p.id === config.type)?.label ?? 'Patrón';
    if (savePattern(`${n} · ${new Date().toLocaleDateString('es')}`, config, seed, ratio)) {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    }
  };

  const handleDownload = async (format: ExportFormat, resolution: ExportResolution) => {
    if (LOCKING_ENABLED && !canDownload(tier, user.downloadsToday)) return askPro('más descargas diarias');
    const res = await exportPattern({ config, format, resolution, ratio, seed, tier });
    if (!res.success || !res.dataUrl || !res.filename) {
      if (res.error?.includes('Pro')) askPro('la resolución 4K');
      return;
    }
    triggerDownload(res.dataUrl, res.filename);
    setUser(prev => recordDownload(prev));
  };

  const handleCopy = async (kind: 'svg' | 'css'): Promise<string> => {
    const { width, height } = ratioDims(ratio, 1000);
    const svg = generateSVG(width, height, config, seed);
    if (kind === 'css' && svg.length > 250_000) return 'Este patrón es muy pesado para CSS: descárgalo como archivo';
    const ok = await copyText(kind === 'svg' ? svg : svgToCss(svg));
    return ok ? `Código ${kind.toUpperCase()} copiado` : 'No se pudo copiar';
  };

  return (
    <div className="min-h-screen bg-background text-text transition-colors duration-300">
      <Header theme={theme} onToggleTheme={toggleTheme} user={user}
        onLogin={email => setUser(simulateLogin(email))}
        onNavigateDashboard={onNavigateDashboard} onHome={onHome} onPlans={() => setShowPlans(true)} />

      <main className="grid grid-cols-1 lg:grid-cols-2">
        {/* Izquierda: lienzo */}
        <section className="px-4 sm:px-10 py-6 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xl uppercase mr-2">Ratio</span>
            {(Object.keys(RATIOS) as CanvasRatio[]).map(r => (
              <button key={r} onClick={() => { setRatio(r); setSeed(s => s + 1); }} aria-pressed={ratio === r}
                className={`h-11 px-4 rounded-lg border text-xl transition ${ratio === r ? 'bg-accent text-accent-text border-accent' : 'border-text/70 hover:border-accent'}`}>{r}</button>
            ))}
            <button
              onClick={() => {
                setPbrViewMode(prev => {
                  if (prev === 'color') return 'height';
                  if (prev === 'height') return 'normal';
                  if (prev === 'normal') return 'alpha';
                  return 'color';
                });
              }}
              title="Cambiar vista previa PBR (Color → Altura → Normales → Alpha)"
              className={`ml-auto h-11 px-8 rounded-lg border text-xl transition font-medium flex items-center gap-2 ${
                pbrViewMode !== 'color'
                  ? 'bg-accent text-accent-text border-accent'
                  : 'border-text/70 hover:border-accent text-text'
              }`}
            >
              {pbrViewMode === 'color' && '3D (Color)'}
              {pbrViewMode === 'height' && '3D (Altura)'}
              {pbrViewMode === 'normal' && '3D (Normales)'}
              {pbrViewMode === 'alpha' && '3D (Alpha)'}
            </button>
          </div>

          <EditorCanvas config={config} seed={seed} ratio={ratio} viewMode={pbrViewMode} />

          <EditorActions tier={tier} remaining={LOCKING_ENABLED ? getRemainingDownloads(tier, user.downloadsToday) : Infinity}
            onDownload={handleDownload} onLocked={askPro} onCopy={handleCopy} />
        </section>

        {/* Derecha: controles */}
        <section className="px-4 sm:px-10 py-6 lg:border-l lg:border-border">
          <EditorPanel title={title} config={config} maxColors={maxColors} saved={justSaved}
            onChange={setConfig} onPalette={setPalette}
            onColorLimit={() => askPro(`más de ${maxColors} colores`)}
            onRandom={handleRandom} onReset={handleReset} onSave={handleSave} />
        </section>
      </main>

      {/* BEGIN AADS AD UNIT 2461364 */}
      <div id="frame" className="mt-8" style={{ width: '100%', margin: 'auto', position: 'relative', zIndex: 99998 }}>
        <iframe data-aa='2461364' src='//acceptable.a-ads.com/2461364/?size=Adaptive'
          style={{ border: 0, padding: 0, width: '70%', height: 'auto', overflow: 'hidden', display: 'block', margin: 'auto' }}></iframe>
      </div>
      {/* END AADS AD UNIT 2461364 */}

      <UpsellModal isOpen={showUpsell} onClose={() => setShowUpsell(false)} feature={upsellFeature}
        onUpgrade={() => { setUser(prev => simulatePremiumUpgrade(prev)); setShowUpsell(false); }} currentTier={user.tier} />
      <PricingModal isOpen={showPlans} onClose={() => setShowPlans(false)}
        onUpgrade={() => { setUser(prev => simulatePremiumUpgrade(prev)); setShowPlans(false); }} currentTier={user.tier} />
    </div>
  );
}
