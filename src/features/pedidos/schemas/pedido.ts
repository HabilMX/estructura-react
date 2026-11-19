import { z } from "zod";

/**
 * El ticket que devuelve la API (`GET /v1/pedidos/{id}`), tal como viaja: en snake_case y
 * con el dinero en centavos. El tipo `Pedido` sale de este esquema; no se escribe a mano.
 */
export const esquemaDePedido = z.object({
  id: z.uuid(),
  estado: z.string(),
  total_centavos: z.number().int().nonnegative(),
  creado_en: z.iso.datetime({ offset: true }),
  lineas: z
    .array(
      z.object({
        sku: z.string(),
        cantidad: z.number().int().positive(),
        precio_centavos: z.number().int().nonnegative(),
      }),
    )
    .min(1),
});

export type Pedido = z.infer<typeof esquemaDePedido>;
