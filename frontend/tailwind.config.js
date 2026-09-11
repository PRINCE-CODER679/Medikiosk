/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mediblue: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#2563EB',
          600: '#1E56A0',
          700: '#16427D',
          800: '#153664',
          900: '#0F172A',
        },
        mediteal: {
          50: '#CCFBF1',
          100: '#99F6E4',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
