// Weekly download limits and tracking
import { UserTier } from './userTier';

export interface DownloadRecord {
  id: string;
  patternType: string;
  format: string;
  timestamp: number;
}

// Weekly limits by tier
export const WEEKLY_LIMITS: Record<UserTier, number> = {
  free: Infinity,
  pro: Infinity,
};

export function getDownloadHistory(): DownloadRecord[] {
  const stored = localStorage.getItem('geopattern_downloads');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

export function addDownloadRecord(patternType: string, format: string): DownloadRecord {
  const record: DownloadRecord = {
    id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
    patternType,
    format,
    timestamp: Date.now(),
  };
  const history = getDownloadHistory();
  history.unshift(record);
  // Keep only last 200 records
  const trimmed = history.slice(0, 200);
  localStorage.setItem('geopattern_downloads', JSON.stringify(trimmed));
  return record;
}

export function getWeeklyDownloads(userId?: string): number {
  const history = getDownloadHistory();
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  
  return history.filter((r) => r.timestamp >= sevenDaysAgo).length;
}

export function canDownload(userId: string | undefined, tier: UserTier): { allowed: boolean; remaining: number } {
  const limit = WEEKLY_LIMITS[tier];
  
  if (limit === Infinity) {
    return { allowed: true, remaining: Infinity };
  }
  
  const used = getWeeklyDownloads(userId);
  const remaining = Math.max(0, limit - used);
  
  return {
    allowed: remaining > 0,
    remaining,
  };
}

export function getTodayDownloads(): number {
  const history = getDownloadHistory();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return history.filter((r) => r.timestamp >= today.getTime()).length;
}

export function isLimitReached(tier: UserTier): boolean {
  const limit = WEEKLY_LIMITS[tier];
  if (limit === Infinity) return false;
  return getWeeklyDownloads() >= limit;
}

export function getLimitInfo(tier: UserTier): { used: number; limit: number | string; percentage: number } {
  const limit = WEEKLY_LIMITS[tier];
  const used = getWeeklyDownloads();
  
  if (limit === Infinity) {
    return { used, limit: '∞', percentage: 0 };
  }
  
  return { 
    used, 
    limit, 
    percentage: Math.min(100, (used / limit) * 100) 
  };
}
