/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [  "./views/**/*.{html,ejs}","./Resources/**/*.{html,js}"],
  theme: {
    minHeight:{
      'screen':'100vh',
    },
    extend: {},
  },
  plugins: [],
}
