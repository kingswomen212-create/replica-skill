import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3100",
    trace: "off",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // No webServer block: start `npm run start -- -p 3100` yourself first,
  // with stdout redirected to a file (not left to the default pipe).
  // Playwright's own webServer wrapper piping a Next.js server's chatty
  // stdout was observed to intermittently stall the server under this
  // sandbox's resource constraints -- generation that finished in ~3-4s
  // against a manually-started server took 15-30s+ (sometimes timing
  // out) under the auto-started one with identical code. See
  // replica/bugs.md's "infrastructure note".
});
