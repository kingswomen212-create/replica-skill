import { test, expect } from "@playwright/test";
import { watchForErrors } from "./helpers";

test.describe("Navigation", () => {
  test("nav-H1 marketing site through to the app", async ({ page }) => {
    const errors = watchForErrors(page);
    await page.goto("/");
    // The header nav and footer both link to these pages; scope to the
    // header (banner landmark) to avoid an ambiguous locator.
    const nav = page.getByRole("banner");
    await nav.getByRole("link", { name: "Features", exact: true }).click();
    await expect(page).toHaveURL(/\/features/);
    await nav.getByRole("link", { name: "Pricing", exact: true }).click();
    await expect(page).toHaveURL(/\/pricing/);
    await nav.getByRole("link", { name: "How it works", exact: true }).click();
    await expect(page).toHaveURL(/\/how-it-works/);
    await nav.getByRole("link", { name: "FAQ", exact: true }).click();
    await expect(page).toHaveURL(/\/faq/);
    await nav.getByRole("link", { name: "Get started" }).click();
    await expect(page).toHaveURL(/\/signup/);
    await page.getByLabel("Email").fill("demo@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/app$/);

    expect(errors).toEqual([]);
  });

  test("nav-N1 unknown template route 404s instead of crashing", async ({ page }) => {
    const response = await page.goto("/app/create/not-a-real-template");
    expect(response?.status()).toBe(404);
  });

  test("nav-N2 unknown video id shows a message instead of crashing", async ({ page }) => {
    const errors = watchForErrors(page);
    await page.goto("/app/videos/does-not-exist");
    await expect(page.getByText(/couldn't find that video/i)).toBeVisible();
    expect(errors).toEqual([]);
  });
});
