import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        surface: "#f8fafc",
        bank: "#005f73",
        action: "#0a9396"
      }
    }
  },
  plugins: []
} satisfies Config;

