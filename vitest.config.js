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
      // L’objectif de couverture sera relevé au fur et à mesure des parcours métier.
    },
  },
});
