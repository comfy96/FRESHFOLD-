# Fresh Fold Laundry

*(Repository Layout: Single monorepo containing all five sequential assessment folders `task-01-*` through `task-05-*` alongside the active application source under `src/`.)*

---

## 1. What this is
Fresh Fold Laundry is a lightweight customer record portal that gives Nigerian neighbourhood laundry customers (like Amaka Obi on an entry-level Android phone with intermittent mobile data) verified, dated visibility into their own item counts, washing status, and payment records—and never anyone else's.

---

## 2. Status
- **Finished (Task 01 Design System):** Complete Figma token exports (`#007B71` teal pinned at Primary 40, Light & Dark mode collections), 15-style `Plus Jakarta Sans` type scale (`57/80`, `-0.25px`), brand-tinted shadow tokens, Node.js token-to-CSS compiler (`task-01-design-system/scripts/build-tokens.js`), static Customer Order Status screen (`src/index.html`, `src/styles/app.css`), and all Task 01 written reasoning, defects, and interview answers.
- **Half done:** Headless browser screen captures (`09`–`11`) and unmerged regression branch log (`12`) pending Git commit setup and Chrome capture.
- **Not started:**
  - `task-02-repository-and-scaffold/`: Backend/framework scaffold, live database persistence, and Git workflow testing.
  - `task-03-client-validation/`: Single-page authentication form, client-side validation rules, and screen-reader accessibility fixes.
  - `task-04-server-security/`: Database schema migrations, Argon2id/bcrypt hashing, boundary validation, rate limiting, and async email OTP verification.
  - `task-05-sessions-compliance-defence/`: Session lifecycle, GDPR/NDPA deletion job, retention matrix, primary shop-owner interview, and technical handbook.

---

## 3. The stack, with reasons
- **Static HTML5 & Semantic CSS Custom Properties (Task 01 UI Layer):** Chosen over Tailwind CSS or React in Task 01 because Amaka Obi uses an entry-level Android phone on a small weekly data bundle, and zero-runtime CSS variables enforce strict token separation without shipping kilobytes of utility JavaScript.
- **Node.js (v26.13.0) Build Tooling:** Chosen over Python or Sass CLI for compiling Figma JSON tokens into CSS variables (`build-tokens.js`) so token compilation shares the same JavaScript runtime that will power the full-stack server in Tasks 02–05.
- **Figma Variables & W3C JSON Token Format:** Chosen over hardcoded CSS color sheets because Light and Dark Mode Variable collections preserve semantic alias relationships between brand primitives (`#007B71`) and UI roles across design and code.

---

## 4. Getting started
Run these commands in exact order from a fresh clone to compile the design tokens and view the current Task 01 screen locally:

```bash
git clone https://github.com/comfy96/FRESHFOLD-.git
cd FRESHFOLD-
node task-01-design-system/scripts/build-tokens.js
npx serve src
```

*(Note: Once `npx serve src` starts, open the printed `http://localhost:<port>` URL in your browser. If running offline without `npx`, open `src/index.html` directly in Chrome or Safari.)*

---

## 5. Environment variables
No environment variables are required yet for Task 01 (static design system and token compiler). Database, SMTP, and session secrets will be introduced starting in Task 02 and Task 04 and documented here by name and purpose only.

---

## 6. What this deliberately does not do
- **No AI chatbot interface:** Customers anxious about missing clothes or unrecorded cash transfers distrust opaque chat bots; the interface deliberately renders calm, static dated ledger tables ("Our records show") instead of conversational UI.
- **No live backend or authentication yet:** Task 01 deliberately isolates and proves design-system consumption on a static order ledger screen before introducing dynamic server routing (Task 02), registration forms (Task 03), or database persistence (Task 04).
- **No live online payment gateway integration yet:** The shop takes cash and bank transfers recorded manually by staff (`Musa`, `Chidi`, `Tunde`), so checkout card processing is out of scope.

---

## 7. Known defects
1. **Light Mode `Surface_Container_Lowest` mapped to dark `Neutral_20` (`task-01-design-system/docs/design-system/Color Roles.Light Mode.tokens.json:98-101`, `src/styles/variables.css:157`):** Produces a `1.31 : 1` contrast failure against `On_Surface`; cards are temporarily routed to `--color-surface-container-low`.
2. **Error tones 60–99 exported as pure white (`task-01-design-system/evidence/06-tokens-complete.json:1297-1370`):** Breaks Light Mode `Error_Container` surface tint and Dark Mode `Error` legibility.
3. **Unexported typography & stale shadow tint (`task-01-design-system/evidence/06-tokens-complete.json:1-21`, `task-01-design-system/scripts/build-tokens.js:80-102`):** `soft shadow` retains an earlier `#c2410c1f` burnt orange tint and typography tokens were omitted from the Figma JSON export, requiring JS fallbacks in `build-tokens.js`.
4. **Offline sync stamp uses wrong typography token (`src/styles/app.css:49-60`):** `.sync-pill` consumes `--type-label-small-*` (`11px`, weight `500`) instead of `--type-body-small-*` (`12px`, weight `400`) assigned in `task-01-design-system/docs/type-scale.md`.
5. **Unbundled offline font & missing button interactive states (`src/styles/variables.css:195-269`, `src/styles/app.css:212-228`):** Missing local `.woff2` `@font-face` fallback for offline Android and missing `:hover` / `:focus-visible` / `:active` states on `.btn-primary`.
