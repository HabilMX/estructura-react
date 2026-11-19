import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Campo } from "../../../../shared/components/ui/Campo";

describe("Campo", () => {
  it("amarra la etiqueta al control", () => {
    render(<Campo etiqueta="Correo" />);
    expect(screen.getByRole("textbox", { name: "Correo" })).toBeInTheDocument();
  });

  it("anuncia su error junto con el control", () => {
    render(<Campo etiqueta="Correo" error="Escribe un correo." />);
    const control = screen.getByRole("textbox", { name: "Correo" });
    expect(control).toBeInvalid();
    expect(control).toHaveAccessibleDescription("Escribe un correo.");
  });

  it("sin error, no se marca inválido", () => {
    render(<Campo etiqueta="Correo" />);
    expect(screen.getByRole("textbox", { name: "Correo" })).not.toBeInvalid();
  });
});
