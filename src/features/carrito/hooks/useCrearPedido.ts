import { useState } from "react";
import { ErrorDeApi, mensajeParaElUsuario } from "../../../shared/api/problema";
import type { Comanda } from "../schemas/comanda";
import { crearPedido } from "../services/crearPedido";

export type EstadoDelEnvio =
  { tipo: "listo-para-enviar" } | { tipo: "enviando" } | { tipo: "error"; mensaje: string };

/**
 * Manda la comanda y dice en qué va. Crear un pedido no se reintenta solo: si se repite,
 * podrían salir dos. Quien decide volver a intentarlo es la persona.
 */
export function useCrearPedido(alCrear: (id: string) => void) {
  const [estado, setEstado] = useState<EstadoDelEnvio>({ tipo: "listo-para-enviar" });

  async function enviar(comanda: Comanda) {
    setEstado({ tipo: "enviando" });
    try {
      const id = await crearPedido(comanda);
      setEstado({ tipo: "listo-para-enviar" });
      alCrear(id);
    } catch (error) {
      const mensaje = error instanceof ErrorDeApi ? error.message : mensajeParaElUsuario("");
      setEstado({ tipo: "error", mensaje });
    }
  }

  return { estado, enviar };
}
