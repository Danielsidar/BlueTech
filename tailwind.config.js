/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,tsx,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0056b3',
          dark: '#004a99',
        },
        navy: {
          DEFAULT: '#001f3f',
          dark: '#001a35',
        }
      },
      fontFamily: {
        sans: ['var(--main-font)', 'sans-serif'],
        heebo: ['Heebo', 'Assistant', 'sans-serif'],
        inter: ['Inter', 'Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
