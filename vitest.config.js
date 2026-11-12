import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.{js,jsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcovonly"],
      reportsDirectory: "quality",
      include: ["src/**/*.{js,jsx}"],
      exclude: ["src/main.jsx"], // Point d’amorçage React ; les parcours rendent App.
      thresholds: { lines: 80, statements: 80 },
    },
  },
});
