/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'theme-bg': 'var(--color-theme-bg)',
        'theme-bg-secondary': 'var(--color-theme-bg-secondary)',
        'theme-text': 'var(--color-theme-text)',
        'theme-text-primary': 'var(--color-theme-text)',
        'theme-text-secondary': 'var(--color-theme-text-secondary)',
        'theme-accent': 'var(--color-theme-accent)',
        'theme-accent-text': 'var(--color-theme-accent-text)',
        'theme-border': 'var(--color-theme-border)',
        'theme-hover': 'var(--color-theme-hover)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}
