import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#4A3AFF",
          dark: "#3524D9",
          light: "#EEF0FF",
        },
      },
    },
  },
  plugins: [],
};
export default config;
