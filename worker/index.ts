// Worker de GeoPattern: atiende /api/* (pago con Dodo Payments) y deja el resto a los archivos estáticos.
import DodoPayments from 'dodopayments';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { Plan, Products, processEvent } from './billing';

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  // Secretos
  CLERK_SECRET_KEY?: string;
  DODO_PAYMENTS_API_KEY?: string;
  DODO_PAYMENTS_WEBHOOK_KEY?: string;
  // Variables
  DODO_PAYMENTS_ENVIRONMENT?: string;
  DODO_PRODUCT_PRO_MONTHLY?: string;
  DODO_PRODUCT_PRO_ANNUAL?: string;
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

const missing = (env: Env, names: (keyof Env)[]) => names.filter(n => !env[n]);

const verifyUser = async (request: Request, env: Env): Promise<string | null> => {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  try {
    const payload = await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY! }); // lanza error si no es válido
    return payload.sub;
  } catch {
    return null;
  }
};

const productsOf = (env: Env): Products => ({
  monthly: env.DODO_PRODUCT_PRO_MONTHLY!,
  annual: env.DODO_PRODUCT_PRO_ANNUAL!,
  lifetime: env.DODO_PRODUCT_PRO_LIFETIME!,
});

// ───────────────────────── POST /api/checkout ─────────────────────────
// El navegador solo indica el plan ("monthly" | "annual" | "lifetime") y envía su sesión de Clerk.
// El producto y la URL de retorno los decide el servidor.
async function handleCheckout(request: Request, env: Env): Promise<Response> {
  const lacking = missing(env, ['CLERK_SECRET_KEY', 'DODO_PAYMENTS_API_KEY', 'DODO_PRODUCT_PRO_MONTHLY', 'DODO_PRODUCT_PRO_ANNUAL', 'DODO_PRODUCT_PRO_LIFETIME']);
  if (lacking.length) {
    console.error('checkout: falta configurar', lacking.join(', '));
    return json({ error: `El pago no está configurado todavía. Falta en Cloudflare: ${lacking.join(', ')}` }, 500);
  }

  const userId = await verifyUser(request, env);
  if (!userId) {
    return json({ error: request.headers.get('authorization') ? 'Tu sesión no es válida. Vuelve a iniciar sesión' : 'Inicia sesión para comprar' }, 401);
  }

  const body = await request.json().catch(() => ({})) as { plan?: string };
  const plan = body.plan as Plan | undefined;
  if (plan !== 'monthly' && plan !== 'annual' && plan !== 'lifetime') return json({ error: 'Plan no válido' }, 400);
  const productId = productsOf(env)[plan];

  try {
    const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });
    const user = await clerk.users.getUser(userId);
    if ((user.publicMetadata as Record<string, unknown>)?.tier === 'pro') {
      return json({ error: 'Tu cuenta ya es Pro. Si quieres cambiar de plan, gestiona tu suscripción desde tu cuenta' }, 409);
    }
    const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress;

    const checkout = await dodoClient(env).checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
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

// ───────────────────────── POST /api/portal ─────────────────────────
// Enlace al portal de Dodo para cancelar o cambiar la forma de pago de una suscripción.
async function handlePortal(request: Request, env: Env): Promise<Response> {
  const lacking = missing(env, ['CLERK_SECRET_KEY', 'DODO_PAYMENTS_API_KEY']);
  if (lacking.length) return json({ error: `Falta configurar en Cloudflare: ${lacking.join(', ')}` }, 500);

  const userId = await verifyUser(request, env);
  if (!userId) return json({ error: 'Inicia sesión' }, 401);

  try {
    const user = await createClerkClient({ secretKey: env.CLERK_SECRET_KEY }).users.getUser(userId);
    const customerId = (user.publicMetadata as Record<string, unknown>)?.dodoCustomerId;
    if (typeof customerId !== 'string' || !customerId) return json({ error: 'No encontramos una compra asociada a tu cuenta' }, 404);
    const session = await dodoClient(env).customers.customerPortal.create(customerId, { return_url: new URL(request.url).origin });
    return json({ url: session.link });
  } catch (err) {
    console.error('portal: error', err);
    return json({ error: 'No se pudo abrir el portal. Inténtalo de nuevo' }, 502);
  }
}

// ───────────────────────── POST /api/dodo-webhook ─────────────────────────
// Única vía para activar Pro. Verifica la firma y delega la decisión en billing.ts.
async function handleWebhook(request: Request, env: Env): Promise<Response> {
  const lacking = missing(env, ['CLERK_SECRET_KEY', 'DODO_PAYMENTS_API_KEY', 'DODO_PAYMENTS_WEBHOOK_KEY', 'DODO_PRODUCT_PRO_MONTHLY', 'DODO_PRODUCT_PRO_ANNUAL', 'DODO_PRODUCT_PRO_LIFETIME']);
  if (lacking.length) {
    console.error('webhook: falta configurar', lacking.join(', '));
    return new Response('No configurado', { status: 500 });
  }

  const raw = await request.text(); // cuerpo exacto, necesario para validar la firma
  const dodo = dodoClient(env, { webhookKey: env.DODO_PAYMENTS_WEBHOOK_KEY });
  let event: any;
  try {
    event = dodo.webhooks.unwrap(raw, {
      headers: {
        'webhook-id': request.headers.get('webhook-id') ?? '',
        'webhook-signature': request.headers.get('webhook-signature') ?? '',
        'webhook-timestamp': request.headers.get('webhook-timestamp') ?? '',
      },
    });
  } catch {
    return new Response('Firma no válida', { status: 401 });
  }

  const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });
  try {
    const result = await processEvent(event?.type ?? '', event?.data, productsOf(env), {
      getSubscription: id => dodo.subscriptions.retrieve(id) as any,
      getPayment: id => dodo.payments.retrieve(id) as any,
      getMeta: async userId => ((await clerk.users.getUser(userId)).publicMetadata ?? {}) as Record<string, unknown>,
      setMeta: async (userId, meta) => { await clerk.users.updateUserMetadata(userId, { publicMetadata: meta }); },
      log: (...a) => console.error('webhook:', ...a),
    });
    return new Response(result);
  } catch (err) {
    // Dodo reintenta el aviso más tarde cuando respondemos 500
    console.error('webhook: error procesando', event?.type, err);
    return new Response('Error interno', { status: 500 });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/checkout' || pathname === '/api/portal' || pathname === '/api/dodo-webhook') {
      if (request.method !== 'POST') return new Response('Método no permitido', { status: 405, headers: { Allow: 'POST' } });
      if (pathname === '/api/checkout') return handleCheckout(request, env);
      if (pathname === '/api/portal') return handlePortal(request, env);
      return handleWebhook(request, env);
    }
    if (pathname.startsWith('/api/')) return json({ error: 'No encontrado' }, 404);
    return env.ASSETS.fetch(request);
  },
};
