import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      "packages/compiler",
      "packages/vite-plugin",
      "packages/typescript-plugin",
      "packages/language-server",
      "packages/storybook",
      "packages/docs",
    ],
  },
});
