/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        /* Paleta logo: terracota + oro + espresso — fondos limpios, acentos refinados */
        background: "#faf7f2",
        foreground: "#1c1612",
        primary: {
          DEFAULT: "#d06a28",
          foreground: "#fffaf3",
        },
        muted: {
          DEFAULT: "#f0ebe3",
          foreground: "#6a5748",
        },
        border: "#e5d9cb",
        forest: {
          DEFAULT: "#d06a28",
          deep: "#1c1612",
        },
        stone: {
          warm: "#e0b040",
        },
        mist: "#f5f0e8",
        clay: {
          DEFAULT: "#c45c1a",
          deep: "#9a4518",
        },
      },
      fontFamily: {
        sans: ['"Source Sans 3"', "system-ui", "sans-serif"],
        display: ['"Fraunces"', "Georgia", "serif"],
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
        card: "0 22px 48px -28px rgb(28 22 18 / 0.35)",
        soft: "0 8px 24px -16px rgb(28 22 18 / 0.2)",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
