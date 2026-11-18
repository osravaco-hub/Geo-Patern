import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  LogIn,
  Menu,
  X
} from 'lucide-react';
import PatternCanvas from '../components/PatternCanvas';
import { PatternConfig, defaultConfig, PATTERN_DEFINITIONS } from '../lib/patterns';
import { initiateDodoCheckout, DODO_PRODUCTS } from '../lib/dodo';
import { useUserContext } from '../context/UserContext';
import { SignInButton } from '@clerk/react';

interface NewLandingProps {
  onNavigateGenerator: () => void;
  onNavigateDashboard: () => void;
}

export default function NewLanding({ onNavigateGenerator, onNavigateDashboard }: NewLandingProps) {
  const { user } = useUserContext();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [demoConfig] = useState<PatternConfig>({
    ...defaultConfig,
    type: 'concentricCircles',
  });

  const handleUpgrade = async () => {
    if (!user.isLoggedIn) {
      // Implementa modal de auth o redirect
      return;
    }

    try {
      await initiateDodoCheckout({
        productId: DODO_PRODUCTS.proMonthly,
        customerEmail: user.email || undefined,
        returnUrl: `${window.location.origin}/?payment=success&plan=monthly`,
      });
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error al iniciar el proceso de pago. Intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
            {user.isLoggedIn ? (
              <button
                onClick={onNavigateDashboard}
                className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-all"
              >
                Dashboard
              </button>
            ) : (
              <SignInButton mode="modal">
                <button
                  className="px-4 py-2 bg-white text-text text-sm font-medium rounded-lg border border-border hover:border-accent/30 transition-all flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión
                </button>
              </SignInButton>
            )}
          </nav>

          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-border/50"
          >
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 animate-pulse">
            <PatternCanvas
              config={{ ...defaultConfig, type: 'concentricCircles', density: 30 }}
              seed={123}
              tier="free"
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
            <button
              onClick={onNavigateGenerator}
              className="px-8 py-4 bg-accent text-white text-lg font-semibold rounded-xl hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 hover:scale-105"
            >
              Crear mi primer patrón gratis
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
