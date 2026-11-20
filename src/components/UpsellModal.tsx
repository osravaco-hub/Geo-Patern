import { X, Crown, Check } from 'lucide-react';
import { UserTier } from '../lib/userTier';
import { PRO_PRICE_LABEL } from '../lib/checkout';

interface UpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  onUpgrade: () => void; // abre el modal de planes
  currentTier?: UserTier;
}

export default function UpsellModal({ isOpen, onClose, feature, onUpgrade }: UpsellModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background text-text border border-border rounded-3xl shadow-2xl max-w-md w-full p-8">
        <button onClick={onClose} aria-label="Cerrar" className="absolute top-4 right-4 p-2 rounded-lg text-text-secondary hover:text-text hover:bg-text/10 transition">
          <X className="w-5 h-5" />
        </button>
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/15 mb-3">
            <Crown className="w-7 h-7 text-accent-ink" />
          </div>
          <h3 className="text-3xl font-semibold">Desbloquea {feature}</h3>
          <p className="text-text-secondary mt-1">Disponible en el plan Pro.</p>
        </div>
        <ul className="space-y-2 mb-6">
          {['Paleta de hasta 6 colores', 'Exportación en 4K (4096 px)', 'Descargas ilimitadas'].map(f => (
            <li key={f} className="flex items-center gap-2"><Check className="w-4 h-4 text-accent-ink shrink-0" />{f}</li>
          ))}
        </ul>
        <div className="rounded-2xl border border-border bg-background-secondary text-center py-4 mb-4">
          <span className="text-3xl font-bold">{PRO_PRICE_LABEL}</span>
          <span className="text-text-secondary"> · pago único</span>
        </div>
        <button onClick={onUpgrade} className="w-full py-3 bg-accent text-accent-text font-semibold rounded-xl hover:opacity-90 transition">Ver Pro</button>
        <button onClick={onClose} className="w-full py-2 mt-2 text-text-secondary hover:text-text transition">Ahora no</button>
      </div>
    </div>
  );
}
