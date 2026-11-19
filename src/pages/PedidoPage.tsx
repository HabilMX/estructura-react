import { useParams } from "react-router";
import { ConsultaDelPedido } from "../features/pedidos/components/ConsultaDelPedido";
import { Pagina } from "../shared/components/ui/Pagina";

/** El ticket de un pedido. Con otro número en la dirección, la consulta empieza de cero. */
export function PedidoPage() {
  const { id = "" } = useParams();
  return (
    <Pagina titulo="Tu pedido">
      <ConsultaDelPedido key={id} id={id} />
    </Pagina>
  );
}
