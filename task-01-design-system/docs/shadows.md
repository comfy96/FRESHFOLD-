# Shadow System: Brand-Tinted Elevation Tokens

All three Fresh Fold Laundry elevation tokens are derived from our primary brand colour rather than achromatic black (`rgba(0, 0, 0, ...)`).

*(Note on current Figma export: `evidence/06-tokens-complete.json` currently exports only `soft shadow` with a stale `#c2410c1f` tint left over from an earlier `#C2410C` colour exploration, and omits `medium` and `hard` shadows. That discrepancy is logged transparently in `docs/defects.md` and mapped cleanly to our `#007B71` primary teal `rgb(0, 123, 113)` in CSS compilation.)*

---

## 1. The Three Elevation Levels (`#007B71` / `rgb(0, 123, 113)`)

| Shadow Token | X Offset | Y Offset | Blur | Spread | Opacity | CSS Value | Interface Job |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`--shadow-soft`** | `0px` | `4px` | `2px` | `-2px` | `0.12` (`12%`) | `0px 4px 2px -2px rgba(0, 123, 113, 0.12)` | Resting ledger receipt cards, Q&A containers |
| **`--shadow-medium`** | `0px` | `8px` | `24px` | `-4px` | `0.20` (`20%`) | `0px 8px 24px -4px rgba(0, 123, 113, 0.20)` | Featured active order status card ("14 items ready") |
| **`--shadow-hard`** | `0px` | `16px` | `32px` | `0px` | `0.28` (`28%`) | `0px 16px 32px 0px rgba(0, 123, 113, 0.28)` | Shop owner dispute contact modal, offline confirmation banner |

---

## 2. Why a Shadow Built from the Brand Colour Reads Differently

A shadow built from pure black (`#000000`) desaturates surrounding neutral surfaces into a flat, muddy gray smudge that makes elevated cards feel like pasted cut-outs floating over dead air. 

A shadow tinted with our `#007B71` primary teal mimics natural ambient bounce light reflecting off clean linen and tinted ledger paper, keeping the card hierarchy calm, cohesive, and optically anchored to the Fresh Fold surface palette.

