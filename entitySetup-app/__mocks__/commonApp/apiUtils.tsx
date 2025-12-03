// Mock for commonApp/apiUtils
export const formatTimestamp = jest.fn((timestamp: string | Date) => `'${timestamp}'`);
export const saveDataApiCall = jest.fn(async (data: any) => {
  // Mock fetch response
  const mockResponse = {
    ok: true,
    json: () => Promise.resolve({ success: true, data }),
  };
  return mockResponse;
});

export default {
  formatTimestamp,
  saveDataApiCall,
};
