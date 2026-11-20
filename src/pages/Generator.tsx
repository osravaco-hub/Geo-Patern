import { useState, useCallback } from 'react';
import { useTheme } from '../hooks/useTheme';
import { PatternConfig, defaultConfig, PatternId, PATTERN_DEFINITIONS, generateSVG } from '../lib/patterns';
import {
  LOCKING_ENABLED, MAX_PALETTE_COLORS, getUserTier, canDownload,
  getRemainingDownloads, recordDownload,
} from '../lib/userTier';
import { CanvasRatio, ExportFormat, ExportResolution, RATIOS, exportPattern, triggerDownload, ratioDims, svgToCss, copyText } from '../lib/export';
import { getPatternParams, randomizeExtras } from '../lib/patternParams';
import { SavedPattern, savePattern } from '../lib/savedPatterns';
import Header from '../components/Header';
import EditorCanvas from '../components/EditorCanvas';
import ViewModeMenu from '../components/ViewModeMenu';
import Footer from '../components/Footer';
import { PBRViewMode } from '../lib/pbrMaps';
import EditorPanel from '../components/EditorPanel';
import EditorActions from '../components/EditorActions';
import UpsellModal from '../components/UpsellModal';
import PricingModal from '../components/PricingModal';
import { useUserContext } from '../context/UserContext';

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
  const { user, registerDownload } = useUserContext();
  const startType = initialSaved?.config.type ?? initialPattern ?? defaultConfig.type;
  const [config, setConfig] = useState<PatternConfig>(initialSaved?.config ?? baseConfig(startType));
  const [seed, setSeed] = useState(initialSaved?.seed ?? 42);
  const [ratio, setRatio] = useState<CanvasRatio>(initialSaved?.ratio ?? '1:1');
  const [showUpsell, setShowUpsell] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [upsellFeature, setUpsellFeature] = useState('');
  const [justSaved, setJustSaved] = useState(false);
  const [pinMode, setPinMode] = useState(false);
  const [viewMode, setViewMode] = useState<PBRViewMode>('color');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [selPin, setSelPin] = useState<number | null>(null);

  const tier = LOCKING_ENABLED ? getUserTier(user) : 'pro';
  const maxColors = MAX_PALETTE_COLORS[tier];
  const title = PATTERN_DEFINITIONS.find(p => p.id === config.type)?.label ?? '';
  const askPro = useCallback((feature: string) => { setUpsellFeature(feature); setShowUpsell(true); }, []);

  const setPalette = (colors: string[]) => setConfig(p => ({ ...p, colors, color: colors[0] }));

  const handleRandom = () => {
    const keys = getPatternParams(config.type);
    setSeed(Math.floor(Math.random() * 100000));
    setConfig(p => ({
      ...p,
      params: randomizeExtras(config.type),
      ...(keys.includes('scale') && { scale: rand(0.6, 1.8, 0.1) }),
      ...(keys.includes('rotation') && { rotation: rand(0, 355, 5) }),
      ...(keys.includes('quantity') && { quantity: rand(40, 100, 5) }),
      ...(keys.includes('strokeWidth') && { strokeWidth: rand(1, 6, 0.5) }),
      ...(keys.includes('distortion') && { distortion: rand(10, 70) }),
    }));
  };

  const handleReset = () => { setConfig(baseConfig(config.type)); setSeed(42); setRatio('1:1'); setPinMode(false); setSelPin(null); };

  const handleSave = () => {
    const n = PATTERN_DEFINITIONS.find(p => p.id === config.type)?.label ?? 'Patrón';
    if (savePattern(`${n} · ${new Date().toLocaleDateString('es')}`, config, seed, ratio)) {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    }
  };

  const handleDownload = async (format: ExportFormat, resolution: ExportResolution) => {
    if (LOCKING_ENABLED && !canDownload(tier, user.downloadsToday)) return askPro('más descargas diarias');
    setNotice('');
    setBusy(true);
    await new Promise(r => setTimeout(r, 30));
    const res = await exportPattern({ config, format, resolution, ratio, seed, tier });
    setBusy(false);
    if (!res.success || !res.dataUrl || !res.filename) {
      if (res.error?.includes('Pro')) askPro('la resolución 4K');
      else { setNotice(res.error ?? 'No se pudo generar el archivo'); setTimeout(() => setNotice(''), 5000); }
      return;
    }
    triggerDownload(res.dataUrl, res.filename);
    registerDownload();
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
            <ViewModeMenu value={viewMode} onChange={setViewMode} />
          </div>

          <EditorCanvas config={config} seed={seed} ratio={ratio} viewMode={viewMode}
            pinMode={pinMode && config.type === 'halftoneDots'} selectedPin={selPin}
            onPinsChange={pins => setConfig(p => ({ ...p, pins }))} onSelectPin={setSelPin} />

          {config.type === 'halftoneDots' && viewMode === 'color' && (
            <div className="space-y-1">
              <button onClick={() => { setPinMode(m => !m); setSelPin(null); }} aria-pressed={pinMode}
                className={`w-full h-11 rounded-xl border text-lg transition ${pinMode ? 'bg-accent text-accent-text border-accent' : 'border-text/70 text-text hover:border-accent'}`}>
                {pinMode ? 'Pines activados · toca el lienzo' : `Colocar pines${(config.pins?.length ?? 0) > 0 ? ` (${config.pins!.length})` : ''}`}
              </button>
              {pinMode && <p className="text-sm text-text-secondary text-center">Toca para añadir un pin y arrastra para moverlo. Más ajustes en el panel.</p>}
            </div>
          )}

          {viewMode !== 'color' && (
            <p className="text-sm text-text-secondary text-center">
              Vista previa del mapa. Para descargarlo, elígelo en Descargar → Mapas.
            </p>
          )}

          <EditorActions tier={tier} remaining={LOCKING_ENABLED ? getRemainingDownloads(tier, user.downloadsToday) : Infinity}
            onDownload={handleDownload} onLocked={askPro} onCopy={handleCopy} notice={notice} busy={busy} />
        </section>

        {/* Derecha: controles */}
        <section className="px-4 sm:px-10 py-6 lg:border-l lg:border-border">
          <EditorPanel title={title} pinMode={pinMode} selectedPin={selPin} onPinMode={on => { setPinMode(on); if (!on) setSelPin(null); }} config={config} maxColors={maxColors} saved={justSaved}
            onChange={setConfig} onPalette={setPalette}
            onColorLimit={() => askPro(`más de ${maxColors} colores`)}
            onRandom={handleRandom} onReset={handleReset} onSave={handleSave} />
        </section>
      </main>

      <Footer />

      {/* BEGIN AADS AD UNIT 2462390 */}
      <div id="frame" className="mt-8" style={{ width: '100%', margin: 'auto', position: 'relative', zIndex: 1 }}>
        <iframe data-aa='2462390' src='//acceptable.a-ads.com/2462390/?size=Adaptive'
          style={{ border: 0, padding: 0, width: '70%', height: 'auto', overflow: 'hidden', display: 'block', margin: 'auto' }}></iframe>
      </div>
      {/* END AADS AD UNIT 2462390 */}

      <UpsellModal isOpen={showUpsell} onClose={() => setShowUpsell(false)} feature={upsellFeature}
        onUpgrade={() => { setShowUpsell(false); setShowPlans(true); }} currentTier={user.tier} />
      <PricingModal isOpen={showPlans} onClose={() => setShowPlans(false)} currentTier={user.tier} />
    </div>
  );
}
