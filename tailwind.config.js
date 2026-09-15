/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        background: "oklch(0.97 0.008 145)",
        foreground: "oklch(0.22 0.03 155)",
        primary: {
          DEFAULT: "oklch(0.32 0.055 155)",
          foreground: "oklch(0.97 0.01 145)",
        },
        muted: {
          DEFAULT: "oklch(0.93 0.012 145)",
          foreground: "oklch(0.45 0.03 155)",
        },
        border: "oklch(0.86 0.02 145)",
        forest: {
          DEFAULT: "oklch(0.38 0.06 155)",
          deep: "oklch(0.26 0.045 155)",
        },
        stone: {
          warm: "oklch(0.78 0.035 85)",
        },
        mist: "oklch(0.94 0.015 145)",
      },
      fontFamily: {
        sans: ["Figtree", "system-ui", "sans-serif"],
        heading: ["Cormorant Garamond", "Georgia", "serif"],
        display: ["Fraunces", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
