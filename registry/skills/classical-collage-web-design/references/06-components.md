# 06 — Components

Every component lists its anatomy, specs, states and do/don't. React versions are in `assets/components/`.

---

## Navigation

**Contra pattern:** a sage ribbon/bookmark logo hanging from the top-left (48×72px, `--sage` with a notched bottom and a white mark), a dark "Get in touch" pill and a hamburger on the right. The bar is transparent over the hero; once scrolled it becomes `--bg` at 90% with `backdrop-filter: blur(12px)`.

**Aureon pattern:** a lowercase wordmark left ("aureon", grotesk 600, 18px), 4 centred text links (Platform, Solutions, Developers, Company, 14px, `--ink` 80%) and two small pills on the right ("Log in" dark, "Contact us" outline).

**Specs:** height 64–72px, side padding = grid margin, links 14–15px, gap 32px. Hover: opacity 1 plus a 1px underline offset 4px.
**Mobile:** logo + pill CTA + hamburger. The full-screen menu uses `--bg` with Display M serif links stacked.

---

## Buttons

| Variant | Spec (Contra measured) |
|---|---|
| Primary | bg `--ink` `#2B2B29`, text `--bg`, height 48px, padding 12/24px, radius 24px, 16px grotesk |
| Secondary | bg `--bg` or transparent, text `--ink`, 1px border `--ink-25`, same size |
| Small (Aureon) | height 32–36px, padding 0/16px, 11px **mono caps** +0.08em, leading dot `●` 6px |
| On dark | bg `--bg`, text `--ink` |

**Hover:** the label slides up and a duplicate slides in from below (Contra duplicates the label text for this roll effect), 300ms ease-out. Background lightens ~6%.
**Focus:** 2px outline offset 2px in `--teal` (cool) or `--gold` (warm).
**Don't:** use gradients, icons-only buttons or more than 2 buttons per group.

---

## Eyebrow / label

- Cool: `PUBLIC LAUNCH-FOCUSED RESEARCH`, 14px grotesk medium, caps, +0.06em, white on cards and ink on paper
- Warm: `// MODERN FINANCIAL INFRASTRUCTURE`, 11px mono caps, +0.08em, ink 60%
- A small index can precede it: `01 —`, `[02]`

---

## Hero

**Anatomy:** eyebrow → headline (Display XL) → lead (1 sentence) → button group → artwork.

**Layout A (Contra, editorial left):** text block top-left (cols 1–6), artwork bleeding off the right and bottom edges, figure cropped at the shoulder, halftone laptop, dot cloud.
**Layout B (Aureon, centred stage):** headline centred, cut-out hands entering from both sides holding phones, coins arcing overhead, data texture behind, logo strip anchored at the bottom of the hero.

**Specs:** min-height 100svh (desktop) / auto (mobile); headline max 14ch per line; 24px between lead and buttons; 12px between buttons.

---

## Logo strip

5–8 client logos, grayscale, `opacity .45`, height 20–24px, gap 56px, optionally a slow marquee (40s loop). Label above: `TRUSTED BY` in eyebrow style.

---

## Intro block ("A new perspective…")

Two columns: Display L headline left (cols 1–6), 14px muted paragraph right (cols 9–12, top-aligned). Below it a full-width painting panel (radius 16) with a large dark product screenshot overlapping its bottom edge by 10–20%.

---

## Feature card (painting card)

**Anatomy:** painting background → scrim → eyebrow (top-left, 24–32px inset) → serif title (bottom-left, Display M, white) → optional description + "Learn more" link (shown below the card on Contra, or on hover).

**Specs:** radius 12–16px, aspect 16:9 desktop / 4:5 mobile, overflow hidden, image scale 1.04 → 1.0 on enter.
**Stacking (Contra):** cards are `position: sticky; top: 96px`, each 16–24px lower than the last, so they pile up as you scroll.
**Hover:** the image scales to 1.03 over 900ms and the title shifts up 4px.
**Variant — split card (Aureon "Global Payments"):** white card, number index top-left, serif title, cut-out object (coin, key) taking 60% of the card.

---

## Floating product widget

See technique #5. Common contents:
- **Currency list:** rows with flag/symbol, code (mono) and name (muted caps), with a check on the selected row
- **Price ticker:** pair tabs (BTC / ETH / SOL), large price in serif or mono, a 2×2 stat grid
- **Balance:** "My Portfolio" label, `$12,486.075` with the decimals at 40% opacity, a sparkline

Width 260–360px; floats over the painting, offset from the centre toward the calm area.

---

## Stats

**Aureon:** a white panel with a coin on a column (left), a serif intro sentence (right), then stacked huge serif numbers (`5M+`, `600K+`) with 10px mono captions (`TRANSACTIONS PROCESSED`).
**Contra:** stacked sage/mint cards (radius 12), number in Display M serif and caption in 14px grotesk, on a teal section.

Rules: 2–4 stats max, round numbers with `+`/`M`/`K`, and count up on enter (1.2s, ease-out).

---

## Tag chips

Outline pills: 1px border `rgba(251,250,246,.5)` on teal (or `--ink-25` on paper), 14px, padding 6/14px, gap 8px, wrapping. Use them to list audiences or skills.

---

## Testimonial

- **Contra:** paint-chip bands plus a mint quote card; quote in serif 40–56px with hanging quotes `“ ”` in serif; attribution `— Name, Role at Company` in 18px grotesk.
- **Aureon:** a two-card row. Left: a painting crop with a white serif caption ("Trusted by those who move forward"). Right: a white card with a large `“` mark, serif quote 24–28px, muted body, avatar + name + role, prev/next circular arrows and a logo row along the bottom.

---

## Scroll story ("Built on real-world creative expertise")

A mostly empty `--bg` section about 300–400vh tall. Three short serif lines (Display M) appear centred one after another; each fades in, holds, then fades to 20% as the next arrives. Small painting thumbnails (80–220px, 3:4) drift at different parallax speeds around the edges. See `08-motion.md`.

---

## Statement band

A full-width dark (`--umber` / `--ink`) or teal band with a centred two-line serif statement ("Execution is free. / Now, judgment is everything."), a one-line grotesk sub and a light pill button. Can sit directly under a wide painting with a gilded-frame edge.

---

## Closing CTA

Headline left ("Let's build a stronger foundation for your financial future"), 14px sub, small dark pill, and the strongest metaphor image on the right (the keystone hand). Alternative: centred serif headline with a dark and an outline button, surrounded by drifting thumbnails (Contra "The network for creative expertise").

---

## Footer

Dark (`--ink` / `#12232A`). A big wordmark (lowercase grotesk or serif, 64–160px) or a painting panel bleeding in from above. 3–4 link columns with mono caps headings (`PLATFORM`, `COMPANY`, `RESOURCES`, `LEGAL`) and 14px links at 70% opacity. Bottom row: © plus socials.
