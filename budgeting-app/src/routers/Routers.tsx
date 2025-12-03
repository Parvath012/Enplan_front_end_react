import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "../components/Header";

const Router = () => (
  <Routes>
    <Route path="/">
      <Route index element={<Header />} />
    </Route>
  </Routes>
);

export default Router;
