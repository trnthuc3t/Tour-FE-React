/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#003974', container: '#00509d', fixed: '#d6e3ff', 'fixed-dim': '#a9c7ff' },
        secondary: { DEFAULT: '#8c5000', container: '#fe9400', fixed: '#ffdcbf', 'fixed-dim': '#ffb874' },
        tertiary: { DEFAULT: '#00404f', container: '#00596c', fixed: '#b3ebff', 'fixed-dim': '#4cd6fb' },
        surface: { DEFAULT: '#f7f9fb', container: '#eceef0', 'container-low': '#f2f4f6', 'container-high': '#e6e8ea', 'container-highest': '#e0e3e5', 'container-lowest': '#ffffff' },
        on: { surface: '#191c1e', 'surface-variant': '#424751', primary: '#ffffff', 'primary-container': '#a4c5ff', secondary: '#ffffff', 'secondary-container': '#633700', error: '#ffffff' },
        outline: { DEFAULT: '#727782', variant: '#c2c6d3' },
        error: { DEFAULT: '#ba1a1a', container: '#ffdad6' },
      },
      fontFamily: { headline: ['"Plus Jakarta Sans"', 'sans-serif'], body: ['Manrope', 'sans-serif'], label: ['Manrope', 'sans-serif'] },
      borderRadius: { DEFAULT: '0.25rem', lg: '0.5rem', xl: '0.75rem', full: '9999px' },
      boxShadow: { editorial: '0px 20px 40px rgba(25, 28, 30, 0.06)' },
    },
  },
  plugins: [],
};
