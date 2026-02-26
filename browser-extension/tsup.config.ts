import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/background.ts", "src/popup.ts"],
  format: ["iife"],
  outDir: "dist",
  outExtension: () => ({ js: ".js" }),
  splitting: false,
  sourcemap: false,
  clean: true,
  target: "es2022",
  platform: "browser",
  noExternal: [/.*/],
});
