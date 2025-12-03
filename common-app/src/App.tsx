import React from "react";
import { Provider } from "react-redux";
import store from "./store/configureStore";
import Table from "./components/tablecomponents";
import "./App.scss";

const App = () => {

  return (
    <Provider store={store}>
      <Table/>
    </Provider>
  );
};

export default App;
