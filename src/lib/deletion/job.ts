import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PurgeJobResult {
  jobId: string;
  startedAt: string;
  finishedAt: string;
  cutoffDate: string;
  eligibleCount: number;
  processedCount: number;
  paymentsPreserved: number;
  dryRun: boolean;
  logs: string[];
}

/**
 * Idempotent Scheduled Account Purge & Anonymisation Job.
 * Complies with NDPA 2023 Section 34 (Right to Erasure) while preserving
 * financial transaction records required under CAMA 2020 / FIRS tax law.
 */
export async function runDeletionPurgeJob(options?: {
  cutoffDate?: Date;
  dryRun?: boolean;
}): Promise<PurgeJobResult> {
  const jobId = `purge-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const startedAt = new Date();
  const logs: string[] = [];

  function log(msg: string) {
    const formatted = `[${new Date().toISOString()}] [${jobId}] ${msg}`;
    logs.push(formatted);
    console.log(formatted);
  }

  // Default to 7-day grace period
  const cutoff = options?.cutoffDate ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const dryRun = options?.dryRun ?? false;

  log(`START: Purge job initiated. Cutoff threshold: ${cutoff.toISOString()}${dryRun ? ' (DRY RUN)' : ''}`);

  // Query customers soft-deleted before the cutoff date whose PII has not yet been purged
  const eligible = await prisma.customer.findMany({
    where: {
      deletedAt: {
        not: null,
        lte: cutoff,
      },
      email: {
        not: {
          endsWith: '@deleted.freshfold.ng',
        },
      },
    },
    include: {
      payments: {
        select: { id: true, amountKobo: true },
      },
      pickupRequests: {
        select: { id: true },
      },
    },
  });

  log(`DISCOVERY: Found ${eligible.length} customer account(s) ready for statutory purge & PII anonymisation.`);

  let processedCount = 0;
  let totalPaymentsPreserved = 0;

  for (const customer of eligible) {
    const paymentsCount = customer.payments.length;
    totalPaymentsPreserved += paymentsCount;

    if (!dryRun) {
      const anonymizedEmail = `purged.${customer.id}.${crypto.randomBytes(4).toString('hex')}@deleted.freshfold.ng`;
      const anonymizedName = `Purged Customer #${customer.id}`;

      // 1. Delete transient verification codes
      await prisma.verificationCode.deleteMany({
        where: { customerId: customer.id },
      });

      // 2. Anonymize pickup requests PII
      await prisma.pickupRequest.updateMany({
        where: { customerId: customer.id },
        data: {
          customerName: anonymizedName,
          phone: '00000000000',
          notes: '[REDACTED PURSUANT TO NDPA ERASURE]',
        },
      });

      // 3. Anonymize Customer record (wipe all personal identifiers)
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          fullName: anonymizedName,
          email: anonymizedEmail,
          phone: '00000000000',
          passwordHash: 'PURGED_NDPA_COMPLIANT',
          claimPinHash: 'PURGED_NDPA_COMPLIANT',
        },
      });

      // 4. FINANCIAL AUDIT TRAIL PRESERVED:
      // Note: payments table rows are NOT deleted. They remain attached to customer_id
      // to maintain CAMA 2020 / FIRS tax audit trails.
    }

    processedCount++;
    log(
      `PROCESSED: Customer ID=${customer.id} PII anonymised. Retained ${paymentsCount} payment transaction(s) for statutory tax audit.`
    );
  }

  const finishedAt = new Date();
  log(`FINISH: Purge job complete. Eligible: ${eligible.length}, Processed: ${processedCount}, Payments Preserved: ${totalPaymentsPreserved}.`);

  return {
    jobId,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    cutoffDate: cutoff.toISOString(),
    eligibleCount: eligible.length,
    processedCount,
    paymentsPreserved: totalPaymentsPreserved,
    dryRun,
    logs,
  };
}
