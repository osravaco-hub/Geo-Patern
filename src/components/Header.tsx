import { Moon, Sun, LogIn, User } from 'lucide-react';
import { useState } from 'react';
import { Theme } from '../hooks/useTheme';
import { UserState } from '../lib/userTier';

// TODO: reemplazar por tu enlace real de Ko-fi
export const KOFI_URL = 'https://ko-fi.com/';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  user: UserState;
  onLogin: (email: string) => void;
  onNavigateDashboard: () => void;
  onHome?: () => void;
  onPlans?: () => void;
}

export default function Header({ theme, onToggleTheme, user, onLogin, onNavigateDashboard, onHome, onPlans }: HeaderProps) {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-header h-[60px] flex items-center justify-between px-4 sm:px-6 gap-3">
        <button onClick={onHome} className="flex items-center gap-2 text-left">
          <span className="text-2xl font-bold text-text font-[family-name:var(--font-body)] tracking-tight">GeoPattern</span>
          <span className="hidden sm:inline px-2 py-0.5 rounded-full border border-accent/60 bg-accent/15 text-accent text-xs font-semibold tracking-wide">
            STUDIO 3D
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button onClick={onPlans} className="h-9 px-4 sm:px-6 rounded-lg bg-accent text-accent-text text-sm font-medium hover:brightness-110 transition">
            Planes
          </button>
          <a href={KOFI_URL} target="_blank" rel="noopener noreferrer"
            className="hidden sm:flex h-9 px-6 items-center rounded-lg border border-text/70 text-text text-sm hover:bg-text/10 transition">
            Donar
          </a>
          <button disabled title="Próximamente: complemento para Figma"
            className="hidden md:block h-9 px-4 rounded-lg bg-border text-white text-sm cursor-not-allowed">
            Figma
          </button>

          <button onClick={onToggleTheme} aria-label="Cambiar modo claro/oscuro"
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="w-9 h-9 rounded-full bg-white text-[#282828] flex items-center justify-center hover:scale-105 transition">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => (user.isLoggedIn ? onNavigateDashboard() : setShowAuth(true))}
            aria-label={user.isLoggedIn ? 'Mi cuenta' : 'Iniciar sesión'}
            title={user.isLoggedIn ? 'Mi cuenta' : 'Iniciar sesión'}
            className="w-9 h-9 rounded-full border border-text/70 text-text flex items-center justify-center hover:bg-text/10 transition">
            {user.isLoggedIn ? <User className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={(e) => { onLogin(e); setShowAuth(false); }} />}
    </>
  );
}

function AuthModal({ onClose, onLogin }: { onClose: () => void; onLogin: (email: string) => void }) {
  const [email, setEmail] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-2xl shadow-2xl max-w-sm w-full p-8 border border-border">
        <h3 className="text-3xl font-semibold mb-2 text-text">Iniciar sesión</h3>
        <p className="text-sm text-text-secondary mb-6">Ingresa tu email para guardar tu cuenta</p>
        <div className="space-y-4">
          <input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background-secondary focus:border-accent outline-none text-text" />
          <button onClick={() => email.trim() && onLogin(email.trim())}
            className="w-full py-3 bg-accent text-accent-text font-medium rounded-xl hover:brightness-110 transition">
            Continuar con email
          </button>
        </div>
      </div>
    </div>
  );
}
