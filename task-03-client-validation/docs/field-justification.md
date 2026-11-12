# Form Field Justification & Information Design (`docs/field-justification.md`)

Every field on Fresh Fold Laundry’s `/auth?mode=signup` form was tested against three questions derived from `task-01-design-system/docs/business-brief.md`. Any field failing all three was excluded (for example, home delivery GPS pin, birthday, or preferred detergent scent).

---

## 1. Field-by-Field Justification

| Field | Why It Is Needed | What Fresh Fold Does With It | What Happens If the User Gets It Wrong |
| :--- | :--- | :--- | :--- |
| **`fullName`** (Full Name) | Staff (`Musa`, `Chidi`) write customer names in a physical shop notebook and tag laundry bags manually. | Links the digital account to physical intake records and appears on counter collection slips. | Counter staff cannot verify bag ownership at pickup, risking garment mix-ups or refused handover. |
| **`email`** (Email Address) | Provides a reliable channel for account verification codes, password resets, and dated receipt summaries when SMS fails. | Serves as the primary login identifier and receives Task 04 6-digit verification OTPs. | Verification and password-reset codes go to someone else or bounce, locking the customer out. |
| **`phone`** (Nigerian Phone Number) | Neighbourhood pickups and late-evening collection alerts rely on direct mobile voice calls or WhatsApp when power/data drops. | Stored on the customer record so Musa/Chinedu can call before arriving at the customer's gate. | Driver arrives with clothes and cannot reach the customer, causing failed collection/delivery loops. |
| **`docketNumber`** (Shop Docket Number) | Links the online account to an existing paper receipt number issued at the shop counter (`400`+). | Converted via `Number()` and matched against the shop’s physical notebook intake log. | Customer sees an empty account rather than their active laundry items waiting in the shop. |
| **`claimPin`** (Counter Claim PIN) | Phone numbers and names written in open shop notebooks are semi-public; a numeric PIN prevents neighbours who know Amaka's phone number from claiming her records or bags. | Stored as a secondary verification credential verified at counter pickup or sensitive record disputes. | Weak or predictable PINs make it easier for an impersonator to guess someone else's claim credential. |
| **`password`** (Account Password) | Protects private wash statuses and payment records from unauthorized access. | Protects account login (hashed server-side with Argon2id/bcrypt in Task 04). | Weak or forgotten passwords expose personal order history or lock the user out of checking payment proof. |
| **`termsAccepted`** (Terms Checkbox) | Collecting personal identifiers (name, phone, email) and retaining Nigerian tax payment records requires explicit user consent. | Recorded with timestamp as consent to data processing and statutory financial record retention. | Processing customer PII without documented consent creates Nigerian NDPA compliance exposure. |

---

## 2. Removed Non-Functional Decoration
In Stage 1 (`evidence/13-button-hidden-version.png`), the form card contained a decorative teal pill badge (`"Fresh Fold Member Ledger"`) above the `<h1>` heading. Clicking or tapping it performed no action, yet its primary container fill mimicked an interactive filter pill or status tag. We removed that decorative badge in Stage 2 (`evidence/14-button-disabled-version.png`) so only the top navigation logo (`Fresh Fold Laundry` linking to `/`) and real form controls carry interactive styling.
