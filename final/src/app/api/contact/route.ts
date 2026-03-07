import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/activity';
import { contactSubmissionSchema } from '@/lib/forms';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/request';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please complete all required fields with valid information.' },
        { status: 400 }
      );
    }

    const clientIp = getClientIp(request);
    const limit = rateLimit(clientIp, {
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
      const submission = await db.contactSubmission.create({
        data: {
          name,
          email,
          subject: subject || null,
          message,
          source: source || 'website',
          status: 'new',
        },
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
