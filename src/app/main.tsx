import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "../styles/base.css";
import { crearRutas } from "./rutas";

/** La puerta de la app: monta las rutas en el elemento #raiz de index.html. */
const raiz = document.getElementById("raiz");
if (!raiz) throw new Error("index.html no trae el elemento #raiz");

createRoot(raiz).render(
  <StrictMode>
    <RouterProvider router={createBrowserRouter(crearRutas())} />
  </StrictMode>,
);
