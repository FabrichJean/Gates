import React from 'react';
import type { FileTreeNode } from '../../types/file';
import { getFileIcon, getFileColors, formatFileSize } from '../../utils/fileUtils';

interface FileRowProps {
  file: FileTreeNode;
  isSelected: boolean;
  onSelect: (fileId: string) => void;
  onDoubleClick: (fileId: string) => void;
  onClick?: (fileId: string, event: React.MouseEvent) => void;
}

export const FileRow: React.FC<FileRowProps> = ({
  file,
  isSelected,
  onSelect,
  onDoubleClick,
  onClick
}) => {
  const isFolder = file.type === 'folder';
  const icon = getFileIcon(file.name, isFolder);
  const colors = getFileColors(file.name, isFolder);
  
  const handleRowClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onClick?.(file.id, event);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    onSelect(file.id);
  };

  const handleDoubleClick = () => {
    onDoubleClick(file.id);
  };

  const fileType = isFolder 
    ? 'Folder'
    : file.extension 
      ? file.extension.toUpperCase() 
      : '—';

  const fileSize = isFolder ? '—' : formatFileSize(file.size);
  const modified = file.modified || '—';

  return (
    <div
      className={`
        grid grid-cols-[24px_1fr_80px_90px_70px] gap-2 items-center p-2 rounded-md
        cursor-pointer transition-all duration-150
        ${isSelected 
          ? 'bg-blue-50 dark:bg-blue-900/20' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }
      `}
      onClick={handleRowClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Selection checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={handleCheckboxChange}
        className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 
          text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 
          focus:ring-2 accent-blue-500"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Name with icon */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm flex-shrink-0">{icon}</span>
        <span 
          className="text-sm text-gray-900 dark:text-gray-100 truncate"
          title={file.name}
        >
          {file.name}
        </span>
      </div>

      {/* File type */}
      <div className="flex justify-start">
        <span
          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border"
          style={{
            backgroundColor: colors.background,
            color: colors.text,
            borderColor: colors.background
          }}
        >
          {fileType}
        </span>
      </div>

      {/* Modified date */}
      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
        {modified}
      </div>

      {/* File size */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
        {fileSize}
      </div>
    </div>
  );
};