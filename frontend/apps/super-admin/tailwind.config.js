/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary, #2563eb)',
        secondary: 'var(--color-secondary, #1e293b)',
        accent: 'var(--color-accent, #f59e0b)',
      },
      fontFamily: {
        heading: 'var(--font-heading, Inter, sans-serif)',
        body: 'var(--font-body, Inter, sans-serif)',
      },
      borderRadius: {
        theme: 'var(--radius, 0.5rem)',
      },
    },
  },
  plugins: [],
};
