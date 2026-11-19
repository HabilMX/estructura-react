import { useNavigate } from "react-router";
import { FormularioDeComanda } from "../features/carrito/components/FormularioDeComanda";
import { Pagina } from "../shared/components/ui/Pagina";

/**
 * La página compone y nada más. El carrito avisa que creó un pedido; la página decide a
 * dónde ir. Así el carrito no sabe que existe la pantalla del ticket.
 */
export function NuevoPedidoPage() {
  const navegar = useNavigate();
  return (
    <Pagina titulo="Nuevo pedido">
      <FormularioDeComanda alCrear={(id) => navegar(`/pedidos/${id}`)} />
    </Pagina>
  );
}
