/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        ink: "#1A1A1A",
        ink2: "#262626",
        sub: "#737373",
        sub2: "#8A8A8A",
        line: "#E5E5E5",
        bg: "#FAFAFA",
        teal1: "#38C9A8",
        blue1: "#4F8EF7",
        orange1: "#E8914F",
      },
    },
  },
  plugins: [],
};
