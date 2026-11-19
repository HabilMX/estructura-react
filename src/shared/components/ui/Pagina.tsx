import type { ReactNode } from "react";

interface Props {
  titulo: string;
  children: ReactNode;
}

/** El acomodo de una pantalla: su título y, debajo, lo que la página compone. */
export function Pagina({ titulo, children }: Props) {
  return (
    <section className="pagina pila" aria-labelledby="titulo-de-la-pagina">
      <h1 id="titulo-de-la-pagina" className="pagina__titulo">
        {titulo}
      </h1>
      {children}
    </section>
  );
}
