import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./routers/Routers";
import store from "./store/configureStore";
import { Provider } from "react-redux";
import "./styles/scrollbar.css"; // Import custom scrollbar styles

const App = () => {

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
};

const rootElement = document.getElementById("app");
if (!rootElement) throw new Error("Failed to find the root element");

const root = ReactDOM.createRoot(rootElement);

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
