import { Sparkles, ArrowRight } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { UserState, getDefaultUser, simulateLogin } from '../lib/userTier';
import Header from '../components/Header';
import { useState } from 'react';

interface LandingProps {
  onStart: () => void;
  onNavigateDashboard: () => void;
}

export default function Landing({ onStart, onNavigateDashboard }: LandingProps) {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<UserState>(getDefaultUser());

  const handleLogin = (email: string) => {
    setUser(simulateLogin(email));
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 flex flex-col">
      {/* Header */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        user={user}
        onLogin={handleLogin}
        onNavigateDashboard={onNavigateDashboard}
      />

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-accent-blue mb-8">
            <Sparkles className="w-10 h-10 text-text" />
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text mb-6 font-[family-name:var(--font-display)] leading-tight">
            Generador de Patrones Geométricos
          </h2>
          
          <p className="text-lg sm:text-xl text-text-secondary mb-12 max-w-2xl mx-auto">
            Crea patrones únicos y personalizables. Descarga en PNG y SVG sin marca de agua.
          </p>
          
          <button
            onClick={onStart}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-accent text-accent-text font-semibold rounded-lg hover:opacity-90 transition-all duration-200 text-lg"
          >
            Comienza a generar tu patrón
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-20">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-background-secondary border border-border flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="font-semibold text-text mb-2">21 Patrones</h3>
              <p className="text-sm text-text-secondary">
                Desde círculos concéntricos hasta fractales complejos
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-background-secondary border border-border flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold text-text mb-2">Personalización Total</h3>
              <p className="text-sm text-text-secondary">
                Colores, densidad, rotación, escala y más
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-background-secondary border border-border flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💎</span>
              </div>
              <h3 className="font-semibold text-text mb-2">Sin Marca de Agua</h3>
              <p className="text-sm text-text-secondary">
                Descarga en alta resolución listo para usar
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Plans Section */}
      <section className="py-20 px-4 sm:px-6 bg-background-secondary transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4 text-center font-[family-name:var(--font-display)]">
            Elige tu plan
          </h2>
          <p className="text-text-secondary text-center mb-12 max-w-2xl mx-auto">
            Comienza gratis y desbloquea más patrones según tus necesidades
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Plan Gratis */}
            <div className="bg-background rounded-2xl border border-border p-6 hover:border-text-secondary transition-all duration-200">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-text mb-2">Gratis</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-text">$0</span>
                  <span className="text-text-secondary">/siempre</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-accent-blue mt-1">✓</span>
                  <span className="text-sm text-text">5 patrones ultra-básicos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-blue mt-1">✓</span>
                  <span className="text-sm text-text">Personalización de colores</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-blue mt-1">✓</span>
                  <span className="text-sm text-text">Descarga en PNG/SVG</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-blue mt-1">✓</span>
                  <span className="text-sm text-text">Sin marca de agua</span>
                </li>
              </ul>
              <button
                onClick={onStart}
                className="w-full py-3 bg-background-secondary border border-border text-text font-medium rounded-lg hover:border-text-secondary transition-all"
              >
                Comenzar gratis
              </button>
            </div>

            {/* Plan Lite */}
            <div className="bg-background rounded-2xl border-2 border-accent-blue p-6 relative hover:shadow-lg transition-all duration-200">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-blue text-white text-xs font-semibold px-3 py-1 rounded-full">
                Popular
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-text mb-2">Lite</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-text">Gratis</span>
                  <span className="text-text-secondary text-sm">(con registro)</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-accent-blue mt-1">✓</span>
                  <span className="text-sm text-text">Todo lo del plan Gratis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-blue mt-1">✓</span>
                  <span className="text-sm text-text">5 patrones básicos adicionales</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-blue mt-1">✓</span>
                  <span className="text-sm text-text">Parámetros avanzados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-blue mt-1">✓</span>
                  <span className="text-sm text-text">Historial de descargas</span>
                </li>
              </ul>
              <button
                onClick={onStart}
                className="w-full py-3 bg-accent-blue text-white font-medium rounded-lg hover:opacity-90 transition-all"
              >
                Registrarse gratis
              </button>
            </div>

            {/* Plan Premium */}
            <div className="bg-background rounded-2xl border border-border p-6 hover:border-text-secondary transition-all duration-200">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-text mb-2">Premium</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-text">$3.99</span>
                  <span className="text-text-secondary">/mes</span>
                </div>
                <p className="text-xs text-text-secondary mt-1">o $31.99/año (ahorra 33%)</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-accent-blue mt-1">✓</span>
                  <span className="text-sm text-text">Todo lo del plan Lite</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-blue mt-1">✓</span>
                  <span className="text-sm text-text">11 patrones avanzados exclusivos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-blue mt-1">✓</span>
                  <span className="text-sm text-text">Aleatorizar colores de relleno</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-blue mt-1">✓</span>
                  <span className="text-sm text-text">Fondo transparente</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-blue mt-1">✓</span>
                  <span className="text-sm text-text">Descargas ilimitadas</span>
                </li>
              </ul>
              <button
                onClick={onStart}
                className="w-full py-3 bg-premium text-white font-medium rounded-lg hover:opacity-90 transition-all"
              >
                Obtener Premium
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border transition-colors duration-300 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-text-secondary">
          © 2024 GeoPattern. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
