import { expect, test } from "@playwright/test";

test("the first patient stops at reception, visits each station and leaves physically", async ({
  page,
}) => {
  test.setTimeout(75_000);
  await page.goto("./");
  await page.getByRole("button", { name: "Confirmar partida" }).click();
  await page
    .getByRole("button", { name: "Simular ronda de 5 minutos" })
    .click();
  await expect(page.locator(".operation-canvas canvas")).toBeVisible();
  await page.evaluate(() => {
    const diagnostic = window as Window & {
      patientIssues?: string[];
      waitingApproachSeen?: boolean;
      seatedSeen?: boolean;
    };
    diagnostic.patientIssues = [];
    diagnostic.waitingApproachSeen = false;
    diagnostic.seatedSeen = false;
    window.setInterval(() => {
      const patients = [
        ...document.querySelectorAll<HTMLElement>("[data-patient-id]"),
      ]
        .map((element) => ({
          id: element.dataset.patientId ?? "",
          x: Number(element.dataset.worldX),
          z: Number(element.dataset.worldZ),
          station: element.dataset.station,
          activity: element.dataset.activity,
          sitting: element.dataset.sitting,
        }))
        .filter(({ x, z }) => Number.isFinite(x) && Number.isFinite(z));
      for (const patient of patients) {
        if (
          patient.activity === "queued" &&
          patient.station !== "administration"
        ) {
          const approaches = [
            [2.5, 3.42],
            [5, 3.42],
            [7.5, 3.42],
            [2.5, 5.92],
            [5, 5.92],
            [7.5, 5.92],
          ];
          const nearSeat = approaches.some(
            ([x, z]) => Math.hypot(patient.x - x, patient.z - z) < 0.12,
          );
          if (patient.sitting === "yes") {
            diagnostic.seatedSeen = true;
            if (!nearSeat)
              diagnostic.patientIssues?.push(
                `${patient.id} se sentó antes de llegar`,
              );
          } else if (!nearSeat) {
            diagnostic.waitingApproachSeen = true;
          }
        }
        if (
          Math.abs(patient.z) < 0.4 &&
          ![-11, -5.5, -0.5, 4.5, 10.5].some(
            (door) => Math.abs(patient.x - door) < 0.505,
          )
        ) {
          diagnostic.patientIssues?.push(
            `${patient.id} fuera del vano: ${patient.x}, ${patient.z}`,
          );
        }
      }
      for (let index = 0; index < patients.length; index += 1) {
        for (
          let otherIndex = index + 1;
          otherIndex < patients.length;
          otherIndex += 1
        ) {
          const a = patients[index];
          const b = patients[otherIndex];
          if (a && b && Math.hypot(a.x - b.x, a.z - b.z) < 0.54)
            diagnostic.patientIssues?.push(`${a.id} y ${b.id} se superponen`);
        }
      }
    }, 50);
  });
  await page.getByRole("button", { name: "Iniciar reloj" }).click();

  const first = page.locator('[data-patient-id="patient-01"]');
  await expect(first).toBeAttached({ timeout: 16_000 });
  await expect
    .poll(() => first.getAttribute("data-phase"), {
      timeout: 10_000,
      intervals: [25],
    })
    .toBe("pause");
  const atCounter = await first.evaluate((element) => ({
    x: Number((element as HTMLElement).dataset.worldX),
    z: Number((element as HTMLElement).dataset.worldZ),
  }));
  expect(Math.hypot(atCounter.x + 6.1, atCounter.z - 6.9)).toBeLessThan(0.15);
  await expect(first).toHaveAttribute("data-bracelet", "no");
  await expect
    .poll(async () => Number(await first.getAttribute("data-pause-ms")), {
      timeout: 3_000,
      intervals: [25],
    })
    .toBeGreaterThanOrEqual(500);
  await expect(first).toHaveAttribute("data-bracelet", "yes");
  await expect
    .poll(
      async () => {
        const station = await first.getAttribute("data-visit-station");
        const reached = await first.getAttribute("data-at-visit");
        return station === "nursing" && reached === "yes";
      },
      { timeout: 25_000, intervals: [25] },
    )
    .toBe(true);
  await expect
    .poll(
      async () =>
        (await first.getAttribute("data-visit-station")) === "doctor" &&
        (await first.getAttribute("data-at-visit")) === "yes",
      { timeout: 20_000, intervals: [25] },
    )
    .toBe(true);
  await expect
    .poll(
      async () =>
        (await first.getAttribute("data-visit-index")) === "3" &&
        (await first.getAttribute("data-visit-station")) === "administration" &&
        (await first.getAttribute("data-at-visit")) === "yes",
      { timeout: 20_000, intervals: [25] },
    )
    .toBe(true);
  await expect(first).toHaveCount(0, { timeout: 20_000 });
  const issues = await page.evaluate(
    () => (window as Window & { patientIssues?: string[] }).patientIssues ?? [],
  );
  expect(issues).toEqual([]);
});

test("a waiting patient sits only after reaching an available chair", async ({
  page,
}) => {
  test.setTimeout(100_000);
  await page.goto("./?debugFlow=1");
  await page.locator('input[name="demand"][value="high"]').check();
  await page.getByRole("button", { name: "Confirmar partida" }).click();
  await page
    .getByRole("button", { name: "Simular ronda de 5 minutos" })
    .click();
  await expect(page.locator(".operation-canvas canvas")).toBeVisible();
  await page.evaluate(() => {
    const diagnostic = window as Window & { crowdIssues?: string[] };
    diagnostic.crowdIssues = [];
    window.setInterval(() => {
      const patients = [
        ...document.querySelectorAll<HTMLElement>("[data-patient-id]"),
      ]
        .map((element) => ({
          id: element.dataset.patientId ?? "",
          x: Number(element.dataset.worldX),
          z: Number(element.dataset.worldZ),
          sitting: element.dataset.sitting,
        }))
        .filter(({ x, z }) => Number.isFinite(x) && Number.isFinite(z));
      for (const patient of patients) {
        if (patient.sitting === "yes") {
          const approaches = [
            [2.5, 3.42],
            [5, 3.42],
            [7.5, 3.42],
            [2.5, 5.92],
            [5, 5.92],
            [7.5, 5.92],
          ];
          if (
            !approaches.some(
              ([x, z]) => Math.hypot(patient.x - x, patient.z - z) < 0.12,
            )
          )
            diagnostic.crowdIssues?.push(
              `${patient.id} se sentó antes de llegar`,
            );
        }
        if (
          Math.abs(patient.z) < 0.4 &&
          ![-11, -5.5, -0.5, 4.5, 10.5].some(
            (door) => Math.abs(patient.x - door) < 0.505,
          )
        )
          diagnostic.crowdIssues?.push(`${patient.id} atravesó un muro`);
      }
      for (let index = 0; index < patients.length; index += 1) {
        for (
          let otherIndex = index + 1;
          otherIndex < patients.length;
          otherIndex += 1
        ) {
          const left = patients[index];
          const right = patients[otherIndex];
          if (
            left &&
            right &&
            Math.hypot(left.x - right.x, left.z - right.z) < 0.54
          )
            diagnostic.crowdIssues?.push(
              `${left.id} y ${right.id} se superponen`,
            );
        }
      }
    }, 50);
  });
  await page.getByRole("button", { name: "Iniciar reloj" }).click();
  const seated = page.locator('[data-sitting="yes"]').first();
  try {
    await expect(seated).toBeAttached({ timeout: 85_000 });
  } catch (error) {
    const debug = await page.evaluate(
      () =>
        (window as Window & { hospitalFlowDebug?: unknown }).hospitalFlowDebug,
    );
    throw new Error(`${String(error)}\n${JSON.stringify(debug)}`);
  }
  const position = await seated.evaluate((element) => ({
    x: Number((element as HTMLElement).dataset.worldX),
    z: Number((element as HTMLElement).dataset.worldZ),
  }));
  const approaches = [
    [2.5, 3.42],
    [5, 3.42],
    [7.5, 3.42],
    [2.5, 5.92],
    [5, 5.92],
    [7.5, 5.92],
  ];
  expect(
    approaches.some(
      ([x, z]) => Math.hypot(position.x - x, position.z - z) < 0.12,
    ),
  ).toBe(true);
  const issues = await page.evaluate(
    () => (window as Window & { crowdIssues?: string[] }).crowdIssues ?? [],
  );
  expect(issues).toEqual([]);
});
