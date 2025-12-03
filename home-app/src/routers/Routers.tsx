import React from "react";
import SideNavbar from "../components/SideNavbar";
import Header from "../components/Header";
import { Route, Routes } from "react-router-dom";

const Router = () => (
  <Routes>
    <Route path="/" element={<SideNavbar />}>
      <Route index element={<Header />} />
    </Route>
  </Routes>
);

export default Router;
