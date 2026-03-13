import { NextRequest, NextResponse } from 'next/server';
import { logActivity } from '@/lib/activity';
import { newsletterSubscriptionSchema } from '@/lib/forms';
import { upsertNewsletterSubscriber } from '@/lib/operational-compat';
import { rateLimit } from '@/lib/rate-limit';
import {
  getClientIp,
  isInvalidJsonBodyError,
  readJsonBody,
  validateTrustedOrigin,
} from '@/lib/request';

export async function POST(request: NextRequest) {
  try {
    const originCheck = validateTrustedOrigin(request);
    if (!originCheck.allowed) {
      return NextResponse.json({ error: originCheck.reason }, { status: 403 });
    }

    const body = await readJsonBody(request);
    const parsed = newsletterSubscriptionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const clientIp = getClientIp(request);
    const limit = await rateLimit(clientIp, {
      limit: 8,
      windowMs: 60 * 60 * 1000,
      prefix: 'newsletter',
    });

    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many subscription attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const { email, name, source } = parsed.data;

    const subscriber = await upsertNewsletterSubscriber({
      email,
      name: name || undefined,
    });

    await logActivity({
      action: 'subscribe',
      resource: 'newsletter',
      resourceId: subscriber.id,
      request,
      details: {
        source,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Subscribed successfully.',
    });
  } catch (error) {
    if (isInvalidJsonBodyError(error)) {
      return NextResponse.json(
        { error: 'Request body must be valid JSON.' },
        { status: 400 }
      );
    }

    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Unable to subscribe right now.' },
      { status: 500 }
    );
  }
}
