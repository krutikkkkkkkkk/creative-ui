# 04 — Prompt Library

Image models are for **exploring** directions. Every prompt follows these rules:
- flat vector style, **solid black on pure white**, no gradients, shadows, 3D, texture or mockups
- **no text** in symbol prompts (set wordmarks in real type later)
- centred, generous margin, square
- describe forms, never brands or living designers

## 1. Concept sheet (divergent, 9 explorations)
```
A designer's logo exploration sheet: a 3×3 grid of nine different flat black vector logo symbols
on a pure white background, evenly spaced, no labels or text.
All nine explore one idea for "{NAME}", a {CATEGORY}: {CONCEPT}.
Vary the construction across the grid: geometric, monoline, bold silhouette, negative space,
rounded, angular, symmetrical, minimal, modular.
Style: clean professional logo design, solid shapes, crisp edges, no gradients, no shadows, no 3D,
no texture, no mockup. Mood: {ADJ1}, {ADJ2}, {ADJ3}.
```

## 2. Single mark (convergent)
```
A single flat vector logo symbol for "{NAME}", a {CATEGORY}.
Concept: {CONCEPT, described as shapes}.
Construction: {geometric / monoline with uniform stroke / bold silhouette / negative space reveal},
balanced optical weight, simple enough to draw from memory, readable at 16 pixels.
Solid black shape on pure white, centred with generous margin, square format.
No text, no gradients, no shadows, no 3D, no texture, no mockup. Mood: {ADJ1}, {ADJ2}, {ADJ3}.
```

## 3. Wordmark exploration (only with text-capable models, e.g. gpt-image, Ideogram)
```
A wordmark logo reading exactly "{NAME}" in {lowercase / uppercase / title case},
{serif / sans-serif / geometric sans / humanist / slab} letterforms with one custom detail:
{DETAIL, e.g. the 'a' tail extends into a thread}. Even letter spacing, solid black on white,
centred, no symbol, no tagline, no gradients, no mockup.
```
Then rebuild the wordmark in a licensed typeface. Treat AI letterforms as sketches only.

## 4. Emblem / badge
```
A flat vector emblem logo for "{NAME}" ({CATEGORY}): {SHAPE, e.g. circular seal} containing {SYMBOL}.
Thick consistent outlines, limited detail, works as a stamp and embroidery,
solid black on white, no text, no gradients, no mockup.
```

## 5. Mascot simplification
```
A minimal flat vector character mark of {CHARACTER} for "{NAME}", built from simple geometric shapes,
bold silhouette readable as a small app icon, solid black on white, no text, no gradients, no shading.
```

## 6. Iteration prompts (keep / change)
```
Keep: {what works — e.g. the tapered thread end and the S rhythm}.
Change: {e.g. make the stroke uniform at ~8% of the mark width, remove the inner loop,
tighten to a square bounding box, increase negative space in the counter}.
Same style rules: flat solid black on white, no text, no gradients.
```
```
Simplify this concept further: remove every detail that is not needed to recognise {IDEA},
keep the silhouette identical, thicken thin parts so it reads at 16 pixels.
```

## 7. Context test (after a direction is chosen, for presentation only)
```
A realistic mockup of a flat black logo symbol {DESCRIBE MARK} applied as {embossed on kraft paper bag /
embroidered on a canvas cap / app icon on a phone home screen / engraved on brass}, soft natural light.
```

## Tool syntax notes
| Tool | Notes |
|---|---|
| Figma AI (`generate_image`) | Use `gpt-image-*` when letters must render; Gemini models are fine for symbols. Uses Figma AI credits. Results land on canvas next to the vector work. |
| ChatGPT / OpenAI images | Paste prompts as-is. Ask for "transparent background" if needed. |
| Midjourney | Append `--ar 1:1 --style raw --no gradient, shadow, text, 3d, mockup`. Use `--chaos 20–40` for concept sheets. |
| Ideogram | Best for wordmark explorations. Pick the "Design" style. |
| Adobe Firefly | Choose "Graphic" content type and turn off visual intensity extras. |

## Negative / avoid list (append when a model drifts)
`photorealistic, gradient, shadow, glow, 3d render, bevel, texture, mockup, extra text, watermark, signature, frame, multiple colours`
