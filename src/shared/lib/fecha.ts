const fechaYHora = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Mexico_City",
});

/** Una fecha ISO de la API («2026-11-19T11:20:00Z»), como la lee una persona en México. */
export function formatearFecha(iso: string): string {
  return fechaYHora.format(new Date(iso));
}
