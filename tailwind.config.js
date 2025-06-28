/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'main': 'var(--bg-main)',
        'elevated': 'var(--bg-elevated)',
        'line': 'var(--line)',
        'accent-1': 'var(--accent-1)',
        'accent-2': 'var(--accent-2)',
        'text-main': 'var(--text-main)',
        'text-body': 'var(--text-body)',
        'brand': 'var(--brand)',
      },
      fontFamily: {
        'heading': ['Roboto', 'sans-serif'],
        'body': ['Merriweather', 'serif'],
      },
      fontSize: {
        'hero': 'clamp(1.8rem, 4vw, 2.4rem)',
      },
      spacing: {
        'responsive': 'clamp(16px, 4vw, 72px)',
      },
      minHeight: {
        'hero': '80vh',
        'hero-lg': '90vh',
      },
      maxWidth: {
        'search': 'min(600px, 80vw)',
        'tagline': '700px',
      },
      borderRadius: {
        'search': '32px',
        'card': '12px',
      },
      boxShadow: {
        'search': '0 2px 8px rgba(0,0,0,.07)',
        'card': '0 1px 4px rgba(0,0,0,.05)',
        'card-hover': '0 8px 24px rgba(0,0,0,.12)',
      },
      transitionDuration: {
        'fast': '150ms',
      },
    },
  },
  plugins: [],
};