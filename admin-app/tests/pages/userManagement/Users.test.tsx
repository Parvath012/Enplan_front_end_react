import React from "react";
import { render, screen } from "@testing-library/react";
import Users from "../../../src/pages/userManagement/Users";
import * as templateAction from "../../../src/store/Actions/templateAction";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

// Mock fetchUsers
jest.spyOn(templateAction, "fetchUsers").mockImplementation(() => ({ type: "FETCH_USERS" }));

const mockStore = configureStore([]);
const renderWithStore = (storeState: any) => {
  const store = mockStore(storeState);
  return render(
    <Provider store={store}>
      <Users />
    </Provider>
  );
};

describe("Users", () => {
  it("renders UserTable and passes fetchUsers", () => {
    renderWithStore({
      template: { users: [], loading: false, error: null },
    });
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