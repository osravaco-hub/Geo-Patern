import { useState } from 'react';
import { X, Copy, Check, Heart, QrCode } from 'lucide-react';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DonateModal({ isOpen, onClose }: DonateModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const binanceInfo = "123456789 (Binance Pay ID)";
  const airtmInfo = "donaciones@geopattern.studio";

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Apoyar proyecto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background text-text border border-border rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 max-h-[95vh] overflow-y-auto">
        <button onClick={onClose} aria-label="Cerrar" className="absolute top-4 right-4 p-2 rounded-lg text-text-secondary hover:text-text hover:bg-text/10 transition">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/15 mb-3">
            <Heart className="w-7 h-7 text-accent-ink fill-accent/30" />
          </div>
          <h2 className="text-2xl font-semibold">Apoya el desarrollo</h2>
          <p className="text-text-secondary mt-1 text-sm">Tu contribución nos ayuda a mantener GeoPattern libre y en constante evolución.</p>
        </div>

        <div className="space-y-4">
          {/* Binance Pay */}
          <div className="p-4 rounded-2xl border border-border bg-background/50 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold">
                <span className="w-3 h-3 rounded-full bg-[#F0B90B]"></span>
                <span>Binance Pay / Crypto</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent-ink">USDT / BTC</span>
            </div>
            <div className="text-xs text-text-secondary">
              ID de Binance Pay o Wallet TRC20:
            </div>
            <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-2.5 rounded-xl border border-border">
              <code className="text-xs font-mono select-all truncate mr-2">{binanceInfo}</code>
              <button
                onClick={() => handleCopy(binanceInfo, 'binance')}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-accent text-accent-text hover:brightness-110 transition shrink-0"
              >
                {copiedKey === 'binance' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'binance' ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* AirTm */}
          <div className="p-4 rounded-2xl border border-border bg-background/50 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold">
                <span className="w-3 h-3 rounded-full bg-[#183668]"></span>
                <span>AirTm</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent-ink">Correo / Tag</span>
            </div>
            <div className="text-xs text-text-secondary">
              Correo electrónico registrado en AirTm:
            </div>
            <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-2.5 rounded-xl border border-border">
              <code className="text-xs font-mono select-all truncate mr-2">{airtmInfo}</code>
              <button
                onClick={() => handleCopy(airtmInfo, 'airtm')}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-accent text-accent-text hover:brightness-110 transition shrink-0"
              >
                {copiedKey === 'airtm' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'airtm' ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-border/40 hover:bg-border/60 text-text text-sm font-medium transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
