/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4A3AFF",
        sec:"#EDEBFF",
        n800: "#170F49",
        n700: "#514F6E",
        n600: "#6E7191",
        n500: "#A0A3BD",
        n400: "#D9DBE9",
        n300: "#EFF0F6",
        n200: "#F7F7FB",
        550: "#797C93"
      },
    },
  },
  plugins: [],
};
