import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f3f0ff",
          100: "#e9e3ff",
          500: "#7B00FF",
          600: "#6600d6",
          700: "#5200ab",
        },
      },
    },
  },
  plugins: [],
};

export default config;
