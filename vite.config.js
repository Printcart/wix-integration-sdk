import { resolve, dirname } from "path";
import { defineConfig } from "vite";
import { fileURLToPath } from "url";

const _dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    lib: {
      entry: resolve(_dirname, "src/main.ts"),
      name: "PrintcartDesignerWix",
      formats: ["iife", "es"],
      fileName: (format) => {
        if (format === "iife") {
          return "main.js";
        }

        return `main.${format}.js`;
      },
    },
  },
  // server: {
  //   hmr: {
  //     // clientPort: 443,
  //     protocol: "ws",
  //     port: 3101,
  //   },
  // },
});
