# 10 — Build in Figma

## File structure

```
📄 Cover
📄 01 Moodboard          ← references, palette swatches, art direction briefs
📄 02 Art                ← raw sources, cut-outs, graded masters, halftone objects
📄 03 Foundations        ← colour styles/variables, text styles, grid, effects
📄 04 Components         ← buttons, nav, cards, widgets, stats, chips, footer
📄 05 Desktop (1440)
📄 06 Tablet (810)
📄 07 Mobile (390)
📄 08 Prototype / Motion notes
📄 09 Export
```

## Variables
- Collection **Color** with modes `Warm` and `Cool`: bg, surface, ink, ink-muted, ink-25, accent, section-tint-1/2/3, ui-dark, positive, negative.
- Collection **Space**: 4, 8, 12, 16, 24, 32, 48, 64, 96, 160, 240.
- Collection **Radius**: sm 6, md 12, lg 16, pill 999.
Switching mode on the page frame re-themes everything (UI only; the art must be re-graded separately).

## Text styles
`Display/XL 96`, `Display/L 64`, `Display/M 44`, `Display/Stat 112`, `Quote/48`, `Lead/22`, `Body/16`, `Small/14`, `Label/12 caps`, `Mono/11 caps`, `Button/16` with the measured tracking from `05-design-tokens.md` (Figma tracking in %: −4% display, −5% card titles, +6% labels).

## Effect styles
`Float` (drop shadow 0/30/60/−20, black 45%), `Contact` (0/12/24/−12, ink 35%), `Panel`.

## Layout grids
Desktop: 12 col, 64 margin, 24 gutter. Mobile: 4 col, 20 margin, 16 gutter. 8px baseline (soft).

## Art layer recipe (per image)
```
▾ Card / Benchmarking
   ▸ Caption (auto layout)
   ▸ Scrim  (linear gradient, black 45% → 0)
   ▸ Grade  (solid #2F6B6B 12%, blend Color)
   ▸ Halftone object (optional)
   ▸ Painting (image fill, crop)
   ▸ Background (teal + dot pattern)
```
Use **Figma's "Remove background"** for cut-outs, and **"Edit with prompt" / Make image** for AI variations where available (as seen in the Aureon build video).

## Component tips
- Buttons: auto layout, `hug`, a variant property for `primary / secondary / small / on-dark`, and a `state` property.
- Feature card: an instance-swap property for the image, text properties for eyebrow and title, and a boolean for the widget.
- Widgets: build them as real auto-layout UI (not screenshots) so they stay crisp.

## Prototype
Smart Animate for card stacking (use the "After delay" + scroll-position trick or Figma's scroll animations), plus a "Motion notes" page with timings from `08-motion.md` for the developer.

## Export
Images: 2× WebP/PNG from the graded master frame. Cut-outs: PNG with alpha. Icons and the logo: SVG. Name files `section-metaphor-variant@2x.webp` (e.g. `feature-scales-cool@2x.webp`).
