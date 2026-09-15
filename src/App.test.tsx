import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "./App";

describe("App", () => {
  it("presents the game title", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Hospital Patagonia" }),
    ).toBeInTheDocument();
  });
});
