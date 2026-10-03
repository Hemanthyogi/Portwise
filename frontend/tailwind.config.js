/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0a192f',
          800: '#0f2744',
          700: '#1b3b6f',
          600: '#214d8c',
        },
        portblue: {
          500: '#0284c7',
          400: '#38bdf8',
          100: '#e0f2fe',
          50: '#f0f9ff',
        },
        tealbrand: {
          500: '#0d9488',
          600: '#0f766e',
          100: '#ccfbf1',
        },
      },
    },
  },
  plugins: [],
}
