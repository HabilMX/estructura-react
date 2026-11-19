import { z } from "zod";

/**
 * Lo que la API contesta cuando algo sale mal: Problem Details (RFC 9457), con el campo
 * propio `error_code`. Solo se lee lo que la sala necesita: el código y el número de visita.
 */
export const esquemaDeProblema = z.looseObject({
  status: z.number().int().optional(),
  error_code: z.string().optional(),
  request_id: z.string().optional(),
});

/**
 * Lo que ve la persona, por código. Son frases fijas: el `detail` del backend nunca se
 * pinta, porque puede traer rutas, versiones o datos que no le sirven a quien compra.
 */
const mensajes: Record<string, string> = {
  PEDIDO_NO_ENCONTRADO: "No encontramos ese pedido.",
  PRODUCTO_NO_EXISTE: "Uno de los productos no existe. Revisa las claves.",
  SIN_EXISTENCIAS: "No hay piezas suficientes de uno de los productos.",
  SOLICITUD_INVALIDA: "Algunos datos del pedido no son válidos.",
  PROVEEDOR_NO_RESPONDE: "El inventario tardó en contestar. Intenta de nuevo en un momento.",
  PROVEEDOR_NO_DISPONIBLE: "No pudimos consultar el inventario. Intenta de nuevo en un momento.",
  SIN_RESPUESTA: "El servidor tardó demasiado en contestar. Intenta de nuevo.",
  SIN_CONEXION: "No pudimos conectar con el servidor. Revisa tu conexión.",
  RESPUESTA_INESPERADA: "El servidor contestó algo que no esperábamos.",
};

const mensajeGeneral = "Algo salió mal de nuestro lado. Intenta de nuevo.";

/** El mensaje para la persona; un código que no conocemos recibe el general. */
export function mensajeParaElUsuario(codigo: string): string {
  return mensajes[codigo] ?? mensajeGeneral;
}

/** Un error de la API, ya traducido a algo que la vista sabe pintar. */
export class ErrorDeApi extends Error {
  readonly codigo: string;
  readonly estado: number | undefined;
  /** El número de la visita, el mismo que registra el backend: con él se encuentra. */
  readonly idDeVisita: string;

  constructor(codigo: string, idDeVisita: string, estado?: number) {
    super(mensajeParaElUsuario(codigo));
    this.name = "ErrorDeApi";
    this.codigo = codigo;
    this.estado = estado;
    this.idDeVisita = idDeVisita;
  }
}
