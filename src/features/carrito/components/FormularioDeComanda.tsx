import { useRef, useState, type FormEvent } from "react";
import { Aviso } from "../../../shared/components/ui/Aviso";
import { Boton } from "../../../shared/components/ui/Boton";
import { Campo } from "../../../shared/components/ui/Campo";
import { useCrearPedido } from "../hooks/useCrearPedido";
import { esquemaDeComanda } from "../schemas/comanda";

interface Renglon {
  /** Identifica al renglón mientras vive en pantalla. Nace con él y no cambia. */
  clave: number;
  sku: string;
  cantidad: string;
}

type Errores = Record<string, string>;

/**
 * El formulario de la comanda: un correo y uno o más renglones de producto y piezas.
 * Valida con el esquema antes de mandar, y el error de cada campo aparece junto a él.
 * Cuando el pedido se crea, avisa con `alCrear`; qué pasa después lo decide la página.
 */
export function FormularioDeComanda({ alCrear }: { alCrear: (id: string) => void }) {
  const siguienteClave = useRef(1);
  const [correo, setCorreo] = useState("");
  const [renglones, setRenglones] = useState<Renglon[]>([{ clave: 0, sku: "", cantidad: "1" }]);
  const [errores, setErrores] = useState<Errores>({});
  const { estado, enviar } = useCrearPedido(alCrear);

  function cambiarRenglon(clave: number, cambio: Partial<Renglon>) {
    setRenglones((actuales) => actuales.map((r) => (r.clave === clave ? { ...r, ...cambio } : r)));
  }

  function agregarRenglon() {
    const clave = siguienteClave.current++;
    setRenglones((actuales) => [...actuales, { clave, sku: "", cantidad: "1" }]);
  }

  function quitarRenglon(clave: number) {
    setRenglones((actuales) => actuales.filter((r) => r.clave !== clave));
  }

  function alEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const leido = esquemaDeComanda.safeParse({
      correo,
      lineas: renglones.map(({ sku, cantidad }) => ({ sku, cantidad })),
    });
    if (!leido.success) {
      const nuevos: Errores = {};
      for (const problema of leido.error.issues) {
        const ruta = problema.path.join(".");
        nuevos[ruta] ??= problema.message;
      }
      setErrores(nuevos);
      return;
    }
    setErrores({});
    void enviar(leido.data);
  }

  const enviando = estado.tipo === "enviando";

  return (
    <form className="pila" onSubmit={alEnviar} noValidate aria-label="Nuevo pedido">
      <Campo
        etiqueta="Correo"
        type="email"
        autoComplete="email"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        error={errores["correo"]}
      />

      {renglones.map((renglon, posicion) => (
        <fieldset key={renglon.clave} className="renglon">
          <legend>Producto {posicion + 1}</legend>
          <Campo
            etiqueta="Clave del producto"
            value={renglon.sku}
            onChange={(e) => cambiarRenglon(renglon.clave, { sku: e.target.value })}
            error={errores[`lineas.${posicion}.sku`]}
          />
          <Campo
            etiqueta="Piezas"
            type="number"
            inputMode="numeric"
            min={1}
            max={99}
            value={renglon.cantidad}
            onChange={(e) => cambiarRenglon(renglon.clave, { cantidad: e.target.value })}
            error={errores[`lineas.${posicion}.cantidad`]}
          />
          {renglones.length > 1 && (
            <Boton variante="secundario" onClick={() => quitarRenglon(renglon.clave)}>
              Quitar producto {posicion + 1}
            </Boton>
          )}
        </fieldset>
      ))}

      <Boton variante="secundario" onClick={agregarRenglon}>
        Agregar otro producto
      </Boton>

      {estado.tipo === "error" && <Aviso tipo="error">{estado.mensaje}</Aviso>}

      <Boton type="submit" disabled={enviando}>
        {enviando ? "Enviando…" : "Hacer el pedido"}
      </Boton>
    </form>
  );
}
