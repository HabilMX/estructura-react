import { describe, expect, it } from "vitest";
import { formatearFecha } from "../../../shared/lib/fecha";

describe("formatearFecha", () => {
  it("pinta la hora de la Ciudad de México, no la del servidor", () => {
    // 17:20 en UTC son las 11:20 en la Ciudad de México.
    expect(formatearFecha("2026-11-19T17:20:00Z")).toMatch(/11:20/);
  });
});
