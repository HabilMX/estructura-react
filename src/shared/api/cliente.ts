import type { z } from "zod";
import { plazoDeLaApiMs, urlDeLaApi } from "../config/entorno";
import { ErrorDeApi, esquemaDeProblema } from "./problema";

/**
 * El único lugar de la app que habla por HTTP con la API de pedidos. Cuatro cuidados que
 * nadie más tiene que recordar:
 *
 * 1. Cada petición lleva su `X-Request-ID`, que nace aquí, en el navegador: con él se
 *    sigue la visita de punta a punta.
 * 2. Cada petición tiene plazo. Ninguna espera para siempre.
 * 3. La respuesta se valida con su esquema antes de entrar a la app: un tipo de TypeScript
 *    no existe al correr, y lo que llega por la red puede traer cualquier cosa.
 * 4. Un error sale como `ErrorDeApi`, con un mensaje fijo para la persona.
 */

interface Opciones<T> {
  metodo?: "GET" | "POST";
  cuerpo?: unknown;
  esquema: z.ZodType<T>;
  /** Para cancelar desde fuera (una pantalla que se cierra antes de la respuesta). */
  senal?: AbortSignal;
  plazoMs?: number;
}

export async function pedirJson<T>(ruta: string, opciones: Opciones<T>): Promise<T> {
  const idDeVisita = crypto.randomUUID();
  const plazo = AbortSignal.timeout(opciones.plazoMs ?? plazoDeLaApiMs);
  const senal = opciones.senal ? AbortSignal.any([plazo, opciones.senal]) : plazo;
  const base = urlDeLaApi || window.location.origin;

  let respuesta: Response;
  try {
    respuesta = await fetch(new URL(ruta, base), {
      method: opciones.metodo ?? "GET",
      headers: {
        Accept: "application/json",
        "X-Request-ID": idDeVisita,
        ...(opciones.cuerpo === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: opciones.cuerpo === undefined ? undefined : JSON.stringify(opciones.cuerpo),
      signal: senal,
    });
  } catch (causa) {
    // Si cancelaron desde fuera, no es un error que pintar: se deja pasar tal cual.
    if (opciones.senal?.aborted) throw causa;
    const codigo = plazo.aborted ? "SIN_RESPUESTA" : "SIN_CONEXION";
    throw new ErrorDeApi(codigo, idDeVisita);
  }

  const cuerpo: unknown = await respuesta.json().catch(() => undefined);

  if (!respuesta.ok) {
    const problema = esquemaDeProblema.safeParse(cuerpo);
    const codigo = (problema.success && problema.data.error_code) || "ERROR_INTERNO";
    throw new ErrorDeApi(codigo, idDeVisita, respuesta.status);
  }

  const leido = opciones.esquema.safeParse(cuerpo);
  if (!leido.success) {
    throw new ErrorDeApi("RESPUESTA_INESPERADA", idDeVisita, respuesta.status);
  }
  return leido.data;
}
