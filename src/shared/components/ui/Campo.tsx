import { useId, type InputHTMLAttributes } from "react";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  etiqueta: string;
  /** El error de este campo, si lo hay. Se anuncia junto con el campo. */
  error?: string;
}

/**
 * Un campo de formulario con su etiqueta y su error, amarrados: el lector de pantalla
 * dice «Correo, inválido, escribe un correo como ana@ejemplo.mx» de un jalón.
 */
export function Campo({ etiqueta, error, ...resto }: Props) {
  const id = useId();
  const idDelError = `${id}-error`;
  return (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}</label>
      <input
        id={id}
        className="campo__control"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? idDelError : undefined}
        {...resto}
      />
      {error && (
        <span id={idDelError} className="campo__error">
          {error}
        </span>
      )}
    </div>
  );
}
