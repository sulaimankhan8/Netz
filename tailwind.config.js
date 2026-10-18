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
        // Notes design tokens: values live in src/app/(Primary.pages)/Notes/notes.css
        nt: Object.fromEntries(
          [
            'paper', 'surface', 'tray', 'line', 'ink', 'on-ink', 'text2', 'muted',
            'accent', 'accent-fill', 'accent-tint', 'accent-on-tint',
            'danger', 'danger-tint', 'ok', 'ok-tint', 'notice-action',
            'math', 'math-tint', 'callout', 'callout-tint', 'solver', 'solver-tint',
            'quiz', 'quiz-tint', 'sketch', 'sketch-tint',
          ].map((name) => [name, `rgb(var(--nt-${name}) / <alpha-value>)`])
        ),
      },
      boxShadow: {
        'pg-bar': 'var(--pg-shadow-bar)',
        'pg-menu': 'var(--pg-shadow-menu)',
        'nt-bar': 'var(--nt-shadow-bar)',
        'nt-menu': 'var(--nt-shadow-menu)',
      },
      fontFamily: {
        pg: ['var(--pg-font-sans)', 'Segoe UI', 'system-ui', 'sans-serif'],
        nt: ['var(--nt-font-sans)', 'Segoe UI', 'system-ui', 'sans-serif'],
        'nt-mono': ['var(--nt-font-mono)', 'ui-monospace', 'Consolas', 'monospace'],
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

