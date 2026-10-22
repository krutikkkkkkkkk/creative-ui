# 12 — Build in Next.js + Tailwind

## Stack
- Next.js (App Router), TypeScript
- Tailwind CSS with `assets/tailwind.preset.js`
- `motion` (Framer Motion) for reveals and scroll transforms. Lenis is optional for smooth scroll.
- `next/font/google` for Source Serif 4, Inter and JetBrains Mono

## Setup

```bash
npx create-next-app@latest my-site --ts --tailwind --app
npm i motion clsx
```

Copy `assets/tokens.css` into `app/globals.css` (after the Tailwind directives) and `assets/tailwind.preset.js` into the project root.

```js
// tailwind.config.js
module.exports = {
  presets: [require('./tailwind.preset.js')],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
};
```

```tsx
// app/layout.tsx
import { Source_Serif_4, Inter, JetBrains_Mono } from 'next/font/google';
const serif = Source_Serif_4({ subsets: ['latin'], variable: '--font-serif', weight: ['300','400'] });
const sans  = Inter({ subsets: ['latin'], variable: '--font-sans' });
const mono  = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-variant="cool" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body className="bg-bg text-ink font-sans antialiased paper-dots">{children}</body>
    </html>
  );
}
```

Switch the variant with `data-variant="warm"` or `"cool"` on `<html>`. All tokens are CSS variables.

## Components
Copy `assets/components/*` into `components/`. They are:
- `PillButton.tsx`: primary/secondary/small/onDark, with the label-roll hover
- `Eyebrow.tsx`
- `Reveal.tsx`: fade-up wrapper with stagger
- `Hero.tsx`: editorial-left and centred-stage layouts
- `FeatureCardStack.tsx`: sticky stacking painting cards
- `FloatingCoins.tsx`: float loop + pointer parallax
- `DataTexture.tsx`: generated mono background text
- `ScrollStory.tsx`: sequential lines + drifting thumbnails
- `StatBlock.tsx`: count-up serif stats
- `ChipTestimonial.tsx`: paint-chip strip + quote

## Images
- Use `next/image` with `sizes`, AVIF/WebP, `priority` on the hero only.
- Put a blur placeholder (`placeholder="blur"`) on paintings to avoid layout flashes.
- Keep cut-outs as WebP with alpha.

## Accessibility
- Decorative textures and thumbnails: `aria-hidden`, empty `alt`.
- Meaningful paintings: `alt` with the scene and metaphor.
- Sticky and scroll effects must leave the content readable in source order.
- Respect reduced motion via `useReducedMotion()` from `motion/react`.

## Performance budget
LCP < 2.0s on 4G, hero image ≤ 250KB, total JS ≤ 150KB gzipped, CLS < 0.05.

## Headless Shopify (D2C)
The same components work on a Next.js + Shopify Storefront API front end: use product cards on column capitals, and the PDP hero with the product on a marble plinth.
