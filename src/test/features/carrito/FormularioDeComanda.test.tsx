import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FormularioDeComanda } from "../../../features/carrito/components/FormularioDeComanda";
import { HttpResponse, ID_DE_EJEMPLO, http, problema, servidor } from "../../comun/servidor";

function montar() {
  const alCrear = vi.fn();
  const usuario = userEvent.setup();
  render(<FormularioDeComanda alCrear={alCrear} />);
  return { alCrear, usuario };
}

async function llenar(usuario: ReturnType<typeof userEvent.setup>) {
  await usuario.type(screen.getByRole("textbox", { name: "Correo" }), "ana@ejemplo.mx");
  await usuario.type(screen.getByRole("textbox", { name: "Clave del producto" }), "TAZA-01");
}

describe("FormularioDeComanda", () => {
  it("con campos vacíos, señala cada error junto a su campo y no manda nada", async () => {
    let peticiones = 0;
    servidor.use(
      http.post("*/v1/pedidos", () => {
        peticiones++;
        return HttpResponse.json({}, { status: 201 });
      }),
    );
    const { usuario, alCrear } = montar();
    await usuario.click(screen.getByRole("button", { name: "Hacer el pedido" }));

    expect(screen.getByRole("textbox", { name: "Correo" })).toHaveAccessibleDescription(
      "Escribe un correo como ana@ejemplo.mx.",
    );
    expect(screen.getByRole("textbox", { name: "Clave del producto" })).toBeInvalid();
    expect(peticiones).toBe(0);
    expect(alCrear).not.toHaveBeenCalled();
  });

  it("manda la comanda y avisa el número del pedido creado", async () => {
    let recibido: unknown;
    servidor.use(
      http.post("*/v1/pedidos", async ({ request }) => {
        recibido = await request.json();
        return HttpResponse.json({ id: ID_DE_EJEMPLO }, { status: 201 });
      }),
    );
    const { usuario, alCrear } = montar();
    await llenar(usuario);
    await usuario.click(screen.getByRole("button", { name: "Hacer el pedido" }));

    await vi.waitFor(() => expect(alCrear).toHaveBeenCalledWith(ID_DE_EJEMPLO));
    expect(recibido).toEqual({
      correo: "ana@ejemplo.mx",
      lineas: [{ sku: "TAZA-01", cantidad: 1 }],
    });
  });

  it("mientras envía, el botón dice «Enviando…» y no se puede volver a tocar", async () => {
    servidor.use(http.post("*/v1/pedidos", () => new Promise<never>(() => {})));
    const { usuario } = montar();
    await llenar(usuario);
    await usuario.click(screen.getByRole("button", { name: "Hacer el pedido" }));

    expect(await screen.findByRole("button", { name: "Enviando…" })).toBeDisabled();
  });

  it("si la API lo rechaza, dice por qué y deja volver a intentar", async () => {
    servidor.use(http.post("*/v1/pedidos", () => problema(409, "SIN_EXISTENCIAS")));
    const { usuario, alCrear } = montar();
    await llenar(usuario);
    await usuario.click(screen.getByRole("button", { name: "Hacer el pedido" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("No hay piezas suficientes");
    expect(screen.getByRole("button", { name: "Hacer el pedido" })).toBeEnabled();
    expect(alCrear).not.toHaveBeenCalled();
  });

  it("al quitar un producto, los demás conservan lo que se escribió", async () => {
    const { usuario } = montar();
    await usuario.click(screen.getByRole("button", { name: "Agregar otro producto" }));
    const claves = screen.getAllByRole("textbox", { name: "Clave del producto" });
    await usuario.type(claves[0]!, "TAZA-01");
    await usuario.type(claves[1]!, "PLATO-02");

    await usuario.click(screen.getByRole("button", { name: "Quitar producto 1" }));

    const quedan = screen.getAllByRole("textbox", { name: "Clave del producto" });
    expect(quedan).toHaveLength(1);
    expect(quedan[0]).toHaveValue("PLATO-02");
  });
});
