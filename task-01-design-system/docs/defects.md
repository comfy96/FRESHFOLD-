# Known Defects — Task 01: Design System

Per assessment requirements, this document records genuine defects present in our current Task 1 artifacts and code, with exact file paths, line numbers, and production impact.

---

### Defect 1: Light Mode `Surface_Container_Lowest` Mapped to Dark Neutral Tone (`1.31 : 1` Contrast Failure)
- **Location:** `task-01-design-system/docs/design-system/Color Roles.Light Mode.tokens.json:98-101` (compiled to `src/styles/variables.css:157`)
- **What is wrong:** `Surface_Container_Lowest` in Light Mode points to `{Color_pallete.Neutral.Neutral_20}` (`#2B3230`) instead of `Neutral_100` (`#FFFFFF`).
- **Production cost:** Any Light Mode component adopting `--color-surface-container-lowest` as a card background renders dark `#161D1B` (`On_Surface`) text over `#2B3230`, yielding an unreadable **`1.31 : 1`** contrast ratio. Until corrected in Figma, UI cards are forced onto `--color-surface-container-low` (`#EEF5F2`), sacrificing visual separation between page canvas (`#F4FBF8`) and receipt cards.

---

### Defect 2: Error Tones 60–99 Collapsed to Pure White (`#FFFFFF`) in Figma Palette
- **Location:** `task-01-design-system/evidence/06-tokens-complete.json:1297-1370` (and `task-01-design-system/docs/design-system/Primitives.Mode 1.tokens.json`)
- **What is wrong:** Tones `error 60` through `error 99` were exported as `#ffffffff` (`#FFFFFF`) rather than lighter coral/pink tonal steps (`#FFB4AB`, `#FFDAD6`).
- **Production cost:** In Light Mode, `Error_Container` (`Error_90`) renders pure white without a visual error surface tint; worse, in Dark Mode (`src/styles/variables.css:289-292`), `Error` (`Error_80`) and `On_Error_container` (`Error_90`) resolve to flat white, stripping error semantics from dark-theme validation banners.

---

### Defect 3: Typography Scale & Medium/Hard Shadows Missing from Figma JSON Export + Stale Shadow Tint
- **Location:** `task-01-design-system/evidence/06-tokens-complete.json:1-21` and `task-01-design-system/scripts/build-tokens.js:80-102`
- **What is wrong:** First, `06-tokens-complete.json` exports `effect.soft shadow` with a leftover `#c2410c1f` burnt-orange tint from an earlier exploration rather than our pinned `#007B71` teal, and omits `medium` and `hard` shadows. Second, typography styles exist in Figma (`04-spacing-chosen.png`) but were not included in the JSON export, forcing `build-tokens.js:80-102` to encode the shadows and 15 typography styles manually in JavaScript.
- **Production cost:** Typography updates made in Figma (such as changing letter spacing or multipliers) will not propagate automatically on `node build-tokens.js`, introducing silent design-to-code drift.

---

### Defect 4: Offline Sync Stamp Uses Wrong Typography Role (`11px` vs `12px`)
- **Location:** `src/styles/app.css:49-60` (lines `52-56`)
- **What is wrong:** `.sync-pill` ("Saved offline: 11 Nov 2026" in `src/index.html:13`) applies `--type-label-small-*` (`11px`, weight `500`, `15px` line height) instead of `--type-body-small-*` (`12px`, weight `400`, `18px` line height) assigned in `docs/type-scale.md` for offline sync stamps. (Documented in `evidence/08-agent-typography-answer.txt`.)
- **Production cost:** On Amaka Obi’s entry-level Android LCD screen, `11px` shrinks the timestamp telling her whether her cached laundry status is fresh or days old when her mobile data bundle is off.

---

### Defect 5: Unbundled Offline Font & Missing Button Interactive States
- **Location:** `src/styles/variables.css:195-269` and `src/styles/app.css:212-228`
- **What is wrong:** Typography variables declare `Plus Jakarta Sans, sans-serif`, yet no local subsetted `.woff2` `@font-face` is bundled for offline Android browsers. Additionally, `.btn-primary` (`src/styles/app.css:212-228`) omits `:hover`, `:focus-visible`, and `:active` states.
- **Production cost:** When offline, Android falls back to system `Roboto` (altering line metrics), while keyboard users lack a visible focus ring (WCAG 2.4.7 failure) and slow-network mobile users receive zero tap feedback.

