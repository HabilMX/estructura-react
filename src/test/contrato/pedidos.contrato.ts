// La prueba de CONTRATO: le habla a la API de pedidos de verdad, no a la de mentira.
// No corre con «npm test»: necesita la API levantada (la plantilla estructura-quarkus, en el
// 8080). Se corre con «npm run contrato». Si la API cambia la forma de lo que contesta, los
// esquemas de zod lo detienen aquí, antes de que llegue a una pantalla.
import { describe, expect, it } from "vitest";
import { crearPedido } from "../../features/carrito/services/crearPedido";
import { buscarPedido } from "../../features/pedidos/services/buscarPedido";
import { ErrorDeApi, mensajeParaElUsuario } from "../../shared/api/problema";

async function errorDe(promesa: Promise<unknown>): Promise<ErrorDeApi> {
  const error = await promesa.then(
    () => undefined,
    (e: unknown) => e,
  );
  if (!(error instanceof ErrorDeApi)) throw new Error("se esperaba un ErrorDeApi");
  return error;
}

describe("contrato con la API de pedidos", () => {
  it("crea un pedido y su ticket pasa el esquema", async () => {
    const id = await crearPedido({
      correo: "ana@tienda.mx",
      lineas: [{ sku: "TAZA-01", cantidad: 2 }],
    });
    const pedido = await buscarPedido(id);
    expect(pedido.id).toBe(id);
    expect(pedido.lineas).toEqual([{ sku: "TAZA-01", cantidad: 2, precio_centavos: 4500 }]);
  });

  it("sin existencias: 409 con su código, y la frase fija para la persona", async () => {
    const error = await errorDe(
      crearPedido({ correo: "ana@tienda.mx", lineas: [{ sku: "TAZA-01", cantidad: 4 }] }),
    );
    expect([error.estado, error.codigo]).toEqual([409, "SIN_EXISTENCIAS"]);
    expect(mensajeParaElUsuario(error.codigo)).toBe(
      "No hay piezas suficientes de uno de los productos.",
    );
  });

  it("un producto que no existe: 422", async () => {
    const error = await errorDe(
      crearPedido({ correo: "ana@tienda.mx", lineas: [{ sku: "NOEXISTE-9", cantidad: 1 }] }),
    );
    expect([error.estado, error.codigo]).toEqual([422, "PRODUCTO_NO_EXISTE"]);
  });

  it("un pedido que no existe: 404", async () => {
    const error = await errorDe(buscarPedido("00000000-0000-4000-8000-000000000000"));
    expect([error.estado, error.codigo]).toEqual([404, "PEDIDO_NO_ENCONTRADO"]);
  });
});
