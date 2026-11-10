// Analytics module - Simulates Plausible/Umami integration
// In production, this would integrate with actual analytics services

export type AnalyticsEvent =
  | 'pattern_generated'
  | 'download_started'
  | 'download_completed'
  | 'registration_completed'
  | 'checkout_started'
  | 'checkout_completed'
  | 'page_view';

export interface AnalyticsData {
  event: AnalyticsEvent;
  properties?: Record<string, any>;
  timestamp: number;
}

// Analytics queue for batching
let analyticsQueue: AnalyticsData[] = [];
let isInitialized = false;

/**
 * Initialize analytics service
 * In production: Initialize Plausible or Umami
 */
export function initAnalytics(): void {
  if (isInitialized) return;
  
  // In production with Plausible:
  // window.plausible = window.plausible || function() {
  //   (window.plausible.q = window.plausible.q || []).push(arguments)
  // };
  
  // In production with Umami:
  // const script = document.createElement('script');
  // script.src = process.env.NEXT_PUBLIC_UMAMI_URL;
  // script.setAttribute('data-website-id', process.env.NEXT_PUBLIC_UMAMI_ID);
  // document.head.appendChild(script);
  
  isInitialized = true;
  console.log('📊 Analytics initialized');
  
  // Track initial page view
  trackEvent('page_view', { path: window.location.pathname });
}

/**
 * Track analytics event
 */
export function trackEvent(event: AnalyticsEvent, properties?: Record<string, any>): void {
  const data: AnalyticsData = {
    event,
    properties,
    timestamp: Date.now(),
  };
  
  // Add to queue
  analyticsQueue.push(data);
  
  // Log in development
  console.log(`📊 [Analytics] ${event}`, properties);
  
  // Send to analytics service
  // In production with Plausible:
  // window.plausible(event, { props: properties });
  
  // In production with Umami:
  // umami.track(event, properties);
  
  // Batch send every 5 events or 2 seconds
  if (analyticsQueue.length >= 5) {
    flushAnalytics();
  }
}

/**
 * Flush analytics queue
 */
export function flushAnalytics(): void {
  if (analyticsQueue.length === 0) return;
  
  const batch = [...analyticsQueue];
  analyticsQueue = [];
  
  // In production: Send batch to analytics API
  // fetch('/api/analytics', {
  //   method: 'POST',
  //   body: JSON.stringify({ events: batch })
  // });
  
  console.log(`📊 Flushed ${batch.length} analytics events`);
}

/**
 * Track pattern generation
 */
export function trackPatternGenerated(patternType: string, config: any): void {
  trackEvent('pattern_generated', {
    pattern_type: patternType,
    density: config.density,
    rotation: config.rotation,
    scale: config.scale,
  });
}

/**
 * Track download started
 */
export function trackDownloadStarted(format: string, resolution: string): void {
  trackEvent('download_started', {
    format,
    resolution,
  });
}

/**
 * Track download completed
 */
export function trackDownloadCompleted(format: string, resolution: string, patternType: string): void {
  trackEvent('download_completed', {
    format,
    resolution,
    pattern_type: patternType,
  });
}

/**
 * Track user registration
 */
export function trackRegistrationCompleted(method: 'email' | 'google'): void {
  trackEvent('registration_completed', {
    method,
  });
}

/**
 * Track checkout started
 */
export function trackCheckoutStarted(plan: 'premium_monthly' | 'premium_yearly'): void {
  trackEvent('checkout_started', {
    plan,
  });
}

/**
 * Track checkout completed
 */
export function trackCheckoutCompleted(plan: 'premium_monthly' | 'premium_yearly'): void {
  trackEvent('checkout_completed', {
    plan,
  });
}

/**
 * Track page view
 */
export function trackPageView(path: string): void {
  trackEvent('page_view', { path });
}

/**
 * Get analytics dashboard URL
 * In production: Return actual dashboard URL
 */
export function getAnalyticsDashboardUrl(): string {
  // In production with Plausible:
  // return process.env.NEXT_PUBLIC_PLAUSIBLE_URL;
  
  // In production with Umami:
  // return process.env.NEXT_PUBLIC_UMAMI_URL;
  
  return 'https://analytics.example.com';
}

// Auto-flush analytics on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    flushAnalytics();
  });
  
  // Flush every 2 seconds
  setInterval(() => {
    flushAnalytics();
  }, 2000);
}
