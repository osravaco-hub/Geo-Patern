// Worker de GeoPattern: atiende /api/* (pago con Dodo Payments) y deja el resto a los archivos estáticos.
import DodoPayments from 'dodopayments';
import { createClerkClient, verifyToken } from '@clerk/backend';

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  // Secretos
  CLERK_SECRET_KEY?: string;
  DODO_PAYMENTS_API_KEY?: string;
  DODO_PAYMENTS_WEBHOOK_KEY?: string;
  // Variables
  DODO_PAYMENTS_ENVIRONMENT?: string;
  DODO_PRODUCT_PRO_LIFETIME?: string;
}

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

const dodoClient = (env: Env, extra: { webhookKey?: string } = {}) =>
  new DodoPayments({
    bearerToken: env.DODO_PAYMENTS_API_KEY!,
    environment: env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode' ? 'live_mode' : 'test_mode',
    ...extra,
  });

// ───────────────────────── POST /api/checkout ─────────────────────────
// El navegador solo envía su sesión de Clerk. El producto, el precio y la URL de retorno los decide el servidor.
async function handleCheckout(request: Request, env: Env): Promise<Response> {
  if (!env.CLERK_SECRET_KEY || !env.DODO_PAYMENTS_API_KEY || !env.DODO_PRODUCT_PRO_LIFETIME) {
    console.error('checkout: faltan secretos o variables de entorno');
    return json({ error: 'El pago no está configurado todavía' }, 500);
  }

  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'Inicia sesión para comprar' }, 401);

  let userId: string;
  try {
    const payload = await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY }); // lanza error si no es válido
    userId = payload.sub;
  } catch {
    return json({ error: 'Tu sesión no es válida. Vuelve a iniciar sesión' }, 401);
  }

  try {
    const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });
    const user = await clerk.users.getUser(userId);
    if ((user.publicMetadata as Record<string, unknown>)?.tier === 'pro') {
      return json({ error: 'Tu cuenta ya es Pro' }, 409);
    }
    const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress;

    const checkout = await dodoClient(env).checkoutSessions.create({
      product_cart: [{ product_id: env.DODO_PRODUCT_PRO_LIFETIME, quantity: 1 }],
      customer: email ? { email } : undefined,
      metadata: { clerk_user_id: userId }, // el webhook usa esto para saber a quién activar
      return_url: `${new URL(request.url).origin}/?payment=success`,
    });
    return json({ checkout_url: checkout.checkout_url });
  } catch (err) {
    console.error('checkout: error', err);
    return json({ error: 'No se pudo crear el pago. Inténtalo de nuevo en unos minutos' }, 502);
  }
}

// ───────────────────────── POST /api/dodo-webhook ─────────────────────────
// Única vía para activar Pro. Verifica la firma, confirma el pago con la API de Dodo y actualiza Clerk.
async function handleWebhook(request: Request, env: Env): Promise<Response> {
  if (!env.CLERK_SECRET_KEY || !env.DODO_PAYMENTS_API_KEY || !env.DODO_PAYMENTS_WEBHOOK_KEY || !env.DODO_PRODUCT_PRO_LIFETIME) {
    console.error('webhook: faltan secretos o variables de entorno');
    return new Response('No configurado', { status: 500 });
  }

  const raw = await request.text(); // cuerpo exacto, necesario para validar la firma
  let event: any;
  try {
    event = dodoClient(env, { webhookKey: env.DODO_PAYMENTS_WEBHOOK_KEY }).webhooks.unwrap(raw, {
      headers: {
        'webhook-id': request.headers.get('webhook-id') ?? '',
        'webhook-signature': request.headers.get('webhook-signature') ?? '',
        'webhook-timestamp': request.headers.get('webhook-timestamp') ?? '',
      },
    });
  } catch {
    return new Response('Firma no válida', { status: 401 });
  }

  const type: string = event?.type ?? '';
  if (type !== 'payment.succeeded' && type !== 'refund.succeeded') return new Response('ignorado');
  const paymentId: string | undefined = event?.data?.payment_id;
  if (!paymentId) return new Response('sin payment_id');

  // Si algo falla devolvemos 500 y Dodo reintenta el aviso más tarde
  try {
    const payment: any = await dodoClient(env).payments.retrieve(paymentId); // no se confía solo en el aviso
    const userId: string | undefined = payment?.metadata?.clerk_user_id;
    const isPro = Array.isArray(payment?.product_cart) &&
      payment.product_cart.some((i: any) => i.product_id === env.DODO_PRODUCT_PRO_LIFETIME);
    if (!isPro) return new Response('pago ajeno a Pro');
    if (!userId) {
      console.error('webhook: pago Pro sin clerk_user_id; revisar a mano', paymentId);
      return new Response('sin usuario');
    }

    const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });
    if (type === 'payment.succeeded') {
      if (payment.status !== 'succeeded') return new Response('pago no completado');
      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: { tier: 'pro', planType: 'lifetime', proUntil: null, dodoPaymentId: paymentId },
      });
      return new Response('pro activado');
    }

    // Reembolso total: se retira Pro. Los parciales no cambian el plan.
    if (event?.data?.is_partial === false) {
      await clerk.users.updateUserMetadata(userId, { publicMetadata: { tier: 'free', planType: null, proUntil: null } });
      return new Response('pro retirado');
    }
    return new Response('reembolso parcial');
  } catch (err) {
    console.error('webhook: error procesando', paymentId, err);
    return new Response('Error interno', { status: 500 });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/checkout' || pathname === '/api/dodo-webhook') {
      if (request.method !== 'POST') return new Response('Método no permitido', { status: 405, headers: { Allow: 'POST' } });
      return pathname === '/api/checkout' ? handleCheckout(request, env) : handleWebhook(request, env);
    }
    if (pathname.startsWith('/api/')) return json({ error: 'No encontrado' }, 404);
    return env.ASSETS.fetch(request);
  },
};
