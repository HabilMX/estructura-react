// El presupuesto del bundle: lo que baja TODA visita, antes de abrir cualquier pantalla,
// no puede pasar del tope que fija presupuesto.json. Si pasa, sale con 1 y el build
// queda en rojo («npm run build» corre este guion después de «vite build»).
//
// Qué cuenta: los archivos que dist/index.html pide de entrada (sus <script src> y sus
// <link href>, incluidos los modulepreload). Los pedazos de cada pantalla, que se bajan
// solo al visitarla, no cuentan aquí. Cada archivo se mide comprimido con gzip, como
// viaja por la red.
//
// Por qué un guion propio y no una dependencia: son cuarenta líneas con la biblioteca
// de Node, y la cifra vive en un archivo versionado, que es lo que pide el estándar.
// La cifra y su porqué están en docs/ARCHITECTURE.md.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const raiz = new URL("..", import.meta.url).pathname;
const { entradaGzipKb } = JSON.parse(readFileSync(join(raiz, "presupuesto.json"), "utf8"));
if (typeof entradaGzipKb !== "number" || entradaGzipKb <= 0) {
  console.error("❌ presupuesto.json no trae un «entradaGzipKb» válido");
  process.exit(1);
}

let html;
try {
  html = readFileSync(join(raiz, "dist", "index.html"), "utf8");
} catch {
  console.error("❌ no existe dist/index.html: corre «vite build» antes");
  process.exit(1);
}

const rutas = [...html.matchAll(/(?:src|href)="\/(assets\/[^"]+\.(?:js|css))"/g)].map((m) => m[1]);
if (rutas.length === 0) {
  console.error("❌ dist/index.html no pide ningún archivo de assets/: no hay nada que medir");
  process.exit(1);
}

let total = 0;
for (const ruta of new Set(rutas)) {
  const kb = gzipSync(readFileSync(join(raiz, "dist", ruta))).length / 1000;
  total += kb;
  console.log(`   ${ruta}  ${kb.toFixed(2)} kB gzip`);
}

const resumen = `${total.toFixed(2)} kB de ${entradaGzipKb} kB`;
if (total > entradaGzipKb) {
  console.error(`❌ presupuesto rebasado: lo que baja toda visita pesa ${resumen}`);
  process.exit(1);
}
console.log(`✅ presupuesto: lo que baja toda visita pesa ${resumen}`);
