import {
  convertFileToBase64,
  validateImageFile,
  createBlobUrlFromBase64,
  revokeBlobUrl,
  isValidBase64DataUrl,
  getMimeTypeFromBase64
} from '../../src/utils/imageUtils';

// Mock FileReader
const mockFileReader = {
  readAsDataURL: jest.fn((file) => {
    // Simulate asynchronous behavior
    setTimeout(() => {
      if (mockFileReader.onload) {
        mockFileReader.onload({ target: { result: mockFileReader.result } } as any);
      }
    }, 0);
  }),
  onload: null as any,
  onerror: null as any,
  result: null as any
};

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();

// Mock atob and btoa
const mockAtob = jest.fn();

// Mock console.error
const mockConsoleError = jest.fn();

beforeAll(() => {
  global.FileReader = jest.fn(() => mockFileReader) as any;
  global.URL.createObjectURL = mockCreateObjectURL;
  global.URL.revokeObjectURL = mockRevokeObjectURL;
  global.atob = mockAtob;
  global.console.error = mockConsoleError;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockFileReader.onload = null;
  mockFileReader.onerror = null;
  mockFileReader.result = null;
});

describe('imageUtils', () => {
  describe('convertFileToBase64', () => {
    it('converts file to base64 successfully', async () => {
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const mockBase64 = 'data:image/jpeg;base64,dGVzdCBjb250ZW50';
      
      mockFileReader.result = mockBase64;
      
      const result = await convertFileToBase64(mockFile);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe(mockBase64);
      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(mockFile);
    });

    it('handles FileReader error', async () => {
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      
      // Mock FileReader to trigger error
      const mockFileReaderWithError = {
        readAsDataURL: jest.fn((file) => {
          setTimeout(() => {
            if (mockFileReaderWithError.onerror) {
              mockFileReaderWithError.onerror({ target: { error: new Error('FileReader error') } } as any);
            }
          }, 0);
        }),
        onload: null as any,
        onerror: null as any,
        result: null as any
      };
      
      global.FileReader = jest.fn(() => mockFileReaderWithError) as any;
      
      const result = await convertFileToBase64(mockFile);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to read file');
    });

    it('handles FileReader exception', async () => {
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      
      // Mock FileReader to throw error
      mockFileReader.readAsDataURL = jest.fn(() => {
        throw new Error('FileReader error');
      });
      
      const result = await convertFileToBase64(mockFile);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to read file');
    });

    it('handles unknown error', async () => {
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      
      // Mock FileReader to throw non-Error object
      mockFileReader.readAsDataURL = jest.fn(() => {
        throw 'String error';
      });
      
      const result = await convertFileToBase64(mockFile);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to read file');
    });
  });

  describe('validateImageFile', () => {
    it('validates valid image file', () => {
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 }); // 1MB
      
      const result = validateImageFile(mockFile);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('rejects file that is too large', () => {
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(mockFile, 'size', { value: 15 * 1024 * 1024 }); // 15MB
      
      const result = validateImageFile(mockFile, 10);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File size must be less than 10MB');
    });

    it('rejects file with invalid extension', () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(mockFile, 'size', { value: 1024 });
      
      const result = validateImageFile(mockFile);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Only .png, .jpeg, .jpg, .svg files are allowed');
    });

    it('accepts file with custom allowed extensions', () => {
      const mockFile = new File(['test content'], 'test.gif', { type: 'image/gif' });
      Object.defineProperty(mockFile, 'size', { value: 1024 });
      
      const result = validateImageFile(mockFile, 10, ['.gif', '.png']);
      
      expect(result.isValid).toBe(true);
    });

    it('handles file with no extension', () => {
      const mockFile = new File(['test content'], 'test', { type: 'image/jpeg' });
      Object.defineProperty(mockFile, 'size', { value: 1024 });
      
      const result = validateImageFile(mockFile);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Only .png, .jpeg, .jpg, .svg files are allowed');
    });

    it('handles file with multiple extensions', () => {
      const mockFile = new File(['test content'], 'test.jpg.backup', { type: 'image/jpeg' });
      Object.defineProperty(mockFile, 'size', { value: 1024 });
      
      const result = validateImageFile(mockFile);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Only .png, .jpeg, .jpg, .svg files are allowed');
    });
  });

  describe('createBlobUrlFromBase64', () => {
    it('creates blob URL from valid base64 string', () => {
      const base64String = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      const mockBlobUrl = 'blob:http://localhost:3000/12345678-1234-1234-1234-123456789abc';
      
      mockAtob.mockReturnValue('decoded data');
      mockCreateObjectURL.mockReturnValue(mockBlobUrl);
      
      const result = createBlobUrlFromBase64(base64String);
      
      expect(result).toBe(mockBlobUrl);
      expect(mockAtob).toHaveBeenCalledWith('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    it('handles invalid base64 string', () => {
      const base64String = 'invalid-base64';
      
      mockAtob.mockImplementation(() => {
        throw new Error('Invalid base64');
      });
      
      const result = createBlobUrlFromBase64(base64String);
      
      expect(result).toBe(base64String);
      expect(mockConsoleError).toHaveBeenCalledWith('Error creating blob URL from base64:', expect.any(Error));
    });

    it('handles base64 string without data URL prefix', () => {
      const base64String = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      mockAtob.mockReturnValue('decoded data');
      mockCreateObjectURL.mockReturnValue('blob:test');
      
      const result = createBlobUrlFromBase64(base64String);
      
      expect(result).toBe('blob:test');
    });
  });

  describe('revokeBlobUrl', () => {
    it('revokes valid blob URL', () => {
      const blobUrl = 'blob:http://localhost:3000/12345678-1234-1234-1234-123456789abc';
      
      revokeBlobUrl(blobUrl);
      
      expect(mockRevokeObjectURL).toHaveBeenCalledWith(blobUrl);
    });

    it('does not revoke non-blob URL', () => {
      const regularUrl = 'http://example.com/image.jpg';
      
      revokeBlobUrl(regularUrl);
      
      expect(mockRevokeObjectURL).not.toHaveBeenCalled();
    });

    it('handles error when revoking blob URL', () => {
      const blobUrl = 'blob:http://localhost:3000/12345678-1234-1234-1234-123456789abc';
      
      mockRevokeObjectURL.mockImplementation(() => {
        throw new Error('Revoke error');
      });
      
      revokeBlobUrl(blobUrl);
      
      expect(mockConsoleError).toHaveBeenCalledWith('Error revoking blob URL:', expect.any(Error));
    });

    it('handles null/undefined blob URL', () => {
      revokeBlobUrl(null as any);
      revokeBlobUrl(undefined as any);
      
      expect(mockRevokeObjectURL).not.toHaveBeenCalled();
    });
  });

  describe('isValidBase64DataUrl', () => {
    it('validates correct base64 data URL', () => {
      const validBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      const result = isValidBase64DataUrl(validBase64);
      
      expect(result).toBe(true);
    });

    it('rejects string without data: prefix', () => {
      const invalidBase64 = 'image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      const result = isValidBase64DataUrl(invalidBase64);
      
      expect(result).toBe(false);
    });

    it('rejects string without base64, separator', () => {
      const invalidBase64 = 'data:image/png,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      const result = isValidBase64DataUrl(invalidBase64);
      
      expect(result).toBe(false);
    });

    it('handles null/undefined input', () => {
      const result1 = isValidBase64DataUrl(null as any);
      const result2 = isValidBase64DataUrl(undefined as any);
      
      expect(result1).toBe(false);
      expect(result2).toBe(false);
    });

    it('handles empty string', () => {
      const result = isValidBase64DataUrl('');
      
      expect(result).toBe(false);
    });
  });

  describe('getMimeTypeFromBase64', () => {
    it('extracts MIME type from valid base64 data URL', () => {
      const base64String = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      const result = getMimeTypeFromBase64(base64String);
      
      expect(result).toBe('image/png');
    });

    it('extracts MIME type from JPEG base64 data URL', () => {
      const base64String = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A';
      
      const result = getMimeTypeFromBase64(base64String);
      
      expect(result).toBe('image/jpeg');
    });

    it('returns null for invalid base64 data URL', () => {
      const invalidBase64 = 'data:image/png,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      const result = getMimeTypeFromBase64(invalidBase64);
      
      expect(result).toBe(null);
    });

    it('returns null for string without data: prefix', () => {
      const invalidBase64 = 'image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      const result = getMimeTypeFromBase64(invalidBase64);
      
      expect(result).toBe(null);
    });

    it('handles null/undefined input', () => {
      const result1 = getMimeTypeFromBase64(null as any);
      const result2 = getMimeTypeFromBase64(undefined as any);
      
      expect(result1).toBe(null);
      expect(result2).toBe(null);
    });

    it('handles empty string', () => {
      const result = getMimeTypeFromBase64('');
      
      expect(result).toBe(null);
    });
  });
});