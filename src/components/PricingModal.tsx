import { X, Crown, Check, Lock } from 'lucide-react';
import { UserTier } from '../lib/userTier';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  currentTier: UserTier;
  onLogin?: () => void;
}

export default function PricingModal({ isOpen, onClose, onUpgrade, currentTier, onLogin }: PricingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-8 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Decorative gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-premium/10 via-accent/5 to-transparent" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-border/50 transition-colors z-10"
        >
          <X className="w-5 h-5 text-text/50" />
        </button>

        <div className="relative">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-premium-light mb-4">
              <Crown className="w-7 h-7 text-premium" />
            </div>
            <h2 className="text-3xl font-bold text-text font-[family-name:var(--font-display)]">
              Elige tu Plan
            </h2>
            <p className="text-text/60 mt-2">
              Desbloquea todo el potencial de GeoPattern
            </p>
          </div>

          {/* Plans Comparison */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Guest Plan */}
            <div className={`rounded-2xl border-2 p-6 transition-all ${
              currentTier === 'guest' 
                ? 'border-accent bg-accent-light/30' 
                : 'border-border bg-white'
            }`}>
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-text mb-1">Invitado</h3>
                <div className="text-3xl font-bold text-text">$0</div>
                <div className="text-sm text-text/50">Para siempre</div>
              </div>

              <ul className="space-y-3 text-sm">
                <FeatureItem text="3 patrones ultra-básicos" included />
                <FeatureItem text="Densidad y rotación" included />
                <FeatureItem text="PNG 600px" included />
                <FeatureItem text="Descargas ilimitadas" included />
                <FeatureItem text="Patrones básicos" locked />
                <FeatureItem text="Control de escala" locked />
                <FeatureItem text="Patrones avanzados" locked />
              </ul>

              {currentTier === 'guest' ? (
                <div className="mt-6 px-4 py-2 bg-accent/10 text-accent text-sm font-medium rounded-xl text-center">
                  Plan actual
                </div>
              ) : (
                <button
                  onClick={onLogin}
                  className="mt-6 w-full py-3 bg-white text-text font-medium rounded-xl border border-border hover:border-accent/30 transition-all"
                >
                  Registrarse Gratis
                </button>
              )}
            </div>

            {/* Free Plan */}
            <div className={`rounded-2xl border-2 p-6 transition-all ${
              currentTier === 'free' 
                ? 'border-accent bg-accent-light/30' 
                : 'border-border bg-white'
            }`}>
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-text mb-1">Free</h3>
                <div className="text-3xl font-bold text-text">$0</div>
                <div className="text-sm text-text/50">Para siempre</div>
              </div>

              <ul className="space-y-3 text-sm">
                <FeatureItem text="8 patrones (básicos)" included />
                <FeatureItem text="Densidad, rotación y escala" included />
                <FeatureItem text="PNG 1200px" included />
                <FeatureItem text="3 descargas/semana" included />
                <FeatureItem text="Patrones avanzados" locked />
                <FeatureItem text="Aleatorizar colores" locked />
                <FeatureItem text="Fondo transparente" locked />
              </ul>

              {currentTier === 'free' ? (
                <div className="mt-6 px-4 py-2 bg-accent/10 text-accent text-sm font-medium rounded-xl text-center">
                  Plan actual
                </div>
              ) : (
                <button
                  onClick={onLogin}
                  className="mt-6 w-full py-3 bg-accent text-white font-medium rounded-xl hover:bg-accent/90 transition-all"
                >
                  Registrarse Gratis
                </button>
              )}
            </div>

            {/* Premium Plan */}
            <div className={`rounded-2xl border-2 p-6 transition-all relative ${
              currentTier === 'premium' 
                ? 'border-premium bg-gradient-to-br from-premium/5 to-accent/5' 
                : 'border-premium/30 bg-gradient-to-br from-premium/5 to-accent/5 hover:border-premium'
            }`}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-premium text-white text-xs font-semibold rounded-full">
                Recomendado
              </div>

              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-text mb-1 flex items-center justify-center gap-2">
                  Premium
                  <Crown className="w-5 h-5 text-premium" />
                </h3>
                <div className="text-3xl font-bold text-text">$4.99</div>
                <div className="text-sm text-text/50">por mes</div>
              </div>

              <ul className="space-y-3 text-sm">
                <FeatureItem text="12 patrones (todos)" included />
                <FeatureItem text="Todos los controles" included />
                <FeatureItem text="PNG hasta 2400px" included />
                <FeatureItem text="Descargas ilimitadas" included />
                <FeatureItem text="Aleatorizar colores" included />
                <FeatureItem text="Fondo transparente" included />
                <FeatureItem text="Soporte prioritario" included />
              </ul>

              {currentTier === 'premium' ? (
                <div className="mt-6 px-4 py-2 bg-premium/10 text-premium text-sm font-medium rounded-xl text-center">
                  Plan actual
                </div>
              ) : (
                <button
                  onClick={onUpgrade}
                  className="mt-6 w-full py-3 bg-gradient-to-r from-premium to-accent text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-premium/20"
                >
                  Suscribirse a Premium
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-2">
            <p className="text-xs text-text/40">
              Sin anuncios • Cancela cuando quieras • 100% gratis para Guest y Free
            </p>
            {currentTier !== 'premium' && (
              <p className="text-xs text-text/50">
                Premium incluye acceso inmediato a todos los patrones y funciones
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ text, included, locked }: { text: string; included?: boolean; locked?: boolean }) {
  return (
    <li className="flex items-start gap-2">
      {included ? (
        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
      ) : (
        <Lock className="w-4 h-4 text-text/30 shrink-0 mt-0.5" />
      )}
      <span className={locked ? 'text-text/40' : 'text-text/70'}>
        {text}
      </span>
    </li>
  );
}
