// Precio mostrado en la interfaz. El importe real lo define el producto en Dodo Payments.
export const PRO_PRICE_LABEL = '$29.99';

/** Pide al servidor una sesión de pago. El navegador solo envía su sesión de Clerk. */
export async function createProCheckout(token: string): Promise<{ url?: string; error?: string }> {
  try {
    const res = await fetch('/api/checkout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: data.error ?? 'No se pudo iniciar el pago' };
    if (!data.checkout_url) return { error: 'No se recibió la página de pago' };
    return { url: data.checkout_url };
  } catch {
    return { error: 'No se pudo conectar con el servidor de pagos' };
  }
}
