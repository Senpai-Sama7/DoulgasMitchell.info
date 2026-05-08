import { NextRequest, NextResponse } from 'next/server';
import { logActivity } from '@/lib/activity';
import { contactSubmissionSchema } from '@/lib/forms';
import { createContactSubmissionRecord } from '@/lib/operational-compat';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { sendEmail } from '@/lib/email';
import { env } from '@/lib/env';
import { sanitizeName, sanitizeEmail, sanitizeSubject, sanitizeText } from '@/lib/sanitize';
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

    const clientIp = await getClientIp(request);
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

    const sanitizedName = sanitizeName(name);
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedMessage = sanitizeText(message);
    const sanitizedSubject = subject ? sanitizeSubject(subject) : null;

    if (website) {
      return NextResponse.json({ success: true, message: 'Submission received' });
    }

    try {
      const submission = await createContactSubmissionRecord({
        name: sanitizedName,
        email: sanitizedEmail,
        subject: sanitizedSubject,
        message: sanitizedMessage,
        source: source || 'website',
      });

      await logActivity({
        action: 'create',
        resource: 'contact-submission',
        resourceId: submission.id,
        request,
        details: {
          source,
          subject: sanitizedSubject,
        },
      });

      const adminEmail = env.ADMIN_EMAIL;
      if (adminEmail) {
        void sendEmail({
          to: adminEmail,
          subject: sanitizedSubject ? `New contact: ${sanitizedSubject}` : 'New contact form submission',
          text: `Name: ${sanitizedName}\nEmail: ${sanitizedEmail}\nSubject: ${sanitizedSubject || 'N/A'}\nMessage:\n${sanitizedMessage}`,
          html: `<p><strong>Name:</strong> ${sanitizedName}</p>
<p><strong>Email:</strong> ${sanitizedEmail}</p>
<p><strong>Subject:</strong> ${sanitizedSubject || 'N/A'}</p>
<p><strong>Message:</strong></p>
<p>${sanitizedMessage.replace(/\n/g, '<br/>')}</p>`,
        }).then((result) => {
          if (!result.success) {
            logger.warn('Admin email notification failed:', result.error);
          }
        });
      }
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

    logger.error('Contact submission error:', error);
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
