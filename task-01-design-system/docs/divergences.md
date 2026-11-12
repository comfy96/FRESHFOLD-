# Typography Divergences from Baseline

The Material Design 3 baseline specifies default typography values calibrated for `Roboto` on general-purpose mobile apps. While designing Fresh Fold Laundry in Figma (`03-spacing-default.png`, `04-spacing-chosen.png`), we intentionally diverged from the documented defaults in two places to match Amaka Obi's low-cost Android hardware and calm receipt-book context.

---

## Divergence 1: Display Large Typeface, Weight, and Line-Height Multiplier

### The Documented Baseline Default
- **Font Family:** `Roboto`
- **Weight:** Regular (`400`)
- **Size / Line Height:** `57px / 64px` ($1.12\times$)

### Our Chosen Token
- **Font Family:** `Plus Jakarta Sans`
- **Weight:** Bold (`700`)
- **Size / Line Height:** `57px / 80px` ($1.40\times$)

### Why We Diverged
Amaka Obi checks her laundry records on an entry-level Android phone with a dimmer LCD panel and small data bundle. `Roboto 400` at `57px` looks thin, generic, and indistinct in daylight glare, while Material's tight `64px` ($1.12\times$) line height leaves almost zero vertical cushion if a headline wraps onto two lines on a narrow `360px` phone width.

Switching to `Plus Jakarta Sans` Bold (`700`) introduces wide, open apertures and solid geometric strokes that communicate ledger reliability immediately. Raising the line height to `80px` ($1.40\times$ formula, visible in Figma `04-spacing-chosen.png` as `Display Large · 57/80`) guarantees ascenders and descenders never touch across wrapped lines.

### Where This Choice Fails (The Trade-Off)
This choice would be **wrong** for an editorial publishing site, legal knowledge base, or dense financial reporting console where users scan dozens of multi-word headings down a long page.

At weight `700` and `80px` vertical rhythm, `Plus Jakarta Sans` carries heavy typographic mass and consumes considerable vertical space. Used repeatedly across long-form articles, it pushes body content off-screen, feels overly promotional rather than neutral, and visually exhausts readers.

---

## Divergence 2: Display Letter Spacing (`-0.25px` vs `0px`), Body Tracking, and Button Label Weight

### The Documented Baseline Defaults
- **Figma `Plus Jakarta Sans` Default Tracking:** `0px` (`03-spacing-default.png`)
- **Material `Body Large` Tracking:** `+0.50px`
- **Material `Label Large` Weight:** Medium (`500`)

### Our Chosen Tokens
- **`Display Large` Letter Spacing:** `-0.25px` (`04-spacing-chosen.png`)
- **`Body Large` Letter Spacing:** `+0.25px`
- **`Label Large` Weight:** SemiBold (`600`)

### Why We Diverged
Because `Plus Jakarta Sans` is wider horizontally than `Roboto`, leaving `Display Large` at Figma's `0px` default (`373px` box width in `03-spacing-default.png`) or keeping `Body Large` at `+0.50px` spreads words out needlessly, wasting horizontal pixels inside narrow mobile receipt cards and increasing line wraps. Tightening `Display Large` to `-0.25px` (`370px` box width in `04-spacing-chosen.png`) and `Body Large` to `+0.25px` improves word-shape scannability without colliding glyphs. Simultaneously, bumping `Label Large` from `500` to `600 SemiBold` bolsters legibility for white button text sitting over `#007B71` Teal (`5.16 : 1` AA contrast).

### Where This Choice Fails (The Trade-Off)
This choice would be **the wrong decision** for applications prioritizing low-vision magnification, dyslexia-friendly reading modes, or older low-DPI (`1x`) desktop monitors.

Tightening letter spacing (`-0.25px` on display, `+0.25px` on body) shrinks inter-letter whitespace. For users with visual crowding sensitivity or dyslexia, closer sidebearings cause adjacent character stems (such as `r` + `n` resembling `m`) to blur together, slowing reading speed. Likewise, `600 SemiBold` on small labels (`14px`) can slightly bloom on subpixel-rendered budget screens in dark mode.

