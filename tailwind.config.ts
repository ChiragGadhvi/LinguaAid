import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["Inconsolata", "Courier New", "monospace"],
        sans: ["Inconsolata", "Courier New", "monospace"],
      },
      colors: {
        primary: "#6366f1",
        accent: "#22d3ee",
      },
    },
  },
  plugins: [],
};

export default config;
