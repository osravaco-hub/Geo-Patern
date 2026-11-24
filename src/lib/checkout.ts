export type PlanId = 'monthly' | 'annual' | 'lifetime';

// Precios mostrados en la interfaz. El importe real lo define cada producto en Dodo Payments:
// si cambias un precio allí, cámbialo también aquí. Los textos de cada plan están en src/i18n.
export const PLANS: { id: PlanId; price: string }[] = [
  { id: 'monthly', price: '$6.99' },
  { id: 'annual', price: '$78' },
  { id: 'lifetime', price: '$120' },
];

/** Resultado de las llamadas al servidor: o una URL, o un código de error que la interfaz traduce. */
export interface ApiResult { url?: string; errorCode?: string; detail?: string }

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
export async function createCheckout(token: string, plan: PlanId): Promise<ApiResult> {
  try {
    const { ok, data } = await post('/api/checkout', token, { plan });
    if (!ok) return { errorCode: data.code ?? 'generic', detail: data.detail };
    if (!data.checkout_url) return { errorCode: 'no_checkout_url' };
    return { url: data.checkout_url };
  } catch {
    return { errorCode: 'network' };
  }
}

/** Abre el portal de Dodo para cancelar la suscripción o cambiar la forma de pago. */
export async function openBillingPortal(token: string): Promise<ApiResult> {
  try {
    const { ok, data } = await post('/api/portal', token);
    if (!ok) return { errorCode: data.code ?? 'portal_failed', detail: data.detail };
    return { url: data.url };
  } catch {
    return { errorCode: 'network' };
  }
}
