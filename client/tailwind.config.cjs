/** @type {import('tailwindcss').Config} */
export default {
    content: [    './pages/**/*.{html,js}',
    "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
      extend: {
        colors: {
          male: {
            primary: '#F1F7FF',
            secondary: '#203449',
          },
          female: {
            primary: '#FFF1FE',
            secondary: '#E01D42',
          },
        },
        fontFamily: {
          sans: ['Montserrat', 'sans-serif'], // Default font family for Tailwind
        },
      },
    },
    plugins: [],
    darkMode: 'media'
  }