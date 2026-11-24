import { useState } from 'react';
import { X, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { useI18n } from '../i18n';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'bug' | 'feature' | 'general'>('general');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simula envío de feedback
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 600);
  };

  const handleReset = () => {
    setEmail('');
    setMessage('');
    setSent(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background text-text border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold font-[family-name:var(--font-body)]">{t('feedback.title')}</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-border/40 flex items-center justify-center hover:bg-border transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {sent ? (
          <div className="py-8 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <h3 className="text-xl font-bold">{t('feedback.sent')}</h3>
            <p className="text-text-secondary text-sm">{t('feedback.thanks')}</p>
            <button
              onClick={handleReset}
              className="w-full h-11 rounded-xl bg-accent text-accent-text font-semibold hover:brightness-110 transition"
            >
              {t('common.close')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">{t('feedback.type')}</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCategory('general')}
                  className={`h-9 rounded-lg text-xs font-semibold transition ${category === 'general' ? 'bg-accent text-accent-text' : 'border border-border hover:border-accent'}`}
                >
                  {t('feedback.general')}
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('bug')}
                  className={`h-9 rounded-lg text-xs font-semibold transition ${category === 'bug' ? 'bg-accent text-accent-text' : 'border border-border hover:border-accent'}`}
                >
                  {t('feedback.bug')}
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('feature')}
                  className={`h-9 rounded-lg text-xs font-semibold transition ${category === 'feature' ? 'bg-accent text-accent-text' : 'border border-border hover:border-accent'}`}
                >
                  {t('feedback.feature')}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">{t('feedback.email')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('feedback.emailPlaceholder')}
                className="w-full h-11 px-3 rounded-xl bg-background border border-border focus:border-accent outline-none text-text text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">{t('feedback.message')}</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={t('feedback.messagePlaceholder')}
                className="w-full p-3 rounded-xl bg-background border border-border focus:border-accent outline-none text-text text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-accent text-accent-text font-semibold hover:brightness-110 transition flex items-center justify-center gap-2"
            >
              {loading ? t('feedback.sending') : (
                <>
                  <Send className="w-4 h-4" />
                  {t('feedback.send')}
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
