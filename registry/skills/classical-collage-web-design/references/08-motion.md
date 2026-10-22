# 08 — Motion

Motion should feel like **a museum guide turning the lights on, one painting at a time**: slow, weighty and deliberate.

## Timing and easing

| Token | Value | Use |
|---|---|---|
| `ease-out-quint` | `cubic-bezier(0.22, 1, 0.36, 1)` | Default for everything entering |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Scroll-linked scale / position |
| `dur-fast` | 300ms | Buttons, hovers |
| `dur-base` | 700ms | Text and card reveals |
| `dur-slow` | 1000–1200ms | Hero art, image scale, counters |
| `stagger` | 80–120ms | Lines, chips, cards |

Avoid springs with overshoot, bounces and rotations over 10° during entrances.

## Entrance patterns

1. **Headline line reveal:** each line rises 16–24px from `opacity 0` with a 100ms stagger. Optional mask reveal (clip-path from bottom).
2. **Lead and buttons:** fade-up 12px, 150ms after the headline.
3. **Hero art:** scale 1.06 → 1.0 and opacity 0 → 1 over 1200ms. Cut-outs slide in 40px from their entry edge.
4. **Floating coins:** continuous float loop, `translateY ±8px` and `rotate ±3deg`, 5–7s per coin with offset delays. Light pointer parallax (max 12px).
5. **Halftone dots:** dot clusters fade in with a random 0–600ms delay per cluster.

## Scroll choreography

### Sticky stacking cards
```css
.card-stack > .card { position: sticky; top: calc(96px + var(--i) * 16px); }
```
As each card arrives the previous one scales to 0.96 and dims to 0.85 (scroll-linked).

### Scroll story (sequential lines)
- Section height 300–400vh, inner `position: sticky; top: 0; height: 100vh`.
- Map scroll progress 0→1 across N lines. Each line: opacity 0 → 1 (fade in over 10% progress), holds, then → 0.2 and moves up 40px as the next line enters.
- Thumbnails: each gets a parallax speed between −0.4 and +0.6, plus a slight scale 0.9 → 1.05.

### Mega word
A huge serif word scales from 1.2 to 1.0 and translates −20vw horizontally across its section.

### Paint-chip strip
Bands slide in from the left one after another (120ms stagger, 900ms each), and the quote card arrives last.

### Counters
Count from 0 to the value over 1200ms (ease-out) when 50% visible. Format with separators.

## Hover

- Buttons: label roll (text slides up, duplicate enters from below), 300ms.
- Cards: image scale 1.03 over 900ms; title up 4px.
- Links: underline grows from the left, 300ms.

## Reduced motion

With `@media (prefers-reduced-motion: reduce)`: disable the float loops, parallax, sticky scaling and the mega word; replace reveals with a 200ms opacity fade; show all scroll-story lines statically and stacked.

## Performance
- Animate only `transform` and `opacity`.
- Use `will-change` on sticky cards only while they are in view.
- Lazy-load thumbnails. Don't animate `filter: blur` on large images.
- Pause float loops when off-screen (IntersectionObserver).
