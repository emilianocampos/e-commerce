'use client';

import { useEffect, useRef } from 'react';
import { trackMetaEvent } from '@/lib/meta-pixel';

interface MetaViewContentTrackerProps {
  productId: string;
  title: string;
  category?: string;
  price: number;
  currency?: string;
}

export function MetaViewContentTracker({
  productId,
  title,
  category,
  price,
  currency = 'ARS',
}: MetaViewContentTrackerProps) {
  const trackedId = useRef<string | null>(null);

  useEffect(() => {
    if (!productId || trackedId.current === productId) return;
    trackedId.current = productId;

    trackMetaEvent('ViewContent', {
      content_ids: [productId],
      content_name: title,
      content_category: category || 'Productos',
      content_type: 'product',
      value: Number(price || 0),
      currency,
    });
  }, [productId, title, category, price, currency]);

  return null;
}

interface PurchaseItem {
  id: string;
  quantity: number;
  item_price: number;
}

interface MetaPurchaseTrackerProps {
  orderId?: string;
  value?: number;
  currency?: string;
  items?: PurchaseItem[];
  email?: string;
  phone?: string;
}

export function MetaPurchaseTracker({
  orderId,
  value,
  currency = 'ARS',
  items = [],
  email,
  phone,
}: MetaPurchaseTrackerProps) {
  useEffect(() => {
    if (!orderId || !value) return;

    const storageKey = `meta_purchase_tracked_${orderId}`;
    try {
      if (typeof window !== 'undefined' && window.sessionStorage.getItem(storageKey)) {
        return;
      }
    } catch {
      // Ignorar si sessionStorage no está disponible
    }

    const contentIds = items.map((i) => i.id).filter(Boolean);
    const numItems = items.reduce((acc, i) => acc + (i.quantity || 1), 0);

    trackMetaEvent(
      'Purchase',
      {
        content_ids: contentIds,
        contents: items,
        content_type: 'product',
        num_items: numItems || 1,
        value: Number(value),
        currency,
        order_id: orderId,
      },
      {
        eventId: `purchase_${orderId}`,
        userData: {
          email: email || undefined,
          phone: phone || undefined,
        },
      }
    );

    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(storageKey, '1');
      }
    } catch {
      // Ignorar
    }
  }, [orderId, value, currency, items, email, phone]);

  return null;
}
