import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Router from "../../src/routers/Routers";

jest.mock("../../src/components/Header", () => () => <div>Header Component</div>);

describe("Router", () => {
  test("renders Header component at root path", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Router />
      </MemoryRouter>
    );

    expect(screen.getByText(/Header Component/i)).toBeInTheDocument();
  });
});