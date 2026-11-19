import { Aviso } from "../shared/components/ui/Aviso";
import { Pagina } from "../shared/components/ui/Pagina";

export function NoEncontradaPage() {
  return (
    <Pagina titulo="Esta página no existe">
      <Aviso>Revisa la dirección o vuelve al inicio.</Aviso>
    </Pagina>
  );
}
