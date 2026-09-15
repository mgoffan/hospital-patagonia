import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/hospital-patagonia/",
  plugins: [react(), tailwindcss()],
  build: {
    // Rapier embeds its WASM runtime in the lazy 3D route. The initial setup
    // bundle does not preload this intentional heavyweight chunk.
    chunkSizeWarningLimit: 3_500,
  },
});
