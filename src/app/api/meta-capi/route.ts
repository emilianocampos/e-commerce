import { NextRequest, NextResponse } from 'next/server';
import { sendMetaCapiEvent } from '@/lib/meta-capi';
import { getUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventName, eventId, eventSourceUrl, customData, userData } = body || {};

    if (!eventName || !eventId) {
      return NextResponse.json(
        { error: 'eventName y eventId son requeridos' },
        { status: 400 }
      );
    }

    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIpAddress = forwardedFor
      ? forwardedFor.split(',')[0].trim()
      : request.headers.get('x-real-ip') || null;
    const clientUserAgent = request.headers.get('user-agent') || null;

    const fbp = request.cookies.get('_fbp')?.value || null;
    const fbc = request.cookies.get('_fbc')?.value || null;

    let userEmail = userData?.email || null;
    let externalId = userData?.externalId || null;

    if (!userEmail) {
      try {
        const user = await getUser();
        if (user) {
          userEmail = user.email || null;
          externalId = user.id || null;
        }
      } catch {
        // Ignorar si no hay sesión
      }
    }

    const result = await sendMetaCapiEvent({
      eventName,
      eventId,
      eventSourceUrl,
      customData,
      userData: {
        ...userData,
        email: userEmail,
        externalId,
        country: userData?.country || 'ar',
        clientIpAddress,
        clientUserAgent,
        fbp,
        fbc,
      },
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('[API /api/meta-capi] Error:', error?.message || error);
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }
}
