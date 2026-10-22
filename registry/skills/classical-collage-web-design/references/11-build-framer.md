# 11 — Build in Framer

contralabs.com is built in Framer, so everything in this style is achievable there without code.

## Project setup
1. **Fonts:** Site Settings → Fonts → add Source Serif 4 (Google) and Inter (or upload licensed GT Standard / Sectra). Add JetBrains Mono.
2. **Color styles:** create `bg`, `ink`, `ink/70`, `ink/25`, `accent`, `teal`, `sage`, `mint`, `umber` (cool) or the warm set. Name them exactly as the tokens.
3. **Text styles:** create the scale from `05-design-tokens.md` with **breakpoint overrides** (Desktop 1440 / Tablet 810 / Phone 390). Use `em` letter-spacing (−0.04em).
4. **Breakpoints:** Desktop 1440, Tablet 810, Phone 390. Contra uses 809/810 as the tablet switch.

## Key build recipes

### Sticky stacking feature cards
- Parent stack: vertical, gap 24.
- Each card: Position **Sticky**, top = 96 + index × 16.
- Add a **Scroll Transform** on each card: as the next card enters, Scale 1 → 0.96, Opacity 1 → 0.85.

### Scroll story (sequential lines + drifting thumbnails)
- Section height 350vh; inner frame Sticky top 0, height 100vh.
- Each line: **Scroll Transform** keyed to the section, with opacity 0 → 1 → 0.2 and Y 40 → 0 → −40, offset per line.
- Thumbnails: absolute-positioned images with Scroll Transform Y over different ranges (−200 → 200, −80 → 120, etc.).

### Floating coins
Each coin is an image with a **Loop effect** (Y 0 → −8, rotate 0 → 3°, 5–7s, mirror, ease-in-out) and a different delay. Add **Mouse parallax** via a small code override or Framer's "Follow cursor" with low intensity.

### Halftone
Export the halftone laptop from Figma as PNG/SVG. For live halftone, use a Code Component that applies the CSS mask from `assets/halftone.css`.

### Data-text texture
Use a text layer (mono, 10px, 6% opacity) filled with generated lines, absolutely positioned behind the hero, with a radial gradient mask (Framer: Mask → gradient).

### Button label roll
A component with two variants: Default and Hover. Inside, a clipped stack holds the label twice; Hover moves the stack Y −24. Transition 0.3s ease-out.

### Nav background on scroll
A sticky nav with a **Scroll Variant**: when the page scrolls past 80px, switch to the variant with bg `bg/90` and backdrop blur 12.

### Appear effects
Text: **Appear → Y 20, Opacity 0, 0.7s, ease [0.22, 1, 0.36, 1], delay 0.1 × line**. Images: Scale 1.06 → 1, 1.2s.

## CMS (for templates)
Collections: **Features** (title, eyebrow, description, image, link), **Testimonials**, **Case Studies**, **Blog**. Feature cards map to the CMS so buyers can swap content.

## Packaging as a paid Framer template
- Include both colour-mode variants as separate pages or a remix note.
- Ship with original, licence-clean artwork, and include `CREDITS` in the template description.
- Pages: Home, About, Pricing, Blog, Blog post, Contact, 404, plus a "Style guide" page showing tokens and components.
- Name layers and components clearly; buyers judge templates by layer hygiene.
- Thumbnail and marketplace screenshots: the hero, the stacked cards and the testimonial chip strip are the money shots.
