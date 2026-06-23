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
        brand: {
          orange: "#FF5A1F",
          "orange-dark": "#E04010",
          "orange-light": "#FF7A45",
        },
        surface: {
          bg: "#F8F7F4",
          card: "#FFFFFF",
          sidebar: "#1A1A1A",
          "sidebar-hover": "#2A2A2A",
          "sidebar-active": "#FF5A1F",
        },
        text: {
          primary: "#111827",
          secondary: "#6B7280",
          muted: "#9CA3AF",
          inverse: "#FFFFFF",
        },
        status: {
          "pending-bg": "#FEF3C7",
          "pending-text": "#92400E",
          "confirmed-bg": "#DBEAFE",
          "confirmed-text": "#1E40AF",
          "completed-bg": "#D1FAE5",
          "completed-text": "#065F46",
          "cancelled-bg": "#FEE2E2",
          "cancelled-text": "#991B1B",
          "draft-bg": "#F3F4F6",
          "draft-text": "#374151",
          "published-bg": "#D1FAE5",
          "published-text": "#065F46",
        },
        difficulty: {
          "easy-bg": "#D1FAE5",
          "easy-text": "#065F46",
          "medium-bg": "#FEF3C7",
          "medium-text": "#92400E",
          "hard-bg": "#FFEDD5",
          "hard-text": "#9A3412",
          "extreme-bg": "#FEE2E2",
          "extreme-text": "#991B1B",
        },
      },
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.10), 0 8px 32px rgba(0,0,0,0.06)",
        orange: "0 4px 24px rgba(255,90,31,0.25)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.4s ease forwards",
        "slide-in-left": "slideInLeft 0.3s ease forwards",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          from: { opacity: "0", transform: "translateX(-16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
