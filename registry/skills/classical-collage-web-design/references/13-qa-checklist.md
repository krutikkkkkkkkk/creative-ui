# 13 — QA Checklist

Run this before showing work to a client or publishing a template.

## Concept
- [ ] The variant (warm or cool) suits the industry and is used consistently
- [ ] Every section has exactly one literal metaphor that matches its headline
- [ ] No image could swap sections and still make sense
- [ ] The modern object is at or near the focal point of each painting

## Art
- [ ] Every image is public domain or original; `CREDITS.md` is complete
- [ ] No images were copied from reference sites, and no living artists were named in prompts
- [ ] All images share one colour grade
- [ ] Hands, faces and fingers are clean (no AI artefacts or garbled text)
- [ ] Tech objects read as modern (halftone or crisp UI), not painted
- [ ] Cut-out edges have no halos

## UI and type
- [ ] UI uses only neutrals + one accent; no gradients or glass
- [ ] Display serif is light/regular with tight leading and negative tracking
- [ ] Labels are caps with positive tracking; at most 2 families plus a mono
- [ ] Text on paintings has a scrim and ≥ 4.5:1 contrast
- [ ] Buttons are 48px tall (44px minimum on touch), with visible focus rings
- [ ] At most two ideas per viewport; section padding is generous

## Copy
- [ ] Hero headline ≤ 8 words; sentence case
- [ ] No hype words or exclamation marks
- [ ] Stats and testimonials are real and approved

## Responsive
- [ ] 390 / 810 / 1440 checked; no horizontal scroll
- [ ] Mobile art crops (4:5) keep the focal point and modern object visible
- [ ] Sticky cards and scroll stories work on iOS Safari
- [ ] Mobile headlines ≤ 48px

## Motion and performance
- [ ] Easing is slow (ease-out quint, 700ms), with no bounces
- [ ] `prefers-reduced-motion` is respected
- [ ] Only transform and opacity are animated; float loops pause off-screen
- [ ] Hero image ≤ 250KB, LCP < 2s, CLS < 0.05
- [ ] Below-the-fold images are lazy-loaded

## Accessibility
- [ ] Meaningful alt text; decorative images use `alt=""`
- [ ] Keyboard navigation works through the nav, buttons and menus
- [ ] Headings are in logical order (one H1)
