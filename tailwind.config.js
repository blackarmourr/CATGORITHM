/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#080B12',
        'secondary-dark': '#111827',
        'primary-light': '#F5F7FA',
        'accent': '#5B7CFA',
        'accent-violet': '#8B5CF6',
        'cyan-hl': '#67E8F9',
        'primary-text': '#111827',
        'secondary-text': '#64748B',
        'success': '#16A34A',
        'border': '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontVariantNumeric: ['tabular-nums'],
    },
  },
  plugins: [],
}
