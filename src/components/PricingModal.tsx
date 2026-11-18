import React, { useState } from 'react';
import { X, Crown, Check, Lock, Sparkles, Tag, AlertCircle } from 'lucide-react';
import { UserTier, UserState, getDefaultUser, saveUser } from '../lib/userTier';
import { validateAndApplyPromoCode } from '../lib/promoCodes';
import { initiateDodoCheckout, DODO_PRODUCTS } from '../lib/dodo';

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
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    } else {
      setPromoMessage({ success: false, text: result.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-3xl shadow-2xl max-w-2xl w-full p-8 border border-border max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-border/50 text-text/60 hover:text-text transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent-ink text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Actualiza tu experiencia
          </div>
          <h2 className="text-3xl font-bold font-[family-name:var(--font-display)] text-text mb-2">
            Elige tu plan perfecto
          </h2>
          <p className="text-text/60 text-sm">
            Desbloquea todo el potencial de GeoPattern Studio 3D
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Free Plan */}
          <div className="rounded-2xl border border-border p-6 flex flex-col justify-between bg-background-secondary/50">
            <div>
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-text mb-1">Free</h3>
                <p className="text-2xl font-bold font-[family-name:var(--font-display)] text-text">$0</p>
                <p className="text-xs text-text/60">Para siempre</p>
              </div>

              <ul className="space-y-3 text-sm mb-6">
                <FeatureItem text="3 descargas/semana" included />
                <FeatureItem text="Patrones avanzados" locked />
                <FeatureItem text="Aleatorizar colores" locked />
                <FeatureItem text="Fondo transparente" locked />
              </ul>
            </div>

            <div>
              {currentTier === 'free' ? (
                <div className="px-4 py-3 bg-accent/10 text-accent-ink text-sm font-medium rounded-xl text-center">
                  Plan actual
                </div>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-background text-text font-medium rounded-xl border border-border hover:border-accent transition-all text-center"
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
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-premium text-accent-text text-xs font-semibold rounded-full flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Recomendado
            </div>

            <div>
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-text mb-1 flex items-center justify-center gap-2">
                  Pro
                  <Crown className="w-5 h-5 text-accent-ink" />
                </h3>
                <p className="text-2xl font-bold font-[family-name:var(--font-display)] text-text">$9<span className="text-xs text-text/60 font-normal">/mes o $49 único</span></p>
              </div>

              <ul className="space-y-3 text-sm mb-6">
                <FeatureItem text="Descargas ilimitadas" included />
                <FeatureItem text="Todos los patrones avanzados" included />
                <FeatureItem text="Exportación SVG, PNG, CSS, WebP" included />
                <FeatureItem text="Mapas PBR (Normal, Height, Alpha)" included />
                <FeatureItem text="Fondo transparente" included />
                <FeatureItem text="Soporte prioritario" included />
              </ul>
            </div>

            <div>
              {currentTier === 'pro' ? (
                <div className="px-4 py-3 bg-premium/10 text-accent-ink text-sm font-medium rounded-xl text-center">
                  Plan Pro Activo
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setSelectedBilling('monthly');
                      initiateDodoCheckout({
                        productId: DODO_PRODUCTS.proMonthly,
                        returnUrl: `${window.location.origin}/?payment=success&plan=monthly`,
                      });
                    }}
                    className="w-full py-3 bg-accent text-accent-text font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-premium/20 mb-2"
                  >
                    Pro Mensual
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBilling('lifetime');
                      initiateDodoCheckout({
                        productId: DODO_PRODUCTS.proLifetime,
                        returnUrl: `${window.location.origin}/?payment=success&plan=lifetime`,
                      });
                    }}
                    className="w-full py-3 bg-premium text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-premium/20"
                  >
                    Pro Lifetime (Pago único)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Promo Code Section */}
        <div className="bg-background-secondary border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-5 h-5 text-accent-ink" />
            <h3 className="font-bold text-text text-base">¿Tienes un código promocional?</h3>
          </div>
          <p className="text-xs text-text/60 mb-4">
            Canjea tu código (ej. <code className="bg-background px-1.5 py-0.5 rounded border border-border font-mono text-accent-ink font-bold">PROMO30</code> o <code className="bg-background px-1.5 py-0.5 rounded border border-border font-mono text-accent-ink font-bold">PROMOTEST</code>) para activar acceso Pro de forma instantánea.
          </p>

          <form onSubmit={handleApplyPromo} className="flex gap-3">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Ej: PROMO30"
              className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-text placeholder:text-text/40 font-mono uppercase tracking-wider text-sm focus:outline-none focus:border-accent"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-text text-background font-medium rounded-xl hover:opacity-90 transition-all text-sm shrink-0"
            >
              Canjear
            </button>
          </form>

          {promoMessage && (
            <div className={`mt-3 p-3 rounded-xl text-sm flex items-center gap-2 ${
              promoMessage.success ? 'bg-green-500/10 text-green-600 border border-green-500/30' : 'bg-red-500/10 text-red-500 border border-red-500/30'
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
