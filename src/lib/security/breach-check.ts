import crypto from 'crypto';

export interface BreachCheckResult {
  breached: boolean;
  count: number;
  source: 'hibp' | 'offline-corpus' | 'unavailable';
}

const KNOWN_BREACHED_CORPUS = new Set([
  'password123',
  '1234567890',
  'qwerty12345',
  'letmein1234',
  'welcome1234',
  'admin123456',
  'football123',
  'iloveyou123',
]);

/**
 * Check a trimmed password against Have I Been Pwned's Pwned Passwords API using k-anonymity:
 * only the first 5 characters of its SHA-1 hex digest leave this server.
 */
export async function checkBreachedPassword(password: string): Promise<BreachCheckResult> {
  const trimmed = password.trim();
  const sha1 = crypto.createHash('sha1').update(trimmed).digest('hex').toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  try {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const body = await res.text();
      for (const line of body.split('\n')) {
        const [candidateSuffix, rawCount] = line.trim().split(':');
        if (candidateSuffix === suffix) {
          const count = Number.parseInt(rawCount ?? '1', 10) || 1;
          return { breached: true, count, source: 'hibp' };
        }
      }
      return { breached: false, count: 0, source: 'hibp' };
    }
  } catch {
    // Fall back to small local corpus if network / upstream HIBP is unreachable.
  }

  if (KNOWN_BREACHED_CORPUS.has(trimmed.toLowerCase())) {
    return { breached: true, count: 1, source: 'offline-corpus' };
  }
  return { breached: false, count: 0, source: 'unavailable' };
}
