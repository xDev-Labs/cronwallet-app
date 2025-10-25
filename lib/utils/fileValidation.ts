// File validation utilities for avatar uploads

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp'
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateImageFile(file: any): FileValidationResult {
  if (!file) {
    return {
      isValid: false,
      error: 'No file selected'
    };
  }

  // For React Native, we need to check the file extension from URI
  if (typeof file === 'string') {
    // This is a URI from expo-image-picker
    const lowerCaseUri = file.toLowerCase();
    const hasValidExtension = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].some(ext => 
      lowerCaseUri.endsWith(ext)
    );
    
    if (!hasValidExtension) {
      return {
        isValid: false,
        error: 'Invalid file type. Please select a JPG, PNG, GIF, or WEBP image.'
      };
    }
    
    return { isValid: true };
  }

  // For web/desktop environments with File objects
  if (file.type && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Please select a JPG, PNG, GIF, or WEBP image.'
    };
  }

  if (file.size && file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: 'File is too large. Please select an image smaller than 10MB.'
    };
  }

  return { isValid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileExtension(uri: string): string {
  const parts = uri.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

export function generateFileName(userId: string, originalExtension: string): string {
  const timestamp = Date.now();
  return `avatar_${userId}_${timestamp}.${originalExtension}`;
}

export function getMimeTypeFromExtension(extension: string): string {
  const ext = extension.toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp'
  };
  
  return mimeTypes[ext] || 'image/jpeg';
}