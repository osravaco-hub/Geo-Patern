import { useEffect, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import { ExportFormat, ExportResolution, RESOLUTIONS, RESOLUTION_LABELS, getResolutionSize, isResolutionAvailable } from '../lib/export';
import { UserTier } from '../lib/userTier';

function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);
  return { open, setOpen, ref };
}

interface Props {
  tier: UserTier;
  remaining: number; // descargas restantes (Infinity = sin límite)
  onDownload: (format: ExportFormat, resolution: ExportResolution) => void;
  onLocked: (feature: string) => void;
  onCopy: (kind: 'svg' | 'css') => Promise<string>;
}

export default function EditorActions({ tier, remaining, onDownload, onLocked, onCopy }: Props) {
  const dl = usePopover();
  const cp = usePopover();
  const [format, setFormat] = useState<ExportFormat>('png');
  const [res, setRes] = useState<ExportResolution>('1x');
  const [msg, setMsg] = useState('');

  const doCopy = async (kind: 'svg' | 'css') => {
    const m = await onCopy(kind);
    cp.setOpen(false);
    setMsg(m);
    setTimeout(() => setMsg(''), 2500);
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_1.2fr] gap-4">
        <div className="relative" ref={dl.ref}>
          <button onClick={() => { dl.setOpen(o => !o); cp.setOpen(false); }} aria-expanded={dl.open}
            className="w-full h-[55px] rounded-xl bg-accent text-accent-text text-2xl hover:brightness-110 transition">Descargar</button>
          {dl.open && (
            <div className="absolute bottom-full mb-3 left-0 w-[19rem] max-w-[90vw] rounded-2xl bg-background border border-border shadow-2xl p-5 space-y-4 z-30">
              <div>
                <p className="text-sm uppercase tracking-wider text-text-secondary mb-2">Formato</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['png', 'svg'] as ExportFormat[]).map(f => (
                    <button key={f} onClick={() => setFormat(f)}
                      className={`h-10 rounded-lg border text-lg uppercase ${format === f ? 'bg-accent text-accent-text border-accent' : 'border-text/60 text-text hover:border-accent'}`}>{f}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-text-secondary mb-2">Resolución</p>
                <div className="space-y-2">
                  {RESOLUTIONS.map(r => {
                    const ok = isResolutionAvailable(tier, r);
                    return (
                      <button key={r} onClick={() => (ok ? setRes(r) : onLocked('la resolución 4K'))}
                        className={`w-full h-10 px-3 rounded-lg border flex items-center justify-between text-lg ${res === r && ok ? 'border-accent text-accent' : 'border-text/40 text-text hover:border-accent'}`}>
                        <span>{RESOLUTION_LABELS[r]} · {getResolutionSize(r)} px</span>
                        {!ok && <span className="flex items-center gap-1 text-sm text-text-secondary"><Lock className="w-4 h-4" />Pro</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button onClick={() => { dl.setOpen(false); onDownload(format, res); }}
                className="w-full h-11 rounded-xl bg-accent text-accent-text text-xl hover:brightness-110">
                Descargar {format.toUpperCase()} {RESOLUTION_LABELS[res]}
              </button>
              {remaining !== Infinity && (
                <p className="text-sm text-text-secondary text-center">Te quedan {remaining} descargas hoy en el plan Free</p>
              )}
            </div>
          )}
        </div>

        <div className="relative" ref={cp.ref}>
          <button onClick={() => { cp.setOpen(o => !o); dl.setOpen(false); }} aria-expanded={cp.open}
            className="w-full h-[55px] rounded-xl border border-text/70 text-text text-2xl hover:border-accent transition">Copiar</button>
          {cp.open && (
            <div className="absolute bottom-full mb-3 right-0 w-56 rounded-2xl bg-background border border-border shadow-2xl p-3 space-y-2 z-30">
              <button onClick={() => doCopy('svg')} className="w-full h-11 rounded-lg border border-text/40 text-lg text-text hover:border-accent">Copiar código SVG</button>
              <button onClick={() => doCopy('css')} className="w-full h-11 rounded-lg border border-text/40 text-lg text-text hover:border-accent">Copiar código CSS</button>
            </div>
          )}
        </div>
      </div>
      <p className="h-5 text-center text-sm text-accent" aria-live="polite">{msg}</p>
    </div>
  );
}
