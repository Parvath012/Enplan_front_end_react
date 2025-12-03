export const convertFileToBase64 = (file: any) => new Promise((resolve) => resolve('data:image/png;base64,mockedBase64String'));

export const validateImageFile = (file: any, maxSizeMB: number) => {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB` };
  }
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File is not an image' };
  }
  return { valid: true, error: null };
};
