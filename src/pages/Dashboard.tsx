import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Crown,
  Download,
  Sparkles,
  BarChart3,
  Clock,
  TrendingUp,
  Settings,
} from 'lucide-react';
import { getDownloadHistory, DownloadRecord, getLimitInfo } from '../lib/limits';
import { PATTERN_DEFINITIONS } from '../lib/patterns';
import { useTheme } from '../hooks/useTheme';
import Header from '../components/Header';
import { useUserContext } from '../context/UserContext';

interface DashboardProps {
  onBack: () => void;
}

export default function Dashboard({ onBack }: DashboardProps) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useUserContext();
  const [history, setHistory] = useState<DownloadRecord[]>([]);

  useEffect(() => {
    setHistory(getDownloadHistory());
  }, []);

  const limitInfo = getLimitInfo(user.tier);

  const todayHistory = history.filter((r) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return r.timestamp >= today.getTime();
  });

  const patternCounts = history.reduce((acc, r) => {
    acc[r.patternType] = (acc[r.patternType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topPatterns = Object.entries(patternCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const handleResetCounter = () => {
    const updated = { ...user, downloadsToday: 0 };
    // @ts-ignore (need to update context if we want to reset)
    // setUser(updated);
  };

  const handleManageSubscription = async () => {
    if (user.tier !== 'pro') {
      alert('Solo los usuarios Pro pueden gestionar su suscripción');
      return;
    }

    const dodoPortalUrl = `https://${import.meta.env.VITE_DODO_PAYMENTS_ENVIRONMENT === 'live_mode' ? 'live' : 'test'}.dodopayments.com/portal`;
    
    alert(`Redirigiendo al portal de gestión de suscripciones de Dodo Payments...\n\n${dodoPortalUrl}`);
    window.open(dodoPortalUrl, '_blank');
  };

  const getPatternLabel = (id: string): string => {
    const def = PATTERN_DEFINITIONS.find((p) => p.id === id);
    return def ? def.label : id;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40">
        <Header
          theme={theme}
          onToggleTheme={toggleTheme}
          user={user}
          onNavigateDashboard={onBack}
        />
        <div className="bg-background border-b border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-border/50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-premium flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-lg font-bold font-[family-name:var(--font-display)]">Dashboard</h1>
              </div>
            </div>

            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              user.tier === 'pro'
                ? 'bg-premium-light text-premium'
                : 'bg-border text-text'
            }`}>
              {user.tier === 'pro' ? <Crown className="w-4 h-4" /> : null}
              {user.tier === 'pro' ? 'Plan Pro' : 'Plan Free'}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-background-secondary p-6 rounded-2xl border border-border">
            <div className="flex items-center gap-3 mb-2">
              <Download className="w-5 h-5 text-accent" />
              <h3 className="font-medium text-text/70">Descargas hoy</h3>
            </div>
            <p className="text-3xl font-bold">{user.downloadsToday} / {limitInfo.limit === Infinity ? '∞' : limitInfo.limit}</p>
          </div>
          
          <div className="bg-background-secondary p-6 rounded-2xl border border-border">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-accent" />
              <h3 className="font-medium text-text/70">Total descargas</h3>
            </div>
            <p className="text-3xl font-bold">{user.totalDownloads}</p>
          </div>

          <div className="bg-background-secondary p-6 rounded-2xl border border-border flex flex-col justify-center gap-3">
             <button
              onClick={handleManageSubscription}
              className="w-full py-2.5 bg-accent text-white font-medium rounded-xl hover:opacity-90 transition-all text-sm"
            >
              Gestionar suscripción
            </button>
          </div>
        </section>
        
        <section className="bg-background-secondary p-6 rounded-2xl border border-border">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Patrones más descargados
          </h2>
          <div className="space-y-4">
            {topPatterns.length > 0 ? topPatterns.map(([id, count]) => (
              <div key={id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="font-medium text-text/80">{getPatternLabel(id)}</span>
                <span className="text-accent font-bold">{count} veces</span>
              </div>
            )) : (
              <p className="text-text/60 text-sm italic">Aún no hay descargas.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
