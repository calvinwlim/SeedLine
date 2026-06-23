import type { Config } from 'tailwindcss';

/** Semantic token backed by a CSS variable, with Tailwind opacity support. */
const token = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: token('--bg'),
        surface: token('--surface'),
        elevated: token('--elevated'),
        chalk: token('--fg'),
        muted: token('--muted'),
        faint: token('--faint'),
        line: token('--line'),
        // Fixed dark used for text sitting on light/gold accents (e.g. buttons).
        ink: '#11161d',
        podium: token('--podium'),
        corner: token('--corner'),
        win: token('--win'),
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        pop: 'var(--shadow-pop)',
      },
    },
  },
  plugins: [],
};

export default config;
