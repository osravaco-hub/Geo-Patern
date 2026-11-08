import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { PatternConfig, defaultConfig, PATTERN_DEFINITIONS, PatternId } from '../lib/patterns';
import { LOCKING_ENABLED, UserState, getDefaultUser, simulateLogin, simulatePremiumUpgrade, recordDownload } from '../lib/userTier';
import PatternCanvas from '../components/PatternCanvas';
import ExportButton from '../components/ExportButton';
import Header from '../components/Header';
import PatternSelectorNew from '../components/PatternSelectorNew';
import ColorSelectors from '../components/ColorSelectors';
import DynamicParams from '../components/DynamicParams';
import ActionButtons from '../components/ActionButtons';
import RatioSelector from '../components/RatioSelector';
import UpsellModal from '../components/UpsellModal';

interface GeneratorProps {
  initialPattern?: PatternId;
  onHome?: () => void;
  onNavigateDashboard: () => void;
}

export default function Generator({ initialPattern, onHome, onNavigateDashboard }: GeneratorProps) {
  const { theme, toggleTheme } = useTheme();
  const [config, setConfig] = useState<PatternConfig>({ ...defaultConfig, type: initialPattern ?? defaultConfig.type });
  const [seed, setSeed] = useState(42);
  const [user, setUser] = useState<UserState>(getDefaultUser());
  const [showUpsell, setShowUpsell] = useState(false);
  const [upsellFeature, setUpsellFeature] = useState('');
  const [isLiteAccess, setIsLiteAccess] = useState(false);
  const [canvasRatio, setCanvasRatio] = useState<'1:1' | '16:9' | '4:3' | '9:16'>('1:1');
  const [activePlanTab, setActivePlanTab] = useState<'free' | 'lite' | 'premium'>('free');

  // Regenerar patrón cuando cambia el ratio
  useEffect(() => {
    setSeed(prev => prev + 1);
  }, [canvasRatio]);

  const handleRandomize = useCallback(() => {
    setSeed(Math.floor(Math.random() * 100000));
    setConfig(prev => ({
      ...prev,
      density: Math.floor(Math.random() * 100),
      rotation: Math.floor(Math.random() * 360 / 5) * 5,
      scale: Math.round((0.5 + Math.random() * 1.5) * 10) / 10,
    }));
  }, []);

  const handleReset = useCallback(() => {
    setConfig({ ...defaultConfig, type: initialPattern ?? defaultConfig.type });
    setSeed(42);
  }, []);

  const handleDownload = useCallback(() => {
    setUser(prev => recordDownload(prev));
  }, []);

  const handleUpgrade = useCallback(() => {
    if (isLiteAccess) {
      // Para Lite, cerrar el modal de upsell y abrir el modal de autenticación
      setShowUpsell(false);
      // El modal de autenticación se abrirá desde el Header
      // Por ahora, simulamos el login directamente
      setUser(simulateLogin('usuario@ejemplo.com'));
      setActivePlanTab('lite');
    } else {
      // Para Premium, simular el pago
      setUser(prev => simulatePremiumUpgrade(prev));
      setShowUpsell(false);
      setActivePlanTab('premium');
    }
  }, [isLiteAccess]);

  const handleLogin = useCallback((email: string) => {
    setUser(simulateLogin(email));
  }, []);

  const handlePlanTabClick = (plan: 'free' | 'lite' | 'premium') => {
    const planOrder = { free: 0, lite: 1, premium: 2 };
    const userOrder = { guest: 0, free: 1, premium: 2 };
    
    if (planOrder[plan] > userOrder[user.tier]) {
      if (plan === 'lite') {
        setUpsellFeature('el plan Lite');
        setIsLiteAccess(true);
      } else if (plan === 'premium') {
        setUpsellFeature('el plan Premium ($3.99/mes)');
        setIsLiteAccess(false);
      }
      setShowUpsell(true);
    } else {
      setActivePlanTab(plan);
    }
  };

  const handlePatternSelect = (patternId: PatternId) => {
    const pattern = PATTERN_DEFINITIONS.find(p => p.id === patternId);
    if (!pattern) return;

    const planOrder = { 'ultra-basic': 0, 'basic': 1, 'advanced': 2 };
    const userOrder = { guest: 0, free: 1, premium: 2 };
    
    if (LOCKING_ENABLED && planOrder[pattern.tier] > userOrder[user.tier]) {
      setUpsellFeature(`el patrón "${pattern.label}"`);
      setShowUpsell(true);
      return;
    }

    setConfig(prev => ({ ...prev, type: patternId }));
  };

  // Calculate canvas dimensions based on ratio
  const getCanvasDimensions = () => {
    const baseSize = 600;
    switch (canvasRatio) {
      case '1:1': return { width: baseSize, height: baseSize };
      case '16:9': return { width: baseSize, height: Math.round(baseSize * 9 / 16) };
      case '4:3': return { width: baseSize, height: Math.round(baseSize * 3 / 4) };
      case '9:16': return { width: Math.round(baseSize * 9 / 16), height: baseSize };
      default: return { width: baseSize, height: baseSize };
    }
  };

  const canvasDims = getCanvasDimensions();
  const effectiveTier = LOCKING_ENABLED ? user.tier : 'premium';

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        user={user}
        onLogin={handleLogin}
        onNavigateDashboard={onNavigateDashboard}
        onHome={onHome}
        onPlans={() => { setUpsellFeature('el plan Pro'); setIsLiteAccess(false); setShowUpsell(true); }}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column: Canvas */}
          <div className="lg:col-span-7 space-y-4">
            {/* Ratio Selector */}
            <RatioSelector
              ratio={canvasRatio}
              onChange={setCanvasRatio}
            />

            {/* Canvas Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <PatternCanvas
                config={config}
                seed={seed}
                tier={effectiveTier}
                width={canvasDims.width}
                height={canvasDims.height}
                onLockedClick={() => {
                  setUpsellFeature('este patrón');
                  setShowUpsell(true);
                }}
              />
            </motion.div>

            {/* Download Button */}
            <ExportButton
              config={config}
              seed={seed}
              tier={effectiveTier}
              downloadsToday={user.downloadsToday}
              onDownload={handleDownload}
              onPremiumClick={() => {
                setUpsellFeature('descargas premium');
                setShowUpsell(true);
              }}
            />
          </div>

          {/* Right Column: Controls */}
          <div className="lg:col-span-5 lg:border-l lg:border-border lg:pl-8 space-y-6">
            {/* Pattern Selector */}
            <PatternSelectorNew
              selected={config.type}
              onSelect={handlePatternSelect}
            />

            {/* Color Selectors */}
            <ColorSelectors
              patternColor={config.color}
              fillColor={config.fillColor}
              onPatternColorChange={(color) => setConfig(prev => ({ ...prev, color }))}
              onFillColorChange={(fillColor) => setConfig(prev => ({ ...prev, fillColor }))}
            />

            {/* Dynamic Parameters */}
            <DynamicParams
              config={config}
              onChange={setConfig}
            />

            {/* Action Buttons */}
            <ActionButtons
              config={config}
              onChange={setConfig}
              onRandomize={handleRandomize}
              onReset={handleReset}
              tier={effectiveTier}
              onPremiumClick={() => {
                setUpsellFeature('esta función premium');
                setShowUpsell(true);
              }}
            />
          </div>
        </div>

        {/* BEGIN AADS AD UNIT 2461364 */}
        <div id="frame" className="mt-8" style={{ width: '100%', margin: 'auto', position: 'relative', zIndex: 99998 }}>
          <iframe data-aa='2461364' src='//acceptable.a-ads.com/2461364/?size=Adaptive'
            style={{ border: 0, padding: 0, width: '70%', height: 'auto', overflow: 'hidden', display: 'block', margin: 'auto' }}></iframe>
        </div>
        {/* END AADS AD UNIT 2461364 */}

      </main>

      {/* Upsell Modal */}
      <UpsellModal
        isOpen={showUpsell}
        onClose={() => setShowUpsell(false)}
        feature={upsellFeature}
        onUpgrade={handleUpgrade}
        currentTier={user.tier}
        isLiteAccess={isLiteAccess}
      />
    </div>
  );
}
