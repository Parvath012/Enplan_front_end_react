import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
// test comment
const SideNavbar = () => {
  const location = useLocation(); // Get the current location

  // The base path for budgeting-app
  const basePath = location.pathname.startsWith("/home-app") ? "/home-app" : "";

  return (
    <div style={{ display: "flex" }}>
      <nav style={{ width: 200 }}>
        <ul>
          <li><Link to={`${basePath}`}>Home</Link></li>
        </ul>
      </nav>
      <main style={{ marginLeft: 20 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default SideNavbar;
