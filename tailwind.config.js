/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        /* Paleta tomada del logo: naranja terracota + oro + espresso */
        background: "#f7f1e6",
        foreground: "#1c1612",
        primary: {
          DEFAULT: "#d06a28",
          foreground: "#fffaf3",
        },
        muted: {
          DEFAULT: "#efe6d8",
          foreground: "#6a5748",
        },
        border: "#e2d4c2",
        /* Alias usados en templates */
        forest: {
          DEFAULT: "#d06a28", /* naranja del logo */
          deep: "#1c1612", /* espresso — títulos y secciones oscuras */
        },
        stone: {
          warm: "#e0b040", /* dorado del logo */
        },
        mist: "#f3ebe0",
        clay: {
          DEFAULT: "#c45c1a",
          deep: "#9a4518",
        },
      },
      fontFamily: {
        sans: ['"Source Sans 3"', "system-ui", "sans-serif"],
        display: ['"Source Sans 3"', "system-ui", "sans-serif"],
        heading: ['"Source Sans 3"', "system-ui", "sans-serif"],
      },
      letterSpacing: {
        brand: "0.04em",
      },
      lineHeight: {
        brand: "1.12",
      },
      boxShadow: {
        brand: "0 18px 40px -24px rgb(28 22 18 / 0.45)",
      },
    },
  },
  plugins: [],
};
