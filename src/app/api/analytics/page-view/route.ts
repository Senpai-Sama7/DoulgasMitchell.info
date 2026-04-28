import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { hasTable } from '@/lib/db-introspection';
import { rateLimit } from '@/lib/rate-limit';
import {
  getClientIp,
  getUserAgent,
  isInvalidJsonBodyError,
  readJsonBody,
  validateTrustedOrigin,
} from '@/lib/request';

const pageViewSchema = z.object({
  path: z.string().trim().min(1).max(200),
  sessionId: z.string().trim().min(8).max(120),
  referrer: z.string().trim().max(500).optional().default(''),
});

export async function POST(request: NextRequest) {
  try {
    const originCheck = validateTrustedOrigin(request);
    if (!originCheck.allowed) {
      return NextResponse.json({ success: true }, { status: 202 });
    }

    if (!(await hasTable('PageView'))) {
      return NextResponse.json({ success: true });
    }

    const body = await readJsonBody(request);
    const parsed = pageViewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { path, sessionId, referrer } = parsed.data;
    const clientIp = await getClientIp(request);
    const limit = await rateLimit(clientIp, {
      limit: 120,
      windowMs: 15 * 60 * 1000,
      prefix: 'page-view',
    });

    if (!limit.allowed) {
      return NextResponse.json({ success: true }, { status: 202 });
    }

    await db.pageView.create({
      data: {
        path,
        sessionId,
        referrer: referrer || undefined,
        ipAddress: clientIp,
        userAgent: getUserAgent(request),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isInvalidJsonBodyError(error)) {
      return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  }
}
