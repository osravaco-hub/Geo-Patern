import { useState } from 'react';
import { useUser } from '@clerk/react';
import { Moon, Sun, User } from 'lucide-react';
import { Theme } from '../hooks/useTheme';
import { UserState } from '../lib/userTier';
import { SignInButton, UserButton } from '@clerk/react';
import DonateModal from './DonateModal';
import { useI18n } from '../i18n';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  user: UserState;
  onNavigateDashboard: () => void;
  onHome?: () => void;
  onPlans?: () => void;
  isHidden?: boolean;
}

export default function Header({ theme, onToggleTheme, user: _user, onNavigateDashboard: _onNavigateDashboard, onHome, onPlans, isHidden = false }: HeaderProps) {
  const { isSignedIn } = useUser();
  const { t } = useI18n();
  const [donateOpen, setDonateOpen] = useState(false);

  return (
    <>
      <header className={`sticky top-0 z-40 bg-header h-[60px] flex items-center justify-between px-4 sm:px-6 gap-3 transition-transform duration-300 ${isHidden ? '-translate-y-full lg:translate-y-0' : 'translate-y-0'}`}>
        <button onClick={onHome} className="flex items-center gap-2 text-left">
          <span className="text-2xl font-bold text-text font-[family-name:var(--font-body)] tracking-tight">GeoPattern</span>
          <span className="hidden sm:inline px-2 py-0.5 rounded-full border border-accent/60 bg-accent/15 text-accent-ink text-xs font-semibold tracking-wide">
            STUDIO 3D
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button onClick={onPlans} className="h-9 px-4 sm:px-6 rounded-lg bg-accent text-accent-text text-sm font-medium hover:brightness-110 transition">
            {t('header.plans')}
          </button>
          <button onClick={() => setDonateOpen(true)}
            className="hidden sm:flex h-9 px-6 items-center rounded-lg border border-text/70 text-text text-sm hover:bg-text/10 transition">
            {t('header.donate')}
          </button>
          <button disabled title={t('common.soon')}
            className="hidden md:block h-9 px-4 rounded-lg bg-border text-white text-sm cursor-not-allowed">
            {t('header.connectors')}
          </button>

          <button onClick={onToggleTheme} aria-label={t('header.themeToggle')}
            title={theme === 'dark' ? t('header.toLight') : t('header.toDark')}
            className="w-9 h-9 rounded-full bg-white text-[#282828] flex items-center justify-center hover:scale-105 transition">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2">
            {isSignedIn ? (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9",
                    userButtonPopoverActions: "flex-col gap-1",
                  }
                }}
              />
            ) : (
              <SignInButton mode="modal">
                <button className="w-9 h-9 rounded-full border border-text/70 text-text flex items-center justify-center hover:bg-text/10 transition" aria-label={t('header.signIn')}>
                  <User className="w-4 h-4" />
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>
      <DonateModal isOpen={donateOpen} onClose={() => setDonateOpen(false)} />
    </>
  );
}
