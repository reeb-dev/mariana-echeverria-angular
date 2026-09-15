/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        background: "#f4f7f4",
        foreground: "#1c2e24",
        primary: {
          DEFAULT: "#243f32",
          foreground: "#f4f7f4",
        },
        muted: {
          DEFAULT: "#e7eee8",
          foreground: "#5a6b60",
        },
        border: "#cfdad2",
        forest: {
          DEFAULT: "#2f5a43",
          deep: "#1a3026",
        },
        stone: {
          warm: "#c9b496",
        },
        mist: "#eef3ef",
      },
      fontFamily: {
        sans: ["\"Source Sans 3\"", "system-ui", "sans-serif"],
        display: ["\"Libre Baskerville\"", "Georgia", "serif"],
        heading: ["\"Libre Baskerville\"", "Georgia", "serif"],
      },
      letterSpacing: {
        brand: "0.01em",
      },
      lineHeight: {
        brand: "1.12",
      },
    },
  },
  plugins: [],
};
