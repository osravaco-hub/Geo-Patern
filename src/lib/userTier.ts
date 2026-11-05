// User tier management
export type UserTier = 'guest' | 'free' | 'premium';

export interface User {
  id?: string;
  email?: string | null;
  plan?: 'free' | 'premium';
  isLoggedIn?: boolean;
}

export function getUserTier(user: User | null | undefined): UserTier {
  if (!user || !user.isLoggedIn) return 'guest';
  if (user.plan === 'premium') return 'premium';
  return 'free';
}

export interface UserState {
  tier: UserTier;
  email: string | null;
  isLoggedIn: boolean;
  downloadsToday: number;
  totalDownloads: number;
}

export const DOWNLOAD_LIMITS: Record<UserTier, number> = {
  guest: 3,
  free: 10,
  premium: Infinity,
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
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  return {
    tier: 'guest',
    email: null,
    isLoggedIn: false,
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
    downloadsToday: 0,
    totalDownloads: 0,
  };
  saveUser(user);
  return user;
}

export function simulatePremiumUpgrade(user: UserState): UserState {
  const updated = { ...user, tier: 'premium' as UserTier };
  saveUser(updated);
  return updated;
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
