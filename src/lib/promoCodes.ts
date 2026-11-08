import { UserState } from './userTier';

export interface PromoCodeEntry {
  code: string;
  type: 'duration' | 'permanent';
  durationDays?: number;
  description: string;
}

export const PROMO_CODES_CATALOG: Record<string, { type: 'duration' | 'permanent'; days?: number; description: string }> = {
  'PROMO30': { type: 'duration', days: 30, description: '30 días de acceso Pro' },
  'PROMOTEST': { type: 'permanent', description: 'Acceso Pro Permanente' },
  'VIP7': { type: 'duration', days: 7, description: '7 días de acceso Pro' },
  'GEO2026': { type: 'duration', days: 30, description: '30 días de acceso Pro' },
};

export interface PromoResult {
  success: boolean;
  message: string;
  updatedUser?: UserState;
}

export function validateAndApplyPromoCode(code: string, currentUser: UserState): PromoResult {
  if (!code || typeof code !== 'string') {
    return { success: false, message: 'Introduce un código promocional válido.' };
  }

  const normalizedCode = code.trim().toUpperCase();
  const promo = PROMO_CODES_CATALOG[normalizedCode];

  if (!promo) {
    return { success: false, message: 'Código promocional inválido o expirado.' };
  }

  const now = Date.now();
  let newProUntil: number | null = null;

  if (promo.type === 'duration' && promo.days) {
    const baseTime = currentUser.proUntil && currentUser.proUntil > now ? currentUser.proUntil : now;
    newProUntil = baseTime + promo.days * 24 * 60 * 60 * 1000;
  } else {
    newProUntil = null; // Permanente
  }

  const updatedUser: UserState = {
    ...currentUser,
    tier: 'pro',
    isLoggedIn: true,
    planType: 'promo',
    proUntil: newProUntil,
  };

  return {
    success: true,
    message: promo.type === 'permanent'
      ? '¡Código canjeado! Acceso Pro Permanente activado.'
      : `¡Código canjeado! Acceso Pro activado por ${promo.days} días.`,
    updatedUser,
  };
}
