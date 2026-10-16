import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: { arabic: ["Arial", "Tahoma", "sans-serif"] },
      colors: {
        nados: {
          ink: "#142033",
          navy: "#172b4d",
          terracotta: "#c56b4b",
          paper: "#f7f7f4",
          muted: "#6b7280"
        }
      }
    }
  },
  plugins: []
};
export default config;
