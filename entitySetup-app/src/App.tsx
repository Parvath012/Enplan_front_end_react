import React from "react";
import { Provider } from "react-redux";
import {CssBaseline } from '@mui/material';
import store from "./store/configureStore";
import Router from "./routers/Routers";
import "./styles/reset.css";

import './App.scss';

const App = () => {
  return (
    <Provider store={store}>
      <CssBaseline />
      <Router />
    </Provider>
  );
};

export default App;
