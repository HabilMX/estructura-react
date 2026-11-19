import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";
import { NuevoPedidoPage } from "../../pages/NuevoPedidoPage";
import { PedidoPage } from "../../pages/PedidoPage";
import { ID_DE_EJEMPLO } from "../comun/servidor";

describe("NuevoPedidoPage", () => {
  it("al crear el pedido, lleva a la persona a su ticket", async () => {
    const rutas = createMemoryRouter(
      [
        { path: "/", Component: NuevoPedidoPage },
        { path: "/pedidos/:id", Component: PedidoPage },
      ],
      { initialEntries: ["/"] },
    );
    render(<RouterProvider router={rutas} />);
    const usuario = userEvent.setup();
    await usuario.type(screen.getByRole("textbox", { name: "Correo" }), "ana@ejemplo.mx");
    await usuario.type(screen.getByRole("textbox", { name: "Clave del producto" }), "TAZA-01");
    await usuario.click(screen.getByRole("button", { name: "Hacer el pedido" }));

    expect(await screen.findByRole("heading", { name: "Tu pedido" })).toBeInTheDocument();
    expect(rutas.state.location.pathname).toBe(`/pedidos/${ID_DE_EJEMPLO}`);
  });
});
