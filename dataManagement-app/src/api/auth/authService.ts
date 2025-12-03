import axios from 'axios';

// Use the environment variable for the proxy URL
const PROXY_URL = process.env.REACT_APP_PROXY_URL ?? 'http://localhost:4001';

export const authenticate = async () => {
  try {
    const response = await axios.get(`${PROXY_URL}/api/authenticate`, {
      withCredentials: true,
    });
    return response.data.token;
  } catch (error) {
    console.error('Frontend auth failed', error);
    throw error;
  }
};