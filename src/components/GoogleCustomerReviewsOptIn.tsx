import React from 'react';

interface GoogleCustomerReviewsOptInProps {
  orderId: string;
  email: string;
  deliveryCountry?: string;
  estimatedDeliveryDate: string;
  gtins?: string[];
}

export function GoogleCustomerReviewsOptIn({
  orderId,
  email,
  deliveryCountry = 'AR',
  estimatedDeliveryDate,
  gtins = [],
}: GoogleCustomerReviewsOptInProps) {
  const validGtins = gtins
    .map((g) => (g || '').trim())
    .filter(Boolean)
    .map((gtin) => ({ gtin }));

  const optInConfig: Record<string, any> = {
    merchant_id: 5884819397,
    order_id: orderId || 'ORDER_ID',
    email: email || 'cliente@klonfark.com',
    delivery_country: deliveryCountry,
    estimated_delivery_date: estimatedDeliveryDate,
    ...(validGtins.length > 0 ? { products: validGtins } : {}),
  };

  const inlineScript = `
  window.renderOptIn = function() {
    window.gapi.load('surveyoptin', function() {
      window.gapi.surveyoptin.render(${JSON.stringify(optInConfig)});
    });
  };
  if (window.gapi && window.gapi.load) {
    window.renderOptIn();
  }
`;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: inlineScript }} />
      <script
        src="https://apis.google.com/js/platform.js?onload=renderOptIn"
        async
        defer
      />
    </>
  );
}

