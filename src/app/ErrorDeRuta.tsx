import { Link } from "react-router";
import { Aviso } from "../shared/components/ui/Aviso";
import { Boton } from "../shared/components/ui/Boton";

/**
 * Lo que se ve si una pantalla falla al cargar o al pintarse. El encabezado sigue arriba,
 * y hay dos salidas: volver a intentarlo o regresar al inicio. Nunca la pantalla en blanco.
 *
 * El caso más común es que se publicó una versión nueva mientras la pestaña seguía
 * abierta: el pedazo de código que pedía la pantalla ya no existe en el servidor.
 * Recargar trae la versión nueva.
 */
export function ErrorDeRuta() {
  return (
    <div className="pila">
      <Aviso tipo="error">No pudimos mostrar esta pantalla.</Aviso>
      <Boton onClick={() => window.location.reload()}>Reintentar</Boton>
      <Link to="/">Volver al inicio</Link>
    </div>
  );
}
