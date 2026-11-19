import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";
import { PedidoPage } from "../../pages/PedidoPage";
import { HttpResponse, ID_DE_EJEMPLO, http, problema, servidor } from "../comun/servidor";

function visitar(id: string) {
  const rutas = createMemoryRouter([{ path: "/pedidos/:id", Component: PedidoPage }], {
    initialEntries: [`/pedidos/${id}`],
  });
  render(<RouterProvider router={rutas} />);
}

describe("PedidoPage: los cuatro estados de la consulta", () => {
  it("primero avisa que está buscando y luego pinta el ticket", async () => {
    visitar(ID_DE_EJEMPLO);
    expect(screen.getByRole("status")).toHaveTextContent("Buscando el pedido");
    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Tu pedido" })).toBeInTheDocument();
  });

  it("si el pedido no existe, lo dice sin tratarlo como falla", async () => {
    visitar("00000000-0000-4000-8000-000000000000");
    expect(
      await screen.findByText("No encontramos ese pedido. Revisa el número."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("si la API falla, dice qué pasó y al reintentar vuelve a pedir", async () => {
    let veces = 0;
    servidor.use(
      http.get("*/v1/pedidos/:id", () => {
        veces++;
        return veces === 1
          ? problema(503, "PROVEEDOR_NO_DISPONIBLE")
          : HttpResponse.json(null, { status: 500 });
      }),
    );
    visitar(ID_DE_EJEMPLO);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No pudimos consultar el inventario",
    );

    await userEvent.setup().click(screen.getByRole("button", { name: "Reintentar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Algo salió mal de nuestro lado");
    expect(veces).toBe(2);
  });
});
