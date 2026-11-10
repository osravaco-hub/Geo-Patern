import { X, Crown, Check } from 'lucide-react';
import { UserTier } from '../lib/userTier';

interface UpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  onUpgrade: () => void;
  currentTier: UserTier;
  isLiteAccess?: boolean;
}

export default function UpsellModal({ isOpen, onClose, feature, onUpgrade, currentTier, isLiteAccess = false }: UpsellModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-background rounded-2xl shadow-2xl max-w-md w-full p-8 border border-border">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-background-secondary transition-colors"
        >
          <X className="w-5 h-5 text-text-secondary" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-premium-light mb-4">
            <Crown className="w-7 h-7 text-premium" />
          </div>
          <h2 className="text-2xl font-bold text-text font-[family-name:var(--font-display)]">
            {isLiteAccess ? 'Accede al Plan Lite' : `Desbloquea ${feature}`}
          </h2>
          <p className="text-text-secondary mt-2">
            {isLiteAccess 
              ? 'Inicia sesión gratis para acceder a 5 patrones básicos adicionales'
              : 'Actualiza a Premium para acceder a esta función'
            }
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-3 mb-6">
          {isLiteAccess ? (
            <>
              <BenefitItem text="5 patrones básicos adicionales" />
              <BenefitItem text="Líneas onduladas y triángulos" />
              <BenefitItem text="Espiral cuadrada y cruces" />
              <BenefitItem text="Rayas verticales" />
              <BenefitItem text="Registro gratuito" />
            </>
          ) : (
            <>
              <BenefitItem text="11 patrones avanzados exclusivos" />
              <BenefitItem text="Descargas ilimitadas en alta resolución" />
              <BenefitItem text="Aleatorizar colores de relleno" />
              <BenefitItem text="Fondo transparente" />
              <BenefitItem text="Biblioteca de patrones guardados" />
            </>
          )}
        </div>

        {/* Pricing */}
        {!isLiteAccess && (
          <div className="bg-background-secondary rounded-xl p-4 mb-6 border border-border">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold text-text">$3.99</span>
              <span className="text-text-secondary">/mes</span>
            </div>
            <p className="text-center text-xs text-text-secondary mt-1">
              O $31.99/año (ahorra 33%)
            </p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={onUpgrade}
          className="w-full py-3 bg-accent text-accent-text font-semibold rounded-lg hover:opacity-90 transition-all"
        >
          {currentTier === 'pro' 
            ? '✓ Ya eres Premium' 
            : isLiteAccess 
              ? 'Iniciar Sesión Gratis'
              : 'Pagar $3.99 y Acceder'
          }
        </button>

        <button
          onClick={onClose}
          className="w-full mt-3 py-2 text-text-secondary text-sm hover:text-text transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <Check className="w-4 h-4 text-accent-blue shrink-0 mt-0.5" />
      <span className="text-sm text-text">{text}</span>
    </div>
  );
}
