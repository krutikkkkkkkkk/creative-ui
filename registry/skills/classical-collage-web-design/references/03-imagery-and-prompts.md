# 03 — Imagery: Sourcing, AI Prompts and Grading

## 1. Legal sourcing (always first)

**Allowed:**
- **Public-domain museum collections (CC0):** Metropolitan Museum Open Access, Rijksmuseum (Rijksstudio), Art Institute of Chicago, National Gallery of Art (Washington), Smithsonian Open Access, Paris Musées, Statens Museum for Kunst, Cleveland Museum of Art, Wikimedia Commons (check that each file is PD).
- **Original AI-generated images** made from your own prompts with a tool whose licence allows commercial use (Midjourney paid plans, Adobe Firefly, Flux Pro, Ideogram, Google Imagen, OpenAI image generation, etc.).
- **Your own photos of statues/architecture** (check museum photo policies).

**Not allowed:**
- Images taken from contralabs.com, the Aureon shot or any other reference site
- Prompts naming living artists ("in the style of [living artist]")
- Recognisable copyrighted characters, logos or modern artworks
- Photos of real people composited into paintings without consent

Keep a `CREDITS.md` with each asset's source, ID, licence and any edits.

---

## 2. AI prompt system

### Base prompt structure

```
[SUBJECT + ACTION], [MODERN OBJECT if any],
[PERIOD STYLE], [MEDIUM + TEXTURE],
[LIGHTING], [PALETTE], [COMPOSITION + CROP], [BACKGROUND],
[QUALITY TAGS]
```

### Style blocks (copy as is)

**Period style**
- `19th-century academic oil painting, neoclassical`
- `Italian Renaissance portrait, tempera and oil`
- `Baroque oil painting, dramatic chiaroscuro`
- `Dutch Golden Age still life painting`
- `Pompeii fresco, aged plaster`

**Medium + texture**
- `visible brushwork, fine canvas texture, subtle craquelure, museum quality`

**Lighting**
- Warm: `soft golden-hour light from the left, gentle shadows`
- Cool: `soft north-window light, deep shadows, rich highlights`

**Palette**
- Warm: `palette of ochre, terracotta, sienna, cream marble and antique gold`
- Cool: `deep teal background, rich vermilion red, gold leaf, ivory skin tones`

**Background for cut-outs:** `isolated on plain light grey background` or `plain flat teal background`

**Quality / negative:** `no text, no watermark, no frame, no modern clothing, anatomically correct hands`

### Modern object handling

AI tends to paint the laptop in oil style. Two approaches:
1. **Generate with the object**, then replace it in Figma/Photoshop with a halftone or crisp UI version (best result).
2. **Generate without the object**, with the pose set up for it ("hands resting as if typing on a laptop on her lap"), then composite the object yourself.

### Ready prompts — warm variant

1. **Hero coins:** `Carved stone gold coin with an embossed dollar sign, aged gold and marble texture, slight chips on the edge, 3D render, soft studio light, isolated on light grey background, no text` (generate 6–8 at different angles)
2. **Keystone:** `Close-up of an elegant hand in a red draped sleeve placing a gold coin at the top of a ruined stone arch, neoclassical oil painting, warm golden light, ochre and sienna palette, ruins of sandstone blocks, plain light background, visible brushwork`
3. **Scholar with laptop:** `Young Roman man with a gold laurel crown seen from behind over his shoulder, wearing a draped terracotta and grey toga, sitting and looking down at a laptop on his lap, 19th-century academic oil painting, warm light, plain light background`
4. **Column pedestal:** `Single Ionic marble column capital used as a pedestal, weathered marble, soft shadow, isolated on light grey, photorealistic sculpture photo`
5. **Harbour card bg:** `Calm classical Mediterranean harbour at dusk with temples on the shore and sailing ships, Claude Lorrain-style landscape oil painting, hazy golden light, lots of calm sky on the left`
6. **Ruins card bg:** `Ancient temple ruins at sunrise with tall cypress trees, warm hazy light, classical landscape oil painting, calm area in the centre`
7. **Two hands exchange:** `Two hands reaching toward each other from left and right, each holding a modern smartphone, draped classical sleeves in blue and red, neoclassical oil painting, plain light background, wide composition`
8. **Key:** `Ornate antique gold key with a laurel pattern, Baroque oil still life, isolated on cream background`

### Ready prompts — cool variant

1. **Hero figure:** `Woman in a flowing ivory silk gown reclining, hands resting on a laptop on her lap, blonde hair in a classical updo, 19th-century academic oil painting, soft light, cream and pearl tones, plain light background, cropped at the shoulder on the right`
2. **Helmets:** `Two ornate gold and green Renaissance knights' helmets facing each other in profile, Baroque oil painting, deep teal background, gold leaf highlights`
3. **Scales:** `Ornate golden balance scales with a dark green liquid in one pan, oil painting, deep teal background, cropped close`
4. **Crowd:** `Dense crowd of figures in colourful headscarves and robes, red, ivory, teal and ochre, seen from behind facing a neoclassical building, 19th-century oil painting, teal sky`
5. **Microscope:** `Young scholar with curly hair looking into a brass microscope, white shirt, Baroque oil painting, deep teal background, chiaroscuro`
6. **Crowd with phones:** `Group of young Renaissance women and men with gold hair ribbons in red, blue and sage robes looking down at smartphones, academic oil painting, deep blue background`
7. **Studio still life:** `Scholar's shelf with old leather books, a white marble bust, a brush jar, an open book and a closed laptop, teal velvet curtains, Dutch Golden Age still life painting`
8. **Small thumbnails:** generate a series of 8–12 single figures (reading, typing, sitting on a ledge, holding a phone) on flat teal or blue backgrounds, portrait 3:4.

---

## 3. Cut-out and clean-up

1. Remove the background (Figma "Remove background", Photoshop Select Subject, or remove.bg).
2. Refine the edges: 0.5–1px feather and no halo. Painted edges can stay slightly soft.
3. Fix hands and fingers (the most common AI flaw). Use inpainting or crop the hands out.
4. Remove stray text or signatures.
5. Export the master at 2× size.

---

## 4. Colour grading (makes the collage feel like one world)

### Warm grade (Lightroom / Photoshop / Figma)
- White balance: +8 to +15 warmth
- Highlights: tint toward `#F3E6CC`; shadows toward `#3B2A1C`
- Saturation −10, vibrance +5
- Gentle S-curve and lifted blacks (output black ≈ 18)
- Optional grain 4–6%

### Cool grade
- Keep skin and reds saturated, and pull the backgrounds to teal `#387478`
- Shadows toward `#12302F`, highlights neutral-cream `#F5EFE2`
- HSL: aqua/blue hue −5 and saturation −10, red saturation +5
- Grain 3–5%

### Figma-only grade
Place a solid layer above the image:
- Warm: `#C89B5A` at 12–18%, blend **Color** or **Soft light**
- Cool: `#2F6B6B` at 10–15%, blend **Color** (mask the skin if needed)

---

## 5. Export specs

| Use | Desktop size | Mobile crop | Format | Target weight |
|---|---|---|---|---|
| Hero artwork | 2400px wide | 4:5 | AVIF + WebP fallback | ≤ 250 KB |
| Feature card | 1920×1080 | 4:5 (1080×1350) | AVIF/WebP | ≤ 180 KB |
| Thumbnail | 600×800 | same | WebP | ≤ 50 KB |
| Cut-out object (coin, hand) | 1200px | same | WebP with alpha / PNG | ≤ 120 KB |
| Texture tiles | 256×256 | same | PNG/SVG | ≤ 10 KB |

Always provide `alt` text that describes the scene *and* the metaphor ("Golden balance scales — evaluation").
