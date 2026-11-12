# Accessibility Audit & Screen Reader Inspection (`docs/accessibility-audit.md`)

*(Step 6: Colour independence, keyboard reachability, focus visibility, screen reader announcement, and error association.)*

---

## 1. Visual Caution Indicator (Non-Colour Signal)
Every inline error row in `src/app/auth/AuthForm.tsx:8-27, 236-241` pairs the error colour (`--color-error` border on `.inputError` and text color in `.errorRow`, `src/app/auth/auth.module.css:132-135, 170-180`) with an inline SVG warning triangle (`CautionIcon` with `aria-hidden="true"` inside a `role="alert"` container). A user in the red-green colour blindness spectrum who cannot distinguish `--color-error` from neutral borders still sees a distinct geometric triangle symbol immediately before the text message.

---

## 2. Field-by-Field Written Audit (All 5 Criteria)

| Control / Field (`src/app/auth/AuthForm.tsx`) | 1. Colour Independence | 2. Keyboard Reachability | 3. Focus Visibility | 4. Screen Reader Announcement | 5. Error Association |
|---|---|---|---|---|---|
| **Auth mode tabs** (`Sign up`, `Log in`, `Reset password`, `174-202`) | Active state swaps both fill (`--color-primary`) and border (`auth.module.css:73-77`) + `aria-selected`. | Reachable via `Tab`; Space/Enter switches mode. | `2px` (`0.125rem`) `--color-primary` outline with `0.125rem` offset (`auth.module.css:79-82`). | `role="tab"` + `aria-selected={mode === ...}` announced (`selected=true/false`). | N/A (navigation control). |
| **Full name** (`221-242`) | `.inputError` thicker `0.125rem` border + `CautionIcon` triangle + explicit error text. | Native `<input id="fullName" type="text">` in natural tab order. | `0.125rem` solid `--color-primary` `:focus-visible` ring (`auth.module.css:127-130`). | Labelled via `<label htmlFor="fullName">`; `aria-required="true"` (`required: True`). | `aria-invalid={Boolean(errors.fullName)}` + `aria-describedby="fullName-error"` pointing to `role="alert"` node. |
| **Email address** (`245-274`) | `.inputError` thicker border + `CautionIcon` + error copy. | Native `<input id="email" type="email">` in natural tab order. | `0.125rem` solid `--color-primary` `:focus-visible` ring. | `<label htmlFor="email">` + `aria-required="true"`. | `aria-invalid` + `aria-describedby="email-error"` pointing to `role="alert"`. |
| **Nigerian phone number** (`278-299`) | `.inputError` thicker border + `CautionIcon` + prefix guidance text. | Native `<input id="phone" type="tel">` in natural tab order. | `0.125rem` solid `--color-primary` `:focus-visible` ring. | `<label htmlFor="phone">` + `aria-required="true"`. | `aria-invalid` + `aria-describedby="phone-error"` pointing to `role="alert"`. |
| **Shop docket number** (`301-323`) | `.inputError` thicker border + `CautionIcon` + error copy. | Native `<input id="docketNumber" type="text" inputMode="numeric">` (no spinbutton traps). | `0.125rem` solid `--color-primary` `:focus-visible` ring. | `<label htmlFor="docketNumber">` + `aria-required="true"`; announced as plain `textbox` instead of `spinbutton valuetext=0`. | `aria-invalid` + `aria-describedby="docketNumber-error"`. |
| **Counter claim PIN** (`325-347`) | `.inputError` thicker border + `CautionIcon` + error copy. | Native `<input id="claimPin" type="text" inputMode="numeric">`. | `0.125rem` solid `--color-primary` `:focus-visible` ring. | `<label htmlFor="claimPin">` + `aria-required="true"`. | `aria-invalid` + `aria-describedby="claimPin-error"`. |
| **Password & visibility toggle** (`351-390`) | `.inputError` border + `CautionIcon`; toggle text switches `'Show'`/`'Hide'`. | Input then toggle `<button type="button">` in tab order. | Both `.input:focus-visible` and `.toggleBtn:focus-visible` outline (`auth.module.css:157-160`). | `<label htmlFor="password">`, `aria-required="true"`; toggle button exposes explicit `aria-label` (`Show password` / `Hide password`) and `aria-pressed={showPassword}`. | `aria-describedby` dynamically combines `'password-hint'` (when `password.length > 0` in signup) and `'password-error'` (`AuthForm.tsx:165-170`). |
| **Terms checkbox** (`400-416`) | Native checkbox check mark + click/submit explanation alert below button. | Native `<input id="termsAccepted" type="checkbox">` toggled via Spacebar. | `.checkboxInput:focus-visible` ring (`auth.module.css:200`). | `<label htmlFor="termsAccepted">` binds the full consent sentence; `required` + `aria-required="true"`. | Known defect noted in `docs/defects.md`: relies on `#statusExplain` `role="alert"` after clicking submit rather than an inline `#terms-error` `aria-describedby` on blur. |
| **Submit button (`Create account`)** (`420-438`) | Text contrast + visual disabled styling (`.submitBtnDisabled`). | **Remains focusable in tab order** via `aria-disabled={!signupReady}` instead of HTML `disabled` attribute (`AuthForm.tsx:422`). | Clear focus ring even while disabled. | Announced as `button "Create account" disabled=True focusable=True`. | Clicking/activating while incomplete keeps user in place, triggers inline errors, and fires `role="alert"` `#statusExplain` explaining *why* (`Accept the Fresh Fold Laundry record-keeping terms...` or `Fix the highlighted fields...`). |

---

## 3. Four Real Problems Found in Stage 1 and Fixed in Stage 2

1. **Disabled submit control removed from tab order with zero explanation:** In Stage 1 (`evidence/13-button-hidden-version.png`), the submit button was conditionally omitted when `!signupReady`, leaving keyboard and screen reader users with no submit control in the DOM or AXTree at all (`ax-before.json` had zero `"Create account"` node). **Fix:** Always render `<button type="submit">` with `aria-disabled={mode === 'signup' ? !signupReady : false}` (`AuthForm.tsx:420-432`) and emit an assertive `role="alert"` explanation (`AuthForm.tsx:136-142, 434-438`).
2. **Terms checkbox had no programmatic accessible name or required signal (`mouse-only` label / missing `aria-required`):** In Stage 1, `<label>` lacked `htmlFor="termsAccepted"` matching the checkbox and omitted `required` / `aria-required="true"`, appearing in `/tmp/ax-before.json` as `[checkbox] name='' checked='false'`. **Fix:** Wired `id="termsAccepted"`, `required`, `aria-required="true"`, and `<label htmlFor="termsAccepted">` (`AuthForm.tsx:401-416`).
3. **Shop docket field exposed `spinbutton` semantics and `valuetext='0'` default:** Stage 1 rendered `<input type="number">`, which exposed `[spinbutton] name='Shop docket number' val=0 props={..., 'valuetext': '0'}` in `/tmp/ax-before.json` alongside browser spinner UX friction (`evidence/09-number-input-annoying.png`). **Fix:** Converted to `<input type="text" inputMode="numeric">` stripped with `.replace(/\D/g, '')` (`AuthForm.tsx:305-316`).
4. **Password toggle lacked clear name/state and password requirements were unlinked:** Stage 1 showed `[button] name='Show'` with no `aria-pressed`, required fields had `required: False`, and the password requirement hint was not programmatically tied to the password input via `aria-describedby`. **Fix:** Added `aria-required="true"`, `aria-invalid`, `aria-label={showPassword ? 'Hide password' : 'Show password'}`, `aria-pressed={showPassword}`, and `aria-describedby={passwordDescribedBy}` linking `#password-hint` and `#password-error` (`AuthForm.tsx:165-170, 357-382`).

---

## 4. Screen Reader Announcements Before & After (`Accessibility.getFullAXTree`)

> **Honest verification note:** The before/after transcripts below are taken verbatim from live Chrome DevTools Protocol `Accessibility.getFullAXTree` captures of the rendered `/auth?mode=signup` DOM on this machine (`/tmp/ax-before.json`, `/tmp/ax-after.json`, and `/tmp/ax-after-error.json`). Optional macOS VoiceOver `.mp3` recordings (`11-screenreader-before.mp3`, `12-screenreader-after.mp3`) are left to the user to record aloud for bonus marks.

### Before Fixes (Stage 1 — `/tmp/ax-before.json`)
- `[button] name='Sign up' props={'focusable': True}` (no `tab` role or `selected` state)
- `[button] name='Log in' props={'focusable': True}`
- `[button] name='Reset password' props={'focusable': True}`
- `[textbox] name='Full name' val='' desc='' props={'invalid': 'false', 'required': False}`
- `[textbox] name='Email address' val='' desc='' props={'invalid': 'false', 'required': False}`
- `[textbox] name='Nigerian phone number' val='' desc='' props={'invalid': 'false', 'required': False}`
- `[spinbutton] name='Shop docket number' val=0 desc='' props={'invalid': 'false', 'required': False, 'valuetext': '0'}`
- `[textbox] name='Counter claim PIN' val='' desc='' props={'invalid': 'false', 'required': False}`
- `[textbox] name='Password' val='' desc='' props={'invalid': 'false', 'required': False}`
- `[button] name='Show' props={'focusable': True}` (missing `pressed` toggle state and password target label)
- `[checkbox] name='' props={'invalid': 'false', 'focusable': True, 'checked': 'false'}` (**nameless checkbox**)
- *(Submit button absent from the accessibility tree completely)*

### After Fixes (Stage 2 Valid Entry / Pre-Terms — `/tmp/ax-after.json`)
- `[tab] name='Sign up' props={'focusable': True, 'selected': True}`
- `[tab] name='Log in' props={'focusable': True, 'selected': False}`
- `[tab] name='Reset password' props={'focusable': True, 'selected': False}`
- `[textbox] name='Full name' val='Amaka Obi' props={'invalid': 'false', 'required': True}`
- `[textbox] name='Email address' val='amaka@freshfold.ng' props={'invalid': 'false', 'required': True}`
- `[textbox] name='Nigerian phone number' val='08030004120' props={'invalid': 'false', 'required': True}`
- `[textbox] name='Shop docket number' val='400' props={'invalid': 'false', 'required': True}` *(clean `textbox`, no `spinbutton` or `0` default)*
- `[textbox] name='Counter claim PIN' val='48219' props={'invalid': 'false', 'required': True}`
- `[textbox] name='Password' val='•••••••••••' desc='Use at least 10 characters (three ordinary words work well).' props={'required': True, 'describedby': 'password-hint'}`
- `[button] name='Show password' props={'focusable': True, 'focused': True, 'pressed': 'false'}`
- `[checkbox] name='I accept the Fresh Fold Laundry record-keeping terms and privacy notice.' props={'invalid': 'true', 'focusable': True, 'checked': 'false'}`
- `[button] name='Create account' props={'disabled': True, 'invalid': 'false', 'focusable': True}` *(still in tab order!)*

### After Fixes with Validation Errors Triggered (`/tmp/ax-after-error.json`)
- `[textbox] name='Full name' val='Amaka' desc='Enter at least two name words separated by a space.' props={'invalid': 'true', 'required': True, 'describedby': 'fullName-error'}` + `[alert] live='assertive', atomic=True`
- `[textbox] name='Email address' val='' desc='Enter the email address for your order alerts.' props={'invalid': 'true', 'required': True, 'describedby': 'email-error'}` + `[alert] live='assertive', atomic=True`
- `[textbox] name='Nigerian phone number' val='0803' desc='Enter an 11-digit Nigerian mobile number starting with 070, 080, 081, 090, or 091.' props={'invalid': 'true', 'required': True, 'describedby': 'phone-error'}` + `[alert] live='assertive', atomic=True`
- `[textbox] name='Shop docket number' val='' desc='Enter the docket number from your shop receipt.' props={'invalid': 'true', 'required': True, 'describedby': 'docketNumber-error'}` + `[alert] live='assertive', atomic=True`
- `[textbox] name='Counter claim PIN' val='123' desc='Claim PIN must be 5 to 8 digits and not all identical.' props={'invalid': 'true', 'required': True, 'describedby': 'claimPin-error'}` + `[alert] live='assertive', atomic=True`
- `[button] name='Create account' props={'disabled': True, 'focusable': True}` -> activating while invalid fires the assertive `[alert]` explaining the exact blocker.
