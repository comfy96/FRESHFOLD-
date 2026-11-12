# Task 03 Interview Defence (`docs/interview-answers.md`)

All fourteen required interview questions (plus the unprinted user-enumeration question from page 21), answered from our actual Fresh Fold Laundry codebase in under 200 words each.

---

### 1. Why is client-side validation not enough?
Client-side validation runs inside JavaScript and HTML that the user's browser controls. Anyone can disable scripts, edit DOM state in DevTools, or bypass the browser altogether with `curl`, Postman, or a Python script targeting the API endpoint directly. When we tested our own Fresh Fold Laundry registration endpoint (`POST /api/auth/register`) directly with `curl`, sending `"fullName": "a"`, `"email": "not-an-email"`, `"password": "1"`, and `"termsAccepted": false`, SQLite stored row `id = 4` and returned `HTTP 201 Created`. Even inside the browser UI, edge cases like `"a         "` (one letter plus nine spaces) and `"a@b"` slipped past the client rules. Client validation exists to save honest users like Amaka Obi wasted cellular round-trips; only server-side enforcement protects database integrity and security.

---

### 2. What security checks belong in the frontend, and what must the server enforce regardless?
Strictly speaking, no check living solely in the frontend is a security control—it is a usability and guidance safeguard. The frontend should give fast inline format hints, prevent accidental empty submits, mask sensitive inputs, avoid rendering hints that advertise PIN formats, and escape output rendered into the DOM. Every real security and integrity boundary, however, must be enforced on the server regardless of what the UI does: authentication, session verification, role-based authorisation, ownership checks (`WHERE customer_id = ?`), full schema validation with length bounds, password/PIN hashing, rate limiting, and atomic persistence rules. In Fresh Fold Laundry, hiding or client-validating fields on `/auth` helps Amaka catch typos early, while Task 04 places Zod boundary parsing, Argon2id/bcrypt hashing, and rate limits strictly inside Next.js API routes.

---

### 3. The user interface hides the delete button for non-administrators. Is that enough?
No. Hiding a button in React or CSS only changes pixels in the browser DOM; the underlying API route still exists and can be called directly by any authenticated or unauthenticated HTTP client that guesses or inspects the URL (`DELETE /api/orders/123` or reading the minified client bundle). Attackers never click UI buttons to exploit missing authorisation—they replay `fetch` or `curl` requests straight against the backend endpoint. For real access control, the server route itself must verify the caller's server-side session and confirm both their role and record ownership before executing the delete, returning `401 Unauthorized` or `403 Forbidden` otherwise.

---

### 4. What is the difference between validation, encoding and sanitisation?
**Validation** checks whether incoming data conforms to expected types, structure, lengths, and business rules before acceptance—rejecting `"not-an-email"` or `docketNumber < 100` outright instead of trying to repair it. **Sanitisation** modifies or strips unsafe parts of input (for example, stripping unexpected HTML `<script>` tags from rich text, or normalising whitespace/case where safe) so only allowed content survives. **Encoding** translates data safely for a specific output context without altering the stored value—such as HTML-encoding `<` to `&lt;` before rendering in a web page or using SQL parameterised placeholders (`stmt.run(...)`) so user text is treated strictly as data, never executable syntax. Validation belongs at input boundaries, sanitisation cleans untrusted formats where needed, and context-aware encoding protects every output sink.

---

### 5. Why should you validate route parameters and query strings, not just the body?
Attackers control the entire HTTP request—URL path segments, query parameters, headers, cookies, and JSON bodies alike. Unvalidated route parameters (such as `/api/orders/[id]`) or query strings (`/auth?mode=signup`, pagination `?limit=`, or search filters) can trigger type confusion, integer overflow, path traversal, SQL injection if interpolated, unbounded database scans (`limit=9999999`), or Insecure Direct Object Reference (IDOR) probing where someone swaps `?docket=400` for `?docket=401`. Even in our `/auth` SPA (`src/app/auth/page.tsx`), reading `searchParams.mode` must explicitly constrain values to the union `'signup' | 'login' | 'reset'` and safely default anything else to `'signup'`, rather than trusting arbitrary query strings in state or database queries.

---

### 6. Explain what a single page application is, and how you make one discoverable by search engines.
A single page application (SPA) loads one initial HTML document from the server and updates the view dynamically inside the browser via JavaScript state and `window.history.replaceState` or `pushState`, fetching data as JSON rather than requesting full HTML documents on every click. For example, our `/auth?mode=signup|login|reset` route switches between Sign up, Log in, and Reset password with zero extra HTTP document requests (`evidence/04-form-switch-logs.txt`). Pure client-rendered SPAs hurt search discoverability because crawlers initially receive an empty shell before hydration. You make an SPA discoverable through server-side rendering (SSR) or static site generation (SSG) of initial HTML per URL (as Next.js App Router does), clean canonical query/path URLs, route-specific `<title>` and `<meta name="description">` tags, Open Graph tags, `sitemap.xml`, and `robots.txt`.

---

### 7. What are the advantages and disadvantages of a single page application against a multi-page application?
**SPA advantages:** Instant view transitions with zero full-page reload or blank flash, preserved client state across steps (keeping Amaka's typed email when switching from Log in to Reset), lower bandwidth after initial load on slow mobile data, and cleaner stateful interactivity. **SPA disadvantages:** Larger initial JavaScript bundle (hurting cold load on entry-level Androids), client-side routing/focus management complexity for screen readers, harder SEO unless SSR/SSG is used, and risk of stale client state across long sessions. **MPA advantages:** Smaller initial JS payload, native browser history/scroll restoration, strong out-of-the-box SEO, and strict isolation where every page starts cleanly. Separate pages would be better when a marketing site has dozens of unrelated content pages or when distinct workflows like customer checkout and heavy admin reports shouldn't ship in one bundle.

---

### 8. Can you explain the four principles of the Web Content Accessibility Guidelines, with examples from your own work?
WCAG organises accessibility under **POUR**:
- **Perceivable:** Information cannot rely on a single sense. In `src/app/auth/AuthForm.tsx`, inline errors pair `--color-error` borders with a SVG `CautionIcon` triangle and text so colour-blind users perceive errors cleanly.
- **Operable:** All UI flows must work via keyboard without traps. We replaced hidden submit buttons and `<input type="number">` spinbuttons with a keyboard-focusable `<button aria-disabled>` and `<input type="text" inputMode="numeric">`.
- **Understandable:** Labels, requirements, and recovery instructions must be clear. Required fields carry `aria-required="true"`, errors explain how to fix input (e.g., `"Enter at least two name words..."`), and clicking the disabled button fires an explicit `role="alert"` explanation.
- **Robust:** Markup must parse cleanly for assistive tech. Every input links its `<label htmlFor>` and error via `aria-invalid` and `aria-describedby` in Chrome's Accessibility Tree.

---

### 9. Discuss the importance of semantic HTML in the context of accessibility.
Semantic HTML uses native elements (`<form>`, `<label for>`, `<button>`, `<input type="checkbox">`, `<main>`, heading hierarchy) according to their meaning rather than generic `<div>` or `<span>` click handlers. Browsers automatically give native elements keyboard focusability, expected key bindings (Spacebar to toggle checkboxes, Enter to submit forms), and accurate roles/states in the Accessibility Tree with zero extra JavaScript. When a `<div>` is styled as a button or checkbox—or when a `<label>` omits `htmlFor`—screen readers announce unnamed controls or fail to reach them via Tab. In Fresh Fold Laundry's Stage 1 audit (`/tmp/ax-before.json`), missing `htmlFor="termsAccepted"` caused Chrome to expose `[checkbox] name=''`; restoring standard semantic attributes fixed screen reader announcement immediately.

---

### 10. Tell me about a time when you disagreed with what a customer wanted to build.
During Fresh Fold Laundry scoping, an AI chatbot assistant was floated so customers could ask free-text questions about garment readiness and bank transfers, alongside removing strict two-word name and phone checks during signup to reduce friction. Both contradicted what a neighbourhood Nigerian laundry user actually needs when worried about missing items or unverified payments: chatbots hallucinate or dodge accountability, and sloppy signup phone numbers mean Musa cannot call Amaka when her clothes are ready. Instead of building the chatbot, I scoped the interface strictly to dated ledger rows ("Our records show") and explained in writing why structured pickup, docket, and validated 11-digit Nigerian mobile numbers solve trust faster and cheaper, while documenting who the stricter rules block so trade-offs stayed transparent.

---

### 11. How would you explain to a non-technical executive why their AI implementation is not performing as expected?
Think of an AI model like a fast new hire on day one without your shop rulebook: if you give vague instructions and no house examples, it guesses the average answer from elsewhere instead of fitting your business. When teams see generic UIs, hallucinated facts, or forms that fail real users, the bottleneck is rarely the AI model itself—it is missing context files, unclear verification checks, or trusting polished output without testing the actual flow underneath. In our own project, leaving design tokens unconnected produced generic styling, and trusting a clean-looking registration form hid an endpoint that accepted `"a"` with `HTTP 201`. Fix the inputs—clear specifications, real data rules, and automated checks against your business reality—before paying to swap models.

---

### 12. One of your validation rules wrongly blocks a category of legitimate user. Name the rule, name the users, and defend the trade-off or say you got it wrong.
Our `fullName` rule (`src/app/auth/AuthForm.tsx:66-68`) requires at least two space-separated words (`!val.trim().includes(' ') || val.trim().length < 3`). This **wrongly blocks legitimate mononymous users** (people who go by a single legal name) and customers who habitually sign laundry bags with one nickname or shop handle. In Task 03 we accepted this trade-off knowingly for two reasons: Nigerian laundry shops routinely have multiple customers named "Amaka" or "Emeka", so single tokens cause counter pickup mix-ups, and automated test scripts love submitting `"a"` or `"test"`. However, permanently barring true single-name customers is avoidable—once Task 04 adds server-side rate limiting and email verification, relaxing this to an optional second name with duplicate-match disambiguation would be fairer.

---

### 13. You sent a request directly to your own endpoint. Say exactly what happened and what it tells you about the eight rules you spent two days writing.
I ran `curl -i -s -X POST http://localhost:3000/api/auth/register` with `{"fullName":"a","email":"not-an-email","phone":"1","docketNumber":0,"claimPin":"1","password":"1","termsAccepted":false}`. The endpoint returned **`HTTP/1.1 201 Created`**, logged `accountId: 4`, and saved that exact unvalidated row into SQLite `customer_accounts`. That single response proved all eight client-side rules—every regex, non-empty check, `aria-required`, numeric filter, and terms checkbox—enforced **zero security** the instant a request skipped the browser UI. Those two days of frontend work improved UX and accessibility for honest human customers, which matters, but without matching server-side validation in Task 04 they cannot stop a single automated script.

---

### 14. Wrong-answer analysis: client-side regex, disabled buttons, and browser sanitisation
Several claims here are actively dangerous. First, **browser regex and browser-side sanitisation are useless against attackers**, because anyone sending `curl` or modifying HTTP payloads in DevTools skips client JavaScript completely; only server-side schema validation and context-aware output encoding/parameterised queries mitigate injection and bad-data risks. Second, **disabling the submit button until valid is misleading accessibility**: native `disabled` drops the button from the keyboard tab order so screen-reader users get stuck without knowing which field failed (`aria-disabled` plus an assertive error summary avoids trapping them). Overall, the candidate has **confused frontend usability feedback with backend security enforcement**, and confused input validation/sanitisation with SQL parameterisation and HTML output encoding.

---

### Bonus. What is user enumeration, and how do error messages contribute to it?
**User enumeration** is an attacker technique for discovering valid accounts (emails, phone numbers, or customer IDs) registered in an application. Verbose error messages hand this away: if login replies `"No account found for that email"` versus `"Incorrect password"`, or forgot-password confirms `"Email not registered"`, an attacker scripts bulk requests and builds a verified customer target list for phishing or credential stuffing. Separately, field hints leak data shape enumeration—earlier in our form, showing `"Enter 5-digit PIN"` narrowed brute-forcing `claimPin` to $100,000$ guesses (`docs/enumeration.md`). In Fresh Fold Laundry, we removed all PIN format placeholders/hints on signup and will enforce uniform generic login/reset responses (`"Incorrect email or password"`) on the server in Tasks 04–05.
