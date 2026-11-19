# La estructura, en una hoja

Una regla manda sobre todas: **un archivo vive donde se borraría**. Si mañana la tienda deja de
tomar pedidos por la web, borras `src/features/carrito/` y su página, y nada más se rompe.

## Las carpetas de `src/`

| Carpeta                 | Su papel                                                                                            | Lo que NUNCA va ahí                               |
| ----------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `app/`                  | El arranque: monta las rutas, el encabezado y el límite de error de cada pantalla                   | Reglas del negocio, llamadas a la API             |
| `pages/`                | Una página por ruta. **Compone**: junta funcionalidades y piezas de `ui/`, y decide a dónde navegar | HTML suelto, `fetch`, estado que no sea de la URL |
| `features/<nombre>/`    | Una funcionalidad completa: sus componentes, sus hooks, sus llamadas a la API y sus esquemas        | Nada de otra funcionalidad                        |
| `shared/components/ui/` | Las piezas visuales sin negocio: botón, campo, aviso, página                                        | Llamadas a la API, nombres del negocio            |
| `shared/api/`           | El cliente HTTP: plazo, identificador de la visita, errores traducidos                              | Componentes, reglas de una funcionalidad          |
| `shared/lib/`           | Funciones puras que usa más de una funcionalidad: dinero, fechas                                    | Nada que hable con la red                         |
| `shared/config/`        | Lo que se lee del entorno (`VITE_API_URL`), en un solo lugar                                        | Secretos: todo lo de aquí viaja al navegador      |
| `styles/`               | Los tokens de diseño y la hoja base                                                                 | Estilos de una sola pantalla                      |
| `test/`                 | Las pruebas, con el mismo árbol que `src/`                                                          | Código que use la aplicación                      |

Dentro de una funcionalidad, cuatro subcarpetas, y solo las que hagan falta:

| Subcarpeta    | Qué guarda                                                                  |
| ------------- | --------------------------------------------------------------------------- |
| `components/` | Lo que se pinta                                                             |
| `hooks/`      | El estado de la pantalla y su ciclo: cargando, listo, error                 |
| `services/`   | La llamada a la API, con su esquema                                         |
| `schemas/`    | La forma de los datos, en zod: valida lo que entra y de ahí salen los tipos |

## Quién importa a quién

Lo que no está en esta tabla está prohibido, y el lint lo detiene (`eslint.config.js`).

| Desde ↓ puede importar → | `pages` | `features`   | `ui` | `api` | `lib` | `config` | `styles` |
| ------------------------ | ------- | ------------ | ---- | ----- | ----- | -------- | -------- |
| `app`                    | ✅      | —            | ✅   | —     | ✅    | ✅       | ✅       |
| `pages`                  | —       | ✅           | ✅   | —     | ✅    | —        | —        |
| `features/x`             | —       | **solo `x`** | ✅   | ✅    | ✅    | ✅       | —        |
| `ui`                     | —       | —            | —    | —     | ✅    | —        | —        |
| `api`                    | —       | —            | —    | —     | ✅    | ✅       | —        |
| `test`                   | ✅      | ✅           | ✅   | ✅    | ✅    | ✅       | ✅       |

Las bibliotecas de `node_modules` (React, React Router, zod) no son parte de esta tabla: cualquier
carpeta las puede importar.

## Cuando dos funcionalidades necesitan lo mismo

- **Si las dos se muestran en una pantalla**, las junta la página: `PedidoPage` puede pintar la
  consulta del pedido y el formulario del carrito, uno debajo del otro. Ninguna de las dos sabe que la
  otra existe.
- **Si las dos necesitan el mismo código**, ese código sube a `shared/`, con un nombre que diga qué
  hace (`shared/lib/dinero.ts`), y se queda sin nada del negocio de ninguna.
- **Si comparten la razón de cambio** (cuando una cambia, la otra tiene que cambiar igual), se juntan
  ya, aunque sean solo dos.
- **Si solo se parecen**, se tolera la copia mientras cada una pueda cambiar por su lado. Dos copias se
  pueden separar mañana sin romper a nadie; una abstracción a la fuerza, no.
- **A la tercera copia, la decisión se escribe**: aquí o en la descripción del cambio, se dice si se
  juntan o por qué siguen separadas. Escribirla no obliga a subirla a `shared/`.

## El presupuesto

**Lo que baja toda visita, antes de abrir cualquier pantalla, no pasa de 110 kB comprimido con gzip.**
La cifra vive en `presupuesto.json` y la revisa `herramientas/revisar-presupuesto.mjs` al final de
`npm run build`: si pasa, el build sale en rojo.

Por qué 110: el 19-nov-2026 ese pedazo pesó 100.14 kB (React, React Router y el arranque), y el tope
deja unos 10 kB de holgura. Alcanza para agregar código propio al arranque, y no alcanza para meter
una biblioteca entera sin darse cuenta: importar `@testing-library/dom` en el arranque lo llevó a
132.67 kB y el build salió en rojo. Las pantallas no cuentan, porque viajan en pedazos aparte que se
bajan solo al visitarlas.

Si un día hace falta subirlo, se sube aquí y en `presupuesto.json` a la vez, con la razón. Las dos
cifras tienen que ser la misma.

## El camino de un pedido

```
NuevoPedidoPage ─compone→ FormularioDeComanda (features/carrito)
                              │ valida con esquemaDeComanda (zod)
                              ▼
                          useCrearPedido → crearPedido → pedirJson (shared/api) → POST /v1/pedidos
                              │ avisa «creé el pedido id»
                              ▼
NuevoPedidoPage ─navega→ /pedidos/:id
PedidoPage ─compone→ ConsultaDelPedido (features/pedidos)
                              │ usePedido → buscarPedido → pedirJson → GET /v1/pedidos/{id}
                              ▼                                       valida con esquemaDePedido
                          TicketDelPedido
```

El carrito no navega: avisa. La página decide a dónde ir. Así el carrito no sabe que la pantalla del
ticket existe, y la puedes mover o borrar sin tocarlo.
