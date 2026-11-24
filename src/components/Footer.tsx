import { useState } from 'react';
import { X, Shield, FileText } from 'lucide-react';
import LanguageMenu from './LanguageMenu';
import { useI18n, MessageKey } from '../i18n';

interface FooterProps {
  onOpenFeedback?: () => void;
}

const PRIVACY_ITEMS: MessageKey[] = ['privacy.1', 'privacy.2', 'privacy.3', 'privacy.4'];
const TERMS_ITEMS: MessageKey[] = ['terms.1', 'terms.2', 'terms.3'];

interface LegalModalProps {
  title: string;
  intro: string;
  items: MessageKey[];
  icon: React.ReactNode;
  onClose: () => void;
}

function LegalModal({ title, intro, items, icon, onClose }: LegalModalProps) {
  const { t } = useI18n();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background text-text border border-border rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
          <button onClick={onClose} aria-label={t('common.close')} className="p-1.5 rounded-lg hover:bg-border/50"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm text-text-secondary">{intro}</p>
        <ul className="list-disc pl-5 space-y-2 text-sm text-text-secondary">
          {items.map(k => <li key={k}>{t(k)}</li>)}
        </ul>
        <button onClick={onClose} className="w-full h-10 rounded-xl bg-accent text-accent-text font-semibold hover:brightness-110">{t('common.close')}</button>
      </div>
    </div>
  );
}

export default function Footer({ onOpenFeedback }: FooterProps) {
  const { t } = useI18n();
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  return (
    <>
      <footer className="px-4 sm:px-6 py-6 border-t border-border/40 text-sm text-text-secondary flex flex-wrap items-center justify-center sm:justify-between gap-x-6 gap-y-4">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <span><strong className="text-text font-semibold">GeoPattern</strong> · {t('footer.beta')}</span>
          <button onClick={() => setPrivacyOpen(true)} className="hover:text-accent-ink underline-offset-2 hover:underline">{t('footer.privacy')}</button>
          <button onClick={() => setTermsOpen(true)} className="hover:text-accent-ink underline-offset-2 hover:underline">{t('footer.terms')}</button>
          <button onClick={onOpenFeedback} className="hover:text-accent-ink underline-offset-2 hover:underline">{t('footer.feedback')}</button>
        </div>
        <div className="w-full sm:w-auto flex justify-end">
          <LanguageMenu />
        </div>
      </footer>

      {privacyOpen && (
        <LegalModal title={t('footer.privacy')} intro={t('privacy.intro')} items={PRIVACY_ITEMS}
          icon={<Shield className="w-5 h-5 text-accent" />} onClose={() => setPrivacyOpen(false)} />
      )}
      {termsOpen && (
        <LegalModal title={t('footer.terms')} intro={t('terms.intro')} items={TERMS_ITEMS}
          icon={<FileText className="w-5 h-5 text-accent" />} onClose={() => setTermsOpen(false)} />
      )}
    </>
  );
}
