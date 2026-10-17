/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
   darkMode: 'class',
  theme: {
    extend: {
      // Playground design tokens: values live in src/app/(Primary.pages)/Playground/playground.css
      colors: {
        pg: {
          paper: 'rgb(var(--pg-paper) / <alpha-value>)',
          surface: 'rgb(var(--pg-surface) / <alpha-value>)',
          tray: 'rgb(var(--pg-tray) / <alpha-value>)',
          line: 'rgb(var(--pg-line) / <alpha-value>)',
          ink: 'rgb(var(--pg-ink) / <alpha-value>)',
          'on-ink': 'rgb(var(--pg-on-ink) / <alpha-value>)',
          text2: 'rgb(var(--pg-text2) / <alpha-value>)',
          muted: 'rgb(var(--pg-muted) / <alpha-value>)',
          accent: 'rgb(var(--pg-accent) / <alpha-value>)',
          'accent-fill': 'rgb(var(--pg-accent-fill) / <alpha-value>)',
          'accent-tint': 'rgb(var(--pg-accent-tint) / <alpha-value>)',
          'accent-on-tint': 'rgb(var(--pg-accent-on-tint) / <alpha-value>)',
          danger: 'rgb(var(--pg-danger) / <alpha-value>)',
          'danger-tint': 'rgb(var(--pg-danger-tint) / <alpha-value>)',
          'notice-action': 'rgb(var(--pg-notice-action) / <alpha-value>)',
          // A little colour per kind of block
          eq: 'rgb(var(--pg-eq) / <alpha-value>)',
          'eq-tint': 'rgb(var(--pg-eq-tint) / <alpha-value>)',
          note: 'rgb(var(--pg-note) / <alpha-value>)',
          'note-tint': 'rgb(var(--pg-note-tint) / <alpha-value>)',
          plot: 'rgb(var(--pg-plot) / <alpha-value>)',
          'plot-tint': 'rgb(var(--pg-plot-tint) / <alpha-value>)',
          voice: 'rgb(var(--pg-voice) / <alpha-value>)',
          'voice-tint': 'rgb(var(--pg-voice-tint) / <alpha-value>)',
        },
      },
      boxShadow: {
        'pg-bar': 'var(--pg-shadow-bar)',
        'pg-menu': 'var(--pg-shadow-menu)',
      },
      fontFamily: {
        pg: ['var(--pg-font-sans)', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'pg-cap': ['12px', '16px'],
        'pg-label': ['13px', '18px'],
        'pg-body': ['15px', '22px'],
        'pg-title': ['18px', '24px'],
      },
    },
  },
    variants: {
      extend: {
        boxShadow: ['hover'], // Enable hover variants for shadow
      },
    },
  }

