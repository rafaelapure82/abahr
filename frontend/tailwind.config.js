/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#22C55E', // green-500
          foreground: '#FFFFFF',
        }
      },
      fontFamily: {
        interface: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
