import type { ComponentType } from "react";
import type { RouteObject } from "react-router";
import { ErrorDeRuta } from "./ErrorDeRuta";
import { Marco } from "./Marco";

type Cargador = () => Promise<{ Component: ComponentType }>;

/**
 * Cómo se baja el código de cada pantalla. Cada una viaja en su propio pedazo y se pide
 * solo cuando alguien la visita. Las pruebas cambian estos cargadores para simular uno
 * que falla.
 */
export const cargadores: Record<"nuevoPedido" | "pedido" | "noEncontrada", Cargador> = {
  nuevoPedido: () =>
    import("../pages/NuevoPedidoPage").then((m) => ({ Component: m.NuevoPedidoPage })),
  pedido: () => import("../pages/PedidoPage").then((m) => ({ Component: m.PedidoPage })),
  noEncontrada: () =>
    import("../pages/NoEncontradaPage").then((m) => ({ Component: m.NoEncontradaPage })),
};

/**
 * Envuelve una pantalla en su propio límite de error (`ErrorBoundary`). El límite va un
 * nivel ARRIBA de la ruta que baja su código, en una ruta sin dirección propia: así atrapa
 * también la falla al bajar ese código. Medido con React Router 8.5.2: puesto en la misma
 * ruta que el `lazy`, el error queda registrado, pero la pantalla de respaldo no aparece.
 */
function conLimiteDeError(ruta: RouteObject): RouteObject {
  return { ErrorBoundary: ErrorDeRuta, children: [ruta] };
}

/** Las rutas. Si una pantalla truena, al bajar o al pintarse, el encabezado sigue ahí. */
export function crearRutas(cargar = cargadores): RouteObject[] {
  return [
    {
      path: "/",
      Component: Marco,
      ErrorBoundary: ErrorDeRuta,
      children: [
        conLimiteDeError({ index: true, lazy: cargar.nuevoPedido }),
        conLimiteDeError({ path: "pedidos/:id", lazy: cargar.pedido }),
        conLimiteDeError({ path: "*", lazy: cargar.noEncontrada }),
      ],
    },
  ];
}
