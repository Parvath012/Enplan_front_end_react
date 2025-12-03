// Mock for commonApp/apiUtils
export const formatTimestamp = jest.fn((date: Date) => '2023-01-01');
export const saveDataApiCall = jest.fn(() => Promise.resolve({}));

