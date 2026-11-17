# Data Retention Matrix & Statutory Reconciliation (`docs/retention-matrix.md`)

**Business:** Fresh Fold Laundry  
**Domain:** Nigerian Neighbourhood Laundry Portal & Ledger  
**Legal Frameworks:** Nigeria Data Protection Act (NDPA) 2023, Companies and Allied Matters Act (CAMA) 2020, Federal Inland Revenue Service (FIRS) Establishment Act, and General Data Protection Regulation (GDPR) Art. 17  
**Date:** 2026-11-17  

---

## 1. Executive Summary

This document governs the retention, archiving, anonymisation, and cryptographic erasure of all data elements collected across Fresh Fold Laundry.

The matrix specifically resolves the statutory conflict between:
1. **The Data Subject's Right to Erasure** (NDPA 2023 Section 34 / GDPR Article 17): Mandating that personal data must be erased upon request when no longer necessary.
2. **Statutory Financial Record Retention Mandates** (CAMA 2020 Section 374 / FIRS Regulations): Requiring commercial enterprises to maintain books of accounts and financial transaction records for **at least six (6) years** from the date of the transaction.

### The Resolution Strategy
Fresh Fold reconciles this conflict through **cryptographic PII anonymisation paired with relational financial record preservation**. 

When an account is purged:
- All direct personal identifiers (name, email, phone number, credentials, verification codes) are irreversibly scrambled or hard-deleted.
- Immutable financial ledger entries (`payments`) remain intact and linked to the anonymized account identifier, preserving tax audit integrity while guaranteeing that no human identity remains linked to the record.

---

## 2. Exhaustive Data Element Retention Matrix

| Table Name | Column Name | Data Classification | Active Purpose | Legal Retention Basis | Purge Schedule & Mechanism | Backup & Archive Synchronization |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`customers`** | `id` | Pseudonymous Key | Primary relational identifier | Legitimate interest (DB relational integrity) | Retained indefinitely as an anonymized integer key | Preserved in encrypted cold backups |
| `customers` | `full_name` | PII (Direct Identifier) | Customer identification on bags and receipts | Contract performance (service fulfillment) | Anonymized to `Purged Customer #<id>` after 7-day grace period | Rotated out of active backups within 30-day snapshot cycle |
| `customers` | `email` | PII (Direct Identifier) | Order alerts and authentication | Contract performance & consent | Scrambled to `purged.<id>.<hex>@deleted.freshfold.ng` on purge | Rotated out of backups within 30 days |
| `customers` | `phone` | PII (Direct Identifier) | Driver pickup dispatch contact | Contract performance | Overwritten with `00000000000` on purge | Rotated out of backups within 30 days |
| `customers` | `docket_number` | Business Record | Paper ticket cross-referencing | Legitimate interest (shop ledger continuity) | Retained indefinitely | Preserved |
| `customers` | `password_hash` | Security Credential | Authentication | Security compliance | Overwritten with string `PURGED_NDPA_COMPLIANT` | Instant invalidation |
| `customers` | `claim_pin_hash` | Security Credential | Counter pickup authorization | Security compliance | Overwritten with string `PURGED_NDPA_COMPLIANT` | Instant invalidation |
| `customers` | `role` | Authorization Scope | RBAC governance | Legitimate interest (access audit) | Retained indefinitely (`customer`) | Preserved |
| `customers` | `terms_accepted` | Consent Record | Proof of legal record-keeping terms | Legal obligation (NDPA compliance audit) | Retained for 5 years after account closure | Preserved |
| `customers` | `deleted_at` | Audit Timestamp | Records statutory erasure request | Legal obligation (NDPA Section 34 audit defense) | Retained indefinitely as proof of timely erasure | Preserved |
| **`sessions`** | `token_hash` | Ephemeral Credential | Session lookup | Authentication | **Immediate hard deletion** on logout, reset, or deletion request; TTL 7 days | Never backed up to permanent storage |
| `sessions` | `expires_at` | Ephemeral Timestamp | Automatic expiration | Security hygiene | Pruned automatically upon expiration | Excluded from cold archive |
| **`pickup_requests`**| `customer_name` | PII | Delivery driver manifest | Contract performance | Anonymized to `Purged Customer #<id>` on purge | Rotated out within 30 days |
| `pickup_requests`| `phone` | PII | Delivery driver contact | Contract performance | Overwritten with `00000000000` on purge | Rotated out within 30 days |
| `pickup_requests`| `item_count` | Operational Metric | Laundry batch volume tracking | Legitimate interest (operational analytics) | Retained indefinitely as anonymized aggregate data | Preserved |
| `pickup_requests`| `notes` | PII (Potential) | Special fabric/wash instructions | Contract performance | Overwritten with `[REDACTED PURSUANT TO NDPA ERASURE]` | Wiped on purge |
| **`payments`** | `amount_kobo` | **Financial Record** | Payment proof & revenue accounting | **CAMA 2020 Sec 374 & FIRS Tax Law (Mandatory 6 Years)** | **NEVER PURGED BEFORE 6 YEARS.** Preserved linked to anonymized customer key | Preserved in immutable WORM financial archive |
| `payments` | `channel` | Financial Record | POS / bank transfer audit trail | Statutory accounting mandate | Retained 6 years minimum | Preserved in immutable audit archive |
| `payments` | `provider_ref` | Financial Record | Interbank / gateway reconciliation | Statutory accounting mandate | Retained 6 years minimum | Preserved in immutable audit archive |
| `payments` | `paid_at` | Financial Record | Tax period calculation | Statutory accounting mandate | Retained 6 years minimum | Preserved in immutable audit archive |
| **`payment_attempts`**| `failure_reason` | Telemetry Data | Gateway failure diagnostics | Legitimate interest (fraud prevention) | Hard deleted after 90 days via scheduled cleanup | Excluded from cold storage |
| `payment_attempts`| `idempotency_key` | Ephemeral Token | Double-charge prevention | Transaction integrity | Hard deleted after 90 days | Excluded from cold storage |
| **`verification_codes`**| `code_hash` | Security Token | Single-use email verification | Authentication | Expired in 7 minutes; hard deleted on customer deletion | Never written to cold archive |
| **`ledger_chunks`** | `content` | Cache Content | Local docket ledger cache | Performance optimization | Hard deleted immediately on customer deletion | Wiped on purge |

---

## 3. The Statutory Conflict Deep-Dive

### The Legal Tension
Under **NDPA Section 34(1)**:
> *"A data subject shall have the right to obtain from a data controller the erasure of personal data concerning him without undue delay..."*

However, under **CAMA 2020 Section 374(1) & (2)**:
> *"Every company shall cause accounting records to be kept... The accounting records shall be preserved by the company for a period of six years from the date on which they were made."*

Failure to maintain accounting records under CAMA is a criminal misdemeanor subjecting corporate directors to statutory fines and imprisonment. 

### Why Hard Cascading `DELETE` Is Unlawful
If an engineering team implements `ON DELETE CASCADE` across the database schema, a user submitting a Right to Erasure request causes the database engine to drop all linked rows in `payments`. Doing so breaches CAMA 2020 and FIRS tax regulations.

### The Fresh Fold Defensive Architecture
1. In `prisma/schema.prisma`, `payments` enforces:
   ```prisma
   customer Customer @relation(fields: [customerId], references: [id], onDelete: Restrict)
   ```
   The database engine physically forbids deleting a customer row while financial transactions exist.
2. The purge job (`src/lib/deletion/job.ts`) strips all personal identifiers from the `customers` row while preserving the integer `id` and the linked financial transactions in `payments`.
3. An auditor reviewing `payments` sees:
   - `PAY-KEMI-405-TX`: ₦8,500, POS Terminal, Docket #405, Paid 2026-10-18.
   - Associated Customer: `Purged Customer #4` (`purged.4.1ae289@deleted.freshfold.ng`, Phone: `00000000000`).
4. Result:
   - **Privacy Compliance:** Kemi Adebayo's real name, personal phone, and contact details no longer exist anywhere in the active database.
   - **Tax Compliance:** The statutory audit trail of income earned and VAT collected is 100% complete and reconcilable.

---

## 4. Backup & Cold Storage Synchronization

1. **Active Database:** Immediate anonymisation upon scheduled job run.
2. **Rolling Daily Backups (SQLite `.db.bak`):** Retained for 30 days for operational disaster recovery. Data subject requests are maintained in a tombstone audit table (`deleted_at`). If an old database snapshot is ever restored, the restore procedure executes a mandatory post-restore script (`runDeletionPurgeJob`) that re-applies all deletion tombstones before opening traffic.
3. **Cold Financial Archives:** Exported financial ledgers contain only pseudonymous transaction columns (`amount_kobo`, `provider_ref`, `paid_at`, `docket_number`) and zero direct personal contact vectors.
