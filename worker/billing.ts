// Lógica de planes: decide cuándo activar o retirar Pro. No hace llamadas de red por sí misma:
// recibe las operaciones (Dodo y Clerk) desde fuera, así se puede probar sin conexión.

export type Plan = 'monthly' | 'annual' | 'lifetime';

export interface Products { monthly: string; annual: string; lifetime: string }

export interface Deps {
  getSubscription(id: string): Promise<{
    status: string;
    product_id: string;
    metadata?: Record<string, string>;
    next_billing_date?: string;
    customer?: { customer_id?: string };
  }>;
  getPayment(id: string): Promise<{
    status: string;
    metadata?: Record<string, string>;
    product_cart?: { product_id: string }[] | null;
    customer?: { customer_id?: string };
  }>;
  getMeta(userId: string): Promise<Record<string, unknown>>;
  setMeta(userId: string, meta: Record<string, unknown>): Promise<void>;
  log(...args: unknown[]): void;
}

// Margen para que un renovación retrasada no deje al usuario sin Pro de inmediato
const GRACE_MS = 3 * 24 * 60 * 60 * 1000;

export const planOf = (productId: string | undefined, p: Products): Plan | null =>
  productId === p.monthly ? 'monthly' : productId === p.annual ? 'annual' : productId === p.lifetime ? 'lifetime' : null;

const FREE = { tier: 'free', planType: null, proUntil: null, dodoSubscriptionId: null, dodoPaymentId: null };
const INACTIVE = ['on_hold', 'paused', 'cancelled', 'expired', 'failed'];

/** Procesa un evento ya verificado de Dodo. Devuelve un texto corto con lo que hizo. Lanza error si algo de red falla. */
export async function processEvent(type: string, data: any, products: Products, deps: Deps): Promise<string> {
  // ── Suscripciones (mensual y anual): se confía en el estado real que devuelve Dodo, no en el aviso ──
  if (type.startsWith('subscription.')) {
    const subId: string | undefined = data?.subscription_id;
    if (!subId) return 'sin subscription_id';
    const sub = await deps.getSubscription(subId);
    const plan = planOf(sub.product_id, products);
    if (!plan || plan === 'lifetime') return 'producto ajeno';

    const userId = sub.metadata?.clerk_user_id;
    if (!userId) { deps.log('suscripción sin clerk_user_id; revisar a mano', subId); return 'sin usuario'; }

    const meta = await deps.getMeta(userId);
    if (meta.tier === 'pro' && meta.planType === 'lifetime') return 'ya es vitalicio'; // nunca se rebaja a un vitalicio

    if (sub.status === 'active') {
      const until = Date.parse(sub.next_billing_date ?? '');
      await deps.setMeta(userId, {
        tier: 'pro',
        planType: plan,
        proUntil: Number.isFinite(until) ? until + GRACE_MS : null,
        dodoSubscriptionId: subId,
        dodoCustomerId: sub.customer?.customer_id ?? null,
      });
      return 'pro activo';
    }
    if (INACTIVE.includes(sub.status)) {
      if (meta.dodoSubscriptionId === subId) { await deps.setMeta(userId, FREE); return 'pro retirado'; }
      return 'suscripción antigua';
    }
    return `sin cambios (${sub.status})`;
  }

  // ── Pago único (vitalicio) y reembolsos ──
  if (type === 'payment.succeeded' || type === 'refund.succeeded') {
    const paymentId: string | undefined = data?.payment_id;
    if (!paymentId) return 'sin payment_id';
    const pay = await deps.getPayment(paymentId);
    const items = pay.product_cart ?? [];
    if (!items.some(i => i.product_id === products.lifetime)) {
      return items.some(i => planOf(i.product_id, products)) ? 'lo gestionan los eventos de suscripción' : 'pago ajeno';
    }

    const userId = pay.metadata?.clerk_user_id;
    if (!userId) { deps.log('pago vitalicio sin clerk_user_id; revisar a mano', paymentId); return 'sin usuario'; }

    if (type === 'payment.succeeded') {
      if (pay.status !== 'succeeded') return 'pago no completado';
      await deps.setMeta(userId, {
        tier: 'pro',
        planType: 'lifetime',
        proUntil: null,
        dodoPaymentId: paymentId,
        dodoSubscriptionId: null,
        dodoCustomerId: pay.customer?.customer_id ?? null,
      });
      return 'pro vitalicio activado';
    }

    // Reembolso total del pago vitalicio: se retira Pro. Los parciales no cambian el plan.
    if (data?.is_partial === false) {
      const meta = await deps.getMeta(userId);
      if (meta.dodoPaymentId === paymentId) { await deps.setMeta(userId, FREE); return 'pro retirado'; }
      return 'reembolso de un pago antiguo';
    }
    return 'reembolso parcial';
  }

  return 'ignorado';
}
