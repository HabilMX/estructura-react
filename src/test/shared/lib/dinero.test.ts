import { describe, expect, it } from "vitest";
import { formatearCentavos } from "../../../shared/lib/dinero";

describe("formatearCentavos", () => {
  it("convierte centavos en pesos con dos decimales", () => {
    expect(formatearCentavos(12345)).toBe("$123.45");
  });

  it("pinta el cero como cero pesos", () => {
    expect(formatearCentavos(0)).toBe("$0.00");
  });

  it("separa los miles con coma", () => {
    expect(formatearCentavos(123456789)).toBe("$1,234,567.89");
  });
});
