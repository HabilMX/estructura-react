import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";
import { cargadores, crearRutas } from "../../app/rutas";

function visitar(ruta: string, cargar = cargadores) {
  render(
    <RouterProvider router={createMemoryRouter(crearRutas(cargar), { initialEntries: [ruta] })} />,
  );
}

describe("las rutas", () => {
  it("en la raíz baja la pantalla del nuevo pedido", async () => {
    visitar("/");
    expect(await screen.findByRole("heading", { name: "Nuevo pedido" })).toBeInTheDocument();
  });

  it("una dirección que no existe tiene su propia pantalla", async () => {
    visitar("/no-existe");
    expect(
      await screen.findByRole("heading", { name: "Esta página no existe" }),
    ).toBeInTheDocument();
  });

  it("si el código de una pantalla no se pudo bajar, el encabezado sigue y hay cómo salir", async () => {
    const fallido = () =>
      Promise.reject(new TypeError("Failed to fetch dynamically imported module"));
    visitar("/", { ...cargadores, nuevoPedido: fallido });

    expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos mostrar esta pantalla.");
    expect(screen.getByRole("navigation", { name: "Principal" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver al inicio" })).toHaveAttribute("href", "/");
  });
});
