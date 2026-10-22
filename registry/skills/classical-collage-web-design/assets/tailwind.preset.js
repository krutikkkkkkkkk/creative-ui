/** Classical Collage × Modern Tech — Tailwind preset
 *  Requires assets/tokens.css to be loaded (all colours are CSS variables,
 *  so data-variant="warm" | "cool" on <html> re-themes everything). */
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        'ink-70': 'var(--ink-70)',
        'ink-25': 'var(--ink-25)',
        'ink-06': 'var(--ink-06)',
        accent: 'var(--accent)',
        'accent-2': 'var(--accent-2)',
        tint: { 1: 'var(--tint-1)', 2: 'var(--tint-2)', 3: 'var(--tint-3)' },
        'section-dark': 'var(--section-dark)',
        footer: 'var(--footer)',
        'ui-dark': 'var(--ui-dark)',
        chip: { 1: 'var(--chip-1)', 2: 'var(--chip-2)', 3: 'var(--chip-3)', 4: 'var(--chip-4)', 5: 'var(--chip-5)' },
        positive: 'var(--positive)',
        negative: 'var(--negative)',
      },
      fontFamily: {
        serif: ['var(--font-serif)'],
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      fontSize: {
        mega: ['var(--fs-mega)', { lineHeight: '1', letterSpacing: '-0.04em' }],
        'display-xl': ['var(--fs-display-xl)', { lineHeight: '1', letterSpacing: '-0.04em' }],
        'display-l': ['var(--fs-display-l)', { lineHeight: '1', letterSpacing: '-0.04em' }],
        'display-m': ['var(--fs-display-m)', { lineHeight: '1', letterSpacing: '-0.05em' }],
        stat: ['var(--fs-stat)', { lineHeight: '1', letterSpacing: '-0.04em' }],
        quote: ['var(--fs-quote)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        lead: ['var(--fs-lead)', { lineHeight: '1.3' }],
        label: ['12px', { lineHeight: '1.2', letterSpacing: '0.06em' }],
      },
      borderRadius: { sm: 'var(--radius-sm)', md: 'var(--radius-md)', lg: 'var(--radius-lg)', pill: 'var(--radius-pill)' },
      boxShadow: { float: 'var(--shadow-float)', contact: 'var(--shadow-contact)', panel: 'var(--shadow-panel)' },
      transitionTimingFunction: { 'out-quint': 'cubic-bezier(0.22, 1, 0.36, 1)', 'in-out-cubic': 'cubic-bezier(0.65, 0, 0.35, 1)' },
      transitionDuration: { 700: '700ms', 1100: '1100ms' },
      maxWidth: { site: 'var(--max-w)' },
      spacing: { section: 'var(--section-y)', gutter: 'var(--gutter)' },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0) rotate(var(--r,0deg))' }, '50%': { transform: 'translateY(-8px) rotate(calc(var(--r,0deg) + 3deg))' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      animation: { float: 'float 6s ease-in-out infinite', marquee: 'marquee 40s linear infinite' },
    },
  },
};
