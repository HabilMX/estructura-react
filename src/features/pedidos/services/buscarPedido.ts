import { pedirJson } from "../../../shared/api/cliente";
import { esquemaDePedido, type Pedido } from "../schemas/pedido";

/** Pide un pedido por su identificador. */
export function buscarPedido(id: string, senal?: AbortSignal): Promise<Pedido> {
  return pedirJson(`/v1/pedidos/${encodeURIComponent(id)}`, { esquema: esquemaDePedido, senal });
}
