import React, { useRef, useState } from 'react';
import { Upload, X, File, AlertCircle } from 'lucide-react';
import { useFileOperations } from '../../hooks/useFileOperations';
import { validateFileUpload, formatFileSize } from '../../utils/fileUtils';
import type { UploadFileRequest } from '../../types/file';

interface FileUploadProps {
  userId: number;
  targetUserId?: number;
  onUploadComplete?: (files: any[]) => void;
  onUploadError?: (error: string) => void;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  userId,
  targetUserId,
  onUploadComplete,
  onUploadError,
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  
  const { 
    uploadMultipleFiles, 
    uploadState,
    clearState 
  } = useFileOperations();

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    fileArray.forEach(file => {
      const validation = validateFileUpload(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      onUploadError?.(errors.join('\n'));
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    const uploadRequests: UploadFileRequest[] = selectedFiles.map(file => ({
      file,
      user_id: userId,
      target_user: targetUserId,
      tags: ['uploaded'],
      comment: `Uploaded via file explorer`
    }));

    try {
      const results = await uploadMultipleFiles(uploadRequests);
      
      if (results.length > 0) {
        onUploadComplete?.(results);
        setSelectedFiles([]);
        clearState();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      onUploadError?.(message);
    }
  };

  const clearAll = () => {
    setSelectedFiles([]);
    setUploadProgress({});
    clearState();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center
          transition-all duration-200 cursor-pointer
          ${dragActive 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept="*/*"
        />
        
        <div className="space-y-2">
          <Upload className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500" />
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-blue-600 dark:text-blue-400">
              Click to upload
            </span>
            {' or drag and drop'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            Any file type, up to 100MB each
          </div>
        </div>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Selected Files ({selectedFiles.length})
            </h3>
            <button
              onClick={clearAll}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${file.size}-${index}`}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <File className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-900 dark:text-gray-100 truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleUpload}
            disabled={uploadState.isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 
              bg-blue-600 text-white rounded-md hover:bg-blue-700 
              disabled:bg-gray-400 disabled:cursor-not-allowed
              transition-colors duration-200"
          >
            {uploadState.isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}

      {/* Error Display */}
      {uploadState.error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 
          border border-red-200 dark:border-red-800 rounded-md">
          <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-700 dark:text-red-300">
            {uploadState.error}
          </div>
        </div>
      )}

      {/* Success Message */}
      {uploadState.success && !uploadState.error && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 
          border border-green-200 dark:border-green-800 rounded-md">
          <div className="text-sm text-green-700 dark:text-green-300">
            Files uploaded successfully!
          </div>
        </div>
      )}
    </div>
  );
};