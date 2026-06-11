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
          50:  "#EEF4FF",
          100: "#D6E6FF",
          500: "#0050C3",
          600: "#0040A0",
          700: "#003080",
        },
      },
    },
  },
  plugins: [],
};

export default config;
