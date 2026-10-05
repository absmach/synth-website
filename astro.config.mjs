import { defineConfig } from "astro/config";

export default defineConfig({
  // Serve from the domain root. Set SITE_URL when the final domain is known.
  site: process.env.SITE_URL || "https://absmach.github.io/synth-website",
  base: "/",
  output: "static",
  devToolbar: { enabled: false },
  build: {
    format: "directory",
  },
});
