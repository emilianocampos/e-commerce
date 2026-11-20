'use client';

export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || '1820316399059246';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

export type MetaStandardEvent =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase';

interface TrackMetaOptions {
  eventId?: string;
  skipCapi?: boolean;
  userData?: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    city?: string;
    zip?: string;
  };
}

function generateEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function ensureMetaPixelInit() {
  if (typeof window === 'undefined') return;
  if (typeof window.fbq === 'function') return;

  const n: any = function (...args: any[]) {
    if (n.callMethod) {
      n.callMethod.apply(n, args);
    } else {
      n.queue.push(args);
    }
  };
  if (!window._fbq) window._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = '2.0';
  n.queue = [];
  window.fbq = n;
  n('init', META_PIXEL_ID);
}

export function trackMetaEvent(
  eventName: MetaStandardEvent,
  customData?: Record<string, any>,
  options?: TrackMetaOptions
): string {
  const eventId = options?.eventId || generateEventId();

  if (typeof window !== 'undefined') {
    try {
      ensureMetaPixelInit();
      if (typeof window.fbq === 'function') {
        if (customData && Object.keys(customData).length > 0) {
          window.fbq('track', eventName, customData, { eventID: eventId });
        } else {
          window.fbq('track', eventName, {}, { eventID: eventId });
        }
      }
    } catch (err) {
      console.error(`[Meta Pixel] Error al disparar ${eventName}:`, err);
    }

    if (!options?.skipCapi) {
      try {
        fetch('/api/meta-capi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventName,
            eventId,
            eventSourceUrl: window.location.href,
            customData,
            userData: options?.userData,
          }),
          keepalive: true,
        }).catch(() => {});
      } catch {
        // No bloquear UX si falla CAPI
      }
    }
  }

  return eventId;
}
