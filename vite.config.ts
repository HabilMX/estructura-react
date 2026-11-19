import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Una sola configuración para construir, para el servidor de desarrollo y para las pruebas.
export default defineConfig({
  plugins: [react()],
  server: {
    // En desarrollo, lo que empieza con /v1 se lo pasa a la API de pedidos (la plantilla de
    // Quarkus o la de Spring Boot de la serie), que escucha en el 8080. Así la sala y la cocina
    // parecen el mismo sitio y el navegador no pide permisos de CORS.
    proxy: {
      "/v1": "http://localhost:8080",
    },
  },
  test: {
    environment: "jsdom",
    restoreMocks: true,
    // «npm run contrato» pone CONTRATO=1: corre solo la prueba de contrato, contra la API de
    // verdad y sin la API de mentira. Si no, corren las pruebas de siempre, con la de mentira.
    ...(process.env.CONTRATO === "1"
      ? { include: ["src/test/contrato/**/*.contrato.ts"] }
      : {
          setupFiles: ["./src/test/preparar.ts"],
          // Las pruebas viven en src/test/, en un espejo de src/. Se buscan solo ahí.
          include: ["src/test/**/*.test.{ts,tsx}"],
        }),
  },
});
