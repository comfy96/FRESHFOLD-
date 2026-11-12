import crypto from 'crypto';

export const OTP_EXPIRY_MINUTES = 7;
export const OTP_MAX_ATTEMPTS = 5;

/** Generate a 6-digit verification code using Node's CSPRNG (crypto.randomInt). */
export function generateSixDigitCode(): string {
  return crypto.randomInt(100_000, 1_000_000).toString();
}

/** Hash an OTP code with SHA-256 for storage alongside the verification row. */
export function hashOtpCode(code: string): string {
  return crypto.createHash('sha256').update(code.trim()).digest('hex');
}

/** Constant-time digest comparison between submitted 6-digit code and stored SHA-256 hash. */
export function verifyOtpHash(candidateCode: string, storedHash: string): boolean {
  const candidateHash = hashOtpCode(candidateCode);
  const a = Buffer.from(candidateHash, 'hex');
  const b = Buffer.from(storedHash, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function getOtpExpiryDate(from = new Date()): Date {
  return new Date(from.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);
}
