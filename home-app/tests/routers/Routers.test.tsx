import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Outlet } from "react-router-dom";
import Router from "../../src/routers/Routers";

jest.mock("../../src/components/Header", () => () => <div>Header Component</div>);
// Mock SideNavbar to include <Outlet /> for nested routing
jest.mock("../../src/components/SideNavbar", () => () => (
  <div>
    <nav>SideNavbar Component</nav>
    <main><Outlet /></main>
  </div>
));

describe("Router", () => {
  test("renders SideNavbar and Header components at root path", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Router />
      </MemoryRouter>
    );

    expect(screen.getByText(/SideNavbar Component/i)).toBeInTheDocument();
    expect(screen.getByText(/Header Component/i)).toBeInTheDocument();
  });
});