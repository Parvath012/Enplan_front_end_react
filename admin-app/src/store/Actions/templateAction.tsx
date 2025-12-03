import axios from "axios";
import { RootState } from "../configureStore";

export const AUTHENTICATE = "AUTHENTICATE";
export const AUTHENTICATE_SUCCESS = "AUTHENTICATE_SUCCESS";
export const AUTHENTICATE_FAILURE = "AUTHENTICATE_FAILURE";

export const FETCH_USERS = "FETCH_USERS";
export const FETCH_USERS_SUCCESS = "FETCH_USERS_SUCCESS";
export const FETCH_USERS_FAILURE = "FETCH_USERS_FAILURE";

// Use environment variables for API URLs
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const USERS_API_URL = process.env.REACT_APP_USERS_API_URL;
const ADMIN_API_URL = process.env.REACT_APP_ADMIN_API_URL;

export const authenticate = () => async (dispatch: any) => {
  dispatch({ type: AUTHENTICATE });
  console.log("Authenticating...");

  try {
    const loginID = process.env.REACT_APP_ADMIN_LOGIN_ID;
    const password = process.env.REACT_APP_ADMIN_PASSWORD;

    const response = await axios.post(
      `${API_BASE_URL}/api/v1/auth/Authentication/Authenticate`,
      {
        loginID,
        password,
        withAccessPermissions: true,
      }
    );

    const data = response.data;

    if (data.status === "Error") {
      console.error("Authentication failed:", data.message);
      dispatch({ type: AUTHENTICATE_FAILURE, payload: data.message });
      return Promise.reject(new Error(data.message));
    }

    dispatch({ type: AUTHENTICATE_SUCCESS, payload: data.data.jwtToken });
    return Promise.resolve();
  } catch (error: any) {
    let message: string;
    if (error instanceof Error) {
      message = error.message;
    } else if (error?.message) {
      message = error.message;
    } else {
      message = String(error);
    }
    console.error("Authentication failed:", message);
    dispatch({ type: AUTHENTICATE_FAILURE, payload: message });
    return Promise.reject(error instanceof Error ? error : new Error(message));
  }
};

export const fetchUsers1 = () => async (dispatch: any) => {
  dispatch({ type: FETCH_USERS });

  try {
    const response = await axios.get(`${USERS_API_URL}/admin/get-users`);

    const data = response.data;
    dispatch({ type: FETCH_USERS_SUCCESS, payload: data });
  } catch (error: any) {
    console.error("Error fetching users:", error.message);
    dispatch({ type: FETCH_USERS_FAILURE, payload: error.message });
  }
};

export const fetchUsers = () => async (dispatch: any, getState: () => RootState) => {
  try {
    await dispatch(authenticate());
  } catch (error) {
    console.error("Authentication failed. Cannot fetch users.", error);
    dispatch({ type: 'AUTHENTICATION_ERROR', payload: error });
    return;
  }

  const { jwtToken } = getState().template; // Dynamically get the token from Redux state

  if (!jwtToken) {
    console.error("JWT token is missing. Please authenticate first.");
    return;
  }

  dispatch({ type: FETCH_USERS });

  try {
    const response = await axios.post(
      `${ADMIN_API_URL}/api/v1/admin/Users/GetUsers`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );

    const data = response.data;
    dispatch({ type: FETCH_USERS_SUCCESS, payload: data.data });
  } catch (error: any) {
    console.error("Error fetching users:", error.message);
    dispatch({ type: FETCH_USERS_FAILURE, payload: error.message });
  }
};