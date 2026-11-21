/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#effbf9',
          100: '#d6f4ef',
          200: '#aee8df',
          300: '#78d5ca',
          400: '#43bbb0',
          500: '#229f96',
          600: '#17807b',
          700: '#166663',
          800: '#165150',
          900: '#133f40',
        },
        ink: {
          900: '#0e2a2d',
          700: '#2f4a4d',
          500: '#587174',
          300: '#9db1b3',
        },
        sand: {
          50: '#fcfaf6',
          100: '#f7f3ec',
          200: '#eee7da',
        },
        coral: {
          400: '#f08a6b',
          500: '#e8704d',
          600: '#d25a38',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(14, 42, 45, 0.18)',
        card: '0 1px 2px rgba(14,42,45,.05), 0 8px 24px -12px rgba(14,42,45,.15)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .5s ease-out both',
      },
    },
  },
  plugins: [],
}
