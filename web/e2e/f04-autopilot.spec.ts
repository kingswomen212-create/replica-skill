import { test, expect } from "@playwright/test";
import { watchForErrors } from "./helpers";

test.describe("F04 Autopilot", () => {
  test("F04-H1/H2 connect, enable, set niche, see run history, disconnect", async ({ page }) => {
    const errors = watchForErrors(page);
    await page.goto("/app/autopilot");

    const firstConnect = page.getByRole("button", { name: "Connect" }).first();
    await firstConnect.click();
    await expect(page.getByText("Connected").first()).toBeVisible({ timeout: 5_000 });

    const autopilotCheckbox = page.getByRole("checkbox", { name: /autopilot on/i }).first();
    await autopilotCheckbox.check();
    await page.getByPlaceholder(/niche, e\.g\. personal finance/i).fill("home organization");

    await expect(page.getByText("Recent autopilot runs")).toBeVisible();
    await expect(page.getByText(/warm-ups|pricing mistake/i).first()).toBeVisible();

    await page.getByRole("button", { name: "Disconnect" }).first().click();
    await expect(page.getByText("Not connected").first()).toBeVisible();
    await expect(page.getByRole("checkbox", { name: /autopilot on/i })).toHaveCount(0);

    expect(errors).toEqual([]);
  });
});
