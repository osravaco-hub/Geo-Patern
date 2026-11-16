import { useUser, useAuth } from '@clerk/clerk-react';
import { UserState, getDefaultUser, saveUser, simulateProUpgrade, isPro } from '../lib/userTier';
import { useEffect, useState } from 'react';

/**
 * Hook que sincroniza el estado de Clerk con nuestro UserState local.
 * - Usa Clerk para autenticación real
 * - Mantiene userTier en localStorage para límites offline y metadatos extra
 * - Sincroniza el tier 'pro' desde Clerk metadata (publicMetadata.tier)
 */
export function useClerkUser(): {
  user: UserState;
  isLoaded: boolean;
  signOut: () => void;
} {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut } = useAuth();
  const [localUser, setLocalUser] = useState<UserState>(getDefaultUser);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!clerkLoaded) return;

    if (!clerkUser) {
      // Usuario no autenticado en Clerk -> free tier
      const freeUser: UserState = {
        ...getDefaultUser(),
        tier: 'free',
        email: null,
        isLoggedIn: false,
      };
      setLocalUser(freeUser);
      saveUser(freeUser);
      setIsLoaded(true);
      return;
    }

    // Usuario autenticado en Clerk
    const clerkTier = (clerkUser.publicMetadata?.tier as 'free' | 'pro') || 'free';
    const planType = (clerkUser.publicMetadata?.planType as 'monthly' | 'lifetime' | 'promo' | null) || null;
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

    // Verificar expiración de pro
    if (syncedUser.tier === 'pro' && syncedUser.proUntil && syncedUser.proUntil <= Date.now()) {
      syncedUser.tier = 'free';
      syncedUser.planType = null;
      syncedUser.proUntil = null;
    }

    setLocalUser(syncedUser);
    saveUser(syncedUser);
    setIsLoaded(true);
  }, [clerkUser, clerkLoaded, localUser.downloadsToday, localUser.totalDownloads]);

  // Función para actualizar tier localmente (se usa tras pago exitoso)
  const upgradeToPro = (planType: 'monthly' | 'lifetime' = 'monthly', durationDays?: number) => {
    setLocalUser(prev => {
      const updated = simulateProUpgrade(prev, planType, durationDays);
      saveUser(updated);
      return updated;
    });
  };

  return {
    user: localUser,
    isLoaded,
    signOut,
    upgradeToPro,
  };
}