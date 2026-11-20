'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { META_PIXEL_ID, ensureMetaPixelInit, trackMetaEvent } from '@/lib/meta-pixel';

export function MetaPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrl = useRef<string | null>(null);

  useEffect(() => {
    ensureMetaPixelInit();
    const query = searchParams?.toString();
    const currentUrl = query ? `${pathname}?${query}` : pathname;

    if (lastTrackedUrl.current === currentUrl) return;
    lastTrackedUrl.current = currentUrl;

    trackMetaEvent('PageView');
  }, [pathname, searchParams]);

  return (
    <>
      <Script
        id="meta-pixel-fbevents"
        src="https://connect.facebook.net/en_US/fbevents.js"
        strategy="afterInteractive"
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
