/**
 * Utility for consistent error logging across the application
 */

/**
 * Logs detailed error information to the console
 * @param context - Context or operation name where the error occurred
 * @param error - The error object to log
 */
export const logDetailedError = (context: string, error: any): void => {
  console.error(`${context}:`, error);
  
  if (error.response) {
    console.error('Error response:', error.response.status, error.response.data);
  } else if (error.request) {
    console.error('No response received. Request was:', error.request);
  }
};

