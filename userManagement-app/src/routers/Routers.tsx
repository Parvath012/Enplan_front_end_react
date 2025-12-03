import React from "react";
import { Routes, Route } from "react-router-dom";
import UserManagement from "../pages/userManagement/UserManagement";

const Router = () => (
  <Routes>
    <Route path="/*" element={<UserManagement />} />
  </Routes>
);

export default Router;