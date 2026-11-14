import nodemailer from 'nodemailer';
import { buildVerificationEmail } from './verification-template';

export interface MailSendResult {
  ok: boolean;
  host: string;
  port: number;
  messageId?: string;
  error?: string;
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim() || 'localhost';
  const port = Number.parseInt(process.env.SMTP_PORT?.trim() || '1025', 10) || 1025;
  const user = process.env.SMTP_USER?.trim() || '';
  const pass = process.env.SMTP_PASS?.trim() || '';
  const from = process.env.SMTP_FROM?.trim() || 'Fresh Fold Laundry <records@freshfold.local>';
  return { host, port, user, pass, from };
}

export async function sendVerificationEmailNow(params: {
  to: string;
  fullName: string;
  docketNumber: number;
  code: string;
}): Promise<MailSendResult> {
  const cfg = getSmtpConfig();
  const content = buildVerificationEmail({
    fullName: params.fullName,
    docketNumber: params.docketNumber,
    code: params.code,
  });

  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    ...(cfg.user ? { auth: { user: cfg.user, pass: cfg.pass } } : {}),
  });

  try {
    const info = await transporter.sendMail({
      from: cfg.from,
      to: params.to,
      subject: content.subject,
      text: content.text,
      html: content.html,
    });
    return { ok: true, host: cfg.host, port: cfg.port, messageId: info.messageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'SMTP delivery failed';
    return { ok: false, host: cfg.host, port: cfg.port, error: message };
  }
}

/**
 * Dispatch verification email asynchronously outside the HTTP request/response cycle
 * so registration speed is decoupled from external SMTP latency and outages.
 */
export function enqueueVerificationEmail(params: {
  to: string;
  fullName: string;
  docketNumber: number;
  code: string;
}): void {
  setImmediate(async () => {
    const startedAt = Date.now();
    console.info(`[email-job] START verification email host=${process.env.SMTP_HOST || 'localhost'}`);
    const result = await sendVerificationEmailNow(params);
    const elapsedMs = Date.now() - startedAt;
    if (result.ok) {
      console.info(`[email-job] FINISH ok=true elapsedMs=${elapsedMs} messageId=${result.messageId ?? 'n/a'}`);
    } else {
      console.error(`[email-job] FINISH ok=false elapsedMs=${elapsedMs} reason=${result.error}`);
    }
  });
}
