# Task 01: The Design System, and Proving the Agent Used It

**Business:** Fresh Fold Laundry (Nigerian neighbourhood laundry ledger & order status system)

---

## 1. What This Task Was
Establishing a single-source-of-truth design system in Figma for Fresh Fold Laundry—derived explicitly from Amaka Obi’s device and trust constraints (`docs/business-brief.md`)—exporting Figma Variables to JSON, compiling them into semantic CSS custom properties, proving the coding agent consumed semantic roles rather than reverting to generic defaults, and demonstrating what breaks when token referencing is severed.

## 2. What Was Built
- **Figma System & Exports (`docs/design-system/`, `evidence/`):**
  - Pinned `#007B71` (Deep Fresh Teal) at Primary 40 (`01-palette-before-pin.png` shifted `#006A61` vs `02-palette-after-pin.png` anchored `#007B71`).
  - 14-tone palettes + 10 extra surface tones across Light Mode and Dark Mode variable collections.
  - `Plus Jakarta Sans` 15-style type scale (`03-spacing-default.png` `0px`/Auto vs `04-spacing-chosen.png` `57/80` at `-0.25px`).
- **Written Reasoning (`docs/`):**
  - `business-brief.md`, `colour-roles.md` (Light & Dark role maps + W3C contrast audit), `type-scale.md`, `divergences.md`, `shadows.md`, `prompts.md`, `defects.md`, and `interview-answers.md` (12 answers, $\le 200$ words each).
- **Token Compiler & UI Screen (`scripts/`, `src/`):**
  - `scripts/build-tokens.js` compiling `06-tokens-complete.json` + Light/Dark mode role sheets into `src/styles/variables.css` (`122` primitives, `55` semantic roles, `3` shadows, `15` type styles).
  - Customer Order Status Screen (`src/index.html`, `src/styles/app.css`) containing **zero** raw hex literals and **zero** `--primitive-*` references (`evidence/07-raw-value-search.txt`).

## 3. Key Decisions & Required Analysis
- **Export Omission Diff (`05-tokens-incomplete.json` vs `06-tokens-complete.json`):**
  `05-tokens-incomplete.json` exported only `effect.soft shadow` (475 bytes) and omitted the entire `"primitives"` and `"color roles"` variable collections because Figma variables were unchecked during export; I noticed immediately when reading the JSON and finding zero color variables, then re-exported with variables enabled (`06-tokens-complete.json`, 77 KB).
- **Why Token Referencing Matters (Deliberate Regression Proof — `evidence/11-broken-referencing.png`):**
  When `--color-primary` is pointed directly at a raw hex literal (`#007B71`) while `--color-primary-containr` remains linked to `--primitive-color-primary-90`, changing the brand source colour shifts the contact banner while stranding the brand heading and CTA button on the old teal. That split interface is the whole argument for token indirection: raw values decay across releases, whereas semantic references propagate source changes atomically across every consumer. Without strict referencing, every theme or brand change degrades into broken, manual patching.

## 4. What We Got Wrong (`docs/defects.md`)
1. **Light Mode `Surface_Container_Lowest` Bug (`Color Roles.Light Mode.tokens.json:98-101`):** Mapped to dark `Neutral_20` (`#2B3230`), giving `1.31 : 1` contrast against `On_Surface`.
2. **Error Tones 60–99 White (`06-tokens-complete.json:1297-1370`):** Light coral steps collapsed to `#FFFFFF`, breaking dark mode `Error` contrast tinting.
3. **Unexported Typography & Stale Shadow Tint (`06-tokens-complete.json:1-21`):** `soft shadow` retained an earlier `#c2410c1f` burnt orange tint and typography styles were omitted from the JSON export.
4. **Offline Sync Stamp Role Mismatch (`src/styles/app.css:49-60`):** `.sync-pill` used `--type-label-small-*` (`11px`) instead of `--type-body-small-*` (`12px`) per `evidence/08-agent-typography-answer.txt`.
5. **Unbundled Offline Font & Missing Button States (`src/styles/variables.css:195-269`, `src/styles/app.css:212-228`):** No local `.woff2` fallback for offline Android and missing `:focus-visible`/`:active` states.
