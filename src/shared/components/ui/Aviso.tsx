import type { ReactNode } from "react";

interface Props {
  tipo?: "informacion" | "error";
  children: ReactNode;
}

/**
 * Un mensaje para la persona. El de error se anuncia en cuanto aparece (`role="alert"`);
 * el informativo, cuando el lector de pantalla termina lo que estaba diciendo.
 */
export function Aviso({ tipo = "informacion", children }: Props) {
  const esError = tipo === "error";
  return (
    <div role={esError ? "alert" : "status"} className={esError ? "aviso aviso--error" : "aviso"}>
      {children}
    </div>
  );
}
