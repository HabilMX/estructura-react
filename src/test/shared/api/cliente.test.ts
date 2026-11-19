import { describe, expect, it } from "vitest";
import { z } from "zod";
import { pedirJson } from "../../../shared/api/cliente";
import { ErrorDeApi } from "../../../shared/api/problema";
import { HttpResponse, http, problema, servidor } from "../../comun/servidor";

const esquema = z.object({ id: z.string() });

/** Corre la petición y devuelve el error que lanzó; si no lanzó, la prueba falla. */
async function errorDe(promesa: Promise<unknown>): Promise<ErrorDeApi> {
  try {
    await promesa;
  } catch (error) {
    if (error instanceof ErrorDeApi) return error;
    throw error;
  }
  throw new Error("se esperaba un ErrorDeApi y la petición salió bien");
}

describe("pedirJson", () => {
  it("manda en cada petición un X-Request-ID nuevo, con forma de UUID", async () => {
    const vistos: string[] = [];
    servidor.use(
      http.get("*/v1/eco", ({ request }) => {
        vistos.push(request.headers.get("X-Request-ID") ?? "");
        return HttpResponse.json({ id: "1" });
      }),
    );
    await pedirJson("/v1/eco", { esquema });
    await pedirJson("/v1/eco", { esquema });
    expect(vistos).toHaveLength(2);
    expect(vistos[0]).toMatch(/^[0-9a-f-]{36}$/);
    expect(vistos[0]).not.toBe(vistos[1]);
  });

  it("devuelve la respuesta ya validada por su esquema", async () => {
    servidor.use(http.get("*/v1/eco", () => HttpResponse.json({ id: "7", extra: true })));
    await expect(pedirJson("/v1/eco", { esquema })).resolves.toEqual({ id: "7" });
  });

  it("manda el cuerpo como JSON en un POST", async () => {
    let recibido: unknown;
    servidor.use(
      http.post("*/v1/eco", async ({ request }) => {
        recibido = await request.json();
        return HttpResponse.json({ id: "1" }, { status: 201 });
      }),
    );
    await pedirJson("/v1/eco", { metodo: "POST", cuerpo: { a: 1 }, esquema });
    expect(recibido).toEqual({ a: 1 });
  });

  it("traduce un Problem Details a un mensaje fijo, sin el detalle del backend", async () => {
    servidor.use(
      http.get("*/v1/eco", () =>
        problema(409, "SIN_EXISTENCIAS", "De TAZA-01 se pidieron 4 y hay 3"),
      ),
    );
    const error = await errorDe(pedirJson("/v1/eco", { esquema }));
    expect(error.codigo).toBe("SIN_EXISTENCIAS");
    expect(error.estado).toBe(409);
    expect(error.message).toBe("No hay piezas suficientes de uno de los productos.");
    expect(error.message).not.toContain("TAZA-01");
  });

  it("nunca pinta el rastro de un 500", async () => {
    servidor.use(
      http.get("*/v1/eco", () =>
        problema(500, "ERROR_INTERNO", "java.lang.NullPointerException at Pedido.java:42"),
      ),
    );
    const error = await errorDe(pedirJson("/v1/eco", { esquema }));
    expect(error.message).toBe("Algo salió mal de nuestro lado. Intenta de nuevo.");
    expect(error.message).not.toMatch(/java|\.java|Exception/);
  });

  it("trata un error sin cuerpo como error interno", async () => {
    servidor.use(http.get("*/v1/eco", () => new HttpResponse(null, { status: 502 })));
    const error = await errorDe(pedirJson("/v1/eco", { esquema }));
    expect(error.codigo).toBe("ERROR_INTERNO");
  });

  it("rechaza una respuesta que no tiene la forma esperada", async () => {
    servidor.use(http.get("*/v1/eco", () => HttpResponse.json({ ident: 7 })));
    const error = await errorDe(pedirJson("/v1/eco", { esquema }));
    expect(error.codigo).toBe("RESPUESTA_INESPERADA");
  });

  it("se rinde cuando se acaba el plazo", async () => {
    servidor.use(http.get("*/v1/eco", () => new Promise<never>(() => {})));
    const error = await errorDe(pedirJson("/v1/eco", { esquema, plazoMs: 50 }));
    expect(error.codigo).toBe("SIN_RESPUESTA");
  });

  it("distingue una falla de red", async () => {
    servidor.use(http.get("*/v1/eco", () => HttpResponse.error()));
    const error = await errorDe(pedirJson("/v1/eco", { esquema }));
    expect(error.codigo).toBe("SIN_CONEXION");
  });

  it("deja pasar la cancelación de quien la pidió, sin convertirla en error para pintar", async () => {
    servidor.use(http.get("*/v1/eco", () => new Promise<never>(() => {})));
    const cancelar = new AbortController();
    const promesa = pedirJson("/v1/eco", { esquema, senal: cancelar.signal });
    cancelar.abort();
    await expect(promesa).rejects.not.toBeInstanceOf(ErrorDeApi);
  });
});
