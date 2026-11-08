// User tier management - 2 tiers: 'free' and 'pro'
export type UserTier = 'free' | 'pro';

export interface UserState {
  tier: UserTier;
  email: string | null;
  isLoggedIn: boolean;
  planType?: 'monthly' | 'lifetime' | 'promo' | null;
  proUntil?: number | null; // Timestamp UNIX in milliseconds, or null/undefined for lifetime/promo permanent
  downloadsToday: number;
  totalDownloads: number;
}

export function isPro(user: UserState | null | undefined): boolean {
  if (!user || user.tier !== 'pro') return false;
  // If proUntil is set and expired, not pro
  if (user.proUntil && user.proUntil <= Date.now()) {
    return false;
  }
  return true;
}

export function getUserTier(user: UserState | null | undefined): UserTier {
  if (isPro(user)) return 'pro';
  return 'free';
}

export const DOWNLOAD_LIMITS: Record<UserTier, number> = {
  free: 3,
  pro: Infinity,
};

export function canDownload(tier: UserTier, downloadsToday: number): boolean {
  return downloadsToday < DOWNLOAD_LIMITS[tier];
}

export function getRemainingDownloads(tier: UserTier, downloadsToday: number): number {
  const limit = DOWNLOAD_LIMITS[tier];
  if (limit === Infinity) return Infinity;
  return Math.max(0, limit - downloadsToday);
}

export function getDefaultUser(): UserState {
  const stored = localStorage.getItem('geopattern_user');
  if (stored) {
    try {
      const parsed: UserState = JSON.parse(stored);
      // Check auto-expiration of pro
      if (parsed.tier === 'pro' && parsed.proUntil && parsed.proUntil <= Date.now()) {
        const expiredUser: UserState = {
          ...parsed,
          tier: 'free',
          planType: null,
          proUntil: null,
        };
        saveUser(expiredUser);
        return expiredUser;
      }
      // Migrate old guest/premium terms if present
      if ((parsed.tier as string) === 'guest') {
        return {
          ...parsed,
          tier: 'free',
        };
      }
      if ((parsed.tier as string) === 'premium') {
        return {
          ...parsed,
          tier: 'pro',
          planType: parsed.planType || 'monthly',
        };
      }
      return parsed;
    } catch {
      // ignore
    }
  }
  return {
    tier: 'free',
    email: null,
    isLoggedIn: false,
    planType: null,
    proUntil: null,
    downloadsToday: 0,
    totalDownloads: 0,
  };
}

export function saveUser(user: UserState) {
  localStorage.setItem('geopattern_user', JSON.stringify(user));
}

export function simulateLogin(email: string): UserState {
  const user: UserState = {
    tier: 'free',
    email,
    isLoggedIn: true,
    planType: null,
    proUntil: null,
    downloadsToday: 0,
    totalDownloads: 0,
  };
  saveUser(user);
  return user;
}

export function simulateProUpgrade(user: UserState, planType: 'monthly' | 'lifetime' = 'monthly', durationDays?: number): UserState {
  const now = Date.now();
  let proUntil: number | null = null;
  if (planType === 'monthly' || durationDays) {
    const days = durationDays || (planType === 'monthly' ? 30 : 365);
    const baseTime = user.proUntil && user.proUntil > now ? user.proUntil : now;
    proUntil = baseTime + days * 24 * 60 * 60 * 1000;
  } else {
    proUntil = null; // lifetime
  }

  const updated: UserState = {
    ...user,
    tier: 'pro',
    isLoggedIn: true,
    planType,
    proUntil,
  };
  saveUser(updated);
  return updated;
}

export function simulatePremiumUpgrade(user: UserState, planType: 'monthly' | 'lifetime' = 'monthly'): UserState {
  return simulateProUpgrade(user, planType);
}

export function recordDownload(user: UserState): UserState {
  const updated = {
    ...user,
    downloadsToday: user.downloadsToday + 1,
    totalDownloads: user.totalDownloads + 1,
  };
  saveUser(updated);
  return updated;
}

export const LOCKING_ENABLED = true;
