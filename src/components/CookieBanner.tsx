import { useState, useEffect } from 'react';
import { X, Cookie, Shield, FileText } from 'lucide-react';
import { useI18n } from '../i18n';

export default function CookieBanner() {
  const { t } = useI18n();
  const [accepted, setAccepted] = useState(true);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('gp_cookie_consent');
      if (!consent) setAccepted(false);
    } catch {
      // LocalStorage blocked
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('gp_cookie_consent', 'true');
    } catch {
      // ignore
    }
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-md border-t border-border shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3 text-sm text-text-secondary">
          <Cookie className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <p>
            {t('cookies.text')}{' '}
            <button onClick={() => window.dispatchEvent(new CustomEvent('open-privacy'))} className="text-accent underline hover:text-accent-ink">
              {t('cookies.policy')}
            </button>.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleAccept}
            className="h-10 px-6 rounded-xl bg-accent text-accent-text text-sm font-semibold hover:brightness-110 transition"
          >
            {t('cookies.accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
