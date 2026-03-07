import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/activity';
import { newsletterSubscriptionSchema } from '@/lib/forms';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/request';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = newsletterSubscriptionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const clientIp = getClientIp(request);
    const limit = rateLimit(clientIp, {
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

    const subscriber = await db.newsletter.upsert({
      where: { email },
      update: {
        isActive: true,
        name: name || undefined,
      },
      create: {
        email,
        name: name || undefined,
        confirmedAt: new Date(),
      },
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
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Unable to subscribe right now.' },
      { status: 500 }
    );
  }
}
