# Fresh Fold Privacy Draft with Broken Promise (`privacy-draft-with-broken-promise.md`)

*(Assessment Artifact: Demonstrating the critical review of privacy policies by identifying an impossible operational and statutory promise, critiquing why it fails, and showing the corrected engineering implementation in `privacy.md`.)*

---

## 1. The Naive Early Draft (Containing the Broken Promise)

> ### Section 4: Deleting Your Account (Early Draft)
> *"We believe your data belongs entirely to you. When you request to delete your Fresh Fold account, **our systems instantly and completely erase every single trace of your existence from all our computers, databases, servers, log files, backups, and payment archives within zero seconds.** Nothing will ever be stored, remembered, or retained by Fresh Fold under any circumstance whatsoever."*

---

## 2. Engineering & Legal Critique: Why This Promise Is Impossible and Unlawful

The paragraph above represents a classic "broken promise" often written by enthusiastic marketing copywriters or inexperienced legal counsel. An engineering team deploying this statement faces catastrophic legal and technical consequences:

### Flaw 1: Criminal Breach of Nigerian Tax & Corporate Law (CAMA 2020 & FIRS)
- **The Law:** Under **Section 374 of the Companies and Allied Matters Act (CAMA) 2020** and the **Federal Inland Revenue Service (FIRS) Establishment Act**, Nigerian commercial entities are strictly mandated to retain accounting books, VAT remittances, invoice ledgers, and transaction proofs for **a minimum of six (6) years**.
- **The Crime:** If an engineer actually built a system that *"instantly erases every single trace from payment archives"*, any customer who laundered ₦50,000 worth of clothing and paid via bank transfer would have their payment records expunged upon clicking delete. During a state or federal tax audit, Fresh Fold would be unable to substantiate receipts or account for revenue, resulting in statutory financial penalties and criminal liability for company officers.

### Flaw 2: Technical Impossibility on Immutable Backups & Write-Once Archives
- **The Reality:** Enterprise disaster recovery relies on periodic immutable snapshots (daily SQLite `.bak` snapshots, encrypted AWS S3 buckets with Object Lock, or offsite tape archives).
- **The Impossibility:** You cannot selectively excise a single customer row from a byte-level zipped database archive created three weeks ago without restoring the snapshot, unzipping it, modifying the SQLite B-tree, re-zipping it, and resigning the cryptographic checksum. Doing so invalidates backup integrity and risks corrupting disaster recovery pipelines.
- **The Lawful Standard:** Data protection regulators (including NDPA and GDPR) acknowledge this technical reality. Compliance requires that personal data in rolling backups be allowed to expire naturally through retention windows (e.g. 30-day snapshot rotation) rather than promising impossible "zero-second" snapshot modification.

### Flaw 3: Susceptibility to Account Hijacking & Accidental Destruction
- **The Operational Danger:** A customer who leaves their budget Android phone unattended on a counter or suffers a transient session theft could have their entire multi-year laundry history, outstanding garment intake slips, and delivery balance permanently eradicated in a split second by a malicious actor.
- **The Solution:** A lawful deletion process requires a **soft delete paired with a mandatory grace period (7 days)**, allowing legitimate customers to recover hijacked accounts before irreversible anonymisation occurs.

---

## 3. How the Broken Promise Was Fixed in `privacy.md`

In the final, approved [`privacy.md`](file:///Users/APPLE/Desktop/FRESHFOLD/privacy.md), the impossible marketing promise was replaced with an honest, legally defensible, and technically verifiable 4-stage lifecycle:

```
+-----------------------------------------------------------------------------------+
| 1. Request Initiated (POST /api/auth/delete-account)                              |
|    - Immediate account lock (deleted_at = NOW())                                  |
|    - Instant revocation of all active sessions across all devices                 |
+-----------------------------------------------------------------------------------+
                                      │
                                      ▼
+-----------------------------------------------------------------------------------+
| 2. Seven-Day Grace Period                                                         |
|    - Account remains inaccessible, but recoverable in case of fraud/mistake       |
+-----------------------------------------------------------------------------------+
                                      │
                                      ▼
+-----------------------------------------------------------------------------------+
| 3. Automated Idempotent Purge Job (src/lib/deletion/job.ts)                       |
|    - PII Anonymisation: name -> 'Purged Customer #id', email -> 'purged.@...',    |
|      phone -> '00000000000', password & pin hashes overwritten                    |
|    - Ephemeral data destroyed: verification codes and notes wiped                 |
+-----------------------------------------------------------------------------------+
                                      │
                                      ▼
+-----------------------------------------------------------------------------------+
| 4. Statutory Financial Preservation (CAMA 2020 / FIRS)                            |
|    - payments table rows PRESERVED for 6-7 years                                  |
|    - Transactions linked only to anonymized customer key                          |
+-----------------------------------------------------------------------------------+
```

By stating the exact retention reality upfront in plain language, Fresh Fold establishes unshakeable customer trust without making promises that break the first time a tax auditor or backup engineer examines the system.
