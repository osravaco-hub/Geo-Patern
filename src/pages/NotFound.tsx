import { useEffect, useState } from 'react';
import { Home, RefreshCw, Compass, Sparkles, MessageSquare, ArrowLeft } from 'lucide-react';
import FeedbackModal from '../components/FeedbackModal';
import { PATTERN_DEFINITIONS } from '../lib/patterns';
import { useI18n } from '../i18n';

export default function NotFoundPage() {
  const { t } = useI18n();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const randomPattern = PATTERN_DEFINITIONS[Math.floor(Math.random() * PATTERN_DEFINITIONS.length)]?.id || 'grid';

  useEffect(() => {
    document.title = '404 · GeoPattern Studio 3D';
  }, []);

  return (
    <div className="min-h-screen bg-background text-text flex flex-col items-center justify-center p-4 sm:p-6 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="relative">
          <div className="text-8xl sm:text-9xl font-bold font-mono tracking-tighter text-accent opacity-20">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-16 h-16 text-accent animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{t('notFound.title')}</h1>
          <p className="text-text-secondary text-sm sm:text-base">
            {t('notFound.text')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <a
            href="/"
            className="h-11 rounded-xl bg-accent text-accent-text font-semibold flex items-center justify-center gap-2 hover:brightness-110 transition"
          >
            <Home className="w-4 h-4" />
            {t('notFound.home')}
          </a>
          <a
            href={`/editor/${randomPattern}`}
            className="h-11 rounded-xl border border-border text-text font-semibold flex items-center justify-center gap-2 hover:bg-border/30 transition"
          >
            <Compass className="w-4 h-4 text-accent" />
            {t('notFound.random')}
          </a>
        </div>

        <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-text-secondary">
          <button
            onClick={() => setFeedbackOpen(true)}
            className="flex items-center gap-2 hover:text-accent underline underline-offset-4 transition"
          >
            <MessageSquare className="w-4 h-4" />
            {t('notFound.report')}
          </button>
        </div>
      </div>

      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  );
}
