import React from "react";
import { render, screen } from "@testing-library/react";
import UserTable from "../../../src/pages/userManagement/UserTable";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

// Mock fetchAction
const fetchAction = jest.fn(() => ({ type: "FETCH_USERS" }));

const mockStore = configureStore([]);

const renderWithStore = (storeState: any) => {
  const store = mockStore(storeState);
  return render(
    <Provider store={store}>
      <UserTable fetchAction={fetchAction} />
    </Provider>
  );
};

describe("UserTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state", () => {
    renderWithStore({
      template: { users: [], loading: true, error: null },
    });
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it("renders error state", () => {
    renderWithStore({
      template: { users: [], loading: false, error: "Failed to fetch" },
    });
    expect(screen.getByText(/Error: Failed to fetch/i)).toBeInTheDocument();
  });

  it("renders users in table", () => {
    const users = [
      {
        id: 1,
        loginId: "user1",
        firstName: "John",
        lastName: "Doe",
        emailId: "john@example.com",
        phoneNumber: "1234567890",
        isActive: true,
      },
      {
        id: 2,
        loginId: "user2",
        firstName: "Jane",
        lastName: "Smith",
        emailId: "",
        phoneNumber: "",
        isActive: false,
      },
    ];
    renderWithStore({
      template: { users, loading: false, error: null },
    });

    expect(screen.getByText("user1")).toBeInTheDocument();
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("1234567890")).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument();

    expect(screen.getByText("user2")).toBeInTheDocument();
    expect(screen.getByText("Jane")).toBeInTheDocument();
    expect(screen.getByText("Smith")).toBeInTheDocument();
    // Check for empty cells instead of "N/A" text
    expect(screen.queryAllByRole("cell").filter(td => td.textContent === "")).toBeTruthy();
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("dispatches fetchAction on mount", () => {
    renderWithStore({
      template: { users: [], loading: false, error: null },
    });
    expect(fetchAction).toHaveBeenCalled();
  });

  it("renders table headers", () => {
    renderWithStore({
      template: { users: [], loading: false, error: null },
    });
    expect(screen.getByText("Login ID")).toBeInTheDocument();
    expect(screen.getByText("First Name")).toBeInTheDocument();
    expect(screen.getByText("Last Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Phone Number")).toBeInTheDocument();
    expect(screen.getByText("Is Active")).toBeInTheDocument();
  });
});