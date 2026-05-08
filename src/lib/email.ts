import { createTransport, type Transporter } from 'nodemailer';
import { env } from './env';
import { logger } from './logger';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  const host = env.SMTP_HOST;
  const user = env.SMTP_USER;
  const pass = env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  transporter = createTransport({
    host,
    port: Number(env.SMTP_PORT || 587),
    secure: Number(env.SMTP_PORT || 587) === 465,
    auth: { user, pass },
  });

  return transporter;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const transport = getTransporter();
  if (!transport) {
    logger.warn('Email not sent: SMTP is not configured.');
    return { success: false, error: 'SMTP not configured' };
  }

  const fromAddress = options.from || env.FROM_EMAIL || env.SMTP_USER || 'noreply@douglasmitchell.info';

  try {
    const result = await transport.sendMail({
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    logger.info(`Email sent to ${options.to}: ${result.messageId}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error('Failed to send email:', msg);
    return { success: false, error: msg };
  }
}

export function isEmailConfigured(): boolean {
  return !!getTransporter();
}
