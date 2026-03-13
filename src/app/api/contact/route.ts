import { NextRequest, NextResponse } from 'next/server';
import { logActivity } from '@/lib/activity';
import { contactSubmissionSchema } from '@/lib/forms';
import { createContactSubmissionRecord } from '@/lib/operational-compat';
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
    const parsed = contactSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please complete all required fields with valid information.' },
        { status: 400 }
      );
    }

    const clientIp = getClientIp(request);
    const limit = await rateLimit(clientIp, {
      limit: 5,
      windowMs: 15 * 60 * 1000,
      prefix: 'contact',
    });

    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      );
    }

    const { name, email, subject, message, source, website } = parsed.data;

    if (website) {
      return NextResponse.json({ success: true, message: 'Submission received' });
    }

    try {
      const submission = await createContactSubmissionRecord({
        name,
        email,
        subject: subject || null,
        message,
        source: source || 'website',
      });

      await logActivity({
        action: 'create',
        resource: 'contact-submission',
        resourceId: submission.id,
        request,
        details: {
          source,
          subject: subject || null,
        },
      });
    } catch {
      return NextResponse.json(
        { error: 'Unable to submit your message right now. Please email directly.' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contact submission received',
    });
  } catch (error) {
    if (isInvalidJsonBodyError(error)) {
      return NextResponse.json(
        { error: 'Request body must be valid JSON.' },
        { status: 400 }
      );
    }

    console.error('Contact submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Contact API endpoint. Use POST to submit contact forms.',
  });
}
