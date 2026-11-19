import { z } from "zod";

/**
 * La comanda: lo que la persona pide. Las reglas son las mismas que revisa la API al
 * recibirla. Aquí sirven para avisar a tiempo; la API las vuelve a revisar, porque
 * cualquiera puede llamarla sin pasar por esta pantalla.
 */
export const esquemaDeRenglon = z.object({
  sku: z
    .string()
    .trim()
    .regex(/^[A-Z0-9-]{3,20}$/, "Escribe la clave en mayúsculas, como TAZA-01."),
  cantidad: z.coerce
    .number({ error: "Escribe cuántas piezas." })
    .int("Las piezas van sin decimales.")
    .min(1, "Pide al menos una pieza.")
    .max(99, "Son 99 piezas como máximo."),
});

export const esquemaDeComanda = z.object({
  correo: z.email("Escribe un correo como ana@ejemplo.mx.").max(254),
  lineas: z.array(esquemaDeRenglon).min(1).max(20, "Son 20 productos como máximo."),
});

export type Comanda = z.infer<typeof esquemaDeComanda>;

/** Lo que contesta la API al crear: aquí solo hace falta el número del pedido. */
export const esquemaDePedidoCreado = z.object({ id: z.uuid() });
