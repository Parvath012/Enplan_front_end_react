import React from "react";
import { render, screen } from "@testing-library/react";
import UsersFromJava from "../../../src/pages/userManagement/UsersFromJava";
import UserTable from "../../../src/pages/userManagement/UserTable";
import * as templateAction from "../../../src/store/Actions/templateAction";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

// Mock fetchUsers1
jest.spyOn(templateAction, "fetchUsers1").mockImplementation(() => ({ type: "FETCH_USERS_1" }));

const mockStore = configureStore([]);
const renderWithStore = (storeState: any) => {
  const store = mockStore(storeState);
  return render(
    <Provider store={store}>
      <UsersFromJava />
    </Provider>
  );
};

describe("UsersFromJava", () => {
  it("renders UserTable and passes fetchUsers1", () => {
    renderWithStore({
      template: { users: [], loading: false, error: null },
    });
    // Check UserTable is rendered (by header)
    expect(screen.getByText("Users")).toBeInTheDocument();
  });

  it("renders loading state", () => {
    renderWithStore({
      template: { users: [], loading: true, error: null },
    });
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it("renders error state", () => {
    renderWithStore({
      template: { users: [], loading: false, error: "Some error" },
    });
    expect(screen.getByText(/Error: Some error/i)).toBeInTheDocument();
  });
});