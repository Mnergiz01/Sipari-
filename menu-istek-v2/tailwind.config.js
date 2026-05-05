/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-alt': 'var(--color-surface-alt)',
        'surface-deep': 'var(--color-surface-deep)',
        border: 'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',
        hairline: 'var(--color-hairline)',
        text: 'var(--color-text)',
        'text-soft': 'var(--color-text-soft)',
        'text-muted': 'var(--color-text-muted)',
        'text-subtle': 'var(--color-text-subtle)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        'accent-soft': 'var(--color-accent-soft)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Inter Display', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SF Mono', 'monospace']
      },
      fontSize: {
        '3xs': '0.5625rem',
        '2xs': '0.625rem',
        xs: '0.6875rem',
        sm: '0.8125rem',
        base: '0.9375rem'
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'var(--radius-sm)',
        lg: 'var(--radius-lg)'
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        focus: 'var(--shadow-focus)'
      },
      backgroundImage: {
        'grad-brand': 'var(--grad-brand)'
      },
      transitionDuration: {
        DEFAULT: '150ms'
      }
    }
  },
  plugins: []
}
