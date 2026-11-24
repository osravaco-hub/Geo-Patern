import { useEffect, useRef, useState } from 'react';
import { Check, ChevronUp, Globe } from 'lucide-react';
import { Lang, useI18n } from '../i18n';

const OPTIONS: Lang[] = ['es', 'en'];

// Selector de idioma: botón con el idioma actual y un menú desplegable con español e inglés
export default function LanguageMenu() {
  const { lang, setLang, t } = useI18n();
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

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)} aria-haspopup="menu" aria-expanded={open} aria-label={t('lang.label')}
        className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border text-text hover:border-accent transition">
        <Globe className="w-4 h-4" />
        <span>{t(lang === 'es' ? 'lang.es' : 'lang.en')}</span>
        <ChevronUp className={`w-4 h-4 transition-transform ${open ? '' : 'rotate-180'}`} />
      </button>
      {open && (
        <div role="menu" aria-label={t('lang.label')}
          className="absolute right-0 bottom-full mb-2 min-w-[11rem] rounded-xl bg-background border border-border shadow-2xl p-1.5 z-30">
          {OPTIONS.map(l => (
            <button key={l} role="menuitemradio" aria-checked={lang === l} lang={l}
              onClick={() => { setLang(l); setOpen(false); }}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-left transition ${lang === l ? 'bg-accent text-accent-text' : 'text-text hover:bg-text/10'}`}>
              <span>{t(l === 'es' ? 'lang.es' : 'lang.en')}</span>
              {lang === l && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
