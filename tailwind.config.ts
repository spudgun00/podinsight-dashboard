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
        // Episode Intelligence Design System
        background: "var(--bg-primary)",
        foreground: "var(--text-primary)",
        "intel": {
          "bg-primary": "var(--bg-primary)",
          "bg-card": "var(--bg-card)",
          "border": "var(--border-subtle)",
          "text-primary": "var(--text-primary)",
          "text-secondary": "var(--text-secondary)",
          "purple": "var(--accent-purple)",
          "purple-glow": "var(--accent-purple-glow)",
        },
        // Brand colors
        "brand-purple": "#8B5CF6",
        "brand-blue": "#3B82F6",
        "brand-emerald": "#10B981",
        "brand-coral": "#F59E0B",
        "brand-pink": "#EC4899",
        "brand-green": "#10B981",
        "brand-red": "#DC2626",
        // Episode Intelligence signal colors
        "signal-red": "#DC2626",
        "signal-orange": "#F59E0B",
        "signal-green": "#10B981",
        "signal-blue": "#3B82F6",
        // Legacy card backgrounds (deprecated)
        "card-bg": "var(--bg-card)",
        "card-border": "var(--border-subtle)",
        "card-dark": "#0f0f0f",
        // Text colors
        "intel-gray": "var(--text-secondary)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
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
        "pulse-glow": {
          "0%": {
            transform: "scale(1)",
            opacity: "1",
          },
          "50%": {
            transform: "scale(1.2)",
            opacity: "0.8",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
        "pulse-subtle": {
          "0%, 100%": {
            opacity: "1",
          },
          "50%": {
            opacity: "0.7",
          },
        },
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        "float-slow": "float-slow 20s ease-in-out infinite",
        "float-medium": "float-medium 15s ease-in-out infinite",
        "float-fast": "float-fast 10s ease-in-out infinite",
        "float-reverse": "float-reverse 18s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "pulse-subtle": "pulse-subtle 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;