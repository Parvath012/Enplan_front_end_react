import React from "react";
import { Provider } from "react-redux";
import store from "./store/configureStore";
import Router from "./routers/Routers";

const App = () => {
  return (
    <Provider store={store}>
      <Router />
    </Provider>
  );
};

export default App;
