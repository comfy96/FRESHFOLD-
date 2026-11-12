import argon2 from 'argon2';

const ARGON2_OPTIONS = {
  type: argon2.argon2id as 0 | 1 | 2,
  memoryCost: 65536, // 64 MiB
  timeCost: 3,
  parallelism: 1,
  raw: false as const,
};

/** Hash a user-supplied secret (password or claim PIN) with trimmed leading/trailing whitespace and unique CSPRNG salt. */
export async function hashSecret(raw: string): Promise<string> {
  return argon2.hash(raw.trim(), ARGON2_OPTIONS);
}

/** Verify a user-supplied candidate against an Argon2id hash after trimming accidental leading/trailing whitespace. */
export async function verifySecret(storedHash: string, candidate: string): Promise<boolean> {
  if (!storedHash) return false;
  return argon2.verify(storedHash, candidate.trim());
}
