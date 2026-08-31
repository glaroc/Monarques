import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    "process.env": {},
  },
  // maplibre loads its worker with { type: "module" }, so the emitted worker
  // bundle must be ESM rather than Vite's default iife.
  worker: {
    format: "es",
  },
  optimizeDeps: {
    // maplibre-gl v6 resolves its worker as a sibling file via
    // new URL("./maplibre-gl-worker.mjs", import.meta.url). Pre-bundling
    // rewrites import.meta.url to node_modules/.vite/deps/, where no worker
    // file exists, so the request falls through to index.html and the browser
    // blocks it on MIME type. Serving the package unbundled keeps them together.
    exclude: ["maplibre-gl"],
  },
});
