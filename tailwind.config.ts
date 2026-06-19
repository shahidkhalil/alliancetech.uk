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
        navy: {
          950: "#020B18",
          900: "#0A1628",
          800: "#0A2540",
          700: "#0D2F50",
          600: "#103660",
        },
        brand: {
          blue: "#0066FF",
          cyan: "#00D4FF",
          purple: "#7B61FF",
          light: "#E8F0FF",
          // Alliance Tech brand colors
          teal: "#00283C",
          "teal-mid": "#1A6B8A",
          "teal-light": "#E8F4F8",
        },
        // Light theme
        surface: "#F8FAFC",
        "surface-2": "#F0F7FF",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-gradient": "linear-gradient(135deg, #020B18 0%, #0A2540 50%, #050E1F 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        "glow-blue": "radial-gradient(circle, rgba(0,102,255,0.15) 0%, transparent 70%)",
        "glow-cyan": "radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 2s infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-up": "slide-up 0.5s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "typing": "typing 3s steps(40) infinite",
        "spin-slow": "spin 15s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 102, 255, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(0, 102, 255, 0.6), 0 0 60px rgba(0, 212, 255, 0.3)" },
        },
        "slide-up": {
          from: { transform: "translateY(30px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        typing: {
          "0%": { width: "0" },
          "50%": { width: "100%" },
          "100%": { width: "0" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "glow-blue": "0 0 30px rgba(0, 102, 255, 0.4)",
        "glow-cyan": "0 0 30px rgba(0, 212, 255, 0.4)",
        "card": "0 4px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
        "card-hover": "0 8px 50px rgba(0, 102, 255, 0.2), inset 0 1px 0 rgba(255,255,255,0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
