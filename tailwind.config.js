/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        background: "#faf7f2",
        foreground: "#2a1f16",
        primary: {
          DEFAULT: "#c45c1a",
          foreground: "#fffaf5",
        },
        muted: {
          DEFAULT: "#f3ebe1",
          foreground: "#6b5748",
        },
        border: "#e4d5c4",
        /* Remapeados al branding del logo (naranja + dorado) */
        forest: {
          DEFAULT: "#c45c1a",
          deep: "#8f3d0f",
        },
        stone: {
          warm: "#d4a017",
        },
        mist: "#f7f1e8",
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
    },
  },
  plugins: [],
};
