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
import FeedbackModal from '../components/FeedbackModal';
import { PBRViewMode } from '../lib/pbrMaps';
import EditorPanel from '../components/EditorPanel';
import EditorActions from '../components/EditorActions';
import UpsellModal from '../components/UpsellModal';
import PricingModal from '../components/PricingModal';
import { useUserContext } from '../context/UserContext';
import { useI18n } from '../i18n';
import { useMobileScrollHide } from '../hooks/useMobileScrollHide';

interface GeneratorProps {
  initialPattern?: PatternId;
  initialSaved?: SavedPattern | null;
  onHome?: () => void;
  onNavigateDashboard: () => void;
}

const baseConfig = (type: PatternId): PatternConfig => ({ ...defaultConfig, type });
const rand = (min: number, max: number, step = 1) => Math.round((min + Math.random() * (max - min)) / step) * step;

export default function Generator({ initialPattern, initialSaved, onHome, onNavigateDashboard }: GeneratorProps) {
  const { t, locale } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { user, registerDownload } = useUserContext();
  const isHeaderHidden = useMobileScrollHide();
  const startType = initialSaved?.config.type ?? initialPattern ?? defaultConfig.type;
  const [config, setConfig] = useState<PatternConfig>(initialSaved?.config ?? baseConfig(startType));
  const [seed, setSeed] = useState(initialSaved?.seed ?? 42);
  const [ratio, setRatio] = useState<CanvasRatio>(initialSaved?.ratio ?? '1:1');
  const [showUpsell, setShowUpsell] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [upsellFeature, setUpsellFeature] = useState('');
  const [justSaved, setJustSaved] = useState(false);
  const [pinMode, setPinMode] = useState(false);
  const [viewMode, setViewMode] = useState<PBRViewMode>('color');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [selPin, setSelPin] = useState<number | null>(null);

  const tier = LOCKING_ENABLED ? getUserTier(user) : 'pro';
  const maxColors = MAX_PALETTE_COLORS[tier];
  const title = t(`pattern.${config.type}` as const);
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
    const n = t(`pattern.${config.type}` as const);
    if (savePattern(`${n} · ${new Date().toLocaleDateString(locale)}`, config, seed, ratio)) {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    }
  };

  const handleDownload = async (format: ExportFormat, resolution: ExportResolution) => {
    if (LOCKING_ENABLED && !canDownload(tier, user.downloadsToday)) return askPro(t('gen.moreDownloads'));
    setNotice('');
    setBusy(true);
    await new Promise(r => setTimeout(r, 30));
    const res = await exportPattern({ config, format, resolution, ratio, seed, tier });
    setBusy(false);
    if (!res.success || !res.dataUrl || !res.filename) {
      if (res.errorCode === 'pro_only') askPro(t('gen.res4k'));
      else { setNotice(t('gen.exportFail')); setTimeout(() => setNotice(''), 5000); }
      return;
    }
    triggerDownload(res.dataUrl, res.filename);
    registerDownload();
  };

  const handleCopy = async (kind: 'svg' | 'css'): Promise<string> => {
    const { width, height } = ratioDims(ratio, 1000);
    const svg = generateSVG(width, height, config, seed);
    if (kind === 'css' && svg.length > 250_000) return t('gen.cssTooHeavy');
    const ok = await copyText(kind === 'svg' ? svg : svgToCss(svg));
    return ok ? t('gen.copied', { kind: kind.toUpperCase() }) : t('gen.copyFail');
  };

  return (
    <div className="min-h-screen bg-background text-text transition-colors duration-300">
      <Header theme={theme} onToggleTheme={toggleTheme} user={user}
        onNavigateDashboard={onNavigateDashboard} onHome={onHome} onPlans={() => setShowPlans(true)} isHidden={isHeaderHidden} />

      <main className="grid grid-cols-1 lg:grid-cols-2 items-start relative">
        {/* Canvas fijo en móvil (fixed cuando header oculto, sticky en desktop) - FUERA del flujo normal */}
        <div className="hidden lg:block lg:sticky lg:top-[76px] lg:max-h-[calc(100vh-90px)] lg:overflow-y-auto lg:py-4 lg:px-4 lg:sm:px-10 lg:space-y-5">
          {/* Canvas y elementos siempre visibles en desktop */}
          <div className="sticky top-[76px] z-20 bg-background/95 backdrop-blur-md shadow-md lg:shadow-none lg:bg-transparent lg:backdrop-blur-none py-2 lg:py-0">
            <EditorCanvas config={config} seed={seed} ratio={ratio} viewMode={viewMode}
              pinMode={pinMode && config.type === 'halftoneDots'} selectedPin={selPin}
              onPinsChange={pins => setConfig(p => ({ ...p, pins }))} onSelectPin={setSelPin} />
          </div>
          
          {config.type === 'halftoneDots' && viewMode === 'color' && (
            <div className="space-y-1">
              <button onClick={() => { setPinMode(m => !m); setSelPin(null); }} aria-pressed={pinMode}
                className={`w-full h-11 rounded-xl border text-lg transition ${pinMode ? 'bg-accent text-accent-text border-accent' : 'border-text/70 text-text hover:border-accent'}`}>
                {pinMode ? t('gen.pinsActive') : (config.pins?.length ?? 0) > 0 ? t('gen.pinsCount', { n: config.pins!.length }) : t('gen.pins')}
              </button>
              {pinMode && <p className="text-sm text-text-secondary text-center">{t('gen.pinsHint')}</p>}
            </div>
          )}
          
          {viewMode !== 'color' && (
            <p className="text-sm text-text-secondary text-center">
              {t('gen.mapPreview')}
            </p>
          )}
        </div>

        {/* Móvil: Canvas fijo con fixed positioning cuando header oculto */}
        <div className="lg:hidden relative">
          {/* Barra de controles que se oculta en scroll */}
          <div className={`flex flex-wrap items-center gap-2 mb-4 transition-all duration-300 ease-out ${isHeaderHidden ? '-translate-y-full opacity-0 pointer-events-none h-0 mb-0 overflow-hidden' : 'translate-y-0 opacity-100'}`}>
            <span className="text-2xl uppercase mr-2">{t('gen.ratio')}</span>
            {(Object.keys(RATIOS) as CanvasRatio[]).map(r => (
              <button key={r} onClick={() => { setRatio(r); setSeed(s => s + 1); }} aria-pressed={ratio === r}
                className={`h-11 px-4 rounded-lg border text-xl transition ${ratio === r ? 'bg-accent text-accent-text border-accent' : 'border-text/70 hover:border-accent'}`}>{r}</button>
            ))}
            <ViewModeMenu value={viewMode} onChange={setViewMode} />
          </div>

          {/* Canvas fixed en móvil cuando header oculto, sticky cuando visible */}
          <div className={`transition-all duration-300 ${isHeaderHidden ? 'fixed top-0 left-0 right-0 z-20 bg-background/95 backdrop-blur-md shadow-md' : 'sticky top-[60px] z-20 bg-background/95 backdrop-blur-md shadow-md'}`}>
            <EditorCanvas config={config} seed={seed} ratio={ratio} viewMode={viewMode}
              pinMode={pinMode && config.type === 'halftoneDots'} selectedPin={selPin}
              onPinsChange={pins => setConfig(p => ({ ...p, pins }))} onSelectPin={setSelPin} />
          </div>
        </div>

        {/* Panel de controles derecho - siempre visible */}
        <section className="px-4 sm:px-10 py-6 lg:border-l lg:border-border lg:col-span-1">
          <EditorPanel title={title} pinMode={pinMode} selectedPin={selPin} onPinMode={on => { setPinMode(on); if (!on) setSelPin(null); }} config={config} maxColors={maxColors} saved={justSaved}
            onChange={setConfig} onPalette={setPalette}
            onColorLimit={() => askPro(t('gen.moreColors', { n: maxColors }))}
            onRandom={handleRandom} onReset={handleReset} onSave={handleSave} />
        </section>

        {/* Derecha: controles */}
        <section className="px-4 sm:px-10 py-6 lg:border-l lg:border-border">
          <EditorPanel title={title} pinMode={pinMode} selectedPin={selPin} onPinMode={on => { setPinMode(on); if (!on) setSelPin(null); }} config={config} maxColors={maxColors} saved={justSaved}
            onChange={setConfig} onPalette={setPalette}
            onColorLimit={() => askPro(t('gen.moreColors', { n: maxColors }))}
            onRandom={handleRandom} onReset={handleReset} onSave={handleSave} />
        </section>
      </main>

      {/* Acciones de exportación / descarga centradas antes del anuncio */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 border-t border-border mt-6">
        <EditorActions tier={tier} remaining={LOCKING_ENABLED ? getRemainingDownloads(tier, user.downloadsToday) : Infinity}
          onDownload={handleDownload} onLocked={askPro} onCopy={handleCopy} notice={notice} busy={busy} />
      </section>

      {/* BEGIN NEW AD UNIT */}
      <div className="mt-8 flex justify-center">
        <script data-cfasync="false" src="https://bauval.org/14/06c5994d09a3cd4574d712959245f41e"></script>
      </div>
      {/* END NEW AD UNIT */}

      <Footer onOpenFeedback={() => setFeedbackOpen(true)} />
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />


      <UpsellModal isOpen={showUpsell} onClose={() => setShowUpsell(false)} feature={upsellFeature}
        onUpgrade={() => { setShowUpsell(false); setShowPlans(true); }} currentTier={user.tier} />
      <PricingModal isOpen={showPlans} onClose={() => setShowPlans(false)} currentTier={user.tier} />
    </div>
  );
}
