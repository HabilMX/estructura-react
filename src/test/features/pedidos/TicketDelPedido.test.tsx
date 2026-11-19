import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TicketDelPedido } from "../../../features/pedidos/components/TicketDelPedido";
import { esquemaDePedido } from "../../../features/pedidos/schemas/pedido";
import { pedidoDeEjemplo } from "../../comun/servidor";

describe("TicketDelPedido", () => {
  it("pinta un renglón por producto, con su precio, y el total", () => {
    render(<TicketDelPedido pedido={esquemaDePedido.parse(pedidoDeEjemplo)} />);
    const renglones = within(screen.getByRole("table")).getAllByRole("row");
    expect(renglones).toHaveLength(3); // el encabezado y dos productos
    expect(renglones[1]).toHaveTextContent("TAZA-01");
    expect(renglones[1]).toHaveTextContent("$185.00");
    expect(screen.getByText("$470.00")).toBeInTheDocument();
  });
});
