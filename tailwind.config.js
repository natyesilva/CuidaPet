/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#effcf9',
          100: '#d7f7f0',
          200: '#b3eee2',
          300: '#7edfcf',
          400: '#47c7b5',
          500: '#25aa99',
          600: '#19897d',
          700: '#176e66',
          800: '#175852',
          900: '#174a45',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 24px 70px -30px rgba(15, 118, 110, 0.35)',
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        'fade-up': 'fadeUp 700ms ease-out both',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
