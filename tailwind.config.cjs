/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        jet: '#333333',
        seasalt: '#FCFAF9',
        coral: '#FF8C61',
        turquoise: '#48E5C2',
        blush: '#CE6A85',
        'rich-black-blue': '#090E20',
        'space-cadet': '#121c40',
        'ultra-violet': '#5D6386',
      },
    },
  },
  plugins: [],
};

module.exports = config;
