import DodoPayments from 'dodopayments';

// Instancia del cliente Dodo Payments configurada para test_mode por defecto
export const dodoClient = new DodoPayments({
  bearerToken: import.meta.env.VITE_DODO_PAYMENTS_API_KEY || 'dodo_test_dummy_key',
  environment: (import.meta.env.VITE_DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode') || 'test_mode',
});

// IDs de los productos configurados en Dodo Payments
export const DODO_PRODUCTS = {
  proMonthly: import.meta.env.VITE_DODO_PRODUCT_PRO_MONTHLY || 'pdt_pro_monthly',
  proLifetime: import.meta.env.VITE_DODO_PRODUCT_PRO_LIFETIME || 'pdt_pro_lifetime',
};

export interface CreateCheckoutOptions {
  productId: string;
  customerEmail?: string;
  returnUrl?: string;
}

/**
 * Crea una sesión de checkout en Dodo Payments.
 * En el cliente web/browser redirige a la checkout_url recibida.
 */
export async function initiateDodoCheckout({ productId, customerEmail, returnUrl }: CreateCheckoutOptions) {
  try {
    // Si la API key es de prueba o dummy, generamos una URL simulada o llamamos al SDK
    const return_url = returnUrl || `${window.location.origin}/?payment=success`;
    
    const session = await dodoClient.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: customerEmail ? { email: customerEmail } : undefined,
      return_url,
    });

    if (session.checkout_url) {
      window.location.href = session.checkout_url;
      return { success: true, url: session.checkout_url };
    }
    
    throw new Error('No se pudo generar la URL de checkout.');
  } catch (error: any) {
    console.warn('Dodo Checkout Fallback (simulación local / error de API):', error?.message || error);
    // Fallback gracioso para desarrollo local sin claves reales de Dodo
    return {
      success: false,
      error: error?.message || 'Error al iniciar la sesión de pago con Dodo Payments.',
    };
  }
}
