import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ["./src/tests/setup.ts"],
    testTimeout: 10000,
    fileParallelism: false,
    exclude: ["dist/**", "node_modules/**", "web/**", "browser-extension/**"],
  },
});
