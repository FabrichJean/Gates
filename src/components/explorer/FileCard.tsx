import React from 'react';
import { Check } from 'lucide-react';
import type { FileTreeNode } from '../../types/file';
import { getFileIcon, getFileColors, formatFileSize } from '../../utils/fileUtils';

interface FileCardProps {
  file: FileTreeNode;
  isSelected: boolean;
  onSelect: (fileId: string) => void;
  onDoubleClick: (fileId: string) => void;
  onClick?: (fileId: string, event: React.MouseEvent) => void;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  isSelected,
  onSelect,
  onDoubleClick,
  onClick
}) => {
  const isFolder = file.type === 'folder';
  const icon = getFileIcon(file.name, isFolder);
  const colors = getFileColors(file.name, isFolder);
  
  const handleCardClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onClick?.(file.id, event);
  };

  const handleCheckboxClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onSelect(file.id);
  };

  const handleDoubleClick = () => {
    onDoubleClick(file.id);
  };

  const displayText = isFolder 
    ? `${file.children?.length || 0} items`
    : formatFileSize(file.size);

  return (
    <div
      className={`
        relative flex flex-col gap-2 p-3 rounded-lg border cursor-pointer
        transition-all duration-200 ease-out
        ${isSelected 
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600' 
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
        }
        hover:border-gray-300 dark:hover:border-gray-600
        hover:bg-gray-50 dark:hover:bg-gray-700/50
        ${isSelected ? 'hover:bg-blue-100 dark:hover:bg-blue-900/30' : ''}
      `}
      onClick={handleCardClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Selection checkbox */}
      <div
        className={`
          absolute top-2 right-2 w-4 h-4 rounded border cursor-pointer
          flex items-center justify-center transition-all duration-200
          ${isSelected 
            ? 'bg-blue-500 border-blue-500' 
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
          }
          hover:border-blue-400
        `}
        onClick={handleCheckboxClick}
      >
        {isSelected && (
          <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
        )}
      </div>

      {/* File icon */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
        style={{ backgroundColor: colors.background }}
      >
        {icon}
      </div>

      {/* File name */}
      <div
        className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate"
        title={file.name}
      >
        {file.name}
      </div>

      {/* File metadata */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {displayText}
      </div>
    </div>
  );
};