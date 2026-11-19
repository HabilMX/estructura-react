import { describe, expect, it } from "vitest";
import { esquemaDePedido } from "../../../features/pedidos/schemas/pedido";
import { pedidoDeEjemplo } from "../../comun/servidor";

describe("esquemaDePedido", () => {
  it("acepta el ticket tal como lo contesta la API", () => {
    expect(esquemaDePedido.safeParse(pedidoDeEjemplo).success).toBe(true);
  });

  it("rechaza el total con decimales: el dinero viaja en centavos enteros", () => {
    expect(esquemaDePedido.safeParse({ ...pedidoDeEjemplo, total_centavos: 470.5 }).success).toBe(
      false,
    );
  });

  it("rechaza el ticket en camelCase: la API lo manda en snake_case", () => {
    const { total_centavos, ...resto } = pedidoDeEjemplo;
    expect(esquemaDePedido.safeParse({ ...resto, totalCentavos: total_centavos }).success).toBe(
      false,
    );
  });
});
