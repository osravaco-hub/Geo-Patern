import React, { useState } from 'react';
import { X, Crown, Check, Lock, Sparkles, Tag, AlertCircle } from 'lucide-react';
import { UserTier, UserState, getDefaultUser, saveUser } from '../lib/userTier';
import { validateAndApplyPromoCode } from '../lib/promoCodes';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (planType?: 'monthly' | 'lifetime') => void;
  currentTier: UserTier;
  onLogin?: () => void;
  onUserUpdate?: (user: UserState) => void;
}

export default function PricingModal({ isOpen, onClose, onUpgrade, currentTier, onLogin, onUserUpdate }: PricingModalProps) {
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'lifetime'>('monthly');

  if (!isOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoMessage(null);

    const currentUser = getDefaultUser();
    const result = validateAndApplyPromoCode(promoCode, currentUser);

    if (result.success && result.updatedUser) {
      saveUser(result.updatedUser);
      if (onUserUpdate) {
        onUserUpdate(result.updatedUser);
      }
      setPromoMessage({ success: true, text: result.message });
      setPromoCode('');
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setPromoMessage({ success: false, text: result.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-8 overflow-hidden max-h-[95vh] overflow-y-auto">
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
              Elige tu Plan Pro o Canjea tu Código
            </h2>
            <p className="text-text/60 mt-2">
              Desbloquea patrones ilimitados y funciones avanzadas en GeoPattern
            </p>
          </div>

          {/* Plans Grid (Free vs Pro) */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Free Plan */}
            <div className={`rounded-2xl border-2 p-6 transition-all flex flex-col justify-between ${
              currentTier === 'free' 
                ? 'border-accent bg-accent-light/30' 
                : 'border-border bg-white'
            }`}>
              <div>
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-text mb-1">Free</h3>
                  <div className="text-3xl font-bold text-text">$0</div>
                  <div className="text-sm text-text/50">Para siempre</div>
                </div>

                <ul className="space-y-3 text-sm mb-6">
                  <FeatureItem text="8 patrones básicos" included />
                  <FeatureItem text="Densidad, rotación y escala" included />
                  <FeatureItem text="PNG 1200px" included />
                  <FeatureItem text="3 descargas/semana" included />
                  <FeatureItem text="Patrones avanzados" locked />
                  <FeatureItem text="Aleatorizar colores" locked />
                  <FeatureItem text="Fondo transparente" locked />
                </ul>
              </div>

              <div>
                {currentTier === 'free' ? (
                  <div className="px-4 py-3 bg-accent/10 text-accent text-sm font-medium rounded-xl text-center">
                    Plan actual
                  </div>
                ) : (
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-white text-text font-medium rounded-xl border border-border hover:border-accent/30 transition-all text-center"
                  >
                    Mantener Plan Free
                  </button>
                )}
              </div>
            </div>

            {/* Pro Plan */}
            <div className={`rounded-2xl border-2 p-6 transition-all relative flex flex-col justify-between ${
              currentTier === 'pro' 
                ? 'border-premium bg-gradient-to-br from-premium/5 to-accent/5' 
                : 'border-premium/50 bg-gradient-to-br from-premium/5 to-accent/5 shadow-lg'
            }`}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-premium text-white text-xs font-semibold rounded-full flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Recomendado
              </div>

              <div>
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-text mb-1 flex items-center justify-center gap-2">
                    Pro
                    <Crown className="w-5 h-5 text-premium" />
                  </h3>
                  
                  {/* Billing toggle */}
                  <div className="flex justify-center gap-2 my-3">
                    <button
                      type="button"
                      onClick={() => setSelectedBilling('monthly')}
                      className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                        selectedBilling === 'monthly'
                          ? 'bg-premium text-white shadow'
                          : 'bg-white/80 text-text/70 border border-border'
                      }`}
                    >
                      Mensual ($4.99)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedBilling('lifetime')}
                      className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                        selectedBilling === 'lifetime'
                          ? 'bg-premium text-white shadow'
                          : 'bg-white/80 text-text/70 border border-border'
                      }`}
                    >
                      Lifetime ($29.99)
                    </button>
                  </div>

                  <div className="text-3xl font-bold text-text">
                    {selectedBilling === 'monthly' ? '$4.99' : '$29.99'}
                  </div>
                  <div className="text-sm text-text/50">
                    {selectedBilling === 'monthly' ? 'por mes, cancela cuando quieras' : 'pago único, para siempre'}
                  </div>
                </div>

                <ul className="space-y-3 text-sm mb-6">
                  <FeatureItem text="12 patrones (todos incluidos)" included />
                  <FeatureItem text="Todos los controles avanzados" included />
                  <FeatureItem text="PNG hasta 2400px" included />
                  <FeatureItem text="Descargas ilimitadas" included />
                  <FeatureItem text="Aleatorizar colores y gradientes" included />
                  <FeatureItem text="Fondo transparente" included />
                  <FeatureItem text="Soporte prioritario" included />
                </ul>
              </div>

              <div>
                {currentTier === 'pro' ? (
                  <div className="px-4 py-3 bg-premium/10 text-premium text-sm font-medium rounded-xl text-center">
                    Plan Pro Activo
                  </div>
                ) : (
                  <button
                    onClick={() => onUpgrade(selectedBilling)}
                    className="w-full py-3 bg-gradient-to-r from-premium to-accent text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-premium/20"
                  >
                    Suscribirse a Pro ({selectedBilling === 'monthly' ? 'Mensual' : 'Lifetime'})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Promo Code Section */}
          <div className="bg-accent-light/20 border border-border rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-5 h-5 text-accent" />
              <h3 className="font-bold text-text text-base">¿Tienes un código promocional?</h3>
            </div>
            <p className="text-xs text-text/60 mb-4">
              Canjea tu código (ej. <code className="bg-white px-1.5 py-0.5 rounded border border-border font-mono text-accent font-bold">PROMO30</code> o <code className="bg-white px-1.5 py-0.5 rounded border border-border font-mono text-accent font-bold">PROMOTEST</code>) para activar acceso Pro de forma instantánea.
            </p>

            <form onSubmit={handleApplyPromo} className="flex gap-3">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Ej: PROMO30"
                className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-white text-text font-mono uppercase tracking-wider text-sm focus:outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-text text-white font-medium rounded-xl hover:bg-text/90 transition-all text-sm shrink-0"
              >
                Canjear
              </button>
            </form>

            {promoMessage && (
              <div className={`mt-3 p-3 rounded-xl text-sm flex items-center gap-2 ${
                promoMessage.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {promoMessage.success ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{promoMessage.text}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center space-y-1">
            <p className="text-xs text-text/40">
              Sin anuncios molestos • Garantía de devolución de 14 días en planes Pro
            </p>
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
