import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A",
        foreground: "#FFFFFF",
        "brand-purple": "#7C3AED",
        "brand-blue": "#3B82F6",
        "brand-emerald": "#10B981",
        "brand-coral": "#F59E0B",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        "float-slow": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)", opacity: "0.03" },
          "33%": { transform: "translate(30px, -30px) scale(1.05)", opacity: "0.05" },
          "66%": { transform: "translate(-20px, 20px) scale(0.95)", opacity: "0.03" },
        },
        "float-medium": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)", opacity: "0.03" },
          "50%": { transform: "translate(-40px, -20px) scale(1.1)", opacity: "0.05" },
        },
        "float-fast": {
          "0%, 100%": { transform: "translate(0, 0)", opacity: "0.03" },
          "25%": { transform: "translate(20px, -10px)", opacity: "0.04" },
          "75%": { transform: "translate(-20px, 10px)", opacity: "0.04" },
        },
        "float-reverse": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)", opacity: "0.03" },
          "50%": { transform: "translate(40px, 20px) scale(0.9)", opacity: "0.05" },
        },
      },
      animation: {
        "float-slow": "float-slow 20s ease-in-out infinite",
        "float-medium": "float-medium 15s ease-in-out infinite",
        "float-fast": "float-fast 10s ease-in-out infinite",
        "float-reverse": "float-reverse 18s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;