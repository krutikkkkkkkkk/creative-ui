# 05 — Design Tokens

The cool-variant values were **measured from contralabs.com** (computed styles, Oct 2026). The warm-variant values were **sampled from the Aureon design**. Free font alternatives are listed alongside the originals.

---

## Colour

### Cool / Contra (measured)

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#FBFAF6` | Page background, light button bg, text on dark |
| `--ink` | `#2B2B29` | Text, primary button, nav pill |
| `--ink-70` | `rgba(43,43,41,.70)` | Secondary text |
| `--ink-25` | `rgba(43,43,41,.25)` | Borders, outline buttons |
| `--teal` | `#387478` | Primary accent, card backgrounds behind paintings, "missing signal" section |
| `--teal-2` | `#317B87` | Hover/variation |
| `--sage` | `#A5BEBA` | Logo ribbon, section bg ("ecosystem"), stat cards |
| `--mint` | `#C8E1DD` | Soft section bg, quote card |
| `--mint-50` | `#E7F2F0` | Lightest tint, hover fills |
| `--umber` | `#494444` | Dark section ("Execution is free") |
| `--deep` | `#12232A` | Footer (approximately) |
| chips | `#2B2B29` `#918989` `#C8BCAE` `#918F66` `#C8E1DD` | Paint-chip testimonial strip |

### Warm / Aureon (sampled)

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#F2F1EE` | Page background |
| `--surface` | `#FFFFFF` | Cards, stat panels |
| `--ink` | `#141414` | Text, buttons |
| `--ink-muted` | `#6B6B6B` | Body copy |
| `--ink-faint` | `rgba(20,20,20,.06)` | Data texture, dividers |
| `--ui-dark` | `#111214` | Product UI panels |
| `--ui-dark-2` | `#1B1C1F` | Nested UI surfaces |
| `--gold` | `#B8893A` | Sparing accent (icon, focus ring, live dot) |
| `--sand` | `#E6D9C2` | Hover tints |
| `--positive` | `#3FB950` | UI deltas only |
| `--negative` | `#F85149` | UI deltas only |

### Colour rules
- Text on paintings is always `--bg`/white with a gradient scrim (≥ 4.5:1 contrast).
- A section can switch background (teal/mint/umber) to pace the page. Cool variant: max 3 tinted sections per page. Warm variant: stay on paper plus one dark footer.
- The accent never appears in more than ~5% of the UI area.

---

## Typography

### Families

| Role | Contra (measured) | Aureon (approx.) | Free alternative |
|---|---|---|---|
| Display | **Source Serif 4** (variable), 400 | GT Sectra / Canela Light-like high-contrast serif | Source Serif 4, Instrument Serif, Newsreader, Fraunces (opsz 144, wght 300) |
| Body / UI | **GT Standard L** Regular / Medium | Neue Haas / Inter-like grotesk | Inter, Geist, Manrope, Hanken Grotesk |
| Label / data | GT Standard Medium caps, +0.06em | Mono (JetBrains/Geist Mono) caps | JetBrains Mono, Geist Mono, IBM Plex Mono |

### Type scale — desktop (1440px)

| Style | Size / line-height | Tracking | Weight | Notes |
|---|---|---|---|---|
| Mega word | 300–600px / 1.0 | −0.04em | 400 | Scroll element, once per site |
| Display XL (hero) | 64–96px / 1.0 | −0.04em (Contra: −2.56px @ 64px) | 400 (300 if available) | 1–2 lines |
| Display L (H2) | 56–66px / 1.0 | −0.04em (Contra: −2.64px @ 66px) | 400 | |
| Display M (H3 / card title) | 40–44px / 1.0 | −0.05em (Contra: −2.2px @ 44px) | 400 | Serif card titles |
| Stat number | 72–120px / 1.0 | −0.04em | 400 | Serif |
| Quote | 40–56px / 1.2 | −0.01em | 400 | Serif |
| Lead / sub | 20–22px / 1.3 (Contra 22/28.6) | 0 | 400 | Grotesk, max 46ch |
| Body | 16px / 1.5 | 0 | 400 | Grotesk |
| Small | 14px / 1.2 (Contra 14/16.8) | −0.01em | 400 | Card descriptions |
| Label / eyebrow | 12–14px / 1.2 | +0.06em, UPPERCASE | 500 | Grotesk Medium or mono |
| Button | 16px / 24px | +0.01em | 400 | Grotesk |
| Micro data | 9–11px | +0.06em caps | 400 | Mono, data texture |

### Type scale — mobile (390px)

| Style | Size |
|---|---|
| Display XL | 44–48px |
| Display L | 36–40px |
| Display M | 28px |
| Stat number | 56px |
| Quote | 30–34px |
| Lead | 16–18px |
| Label | 11–12px |

Fluid formula: `font-size: clamp(44px, 3.2vw + 20px, 96px);`

### Type rules
- Headlines: 2 lines max in the hero; break lines deliberately ("Money moves. / The future begins here.").
- Never set the serif in bold, italic for emphasis, or all caps.
- Eyebrows can be prefixed with `// ` (warm, tech-flavoured) or plain caps (cool).
- Use `font-feature-settings: "ss01", "kern"` and `text-wrap: balance` on headlines.

---

## Spacing (8pt base)

| Token | px | Use |
|---|---|---|
| `space-1` | 4 | Icon gaps |
| `space-2` | 8 | Chip gaps |
| `space-3` | 12 | Label → title |
| `space-4` | 16 | Mobile gutter, title → body |
| `space-6` | 24 | Card padding (mobile), button gap |
| `space-8` | 32 | Card padding (desktop) |
| `space-12` | 48 | Headline → content |
| `space-16` | 64 | Between cards in a stack |
| `space-24` | 96 | Section padding (mobile) |
| `space-40` | 160 | Section padding (desktop) |
| `space-60` | 240 | Scroll-story breathing room |

## Layout grid
- Desktop: 12 columns, max width 1280–1360px, gutter 24px, side margin 40–64px
- Tablet: 8 columns, margin 32px
- Mobile: 4 columns, margin 16–24px
- Hero text column: 5–6 of 12 columns, top-left aligned (Contra) or centred (Aureon)
- Feature cards: full content width, 16:9 to 2.2:1 on desktop and 4:5 on mobile

## Radius
| Token | px | Use |
|---|---|---|
| `radius-sm` | 6 | Chips, small UI |
| `radius-md` | 10–12 | Product widgets, stat cards |
| `radius-lg` | 16 | Feature cards, big panels |
| `radius-pill` | 999 (Contra buttons: 24px at 48px height) | Buttons, tags, nav |

## Shadow
| Token | Value |
|---|---|
| `shadow-none` | Default. The style is flat. |
| `shadow-float` | `0 30px 60px -20px rgba(0,0,0,.45)` for dark UI floating on paintings |
| `shadow-contact` | `0 12px 24px -12px rgba(43,43,41,.35)` for coins on columns |
| `shadow-panel` | `0 1px 0 rgba(0,0,0,.04), 0 20px 40px -24px rgba(0,0,0,.18)` for white cards on paper (warm) |

## Borders
- Hairline: `1px solid rgba(43,43,41,.12)`
- Outline button: `1px solid rgba(43,43,41,.25)`
- On dark: `1px solid rgba(255,255,255,.08)`

## Z-layers
`0 paper texture` → `1 data texture` → `2 painting` → `3 cut-out overlap` → `4 floating UI` → `10 sticky nav`
