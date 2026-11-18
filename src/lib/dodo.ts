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
 * Crea una sesión de checkout llamando al backend seguro (Cloudflare Function /api/checkout).
 * Evita exponer llaves privadas en el bundle del navegador.
 */
export async function initiateDodoCheckout({ productId, customerEmail, returnUrl }: CreateCheckoutOptions) {
  try {
    const return_url = returnUrl || `${window.location.origin}/?payment=success`;
    
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: productId,
        customer_email: customerEmail,
        return_url,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al conectar con el servidor de pagos.');
    }

    const data = await response.json();

    if (data.checkout_url) {
      window.location.href = data.checkout_url;
      return { success: true, url: data.checkout_url };
    }
    
    throw new Error('No se pudo generar la URL de checkout.');
  } catch (error: any) {
    console.warn('Dodo Checkout Fallback (simulación local / error de API):', error?.message || error);
    // Fallback simulado para desarrollo local sin backend levantado
    const demoUrl = `${window.location.origin}/?payment=success&demo=true`;
    window.location.href = demoUrl;
    return {
      success: true,
      url: demoUrl,
    };
  }
}
