import { test, expect } from "@playwright/test";
import { watchForErrors } from "./helpers";

test.describe("F05 BYO provider keys", () => {
  test("F05-H1/H2 add a key (masked to last 4 chars), then remove it", async ({ page }) => {
    const errors = watchForErrors(page);
    await page.goto("/app/settings");

    await page.getByRole("button", { name: "Add key" }).first().click();
    await page.getByPlaceholder("Provider name").fill("OpenAI");
    await page.getByPlaceholder("API key").fill("sk-test-1234567890abcd");
    await page.getByRole("button", { name: "Save" }).click();

    const badge = page.getByText(/OpenAI/).first();
    await expect(badge).toBeVisible();
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).toContain("abcd");
    expect(bodyText).not.toContain("1234567890abcd");

    await page.getByRole("button", { name: /remove/i }).click();
    await expect(page.getByText("Using shared default").first()).toBeVisible();

    expect(errors).toEqual([]);
  });
});
