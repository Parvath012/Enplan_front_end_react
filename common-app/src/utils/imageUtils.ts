/**
 * Utility functions for image conversion operations
 */

export interface ImageConversionResult {
  success: boolean;
  data?: string;
  error?: string;
}

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Converts a File object to base64 data URL string
 * @param file - The file to convert
 * @returns Promise<ImageConversionResult> - Result with base64 string or error
 */
export const convertFileToBase64 = (file: File): Promise<ImageConversionResult> => {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve({
          success: true,
          data: base64String
        });
      };
      
      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Failed to read file'
        });
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      resolve({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });
};

/**
 * Validates if a file is a valid image for upload
 * @param file - The file to validate
 * @param maxSizeInMB - Maximum file size in MB (default: 10)
 * @param allowedExtensions - Array of allowed file extensions (default: ['.png', '.jpeg', '.jpg', '.svg'])
 * @returns ImageValidationResult - Validation result with error message if invalid
 */
export const validateImageFile = (
  file: File, 
  maxSizeInMB: number = 10, 
  allowedExtensions: string[] = ['.png', '.jpeg', '.jpg', '.svg']
): ImageValidationResult => {
  // Check file size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeInMB}MB`
    };
  }
  
  // Check file type
      const fileExtension = '.' + file.name?.split('.')?.pop()?.toLowerCase() || '';
  if (!allowedExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: `Only ${allowedExtensions.join(', ')} files are allowed`
    };
  }
  
  return { isValid: true };
};

/**
 * Creates a blob URL from a base64 string for display purposes
 * @param base64String - The base64 data URL string
 * @returns string - The blob URL
 */
export const createBlobUrlFromBase64 = (base64String: string): string => {
  try {
    // Convert base64 to blob
    const byteCharacters = atob(base64String?.split(',')?.[1] ?? '');
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });
    
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error creating blob URL from base64:', error);
    return base64String; // Fallback to original string
  }
};

/**
 * Revokes a blob URL to free memory
 * @param blobUrl - The blob URL to revoke
 */
export const revokeBlobUrl = (blobUrl: string): void => {
  try {
    if (blobUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(blobUrl);
    }
  } catch (error) {
    console.error('Error revoking blob URL:', error);
  }
};

/**
 * Checks if a string is a valid base64 data URL
 * @param str - The string to check
 * @returns boolean - True if valid base64 data URL
 */
export const isValidBase64DataUrl = (str: string): boolean => {
  try {
    return str.startsWith('data:') && str.includes(';base64,');
  } catch {
    return false;
  }
};

/**
 * Extracts the MIME type from a base64 data URL
 * @param base64String - The base64 data URL string
 * @returns string | null - The MIME type or null if invalid
 */
export const getMimeTypeFromBase64 = (base64String: string): string | null => {
  try {
    const regex = /^data:([^;]+);base64,/;
    const match = regex.exec(base64String);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};
