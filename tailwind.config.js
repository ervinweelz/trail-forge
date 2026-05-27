/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        trail: {
          green: '#1D6D4A',
          brown: '#6B4226',
          stone: '#7C7C7C',
          sky: '#208AEF',
        },
      },
    },
  },
  plugins: [],
};
