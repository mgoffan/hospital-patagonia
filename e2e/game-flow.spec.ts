import { expect, test } from "@playwright/test";

test("configures, enters the greybox and reviews results", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto("./");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Armá el turno",
  );

  await page.getByRole("button", { name: "Confirmar partida" }).click();
  await page
    .getByRole("button", { name: "Simular ronda de 5 minutos" })
    .click();

  await expect(
    page.getByRole("heading", { name: "Recorré el hospital." }),
  ).toBeVisible();
  await expect(page.locator(".operation-canvas canvas")).toBeVisible();
  await expect(page.locator(".world-label").first()).toBeVisible({
    timeout: 15_000,
  });
  await page.getByRole("button", { name: "Entrar e iniciar ronda" }).click();
  await expect(page.locator(".live-flow-stats dd").first()).not.toHaveText(
    "0",
    {
      timeout: 5_000,
    },
  );
  await expect(page.locator(".operation-clock strong")).not.toHaveText("05:00");
  await page.evaluate(() => {
    if (document.pointerLockElement) document.exitPointerLock();
  });
  await expect
    .poll(() => page.evaluate(() => document.pointerLockElement === null))
    .toBe(true);

  await page.getByRole("button", { name: "Saltar al resultado" }).click();
  await expect(
    page.getByRole("heading", { name: "Así funcionó tu hospital." }),
  ).toBeVisible();
  await expect(
    page.getByRole("table", { name: "Desempeño por estación" }),
  ).toBeVisible();
  expect(consoleErrors).toEqual([]);
});
