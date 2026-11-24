import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { es, MessageKey } from './es';
import { en, labelsEn } from './en';

export type Lang = 'es' | 'en';
export type { MessageKey };

const STORAGE_KEY = 'gp_lang';
const DICTS: Record<Lang, Record<MessageKey, string>> = { es, en };

/** Idioma guardado; si no hay, el del navegador (español si empieza por "es", si no inglés). */
export function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'es' || saved === 'en') return saved;
  } catch { /* sin almacenamiento */ }
  return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en';
}

type Vars = Record<string, string | number>;

export function translate(lang: Lang, key: MessageKey, vars?: Vars): string {
  let text: string = DICTS[lang][key] ?? es[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) text = text.split(`{${k}}`).join(String(v));
  return text;
}

const ERROR_KEYS: Record<string, MessageKey> = {
  not_configured: 'err.not_configured',
  login_required: 'err.login_required',
  invalid_session: 'err.invalid_session',
  invalid_plan: 'err.invalid_plan',
  already_pro: 'err.already_pro',
  checkout_failed: 'err.checkout_failed',
  portal_not_found: 'err.portal_not_found',
  portal_failed: 'err.portal_failed',
  no_checkout_url: 'err.no_checkout_url',
  network: 'err.network',
  pro_only: 'err.pro_only',
};

/** Clave del diccionario para un código de error del servidor o de exportación. */
export const errorKey = (code?: string): MessageKey => ERROR_KEYS[code ?? ''] ?? 'err.generic';

/** Para código fuera de React (por ejemplo, componentes de clase). */
export const tNow = (key: MessageKey, vars?: Vars) => translate(detectLang(), key, vars);

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: MessageKey, vars?: Vars) => string;
  /** Traduce una etiqueta del editor escrita en español (parámetros de los patrones). */
  tl: (label: string) => string;
  /** Código de idioma para fechas y números. */
  locale: string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* sin almacenamiento */ }
  }, []);

  const value = useMemo<I18nContextType>(() => ({
    lang,
    setLang,
    t: (key, vars) => translate(lang, key, vars),
    tl: label => (lang === 'en' ? labelsEn[label] ?? label : label),
    locale: lang === 'en' ? 'en-US' : 'es',
  }), [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within an I18nProvider');
  return ctx;
}
