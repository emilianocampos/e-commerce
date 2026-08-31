'use client';

import { useEffect } from 'react';

interface GoogleAdsConversionTrackerProps {
  transactionId?: string;
  value?: number;
  currency?: string;
}

export function GoogleAdsConversionTracker({
  transactionId,
  value,
  currency = 'ARS',
}: GoogleAdsConversionTrackerProps) {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag && transactionId && value) {
      try {
        (window as any).gtag('event', 'purchase', {
          transaction_id: transactionId,
          value: Number(value),
          currency: currency,
        });
      } catch (e) {
        console.error('Error firing purchase conversion event:', e);
      }
    }
  }, [transactionId, value, currency]);

  return null;
}
