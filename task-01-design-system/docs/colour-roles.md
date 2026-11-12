# Colour System & Semantic Roles

## 1. Brand Colour Origin
- **Hex:** `#007B71` (Deep Fresh Teal)
- **Origin:** Fresh Fold Laundry serves Nigerian customers like Amaka Obi who want calm, trustworthy proof of their laundry count and bank transfer records on entry-level Android phones. The `#007B71` deep teal comes from the association with freshly rinsed linen, clean soap water, and calm ledger ink—serious enough to look like a verified receipt book, yet distinct from generic blue fintech or SaaS defaults (`#2563EB`).

---

## 2. Pinning Primary 40 (`01-palette-before-pin.png` vs `02-palette-after-pin.png`)
When `#007B71` was initially passed into an unpinned tonal generator, the algorithm adjusted perceptual lightness to fit its standard curve, absorbing and shifting the key colour darker to **`#006A61`** (evident in `01-palette-before-pin.png`). By explicitly pinning **`#007B71`** as **Primary 40**, the generator anchored Tone 40 to our exact brand hex and built the remaining tones outward from it (`02-palette-after-pin.png`).

### Visible Difference
Before pinning, the key swatch shifted darker and flatter (`#006A61`), pulling the midtones toward muted pine green and making primary containers feel dull. After pinning `#007B71` as Primary 40, the entire tonal ramp shifts slightly brighter and cleaner across Tones 40–80 (`#007B71` $\rightarrow$ `#1A857B` $\rightarrow$ `#3F9F94` $\rightarrow$ `#79D6CA`), giving light highlights a crisp aquatic tint while preserving dark legibility at Tones 10–30 (`#00201D`–`#005049`).

---

## 3. Tonal Palettes (14 Core Tones + 10 Extra Surface Tones)
Our Figma variable system generates **14 core tones** ($0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100$) for each key colour, supplemented by **10 extra neutral surface tones** ($4, 6, 12, 17, 22, 24, 87, 92, 94, 96$) for fine-grained card elevation steps.

Fourteen tones are sufficient to derive both **Light Mode** and **Dark Mode** from one single source without authoring separate colour palettes:
- **Light Mode** pairs Tone `40` (`#007B71`) with Tone `100` (`#FFFFFF`) for `Primary` / `On_primary` (**5.16 : 1**), and Tone `98` (`#F4FBF8`) with Tone `10` (`#161D1B`) for `Surface` / `On_Surface` (**16.32 : 1**).
- **Dark Mode** flips the exact same ramp, pairing Tone `80` (`#79D6CA`) with Tone `20` (`#003732`) for `Primary` / `On_primary` (**7.71 : 1**), and Tone `10` (`#161D1B`) with Tone `90` (`#DDE4E1`) for `Surface` / `On_Surface` (**13.27 : 1**).

### Key Colours & Core Tones
- **Primary (`#007B71`):** `0: #000000`, `10: #00201D`, `20: #003732`, `30: #005049`, **`40: #007B71`**, `50: #1A857B`, `60: #3F9F94`, `70: #5DBBAF`, `80: #79D6CA`, `90: #96F3E6`, `95: #B3FFF4`, `98: #E4FFFA`, `99: #F2FFFC`, `100: #FFFFFF`
- **Secondary (`#59726E`):** `10: #061F1D`, `20: #1E2322`, `30/40: #334B48`, `50: #4A635F`, `80: #96B1AC`, `90/95: #DBF6F1`, `100: #FFFFFF`
- **Tertiary (`#48756F`):** `10: #00201D`, `20: #023732`, `30: #204E49`, `40: #396660`, `80: #A1D0C8`, `90: #BCECE4`, `100: #FFFFFF`
- **Neutral (`#59605E`):** `0: #000000`, `10: #161D1B`, `20: #2B3230`, `30: #414846`, `40: #59605E`, `50: #717976`, `80: #C1C8C5`, `90: #DDE4E1`, `95: #EBF2EF`, `98: #F4FBF8`, `99: #F7FEFB`, `100: #FFFFFF`
- **Neutral Variant (`#56605E`):** `30: #3F4947`, `50: #6F7977`, `60: #899390`, `80: #BEC9C6`
- **Extra Surface Tones:** `4: #090F0E`, `6: #0E1513`, `17: #252B2A`, `87: #D5DBD9`, `92: #E3EAE7`, `94: #E9EFEC`, `96: #EEF5F2`

### Functional Colours
- **Error (Key `#E31313`):** Tone 10 `#410001`, Tone 20 `#690002`, Tone 30 `#930004`, Tone 40 `#C00008`, Tone 50 `#EA1B18`, Tone 100 `#FFFFFF` *(Note: Tones 60–99 were exported as `#FFFFFF` in Figma and logged in `docs/defects.md`)*
- **Warning (Key `#FFBF00`):** Tone 10 `#261A00`, Tone 40 `#795900`, Tone 80 `#FBBC00`, Tone 90 `#FFDFA0`, Tone 100 `#FFFFFF`
- **Success (Key `#16A34A`):** Tone 10 `#002109`, Tone 40 `#006E2D`, Tone 80 `#62DF7D`, Tone 90 `#7FFC97`, Tone 100 `#FFFFFF`

---

## 4. Semantic Colour Roles (Light Mode & Dark Mode)
A role describes the **job** an element performs, never its visual hue. *(Exact variable names preserved from Figma export in `docs/design-system/`.)*

| Role Name | Light Mode Primitive | Light Hex | Dark Mode Primitive | Dark Hex | Interface Job |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Primary` | `primary_40` | `#007B71` | `primary_80` | `#79D6CA` | Primary CTA button, brand title, active links |
| `On_primary` | `primary_100` | `#FFFFFF` | `primary_20` | `#003732` | Text & icons placed on `Primary` |
| `Primary_containr` | `primary_90` | `#96F3E6` | `primary_30` | `#005049` | Owner contact notice box, active order highlight |
| `On_primary_container` | `primary_30` | `#005049` | `primary_90` | `#96F3E6` | Text inside `Primary_containr` |
| `Secondary` | `secondary_40` | `#334B48` | `secondary_80` | `#96B1AC` | Secondary controls & subtle status indicators |
| `On_sceondary` | `secondary_100` | `#FFFFFF` | `secondary_20` | `#1E2322` | Text placed on `Secondary` |
| `Surface` | `Neutral_98` | `#F4FBF8` | `Neutral_10` | `#161D1B` | Main screen background canvas |
| `On_Surface` | `Neutral_10` | `#161D1B` | `Neutral_90` | `#DDE4E1` | Primary ledger values, headings, item counts |
| `On_Surface_variant` | `Neutral_Variant_30` | `#3F4947` | `Neutral_Variant_80` | `#BEC9C6` | Dates, staff names, secondary descriptions |
| `Surface_Container_Low` | `Extra_tone_96` | `#EEF5F2` | `Extra_tone_87` | `#D5DBD9` | Subtle grouped answer blocks |
| `Surface_Container` | `Extra_tone_94` | `#E9EFEC` | `Neutral_10` | `#161D1B` | Receipt cards & sync pill surface |
| `Surface_Container_High` | `Extra_tone_92` | `#E3EAE7` | `Extra_tone_17` | `#252B2A` | Featured status card elevation |
| `Surface_Container_Highest` | `Neutral_90` | `#DDE4E1` | `Neutral_20` | `#2B3230` | Nested high-emphasis container |
| `Surface_Container_Lowest` | `Neutral_20` *(defect)* | `#2B3230` | `Extra_tone_4` | `#090F0E` | **Defect logged:** Light Mode points to `Neutral_20`; should point to `Neutral_100` (`#FFFFFF`). Currently unused for light text. |
| `Outline` | `Neutral_Variant_50` | `#6F7977` | `Neutral_Variant_60` | `#899390` | Input field borders & active card edges |
| `Outline_variant` | `Neutral_Variant_80` | `#BEC9C6` | `Neutral_Variant_30` | `#3F4947` | Receipt ledger dashed dividers only |
| `Error` | `Error_40` | `#C00008` | `Error_80` *(defect)* | `#FFFFFF` | Validation error text & borders (Light Mode) |
| `On_Error` | `Error_100` | `#FFFFFF` | `Error_20` | `#690002` | Text on error buttons |
| `Error_Container` | `Error_90` *(defect)* | `#FFFFFF` | `Error_30` | `#930004` | Error callout container background |
| `On_Error_container` | `Error_30` | `#930004` | `Error_90` *(defect)* | `#FFFFFF` | Text inside error callout container |
| `Success` *(functional)* | `Success_40` | `#006E2D` | `Success_80` | `#62DF7D` | "Ready for pickup" / confirmed transfer |
| `On_Success` *(functional)* | `Success_100` | `#FFFFFF` | `Success_20` | `#003914` | Text on success badges |
| `Success_Container` *(functional)* | `Success_90` | `#7FFC97` | `Success_30` | `#005320` | Soft "Ready for Pickup" badge surface |
| `On_Success_Container` *(functional)* | `Success_10` | `#002109` | `Success_90` | `#7FFC97` | Text inside soft pickup badge |
| `Warning` *(functional)* | `Warning_40` | `#795900` | `Warning_80` | `#FBBC00` | Pending payment / delay notice |
| `On_Warning` *(functional)* | `Warning_100` | `#FFFFFF` | `Warning_20` | `#402D00` | Text on warning badges |

---

## 5. Contrast Ratio Audit (WCAG 2.1 Compliance)

All ratios computed via W3C relative luminance ($L = 0.2126 R + 0.7152 G + 0.0722 B$):

| Role Pair (Foreground on Background) | Hex Pair | Contrast Ratio | WCAG AA ($\ge 4.5:1$) | Status & Usage Constraint |
| :--- | :--- | :--- | :--- | :--- |
| `On_Surface` on `Surface` (Light) | `#161D1B` / `#F4FBF8` | **16.32 : 1** | PASS (AAA) | Primary receipt headings and item counts |
| `On_Surface` on `Surface_Container_Low` (Light) | `#161D1B` / `#EEF5F2` | **15.48 : 1** | PASS (AAA) | Elevated card text |
| `On_Surface` on `Surface_Container` (Light) | `#161D1B` / `#E9EFEC` | **14.70 : 1** | PASS (AAA) | Q&A record blocks |
| `On_Surface` on `Surface_Container_High` (Light) | `#161D1B` / `#E3EAE7` | **14.02 : 1** | PASS (AAA) | Featured status card |
| `On_Surface_variant` on `Surface` (Light) | `#3F4947` / `#F4FBF8` | **8.87 : 1** | PASS (AAA) | Dates, staff attribution, captions |
| `On_Surface_variant` on `Surface_Container` (Light) | `#3F4947` / `#E9EFEC` | **7.99 : 1** | PASS (AAA) | Secondary prose inside cards |
| `On_primary` on `Primary` (Light) | `#FFFFFF` / `#007B71` | **5.16 : 1** | PASS (AA) | Primary action button text |
| `Primary` on `Surface` (Light) | `#007B71` / `#F4FBF8` | **4.91 : 1** | PASS (AA) | Brand title and clickable links |
| `On_primary_container` on `Primary_containr` (Light) | `#005049` / `#96F3E6` | **7.25 : 1** | PASS (AAA) | Owner contact notice box |
| `On_Error` on `Error` (Light) | `#FFFFFF` / `#C00008` | **6.47 : 1** | PASS (AA) | Critical validation button text |
| `On_Error_container` on `Error_Container` (Light) | `#930004` / `#FFFFFF` | **9.37 : 1** | PASS (AAA) | Inline error callout text *(container bg tint defective `#FFFFFF`)* |
| `On_Success` on `Success` (Light) | `#FFFFFF` / `#006E2D` | **6.43 : 1** | PASS (AA) | Confirmed status button |
| `On_Success_Container` on `Success_Container` (Light) | `#002109` / `#7FFC97` | **13.32 : 1** | PASS (AAA) | "Ready for Pickup" status pill |
| `On_Warning` on `Warning` (Light) | `#FFFFFF` / `#795900` | **6.48 : 1** | PASS (AA) | Delay alert badge |
| `On_Surface` on `Surface` (Dark) | `#DDE4E1` / `#161D1B` | **13.27 : 1** | PASS (AAA) | Dark mode body & headline text |
| `On_primary` on `Primary` (Dark) | `#003732` / `#79D6CA` | **7.71 : 1** | PASS (AAA) | Dark mode primary buttons |
| `Outline` on `Surface` (Light) | `#6F7977` / `#F4FBF8` | **4.28 : 1** | FAIL text / **PASS UI ($\ge 3:1$)** | **Not used for text.** Restricted strictly to interactive input borders & featured card edges (passes WCAG 2.1 1.4.11 Non-text Contrast). |
| `Outline_variant` on `Surface` (Light) | `#BEC9C6` / `#F4FBF8` | **1.62 : 1** | FAIL | **Not used for text or interactive borders.** Restricted strictly to decorative dashed dividers inside receipt rows (`ledger-row`). |
| `On_Surface` on `Surface_Container_Lowest` (Light) | `#161D1B` / `#2B3230` | **1.31 : 1** | FAIL | **Broken Figma mapping (Defect #1).** Light mode `Surface_Container_Lowest` points to `Neutral_20` instead of `Neutral_100`; documented as forbidden for text until fixed. |

