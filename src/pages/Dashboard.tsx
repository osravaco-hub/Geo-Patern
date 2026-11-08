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
import { getDefaultUser, UserState, DOWNLOAD_LIMITS, saveUser, simulateLogin } from '../lib/userTier';
import { getDownloadHistory, DownloadRecord, getLimitInfo } from '../lib/limits';
import { PATTERN_DEFINITIONS } from '../lib/patterns';
import { createPortalSession } from '../lib/stripe';
import { useTheme } from '../hooks/useTheme';
import Header from '../components/Header';

interface DashboardProps {
  onBack: () => void;
}

export default function Dashboard({ onBack }: DashboardProps) {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<UserState>(getDefaultUser());
  const [history, setHistory] = useState<DownloadRecord[]>([]);

  const handleLogin = (email: string) => {
    setUser(simulateLogin(email));
  };

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
    saveUser(updated);
    setUser(updated);
  };

  const handleManageSubscription = async () => {
    if (user.tier !== 'premium') {
      alert('Solo los usuarios Premium pueden gestionar su suscripción');
      return;
    }

    try {
      // Simulate Stripe Customer Portal
      const portalUrl = await createPortalSession('user-id', 'cus_placeholder');
      
      // In production, redirect to Stripe Portal
      // window.location.href = portalUrl;
      
      alert('✅ Redirigiendo al Portal de Stripe\n\n(Demo: En producción serías redirigido a ' + portalUrl + ')');
    } catch (error) {
      console.error('Portal error:', error);
      alert('Error al abrir el portal de suscripción');
    }
  };

  const getPatternLabel = (id: string): string => {
    const def = PATTERN_DEFINITIONS.find((p) => p.id === id);
    return def ? def.label : id;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40">
        <Header
          theme={theme}
          onToggleTheme={toggleTheme}
          user={user}
          onLogin={handleLogin}
          onNavigateDashboard={onBack}
        />
        {/* Dashboard-specific header info */}
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
              user.tier === 'premium'
                ? 'bg-premium-light text-premium'
                : user.tier === 'free'
                  ? 'bg-accent-light text-accent'
                  : 'bg-border/50 text-text/50'
            }`}>
              {user.tier === 'premium' && <Crown className="w-3.5 h-3.5" />}
              {user.tier === 'premium' ? 'Premium' : user.tier === 'free' ? 'Free' : 'Invitado'}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold font-[family-name:var(--font-display)]">
            Hola, {user.email || 'Artista'} 👋
          </h2>
          <p className="text-text/60 mt-1">Aquí tienes un resumen de tu actividad.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Download className="w-5 h-5 text-accent" />}
            label="Total descargas"
            value={user.totalDownloads.toString()}
            color="accent"
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-premium" />}
            label="Hoy"
            value={todayHistory.length.toString()}
            color="premium"
          />
          <StatCard
            icon={<BarChart3 className="w-5 h-5 text-green-500" />}
            label="Límite diario"
            value={limitInfo.limit === '∞' ? 'Ilimitado' : `${limitInfo.used}/${limitInfo.limit}`}
            color="green"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-amber-500" />}
            label="Patrones únicos"
            value={Object.keys(patternCounts).length.toString()}
            color="amber"
          />
        </div>

        {/* Usage Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-border p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Uso de descargas hoy</h3>
            <button
              onClick={handleResetCounter}
              className="text-xs text-accent hover:underline"
            >
              Resetear contador (demo)
            </button>
          </div>
          <div className="w-full h-3 bg-border rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                typeof limitInfo.percentage === 'number' && limitInfo.percentage > 80
                  ? 'bg-red-400'
                  : typeof limitInfo.percentage === 'number' && limitInfo.percentage > 50
                    ? 'bg-amber-400'
                    : 'bg-accent'
              }`}
              style={{ width: `${typeof limitInfo.percentage === 'number' ? Math.min(limitInfo.percentage, 100) : 0}%` }}
            />
          </div>
          <p className="text-xs text-text/50 mt-2">
            {limitInfo.limit === '∞'
              ? 'Tienes descargas ilimitadas ✨'
              : `${limitInfo.used} de ${limitInfo.limit} descargas usadas esta semana`
            }
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Downloads */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-border p-6"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Download className="w-4 h-4 text-accent" />
              Descargas recientes
            </h3>
            {history.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🎨</div>
                <p className="text-sm text-text/50">Aún no has descargado ningún patrón</p>
                <button
                  onClick={onBack}
                  className="mt-3 text-sm text-accent hover:underline"
                >
                  Ir al generador →
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {history.slice(0, 10).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 bg-background rounded-xl"
                  >
                    <div>
                      <div className="text-sm font-medium">{getPatternLabel(record.patternType)}</div>
                      <div className="text-xs text-text/50">{record.format.toUpperCase()}</div>
                    </div>
                    <div className="text-xs text-text/40">
                      {new Date(record.timestamp).toLocaleTimeString('es', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Top Patterns */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-border p-6"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-premium" />
              Patrones favoritos
            </h3>
            {topPatterns.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-sm text-text/50">Los patrones más usados aparecerán aquí</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topPatterns.map(([pattern, count]) => {
                  const maxCount = topPatterns[0][1];
                  const percentage = (count / maxCount) * 100;
                  return (
                    <div key={pattern}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{getPatternLabel(pattern)}</span>
                        <span className="text-xs text-text/50">{count}x</span>
                      </div>
                      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-accent to-premium rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Plan Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`mt-8 rounded-2xl p-6 border ${
            user.tier === 'premium'
              ? 'bg-gradient-to-br from-premium/5 to-accent/5 border-premium/20'
              : 'bg-white border-border'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                {user.tier === 'premium' ? (
                  <>
                    <Crown className="w-5 h-5 text-premium" />
                    Plan Premium
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-accent" />
                    Plan {user.tier === 'free' ? 'Gratuito' : 'Invitado'}
                  </>
                )}
              </h3>
              <p className="text-sm text-text/60 mt-1">
                {user.tier === 'premium'
                  ? 'Acceso completo: 12 patrones, exportación ilimitada, todas las resoluciones.'
                  : user.tier === 'free'
                    ? '3 descargas/semana • 8 patrones (ultra-básicos + básicos) • PNG hasta 1200px'
                    : 'Descargas ilimitadas • 3 patrones ultra-básicos • PNG 600px'
                }
              </p>
            </div>
            {user.tier === 'premium' ? (
              <button
                onClick={handleManageSubscription}
                className="px-4 py-2 bg-white text-premium text-sm font-medium rounded-xl border border-premium/30 hover:bg-premium-light transition-all shrink-0 ml-4 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Gestionar Suscripción
              </button>
            ) : (
              <button
                onClick={onBack}
                className="px-4 py-2 bg-gradient-to-r from-premium to-accent text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all shrink-0 ml-4"
              >
                Upgrade
              </button>
            )}
          </div>
        </motion.div>

        {/* BEGIN AADS AD UNIT 2461364 */}
        <div id="frame" className="mt-10" style={{ width: '100%', margin: 'auto', position: 'relative', zIndex: 99998 }}>
          <iframe data-aa='2461364' src='//acceptable.a-ads.com/2461364/?size=Adaptive'
            style={{ border: 0, padding: 0, width: '70%', height: 'auto', overflow: 'hidden', display: 'block', margin: 'auto' }}></iframe>
        </div>
        {/* END AADS AD UNIT 2461364 */}

      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const bgColors: Record<string, string> = {
    accent: 'bg-accent-light',
    premium: 'bg-premium-light',
    green: 'bg-green-50',
    amber: 'bg-amber-50',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl border border-border p-5"
    >
      <div className={`w-10 h-10 rounded-xl ${bgColors[color] || 'bg-border'} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-text/50">{label}</div>
    </motion.div>
  );
}
