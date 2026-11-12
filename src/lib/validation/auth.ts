import { z } from 'zod';

const NIGERIAN_PHONE_RE = /^0(70|80|81|90|91)\d{8}$/;
const IDENTICAL_DIGITS_RE = /^(\d)\1+$/;

const trimmedString = (max: number) => z.string().trim().max(max);

export const normalizedEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, 'Email address is too long.')
  .email('Enter a valid email address (for example name@domain.com).');

export const signupPasswordSchema = z
  .string()
  .transform((v) => v.trim())
  .pipe(
    z
      .string()
      .min(10, 'Password must be at least 10 characters after trimming spaces.')
      .max(128, 'Password must be 128 characters or fewer.')
  );

export const loginPasswordSchema = z
  .string()
  .transform((v) => v.trim())
  .pipe(
    z
      .string()
      .min(1, 'Enter your password.')
      .max(128, 'Password must be 128 characters or fewer.')
  );

export const registerSchema = z.object({
  fullName: trimmedString(120)
    .min(3, 'Enter at least two name words separated by a space.')
    .refine(
      (v) => v.includes(' '),
      'Enter at least two name words separated by a space.'
    ),
  email: normalizedEmailSchema,
  phone: z
    .string()
    .trim()
    .regex(
      NIGERIAN_PHONE_RE,
      'Enter an 11-digit Nigerian mobile number starting with 070, 080, 081, 090, or 091.'
    ),
  docketNumber: z.coerce
    .number()
    .int('Shop docket number must be a whole number.')
    .min(100, 'Docket number must be 100 or higher.')
    .max(99_999_999, 'Docket number must be 8 digits or fewer.'),
  claimPin: z
    .string()
    .trim()
    .regex(/^\d{5,8}$/, 'Claim PIN must be 5 to 8 digits.')
    .refine((v) => !IDENTICAL_DIGITS_RE.test(v), 'Claim PIN cannot be all identical digits.'),
  password: signupPasswordSchema,
  termsAccepted: z.literal(true, {
    message: 'Accept the Fresh Fold Laundry record-keeping terms before registering.',
  }),
});

export const loginSchema = z.object({
  email: normalizedEmailSchema,
  password: loginPasswordSchema,
});

export const resetRequestSchema = z.object({
  email: normalizedEmailSchema,
});

export const verifyCodeSchema = z.object({
  email: normalizedEmailSchema,
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Verification code must be 6 digits.'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
