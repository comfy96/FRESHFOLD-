# Agent Prompts & Iteration Log: Design Token Compilation

This document records the exact prompts given to the coding agent to transform the Figma JSON exports into semantic CSS custom properties (`src/styles/variables.css`) and build the Task 1 order record screen.

---

## 1. Initial Prompt Draft (Failed Attempt)

```markdown
Read the Figma token exports in `task-01-design-system/evidence/06-tokens-complete.json` and generate a CSS file `src/styles/variables.css` exporting all colors, shadows, and typography styles for the Fresh Fold Laundry frontend.
```

### What Failed & Why We Changed It
1. **Direct Primitive Leakage:** Without an explicit barrier, the agent flattened the color ramp into raw hex variables (`--primary-40: #007b71`) and immediately used `--primary-40` directly inside component stylesheets rather than routing through semantic roles (`--color-primary`).
2. **Dark Mode Overwrite Trap:** Because `06-tokens-complete.json` exported Dark Mode bindings under `color roles`, reading only that single file made the agent accidentally emit Dark Mode values (`primary 80`) onto a Light Mode screen.
3. **Hardcoded Role Table:** In an intermediate draft of `build-tokens.js`, the agent hardcoded a static JavaScript `roleMap` object instead of reading `Color Roles.Light Mode.tokens.json` directly, breaking the single-source-of-truth sync (logged in `docs/defects.md`).

---

## 2. Final Prompt (Verbatim)

```markdown
Read the Figma token exports in `task-01-design-system/evidence/06-tokens-complete.json` and the mode variable sheets in `task-01-design-system/docs/design-system/Color Roles.Light Mode.tokens.json` and `Color Roles.Dark Mode.tokens.json`.

Write/update `task-01-design-system/scripts/build-tokens.js` to compile these design tokens into `src/styles/variables.css` with strict two-tier separation:

1. Tier 1 Primitives (`--primitive-*`): Emit all primitive tonal ramps (`primary`, `secondary`, `tertiary`, `neutral`, `neutral-variant`, `error`, `warning`, `success`, `extra-tone`) under `:root`. Components are strictly forbidden from referencing `--primitive-*` tokens.
2. Tier 2 Semantic Roles (`--color-*`): Map Light Mode semantic roles (`--color-primary`, `--color-on-primary`, `--color-surface`, `--color-on-surface`, etc.) strictly to `--primitive-*` pointers—never raw hex literals—and support `[data-theme="dark"]` overrides from `Color Roles.Dark Mode.tokens.json`.
3. Elevation & Typography: Emit `--shadow-soft`, `--shadow-medium`, `--shadow-hard` (derived from primary `#007B71`, flagging any incomplete Figma style exports) and all 15 typography styles matching `docs/type-scale.md`.
4. Interface Rule: Build the Customer Order Status screen (`src/index.html`, `src/styles/app.css`) consuming ONLY Tier 2 semantic roles (`--color-*`, `--type-*`, `--shadow-*`). Zero raw hex codes, zero `rgb()`/`rgba()` literals, and zero `--primitive-*` references may appear in any UI file outside `variables.css`.
```

---

## 3. What Changed Between Attempts
- **Mode Awareness:** Added explicit references to `Color Roles.Light Mode.tokens.json` and `Dark Mode.tokens.json` so Light Mode screens did not inherit Dark Mode tokens from `06-tokens-complete.json`.
- **Two-Tier Indirection:** Explicitly forbade `--primitive-*` and raw hex literals inside component stylesheets so `grep` verification (`evidence/07-raw-value-search.txt`) proves real token consumption.

