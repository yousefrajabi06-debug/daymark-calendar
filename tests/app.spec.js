import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
async function stub(page) {
  await page.route("https://date.nager.at/api/v3/**", (route) => {
    const url = route.request().url();
    const year = url.match(/PublicHolidays\/(\d+)/)?.[1] || "2026";
    return route.fulfill({
      json: url.includes("AvailableCountries")
        ? [
            { countryCode: "GB", name: "United Kingdom" },
            { countryCode: "DE", name: "Germany" },
          ]
        : [
            {
              date: `${year}-01-01`,
              name: "New Year",
              localName: "New Year",
              global: true,
              counties: null,
            },
            {
              date: `${year}-01-02`,
              name: "Regional Day",
              localName: "Regional Day",
              global: false,
              counties: ["GB-SCT"],
            },
          ],
    });
  });
}
test("country and month controls, search, regional labels, ICS export", async ({
  page,
}) => {
  await stub(page);
  await page.goto("/");
  await page
    .getByRole("combobox", { name: "Month", exact: true })
    .selectOption("1");
  await expect(
    page.getByRole("heading", { name: "New Year", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Search holidays").fill("Regional");
  await expect(page.locator(".holiday-card")).toHaveCount(1);
  await expect(page.getByText("GB-SCT", { exact: true })).toBeVisible();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export this view" }).click();
  const download = await pending;
  const ics = await readFile(await download.path(), "utf8");
  expect(ics).toContain("BEGIN:VCALENDAR");
  expect(ics).toContain("SUMMARY:Regional Day");
  expect(ics).not.toContain("SUMMARY:New Year");
  expect(ics).toMatch(/DTEND;VALUE=DATE:\d{4}0103/);
  await page.getByLabel("Search holidays").fill("");
  await page
    .getByRole("combobox", { name: "Country", exact: true })
    .selectOption("DE");
  await expect(
    page.getByText("Germany · includes regional dates"),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Month", exact: true })
    .selectOption("2");
  await expect(page.getByText("No matching holidays.")).toBeVisible();
});
test("API errors are actionable and recoverable", async ({ page }) => {
  await page.route("https://date.nager.at/api/v3/**", (r) =>
    r.fulfill({ status: 503, body: "{}" }),
  );
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("unavailable");
  await page.unroute("https://date.nager.at/api/v3/**");
  await stub(page);
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.locator(".calendar")).toBeVisible();
});
test("loading and mobile layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route("https://date.nager.at/api/v3/**", async (r) => {
    await gate;
    await r.fulfill({ json: [] });
  });
  await page.goto("/");
  await expect(page.getByText("Opening your calendar…")).toBeVisible();
  release();
  await expect(page.locator(".calendar")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
