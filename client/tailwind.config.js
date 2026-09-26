/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Orange / Amber Kenyan Food warmth
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        safari: {
          emerald: '#059669',
          mpesa: '#00a859', // Authentic Safaricom Green
          mpesaDark: '#008744',
          gold: '#d97706',
          charcoal: '#18181b',
        }
      }
    },
  },
  plugins: [],
}
