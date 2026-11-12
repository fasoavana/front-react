/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#252824",
        paper: "#fbfaf7",
        sage: "#8e9c89",
        accent: "#bd7059",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        editorial: ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
