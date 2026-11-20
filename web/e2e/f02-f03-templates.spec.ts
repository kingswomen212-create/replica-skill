import { test, expect } from "@playwright/test";
import path from "node:path";
import { watchForErrors } from "./helpers";

// A tiny 1x1 PNG, just to exercise the file input -- not a real photo.
const TINY_PNG = path.join(__dirname, "fixtures", "tiny.png");

test.describe("F02 avatar video from a photo", () => {
  test("F02-H1 photo renders as the scene thumbnail, never forced to fail", async ({ page }) => {
    const errors = watchForErrors(page);
    await page.goto("/app/create/avatar");
    await page.setInputFiles("#photo", TINY_PNG);
    await page.getByLabel(/what should they say/i).fill("Hi, I built this in a weekend.");
    await page.getByRole("button", { name: "Generate", exact: true }).click();
    await page.waitForURL(/\/app\/videos\//);

    await expect(page.getByRole("button", { name: /download in 4k/i })).toBeEnabled({ timeout: 15_000 });
    await expect(page.locator('img[alt="Scene 1 preview"]')).toBeVisible();
    // Only one scene for avatar (a single continuous clip, not four).
    await expect(page.getByText(/^Scene 1$/)).toBeVisible();
    await expect(page.getByText(/^Scene 2$/)).toHaveCount(0);

    expect(errors).toEqual([]);
  });
});

test.describe("F03 music video and long-form scene counts", () => {
  test("F03-H1 music video: beat-detection step, 6 scenes", async ({ page }) => {
    const errors = watchForErrors(page);
    await page.goto("/app/create/music_video");
    await page.setInputFiles("#track", TINY_PNG); // input just needs a file
    await page.getByRole("button", { name: "Generate", exact: true }).click();
    await page.waitForURL(/\/app\/videos\//);

    await expect(page.getByText(/detecting the track's beat/i)).toBeVisible();
    // Music-video also has a forced first-pass scene failure (scene 5 of
    // 6, template-config.ts), same as faceless -- retry it before the
    // export button can enable.
    await expect(page.getByText("Couldn't generate this scene.")).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /retry/i }).click();
    await expect(page.getByRole("button", { name: /download in 4k/i })).toBeEnabled({ timeout: 10_000 });
    await expect(page.getByText(/^Scene 6$/)).toBeVisible();
    await expect(page.getByText(/^Scene 7$/)).toHaveCount(0);

    expect(errors).toEqual([]);
  });

  test("F03-E1 long-form: 9 scenes", async ({ page }) => {
    const errors = watchForErrors(page);
    await page.goto("/app/create/long_form");
    await page.getByLabel(/what's the video about/i).fill("A deep dive into shipping side projects.");
    await page.getByRole("button", { name: "Generate", exact: true }).click();
    await page.waitForURL(/\/app\/videos\//);

    // Long-form also has a forced first-pass scene failure (scene 7 of
    // 9, template-config.ts), same as faceless.
    await expect(page.getByText("Couldn't generate this scene.")).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: /retry/i }).click();
    await expect(page.getByRole("button", { name: /download in 4k/i })).toBeEnabled({ timeout: 10_000 });
    await expect(page.getByText(/^Scene 9$/)).toBeVisible();
    await expect(page.getByText(/^Scene 10$/)).toHaveCount(0);

    expect(errors).toEqual([]);
  });
});
