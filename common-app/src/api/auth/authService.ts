import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const DATA_API_URL = process.env.REACT_APP_ADMIN_API_URL;

export const authenticate = async (): Promise<string | null> => {
  try {
    const loginID = process.env.REACT_APP_ADMIN_LOGIN_ID;
    const password = process.env.REACT_APP_ADMIN_PASSWORD;
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/auth/Authentication/Authenticate`,
      {
        loginID: loginID,
        Password: password,
        withAccessPermissions: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    const token = response.data?.data?.jwtToken ?? response.data?.jwtToken;
    return token;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
};


export const getData = async (
  payload: Record<string, unknown>,
  jwtToken: string
): Promise<any> => {
  try {
    const response = await fetch(`${DATA_API_URL}/api/v1/data/Data/ExecuteSqlQueries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.log(error);
    return null;
  }
};