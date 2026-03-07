import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getClientIp, getUserAgent } from '@/lib/request';

const pageViewSchema = z.object({
  path: z.string().trim().min(1).max(200),
  sessionId: z.string().trim().min(8).max(120),
  referrer: z.string().trim().max(500).optional().default(''),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = pageViewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { path, sessionId, referrer } = parsed.data;

    await db.pageView.create({
      data: {
        path,
        sessionId,
        referrer: referrer || undefined,
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
