import { useCallback, useEffect, useState } from "react";
import { ErrorDeApi } from "../../../shared/api/problema";
import type { Pedido } from "../schemas/pedido";
import { buscarPedido } from "../services/buscarPedido";

/** Los cuatro estados de una consulta. La vista pinta uno distinto para cada uno. */
export type EstadoDelPedido =
  | { tipo: "cargando" }
  | { tipo: "listo"; pedido: Pedido }
  | { tipo: "no-existe" }
  | { tipo: "error"; mensaje: string };

/**
 * Trae un pedido y dice en qué va la consulta. El efecto sincroniza con algo de fuera
 * (la API), que es para lo que existen los efectos; si la pantalla se cierra antes de la
 * respuesta, la petición se cancela.
 */
export function usePedido(id: string) {
  const [estado, setEstado] = useState<EstadoDelPedido>({ tipo: "cargando" });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const cancelar = new AbortController();
    buscarPedido(id, cancelar.signal).then(
      (pedido) => setEstado({ tipo: "listo", pedido }),
      (error: unknown) => {
        if (cancelar.signal.aborted) return;
        if (error instanceof ErrorDeApi && error.codigo === "PEDIDO_NO_ENCONTRADO") {
          setEstado({ tipo: "no-existe" });
        } else {
          const mensaje = error instanceof ErrorDeApi ? error.message : "Algo salió mal.";
          setEstado({ tipo: "error", mensaje });
        }
      },
    );
    return () => cancelar.abort();
  }, [id, intento]);

  const reintentar = useCallback(() => {
    setEstado({ tipo: "cargando" });
    setIntento((n) => n + 1);
  }, []);

  return { estado, reintentar };
}
