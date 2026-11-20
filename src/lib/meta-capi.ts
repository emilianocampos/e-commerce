import { createHash } from 'crypto';

export const META_PIXEL_ID =
  process.env.META_PIXEL_ID ||
  process.env.NEXT_PUBLIC_META_PIXEL_ID ||
  '1820316399059246';

export interface MetaCapiUserData {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  city?: string | null;
  zip?: string | null;
  country?: string | null;
  externalId?: string | null;
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
}

export interface MetaCapiEventInput {
  eventName: 'PageView' | 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase' | string;
  eventId: string;
  eventSourceUrl?: string;
  userData?: MetaCapiUserData;
  customData?: Record<string, any>;
  eventTime?: number;
}

function sha256Normalize(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  // Si es número argentino local sin código de país, anteponer 54
  if (!digits.startsWith('54') && digits.length <= 11) {
    return `54${digits}`;
  }
  return digits;
}

export async function sendMetaCapiEvent(input: MetaCapiEventInput): Promise<{
  ok: boolean;
  skipped?: boolean;
  status?: number;
  error?: string;
}> {
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!accessToken) {
    return { ok: false, skipped: true, error: 'META_CAPI_ACCESS_TOKEN not configured' };
  }

  try {
    const u = input.userData || {};
    const hashedUserData: Record<string, any> = {};

    if (u.email) hashedUserData.em = [sha256Normalize(u.email)];
    if (u.phone) {
      const normalizedPhone = normalizePhone(u.phone);
      if (normalizedPhone) hashedUserData.ph = [sha256Normalize(normalizedPhone)];
    }
    if (u.firstName) hashedUserData.fn = [sha256Normalize(u.firstName)];
    if (u.lastName) hashedUserData.ln = [sha256Normalize(u.lastName)];
    if (u.city) hashedUserData.ct = [sha256Normalize(u.city)];
    if (u.zip) hashedUserData.zp = [sha256Normalize(u.zip)];
    if (u.country) hashedUserData.country = [sha256Normalize(u.country)];
    if (u.externalId) hashedUserData.external_id = [sha256Normalize(u.externalId)];

    if (u.clientIpAddress) hashedUserData.client_ip_address = u.clientIpAddress;
    if (u.clientUserAgent) hashedUserData.client_user_agent = u.clientUserAgent;
    if (u.fbp) hashedUserData.fbp = u.fbp;
    if (u.fbc) hashedUserData.fbc = u.fbc;

    const eventPayload: Record<string, any> = {
      event_name: input.eventName,
      event_time: input.eventTime || Math.floor(Date.now() / 1000),
      event_id: input.eventId,
      action_source: 'website',
      user_data: hashedUserData,
    };

    if (input.eventSourceUrl) {
      eventPayload.event_source_url = input.eventSourceUrl;
    }

    if (input.customData && Object.keys(input.customData).length > 0) {
      eventPayload.custom_data = input.customData;
    }

    const body: Record<string, any> = {
      data: [eventPayload],
    };

    if (process.env.META_TEST_EVENT_CODE) {
      body.test_event_code = process.env.META_TEST_EVENT_CODE;
    }

    const url = `https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(accessToken)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Meta CAPI] Error (${res.status}) enviando ${input.eventName}:`, errText);
      return { ok: false, status: res.status, error: errText };
    }

    return { ok: true, status: res.status };
  } catch (err: any) {
    console.error(`[Meta CAPI] Excepción enviando ${input.eventName}:`, err?.message || err);
    return { ok: false, error: err?.message || 'Unknown error' };
  }
}
