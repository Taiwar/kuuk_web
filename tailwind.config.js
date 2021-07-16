const colors = require('tailwindcss/colors')

module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: '#ff0000'
      }
    }
  },
  variants: {
    extend: {},
  },
  plugins: [
  ],
  corePlugins: {
    preflight: true
  }
}
