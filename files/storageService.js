// src/services/storageService.js
import {
  ref,
  uploadBytes,
  downloadURL,
  deleteObject,
  listAll,
  getBytes,
} from 'firebase/storage';
import { storage } from './firebaseConfig';

class StorageService {
  /**
   * Upload file to Firebase Storage
   */
  static async uploadFile(file, path) {
    try {
      const storageRef = ref(storage, path);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);

      // Get download URL
      const downloadLink = await downloadURL(snapshot.ref);

      return {
        success: true,
        fileName: snapshot.metadata.name,
        filePath: path,
        downloadUrl: downloadLink,
        size: snapshot.metadata.size,
        contentType: snapshot.metadata.contentType,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Upload multiple files
   */
  static async uploadMultipleFiles(files, basePath) {
    try {
      const uploads = [];

      for (const file of files) {
        const fileName = `${Date.now()}-${file.name}`;
        const path = `${basePath}/${fileName}`;
        const result = await this.uploadFile(file, path);

        if (result.success) {
          uploads.push(result);
        }
      }

      return {
        success: uploads.length === files.length,
        uploads,
        failedCount: files.length - uploads.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Upload KYC document
   */
  static async uploadKYCDocument(file, customerId, documentType) {
    try {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: 'Only PDF, JPEG, and PNG files are allowed',
        };
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return {
          success: false,
          error: 'File size must be less than 5MB',
        };
      }

      const fileName = `${Date.now()}-${file.name}`;
      const path = `kyc/${customerId}/${documentType}/${fileName}`;

      const result = await this.uploadFile(file, path);

      if (result.success) {
        return {
          success: true,
          document: {
            name: documentType,
            fileName: result.fileName,
            url: result.downloadUrl,
            path: result.filePath,
            size: result.size,
            uploadedAt: new Date(),
          },
        };
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get file download URL
   */
  static async getFileDownloadUrl(filePath) {
    try {
      const storageRef = ref(storage, filePath);
      const downloadLink = await downloadURL(storageRef);

      return {
        success: true,
        url: downloadLink,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete file from storage
   */
  static async deleteFile(filePath) {
    try {
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);

      return {
        success: true,
        message: 'File deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete multiple files
   */
  static async deleteMultipleFiles(filePaths) {
    try {
      const deletions = [];

      for (const path of filePaths) {
        const result = await this.deleteFile(path);
        deletions.push(result);
      }

      const successCount = deletions.filter((d) => d.success).length;

      return {
        success: successCount === filePaths.length,
        successCount,
        failedCount: filePaths.length - successCount,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * List files in a directory
   */
  static async listFiles(directoryPath) {
    try {
      const dirRef = ref(storage, directoryPath);
      const result = await listAll(dirRef);

      const files = result.items.map((item) => ({
        name: item.name,
        path: item.fullPath,
        bucket: item.bucket,
      }));

      const subdirectories = result.prefixes.map((prefix) => ({
        name: prefix.name,
        path: prefix.fullPath,
      }));

      return {
        success: true,
        files,
        subdirectories,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get file metadata
   */
  static async getFileMetadata(filePath) {
    try {
      const storageRef = ref(storage, filePath);
      const url = await downloadURL(storageRef);

      return {
        success: true,
        metadata: {
          path: filePath,
          url,
          downloadableAt: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get file content as bytes (for preview)
   */
  static async getFileBytes(filePath) {
    try {
      const storageRef = ref(storage, filePath);
      const bytes = await getBytes(storageRef);

      return {
        success: true,
        bytes,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate unique file path
   */
  static generateFilePath(basePath, fileName) {
    const timestamp = Date.now();
    const uniqueName = `${timestamp}-${fileName}`;
    return `${basePath}/${uniqueName}`;
  }

  /**
   * Validate file before upload
   */
  static validateFile(file, allowedTypes = [], maxSizeMB = 5) {
    const maxBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxBytes) {
      return {
        valid: false,
        error: `File size must be less than ${maxSizeMB}MB`,
      };
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type must be one of: ${allowedTypes.join(', ')}`,
      };
    }

    return {
      valid: true,
    };
  }

  /**
   * Get file extension
   */
  static getFileExtension(fileName) {
    return fileName.split('.').pop();
  }

  /**
   * Get file size in MB
   */
  static getFileSizeInMB(bytes) {
    return (bytes / (1024 * 1024)).toFixed(2);
  }
}

export default StorageService;
