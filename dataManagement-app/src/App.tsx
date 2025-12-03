import React from "react";
import { Provider } from "react-redux";
import store from "./store/configureStore";
import { useRoutes } from "react-router-dom";
import { router } from "./routers/Routers";
import './App.scss';

const App = () => {
  const routes = useRoutes(router);

  return (
    <Provider store={store}>
      {routes}
    </Provider>
  );
};

export default App;
