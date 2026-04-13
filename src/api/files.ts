import axios from "axios";
import type { 
  FileRecord, 
  CreateFileRequest, 
  UpdateFileRequest, 
  UploadFileRequest,
  FileListQuery,
  ApiResponse 
} from '../types/file';
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";

// Create axios instance with same configuration as auth
const api = axios.create({
  baseURL: apiURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth interceptor
api.interceptors.request.use((config) => {
  try {
    const t = getToken();
    if (t) {
      if (!config.headers) config.headers = {} as any;
      config.headers["Authorization"] = `Bearer ${t}`;
    }
  } catch (err) {
    console.error("Error getting token:", err);
  }
  return config;
}, (error) => Promise.reject(error));

class FilesAPI {
  /**
   * Create a new file record manually (without file upload)
   */
  async createFile(data: CreateFileRequest): Promise<ApiResponse<FileRecord>> {
    try {
      const response = await api.post('/files', data);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Error creating file");
    }
  }

  /**
   * Upload a file and automatically create Media + File records
   */
  async uploadFile(data: UploadFileRequest): Promise<ApiResponse<FileRecord>> {
    try {
      const formData = new FormData();
      
      formData.append('file', data.file);
      formData.append('user_id', data.user_id.toString());
      
      if (data.target_user) {
        formData.append('target_user', data.target_user.toString());
      }
      
      if (data.tags && data.tags.length > 0) {
        data.tags.forEach(tag => formData.append('tags', tag));
      }
      
      if (data.comment) {
        formData.append('comment', data.comment);
      }
      
      if (data.local_path) {
        formData.append('local_path', data.local_path);
      }
      
      if (data.s3_path) {
        formData.append('s3_path', data.s3_path);
      }

      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Error uploading file");
    }
  }

  /**
   * List all files with pagination, filtering, and sorting
   */
  async getFiles(query: FileListQuery = {}): Promise<ApiResponse<FileRecord[]>> {
    try {
      const response = await api.get('/files', { params: query });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Error fetching files");
    }
  }

  /**
   * Get a single file by ID
   */
  async getFile(id: number): Promise<ApiResponse<FileRecord>> {
    try {
      const response = await api.get(`/files/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Error fetching file");
    }
  }

  /**
   * Update a file record
   */
  async updateFile(id: number, data: UpdateFileRequest): Promise<ApiResponse<FileRecord>> {
    try {
      const response = await api.put(`/files/${id}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Error updating file");
    }
  }

  /**
   * Soft delete a file (sets isDeleted: true)
   */
  async deleteFile(id: number): Promise<ApiResponse<{ id: number }>> {
    try {
      const response = await api.delete(`/files/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Error deleting file");
    }
  }

  /**
   * Get all files uploaded by a specific user
   */
  async getFilesByUser(
    userId: number, 
    query: { page?: number; limit?: number } = {}
  ): Promise<ApiResponse<FileRecord[]>> {
    try {
      const response = await api.get(`/files/user/${userId}`, { params: query });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Error fetching user files");
    }
  }

  /**
   * Get all files targeted to a specific user
   */
  async getFilesForUser(
    userId: number, 
    query: { page?: number; limit?: number } = {}
  ): Promise<ApiResponse<FileRecord[]>> {
    try {
      const response = await api.get(`/files/target/${userId}`, { params: query });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Error fetching targeted files");
    }
  }

  /**
   * Upload multiple files at once
   */
  async uploadMultipleFiles(files: UploadFileRequest[]): Promise<ApiResponse<FileRecord>[]> {
    const uploadPromises = files.map(fileData => this.uploadFile(fileData));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete multiple files at once
   */
  async deleteMultipleFiles(ids: number[]): Promise<ApiResponse<{ id: number }>[]> {
    const deletePromises = ids.map(id => this.deleteFile(id));
    return Promise.all(deletePromises);
  }
}

// Export singleton instance
export const filesAPI = new FilesAPI();
export default filesAPI;
