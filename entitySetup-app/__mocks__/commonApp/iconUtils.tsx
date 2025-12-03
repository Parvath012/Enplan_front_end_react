// Mock for commonApp/iconUtils
export const getIconUrl = jest.fn((iconName: string) => `/mock-icons/${iconName}`);

export default {
  getIconUrl,
};
