# Gating Architectural Decision: Soft Gating vs. Hard Gating (`docs/gating.md`)

**Business:** Fresh Fold Laundry  
**Domain:** Nigerian Neighbourhood Laundry Portal & Ledger  
**Author:** Engineering Team  
**Date:** 2026-11-17  

---

## 1. Executive Summary & Production Decision

Fresh Fold Laundry ships **Soft Gating** as its primary production authentication strategy. 

Under Soft Gating:
- Customers registering with an unverified email address receive an active authenticated session immediately upon submitting the registration form.
- The user is granted read visibility into their physical laundry intake docket, item counts, processing stages, and payment history.
- An alert banner persistently warns the customer that email verification is pending (`Notice: Email Verification Pending`), providing an in-context link to enter their 6-digit OTP code.
- Outbound automated email dispatches (e.g., electronic PDF receipt delivery) and destructive actions (e.g., account deletion, phone number changes) are gated until verification completes.

We also designed, implemented, and captured **Hard Gating** on the same route via query parameter enforcement (`?gating=hard`), proving that the system can switch to strict gating if business threat models evolve.

---

## 2. The Operational Context: Why Hard Gating Fails Fresh Fold

To understand why Hard Gating is disastrous for a neighbourhood laundry business in Lagos or Abuja, we evaluate our core target user: **Amaka Obi**.

### Scenario: Amaka at the Laundry Counter
1. **The Physical Reality:** Amaka arrives at the Fresh Fold collection counter during her morning commute. She drops off 7 shirts and 2 pairs of trousers. The counter clerk tags her bag with Docket **#400**.
2. **Network Conditions:** Amaka is using an entry-level Android phone (Tecno Spark running Android Go) on intermittent mobile data. Mobile coverage fluctuates between 2G and 3G.
3. **The Counter Handshake:** The clerk says, *"Madam, register on our portal freshfold.ng so you can see your wash status and receipt."*
4. **Failure with Hard Gating:**
   - Amaka fills out the registration form.
   - Hard Gating blocks her with a modal: `Access Refused: Verify your email before accessing records.`
   - Due to upstream telco latency or Nigerian mobile network packet loss, the SMTP verification email takes 3 to 7 minutes to land in her inbox.
   - Amaka cannot view her docket. She is standing at the physical counter holding up the queue, frustrated with the business. She tells the clerk: *"Your system is not working. Just write it on paper for me."*
   - **Business Outcome:** Operational friction, churn, customer distress, and staff time wasted diagnosing email delivery delays.
5. **Success with Soft Gating:**
   - Amaka submits the form and is immediately taken to `/orders`.
   - The portal displays: `Docket #400 · Amaka Obi · 9 items · Washing & Sorting`.
   - A calm yellow banner informs her: *"We sent a 6-digit code to amaka@freshfold.ng. You have full access to your docket, but receipt PDF delivery is paused until confirmed."*
   - Amaka verifies the item count with her own eyes, leaves the counter content, and enters her verification code later in the evening when connected to home Wi-Fi.

---

## 3. Comparative Architecture & Trade-Off Matrix

| Evaluation Dimension | Soft Gating (Fresh Fold Production Choice) | Hard Gating (Security-First Alternative) |
| :--- | :--- | :--- |
| **Initial Customer Experience** | **Immediate Access:** Instant transition to order records. Zero counter friction. | **Blocked Access:** Intercepted by full-screen modal or redirect to `/verify`. |
| **Resilience to Network Latency** | **High:** Flaky cellular data or SMTP delays do not impede customer visibility. | **Zero:** Any delay in email delivery halts the entire customer onboarding flow. |
| **Account Squatting Risk** | **Low-Medium:** An attacker could register an unowned email address and view *only* the new docket they just created. | **Zero:** Unowned email addresses cannot access anything without inbox control. |
| **Data Leakage Risk** | **Zero:** Queries are scoped strictly to the newly generated `customer_id` / docket number. An unverified user cannot view any other customer's laundry records. | **Zero:** No records accessible. |
| **Financial / Destructive Actions** | Gated on an action-by-action basis (e.g. payout updates and account deletion require verification). | Globally blocked. |
| **Support Overhead** | Minimal. Customers verify asynchronously. | High. Staff repeatedly handle "I didn't receive my code" inquiries at the physical counter. |

---

## 4. Implementation Details in Code

In `src/app/orders/page.tsx`:
```typescript
// Read gating query parameter (defaults to soft gating in production)
const isHardGating = params.gating === 'hard';

// 1. HARD GATING FLOW (Refusal Screen)
if (!session.emailVerified && isHardGating) {
  return (
    <section className={styles.hardGateCard}>
      <h2>Verification Required</h2>
      <p>
        Under strict security gating, access to your laundry intake ledger is blocked
        until your email address ({session.email}) has been verified.
      </p>
      <Link href={`/auth?mode=verify&email=${session.email}`}>
        Enter 6-Digit Verification Code
      </Link>
    </section>
  );
}

// 2. SOFT GATING FLOW (Notice Banner + Immediate Records Access)
if (!session.emailVerified && !isHardGating) {
  return (
    <>
      <aside className={styles.softGateBanner} role="status">
        <div>
          <div className={styles.softGateTitle}>Notice: Email Verification Pending</div>
          <div className={styles.softGateBody}>
            We sent a 6-digit confirmation code to {session.email}. You have full access
            to view your laundry items below, but digital receipt PDF delivery is paused...
          </div>
        </div>
      </aside>
      <section className={styles.card}>
        <h1>Our records show</h1>
        {/* Render customer laundry orders */}
      </section>
    </>
  );
}
```

---

## 5. Machine Evidence Cross-References
- **`evidence/03-soft-gating-flow.png`**: High-resolution browser screenshot showing Amaka Obi authenticated as an unverified user on `/orders`, displaying the persistent warning banner alongside her active laundry ledger.
- **`evidence/04-hard-gating-flow.png`**: High-resolution browser screenshot showing the identical user on `/orders?gating=hard`, where ledger visibility is suppressed and replaced by the verification enforcement card.
