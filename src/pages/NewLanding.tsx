import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Download, 
  Palette, 
  MousePointer, 
  Crown, 
  Check, 
  ChevronDown,
  ExternalLink,
  Coffee,
  LogIn,
  Menu,
  X
} from 'lucide-react';
import PatternCanvas from '../components/PatternCanvas';
import PricingModal from '../components/PricingModal';
import { PatternConfig, defaultConfig, PATTERN_DEFINITIONS } from '../lib/patterns';
import { UserState, getDefaultUser, simulateLogin, simulatePremiumUpgrade } from '../lib/userTier';
import { createCheckoutSession, getSubscriptionPrice, calculateYearlySavings } from '../lib/stripe';

interface NewLandingProps {
  onNavigateGenerator: () => void;
  onNavigateDashboard: () => void;
}

export default function NewLanding({ onNavigateGenerator, onNavigateDashboard }: NewLandingProps) {
  const [user, setUser] = useState<UserState>(getDefaultUser());
  const [showPricing, setShowPricing] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [demoConfig, setDemoConfig] = useState<PatternConfig>({
    ...defaultConfig,
    type: 'concentricCircles',
  });
  const [demoSeed, setDemoSeed] = useState(42);

  const handleUpgrade = async () => {
    if (!user.isLoggedIn) {
      setShowPricing(false);
      setShowAuth(true);
      return;
    }

    // Simulate Stripe checkout
    try {
      const session = await createCheckoutSession(
        'user-id',
        user.email || 'user@example.com',
        'month'
      );
      
      // In production, redirect to Stripe
      // window.location.href = session.url;
      
      // For demo, just upgrade the user
      setUser(simulatePremiumUpgrade(user));
      setShowPricing(false);
      
      alert('✅ ¡Suscripción completada! (Demo)\n\nEn producción, serías redirigido a Stripe Checkout.');
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  const handleLogin = (email: string) => {
    setUser(simulateLogin(email));
    setShowAuth(false);
  };

  const cycleDemoPattern = () => {
    const basicPatterns = PATTERN_DEFINITIONS.filter(p => p.tier === 'ultra-basic');
    const currentIndex = basicPatterns.findIndex(p => p.id === demoConfig.type);
    const nextIndex = (currentIndex + 1) % basicPatterns.length;
    setDemoConfig({ ...demoConfig, type: basicPatterns[nextIndex].id });
    setDemoSeed(Math.floor(Math.random() * 100000));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-premium flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold font-[family-name:var(--font-display)]">
              GeoPattern
            </h1>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#como-funciona" className="text-sm text-text/60 hover:text-accent transition-colors">
              Cómo Funciona
            </a>
            <a href="#planes" className="text-sm text-text/60 hover:text-accent transition-colors">
              Precios
            </a>
            <a href="#faq" className="text-sm text-text/60 hover:text-accent transition-colors">
              FAQ
            </a>
            {user.isLoggedIn ? (
              <button
                onClick={onNavigateDashboard}
                className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-all"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="px-4 py-2 bg-white text-text text-sm font-medium rounded-lg border border-border hover:border-accent/30 transition-all flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Iniciar Sesión
              </button>
            )}
          </nav>

          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-border/50"
          >
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenu && (
          <div className="md:hidden border-t border-border bg-white p-4 space-y-3">
            <a href="#como-funciona" className="block text-sm text-text/60 py-2">Cómo Funciona</a>
            <a href="#planes" className="block text-sm text-text/60 py-2">Precios</a>
            <a href="#faq" className="block text-sm text-text/60 py-2">FAQ</a>
            {user.isLoggedIn ? (
              <button
                onClick={() => { onNavigateDashboard(); setMobileMenu(false); }}
                className="block w-full text-center px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => { setShowAuth(true); setMobileMenu(false); }}
                className="block w-full text-center px-4 py-2 bg-white text-text text-sm font-medium rounded-lg border border-border"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        )}
      </header>

      {/* 1. HERO SECTION */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 animate-pulse">
            <PatternCanvas
              config={{ ...defaultConfig, type: 'concentricCircles', density: 30 }}
              seed={123}
              tier="guest"
              width={800}
              height={800}
            />
          </div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl sm:text-6xl font-bold text-text mb-6 font-[family-name:var(--font-display)] leading-tight">
              Generador de Patrones Geométricos
            </h2>
            <p className="text-xl text-text/60 mb-8 max-w-2xl mx-auto font-[family-name:var(--font-body)]">
              Crea patrones únicos y elegantes en segundos
            </p>
            <button
              onClick={onNavigateGenerator}
              className="px-8 py-4 bg-accent text-white text-lg font-semibold rounded-xl hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 hover:scale-105"
            >
              Crear mi primer patrón gratis
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. DEMO INTERACTIVA */}
      <section className="py-16 px-4 bg-white border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-2 font-[family-name:var(--font-display)]">
              Prueba sin registro
            </h3>
            <p className="text-text/60">Experimenta con nuestros patrones básicos</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="flex justify-center">
              <div className="relative">
                <PatternCanvas
                  config={demoConfig}
                  seed={demoSeed}
                  tier="guest"
                  width={400}
                  height={400}
                />
                <button
                  onClick={cycleDemoPattern}
                  className="absolute bottom-4 right-4 px-4 py-2 bg-white/90 backdrop-blur-sm text-accent text-sm font-medium rounded-lg border border-accent/20 hover:bg-accent hover:text-white transition-all"
                >
                  Cambiar patrón
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-background rounded-xl p-6 border border-border">
                <h4 className="font-semibold mb-3">Controles básicos</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-text/60 mb-1 block">Densidad</label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={demoConfig.density}
                      onChange={(e) => setDemoConfig({ ...demoConfig, density: parseInt(e.target.value) })}
                      className="w-full accent-accent"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-text/60 mb-1 block">Rotación</label>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      value={demoConfig.rotation}
                      onChange={(e) => setDemoConfig({ ...demoConfig, rotation: parseInt(e.target.value) })}
                      className="w-full accent-accent"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowPricing(true)}
                className="w-full px-6 py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent/90 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Descargar patrón
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CÓMO FUNCIONA */}
      <section id="como-funciona" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 font-[family-name:var(--font-display)]">
            Cómo Funciona
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              icon={<MousePointer className="w-8 h-8" />}
              title="Elige tu patrón"
              description="Selecciona entre 12 patrones geométricos únicos"
              step={1}
            />
            <StepCard
              icon={<Palette className="w-8 h-8" />}
              title="Personaliza colores y densidad"
              description="Ajusta colores, densidad, rotación y escala"
              step={2}
            />
            <StepCard
              icon={<Download className="w-8 h-8" />}
              title="Descarga en PNG o SVG"
              description="Exporta en múltiples resoluciones sin marca de agua"
              step={3}
            />
          </div>
        </div>
      </section>

      {/* 4. SECCIÓN DE PLANES */}
      <section id="planes" className="py-20 px-4 bg-white border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-4 font-[family-name:var(--font-display)]">
            Elige tu Plan
          </h3>
          <p className="text-center text-text/60 mb-12">
            Comienza gratis, actualiza cuando necesites más
          </p>

          {/* Grid: 1 col mobile, 3 cols desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* GUEST */}
            <PlanCard
              name="Invitado"
              price="Gratis"
              features={[
                'Descargas ilimitadas',
                '3 patrones ultra-básicos',
                'PNG + SVG sin marca de agua',
                'Resolución 1000px',
              ]}
              cta="Comenzar Ahora"
              onCta={onNavigateGenerator}
              highlighted={false}
            />

            {/* FREE */}
            <PlanCard
              name="Free"
              price="Gratis"
              features={[
                '3 descargas/semana',
                '8 patrones básicos',
                'PNG + SVG sin marca de agua',
                'Resolución 1000px',
              ]}
              cta="Registrarse con Google"
              onCta={() => setShowAuth(true)}
              highlighted={false}
            />

            {/* PREMIUM */}
            <PlanCard
              name="Premium"
              price={getSubscriptionPrice('month').formatted}
              subtitle={calculateYearlySavings().savingsPercentage + '% ahorro anual'}
              features={[
                'Descargas ilimitadas',
                '12 patrones (8 básicos + 4 avanzados)',
                'PNG + SVG sin marca de agua',
                'Resolución hasta 3000px',
                'Aleatorizar colores con paletas curadas',
                'Fondo transparente',
                'Pack de 50 patrones prediseñados',
                'Historial de descargas',
              ]}
              cta="Suscribirse"
              onCta={handleUpgrade}
              highlighted={true}
            />
          </div>
        </div>
      </section>

      {/* 5. GALERÍA DE EJEMPLOS */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 font-[family-name:var(--font-display)]">
            Galería de Ejemplos
          </h3>

          {/* Grid: 2 cols mobile, 3 cols tablet, 4 cols desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {PATTERN_DEFINITIONS.map((pattern, idx) => (
              <div
                key={pattern.id}
                className="relative group cursor-pointer"
                onClick={() => {
                  if (pattern.tier === 'advanced') {
                    setShowPricing(true);
                  } else {
                    onNavigateGenerator();
                  }
                }}
              >
                <div className="aspect-square rounded-xl overflow-hidden border border-border hover:scale-105 transition-transform duration-200 shadow-sm">
                  <PatternCanvas
                    config={{ ...defaultConfig, type: pattern.id }}
                    seed={idx * 100}
                    tier={user.tier}
                    width={300}
                    height={300}
                  />
                </div>
                <div className="mt-2 text-center">
                  <p className="text-xs md:text-sm font-medium truncate">{pattern.label}</p>
                  {pattern.tier === 'advanced' && (
                    <span className="text-xs text-premium font-medium">Premium</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SECCIÓN DE AFILIADOS */}
      <section className="py-16 px-4 bg-white border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8 font-[family-name:var(--font-display)]">
            Herramientas que Recomendamos
          </h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AffiliateCard
              name="Canva"
              description="Diseño gráfico online"
              url="https://canva.com"
              color="#00C4CC"
            />
            <AffiliateCard
              name="Adobe Creative Cloud"
              description="Suite profesional de diseño"
              url="https://adobe.com"
              color="#FF0000"
            />
            <AffiliateCard
              name="Unsplash"
              description="Fotos gratuitas de alta calidad"
              url="https://unsplash.com"
              color="#111111"
            />
            <AffiliateCard
              name="Figma"
              description="Diseño colaborativo"
              url="https://figma.com"
              color="#A259FF"
            />
          </div>
        </div>
      </section>

      {/* 7. SECCIÓN DE DONACIONES */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Coffee className="w-12 h-12 text-accent mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2 font-[family-name:var(--font-display)]">
            ¿Te gusta GeoPattern?
          </h3>
          <p className="text-text/60 mb-6">
            Apoya el proyecto con una donación
          </p>
          <a
            href="https://buymeacoffee.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent/90 transition-all"
          >
            <Coffee className="w-5 h-5" />
            Buy Me a Coffee
          </a>
        </div>
      </section>

      {/* 8. FAQ */}
      <section id="faq" className="py-20 px-4 bg-white border-t border-border">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 font-[family-name:var(--font-display)]">
            Preguntas Frecuentes
          </h3>

          <div className="space-y-3">
            <FaqItem
              question="¿Puedo usar los patrones comercialmente?"
              answer="Sí, todos los patrones generados son de tu propiedad y puedes usarlos para proyectos comerciales sin restricciones."
              isOpen={openFaq === 0}
              onToggle={() => setOpenFaq(openFaq === 0 ? null : 0)}
            />
            <FaqItem
              question="¿Cómo cancelo mi suscripción?"
              answer="Puedes cancelar tu suscripción en cualquier momento desde el panel de control de Stripe o contactando a nuestro soporte. No hay compromisos a largo plazo."
              isOpen={openFaq === 1}
              onToggle={() => setOpenFaq(openFaq === 1 ? null : 1)}
            />
            <FaqItem
              question="¿Qué formatos de archivo están disponibles?"
              answer="Ofrecemos PNG en múltiples resoluciones (1000px, 2000px, 3000px) y SVG vectorial escalable. Todos los archivos son sin marca de agua."
              isOpen={openFaq === 2}
              onToggle={() => setOpenFaq(openFaq === 2 ? null : 2)}
            />
            <FaqItem
              question="¿Puedo cambiar de plan en cualquier momento?"
              answer="Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se aplican inmediatamente y se prorratea el costo."
              isOpen={openFaq === 3}
              onToggle={() => setOpenFaq(openFaq === 3 ? null : 3)}
            />
            <FaqItem
              question="¿Los patrones son únicos?"
              answer="Cada patrón se genera con parámetros únicos (semilla aleatoria), por lo que es muy probable que tu diseño sea único. Sin embargo, teóricamente podrían generarse patrones similares."
              isOpen={openFaq === 4}
              onToggle={() => setOpenFaq(openFaq === 4 ? null : 4)}
            />
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-accent to-premium flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-semibold">GeoPattern</span>
            </div>

            <nav className="flex items-center gap-6 text-sm text-text/60">
              <a href="#" className="hover:text-accent transition-colors">Inicio</a>
              <a href="#planes" className="hover:text-accent transition-colors">Precios</a>
              <a href="#faq" className="hover:text-accent transition-colors">FAQ</a>
              <a href="mailto:contact@geopattern.app" className="hover:text-accent transition-colors">Contacto</a>
            </nav>

            <p className="text-xs text-text/40">
              © 2024 GeoPattern. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        onUpgrade={handleUpgrade}
        currentTier={user.tier}
        onLogin={() => {
          setShowPricing(false);
          setShowAuth(true);
        }}
      />

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLogin={handleLogin}
        />
      )}
    </div>
  );
}

// ─── Helper Components ────────────────────────────────────

function StepCard({ icon, title, description, step }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  step: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: step * 0.1 }}
      className="text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-accent-light flex items-center justify-center mx-auto mb-4 text-accent">
        {icon}
      </div>
      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent text-white text-xs font-bold mb-2">
        {step}
      </div>
      <h4 className="font-semibold text-lg mb-2">{title}</h4>
      <p className="text-sm text-text/60">{description}</p>
    </motion.div>
  );
}

function PlanCard({ name, price, subtitle, features, cta, onCta, highlighted }: {
  name: string;
  price: string;
  subtitle?: string;
  features: string[];
  cta: string;
  onCta: () => void;
  highlighted: boolean;
}) {
  return (
    <div className={`rounded-2xl p-6 border-2 transition-all ${
      highlighted
        ? 'border-premium bg-gradient-to-br from-premium/5 to-accent/5 shadow-xl scale-105'
        : 'border-border bg-white hover:border-accent/30'
    }`}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-premium text-white text-xs font-semibold rounded-full flex items-center gap-1">
          <Crown className="w-3 h-3" />
          Recomendado
        </div>
      )}

      <div className="text-center mb-6">
        <h4 className="text-xl font-bold mb-2">{name}</h4>
        <div className="text-3xl font-bold text-text">{price}</div>
        {subtitle && (
          <div className="text-sm text-premium font-medium mt-1">{subtitle}</div>
        )}
      </div>

      <ul className="space-y-3 mb-6">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm">
            <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
            <span className="text-text/70">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onCta}
        className={`w-full py-3 font-medium rounded-xl transition-all ${
          highlighted
            ? 'bg-gradient-to-r from-premium to-accent text-white hover:opacity-90 shadow-lg shadow-premium/20'
            : 'bg-accent text-white hover:bg-accent/90'
        }`}
      >
        {cta}
      </button>
    </div>
  );
}

function AffiliateCard({ name, description, url, color }: {
  name: string;
  description: string;
  url: string;
  color: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 rounded-xl border border-border hover:border-accent/30 hover:shadow-md transition-all group"
    >
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center mb-3 text-white font-bold text-xl"
        style={{ backgroundColor: color }}
      >
        {name[0]}
      </div>
      <h5 className="font-semibold text-sm mb-1 group-hover:text-accent transition-colors">{name}</h5>
      <p className="text-xs text-text/50">{description}</p>
      <ExternalLink className="w-3 h-3 text-text/30 mt-2 group-hover:text-accent transition-colors" />
    </a>
  );
}

function FaqItem({ question, answer, isOpen, onToggle }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-background transition-colors"
      >
        <span className="font-medium">{question}</span>
        <ChevronDown className={`w-5 h-5 text-text/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-sm text-text/60">
          {answer}
        </div>
      )}
    </div>
  );
}

function AuthModal({ onClose, onLogin }: { onClose: () => void; onLogin: (email: string) => void }) {
  const [email, setEmail] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8">
        <h3 className="text-xl font-bold mb-2 font-[family-name:var(--font-display)]">Iniciar Sesión</h3>
        <p className="text-sm text-text/60 mb-6">
          Regístrate gratis para desbloquear más patrones
        </p>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
          />
          <button
            onClick={() => {
              if (email.trim()) onLogin(email.trim());
            }}
            className="w-full py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent/90 transition-all"
          >
            Continuar con Email
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-text/40">o</span>
            </div>
          </div>

          <button
            onClick={() => onLogin('demo@geopattern.app')}
            className="w-full py-3 bg-white text-text font-medium rounded-xl border border-border hover:border-accent/30 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuar con Google
          </button>
        </div>
      </div>
    </div>
  );
}
