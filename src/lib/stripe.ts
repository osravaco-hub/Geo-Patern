// Stripe integration logic (simulated for Vite environment)
// In production, this would be server-side code in Next.js API routes

export type SubscriptionInterval = 'month' | 'year';

export interface CheckoutSession {
  id: string;
  url: string;
  customer_email: string;
  interval: SubscriptionInterval;
}

export interface StripeConfig {
  publicKey: string;
  prices: {
    month: string;
    year: string;
  };
}

// Simulated Stripe config (would come from environment variables)
const STRIPE_CONFIG: StripeConfig = {
  publicKey: 'pk_test_placeholder',
  prices: {
    month: 'price_month_placeholder',
    year: 'price_year_placeholder',
  },
};

/**
 * Creates a Stripe Checkout session
 * In production: POST /api/checkout
 */
export async function createCheckoutSession(
  userId: string,
  email: string,
  interval: SubscriptionInterval
): Promise<CheckoutSession> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // In production, this would call Stripe API:
  // const session = await stripe.checkout.sessions.create({
  //   mode: 'subscription',
  //   customer_email: email,
  //   line_items: [{
  //     price: STRIPE_CONFIG.prices[interval],
  //     quantity: 1,
  //   }],
  //   success_url: `${window.location.origin}/dashboard?success=true`,
  //   cancel_url: `${window.location.origin}/?canceled=true`,
  // });

  // Simulated response
  const sessionId = `cs_test_${Date.now()}`;
  const checkoutUrl = `https://checkout.stripe.com/pay/${sessionId}`;

  return {
    id: sessionId,
    url: checkoutUrl,
    customer_email: email,
    interval,
  };
}

/**
 * Creates a Stripe Customer Portal session
 * In production: POST /api/portal
 */
export async function createPortalSession(
  userId: string,
  stripeCustomerId: string
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // In production:
  // const session = await stripe.billingPortal.sessions.create({
  //   customer: stripeCustomerId,
  //   return_url: `${window.location.origin}/dashboard`,
  // });

  return `https://billing.stripe.com/session/${stripeCustomerId}`;
}

/**
 * Handles Stripe webhook events
 * In production: POST /api/webhook
 */
export async function handleStripeWebhook(event: {
  type: string;
  data: {
    object: {
      customer: string;
      customer_email?: string;
    };
  };
}): Promise<{ success: boolean; message: string }> {
  // Verify webhook signature (in production)
  // const signature = request.headers['stripe-signature'];
  // const event = stripe.webhooks.constructEvent(
  //   requestBody,
  //   signature,
  //   process.env.STRIPE_WEBHOOK_SECRET
  // );

  switch (event.type) {
    case 'checkout.session.completed': {
      // Update user to premium in database
      const customerId = event.data.object.customer;
      console.log(`✅ Subscription completed for customer: ${customerId}`);
      
      // In production:
      // await supabase
      //   .from('users')
      //   .update({ 
      //     plan: 'premium',
      //     stripe_customer_id: customerId 
      //   })
      //   .eq('stripe_customer_id', customerId);

      return { success: true, message: 'User upgraded to premium' };
    }

    case 'customer.subscription.deleted': {
      // Downgrade user to free
      const customerId = event.data.object.customer;
      console.log(`⚠️ Subscription cancelled for customer: ${customerId}`);

      // In production:
      // await supabase
      //   .from('users')
      //   .update({ plan: 'free' })
      //   .eq('stripe_customer_id', customerId);

      return { success: true, message: 'User downgraded to free' };
    }

    default:
      return { success: false, message: `Unhandled event type: ${event.type}` };
  }
}

/**
 * Gets the price for a subscription interval
 */
export function getSubscriptionPrice(interval: SubscriptionInterval): {
  amount: number;
  currency: string;
  formatted: string;
} {
  const prices = {
    month: { amount: 4.99, currency: 'USD', formatted: '$4.99/mes' },
    year: { amount: 39.99, currency: 'USD', formatted: '$39.99/año' },
  };

  return prices[interval];
}

/**
 * Calculates savings for yearly subscription
 */
export function calculateYearlySavings(): {
  monthlyCost: number;
  yearlyCost: number;
  savings: number;
  savingsPercentage: number;
} {
  const monthlyCost = 4.99 * 12; // $59.88
  const yearlyCost = 39.99;
  const savings = monthlyCost - yearlyCost; // $19.89
  const savingsPercentage = (savings / monthlyCost) * 100; // 33%

  return {
    monthlyCost,
    yearlyCost,
    savings,
    savingsPercentage: Math.round(savingsPercentage),
  };
}
