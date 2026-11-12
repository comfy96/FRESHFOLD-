# Client-Side Validation Rules & Legitimate User Trade-Offs (`docs/validation-rules.md`)

Every validation rule below is derived directly from Fresh Fold Laundry's Nigerian neighbourhood operations—none are copied from class gym examples.

---

## 1. Category One: Empty Fields (On Blur)
Triggered when a user focuses a required input and tabs/moves out without entering text (`evidence/05-empty-field-error.png`), using custom Fresh Fold wording:
- `fullName`: *"Enter your full name as written on your laundry bag."*
- `email`: *"Enter the email address for your order alerts."*
- `phone`: *"Enter your Nigerian phone number so Musa can call on pickup."*
- `docketNumber`: *"Enter the docket number from your shop receipt."*
- `claimPin`: *"Choose a personal counter claim PIN."*
- `password`: *"Enter a password for your account."*

---

## 2. Category Two: Length and Structure (`evidence/06-length-rule-blocking.png`)

### Rule A — Full Name (`fullName`)
- **The Rule:** Minimum 3 characters and at least two words separated by a space (`val.trim().includes(' ') && val.trim().length >= 3`).
- **What Goes Wrong Without It:** Bots and hasty signups enter `"a"`, `"test"`, or `"Amaka"`, leaving Chinedu unable to distinguish between multiple customers sharing a common first name in the shop notebook.
- **Legitimate User Wrongly Blocked:** Customers who legally go by a single mononym, or customers who habitually write only one name (or a hyphenated name without a space like `"Adebayo-Ojo"`) on their laundry tags.

### Rule B — Nigerian Phone Number (`phone`)
- **The Rule:** Must match `^0(70|80|81|90|91)\d{8}$` (11 digits starting with a standard Nigerian mobile prefix).
- **What Goes Wrong Without It:** Users enter 9-digit typos, letters (`"call WhatsApp"`), or missing leading zeros, making the phone number undialable when Musa reaches their street.
- **Legitimate User Wrongly Blocked:** Customers pasting international format (`+2348030004120`, 14 characters with `+`), Nigerian landline users (`01...`), or diaspora family members registering with a foreign SIM to manage laundry for elderly parents in Lagos.

### Rule C — Shop Docket Number (`docketNumber`)
- **The Rule:** Digits only (`<input type="text" inputMode="numeric">`), integer value `>= 100` (`Number(val) >= 100`).
- **What Goes Wrong Without It:** Users type prefixes or prose (`"Page 4"`, `"none"`, `0`), breaking integer matching against shop receipt numbers.
- **Legitimate User Wrongly Blocked:** Walk-in customers holding tickets `001`–`099` from the very first pages of a brand-new paper receipt book, or customers whose docket includes an alphabetic branch code (`FF-402`).

### Rule D — Counter Claim PIN (`claimPin`)
- **The Rule:** Digits only, 5 to 8 digits (`^\d{5,8}$`), and not all identical digits (`^(\d)\1+$` rejected).
- **What Goes Wrong Without It:** Short 1–3 digit or trivial (`00000`) PINs let any neighbour or casual attacker guess a customer's counter claim code in seconds.
- **Legitimate User Wrongly Blocked:** Older or less-technical customers who deliberately pick an easy-to-remember 4-digit PIN matching their bank ATM card, or use repeating digits (`77777`) so they never forget it.

---

## 3. Category Three: Format in Real Time (`07` vs `08`)
- **Signup (`?mode=signup`, `07-email-realtime-signup.png`):** Email format (`/^\S+@\S+$/`) validates on every `onChange` keystroke because the user is supplying a brand-new address for the first time and needs immediate typo feedback before submitting.
- **Login (`?mode=login`, `08-email-on-submit-login.png`):** Aggressive real-time errors while typing on login are irritating (`a` $\rightarrow$ error flash before `@` is typed), so login validates email format **on submit only**.
- **Why apps do not check whether an email exists at format time:** Probing mail servers (`VRFY`/SMTP checks) or querying account existence mid-form leaks whether an email is registered (user enumeration) and fails unpredictably when corporate mail gateways block probes. Email ownership is proven afterward by delivering an OTP verification code.

---

## 4. Category Four & Step 4: Input Type Trade-Off (`09` vs `10`)
Using `<input type="number">` for `docketNumber` (`09-number-input-annoying.png`) displays a default `0` and browser spinners; clearing `400` reverts to `0`, typing `400` yields `0400`, and fixing it forces manual cursor backtracking. Switching to `<input type="text" inputMode="numeric">` stripped to digits and cast with `Number(docketNumber)` (`10-text-input-working.png`) preserves the mobile numeric keypad without spinner bugs.

**Two sentences on where `<input type="number">` IS the right choice:** `<input type="number">` is appropriate for bounded continuous or incremental quantities—such as selecting a garment count (`1` to `50` shirts) or adjusting tip/quantity steppers with `min`, `max`, and `step` attributes. In those cases, spinner buttons, mouse-wheel/arrow-key incrementation, and native numeric range validation help users adjust a scalar quantity rather than transcribe a fixed identifier.
