> El código es MIT; el texto y las explicaciones son CC BY-SA 4.0.

# estructura-react

**Una plantilla de React con TypeScript y Vite donde cada archivo vive donde se borraría**: una
carpeta por funcionalidad, lo compartido en `shared/`, páginas que solo componen, y un lint que se
pone rojo cuando una funcionalidad importa las tripas de otra, aunque TypeScript y Vite digan que
todo está bien.

Es una **semilla**, no un molde completo: trae dos funcionalidades reales de punta a punta (hacer un
pedido y consultar su ticket), sus pruebas y una frontera que sabe fallar. Lo demás crece cuando
duela, y la sección [«Cómo crece»](#cómo-crece-cuándo-agregar-cada-cosa) dice cuándo.

Es la última entrega de la serie «La estructura de un proyecto», de Hábil. Es la pantalla de la
tienda de pedidos cuya API arman las entregas 5 y 6; habla con la plantilla
[`estructura-quarkus`](https://github.com/HabilMX/estructura-quarkus). El curso que la acompaña es el
[curso de React](https://www.habil.mx/es/cursos/react/).

---

## Córrelo

Necesitas Node 26.13 o más nuevo (`node --version`), que ya trae `npm`, más Git y `bash`. Node 26 es
la línea LTS más reciente; con ella se probó la plantilla.

- **Linux Mint 22**: no uses `apt install nodejs`, que instala una versión vieja. Instala Node con
  `nvm`, como dice su README, abre otra terminal y pide la línea 26 (`nvm install 26`). La
  [lección 1 del curso de TypeScript](https://www.habil.mx/es/cursos/typescript/01-instalacion/) lo
  explica paso a paso. ⚠️ Esta plantilla **no se ha probado en Linux**: se midió en macOS. El CI la
  corre en Linux en cada cambio; si algo falla ahí, el rojo se ve en la pestaña Actions del
  repositorio.
- **macOS**: lo mismo, con `nvm`. El guion de la frontera funciona con el bash que trae el sistema
  (`/bin/bash`, la versión 3.2).
- **Windows**: usa WSL; el guion de la frontera pide `bash`.

**1. Instala las dependencias**, exactamente las de `package-lock.json`:

```bash
npm ci
```

**2. Revisa todo de una vez**:

```bash
npm run verificar
```

Son cinco pasos, en orden, y se para en el primero que falle: tipos (`tsc -b`), lint
(`eslint . --max-warnings 0`), formato (`prettier --check .`), pruebas (`vitest run`) y construcción
(`vite build` y, después, el presupuesto: ver [«El presupuesto y lo que todavía no trae el
CI»](#el-presupuesto-y-lo-que-todavía-no-trae-el-ci)). Las pruebas cierran con estas dos líneas:

```
 Test Files  11 passed (11)
      Tests  37 passed (37)
```

Son 37 pruebas en 11 archivos. **Cuéntalas en el informe, no en el código de salida.** Un archivo de
pruebas que no logra importar algo sale como `(0 test)` y el total baja sin que nada se ponga rojo
(medido). Y una prueba que vive fuera de `src/test/` ni siquiera se corre (ver «Errores comunes»). El
conteo exacto, en un archivo que se puede revisar:

```bash
npx vitest run --reporter=json --outputFile=reporte-suite.json
node -e 'const r=require("./reporte-suite.json"); console.log(r.numTotalTests, r.numPassedTests, r.numFailedTests)'
```

Contesta `37 37 0`.

**3. Comprueba la frontera**:

```bash
bash herramientas/probar-frontera.sh
```

Termina en `✅ frontera: se sostiene` (más abajo se explica qué hace).

**4. Levanta la API de pedidos.** Es la plantilla
[`estructura-quarkus`](https://github.com/HabilMX/estructura-quarkus); se midió con su commit
`33e89f5`. Necesitas Java 25. En una carpeta aparte, y en dos terminales:

```bash
git clone https://github.com/HabilMX/estructura-quarkus
cd estructura-quarkus
./mvnw package -DskipTests
jwebserver -b 127.0.0.1 -p 9090 -d "$PWD/ejemplo/inventario"   # terminal 1: el proveedor de inventario
java -jar target/quarkus-app/quarkus-run.jar                     # terminal 2: la API, en el 8080
```

**5. Comprueba el contrato** contra esa API, de vuelta en esta plantilla:

```bash
npm run contrato
```

Termina en `Tests  4 passed (4)`: el pedido se crea (`201`) y su ticket pasa el esquema de zod, y
los tres errores llegan con su código y su frase fija: `SIN_EXISTENCIAS` (409, «No hay piezas
suficientes de uno de los productos.»), `PRODUCTO_NO_EXISTE` (422) y `PEDIDO_NO_ENCONTRADO` (404).
Esa prueba vive en `src/test/contrato/` y no corre con `npm test`, porque necesita la API de verdad.
Sin la API, sus cuatro pruebas salen en rojo (medido). Corre siempre contra una API recién levantada:
el inventario de ejemplo trae 3 tazas, y cada corrida crea un pedido de 2.

**6. Úsalo**:

```bash
npm run dev
```

Abre `http://localhost:5173/`. Escribe un correo y un producto (`TAZA-01`, cantidad 2) y oprime
«Hacer el pedido»: la pantalla salta al ticket del pedido recién creado. El detalle que escribe el
servidor («De TAZA-01 se pidieron 4 y hay 3») se queda en su bitácora, junto al mismo `X-Request-ID`
que mandó la pantalla.

En desarrollo, el navegador le pide todo a Vite, en el 5173, y Vite le pasa a la API, en el 8080, lo
que empieza con `/v1` (el `server.proxy` de `vite.config.ts`). Para el navegador es un solo origen,
así que no hace falta configurar CORS. Si la API no está corriendo, Vite contesta `502` y la pantalla
dice «Algo salió mal de nuestro lado. Intenta de nuevo.», sin un solo detalle técnico (medido).

---

## Qué es cada carpeta y por qué existe

```
estructura-react/
├── package.json             scripts, versión de Node y dependencias
├── package-lock.json        las versiones exactas con que se probó: se versiona
├── tsconfig.json            solo «references»: no revisa nada por sí solo
├── tsconfig.app.json        el código de la aplicación, para el navegador
├── tsconfig.test.json       las pruebas, con los tipos de Testing Library
├── tsconfig.node.json       vite.config.ts, que corre en Node
├── vite.config.ts           el servidor de desarrollo, el proxy y la configuración de Vitest
├── eslint.config.js         las reglas del código y LAS FRONTERAS de la estructura
├── index.html               la única página HTML: monta src/app/main.tsx
├── .env.example             las variables de entorno, vacías: se copian a .env
├── sonar-project.properties qué es código y qué es prueba, para Sonar
├── presupuesto.json         el tope de lo que baja toda visita
├── docs/ARCHITECTURE.md     la estructura en una hoja: quién importa a quién
├── src/
│   ├── app/                 EL ARRANQUE: rutas, encabezado, límite de error
│   ├── pages/               una página por ruta; solo compone
│   ├── features/
│   │   ├── carrito/         hacer un pedido: formulario, su esquema y su llamada
│   │   └── pedidos/         consultar un pedido: ticket, su esquema y su llamada
│   ├── shared/
│   │   ├── components/ui/   botón, campo, aviso, página: sin negocio
│   │   ├── api/             el cliente HTTP y los errores traducidos
│   │   ├── lib/             dinero y fechas
│   │   └── config/          lo que se lee del entorno
│   ├── styles/              tokens de diseño y hoja base
│   └── test/                las pruebas, con el mismo árbol que src/ (y contrato/, contra la API)
├── herramientas/
│   ├── probar-frontera.sh   demuestra que el lint detiene un import que cruza una frontera
│   └── revisar-presupuesto.mjs  el build falla si lo que baja toda visita pasa del tope
└── .github/workflows/verificar.yml
```

**`src/features/`.** El corazón de la estructura. Una funcionalidad es algo que la tienda puede
nombrar: «hacer un pedido», «ver mi pedido». Cada una trae lo suyo en cuatro subcarpetas:
`components/` (lo que se pinta), `hooks/` (el estado de la pantalla), `services/` (la llamada a la
API) y `schemas/` (la forma de los datos, en zod). Si la tienda deja de vender por la web, borras
`features/carrito/` y su página, y nada más se rompe. **Una funcionalidad no importa nada de otra.**

**`src/pages/`.** Una página por ruta, y solo compone: junta funcionalidades con piezas de `ui/` y
decide a dónde navegar. No llama a la API ni escribe HTML suelto. `NuevoPedidoPage` le pasa al
formulario una función `alCrear`; el formulario avisa «creé el pedido», y la página navega. Por eso el
carrito no sabe que la pantalla del ticket existe.

**`src/shared/`.** Lo que usa más de una funcionalidad y no es de ninguna. `ui/` son las piezas
visuales: un `Boton` no sabe qué es un pedido. `api/cliente.ts` es el único lugar que llama a
`fetch`: le pone un plazo a cada llamada (8 segundos, con `AbortSignal.timeout`), un identificador
`X-Request-ID` para encontrar la visita en las bitácoras del servidor, y traduce cada error de la API
(Problem Details, con su `error_code`) a una frase fija para la persona. El texto que manda el
servidor nunca llega a la pantalla. `lib/` tiene funciones puras (dinero en pesos, fechas en la hora
de la Ciudad de México) y `config/` lee `VITE_API_URL`.

**`src/app/`.** El arranque. `rutas.tsx` baja el código de cada página solo cuando alguien la visita
(`lazy`): cada pantalla viaja en su propio pedazo de JavaScript. Y cada pantalla tiene su **límite de
error**: si su código no se pudo bajar, o truena al pintarse, el encabezado se queda, aparece «No
pudimos mostrar esta pantalla.», un botón «Reintentar» y un enlace para volver al inicio.

**`src/test/`.** Las pruebas, con el mismo árbol que `src/`: la de `shared/api/cliente.ts` está en
`src/test/shared/api/cliente.test.ts`. Vitest corre solo lo que está aquí (`test.include` en
`vite.config.ts`), y Sonar sabe que esto es prueba y no código (`sonar-project.properties`). Las
pruebas hablan con una API de mentira, armada con MSW en `src/test/comun/servidor.ts`: interceptan
`fetch` sin cambiar una línea del código. Una llamada que nadie declaró hace fallar la prueba
(`onUnhandledFrame: "error"`), así que ninguna sale a la red.

**Los tres `tsconfig`.** El código de la aplicación corre en el navegador; `vite.config.ts` corre en
Node; las pruebas necesitan además los tipos de Testing Library. Son tres programas, y `tsc -b` los
revisa todos. ⚠️ En la raíz, `tsc --noEmit` no revisa un solo archivo y sale en verde: el
`tsconfig.json` raíz solo trae `references` (medido). Por eso el script es `tsc -b`.

**¿Por qué revisar los tipos aparte, si Vite ya construye?** Porque Vite solo traduce TypeScript a
JavaScript: no revisa tipos. Lo dice su documentación y se midió: con
`export const total: number = "cien"`, `vite build` sale en verde y `tsc -b` en rojo con `TS2322`.

---

## La frontera que sabe fallar

Para TypeScript y para Vite, que el carrito importe el ticket de la funcionalidad de pedidos no tiene
nada de malo: compila y construye. Para esta estructura, sí. Quien vigila eso es ESLint, con
[`eslint-plugin-boundaries`](https://www.jsboundaries.dev/): cada carpeta de `src/` es un «elemento»
con un tipo, y `eslint.config.js` dice qué tipo puede importar a cuál. Lo que no está permitido, está
prohibido. La tabla completa está en [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

`herramientas/probar-frontera.sh` demuestra que esa regla existe de verdad. Trabaja en una copia
temporal del proyecto (tu carpeta no se toca):

1. **Control**, con el proyecto tal como está: tiene que compilar, construir y pasar el lint sin un
   error. Si no, el experimento está mal montado y para en rojo.
2. **Violación**: el carrito importa el ticket de pedidos.
3. **Violación**: un átomo de `ui/` importa el cliente de la API.
4. **Archivo suelto**: un archivo en `src/`, fuera de toda carpeta con papel.

Cada siembra tiene que **compilar y construir**, y el lint tiene que fallar con **un solo error**, de
la regla esperada, en el archivo sembrado. El resultado se lee del informe JSON de ESLint, no de su
código de salida. Ésta es la salida real:

```
1/4 control: el proyecto tal como está
   ✅ compiló, construyó y el lint revisó 38 archivos sin un error
2/4 violación: el carrito importa el ticket de la funcionalidad de pedidos
   ✅ compiló y construyó, y el lint falló con un solo error, en src/features/carrito/components/VistaPrevia.tsx:
     la funcionalidad carrito importa las tripas de pedidos: lo que comparten va en shared/, o lo junta una página
3/4 violación: un átomo de ui importa el cliente de la API
   ✅ compiló y construyó, y el lint falló con un solo error, en src/shared/components/ui/Boton.tsx:
     ui no puede importar de api: mira la tabla de quién importa a quién en docs/ARCHITECTURE.md
4/4 archivo suelto: un archivo en src/, fuera de toda carpeta con papel
   ✅ compiló y construyó, y el lint falló con un solo error, en src/Utilidades.ts:
     File does not match any file pattern and does not belong to any known element
✅ frontera: se sostiene (las tres siembras compilaron, construyeron y el lint las detuvo, cada una por su razón)
```

Y el guion sabe ponerse rojo. Se midió apagándole cada pieza a una copia: con la regla de
dependencias apagada, con las funcionalidades autorizadas a importarse entre sí, sin la regla de
archivos sueltos, con un cruce ya escrito en el proyecto y sin `node_modules`. Las cinco veces salió
con código `1`.

**Rómpelo tú.** Crea en el carrito una vista previa que reutilice el ticket:

```bash
cat > src/features/carrito/components/VistaPrevia.tsx <<'EOF'
import { TicketDelPedido } from "../../pedidos/components/TicketDelPedido";

export function VistaPrevia(props: Parameters<typeof TicketDelPedido>[0]) {
  return <TicketDelPedido {...props} />;
}
EOF
npm run typecheck && npm run build
npm run lint
```

Los tipos y la construcción terminan sin un error. El lint contesta:

```
src/features/carrito/components/VistaPrevia.tsx
  1:33  error  la funcionalidad carrito importa las tripas de pedidos: lo que comparten va en shared/, o lo junta una página  boundaries/dependencies

✖ 1 problem (1 error, 0 warnings)
```

**Regresa solo lo que tocaste.** El experimento creó un archivo y no cambió ninguno. Primero
compruébalo, y luego borra ese archivo, y ninguno más:

```bash
git status --short
rm -i src/features/carrito/components/VistaPrevia.tsx
npm run lint
```

`git status` enseña una sola línea, `?? src/features/carrito/components/VistaPrevia.tsx`; `rm -i`
pregunta antes de borrar. No uses un comando que limpie toda la carpeta: se llevaría también tus
notas.

---

## El presupuesto y lo que todavía no trae el CI

**Los tamaños de la construcción son una fotografía, no un presupuesto.** Una fotografía dice cuánto
pesa hoy; un presupuesto hace fallar el build cuando pesa de más. Esta plantilla trae tres candados y
le faltan dos.

| Candado                      | Qué hace                                                                                                       | Dónde                                                                                 | Medido                                                                                                               |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Presupuesto                  | Suma, comprimido con gzip, lo que `dist/index.html` pide de entrada, y sale en rojo si pasa de `entradaGzipKb` | `presupuesto.json`, `herramientas/revisar-presupuesto.mjs`, dentro de `npm run build` | `100.14 kB de 110 kB`. Con `@testing-library/dom` importado en el arranque: `132.67 kB de 110 kB` y el build en rojo |
| Auditoría de dependencias    | `npm audit --audit-level=high`                                                                                 | CI                                                                                    | `found 0 vulnerabilities`                                                                                            |
| Dos construcciones idénticas | Construye dos veces y compara la huella de cada archivo                                                        | CI                                                                                    | 8 archivos idénticos. Con una marca de tiempo metida en el código, salen distintas                                   |
| **Sonar**                    | Calidad y cobertura                                                                                            | **Falta en el CI.** Solo está `sonar-project.properties`                              | —                                                                                                                    |
| **Barrido de secretos**      | Que no se suba una llave                                                                                       | **Falta en el CI**                                                                    | —                                                                                                                    |

La cifra del tope y su porqué están en [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). El guion mide
con la biblioteca de Node (`zlib`), y da un poco menos que el resumen de Vite (99.38 kB contra 100.47
kB del mismo archivo): el tope se compara contra lo que mide el guion.

Antes de que un proyecto nacido de aquí vaya a producción, agrega los dos que faltan. Mientras tanto
son deuda declarada de la semilla, no algo que ya cumpla.

### Dos decisiones de la semilla que no son el destino final

Esta semilla enseña la frontera y los cuatro estados con dos llamadas. En un proyecto de producto, los
tipos del contrato se generan desde OpenAPI y el estado remoto se maneja con la caché que marca el
estándar (TanStack Query). Aquí usamos esquemas de zod y un hook solo porque la API de práctica, la de
`estructura-quarkus`, todavía no publica ese contrato, y porque el hook deja ver los cuatro estados sin
otra biblioteca encima. Es una limitación declarada, no el destino final: el OpenAPI de la API de
práctica es un pendiente de la plantilla de Quarkus.

Y una más, sobre las capas. Para esta app usamos `features/` y `shared/`, y la página importa directo
las piezas de `ui/`. El estándar de la casa tiene hoy una regla general `pages → sections → ui`:
mientras no se aclare por escrito si una app puede ir directo de página a `ui`, esta ruta es una
excepción documentada de la semilla, no una regla nueva para todos los proyectos.

---

## Errores comunes

Todos se midieron en esta plantilla, el 19-nov-2026.

| Error                                                              | Qué pasa                                                                                                                                                                                             | Cómo se evita                                                                                                                                                                                       |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Una funcionalidad importa un componente de otra                    | Compila, construye y pasa las pruebas. El día que alguien cambia ese componente para su pantalla, la otra cambia también                                                                             | La regla de `eslint.config.js`. La página junta las dos, o lo común sube a `shared/`                                                                                                                |
| Un alias `@/` declarado en `tsconfig` y en Vite, pero no en ESLint | `@/features/pedidos/...` desde el carrito **pasa el lint**: el plugin no sabe a qué archivo apunta, lo trata como biblioteca externa y no lo revisa. El mismo import con ruta relativa sí se detiene | Esta plantilla usa rutas relativas. Si agregas el alias, agrega también `eslint-import-resolver-typescript` (con él, el mismo import se detiene) y una siembra con alias en el guion de la frontera |
| Una prueba junto a su componente (`ui/Boton.test.tsx`)             | No se corre. Una prueba que siempre falla, escrita ahí, deja el total en `37 passed` y el código de salida en `0`                                                                                    | Las pruebas van en `src/test/`. Para encontrar las perdidas: `rg --files -g '*.test.*' src \| rg -v '^src/test/'`                                                                                   |
| El límite de error en la misma ruta que baja el código (`lazy`)    | Si el código de la pantalla no se puede bajar, el error queda registrado pero la pantalla se queda en blanco debajo del encabezado                                                                   | El límite va un nivel arriba, en una ruta sin dirección propia (`conLimiteDeError` en `rutas.tsx`). La prueba de `rutas.test.tsx` se pone roja si lo regresas                                       |
| Una opción vieja de MSW (`onUnhandledRequest`)                     | En la versión 3 se llama `onUnhandledFrame`. Con el nombre viejo, las pruebas siguen en verde y una llamada no declarada sale a la red sin aviso                                                     | `tsc -b` revisa también las pruebas y la detiene: `TS2353`                                                                                                                                          |
| Confiar en `vite build` para los tipos                             | Vite construye con un error de tipos adentro                                                                                                                                                         | `npm run typecheck`, antes de construir                                                                                                                                                             |

---

## Qué NO trae y por qué

| No trae                                                | Por qué                                                                                                                                                                     |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Un store global (Zustand)                              | Cada pantalla guarda su propio estado, y la URL guarda cuál pedido se ve. Cuando dos rutas necesiten el mismo estado, el estándar de la casa pide Zustand. Ver «Cómo crece» |
| Una biblioteca de estado del servidor (TanStack Query) | Decisión didáctica: el hook deja ver los cuatro estados. En un producto va TanStack Query (ver «Dos decisiones de la semilla»)                                              |
| Tipos generados desde OpenAPI                          | La API de práctica no publica un OpenAPI todavía. Los tipos salen de los esquemas de zod, que además validan cada respuesta. Es una limitación declarada                    |
| `sections/`                                            | Una aplicación agrupa por funcionalidad. Es una excepción documentada de la semilla (ver «Dos decisiones de la semilla»)                                                    |
| `index.ts` que reexportan una carpeta                  | Cada import dice de qué archivo viene. Vite recomienda evitarlos: obligan a cargar toda la carpeta para usar una pieza                                                      |
| Storybook, pruebas de punta a punta (Playwright)       | Fuera de la semilla. Ver «Cómo crece»                                                                                                                                       |
| Reintento automático al hacer un pedido                | Si el pedido sí llegó y se perdió la respuesta, reintentar lo crearía dos veces. La persona decide                                                                          |
| `utils/`, `helpers/`, `common/`                        | Un nombre que no dice qué hay adentro se vuelve el cajón donde cae todo. `shared/lib/dinero.ts` dice lo que hace                                                            |
| oxlint, que trae la plantilla oficial de Vite          | Es más rápido, pero la frontera de esta plantilla la pone un plugin de ESLint                                                                                               |

---

## Cómo crece: cuándo agregar cada cosa

| Cuando…                                                                   | Agrega…                                                                                                                         | Y deja…                                                           |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| La tienda nombra algo nuevo («devolver un pedido»)                        | `features/devoluciones/`, su página y su ruta en `rutas.tsx`                                                                    | las otras funcionalidades sin tocar                               |
| Dos funcionalidades necesitan el mismo código                             | ese código en `shared/`, con un nombre que diga qué hace                                                                        | si solo se parecen y cada una puede cambiar por su lado, la copia |
| Dos rutas necesitan el mismo estado (la sesión, el carrito que sobrevive) | Zustand, en la funcionalidad dueña de ese estado                                                                                | el estado de una sola pantalla en su hook                         |
| Varias pantallas piden los mismos datos                                   | TanStack Query                                                                                                                  | `shared/api/cliente.ts` como el único que llama a `fetch`         |
| La API publica su OpenAPI                                                 | tipos generados desde él                                                                                                        | zod en la orilla, para validar lo que llega                       |
| Las piezas de `ui/` se usan en otro proyecto                              | una biblioteca de componentes, con su Storybook                                                                                 | las piezas sin negocio                                            |
| Quieres un alias `@/`                                                     | el alias en `tsconfig.app.json` y en Vite, `eslint-import-resolver-typescript`, y una siembra con alias en `probar-frontera.sh` | la frontera, que tiene que seguir en rojo con el alias            |
| El paquete principal crece de más                                         | primero, la razón; si es legítimo, sube el tope de `presupuesto.json` y su porqué en `docs/ARCHITECTURE.md`                     | la carga diferida de cada pantalla                                |
| El proyecto va a producción                                               | Sonar y el barrido de secretos en el CI                                                                                         | los candados que ya trae                                          |

Regla para decidir: **una carpeta o una dependencia nueva tiene que resolver un problema que ya
tienes**. Si no puedes decir cuál, todavía no la necesitas.

---

## Cómo quitar el ejemplo

1. En `package.json`, cambia `name` y `description`.
2. Borra `src/features/carrito/` y `src/features/pedidos/`, sus páginas en `src/pages/` y sus pruebas
   en `src/test/`. Escribe tus funcionalidades con la misma forma.
3. En `src/app/rutas.tsx`, cambia los cargadores y las rutas por las tuyas, cada una con
   `conLimiteDeError`.
4. Cambia los mensajes de `src/shared/api/problema.ts` por los códigos de error de tu API.
5. En `herramientas/probar-frontera.sh`, cambia las siembras por archivos tuyos: dos funcionalidades
   que existan.
6. Corre `npm run verificar && bash herramientas/probar-frontera.sh`.
7. Reescribe este README y `docs/ARCHITECTURE.md`. El código y `LICENSE` son MIT; si conservas el
   texto de los `.md`, mira `LICENSE-CONTENIDO.md`.

---

## Versiones

Medidas el 19 de noviembre de 2026 con `npm view <paquete> version`: la estable más reciente de cada
una ese día.

| Pieza               | Versión                                                                                                                                                                                                                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node                | `"engines": ">=26.13.0"`, la primera LTS de la línea 26. Probado con 26.13.1 y npm 11.20.0, en macOS arm64. **En Linux no se ha probado**; el CI está escrito para correrla ahí                                                                                                          |
| React               | `react` y `react-dom` 19.3.1, `react-router` 8.5.2                                                                                                                                                                                                                                       |
| Datos               | `zod` 4.6.7                                                                                                                                                                                                                                                                              |
| Construcción        | `vite` 8.3.8, `@vitejs/plugin-react` 6.3.0                                                                                                                                                                                                                                               |
| TypeScript          | 7.0.2 (el paquete `@typescript/native`), que da el comando `tsc`. TypeScript 7 todavía no expone la API que typescript-eslint usa para analizar TypeScript: por eso `typescript` apunta a `@typescript/typescript6` 6.0.2, como recomienda el anuncio de TypeScript 7                    |
| Pruebas             | `vitest` 5.1.1, `jsdom` 31.0.1, `@testing-library/react` 16.3.3, `@testing-library/dom` 10.4.2, `@testing-library/user-event` 14.6.13, `@testing-library/jest-dom` 8.0.0, `msw` 3.0.7                                                                                                    |
| Lint y formato      | `eslint` 10.15.0, `typescript-eslint` 8.73.0, `eslint-plugin-react-hooks` 7.1.1, `eslint-plugin-boundaries` 7.4.4, `prettier` 3.10.1                                                                                                                                                     |
| `npm audit`         | `found 0 vulnerabilities`, también con `--audit-level=high`                                                                                                                                                                                                                              |
| Construcción medida | El pedazo que baja toda visita pesa 318 kB, 100.47 kB comprimido según Vite. Las dos pantallas salen en pedazos aparte: el formulario 3.12 kB y el ticket 2.62 kB; el cliente con zod, compartido, 85.54 kB. Al agregar una ruta, vuelve a medir: los pedazos compartidos pueden cambiar |
| CI                  | GitHub Actions: `actions/checkout@v7` y `actions/setup-node@v7`, con la LTS más reciente y con 26.13.0 en Linux, y la LTS en macOS con `/bin/bash`; corre en cada cambio, a mano y cada lunes. GitHub apaga la corrida de los lunes si el repositorio público pasa 60 días sin actividad |

---

## Licencia

El código es [MIT](LICENSE). El texto y las explicaciones son
[CC BY-SA 4.0](LICENSE-CONTENIDO.md).
