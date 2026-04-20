/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dyslexia: {
          cream: '#F7F3E9',
          darkGray: '#2E2E2E',
          calmBlue: '#5C8DF6',
          softGreen: '#6CC7A8',
          pastelBlue: '#E8F4FC',
          pastelGreen: '#E8F8F0',
          lightYellow: '#FEF9E7',
          softOrange: '#F4A261',
        }
      },
      fontFamily: {
        lexend: ['Lexend', 'sans-serif'],
        openDyslexic: ['OpenDyslexic', 'sans-serif'],
      },
      letterSpacing: {
        'dyslexia': '0.12em',
      },
      lineHeight: {
        'dyslexia': '1.6',
      }
    },
  },
  plugins: [],
}
