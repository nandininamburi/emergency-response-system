/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a3f66',
        secondary: '#2c5f8a',
        danger: '#dc2626',
        success: '#16a34a',
        warning: '#f59e0b',
      }
    },
  },
  plugins: [],
}