import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import Vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      src: fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: [
    Vue(),
    dts({
      tsconfigPath: "./tsconfig.json",
      outDir: "dist/types",
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "index.ts"),
      name: "copilot",
      fileName: (format) => `copilot.${format}.js`,
      formats: ["es"],
    },
    rollupOptions: {
      external: ["vue", "pinia", "element-plus", "@computing/opendesign2"],
      input: "index.ts",
    },
    minify: "terser",
    sourcemap: false,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
