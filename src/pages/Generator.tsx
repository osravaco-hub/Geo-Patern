import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { PatternConfig, defaultConfig, PATTERN_DEFINITIONS, PatternId } from '../lib/patterns';
import { UserState, getDefaultUser, simulateLogin, simulatePremiumUpgrade, recordDownload } from '../lib/userTier';
import PatternCanvas from '../components/PatternCanvas';
import ExportButton from '../components/ExportButton';
import Header from '../components/Header';
import PlanTabs from '../components/PlanTabs';
import PatternSelectorNew from '../components/PatternSelectorNew';
import ColorSelectors from '../components/ColorSelectors';
import DynamicParams from '../components/DynamicParams';
import ActionButtons from '../components/ActionButtons';
import RatioSelector from '../components/RatioSelector';
import UpsellModal from '../components/UpsellModal';

interface GeneratorProps {
  onNavigateDashboard: () => void;
}

export default function Generator({ onNavigateDashboard }: GeneratorProps) {
  const { theme, toggleTheme } = useTheme();
  const [config, setConfig] = useState<PatternConfig>(defaultConfig);
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
    setConfig(defaultConfig);
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
    
    if (planOrder[pattern.tier] > userOrder[user.tier]) {
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

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        user={user}
        onLogin={handleLogin}
        onNavigateDashboard={onNavigateDashboard}
      />

      {/* Plan Tabs */}
      <PlanTabs
        activePlan={activePlanTab}
        userTier={user.tier}
        onPlanClick={handlePlanTabClick}
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
                tier={user.tier}
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
              tier={user.tier}
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
              activePlanTab={activePlanTab}
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
              tier={user.tier}
              onPremiumClick={() => {
                setUpsellFeature('esta función premium');
                setShowUpsell(true);
              }}
            />
          </div>
        </div>
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
