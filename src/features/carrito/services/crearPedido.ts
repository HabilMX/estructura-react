import { pedirJson } from "../../../shared/api/cliente";
import { esquemaDePedidoCreado, type Comanda } from "../schemas/comanda";

/** Manda la comanda y devuelve el número del pedido creado. */
export async function crearPedido(comanda: Comanda): Promise<string> {
  const creado = await pedirJson("/v1/pedidos", {
    metodo: "POST",
    cuerpo: comanda,
    esquema: esquemaDePedidoCreado,
  });
  return creado.id;
}
