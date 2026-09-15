import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { App } from "./App";

describe("App", () => {
  it("presents the round setup and updates its operating cost", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Armá el turno",
    );

    const total = screen.getByText("COSTO OPERATIVO DEL TURNO").closest("div");
    if (!total) throw new Error("No se encontró el total operativo.");
    expect(within(total).getByText("$250")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Agregar Médicos" }));
    expect(within(total).getByText("$350")).toBeInTheDocument();
  });

  it("confirms a valid configuration", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Confirmar partida" }));

    expect(
      screen.getByRole("heading", { name: "Turno 1" }),
    ).toBeInTheDocument();
    expect(screen.getByText("$250")).toBeInTheDocument();
  });
});
