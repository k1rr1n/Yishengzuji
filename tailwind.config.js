/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.{js,ts}",
  ],
  darkmode: "class",
  theme: {
    extend: {
      maxWidth: {
        "7xl": "80rem",
      },
    },
  },
  plugins: [],
};
