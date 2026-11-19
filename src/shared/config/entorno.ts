/**
 * La configuración que cambia entre ambientes. Se lee del mecanismo de Vite
 * (`import.meta.env`), nunca de constantes escritas para cada ambiente.
 *
 * Todo lo que empieza con `VITE_` termina en el código que baja el navegador: aquí
 * nunca va un secreto. La lista de variables está en `.env.example`.
 */

/** La dirección de la API de pedidos. Vacía: la misma del sitio (en desarrollo, el proxy). */
export const urlDeLaApi: string = import.meta.env.VITE_API_URL ?? "";

/** Cuánto se espera a la API antes de rendirse, en milisegundos. */
export const plazoDeLaApiMs = 8000;
