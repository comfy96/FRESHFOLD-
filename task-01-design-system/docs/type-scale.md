# Type Scale: Fresh Fold Laundry Design System

The Fresh Fold typography system defines 15 semantic styles across 5 roles (Display, Headline, Title, Body, Label) and 3 sizes each (Large, Medium, Small), built in Figma using **Plus Jakarta Sans** (`evidence/03-spacing-default.png` and `evidence/04-spacing-chosen.png`).

---

## Formula & Multiplier Rationale
Line height strictly follows the formula:
$$\text{Line Height} = \text{Font Size} \times \text{Multiplier}$$

- **Display & Headline Roles ($1.4\times$ Multiplier):** At large header sizes (24px–57px), lines take substantial vertical real estate on Amaka Obi's entry-level Android phone. A $1.5\times$ or $1.6\times$ multiplier creates awkward vertical separation and pushes the active laundry status record below the fold. $1.4\times$ keeps headings unified so her order truth shows immediately without scrolling.
- **Title & Body Roles ($1.5\times$ Multiplier):** Reading dated shop records ("Our records show 14 items collected 09 Nov 2026") and transfer logs requires generous vertical air between scanlines so the eye does not skip rows on a narrow mobile display.
- **Label Roles ($1.4\times$ Multiplier):** Labels sit inside bounded buttons, status badges, and offline sync tags where compact vertical padding keeps actions crisp and aligned.

---

## The 15 Typography Styles

| Style Role | Font Family | Weight | Size (px / rem) | Multiplier | Line Height (px / rem) | Letter Spacing | Primary Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Large** | Plus Jakarta Sans | 700 (Bold) | 57px / 3.56rem | $1.4\times$ | 80px / 5.00rem | `-0.25px` | Shop landing / primary item count hero |
| **Display Medium** | Plus Jakarta Sans | 700 (Bold) | 45px / 2.81rem | $1.4\times$ | 63px / 3.94rem | `-0.15px` | Order readiness spotlight |
| **Display Small** | Plus Jakarta Sans | 600 (SemiBold) | 36px / 2.25rem | $1.4\times$ | 50px / 3.13rem | `0px` | Total recorded payment headline |
| **Headline Large** | Plus Jakarta Sans | 600 (SemiBold) | 32px / 2.00rem | $1.4\times$ | 45px / 2.81rem | `0px` | Main status view header ("14 items ready") |
| **Headline Medium**| Plus Jakarta Sans | 600 (SemiBold) | 28px / 1.75rem | $1.4\times$ | 39px / 2.44rem | `0px` | Receipt detail modal header |
| **Headline Small** | Plus Jakarta Sans | 600 (SemiBold) | 24px / 1.50rem | $1.4\times$ | 34px / 2.13rem | `0px` | Section header (Clothes, Payment, Contact) |
| **Title Large** | Plus Jakarta Sans | 600 (SemiBold) | 22px / 1.38rem | $1.5\times$ | 33px / 2.06rem | `0px` | Brand mark / dated receipt heading |
| **Title Medium** | Plus Jakarta Sans | 500 (Medium) | 16px / 1.00rem | $1.5\times$ | 24px / 1.50rem | `+0.15px` | Garment count line item |
| **Title Small** | Plus Jakarta Sans | 500 (Medium) | 14px / 0.88rem | $1.5\times$ | 21px / 1.31rem | `+0.10px` | Ledger section title, Q&A questions |
| **Body Large** | Plus Jakarta Sans | 400 (Regular) | 16px / 1.00rem | $1.5\times$ | 24px / 1.50rem | `+0.25px` | Default body prose, primary explanations |
| **Body Medium** | Plus Jakarta Sans | 400 (Regular) | 14px / 0.88rem | $1.5\times$ | 21px / 1.31rem | `+0.25px` | Ledger keys, answers, owner contact box |
| **Body Small** | Plus Jakarta Sans | 400 (Regular) | 12px / 0.75rem | $1.5\times$ | 18px / 1.13rem | `+0.40px` | Last-updated date stamps, saved offline note |
| **Label Large** | Plus Jakarta Sans | 600 (SemiBold) | 14px / 0.88rem | $1.4\times$ | 20px / 1.25rem | `+0.10px` | Action buttons, primary links |
| **Label Medium** | Plus Jakarta Sans | 500 (Medium) | 12px / 0.75rem | $1.4\times$ | 17px / 1.06rem | `+0.50px` | Status pills ("READY FOR PICKUP"), payment tags |
| **Label Small** | Plus Jakarta Sans | 500 (Medium) | 11px / 0.69rem | $1.4\times$ | 15px / 0.94rem | `+0.50px` | Micro verification badges, table footnotes |

---

## Visual Letter Spacing Comparison (`03-spacing-default.png` vs `04-spacing-chosen.png`)
In Figma (`03-spacing-default.png`), `Display Large` (`57px` Plus Jakarta Sans Bold) defaults to `0px` letter spacing and `Auto` (`72px`) line height, occupying a `373px × 72px` bounding box where wide geometric letters (`D`, `a`, `L`) sit slightly loosely across the baseline. Applying `-0.25px` letter spacing alongside our explicit `80px` (`1.4×`) line height (`04-spacing-chosen.png`) pulls the glyph sidebearings cleanly inward from `373px` to `370px` wide without crowding character counters, giving multi-word display headers cohesive word silhouettes while maintaining clear vertical breathing room.

---

## Tabular Number Treatment
For payment entries (`₦4,500.00`, `₦1,500.00`), item counts (`14 items`), and record dates (`09 Nov 2026`), numerical displays use `font-variant-numeric: tabular-nums` (`tnum`) so figures align vertically like a paper receipt book.

