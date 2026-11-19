/**
 * El dinero viaja en centavos (un número entero) y solo se vuelve texto al pintarse.
 * Así no hay decimales que se redondeen mal en el camino.
 */
const pesos = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

/** 12345 → «$123.45». */
export function formatearCentavos(centavos: number): string {
  return pesos.format(centavos / 100);
}
