// Mock for commonApp/imageUtils
export const convertToBase64 = jest.fn((file: File) => Promise.resolve('mock-base64-string'));
export const resizeImage = jest.fn((file: File, maxWidth: number, maxHeight: number) => Promise.resolve(file));
export const validateImageType = jest.fn((file: File) => true);
export const getImageDimensions = jest.fn((file: File) => Promise.resolve({ width: 100, height: 100 }));

export default {
  convertToBase64,
  resizeImage,
  validateImageType,
  getImageDimensions,
};

