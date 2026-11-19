import { Link, Outlet } from "react-router";

/** Lo que se queda en pantalla en todas las rutas: el encabezado y el lugar del contenido. */
export function Marco() {
  return (
    <>
      <header className="marco__encabezado">
        <nav className="marco__navegacion" aria-label="Principal">
          <Link to="/">Nuevo pedido</Link>
        </nav>
      </header>
      <main className="marco__contenido">
        <Outlet />
      </main>
    </>
  );
}
