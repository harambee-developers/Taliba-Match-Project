/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './pages/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        male: { primary: '#F1F7FF', secondary: '#203449' },
        female: { primary: '#FFF1FE', secondary: '#E01D42' },
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
  darkMode: 'media',
}