# 04 — Signature Techniques

Five techniques give this style its look. Use 2–3 per site, not all five everywhere.

---

## 1. Halftone tech overlay (Contra signature)

Modern objects (laptop, phone, tablet) are drawn as **black-and-white dot halftone**, so they look printed or stamped onto the oil painting. The halftone stays clearly modern and graphic while sitting naturally inside the painted scene.

**Specs**
- Dot pitch: 4–7px at 1×, round dots
- Colours: black dots `#111` on white highlights, or white dots on a dark object
- Keep a sparkle/logo mark on the lid as a solid white shape (Contra uses a 4-point star)
- The halftone edge is crisp and follows the object's perspective

**Figma method**
1. Draw or trace the laptop as a vector shape in perspective.
2. Fill it with an image of a grayscale gradient or a photo of a laptop.
3. Run a halftone plugin ("Halftone", "Dither", "Pixelify"). Alternatively, fill it with a dot pattern (an image fill of a dot tile, set to Tile) and mask with the shape.
4. Place it above the painting with Normal blend. Add a soft contact shadow under it (black at 15%, blur 20).

**Photoshop method:** Filter → Pixelate → Color Halftone (radius 6, all channels 45°), then Image → Mode → Grayscale and Threshold.

**CSS method** (see `assets/halftone.css`):
```css
.halftone {
  background: #111;
  -webkit-mask-image: radial-gradient(circle at center, #000 38%, transparent 42%);
  -webkit-mask-size: 6px 6px;
  mask-image: radial-gradient(circle at center, #000 38%, transparent 42%);
  mask-size: 6px 6px;
}
```
To give the halftone tonal depth, layer two masks or use an SVG `<pattern>` with dot radius driven by a gradient.

**Dot cloud transition:** Contra also scatters halftone dot clusters (light teal/grey squares of 6–8px) around the hero subject, fading into the paper. Build these with a dot-grid SVG that has a radial mask.

---

## 2. Data-text texture (Aureon signature)

A faint layer of monospace "system text" behind the hero suggests infrastructure without showing UI.

**Content:** fake but believable tokens, e.g. `SETTLEMENT_STATUS: COMPLETE`, `TXN_ID 0x8F2C...`, `API_RESPONSE 200 OK`, `LATENCY 12ms`, `LEDGER_SYNC`, `FX_RATE USD/EUR 0.9213`, `ENCRYPTION AES-256`, `NODE: FRA-02`. For AI products use `EVAL_RUN`, `PREF_SCORE 0.82`, `TOKENS 4,096`.

**Specs**
- Font: mono, 9–11px, uppercase, tracking +0.06em
- Colour: ink at **5–8% opacity**; occasionally highlight one word ("COMPLETE") at 20%
- Layout: dense rows with random spacing that fill the hero, masked by a radial gradient so they fade at the edges
- Never let it compete with the headline. If you notice it at first glance, it is too strong.

**Implementation:** generate about 60 lines in JS, or bake them into an SVG background. See `DataTexture.tsx`.

---

## 3. Paper and dot grid

The off-white background is never flat. Use one of:
- **Dot grid:** 1px dots, 24px pitch, ink at 4–6% opacity
- **Noise/grain:** an SVG feTurbulence at 3–4% opacity
- **Paper fibre:** a subtle scanned paper texture at 5% (warm variant)

```css
.paper-dots {
  background-color: var(--bg);
  background-image: radial-gradient(rgba(43,43,41,.06) 1px, transparent 1px);
  background-size: 24px 24px;
}
```

---

## 4. Cut-out collage

Cut-out painted elements (hands, drapery, columns, coins, busts) sit on the clean background and break the grid.

**Rules**
- Elements **enter from the frame edge** (a hand from the right, drapery from the bottom).
- They may **overlap section boundaries** by 40–120px for depth (use `z-index` and negative margins).
- Add a **soft contact shadow** only where an object touches a surface (coin on a column).
- At most one large cut-out per viewport, plus small floating items (coins).
- Floating items get slightly different rotations (−20° to +25°) and sizes (60–140px) and float slowly.

---

## 5. Painting + floating UI card

A full-bleed painting is the card background, and a small **dark product widget** floats on it.

**Specs**
- Card radius 12–16px; image `object-fit: cover`
- Widget: background `#111214` at 92–96%, radius 10–12px, 1px border `rgba(255,255,255,.08)`, shadow `0 30px 60px -20px rgba(0,0,0,.5)`
- Widget content: ONE idea (currency list, price ticker, balance). Mono for figures, grotesk for labels; use green `#3FB950` / red `#F85149` sparingly for deltas.
- Caption bottom-left in serif, white, 20–28px, with a mono eyebrow above it at 60% opacity
- Add a bottom gradient `linear-gradient(to top, rgba(0,0,0,.45), transparent 45%)` so the caption is readable

---

## 6. Huge-word typography (Contra extra)

Contra sets single words ("The", "Network") at **~300–600px** in the display serif as a scroll-driven background element, scaled and translated as the section passes. Use it once per site at most, for the manifesto moment.

---

## 7. Paint-chip strip (Contra extra)

The testimonial is decorated with vertical bands in muted colours (charcoal `#2B2B29`, mauve `#918989`, sand `#C8BCAE`, olive `#918F66`, mint `#C8E1DD`), stacked like paint samples, with the quote card as the last, widest chip. Animate the bands sliding in one after another.
