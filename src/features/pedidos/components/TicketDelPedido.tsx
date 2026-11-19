import { formatearCentavos } from "../../../shared/lib/dinero";
import { formatearFecha } from "../../../shared/lib/fecha";
import type { Pedido } from "../schemas/pedido";

/** El ticket: qué se pidió, a cuánto y el total. Solo pinta lo que recibe. */
export function TicketDelPedido({ pedido }: { pedido: Pedido }) {
  return (
    <article className="pila" aria-label="Ticket del pedido">
      <p>
        Estado: <strong>{pedido.estado}</strong> · {formatearFecha(pedido.creado_en)}
      </p>
      <table className="tabla">
        <thead>
          <tr>
            <th scope="col">Producto</th>
            <th scope="col">Piezas</th>
            <th scope="col">Precio</th>
          </tr>
        </thead>
        <tbody>
          {pedido.lineas.map((linea) => (
            <tr key={linea.sku}>
              <td>{linea.sku}</td>
              <td>{linea.cantidad}</td>
              <td>{formatearCentavos(linea.precio_centavos)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Total: <strong>{formatearCentavos(pedido.total_centavos)}</strong>
      </p>
    </article>
  );
}
