import { useUser, useAuth } from '@clerk/react';
import { UserState, getDefaultUser, saveUser, recordDownload } from '../lib/userTier';
import { useCallback, useEffect, useRef, useState } from 'react';

export type PaymentStatus = 'idle' | 'checking' | 'success' | 'timeout';

/**
 * Sincroniza el estado de Clerk con nuestro UserState local.
 * - El plan (tier) SOLO viene de Clerk (publicMetadata). Únicamente el servidor puede modificarlo,
 *   a través del webhook de Dodo: el navegador no puede concederse Pro.
 * - Los contadores de descargas viven en localStorage.
 */
export function useClerkUser(): {
  user: UserState;
  isLoaded: boolean;
  signOut: () => void;
  registerDownload: () => void;
  paymentStatus: PaymentStatus;
  dismissPayment: () => void;
} {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut } = useAuth();
  const [localUser, setLocalUser] = useState<UserState>(getDefaultUser);
  const [isLoaded, setIsLoaded] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const polled = useRef(false);

  useEffect(() => {
    if (!clerkLoaded) return;

    if (!clerkUser) {
      const freeUser: UserState = { ...getDefaultUser(), tier: 'free', email: null, isLoggedIn: false };
      setLocalUser(freeUser);
      saveUser(freeUser);
      setIsLoaded(true);
      return;
    }

    const clerkTier = (clerkUser.publicMetadata?.tier as 'free' | 'pro') || 'free';
    const planType = (clerkUser.publicMetadata?.planType as 'monthly' | 'annual' | 'lifetime' | 'promo' | null) || null;
    const proUntil = (clerkUser.publicMetadata?.proUntil as number | null) || null;

    const syncedUser: UserState = {
      tier: clerkTier,
      email: clerkUser.primaryEmailAddress?.emailAddress || null,
      isLoggedIn: true,
      planType,
      proUntil,
      downloadsToday: localUser.downloadsToday || 0,
      totalDownloads: localUser.totalDownloads || 0,
    };

    if (syncedUser.tier === 'pro' && syncedUser.proUntil && syncedUser.proUntil <= Date.now()) {
      syncedUser.tier = 'free';
      syncedUser.planType = null;
      syncedUser.proUntil = null;
    }

    setLocalUser(syncedUser);
    saveUser(syncedUser);
    setIsLoaded(true);
  }, [clerkUser, clerkLoaded, localUser.downloadsToday, localUser.totalDownloads]);

  // Al volver de Dodo (?payment=success) se espera a que el webhook active Pro en Clerk
  useEffect(() => {
    if (!clerkLoaded || polled.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') !== 'success') return;
    polled.current = true;
    window.history.replaceState({}, '', window.location.pathname);
    if (!clerkUser) return;

    if (clerkUser.publicMetadata?.tier === 'pro') { setPaymentStatus('success'); return; }
    setPaymentStatus('checking');
    let tries = 0;
    const id = setInterval(async () => {
      tries++;
      try { await clerkUser.reload(); } catch { /* se reintenta */ }
      if (clerkUser.publicMetadata?.tier === 'pro') { clearInterval(id); setPaymentStatus('success'); }
      else if (tries >= 12) { clearInterval(id); setPaymentStatus('timeout'); }
    }, 2500);
  }, [clerkLoaded, clerkUser]);

  const registerDownload = useCallback(() => setLocalUser(prev => recordDownload(prev)), []);
  const dismissPayment = useCallback(() => setPaymentStatus('idle'), []);

  return { user: localUser, isLoaded, signOut, registerDownload, paymentStatus, dismissPayment };
}
