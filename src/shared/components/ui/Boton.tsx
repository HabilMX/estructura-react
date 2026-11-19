import type { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: "principal" | "secundario";
}

/** El botón de la app. No sabe qué hace: lo que pasa al tocarlo llega por `onClick`. */
export function Boton({ variante = "principal", className, type = "button", ...resto }: Props) {
  const clases = ["boton", variante === "secundario" && "boton--secundario", className]
    .filter(Boolean)
    .join(" ");
  return <button type={type} className={clases} {...resto} />;
}
