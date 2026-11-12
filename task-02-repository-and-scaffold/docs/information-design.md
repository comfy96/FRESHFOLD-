# Information Design: Head & Body

*(Implemented entirely on branch `feat/information-design`; evidence in `16-head-route-one.png` through `20-responsive-three-widths.png`.)*

---

## 1. The `<head>` (Configuration)
1. **Dynamic Page Title (`src/app/layout.tsx:5-8`):** Configured Next.js `title.template: '%s — Fresh Fold Laundry'`. Navigating from `/` (`Fresh Fold Laundry — Clear Order & Payment Records`, `16-head-route-one.png`) to `/orders` (`Shop Records — Fresh Fold Laundry`, `17-head-route-two.png`) updates the document title dynamically.
2. **Tagline Under Ten Words (`src/app/layout.tsx:9`):** `"Calm, dated laundry counts and shop payment records."` (**7 words**).
3. **Marketing-Only SEO Tags (`src/app/page.tsx:8-15` vs `orders/page.tsx:12-15`):** Added `keywords` and `robots: { index: true, follow: true }` exclusively to `/` (the public landing page), while `/orders` and `/pickup` explicitly emit `robots: { index: false, follow: false }` so customer records are never crawled by search engines.
4. **Custom Favicon (`src/app/icon.svg`):** Hand-authored a crisp `64×64` folded-garment `F` monogram using our primary `#007B71` teal and `#96F3E6` fold corner.
5. **Open Graph Preview Tags (`src/app/layout.tsx:10-22`, `public/og-freshfold.svg`):** Configured `og:title`, `og:description`, `og:type`, `og:site_name`, and a `1200×630` SVG preview card so shared links render a clear ledger summary rather than a bare URL.

---

## 2. The Body (Applied to `/` in `src/app/page.tsx` & `page.module.css`)
1. **What Was Removed & Why:** Removed the redundant `"Fresh Fold Laundry"` text string beside the folded-`F` logo link inside `<header>` (`src/app/page.tsx:28-44`). Having both an emblem logo and plain label text side-by-side created duplicate visual targets and invited confusion about which element links home.
2. **Collapsed User Choice (Growth Reasoning):** Instead of forcing a new visitor to choose upfront between two competing primary buttons (`Check order` vs `Book pickup` or `Login` vs `Signup`), we collapsed the primary action into **one** clear button (`Check my order record` $\rightarrow$ `/orders`), tucking `"Need a pickup or drop-off? Record it here"` as a quiet underlined secondary link underneath. Amaka's trigger is anxiety about existing clothes; prioritizing record lookup eliminates decision friction and increases first-visit completion.
3. **Intentional Heading Max-Width (`src/app/page.module.css:43-53`, `18` vs `19`):** Set `max-width: 12ch` on `.heroHeadline` (`"Our records show every garment counted"`). Without a width cap (`18-heading-wrap-bad.png`), fixed `57px` text overflows right past a `320px` screen edge; with `max-width: 12ch`, the headline forms a deliberate 4-line stacked rhythm that draws the eye straight toward the primary button (`19-heading-wrap-good.png`).
4. **Button Padding in `rem` & Radius Rationale (`src/app/page.module.css:73-76`):** Sized `.primaryBtn` with `padding: 0.75rem 1.25rem` (`12px` vertical, `20px` horizontal at `16px` root) and `border-radius: 0.5rem` (`8px`) instead of fixed pixel width/height. `rem` padding ensures the button expands gracefully if the user bumps Android OS font size for accessibility, while `0.5rem` softening avoids harsh sharp edges without looking like a playful pill badge.
5. **Label Style Verification (`src/app/page.module.css:78-82`):** Directly verified `.primaryBtn` applies all five Task 01 `--type-label-large-*` tokens (`Plus Jakarta Sans`, `600`, `14px`, `20px` line-height, `0.1px` letter-spacing) with zero raw values.

---

## 3. Interaction & Responsiveness
- **Pointer & Hover Feedback:** Every interactive link and button (`logoLink`, `primaryBtn`, `secondaryLink`, `brandLink`) explicitly sets `cursor: pointer`, subtle `:hover` opacity/shadow shifts, and `0.125rem` `:focus-visible` outlines. The SVG logo links directly to `/`.
- **Fluid `clamp()` Sizing (`src/app/page.module.css:47`, `20-responsive-three-widths.png`):** Replaced static `57px` with `font-size: clamp(2rem, 7.5vw, 3.5625rem)` (scaling smoothly from `32px` on `320px` phones up to our `57px` Display Large ceiling on desktop) and verified zero overflow at `320px`, `768px`, and `1280px`.

