import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/indicadores-chile-card.ts",
      formats: ["es"],
      fileName: "indicadores-chile-card"
    }
  }
});