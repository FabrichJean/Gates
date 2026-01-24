// components/FileUploadZone.tsx
import React, { useCallback, useState } from 'react';
import { Video, Image, Upload } from 'lucide-react';
import { cdnS3 } from '../utils/cdn';

interface FileUploadZoneProps {
  type: 'video' | 'image';
  accept: string;
  title: string;
  file: File | null;
  preview: string;
  onFileSelect: (file: File, preview: string) => void;
  disabled?: boolean;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  type,
  accept,
  title,
  file,
  preview,
  onFileSelect,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (selectedFile && selectedFile.type.startsWith(type === 'video' ? 'video/' : 'image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onFileSelect(selectedFile, e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, [onFileSelect, type]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const Icon = type === 'video' ? Video : Image;

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {title}
      </label>
      
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200 min-h-[200px] flex flex-col items-center justify-center
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${preview ? 'border-solid border-green-300 bg-green-50' : ''}
        `}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        {preview ? (
          <div className="w-full">
            {type === 'video' ? (
              <video
                src={preview}
                controls
                className="max-w-full max-h-[150px] rounded"
              />
            ) : (
              <img
                src={preview}
                alt="Preview"
                className="max-w-full max-h-[150px] rounded mx-auto"
              />
            )}
            <p className="mt-2 text-sm text-gray-600 truncate">
              {file?.name}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Icon className="w-12 h-12 text-gray-400 mx-auto" />
            <p className="text-gray-600">
              Glisser-déposer ou cliquer pour sélectionner
            </p>
            <p className="text-xs text-gray-500">
              {type === 'video' ? 'Formats vidéo acceptés' : 'Formats image acceptés'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadZone;