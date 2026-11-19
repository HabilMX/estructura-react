// La configuración de ESLint. Hace dos trabajos:
//
// 1. Revisa el código como cualquier proyecto de React con TypeScript: las reglas
//    recomendadas de JavaScript y de TypeScript, y las de los hooks de React.
// 2. Vigila la ESTRUCTURA: quién puede importar a quién. Eso es lo que el compilador
//    no ve. Para TypeScript y para Vite, que una funcionalidad importe las tripas de
//    otra no es un error: compila y construye. Para esta configuración, sí.
//
// Las fronteras las pone eslint-plugin-boundaries. Cada carpeta de src/ es un
// «elemento» con un tipo, y abajo se escribe qué tipo puede importar a cuál. Lo que
// no está permitido, está prohibido.

import js from "@eslint/js";
import boundaries from "eslint-plugin-boundaries";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig(
  { ignores: ["dist/", "coverage/", "node_modules/"] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
    plugins: { "react-hooks": reactHooks },
    rules: {
      // Los hooks solo en el nivel superior, y cada efecto con todas sus dependencias.
      // El preset deja la segunda en «warn»; aquí es error, como pide la casa.
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },

  // Los guiones de herramientas/ corren en Node, no en el navegador.
  {
    files: ["herramientas/**/*.mjs"],
    languageOptions: { globals: globals.node },
  },

  // --- La estructura ---------------------------------------------------------
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      // Para saber a qué archivo apunta cada import, el plugin lo resuelve como Node,
      // probando estas extensiones.
      "import/resolver": {
        node: { extensions: [".ts", ".tsx"] },
      },
      // Cada carpeta, con su papel. Un archivo que no cae en ninguna es un error
      // (boundaries/no-unknown-files): en esta estructura no hay archivos sueltos.
      "boundaries/elements": [
        { type: "app", pattern: "src/app", partialMatch: false },
        { type: "pagina", pattern: "src/pages", partialMatch: false },
        {
          type: "funcionalidad",
          pattern: "src/features/*",
          partialMatch: false,
          capture: ["nombre"],
        },
        { type: "ui", pattern: "src/shared/components/ui", partialMatch: false },
        { type: "api", pattern: "src/shared/api", partialMatch: false },
        { type: "lib", pattern: "src/shared/lib", partialMatch: false },
        { type: "config", pattern: "src/shared/config", partialMatch: false },
        { type: "estilos", pattern: "src/styles", partialMatch: false },
        { type: "prueba", pattern: "src/test", partialMatch: false },
      ],
    },
    rules: {
      ...boundaries.configs.strict.rules,
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          message:
            "{{ from.element.types.[0] }} no puede importar de {{ to.element.types.[0] }}: mira la tabla de quién importa a quién en docs/ARCHITECTURE.md",
          policies: [
            // El arranque monta las rutas: conoce las páginas y lo compartido.
            {
              from: { element: { type: "app" } },
              allow: { to: { element: { types: ["pagina", "ui", "lib", "config", "estilos"] } } },
            },
            // Una página compone funcionalidades con piezas de ui. No llama a la API.
            {
              from: { element: { type: "pagina" } },
              allow: { to: { element: { types: ["funcionalidad", "ui", "lib"] } } },
            },
            // Una funcionalidad usa lo compartido. A otra funcionalidad, NUNCA: los
            // imports dentro de la misma funcionalidad no cruzan ninguna frontera.
            {
              from: { element: { type: "funcionalidad" } },
              allow: { to: { element: { types: ["ui", "api", "lib", "config"] } } },
            },
            // La regla que más cuesta romper sin darse cuenta, con su propio mensaje.
            {
              from: { element: { type: "funcionalidad" } },
              disallow: { to: { element: { type: "funcionalidad" } } },
              message:
                "la funcionalidad {{ from.element.captured.nombre }} importa las tripas de {{ to.element.captured.nombre }}: lo que comparten va en shared/, o lo junta una página",
            },
            // Un átomo de ui no sabe nada del negocio: ni API ni funcionalidades.
            {
              from: { element: { type: "ui" } },
              allow: { to: { element: { types: ["lib"] } } },
            },
            // El cliente de la API lee la configuración y nada más.
            {
              from: { element: { type: "api" } },
              allow: { to: { element: { types: ["config", "lib"] } } },
            },
            // Las pruebas pueden importar cualquier cosa de src/.
            {
              from: { element: { type: "prueba" } },
              allow: { to: { element: { types: ["*"] } } },
            },
          ],
        },
      ],
    },
  },
);
