import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/frontend-essentials/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        tint: {
          blue: "var(--tint-blue)",
          green: "var(--tint-green)",
          orange: "var(--tint-orange)",
          red: "var(--tint-red)",
          purple: "var(--tint-purple)",
          pink: "var(--tint-pink)",
          teal: "var(--tint-teal)",
          indigo: "var(--tint-indigo)",
        },
        surface: {
          primary: "var(--surface-primary)",
          secondary: "var(--surface-secondary)",
          tertiary: "var(--surface-tertiary)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
        },
        border: {
          subtle: "var(--border-subtle)",
          DEFAULT: "var(--border-default)",
          strong: "var(--border-strong)",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        capsule: "var(--radius-capsule)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        glass: "var(--shadow-glass)",
      },
      transitionTimingFunction: {
        fast: "var(--transition-fast)",
        normal: "var(--transition-normal)",
        slow: "var(--transition-slow)",
        spring: "var(--transition-spring)",
      },
      transitionDuration: {
        fast: "150ms",
        normal: "250ms",
        slow: "350ms",
        spring: "400ms",
      },
      backdropBlur: {
        glass: "var(--glass-blur)",
        heavy: "var(--glass-blur-heavy)",
      },
      animation: {
        "in": "animateIn 250ms ease-out forwards",
        "scale-in": "scaleIn 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "fade-in": "fadeIn 250ms ease-out forwards",
        "slide-up": "slideUp 250ms ease-out forwards",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        animateIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 8px rgba(0, 122, 255, 0.24)" },
          "100%": { boxShadow: "0 0 16px rgba(0, 122, 255, 0.36)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
