import { expect, test } from "@playwright/test";

test("configures, enters the greybox and reviews results @smoke", async ({
  page,
}) => {
  test.setTimeout(60_000);
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
  await page.getByRole("button", { name: "Iniciar reloj" }).click();
  await expect(
    page.getByRole("button", { name: "Pausar reloj" }),
  ).toBeVisible();
  await expect(page.locator(".operation-clock span")).toContainText(
    "RONDA EN CURSO",
  );

  await page.getByRole("button", { name: "Saltar al resultado" }).click();
  await expect(
    page.getByRole("heading", { name: "Así funcionó tu hospital." }),
  ).toBeVisible();
  await expect(
    page.getByRole("table", { name: "Desempeño por estación" }),
  ).toBeVisible();
  expect(consoleErrors).toEqual([]);
});
