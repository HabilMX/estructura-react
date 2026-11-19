import { http, HttpResponse } from "msw/http";
import { setupServer } from "msw/node";

/**
 * Una API de pedidos de mentira, para las pruebas. MSW atrapa las peticiones a la red y
 * contesta lo que aquí se declara: el código de la app no sabe que no es la de verdad, y
 * el cliente HTTP corre completo.
 */

export const ID_DE_EJEMPLO = "0b8f7a52-3c1e-4f7e-9a59-6d2b1c9e4a10";

export const pedidoDeEjemplo = {
  id: ID_DE_EJEMPLO,
  estado: "CREADO",
  total_centavos: 47000,
  creado_en: "2026-11-19T17:20:00Z",
  lineas: [
    { sku: "TAZA-01", cantidad: 2, precio_centavos: 18500 },
    { sku: "PLATO-02", cantidad: 1, precio_centavos: 10000 },
  ],
};

/** Un error como los que contesta la API: Problem Details con `error_code`. */
export function problema(status: number, codigo: string, detalle = "detalle interno") {
  return HttpResponse.json(
    {
      type: `https://pedidos.example/errors/${codigo.toLowerCase()}`,
      status,
      detail: detalle,
      error_code: codigo,
    },
    { status, headers: { "Content-Type": "application/problem+json" } },
  );
}

/** Lo que contesta la API si la prueba no dice otra cosa. */
export const servidor = setupServer(
  http.get("*/v1/pedidos/:id", ({ params }) =>
    params["id"] === ID_DE_EJEMPLO
      ? HttpResponse.json(pedidoDeEjemplo)
      : problema(404, "PEDIDO_NO_ENCONTRADO"),
  ),
  http.post("*/v1/pedidos", () => HttpResponse.json(pedidoDeEjemplo, { status: 201 })),
);

export { http, HttpResponse };
