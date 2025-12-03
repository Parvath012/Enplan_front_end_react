import React from "react";
import { Routes, Route } from "react-router-dom";
import EntitySetup from "../pages/entitySetup/EntitySetup";

const Router = () => (
  <Routes>
    <Route path="/*" element={<EntitySetup />} />
  </Routes>
);

export default Router;