import { Moon, Sun, LogIn, User } from 'lucide-react';
import { Theme } from '../hooks/useTheme';
import { UserState } from '../lib/userTier';
import { useState } from 'react';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  user: UserState;
  onLogin: (email: string) => void;
  onNavigateDashboard: () => void;
}

export default function Header({ theme, onToggleTheme, user, onLogin, onNavigateDashboard }: HeaderProps) {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-blue flex items-center justify-center">
              <span className="text-text font-bold text-sm">GP</span>
            </div>
            <h1 className="text-xl font-bold text-text font-[family-name:var(--font-display)]">
              GeoPattern
            </h1>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-text-secondary transition-colors duration-200"
              title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-text" />
              ) : (
                <Sun className="w-4 h-4 text-text" />
              )}
            </button>

            {/* User/Login */}
            {user.isLoggedIn ? (
              <button
                onClick={onNavigateDashboard}
                className="flex items-center gap-2 px-4 py-2 bg-background-secondary border border-border rounded-lg hover:border-text-secondary transition-colors duration-200"
              >
                <User className="w-4 h-4 text-text" />
                <span className="text-sm font-medium text-text hidden sm:inline">Dashboard</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="flex items-center gap-2 px-4 py-2 bg-background-secondary border border-border rounded-lg hover:border-text-secondary transition-colors duration-200"
              >
                <LogIn className="w-4 h-4 text-text" />
                <span className="text-sm font-medium text-text hidden sm:inline">Iniciar Sesión</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLogin={(email) => {
            onLogin(email);
            setShowAuth(false);
          }}
        />
      )}
    </>
  );
}

function AuthModal({ onClose, onLogin }: { onClose: () => void; onLogin: (email: string) => void }) {
  const [email, setEmail] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-2xl shadow-2xl max-w-sm w-full p-8 border border-border">
        <h3 className="text-xl font-bold mb-2 font-[family-name:var(--font-display)] text-text">Iniciar Sesión</h3>
        <p className="text-sm text-text-secondary mb-6">
          Ingresa tu email para desbloquear más patrones
        </p>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background-secondary focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all text-text"
          />
          <button
            onClick={() => {
              if (email.trim()) onLogin(email.trim());
            }}
            className="w-full py-3 bg-accent-blue text-white font-medium rounded-xl hover:bg-accent-blue/90 transition-all"
          >
            Continuar con Email
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-background text-text-secondary">o</span>
            </div>
          </div>

          <button
            onClick={() => onLogin('demo@geopattern.app')}
            className="w-full py-3 bg-background-secondary text-text font-medium rounded-xl border border-border hover:border-accent-blue/30 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuar con Google
          </button>
        </div>
      </div>
    </div>
  );
}
