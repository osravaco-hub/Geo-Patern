export type PlanId = 'monthly' | 'annual' | 'lifetime';

// Precios mostrados en la interfaz. El importe real lo define cada producto en Dodo Payments:
// si cambias un precio allí, cámbialo también aquí.
export const PLANS: { id: PlanId; name: string; price: string; period: string; note: string }[] = [
  { id: 'monthly', name: 'Mensual', price: '$6.99', period: '/mes', note: 'Se renueva cada mes' },
  { id: 'annual', name: 'Anual', price: '$78', period: '/año', note: '≈ $6.50 al mes · ahorras $5.88 al año' },
  { id: 'lifetime', name: 'Vitalicio', price: '$120', period: 'pago único', note: 'Sin renovaciones, para siempre' },
];

export const PLAN_LABELS: Record<string, string> = {
  monthly: 'Pro mensual',
  annual: 'Pro anual',
  lifetime: 'Pro vitalicio',
  promo: 'Pro',
};

async function post(path: string, token: string, body?: unknown) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

/** Pide al servidor una sesión de pago para el plan elegido. El navegador solo envía su sesión de Clerk. */
export async function createCheckout(token: string, plan: PlanId): Promise<{ url?: string; error?: string }> {
  try {
    const { ok, data } = await post('/api/checkout', token, { plan });
    if (!ok) return { error: data.error ?? 'No se pudo iniciar el pago' };
    if (!data.checkout_url) return { error: 'No se recibió la página de pago' };
    return { url: data.checkout_url };
  } catch {
    return { error: 'No se pudo conectar con el servidor de pagos' };
  }
}

/** Abre el portal de Dodo para cancelar la suscripción o cambiar la forma de pago. */
export async function openBillingPortal(token: string): Promise<{ url?: string; error?: string }> {
  try {
    const { ok, data } = await post('/api/portal', token);
    if (!ok) return { error: data.error ?? 'No se pudo abrir el portal' };
    return { url: data.url };
  } catch {
    return { error: 'No se pudo conectar con el servidor' };
  }
}
