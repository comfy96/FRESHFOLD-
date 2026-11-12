# Interview Defence — Task 01: Design System

*(Strict limit: Maximum 200 words per answer.)*

---

### 1. How would you structure design tokens?
I structure tokens into three strict abstraction tiers following W3C Design Token principles:

1. **Tier 1 — Primitives (Option Tokens):** Raw values carrying no UI meaning (`--primitive-color-primary-40: #007B71`, `--primitive-color-neutral-98: #F4FBF8`). UI components are strictly forbidden from referencing these directly.
2. **Tier 2 — Semantic Roles (Alias Tokens):** Job-based pointers referencing Tier 1 (`--color-primary: var(--primitive-color-primary-40)`, `--color-surface: var(--primitive-color-neutral-98)`). They define *purpose*—backgrounds, text on surfaces, outlines, interactive actions—rather than visual hue.
3. **Tier 3 — Component Tokens (Optional Override Layer):** Scoped strictly where a single component requires localized overrides without breaking global rules.

In Fresh Fold Laundry, Light and Dark mode role sheets (`Color Roles.Light Mode.tokens.json` and `Dark Mode.tokens.json`) sit alongside primitive tonal scales (`06-tokens-complete.json`) and compile via `build-tokens.js` into CSS custom properties (`variables.css`). Separating what a value *is* from what job it *performs* ensures rebrands or theme swaps propagate automatically without touching component styles.

---

### 2. When is a token change breaking?
A token change is breaking whenever it alters the public contract consumed by downstream components, requiring manual code edits or causing unintended visual or accessibility regressions:

1. **Deletion or renaming of a semantic token:** Removing `--color-primary-containr` or renaming `--type-label-large` breaks every CSS consumer referencing that variable, causing browsers to fall back to inherited or transparent styles.
2. **Changing a semantic role’s contrast contract:** Swapping `--color-surface-container-lowest` in Light Mode from white (`Neutral_100`) to dark `Neutral_20` (`#2B3230`) drops text contrast to an unreadable **1.31:1** against `On_Surface`.
3. **Altering structural dimensionality or units:** Converting a length token (`px`/`rem`) to a unitless multiplier or changing a shadow token from valid `box-shadow` syntax breaks CSS declarations.
4. **Repurposing a role’s semantic job:** Using `--color-outline` (`4.28:1`, UI borders only) for normal body copy violates WCAG AA text contrast.

Changing a primitive hex *inside* an existing contract while preserving contrast and CSS type is non-breaking.

---

### 3. How would you support multiple brands and themes?
By routing all UI components strictly through Tier 2 **semantic role tokens**, while swapping Tier 1 primitive bindings at `:root` or via data attributes.

Components only ever declare `background-color: var(--color-surface)` and `color: var(--color-on-surface)`. To support Light and Dark themes from one source, our Figma system defines a 14-tone perceptual ramp (`0` through `100`) plus extra surface tones:
- Default `:root` (Light Mode) binds `--color-primary: var(--primitive-color-primary-40)` (`#007B71`) and `--color-on-primary: var(--primitive-color-primary-100)` (`#FFFFFF`, **5.16:1**).
- `[data-theme="dark"]` swaps only semantic bindings: `--color-primary: var(--primitive-color-primary-80)` (`#79D6CA`) and `--color-on-primary: var(--primitive-color-primary-20)` (`#003732`, **7.71:1**).

To support multiple brands (e.g., Fresh Fold Laundry vs. a commercial hotel partner portal), a `[data-brand="partner"]` stylesheet swaps Tier 1 primitives (`--primitive-color-primary-*`, font family, elevation tint) while leaving every semantic role name and component stylesheet untouched.

---

### 4. Can tokens guarantee accessible contrast?
No—tokens **enable and preserve** accessible contrast pairs, but they cannot guarantee accessibility on their own.

A color token holds one value (`--color-primary` or `--color-surface`), whereas contrast is a **relational property between two layers**: foreground text against its rendered background. Tokens fail to guarantee contrast in three ways:
1. **Mispaired roles:** Even with a balanced 14-tone palette, an engineer who places `--color-on-surface-variant` (`#3F4947`) over `--color-primary` (`#007B71`) creates an unreadable **1.82:1** ratio.
2. **Broken mode mappings:** As seen in our own Figma audit, miswiring Light Mode `Surface_Container_Lowest` to `Neutral_20` (`#2B3230`) produces **1.31:1** contrast behind dark text despite valid primitive tokens.
3. **Non-color state cues:** High-contrast tokens still fail accessibility if color alone signals error states without caution icons, plain wording, or ARIA announcements for red-green colorblind users.

Contrast compliance requires strict foreground/background pairing rules (`--color-on-X` on `--color-X`) alongside automated linting and manual luminance verification.

---

### 5. How do you ensure that colour contrast guidelines are met within a website or application's design?
Ensuring contrast requires enforcing strict pairing contracts from Figma variables down to rendered DOM inspection:

1. **Contractual role pairing:** Every background role (`Primary`, `Surface`, `Success_Container`) has a dedicated foreground partner (`On_primary`, `On_Surface`, `On_Success_Container`). Components are forbidden from mixing across pairs.
2. **Luminance calculation at token level:** Using W3C relative luminance math, we verify every active pair meets **4.5:1** for body copy and **3.0:1** for large text and UI boundaries. Tokens below 4.5:1—such as `Outline` (`4.28:1`) and `Outline_variant` (`1.62:1`) on `Surface`—are explicitly restricted to non-text borders and dashed dividers.
3. **Catching mode-mapping errors early:** Auditing Light and Dark mode JSON exports flagged `Surface_Container_Lowest` (`1.31:1`) and blank `Error_60–99` (`#FFFFFF`) before production use.
4. **Device and vision verification:** Testing under dimmed LCD brightness (simulating Amaka’s entry-level Android phone) and color-vision deficiency filters ensures text remains legible without relying solely on hue.

---

### 6. Can you discuss the differences between WCAG levels A, AA and AAA?
WCAG (Web Content Accessibility Guidelines) defines three progressive conformance tiers:

- **Level A (Essential Baseline):** Removes critical barriers that make an application completely unusable by assistive technologies. Requirements include text alternatives for non-text content, full keyboard navigation without traps, and never using color alone to convey meaning. Level A enforces no numeric text contrast ratio.
- **Level AA (Industry & Legal Standard):** The accepted target for commercial web apps and public services. For contrast, AA mandates **4.5:1** for normal text, **3.0:1** for large text ($\ge 18\text{pt}$ or $14\text{pt}$ bold) and UI component boundaries, visible keyboard focus indicators, and consistent navigation landmarks.
- **Level AAA (Maximum Accessibility):** The strictest tier, tailored for specialized audiences or critical services. AAA requires **7.0:1** contrast for normal text and **4.5:1** for large text, stricter cognitive/time-limit rules, and sign-language support. Full-site AAA severely constrains brand color choices—for instance, `#007B71` on white (`5.16:1`) passes AA cleanly but misses AAA (`7.0:1`), whereas our primary ledger text (`#161D1B` on `#F4FBF8`, **16.32:1**) exceeds AAA.

---

### 7. Discuss the importance of semantic HTML in the context of accessibility.
Semantic HTML uses elements that communicate structural meaning and native behaviour (`<main>`, `<header>`, `<section>`, `<button>`, `<label>`, `<h1>`–`<h3>`, `<aside>`) rather than generic `<div>` and `<span>` tags.

Screen readers, switch devices, and keyboard navigation depend directly on the browser's Accessibility Tree built from HTML semantics:
1. **Native keyboard mechanics:** A `<button>` is automatically focusable via `Tab`, activates on both `Enter` and `Space`, and announces its role. A styled `<div class="btn">` is invisible to keyboard navigation and silent to screen readers unless manually rebuilt with `tabindex` and ARIA key handlers.
2. **Landmark and heading navigation:** Assistive technology users navigate by jumping across `<main>`, `<aside>`, and heading hierarchies (`<h1>` $\rightarrow$ `<h2>` $\rightarrow$ `<h3>`). In Fresh Fold, marking the status hero as `<h1>` inside `<section aria-labelledby>` allows blind users to jump straight to `"14 items ready"` or `"Payment Record"` immediately.
3. **Low-data resilience:** When CSS stalls on unreliable mobile connections, semantic HTML still renders clean hierarchy.

---

### 8. How do you handle design handoff to developers using Figma?
Effective Figma handoff treats design tokens as versioned engineering contracts rather than visual guesswork:

1. **Aligned two-tier Figma Variables:** Variables are organized into **Primitives** and **Color Roles** (with explicit Light Mode and Dark Mode collections) so variable intent maps straight into CSS custom properties.
2. **Explicit Typography & Elevation Styles:** Every type role (15 styles of `Plus Jakarta Sans`) specifies font weight, pixel/rem sizes, calculated line height (`1.4×` / `1.5×`), and visual letter spacing (`04-spacing-chosen.png`).
3. **Structured JSON Export & Diff Checks:** Exporting via Figma Design Tokens plugin requires explicitly including **Variables** alongside Styles; checking the JSON prevents incomplete exports (`05-tokens-incomplete.json` missing primitives/roles vs. `06-tokens-complete.json`).
4. **Automated Compilation & Defect Handoff:** A compiler script (`build-tokens.js`) converts JSON into `variables.css` with strict component rules banning raw hex literals (`07-raw-value-search.txt`), while flagging unresolved Figma defects (like unexported typography or stale shadow hexes) upfront rather than letting developers guess.

---

### 9. Why do AI-generated interfaces tend to look generic, and what specifically do you hand an agent to stop it?
Without constraints ("build a laundry status page"), an LLM outputs the statistical mode of its training set—Tailwind `#F3F4F6` gray backgrounds, `#2563EB` electric blue buttons, `rgba(0,0,0,0.1)` gray shadows, and boilerplate widgets like "Open Live Chat." That generic layout is the mathematically expected output of an underspecified prompt.

To force a distinct, domain-authentic interface, you hand the agent four concrete artifacts before it writes UI code:
1. **A strict business brief (`business-brief.md`):** Specifying Amaka Obi’s device limits, the receipt-book aesthetic, and explicit copy constraints ("Our records show," never "You owe" or chatbot UI).
2. **Compiled semantic token CSS (`variables.css`):** Exported from Figma variables (`#007B71` teal roles, brand-tinted shadows, 15 `Plus Jakarta Sans` styles).
3. **A strict consumption rule (`prompts.md`):** Prohibiting raw hex literals, `rgb()`/`rgba()` calls, and Tier 1 `--primitive-*` tokens inside UI stylesheets.
4. **Verification audits:** Running `grep` to prove zero raw color values exist outside `variables.css` (`07-raw-value-search.txt`) and auditing typography tokens per element.

---

### 10. Your line height for display large is a specific number. Why that number and not one step either side of it? What would you lose with each?
Our `Display Large` token is **57px** with a **1.4×** multiplier, producing an exact **80px** line height (`57/80` in `04-spacing-chosen.png`).

- **Why not one step tighter (e.g., 1.3× / 74px, or Figma’s `Auto` 72px in `03-spacing-default.png`)?**
  At 57px, `Plus Jakarta Sans` Bold carries deep descenders (`g, y, p`) and tall ascenders (`h, l, d`). When a large status headline wraps onto two lines on a narrow 360px entry-level Android screen, tightening below 1.4× crowds descenders from line one into ascenders on line two, reducing legibility under screen glare.
- **Why not one step looser (1.5× / 86px or 1.6× / 91px)?**
  Stepping up to 1.5× adds 6px per line (12px across a two-line display block). On budget Android viewports (640px–720px tall), extra vertical air in the top header pushes Amaka’s critical order status record ("14 items ready" and payment confirmation) down toward the fold, violating our brief’s rule that her record appears first without scrolling.

1.4× balances crisp wrapped separation with above-the-fold compactness.

---

### 11. Point at one place in your own token structure that you would build differently if you started again. Say what you would do instead and what it would cost.
In `evidence/06-tokens-complete.json` and `docs/design-system/`, two issues stood out: first, `Color Roles` exported typos in token keys (`Primary_containr`, `On_sceondary`, `Tertirary`, `pimary_0`), forcing `build-tokens.js` to normalize mismatched names; second, shadows were exported as flat RGBA strings (`#c2410c1f`) without `medium`/`hard` levels or a decoupled RGB channel primitive, and typography styles weren't exported into the JSON at all.

If starting again, I would:
1. Enforce a strict kebab-case naming lint check inside Figma before exporting variables (`primary-container`, `on-secondary`, `tertiary`).
2. Split `--primitive-color-primary-rgb: 0, 123, 113` as a channel token so all three shadows (`soft`, `medium`, `hard`) compose automatically via `rgba(var(--primitive-color-primary-rgb), alpha)` alongside exported Figma Text Styles.

**What this would cost:**
Running naming linters and maintaining split RGB triplet primitives slows down rapid Figma exploration, complicates cross-platform exports to iOS/Android native tokens (which expect hex rather than comma-separated RGB triplets), and requires custom build parsing logic.

---

### 12. Wrong-answer analysis. A candidate says: "I set up design tokens by exporting the hex values from Figma into a CSS file, so every colour in the codebase comes from one place. That makes it a single source of truth." This sounds correct and is not. Say precisely what is missing and what will go wrong in month four.
What the candidate exported is a list of **Tier 1 primitive constants** (`--teal-40: #007B71`), not a design token system—and a static one-off CSS export is **not** a single source of truth.

**Two critical pieces are missing:**
1. **Semantic Role Indirection (Tier 2):** Raw hex variables describe *what a color looks like*, not *what job it performs* (`--color-primary`, `--color-surface`, `--color-on-surface`).
2. **Automated Figma-to-Code Synchronization:** Manually dumping CSS once leaves no structured JSON pipeline tying Figma variable updates to code builds.

**What goes wrong in month four:**
1. **Theme and mode collapse:** When the product adds Dark Mode or high-contrast accessibility modes, changing `--teal-40` breaks components whose contrast jobs diverge in dark themes, forcing engineers to hunt down hundreds of direct primitive references across stylesheets.
2. **Silent design-code drift:** Designers tweak tokens in Figma while developers hardcode ad-hoc hex overrides in CSS when a needed role doesn’t exist. By month four, Figma and production CSS hold two incompatible palettes.

