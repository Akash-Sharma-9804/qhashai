/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // Enable dark mode using class,
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
        kanit: ['Kanit', 'sans-serif'],
        centurygothic: ['"Century Gothic"', 'sans-serif'],
         poppins: ['Poppins', 'sans-serif'],
      },
      transitionProperty: {
        colors: "color, background-color, border-color",
      },
       keyframes: {
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    slideUp: {
      '0%': { transform: 'translateY(20px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
  },
  animation: {
    fadeIn: 'fadeIn 0.5s ease-out forwards',
    slideUp: 'slideUp 0.5s ease-out forwards',
  },
    },
  },
   plugins: [
    require('@tailwindcss/typography'), // ✅ enable prose styles
  ],
}