import { Aviso } from "../../../shared/components/ui/Aviso";
import { Boton } from "../../../shared/components/ui/Boton";
import { usePedido } from "../hooks/usePedido";
import { TicketDelPedido } from "./TicketDelPedido";

/** La consulta de un pedido, con sus cuatro estados: cargando, listo, no existe y error. */
export function ConsultaDelPedido({ id }: { id: string }) {
  const { estado, reintentar } = usePedido(id);

  switch (estado.tipo) {
    case "cargando":
      return <Aviso>Buscando el pedido…</Aviso>;
    case "no-existe":
      return <Aviso>No encontramos ese pedido. Revisa el número.</Aviso>;
    case "error":
      return (
        <div className="pila">
          <Aviso tipo="error">{estado.mensaje}</Aviso>
          <Boton variante="secundario" onClick={reintentar}>
            Reintentar
          </Boton>
        </div>
      );
    case "listo":
      return <TicketDelPedido pedido={estado.pedido} />;
  }
}
