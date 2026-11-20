import { useState } from 'react';
import { X, Copy, Check, Heart, ExternalLink } from 'lucide-react';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DonateModal({ isOpen, onClose }: DonateModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const binanceInfo = "Alias: Osravaco";
  const airtmLink = "https://airtm.me/osravaco";
  const airtmInfo = "donaciones@geopattern.studio (o airtm.me/osravaco)";

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Apoyar proyecto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background text-text border border-border rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 max-h-[95vh] overflow-y-auto">
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

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Binance Pay */}
          <div className="p-4 rounded-2xl border border-border bg-background/50 flex flex-col items-center text-center gap-3">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <span className="w-3 h-3 rounded-full bg-[#F0B90B]"></span>
                <span>Binance Pay</span>
              </div>
            </div>
            
            <div className="w-32 h-32 bg-white p-2 rounded-xl border border-border flex items-center justify-center overflow-hidden">
              <img src="/Qr Binance.png" alt="QR Binance Pay" className="w-full h-full object-contain" />
            </div>

            <div className="w-full flex items-center justify-between bg-black/5 dark:bg-white/5 p-2 rounded-xl border border-border">
              <code className="text-[11px] font-mono select-all truncate mr-1">{binanceInfo}</code>
              <button
                onClick={() => handleCopy(binanceInfo, 'binance')}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-accent text-accent-text hover:brightness-110 transition shrink-0"
              >
                {copiedKey === 'binance' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedKey === 'binance' ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* AirTm */}
          <div className="p-4 rounded-2xl border border-border bg-background/50 flex flex-col items-center text-center gap-3">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <span className="w-3 h-3 rounded-full bg-[#183668]"></span>
                <span>AirTm</span>
              </div>
              <a href={airtmLink} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline flex items-center gap-1">
                Perfil <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="w-32 h-32 bg-white p-2 rounded-xl border border-border flex items-center justify-center overflow-hidden">
              <img src="/airtmMe-QR.png" alt="QR AirTm" className="w-full h-full object-contain" />
            </div>

            <div className="w-full flex items-center justify-between bg-black/5 dark:bg-white/5 p-2 rounded-xl border border-border">
              <code className="text-[11px] font-mono select-all truncate mr-1">{airtmLink}</code>
              <button
                onClick={() => handleCopy(airtmLink, 'airtm')}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-accent text-accent-text hover:brightness-110 transition shrink-0"
              >
                {copiedKey === 'airtm' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
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
