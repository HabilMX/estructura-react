import { describe, expect, it } from "vitest";
import { esquemaDeComanda } from "../../../features/carrito/schemas/comanda";

const buena = { correo: "ana@ejemplo.mx", lineas: [{ sku: "TAZA-01", cantidad: "2" }] };

describe("esquemaDeComanda", () => {
  it("acepta una comanda bien llenada y convierte las piezas en número", () => {
    const leido = esquemaDeComanda.parse(buena);
    expect(leido.lineas[0]).toEqual({ sku: "TAZA-01", cantidad: 2 });
  });

  it("rechaza una clave en minúsculas", () => {
    const leido = esquemaDeComanda.safeParse({
      ...buena,
      lineas: [{ sku: "taza-01", cantidad: "1" }],
    });
    expect(leido.success).toBe(false);
  });

  it("rechaza cero piezas y más de 99", () => {
    for (const cantidad of ["0", "100"]) {
      const leido = esquemaDeComanda.safeParse({
        ...buena,
        lineas: [{ sku: "TAZA-01", cantidad }],
      });
      expect(leido.success).toBe(false);
    }
  });

  it("rechaza un correo que no es correo", () => {
    expect(esquemaDeComanda.safeParse({ ...buena, correo: "ana" }).success).toBe(false);
  });
});
