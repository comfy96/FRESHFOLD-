import { loadEmailTokens } from './tokens';
import { OTP_EXPIRY_MINUTES } from '@/lib/security/otp';

export interface VerificationEmailContent {
  subject: string;
  text: string;
  html: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildVerificationEmail(params: {
  fullName: string;
  docketNumber: number;
  code: string;
}): VerificationEmailContent {
  const tokens = loadEmailTokens();
  const safeName = escapeHtml(params.fullName);
  const safeCode = escapeHtml(params.code);

  const subject = 'Fresh Fold Laundry: confirm your customer record email';
  const text = [
    `Hello ${params.fullName},`,
    '',
    `Our records show a new customer account request for shop docket #${params.docketNumber}.`,
    `Your verification code is: ${params.code}`,
    '',
    `This code stays valid for ${OTP_EXPIRY_MINUTES} minutes and works once.`,
    'If you did not open a Fresh Fold Laundry account today, ignore this message.',
  ].join('\n');

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:24px 12px;background-color:${tokens.surface};color:${tokens.onSurface};font-family:${tokens.fontSans};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;margin:0 auto;background-color:${tokens.surfaceContainerLow};border:1px solid ${tokens.outlineVariant};border-radius:12px;overflow:hidden;">
      <tr>
        <td style="background-color:${tokens.primary};color:${tokens.onPrimary};padding:18px 24px;font-size:18px;font-weight:700;letter-spacing:-0.15px;">
          Fresh Fold Laundry
        </td>
      </tr>
      <tr>
        <td style="padding:24px;">
          <h1 style="margin:0 0 10px;font-size:20px;line-height:1.4;color:${tokens.onSurface};font-weight:600;">
            Confirm your email address
          </h1>
          <p style="margin:0 0 14px;font-size:15px;line-height:1.5;color:${tokens.onSurfaceVariant};">
            Hello ${safeName}, our records show a customer portal registration for shop docket <strong>#${params.docketNumber}</strong>.
          </p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.5;color:${tokens.onSurfaceVariant};">
            Enter this 6-digit code in the verification box within <strong>${OTP_EXPIRY_MINUTES} minutes</strong>:
          </p>
          <div style="margin:0 0 18px;padding:16px 20px;background-color:${tokens.primaryContainer};color:${tokens.onPrimaryContainer};border:1px solid ${tokens.primary};border-radius:8px;text-align:center;font-size:28px;font-weight:700;letter-spacing:6px;">
            ${safeCode}
          </div>
          <p style="margin:0;font-size:13px;line-height:1.5;color:${tokens.onSurfaceVariant};">
            Each code works once. If you did not create a record with us today, no account is verified unless this code is entered.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}
