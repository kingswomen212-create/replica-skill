import type { Page } from "@playwright/test";

export function watchForErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  page.on("response", (res) => {
    if (res.status() >= 500) errors.push(`${res.status()} on ${res.url()}`);
  });
  return errors;
}
