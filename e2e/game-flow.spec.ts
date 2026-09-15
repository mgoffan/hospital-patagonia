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

  await page
    .getByRole("button", { name: "Finalizar ronda y ver resultados" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Así funcionó tu hospital." }),
  ).toBeVisible();
  await expect(
    page.getByRole("table", { name: "Desempeño por estación" }),
  ).toBeVisible();
  expect(consoleErrors).toEqual([]);
});
