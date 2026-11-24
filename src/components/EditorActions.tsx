import { useEffect, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import { ExportFormat, ExportResolution, RESOLUTIONS, RESOLUTION_LABELS, getResolutionSize, isResolutionAvailable } from '../lib/export';
import { UserTier } from '../lib/userTier';
import { useI18n, MessageKey } from '../i18n';

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
  notice?: string; // mensaje externo (por ejemplo, un error al descargar)
  busy?: boolean;
}

export default function EditorActions({ tier, remaining, onDownload, onLocked, onCopy, notice, busy }: Props) {
  const { t } = useI18n();
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
            disabled={busy} className="w-full h-[55px] rounded-xl bg-accent text-accent-text text-2xl hover:brightness-110 transition disabled:opacity-70">{busy ? t('dl.generating') : t('dl.button')}</button>
          {dl.open && (
            <>
            <div className="fixed inset-0 bg-black/50 z-20 sm:hidden" onClick={() => dl.setOpen(false)} />
            <div className="fixed inset-x-3 bottom-3 max-h-[85vh] overflow-y-auto z-30 sm:absolute sm:inset-x-auto sm:bottom-auto sm:top-full sm:mt-3 sm:left-0 sm:w-[19rem] sm:max-h-none sm:overflow-visible rounded-2xl bg-background border border-border shadow-2xl p-5 space-y-4">
              <div>
                <p className="text-sm uppercase tracking-wider text-text-secondary mb-2">{t('dl.image')}</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['png', 'svg'] as ExportFormat[]).map(f => (
                    <button key={f} onClick={() => setFormat(f)} aria-pressed={format === f}
                      className={`h-10 rounded-lg border text-lg uppercase ${format === f ? 'bg-accent text-accent-text border-accent' : 'border-text/60 text-text hover:border-accent'}`}>{f}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-text-secondary mb-2">{t('dl.maps')}</p>
                <div className="grid grid-cols-3 gap-2">
                  {([['height', 'maps.height'], ['normal', 'maps.normal'], ['alpha', 'maps.alpha']] as [ExportFormat, MessageKey][]).map(([f, label]) => (
                    <button key={f} onClick={() => setFormat(f)} aria-pressed={format === f}
                      className={`h-10 rounded-lg border text-base ${format === f ? 'bg-accent text-accent-text border-accent' : 'border-text/60 text-text hover:border-accent'}`}>{t(label)}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-text-secondary mb-2">{t('dl.resolution')}</p>
                <div className="space-y-2">
                  {RESOLUTIONS.map(r => {
                    const ok = isResolutionAvailable(tier, r);
                    return (
                      <button key={r} onClick={() => (ok ? setRes(r) : onLocked(t('gen.res4k')))}
                        className={`w-full h-10 px-3 rounded-lg border flex items-center justify-between text-lg ${res === r && ok ? 'border-accent text-accent-ink' : 'border-text/40 text-text hover:border-accent'}`}>
                        <span>{RESOLUTION_LABELS[r]} · {getResolutionSize(r)} px</span>
                        {!ok && <span className="flex items-center gap-1 text-sm text-text-secondary"><Lock className="w-4 h-4" />Pro</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button onClick={() => { dl.setOpen(false); onDownload(format, res); }}
                className="w-full h-11 rounded-xl bg-accent text-accent-text text-xl hover:brightness-110">
                {t('dl.confirm', { what: t(`dl.what.${format}` as const), res: RESOLUTION_LABELS[res] })}
              </button>
              {remaining !== Infinity && (
                <p className="text-sm text-text-secondary text-center">{t('dl.remaining', { n: remaining })}</p>
              )}
            </div>
            </>
          )}
        </div>

        <div className="relative" ref={cp.ref}>
          <button onClick={() => { cp.setOpen(o => !o); dl.setOpen(false); }} aria-expanded={cp.open}
            className="w-full h-[55px] rounded-xl border border-text/70 text-text text-2xl hover:border-accent transition">{t('dl.copy')}</button>
          {cp.open && (
            <>
            <div className="fixed inset-0 bg-black/50 z-20 sm:hidden" onClick={() => cp.setOpen(false)} />
            <div className="fixed inset-x-3 bottom-3 z-30 sm:absolute sm:inset-x-auto sm:bottom-auto sm:top-full sm:mt-3 sm:right-0 sm:w-56 rounded-2xl bg-background border border-border shadow-2xl p-3 space-y-2">
              <button onClick={() => doCopy('svg')} className="w-full h-11 rounded-lg border border-text/40 text-lg text-text hover:border-accent">{t('dl.copySvg')}</button>
              <button onClick={() => doCopy('css')} className="w-full h-11 rounded-lg border border-text/40 text-lg text-text hover:border-accent">{t('dl.copyCss')}</button>
            </div>
            </>
          )}
        </div>
      </div>
      <p className="h-5 text-center text-sm text-accent-ink" aria-live="polite">{notice || msg}</p>
    </div>
  );
}
