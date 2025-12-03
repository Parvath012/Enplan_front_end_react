import axios from 'axios';
// Set default base URL with fallback to ensure it's never undefined
axios.defaults.baseURL = process.env.REACT_APP_PROXY_URL ?? 'http://localhost:4001';

export const apiRequest = async (url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any) => {
  try {
    const response = await axios({
      url,
      method,
      data,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`API response received: ${response.status}`);
    return response.data;
  } catch (error: any) {
    // Check if it's a 409 conflict - suppress logging for conflicts (handled by retry logic)
    const isConflict = error?.response?.status === 409 || 
                      (error?.response?.status === 500 && 
                       String(error?.response?.data?.details || '').includes('409'));
    
    if (!isConflict) {
      console.error(`API Request Failed for ${url}:`, error.message);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received. Request was:', error.request._currentUrl ?? error.request.path);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', error.message);
      }
    }
    throw error;
  }
};
